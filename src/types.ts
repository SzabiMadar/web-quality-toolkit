export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'passed' | 'confirmed' | 'needs-review' | 'recommendation' | 'not-tested';
export type AuditCategory =
  | 'canonical' | 'sitemap' | 'robots' | 'hreflang' | 'metadata'
  | 'links' | 'schema' | 'images' | 'http' | 'performance'
  | 'accessibility' | 'aeo-geo';

export type Finding = {
  id: string;
  category: AuditCategory;
  severity: Severity;
  status: Exclude<CheckStatus, 'passed' | 'not-tested'>;
  file: string;
  message: string;
  evidence?: Record<string, string | number | boolean | null>;
};

export type CheckExecution = {
  ruleId: string;
  category: AuditCategory;
  target: string;
  status: CheckStatus;
  method: string;
  findingIds: string[];
  note?: string;
};

export type CoverageSummary = {
  total: number;
  executed: number;
  passed: number;
  confirmed: number;
  needsReview: number;
  recommendations: number;
  notTested: number;
};

export type AuditResult = {
  /** Version 2 adds explicit checks and coverage; legacy fields remain. */
  schemaVersion: 2;
  toolVersion: string;
  generatedAt: string;
  input: { directory: string; siteUrl: string };
  scannedPages: number;
  /** @deprecated Counts canonical-passing pages only, not overall SEO health. */
  passedPages: number;
  checks: CheckExecution[];
  coverage: CoverageSummary;
  findings: Finding[];
};
