import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { AuditProfile, RuleId } from './types.ts';
import { RULES } from './rules.ts';

const ALL_IDS = RULES.map(r => r.id);
const RULE_SET = new Set<string>(ALL_IDS);
const PROFILES: Record<AuditProfile, readonly RuleId[]> = {
  quick: ['CANONICAL'],
  full: ALL_IDS,
  // An explicit preview of future content auditing, NOT a live AI service.
  content: ['METADATA', 'SCHEMA', 'AEO_GEO'],
};

export type ResolvedConfig = {
  directory: string;
  siteUrl: string;
  out: string;
  profile: AuditProfile;
  selectedRules: RuleId[];
  configPath: string | null;
};

type ConfigFile = {
  configVersion?: number;
  site?: string;
  dir?: string;
  out?: string;
  profile?: AuditProfile;
  rules?: { include?: RuleId[]; exclude?: RuleId[] };
};

const FLAGS = new Set(['--config', '--site', '--dir', '--out', '--profile']);

function object(value: unknown, name: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, allowed: string[], name: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`Unknown ${name} key: ${key}`);
  }
}

function stringValue(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} must be a nonempty string`);
  return value;
}

function profileValue(value: unknown): AuditProfile {
  if (value === 'quick' || value === 'full' || value === 'content') return value;
  throw new Error('Invalid profile: expected quick, full or content');
}

function ruleList(value: unknown, field: string): RuleId[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${field} must be an array of rule family IDs`);
  const unique = new Set<RuleId>();
  for (const entry of value) {
    if (typeof entry !== 'string' || !RULE_SET.has(entry)) {
      throw new Error(`Unknown rule in ${field}: ${String(entry)}`);
    }
    if (unique.has(entry as RuleId)) throw new Error(`Duplicate rule in ${field}: ${entry}`);
    unique.add(entry as RuleId);
  }
  return [...unique];
}

function parseConfig(value: unknown): ConfigFile {
  const c = object(value, 'config');
  keys(c, ['configVersion', 'site', 'dir', 'out', 'profile', 'rules'], 'config');
  if (c.configVersion !== undefined && c.configVersion !== 1) {
    throw new Error('Unsupported configVersion: expected 1');
  }
  const rules = c.rules === undefined ? undefined : object(c.rules, 'rules');
  if (rules) {
    keys(rules, ['include', 'exclude'], 'rules');
    ruleList(rules.include, 'rules.include');
    ruleList(rules.exclude, 'rules.exclude');
  }
  return {
    configVersion: c.configVersion as number | undefined,
    site: stringValue(c.site, 'config.site'),
    dir: stringValue(c.dir, 'config.dir'),
    out: stringValue(c.out, 'config.out'),
    profile: c.profile === undefined ? undefined : profileValue(c.profile),
    rules: rules ? {
      include: ruleList(rules.include, 'rules.include'),
      exclude: ruleList(rules.exclude, 'rules.exclude'),
    } : undefined,
  };
}

function flags(argv: string[]): Record<string, string> {
  const parsed: Record<string, string> = Object.create(null);
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag || !FLAGS.has(flag)) throw new Error(`Unknown CLI argument: ${String(flag)}`);
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (parsed[flag] !== undefined) throw new Error(`Duplicate CLI argument: ${flag}`);
    parsed[flag] = value;
  }
  return parsed;
}

function site(value: string | undefined): string {
  if (!value) throw new Error('Missing --site URL or config.site. Example: --site https://example.com/');
  let url: URL;
  try { url = new URL(value); }
  catch { throw new Error('Invalid site URL'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Site must be an HTTP(S) URL without credentials, query or fragment');
  }
  return url.href;
}

/**
 * Explicit JSON config file; relative paths in the file are relative to that file.
 * CLI options override file values, with CLI relative paths resolved from cwd.
 * No remote URLs or executable config formats are loaded.
 */
export async function resolveConfig(argv: string[], cwd = process.cwd()): Promise<ResolvedConfig> {
  const args = flags(argv);
  const configPath = args['--config'] ? resolve(cwd, args['--config']) : null;
  let config: ConfigFile = {};
  if (configPath) {
    let content: string;
    try { content = await readFile(configPath, 'utf8'); }
    catch (error) { throw new Error(`Cannot read config ${configPath}: ${String(error)}`); }
    try { config = parseConfig(JSON.parse(content) as unknown); }
    catch (error) { throw new Error(`Invalid config ${configPath}: ${String(error)}`); }
  }
  const profile = args['--profile'] !== undefined
    ? profileValue(args['--profile'])
    : config.profile ?? 'full';
  const root = configPath ? dirname(configPath) : cwd;
  const directory = args['--dir'] ? resolve(cwd, args['--dir']) : resolve(root, config.dir ?? './dist');
  const out = args['--out'] ? resolve(cwd, args['--out']) : resolve(root, config.out ?? './audits/latest');
  const included = config.rules?.include ?? [];
  const excluded = config.rules?.exclude ?? [];
  if (included.some(id => excluded.includes(id))) {
    throw new Error('rules.include and rules.exclude must not overlap');
  }
  const selected = new Set<RuleId>([...PROFILES[profile], ...included]);
  for (const id of excluded) selected.delete(id);
  return {
    directory,
    out,
    siteUrl: site(args['--site'] ?? config.site),
    profile,
    selectedRules: ALL_IDS.filter(id => selected.has(id)),
    configPath,
  };
}
