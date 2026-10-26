import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import type { Finding } from './types.ts';

export async function htmlFiles(directory: string): Promise<string[]> {
  const output: string[] = [];
  async function visit(current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) output.push(path);
    }
  }
  await visit(directory);
  return output.sort();
}

export function expectedUrl(file: string, directory: string, siteUrl: string): string {
  const path = relative(directory, file).split(sep).join('/');
  const clean = path === 'index.html' ? '' : path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
  const base = new URL(siteUrl);
  // Reject build directories with accidental traversal: relative paths are only generated from enumerated files.
  const prefix = base.pathname.replace(/\/$/, '') + '/';
  return new URL(prefix + clean, base.origin).href;
}

function extractCanonical(html: string): string[] {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  return links.flatMap(tag => {
    const attributes = new Map<string, string>();
    const attrPattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    for (const match of tag.matchAll(attrPattern)) attributes.set(match[1]!.toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
    if (!(attributes.get('rel') ?? '').toLowerCase().split(/\s+/).includes('canonical')) return [];
    return [attributes.get('href') ?? ''];
  });
}

export async function checkCanonical(file: string, directory: string, siteUrl: string): Promise<Finding[]> {
  const content = await readFile(file, 'utf8');
  const hrefs = extractCanonical(content);
  const rel = relative(directory, file).split(sep).join('/');
  const finding = (id: string, message: string, evidence?: Record<string, string | number>): Finding => ({
    id, category: 'canonical', severity: 'high', status: 'confirmed', file: rel, message, evidence,
  });
  if (!hrefs.length) return [finding('CANONICAL_MISSING', 'Missing canonical link element')];
  if (hrefs.length > 1) return [finding('CANONICAL_MULTIPLE', 'Multiple canonical link elements found', { count: hrefs.length })];
  const href = hrefs[0]!;
  let actual: URL;
  try { actual = new URL(href); }
  catch { return [finding('CANONICAL_INVALID', 'Canonical href must be an absolute HTTP(S) URL', { href })]; }
  if (!['http:', 'https:'].includes(actual.protocol)) return [finding('CANONICAL_INVALID', 'Canonical must use HTTP or HTTPS', { href })];
  const expected = expectedUrl(file, directory, siteUrl);
  if (actual.href !== expected) return [finding('CANONICAL_MISMATCH', 'Canonical differs from the expected page URL', { actual: actual.href, expected })];
  return [];
}
