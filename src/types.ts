export type Severity = 'high' | 'medium' | 'low';
export type Finding = {
  id: string;
  category: 'canonical' | 'sitemap' | 'robots' | 'metadata';
  severity: Severity;
  status: 'confirmed';
  file: string;
  message: string;
  evidence?: Record<string, string | number>;
};
export type AuditResult = {
  schemaVersion: 1;
  generatedAt: string;
  input: { directory: string; siteUrl: string };
  scannedPages: number;
  passedPages: number;
  findings: Finding[];
};
