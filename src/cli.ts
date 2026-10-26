import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { checkCanonical, htmlFiles } from './canonical.ts';
import { checkSitemap } from './sitemap.ts';
import { checkRobots } from './robots.ts';
import { auditExitCode, buildAuditResult, toMarkdown } from './report.ts';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

async function main(): Promise<void> {
  const directory = resolve(arg('--dir') ?? './dist');
  const siteUrl = arg('--site');
  if (!siteUrl) throw new Error('Missing --site URL. Example: --site https://example.com/');
  const parsed = new URL(siteUrl);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('--site must be an HTTP(S) URL without credentials, query or fragment');
  }
  const out = resolve(arg('--out') ?? './audits/latest');
  const files = await htmlFiles(directory);
  if (!files.length) throw new Error(`No HTML files found in ${directory}`);
  const canonical = await Promise.all(files.map(file => checkCanonical(file, directory, parsed.href)));
  const [sitemap, robots] = await Promise.all([
    checkSitemap(directory, parsed.href, files),
    checkRobots(directory, parsed.href),
  ]);
  const result = buildAuditResult({
    directory, siteUrl: parsed.href, files, canonical, sitemap, robots,
  });
  await mkdir(out, { recursive: true });
  await writeFile(join(out, 'findings.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(join(out, 'summary.md'), toMarkdown(result));
  console.log(`Audited ${files.length} HTML file(s): ${result.findings.length} finding(s), ${result.coverage.notTested} untested check families. Report: ${out}`);
  process.exitCode = auditExitCode(result);
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 2; });
