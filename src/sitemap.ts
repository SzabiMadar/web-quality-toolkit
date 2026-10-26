import { readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { expectedUrl } from './canonical.ts';
import type { Finding } from './types.ts';

const MAX_XML_BYTES = 10 * 1024 * 1024;
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
  processEntities: true,
  removeNSPrefix: false,
});

const finding = (id: string, file: string, message: string, evidence?: Record<string, string | number>): Finding =>
  ({ id, category: 'sitemap', severity: 'medium', status: 'confirmed', file, message, evidence });

type SitemapKind = 'urlset' | 'sitemapindex';
type XMLRecord = Record<string, unknown>;

function record(value: unknown): XMLRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as XMLRecord : null;
}
function nodes(value: unknown): unknown[] { return value === undefined ? [] : Array.isArray(value) ? value : [value]; }
function isAbsent(error: unknown): boolean {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
}
async function readOptional(file: string): Promise<string | null> {
  try {
    const info = await stat(file);
    if (info.size > MAX_XML_BYTES) throw new Error(`Sitemap exceeds the ${MAX_XML_BYTES} byte safety limit: ${file}`);
    return await readFile(file, 'utf8');
  } catch (error) {
    if (isAbsent(error)) return null;
    throw error;
  }
}

/** Strict XML syntax check before structural parsing. DTD/ENTITY are disallowed. */
function parseXml(xml: string): { kind: SitemapKind; locs: string[] } | { error: string } {
  if (/<!DOCTYPE\b|<!ENTITY\b/i.test(xml)) return { error: 'DOCTYPE/ENTITY declarations are not supported in a sitemap' };
  const validated = XMLValidator.validate(xml);
  if (validated !== true) return { error: typeof validated === 'object' && validated.err?.msg ? validated.err.msg : 'Malformed XML' };
  let parsed: XMLRecord;
  try {
    const tree = record(parser.parse(xml));
    if (!tree) return { error: 'Sitemap document must contain an XML root' };
    parsed = tree;
  } catch (error) {
    return { error: `XML parsing failed: ${String(error)}` };
  }
  const rootKeys = Object.keys(parsed).filter(key => !key.startsWith('?') && !key.startsWith('#'));
  if (rootKeys.length !== 1) return { error: 'Expected exactly one XML root element' };
  const rootKey = rootKeys[0]!;
  const prefix = rootKey.includes(':') ? rootKey.slice(0, rootKey.lastIndexOf(':') + 1) : '';
  const localName = rootKey.slice(prefix.length);
  if (localName !== 'urlset' && localName !== 'sitemapindex') return { error: 'Not a recognized sitemap XML root' };
  const root = record(parsed[rootKey]);
  if (!root) return { error: 'Sitemap XML root must contain sitemap entries' };
  const itemName = prefix + (localName === 'urlset' ? 'url' : 'sitemap');
  const locName = prefix + 'loc';
  const locs: string[] = [];
  for (const item of nodes(root[itemName])) {
    const obj = record(item);
    if (!obj) return { error: `Malformed ${itemName} sitemap entry` };
    const values = nodes(obj[locName]);
    if (values.length !== 1 || typeof values[0] !== 'string' || !values[0].trim()) {
      return { error: `Each ${itemName} must contain exactly one text ${locName}` };
    }
    locs.push(values[0].trim());
  }
  return { kind: localName, locs };
}

function normalizedUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash ? url : null;
  } catch { return null; }
}

