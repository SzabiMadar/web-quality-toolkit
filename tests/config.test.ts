import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveConfig } from '../src/config.ts';
import { buildAuditResult, auditExitCode } from '../src/report.ts';

async function withProject(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'wqt-a2-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

test('without a config or profile flag, retain A1 full behavior', async () => {
  const config = await resolveConfig(['--site', 'https://example.com/'], '/sample');
  assert.equal(config.profile, 'full');
  assert.equal(config.configPath, null);
  assert.equal(config.directory, resolve('/sample/dist'));
  assert.equal(config.selectedRules.length, 12);
});

test('JSON config relative paths, profile, include/exclude and CLI overrides', async () => {
  await withProject(async root => {
    const configFolder = join(root, 'project');
    await mkdir(configFolder);
    const path = join(configFolder, 'web-quality.config.json');
    await writeFile(path, JSON.stringify({
      configVersion: 1, site: 'https://example.com/subdir/', dir: './build',
      out: './reports', profile: 'quick',
      rules: { include: ['SITEMAP', 'SCHEMA'], exclude: ['CANONICAL'] },
    }));
    const cfg = await resolveConfig(['--config', path], root);
    assert.equal(cfg.profile, 'quick');
    assert.equal(cfg.directory, join(configFolder, 'build'));
    assert.equal(cfg.out, join(configFolder, 'reports'));
    assert.equal(cfg.siteUrl, 'https://example.com/subdir/');
    assert.deepEqual(cfg.selectedRules, ['SITEMAP', 'SCHEMA']);
    const override = await resolveConfig([
      '--config', path, '--profile', 'content', '--site', 'https://other.example/',
      '--dir', './dist-cli', '--out', './audit-cli',
    ], root);
    assert.equal(override.directory, join(root, 'dist-cli'));
    assert.equal(override.out, join(root, 'audit-cli'));
    assert.equal(override.profile, 'content');
    assert.deepEqual(override.selectedRules, ['SITEMAP', 'METADATA', 'SCHEMA', 'AEO_GEO']);
    assert.equal(override.siteUrl, 'https://other.example/');
  });
});

test('invalid flags, profile, config contents, rule overlaps and site URLs fail closed', async () => {
  await withProject(async root => {
    const file = join(root, 'invalid.json');
    const cases: Array<[unknown, RegExp]> = [
      [{ extra: 1, site: 'https://example.com/' }, /Unknown config key/],
      [{ configVersion: 99, site: 'https://example.com/' }, /configVersion/],
      [{ site: 'https://example.com/', profile: 'fantasy' }, /Invalid profile/],
      [{ site: 'https://example.com/', rules: { exclude: ['TYPO'] } }, /Unknown rule/],
      [{ site: 'https://example.com/', rules: { include: ['CANONICAL', 'CANONICAL'] } }, /Duplicate rule/],
      [{ site: 'https://example.com/', rules: { include: ['CANONICAL'], exclude: ['CANONICAL'] } }, /must not overlap/],
      [{ site: 'https://user:secret@example.com/' }, /credentials/],
      [{ site: 'https://example.com/?secret=1' }, /query/],
      [{ site: 'ftp://example.com/' }, /HTTP/],
    ];
    for (const [value, pattern] of cases) {
      await writeFile(file, JSON.stringify(value));
      await assert.rejects(resolveConfig(['--config', file], root), pattern);
    }
    await writeFile(file, '{');
    await assert.rejects(resolveConfig(['--config', file], root), /Invalid config/);
    await assert.rejects(resolveConfig(['--site', 'https://example.com/', '--typo', '1'], root), /Unknown CLI/);
    await assert.rejects(resolveConfig(['--site'], root), /Missing value/);
    await assert.rejects(resolveConfig(['--site', 'https://example.com/', '--site', 'https://example.com/'], root), /Duplicate CLI/);
    await assert.rejects(resolveConfig(['--profile', 'invalid', '--site', 'https://example.com/'], root), /Invalid profile/);
    await assert.rejects(resolveConfig(['--site', 'https://example.com/', '--config', 'not-here.json'], root), /Cannot read config/);
  });
});

test('rule exclusions are not executed or counted as successes', () => {
  const result = buildAuditResult({
    directory: '/project/dist', siteUrl: 'https://example.com/',
    files: ['/project/dist/index.html'], canonical: [], sitemap: [], robots: [],
    profile: 'content', selectedRules: ['METADATA', 'AEO_GEO'],
    generatedAt: '2026-10-26T00:00:00Z', sourceCommit: 'a'.repeat(40),
  });
  assert.equal(result.coverage.executed, 0);
  assert.equal(result.coverage.notTested, 12);
  assert.equal(result.passedPages, 0);
  assert.equal(result.manifest.surface, 'local-build');
  assert.deepEqual(result.manifest.selectedRules, ['METADATA', 'AEO_GEO']);
  assert.deepEqual(result.manifest.executedRules, []);
  assert.deepEqual(result.manifest.skippedRules.find(s => s.ruleId === 'CANONICAL'),
    { ruleId: 'CANONICAL', reason: 'excluded-by-profile' });
  assert.deepEqual(result.manifest.skippedRules.find(s => s.ruleId === 'METADATA'),
    { ruleId: 'METADATA', reason: 'not-implemented' });
  assert.equal(result.manifest.sourceCommit, 'a'.repeat(40));
  assert.equal(auditExitCode(result), 0);
  assert.throws(() => buildAuditResult({
    directory: '/project', siteUrl: 'https://example.com/', files: ['/project/index.html'],
    canonical: [], sitemap: [], robots: [], profile: 'quick', selectedRules: ['CANONICAL'],
  }), /Canonical result count/);
});

test('CLI quick skips sitemap/robots, full runs them, content never invents AI testing', async () => {
  await withProject(async root => {
    const dist = join(root, 'dist');
    await mkdir(dist);
    await writeFile(join(dist, 'index.html'), '<link rel="canonical" href="https://example.com/">');
    const cli = resolve('src/cli.ts');
    const configPath = join(root, 'web-quality.config.json');
    await writeFile(configPath, JSON.stringify({ site: 'https://example.com/', dir: './dist', out: './audit', profile: 'quick' }));
    const run = (...args: string[]) => spawnSync(process.execPath,
      ['--experimental-strip-types', cli, '--config', configPath, ...args], { encoding: 'utf8' });

    const quick = run();
    assert.equal(quick.status, 0, quick.stderr);
    let result = JSON.parse(await readFile(join(root, 'audit', 'findings.json'), 'utf8'));
    assert.equal(result.schemaVersion, 2);
    assert.equal(result.toolVersion, '0.4.0');
    assert.equal(result.manifest.profile, 'quick');
    assert.deepEqual(result.manifest.executedRules, ['CANONICAL']);
    assert.equal(result.coverage.executed, 1);
    assert.equal(result.findings.length, 0);
    assert.equal(result.checks.find((c: { ruleId: string }) => c.ruleId === 'SITEMAP').method, 'excluded-by-profile');

    const full = run('--profile', 'full');
    assert.equal(full.status, 1, full.stderr);
    result = JSON.parse(await readFile(join(root, 'audit', 'findings.json'), 'utf8'));
    assert.deepEqual(result.manifest.executedRules, ['CANONICAL', 'SITEMAP', 'ROBOTS']);
    assert.ok(result.findings.some((f: { id: string }) => f.id === 'SITEMAP_MISSING'));

    await writeFile(join(dist, 'index.html'), '<title>Missing canonical</title>');
    const content = run('--profile', 'content');
    assert.equal(content.status, 0, content.stderr);
    result = JSON.parse(await readFile(join(root, 'audit', 'findings.json'), 'utf8'));
    assert.equal(result.coverage.executed, 0);
    assert.equal(result.coverage.notTested, 12);
    assert.deepEqual(result.manifest.selectedRules, ['METADATA', 'SCHEMA', 'AEO_GEO']);
    assert.equal(result.findings.length, 0);
    assert.equal(result.manifest.configPath, configPath);
  });
});
