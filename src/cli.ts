import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checkCanonical, htmlFiles } from './canonical.ts';
import { checkSitemap } from './sitemap.ts';
import { checkRobots } from './robots.ts';
import { resolveConfig } from './config.ts';
import { auditExitCode, buildAuditResult, toMarkdown } from './report.ts';

async function main(): Promise<void> {
  const config = await resolveConfig(process.argv.slice(2));
  const files = await htmlFiles(config.directory);
  if (!files.length) throw new Error(`No HTML files found in ${config.directory}`);
  const selected = new Set(config.selectedRules);
  const canonical = selected.has('CANONICAL')
    ? await Promise.all(files.map(file => checkCanonical(file, config.directory, config.siteUrl)))
    : [];
  const [sitemap, robots] = await Promise.all([
    selected.has('SITEMAP') ? checkSitemap(config.directory, config.siteUrl, files) : Promise.resolve([]),
    selected.has('ROBOTS') ? checkRobots(config.directory, config.siteUrl) : Promise.resolve([]),
  ]);
  const result = buildAuditResult({
    directory: config.directory, siteUrl: config.siteUrl,
    files, canonical, sitemap, robots,
    profile: config.profile, selectedRules: config.selectedRules,
    configPath: config.configPath,
  });
  await mkdir(config.out, { recursive: true });
  await writeFile(join(config.out, 'findings.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(join(config.out, 'summary.md'), toMarkdown(result));
  console.log(`Profile ${config.profile}: ${files.length} HTML files; ${result.coverage.executed} checks executed, ${result.coverage.notTested} not tested, ${result.findings.length} findings. Report: ${config.out}`);
  process.exitCode = auditExitCode(result);
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 2; });