export async function checkSitemap(directory: string, siteUrl: string, pages: string[]): Promise<Finding[]> {
  const rootSitemap = await readOptional(join(directory, 'sitemap.xml'));
  const rootIndex = rootSitemap === null ? await readOptional(join(directory, 'sitemap-index.xml')) : null;
  if (rootSitemap === null && rootIndex === null) {
    return [finding('SITEMAP_MISSING', 'sitemap.xml', 'No sitemap.xml or sitemap-index.xml found in build output')];
  }
  const filename = rootSitemap === null ? 'sitemap-index.xml' : 'sitemap.xml';
  const first = parseXml((rootSitemap ?? rootIndex)!);
  if ('error' in first) return [finding('SITEMAP_XML_INVALID', filename, first.error)];

  const base = new URL(siteUrl);
  const results: Finding[] = [];
  const indexUrls: string[] = first.locs;
  if (!indexUrls.length) results.push(finding('SITEMAP_NO_URLS', filename, 'No sitemap entries found'));

  let pageUrls: string[] = [];
  if (first.kind === 'sitemapindex') {
    let inspectable = true;
    const seenChildren = new Set<string>();
    for (const child of indexUrls) {
      const childUrl = normalizedUrl(child);
      if (!childUrl) { results.push(finding('SITEMAP_INVALID_URL', filename, 'Invalid absolute sitemap-index URL', { url: child })); inspectable = false; continue; }
      if (seenChildren.has(childUrl.href)) { results.push(finding('SITEMAP_DUPLICATE', filename, 'Duplicate sitemap-index URL', { url: childUrl.href })); continue; }
      seenChildren.add(childUrl.href);
      let childName: string;
      try { childName = decodeURIComponent(childUrl.pathname.split('/').at(-1) ?? ''); }
      catch { results.push(finding('SITEMAP_CHILD_UNSUPPORTED', filename, 'Invalid URL path encoding in child sitemap', { url: child })); inspectable = false; continue; }
      if (childUrl.origin !== base.origin || !/^sitemap(?:-[0-9]+)?\.xml$/.test(childName) ||
          childUrl.href !== new URL(childName, base).href) {
        results.push(finding('SITEMAP_CHILD_UNSUPPORTED', filename, 'Child sitemap is not a supported local file', { url: child }));
        inspectable = false;
        continue;
      }
      const text = await readOptional(join(directory, childName));
      if (text === null) { results.push(finding('SITEMAP_CHILD_MISSING', childName, 'Referenced child sitemap is missing locally')); inspectable = false; continue; }
      const entry = parseXml(text);
      if ('error' in entry || entry.kind !== 'urlset') {
        results.push(finding('SITEMAP_CHILD_INVALID', childName, 'Child sitemap is invalid XML or not a urlset',
          { reason: 'error' in entry ? entry.error : 'Unexpected sitemapindex root' }));
        inspectable = false;
        continue;
      }
      pageUrls.push(...entry.locs);
    }
    if (!inspectable) return results; // Do not claim complete local coverage.
  } else {
    pageUrls = indexUrls;
  }

  const urls = new Set<string>();
  for (const loc of pageUrls) {
    const url = normalizedUrl(loc);
    if (!url) { results.push(finding('SITEMAP_INVALID_URL', filename, 'Invalid absolute HTTP(S) URL in sitemap', { url: loc })); continue; }
    if (url.origin !== base.origin) results.push(finding('SITEMAP_OTHER_ORIGIN', filename, 'Page URL uses a different origin', { url: url.href }));
    if (urls.has(url.href)) results.push(finding('SITEMAP_DUPLICATE', filename, 'Duplicate page URL in sitemap', { url: url.href }));
    urls.add(url.href);
  }

  const expected = new Map(pages.map(p => [expectedUrl(p, directory, siteUrl), relative(directory, p).split(sep).join('/')]));
  for (const [url, path] of expected) {
    if (!urls.has(url)) results.push(finding('SITEMAP_PAGE_MISSING', filename, 'Built HTML page not listed in sitemap', { url, htmlFile: path }));
  }
  for (const url of urls) {
    if (url.startsWith(base.origin + '/') && !expected.has(url)) {
      results.push(finding('SITEMAP_EXTRA_URL', filename, 'Sitemap URL does not match a built HTML page', { url }));
    }
  }
  return results;
}
