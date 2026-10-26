import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { checkCanonical, htmlFiles } from './canonical.ts';
import { checkSitemap } from './sitemap.ts';
import { checkRobots } from './robots.ts';
import { checkMetadata } from './metadata.ts';
import type { AuditResult } from './types.ts';

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
  const all = await Promise.all(files.map(file => checkCanonical(file, directory, parsed.href)));
  const extra = await Promise.all([checkSitemap(directory, parsed.href, files), checkRobots(directory, parsed.href), ...files.map(file => checkMetadata(file, directory))]);
  const findings = [...all.flat(), ...extra.flat()];
  const result: AuditResult = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    input: { directory, siteUrl: parsed.href },
    scannedPages: files.length,
    passedPages: all.filter(v => !v.length).length,
    findings,
  };
  await mkdir(out, { recursive: true });
  await writeFile(join(out, 'findings.json'), JSON.stringify(result, null, 2) + '\n');
  const lines = [
    '# Web Quality Toolkit — technical SEO audit', '',
    `- Scanned pages: **${result.scannedPages}**`,
    `- Canonical passed: **${result.passedPages}**`,
    `- Findings: **${findings.length}**`, '',
    ...findings.flatMap(f => [`## ${f.id} — ${f.file}`, '', f.message, '', '```json', JSON.stringify(f.evidence ?? {}, null, 2), '```', '']),
  ];
  await writeFile(join(out, 'summary.md'), lines.join('\n'));
  console.log(`Audited ${files.length} HTML file(s): ${findings.length} finding(s). Report: ${out}`);
  if (findings.length) process.exitCode = 1;
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 2; });
