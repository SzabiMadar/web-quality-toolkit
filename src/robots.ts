import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import robotsParser from 'robots-parser';
import type { Finding, Severity } from './types.ts';

function finding(
  id: string, status: Finding['status'], severity: Severity,
  message: string, evidence?: Record<string, string | number>,
): Finding {
  return { id, category: 'robots', severity, status, file: 'robots.txt', message, evidence };
}

function missing(error: unknown): boolean {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
}

export async function checkRobots(directory: string, siteUrl: string): Promise<Finding[]> {
  let body: string;
  try { body = await readFile(join(directory, 'robots.txt'), 'utf8'); }
  catch (error) {
    if (!missing(error)) throw error;
    return [finding('ROBOTS_MISSING', 'recommendation', 'info',
      'robots.txt was not found in the build output (advisory; robots.txt is optional)')];
  }

  const results: Finding[] = [];
  const origin = new URL(siteUrl).origin;
  // robots-parser evaluates user-agent groups, Allow/Disallow specificity and wildcards.
  // This is a local interpretation, never proof of how a live crawler sees the file.
  const robots = robotsParser(origin + '/robots.txt', body);
  const homepage = new URL(siteUrl).href;
  const agents = ['Googlebot', 'Bingbot', 'Otherbot'];
  const denied = agents.filter(agent => robots.isAllowed(homepage, agent) === false);
  if (denied.length === agents.length) {
    results.push(finding('ROBOTS_BLOCK_ALL', 'needs-review', 'high',
      'All sampled crawler user agents appear blocked from the configured home URL; confirm this is intentional',
      { agents: agents.join(', ') }));
  } else if (denied.length) {
    results.push(finding('ROBOTS_PARTIAL_BLOCK', 'needs-review', 'medium',
      'One or more sampled crawler user agents appear blocked; check whether this is intentional',
      { agents: denied.join(', ') }));
  }

  // Sitemap directives are independent of user-agent groups and can legitimately be cross-origin.
  // Preserve their original values to distinguish invalid syntax from deliberate configuration.
  const sitemaps = body.split(/\r?\n/).map(line => line.replace(/#.*$/, '').trim())
    .filter(line => /^sitemap\s*:/i.test(line))
    .map(line => line.slice(line.indexOf(':') + 1).trim());
  for (const url of sitemaps) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.hash) {
        results.push(finding('ROBOTS_INVALID_SITEMAP', 'confirmed', 'medium',
          'Sitemap directive must be an absolute HTTP(S) URL without credentials or fragment', { url }));
      } else if (parsed.origin !== origin) {
        results.push(finding('ROBOTS_SITEMAP_ORIGIN', 'needs-review', 'low',
          'Sitemap directive points to another origin; cross-origin sitemaps can be intentional',
          { url }));
      }
    } catch {
      results.push(finding('ROBOTS_INVALID_SITEMAP', 'confirmed', 'medium',
        'Sitemap directive must be an absolute HTTP(S) URL', { url }));
    }
  }
  return results;
}
