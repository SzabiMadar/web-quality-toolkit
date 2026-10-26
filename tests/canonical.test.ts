import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkCanonical, expectedUrl, htmlFiles } from '../src/canonical.ts';

test('expected URLs support Astro directory output and root pages', () => {
  assert.equal(expectedUrl('/site/index.html','/site','https://example.com/'), 'https://example.com/');
  assert.equal(expectedUrl('/site/about/index.html','/site','https://example.com/'), 'https://example.com/about/');
  assert.equal(expectedUrl('/site/en/index.html','/site','https://example.com/'), 'https://example.com/en/');
});

test('valid, missing, mismatched, multiple and invalid canonical cases', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wqt-'));
  try {
    await mkdir(join(dir,'about'));
    const file = join(dir,'about','index.html');
    for (const [html, expected] of [
      ['<link rel="canonical" href="https://example.com/about/">', undefined],
      ['<title>About</title>', 'CANONICAL_MISSING'],
      ['<link rel="canonical" href="https://example.com/">', 'CANONICAL_MISMATCH'],
      ['<link rel="canonical" href="https://example.com/about/"><link rel="canonical" href="https://example.com/about/">', 'CANONICAL_MULTIPLE'],
      ['<link rel="canonical" href="/about/">', 'CANONICAL_INVALID'],
      ["<link href='https://example.com/about/' rel='CANONICAL'>", undefined]
    ] as const) {
      await writeFile(file,html);
      const results = await checkCanonical(file, dir, 'https://example.com/');
      assert.equal(results[0]?.id,expected);
    }
    assert.deepEqual(await htmlFiles(dir), [file]);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
