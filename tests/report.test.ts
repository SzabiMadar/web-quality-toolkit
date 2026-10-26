import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditExitCode, buildAuditResult, toMarkdown } from '../src/report.ts';
import type { Finding } from '../src/types.ts';

test('explicit coverage never treats unexecuted rule families as passed', () => {
  const dir = '/project/dist';
  const files = [join(dir, 'index.html'), join(dir, 'about', 'index.html')];
  const issue: Finding = {
    id: 'CANONICAL_MISSING', category: 'canonical', severity: 'high',
    status: 'confirmed', file: 'about/index.html', message: 'Missing canonical',
  };
  const result = buildAuditResult({
    directory: dir, siteUrl: 'https://example.com/', files,
    canonical: [[], [issue]], sitemap: [], robots: [],
    generatedAt: '2026-10-26T00:00:00.000Z',
  });
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.toolVersion, '0.4.0');
  assert.equal(result.scannedPages, 2);
  assert.equal(result.passedPages, 1);
  assert.equal(result.coverage.executed, 4);
  assert.equal(result.coverage.notTested, 9);
  assert.equal(result.coverage.confirmed, 1);
  assert.equal(result.coverage.passed, 3);
  assert.deepEqual(result.checks.filter(c => c.category === 'canonical').map(c => c.status), ['passed', 'confirmed']);
  assert.equal(result.checks.find(c => c.category === 'schema')?.status, 'not-tested');
  assert.equal(result.checks.find(c => c.category === 'images')?.status, 'not-tested');
  assert.equal(result.checks.find(c => c.category === 'hreflang')?.status, 'not-tested');
  assert.equal(auditExitCode(result), 1);
  assert.match(toMarkdown(result), /Checks not tested: \*\*9\*\*/);
});

test('recommendations are not confirmed indexing errors or failure exit codes', () => {
  const advisory: Finding = {
    id: 'ROBOTS_MISSING', category: 'robots', severity: 'info',
    status: 'recommendation', file: 'robots.txt', message: 'Optional file absent',
  };
  const opts = {
    directory: '/project/dist', siteUrl: 'https://example.com/',
    files: ['/project/dist/index.html'], canonical: [[]],
    sitemap: [], robots: [advisory], generatedAt: '2026-10-26T00:00:00.000Z',
  };
  const result = buildAuditResult(opts);
  assert.equal(result.coverage.recommendations, 1);
  assert.equal(result.checks.find(c => c.category === 'robots')?.status, 'recommendation');
  assert.equal(auditExitCode(result), 0);
  assert.equal(JSON.stringify(result), JSON.stringify(buildAuditResult(opts)));
  const review: Finding = { ...advisory, id: 'ROBOTS_BLOCK_ALL', status: 'needs-review' };
  const revised = buildAuditResult({ ...opts, robots: [review] });
  assert.equal(auditExitCode(revised), 1);
  assert.equal(revised.coverage.needsReview, 1);
});

test('rejects mismatched input coverage instead of silently losing pages', () => {
  assert.throws(() => buildAuditResult({
    directory: '/site', siteUrl: 'https://example.com/',
    files: ['/site/index.html'], canonical: [], sitemap: [], robots: [],
  }), /result count/);
});

test('CLI writes schema v2 and advisory-only exit 0; invalid canonical exits 1', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wqt-a1-'));
  const output = join(dir, 'results');
  const cli = resolve('src/cli.ts');
  try {
    await writeFile(join(dir, 'index.html'), '<link rel="canonical" href="https://example.com/">');
    await writeFile(join(dir, 'sitemap.xml'), '<urlset><url><loc>https://example.com/</loc></url></urlset>');
    const run = () => spawnSync(process.execPath, ['--experimental-strip-types', cli,
      '--dir', dir, '--site', 'https://example.com/', '--out', output], { encoding: 'utf8' });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const report = JSON.parse(await readFile(join(output, 'findings.json'), 'utf8'));
    assert.equal(report.schemaVersion, 2);
    assert.equal(report.coverage.notTested, 9);
    assert.equal(report.checks.find((c: { ruleId: string }) => c.ruleId === 'ROBOTS').status, 'recommendation');
    assert.equal(report.findings[0].id, 'ROBOTS_MISSING');
    assert.match(await readFile(join(output, 'summary.md'), 'utf8'), /not-tested/);
    await writeFile(join(dir, 'index.html'), '<title>No canonical</title>');
    const second = run();
    assert.equal(second.status, 1, second.stderr);
    const missingSite = spawnSync(process.execPath,
      ['--experimental-strip-types', cli, '--dir', dir], { encoding: 'utf8' });
    assert.equal(missingSite.status, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
