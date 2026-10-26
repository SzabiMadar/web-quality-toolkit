import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const repo = resolve(import.meta.dirname, '..');
const plugin = join(repo, 'plugins', 'web-audit');
const expected = [
  'full-audit', 'quick-audit', 'technical-seo', 'on-page-seo',
  'international-seo', 'structured-data', 'internal-links', 'image-audit',
  'performance', 'accessibility', 'content-seo', 'aeo-geo', 'local-seo', 'audit-report',
  'sxo', 'ecommerce-seo', 'seo-drift', 'content-brief', 'agent-readiness',
];

function read(path) { return readFileSync(path, 'utf8'); }
function requireFile(path) { assert(existsSync(path), 'Required file missing: ' + path); }

const manifestPath = join(plugin, '.devin-plugin', 'plugin.json');
requireFile(manifestPath);
const manifest = JSON.parse(read(manifestPath));
assert.equal(manifest.name, 'web-audit');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);

for (const filename of ['AUDIT_PROTOCOL.md', 'REPORT_TEMPLATE.md', 'TOOL_MATRIX.md', 'UPSTREAM_LEARNINGS.md']) {
  requireFile(join(plugin, 'references', filename));
}
requireFile(join(plugin, 'AGENTS.md'));
requireFile(join(plugin, 'README.md'));
for (const name of ['check-metadata.mjs', 'check-claims.mjs', 'compare-snapshots.mjs']) requireFile(join(repo, 'scripts', name));
requireFile(join(repo, 'integrations', 'chatgpt', 'PROJECT_INSTRUCTIONS.md'));
requireFile(join(repo, 'integrations', 'codex', 'README.md'));

const skillsRoot = join(plugin, 'skills');
const directories = readdirSync(skillsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
assert.deepEqual(directories, [...expected].sort(), 'Unexpected/missing specialist skills');
for (const name of expected) {
  const folder = join(skillsRoot, name);
  const path = join(folder, 'SKILL.md');
  requireFile(path);
  const content = read(path);
  const header = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert(header, 'Missing valid YAML frontmatter: ' + name);
  const declaredName = header[1].match(/^name: (.+)$/m)?.[1]?.trim();
  const description = header[1].match(/^description: (.+)$/m)?.[1]?.trim();
  assert.equal(declaredName, name, 'Skill folder and declared name mismatch');
  assert(description && description.startsWith('Use when ') && description.length > 40,
    'Need action-triggered skill description: ' + name);
  assert(content.includes('../../references/AUDIT_PROTOCOL.md'),
    'Missing shared evidence/safety protocol link: ' + name);
  assert(content.length > 450, 'Skill content is too short: ' + name);
}
const chat = read(join(repo, 'integrations', 'chatgpt', 'PROJECT_INSTRUCTIONS.md'));
assert(chat.includes('GitHub'), 'ChatGPT usage must describe how to load skill files');
assert(chat.includes('not-tested'), 'ChatGPT adapter must preserve coverage honesty');
console.log('Validated Devin plugin ' + manifest.version + ', ' + expected.length + ' skills and shared instructions.');
