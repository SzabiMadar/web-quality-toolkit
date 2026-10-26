import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import type { Finding } from './types.ts';

/** Static HTML check; scripts are not executed. */
export async function checkMetadata(file: string, directory: string): Promise<Finding[]> {
  const html = await readFile(file, 'utf8');
  const path = relative(directory, file).split(sep).join('/');
  const findings: Finding[] = [];
  const add = (id: string, severity: Finding['severity'], message: string, evidence?: Finding['evidence']) =>
    findings.push({ id, category: 'metadata', severity, status: 'confirmed', file: path, message, evidence });

  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1];
  if (head === undefined) {
    add('META_HEAD_MISSING', 'high', 'Cannot inspect metadata because the document has no complete head element');
    return findings;
  }
  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  if (!titles.length) add('META_TITLE_MISSING', 'high', 'Missing HTML title element');
  else if (titles.length > 1) add('META_TITLE_MULTIPLE', 'medium', 'Multiple HTML title elements', { count: titles.length });
  else if (!plainText(titles[0]![1]!).trim()) add('META_TITLE_EMPTY', 'high', 'HTML title is empty');

  const descriptions = [...head.matchAll(/<meta\b[^>]*>/gi)]
    .filter(m => attribute(m[0], 'name')?.toLowerCase() === 'description')
    .map(m => attribute(m[0], 'content'));
  if (!descriptions.length) add('META_DESCRIPTION_MISSING', 'low', 'No meta description found (recommendation, not a requirement)');
  else if (descriptions.length > 1) add('META_DESCRIPTION_MULTIPLE', 'medium', 'Multiple meta descriptions', { count: descriptions.length });
  else if (!descriptions[0]?.trim()) add('META_DESCRIPTION_EMPTY', 'low', 'Meta description is empty');

  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1];
  if (body !== undefined) {
    const h1s = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)];
    if (!h1s.length) add('META_H1_MISSING', 'medium', 'No H1 heading in static HTML');
    else if (h1s.length > 1) add('META_H1_MULTIPLE', 'low', 'Multiple H1 headings: review structure; not inherently invalid', { count: h1s.length });
    else if (!plainText(h1s[0]![1]!).trim()) add('META_H1_EMPTY', 'medium', 'H1 has no static text');
  }
  return findings;
}

function attribute(tag: string, name: string): string | undefined {
  const rx = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const m of tag.matchAll(rx)) if (m[1]?.toLowerCase() === name) return m[2] ?? m[3] ?? m[4] ?? '';
  return undefined;
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&(?:nbsp|amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, ' ');
}
