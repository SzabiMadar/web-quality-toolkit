import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkMetadata } from '../src/metadata.ts';

const page = (head: string, body = '<h1>Hello</h1>') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

test('metadata: valid static HTML', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wqt-meta-'));
  try {
    const file = join(dir, 'index.html');
    await writeFile(file, page('<title>My Balaton</title><meta name="description" content="Lakeside apartment">'));
    assert.deepEqual(await checkMetadata(file, dir), []);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('metadata: missing and multiple tags', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wqt-meta-'));
  try {
    const file = join(dir, 'index.html');
    await writeFile(file, page('', 'No heading'));
    assert.deepEqual((await checkMetadata(file, dir)).map(f => f.id),
      ['META_TITLE_MISSING', 'META_DESCRIPTION_MISSING', 'META_H1_MISSING']);
    await writeFile(file, page('<title>A</title><title>B</title><meta content="x" name="DESCRIPTION"><meta name="description" content="y">', '<h1>A</h1><h1>B</h1>'));
    assert.deepEqual((await checkMetadata(file, dir)).map(f => f.id),
      ['META_TITLE_MULTIPLE', 'META_DESCRIPTION_MULTIPLE', 'META_H1_MULTIPLE']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('metadata: missing head is reported', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wqt-meta-'));
  try {
    const file = join(dir, 'index.html');
    await writeFile(file, '<html><body><h1>Hi</h1></body></html>');
    assert.equal((await checkMetadata(file, dir))[0]?.id, 'META_HEAD_MISSING');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
