import { relative, sep } from 'node:path';
import { RULES } from './rules.ts';
import type {
  AuditProfile, AuditResult, CheckExecution, CheckStatus, Finding, RuleId, SkippedRule,
} from './types.ts';

export const TOOL_VERSION = '0.4.0';

function statusFor(findings: Finding[]): CheckStatus {
  if (findings.some(f => f.status === 'confirmed')) return 'confirmed';
  if (findings.some(f => f.status === 'needs-review')) return 'needs-review';
  if (findings.some(f => f.status === 'recommendation')) return 'recommendation';
  return 'passed';
}

function check(ruleId: RuleId, target: string, method: string, findings: Finding[], note?: string): CheckExecution {
  const category = RULES.find(r => r.id === ruleId)!.category;
  return {
    ruleId, category, target, status: statusFor(findings), method,
    findingIds: findings.map(f => f.id),
    ...(note ? { note } : {}),
  };
}

export function buildAuditResult(input: {
  directory: string;
  siteUrl: string;
  files: string[];
  canonical: Finding[][];
  sitemap: Finding[];
  robots: Finding[];
  generatedAt?: string;
  profile?: AuditProfile;
  selectedRules?: readonly RuleId[];
  configPath?: string | null;
  sourceCommit?: string | null;
}): AuditResult {
  // The old call signature means a full audit; this preserves A1 integration.
  const profile = input.profile ?? 'full';
  const selected = new Set<RuleId>(input.selectedRules ?? RULES.map(r => r.id));
  for (const selectedId of selected) {
    if (!RULES.some(rule => rule.id === selectedId)) throw new Error(`Unknown selected rule: ${selectedId}`);
  }
  if (selected.has('CANONICAL') && input.canonical.length !== input.files.length) {
    throw new Error('Canonical result count does not match scanned pages');
  }
  if (!selected.has('CANONICAL') && input.canonical.length) {
    throw new Error('Canonical results were supplied even though the rule was not selected');
  }
  if (!selected.has('SITEMAP') && input.sitemap.length) {
    throw new Error('Sitemap results were supplied even though the rule was not selected');
  }
  if (!selected.has('ROBOTS') && input.robots.length) {
    throw new Error('Robots results were supplied even though the rule was not selected');
  }
  const findings = [...input.canonical.flat(), ...input.sitemap, ...input.robots];
  const checks: CheckExecution[] = [];
  const skippedRules: SkippedRule[] = [];
  const executedRules: RuleId[] = [];
  for (const rule of RULES) {
    if (!selected.has(rule.id) || !rule.implemented) {
      const reason = selected.has(rule.id) ? 'not-implemented' : 'excluded-by-profile';
      skippedRules.push({ ruleId: rule.id, reason });
      checks.push({
        ruleId: rule.id, category: rule.category, target: input.siteUrl,
        status: 'not-tested', method: reason, findingIds: [],
        note: reason === 'not-implemented' ? rule.note : 'Rule is excluded by the active profile/configuration.',
      });
    } else {
      executedRules.push(rule.id);
      if (rule.id === 'CANONICAL') {
        checks.push(...input.files.map((file, index) =>
          check(rule.id, relative(input.directory, file).split(sep).join('/'),
            rule.method, input.canonical[index]!, rule.note)));
      } else if (rule.id === 'SITEMAP') {
        checks.push(check(rule.id, input.siteUrl, rule.method, input.sitemap, rule.note));
      } else if (rule.id === 'ROBOTS') {
        checks.push(check(rule.id, input.siteUrl, rule.method, input.robots, rule.note));
      }
    }
  }
  const count = (status: CheckStatus): number => checks.filter(c => c.status === status).length;
  const coverage = {
    total: checks.length,
    executed: checks.length - count('not-tested'),
    passed: count('passed'),
    confirmed: count('confirmed'),
    needsReview: count('needs-review'),
    recommendations: count('recommendation'),
    notTested: count('not-tested'),
  };
  const sourceCandidate = input.sourceCommit ?? process.env.WQT_SOURCE_COMMIT ?? null;
  const sourceCommit = sourceCandidate && /^[0-9a-f]{40}$/i.test(sourceCandidate)
    ? sourceCandidate : null;
  return {
    schemaVersion: 2,
    toolVersion: TOOL_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    input: { directory: input.directory, siteUrl: input.siteUrl },
    scannedPages: input.files.length,
    passedPages: selected.has('CANONICAL') ? input.canonical.filter(f => !f.length).length : 0,
    checks, coverage, findings,
    manifest: {
      surface: 'local-build',
      profile,
      configPath: input.configPath ?? null,
      nodeVersion: process.version,
      sourceCommit,
      selectedRules: RULES.filter(r => selected.has(r.id)).map(r => r.id),
      executedRules,
      skippedRules,
    },
  };
}

function jsonBlock(value: unknown): string {
  const data = JSON.stringify(value, null, 2);
  const longest = Math.max(2, ...[...data.matchAll(/`+/g)].map(m => m[0].length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}json\n${data}\n${fence}`;
}

export function toMarkdown(result: AuditResult): string {
  const { coverage, manifest } = result;
  const lines = [
    '# Web Quality Toolkit — technical SEO audit', '',
    `- Tool: **v${result.toolVersion}** / schema **v${result.schemaVersion}**`,
    `- Site origin: **${result.input.siteUrl}**`,
    `- Profile: **${manifest.profile}** (local-build only)`,
    `- Scanned HTML files: **${result.scannedPages}**`,
    `- Canonical-passing pages only: **${result.passedPages}** (0 also means canonical may be excluded)`,
    `- Findings (including advice): **${result.findings.length}**`,
    `- Checks executed: **${coverage.executed}** / ${coverage.total}`,
    `- Checks not tested: **${coverage.notTested}**`,
    `- Executed rule families: ${manifest.executedRules.join(', ') || 'none'}`,
    `- Source commit: ${manifest.sourceCommit ?? 'unavailable'}`, '',
    '## Coverage by check', '',
    '| Rule family | Target | Status | Method |',
    '|---|---|---|---|',
    ...result.checks.map(c => `| ${c.ruleId} | ${c.target.replace(/\|/g, '\\|')} | ${c.status} | ${c.method} |`),
    '', '## Skipped rules', '',
    ...manifest.skippedRules.map(r => `- **${r.ruleId}**: ${r.reason}`),
    '', '## Limitations', '',
    ...result.checks.filter(c => c.note).map(c => `- **${c.ruleId}** (${c.target}): ${c.note}`),
    '', '## Findings', '',
    ...(result.findings.length ? result.findings.flatMap(f => [
      `### ${f.id} — ${f.file}`, '',
      `**Status:** ${f.status}; **severity:** ${f.severity}`, '',
      f.message, '', jsonBlock(f.evidence ?? {}), '',
    ]) : ['No findings from executed checks. This does not mean every SEO category was tested.', '']),
  ];
  return lines.join('\n') + '\n';
}

/** Exit 1 for confirmed issues or review-worthy findings; advice-only is not failure. */
export function auditExitCode(result: AuditResult): 0 | 1 {
  return result.findings.some(f => f.status === 'confirmed' || f.status === 'needs-review') ? 1 : 0;
}
