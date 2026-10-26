import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Finding, Severity } from './types.ts';

function finding(
  id: string,
  status: Finding['status'],
  severity: Severity,
  message: string,
  evidence?: Record<string, string | number>,
): Finding {
  return { id, category: 'robots', severity, status, file: 'robots.txt', message, evidence };
}

export async function checkRobots(directory: string, siteUrl: string): Promise<Finding[]> {
  let body: string;
  try {
    body = await readFile(join(directory, 'robots.txt'), 'utf8');
  } catch {
    return [finding('ROBOTS_MISSING', 'recommendation', 'info',
      'robots.txt was not found in the build output (advisory; robots.txt is optional)')];
  }
  const findings: Finding[] = [];
  const lines = body.split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
  let group: string[] = [];
  let disallowAll = false;
  const sitemaps: string[] = [];
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (name === 'user-agent') { group.push(value.toLowerCase()); continue; }
    if (name === 'sitemap') sitemaps.push(value);
    if (name === 'disallow' && value === '/' && group.includes('*')) disallowAll = true;
  }
  if (disallowAll) findings.push(finding(
    'ROBOTS_BLOCK_ALL', 'needs-review', 'high',
    'An apparent global Disallow: / was found; confirm intent and user-agent group precedence before treating it as an indexing block',
  ));
  const origin = new URL(siteUrl).origin;
  for (const url of sitemaps) {
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) {
        findings.push(finding('ROBOTS_INVALID_SITEMAP', 'confirmed', 'medium', 'Sitemap directive must use HTTP(S)', { url }));
      } else if (u.origin !== origin) {
        findings.push(finding('ROBOTS_SITEMAP_ORIGIN', 'needs-review', 'low',
          'Sitemap directive uses another origin; this can be intentional, verify the configuration', { url }));
      }
    } catch {
      findings.push(finding('ROBOTS_INVALID_SITEMAP', 'confirmed', 'medium',
        'Sitemap directive must be an absolute URL', { url }));
    }
  }
  return findings;
}
