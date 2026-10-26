import { relative, sep } from 'node:path';
import type { AuditCategory, AuditResult, CheckExecution, CheckStatus, Finding } from './types.ts';

export const TOOL_VERSION = '0.3.0';

const NOT_IMPLEMENTED: ReadonlyArray<{ ruleId: string; category: AuditCategory; note: string }> = [
  { ruleId: 'HREFLANG', category: 'hreflang', note: 'Hreflang syntax, reciprocal links and locale alignment are not implemented.' },
  { ruleId: 'METADATA', category: 'metadata', note: 'Title, description, headings and meta robots are not implemented.' },
  { ruleId: 'LINKS', category: 'links', note: 'Internal link targets and orphan pages are not implemented.' },
  { ruleId: 'SCHEMA', category: 'schema', note: 'JSON-LD and structured-data checks are not implemented.' },
  { ruleId: 'IMAGES', category: 'images', note: 'Image accessibility and loading checks are not implemented.' },
  { ruleId: 'HTTP', category: 'http', note: 'No live HTTP request or response is checked.' },
  { ruleId: 'PERFORMANCE', category: 'performance', note: 'No Lighthouse or field metrics are measured.' },
  { ruleId: 'ACCESSIBILITY', category: 'accessibility', note: 'No automated or manual WCAG evaluation is performed.' },
  { ruleId: 'AEO_GEO', category: 'aeo-geo', note: 'No AEO/GEO assessment or AI citation measurement is performed.' },
];

function statusFor(findings: Finding[]): CheckStatus {
  if (findings.some(f => f.status === 'confirmed')) return 'confirmed';
  if (findings.some(f => f.status === 'needs-review')) return 'needs-review';
  if (findings.some(f => f.status === 'recommendation')) return 'recommendation';
  return 'passed';
}

function check(
  ruleId: string, category: AuditCategory, target: string, method: string,
  findings: Finding[], note?: string,
): CheckExecution {
  return { ruleId, category, target, status: statusFor(findings), method, findingIds: findings.map(f => f.id), ...(note ? { note } : {}) };
}

export function buildAuditResult(input: {
  directory: string;
  siteUrl: string;
  files: string[];
  canonical: Finding[][];
  sitemap: Finding[];
  robots: Finding[];
  generatedAt?: string;
}): AuditResult {
  if (input.files.length !== input.canonical.length) throw new Error('Canonical result count does not match scanned pages');
  const findings = [...input.canonical.flat(), ...input.sitemap, ...input.robots];
  const checks: CheckExecution[] = [
    ...input.files.map((file, i) =>
      check('CANONICAL', 'canonical', relative(input.directory, file).split(sep).join('/'),
        'static-html', input.canonical[i]!,
        'Assumes generated paths correspond to public URLs; intentional non-self canonicals need policy support.')),
    check('SITEMAP', 'sitemap', input.siteUrl, 'local-sitemap-basic', input.sitemap,
      'Local sitemap XML is partially parsed; no remote sitemap fetch or full XML validation.'),
    check('ROBOTS', 'robots', input.siteUrl, 'local-robots-basic', input.robots,
      'Simple local robots directives only; full user-agent group precedence is not validated.'),
    ...NOT_IMPLEMENTED.map(({ ruleId, category, note }) => ({
      ruleId, category, target: input.siteUrl, status: 'not-tested' as const,
      method: 'not-implemented', findingIds: [], note,
    })),
  ];
  const count = (status: CheckStatus): number => checks.filter(c => c.status === status).length;
  const coverage = {
    total: checks.length,
    executed: checks.length - count('not-tested'),
    passed: count('passed'),
    confirmed: count('confirmed'),
    needsReview: count('needs-review'),
    recommendations: count('recommendation'),
    notTested: count('not-tested'),
  };
  return {
    schemaVersion: 2,
    toolVersion: TOOL_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    input: { directory: input.directory, siteUrl: input.siteUrl },
    scannedPages: input.files.length,
    passedPages: input.canonical.filter(f => f.length === 0).length,
    checks, coverage, findings,
  };
}

function jsonBlock(value: unknown): string {
  const data = JSON.stringify(value, null, 2);
  const longest = Math.max(2, ...[...data.matchAll(/`+/g)].map(m => m[0].length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}json\n${data}\n${fence}`;
}

export function toMarkdown(result: AuditResult): string {
  const { coverage } = result;
  const lines = [
    '# Web Quality Toolkit — technical SEO audit', '',
    `- Tool: **v${result.toolVersion}** / schema **v${result.schemaVersion}**`,
    `- Site origin: **${result.input.siteUrl}**`,
    `- Scanned HTML pages: **${result.scannedPages}**`,
    `- Canonical-passing pages only: **${result.passedPages}**`,
    `- Findings (including advice): **${result.findings.length}**`,
    `- Checks executed: **${coverage.executed}** / ${coverage.total}`,
    `- Checks not tested: **${coverage.notTested}**`, '',
    '## Coverage by check', '',
    '| Rule family | Target | Status | Method |',
    '|---|---|---|---|',
    ...result.checks.map(c => `| ${c.ruleId} | ${c.target.replace(/\|/g, '\\|')} | ${c.status} | ${c.method} |`),
    '', '## Limitations and skipped checks', '',
    ...result.checks.filter(c => c.note).map(c => `- **${c.ruleId}** (${c.target}): ${c.note}`),
    '', '## Findings', '',
    ...(result.findings.length ? result.findings.flatMap(f => [
      `### ${f.id} — ${f.file}`, '',
      `**Status:** ${f.status}; **severity:** ${f.severity}`, '',
      f.message, '', jsonBlock(f.evidence ?? {}), '',
    ]) : ['No findings from executed checks. This does not mean every SEO category was tested.', '']),
  ];
  return lines.join('\n') + '\n';
}

/** Exit 1 for confirmed issues or review-worthy findings; advice-only is not failure. */
export function auditExitCode(result: AuditResult): 0 | 1 {
  return result.findings.some(f => f.status === 'confirmed' || f.status === 'needs-review') ? 1 : 0;
}
