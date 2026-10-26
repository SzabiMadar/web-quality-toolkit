export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'passed' | 'confirmed' | 'needs-review' | 'recommendation' | 'not-tested';
export type AuditProfile = 'quick' | 'full' | 'content';
export type RuleId =
  | 'CANONICAL' | 'SITEMAP' | 'ROBOTS' | 'HREFLANG' | 'METADATA' | 'LINKS'
  | 'SCHEMA' | 'IMAGES' | 'HTTP' | 'PERFORMANCE' | 'ACCESSIBILITY' | 'AEO_GEO';
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
  ruleId: RuleId;
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

export type SkippedRule = { ruleId: RuleId; reason: 'excluded-by-profile' | 'not-implemented' };

export type AuditManifest = {
  surface: 'local-build';
  profile: AuditProfile;
  configPath: string | null;
  nodeVersion: string;
  sourceCommit: string | null;
  selectedRules: RuleId[];
  executedRules: RuleId[];
  skippedRules: SkippedRule[];
};

export type AuditResult = {
  /** Schema v2 retained: A2 adds an additive manifest without removing old fields. */
  schemaVersion: 2;
  toolVersion: string;
  generatedAt: string;
  input: { directory: string; siteUrl: string };
  scannedPages: number;
  /** @deprecated Canonical-passing pages only; zero if canonical was not executed. */
  passedPages: number;
  checks: CheckExecution[];
  coverage: CoverageSummary;
  findings: Finding[];
  manifest: AuditManifest;
};
