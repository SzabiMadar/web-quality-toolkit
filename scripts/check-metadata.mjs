import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Advisory checks only: metadata formulas are NOT search-engine requirements. */
export function checkMetadata(pages) {
  if (!Array.isArray(pages)) throw new Error('Expected an array of page objects');
  const findings = [];
  const titles = new Map();
  const descriptions = new Map();
  const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    if (!page || typeof page !== 'object' || Array.isArray(page)) throw new Error('Invalid page at index ' + index);
    const url = typeof page.url === 'string' && page.url.trim() ? page.url : 'index:' + index;
    const title = typeof page.title === 'string' ? page.title.trim() : '';
    const description = typeof page.description === 'string' ? page.description.trim() : '';
    if (!title) findings.push({ id: 'TITLE_MISSING', url, status: 'needs-review', evidence: 'No title provided in supplied input' });
    if (!description) findings.push({ id: 'DESCRIPTION_MISSING', url, status: 'recommendation', evidence: 'No meta description provided in supplied input' });
    if (title) {
      const key = normalize(title);
      titles.set(key, [...(titles.get(key) ?? []), url]);
    }
    if (description) {
      const key = normalize(description);
      descriptions.set(key, [...(descriptions.get(key) ?? []), url]);
    }
    if (title && description) {
      const t = normalize(title);
      const d = normalize(description);
      if (t === d) findings.push({ id: 'DESCRIPTION_EQUALS_TITLE', url, status: 'recommendation', evidence: 'Meta description restates title verbatim' });
      else if (t.length >= 12 && d.startsWith(t.slice(0, Math.min(30, t.length)))) {
        findings.push({ id: 'DESCRIPTION_ECHOES_TITLE', url, status: 'recommendation', evidence: 'Meta description starts by repeating most of the title' });
      }
      if (/\b(learn more|click here|try it free now|tudj meg többet|kattints ide|ismerd meg most)\s*[.!]?$/iu.test(description)) {
        findings.push({ id: 'GENERIC_CTA_TAIL', url, status: 'recommendation', evidence: 'Generic call-to-action at the end of the description' });
      }
    }
  }
  for (const [kind, map, id] of [['title', titles, 'DUPLICATE_TITLE'], ['description', descriptions, 'DUPLICATE_DESCRIPTION']]) {
    for (const [value, urls] of map) {
      if (urls.length > 1) findings.push({ id, urls, status: 'needs-review', evidence: kind + ' is identical across ' + urls.length + ' input pages', sample: value.slice(0, 140) });
    }
  }
  return {
    method: 'deterministic string heuristics; input pages supplied by caller; not a Google quality verdict',
    pagesChecked: pages.length,
    findings,
    coverage: { metadataProvided: pages.filter(p => typeof p.title === 'string' && typeof p.description === 'string').length },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2] || process.argv.length !== 3) throw new Error('Usage: node scripts/check-metadata.mjs PAGE_PAIRS.json');
    const data = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
    console.log(JSON.stringify(checkMetadata(data), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
