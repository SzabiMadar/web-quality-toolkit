import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import * as cheerio from 'cheerio';
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
  // The caller only passes enumerated files; no externally provided path is resolved here.
  const prefix = base.pathname.replace(/\/$/, '') + '/';
  return new URL(prefix + clean, base.origin).href;
}

/**
 * Read actual document <head> link tags using a standards-based HTML parser.
 * Comments and script strings must never create fake canonical links.
 */
export function extractCanonical(html: string): string[] {
  const $ = cheerio.load(html);
  const canonical: string[] = [];
  $('head link').each((_, element) => {
    const rel = $(element).attr('rel') ?? '';
    if (rel.toLowerCase().split(/\s+/).includes('canonical')) {
      canonical.push($(element).attr('href') ?? '');
    }
  });
  return canonical;
}

export async function checkCanonical(file: string, directory: string, siteUrl: string): Promise<Finding[]> {
  const content = await readFile(file, 'utf8');
  const hrefs = extractCanonical(content);
  const rel = relative(directory, file).split(sep).join('/');
  const finding = (id: string, message: string, evidence?: Record<string, string | number>): Finding => ({
    id, category: 'canonical', severity: 'high', status: 'confirmed', file: rel, message, evidence,
  });
  if (!hrefs.length) return [finding('CANONICAL_MISSING', 'Missing canonical link element in document head')];
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
