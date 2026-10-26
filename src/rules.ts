import type { AuditCategory, RuleId } from './types.ts';

export type RuleDefinition = {
  id: RuleId;
  category: AuditCategory;
  implemented: boolean;
  method: string;
  note: string;
};

/** This catalog is the single source for available rule families and truthful coverage. */
export const RULES: readonly RuleDefinition[] = [
  { id: 'CANONICAL', category: 'canonical', implemented: true, method: 'static-html', note: 'Generated path mapping assumes self-canonical pages; aliases need policy support.' },
  { id: 'SITEMAP', category: 'sitemap', implemented: true, method: 'local-sitemap-basic', note: 'Local XML parsing is partial; no live sitemap fetch or full XML validation.' },
  { id: 'ROBOTS', category: 'robots', implemented: true, method: 'local-robots-basic', note: 'Simple local robots directives only; full user-agent group precedence is not validated.' },
  { id: 'HREFLANG', category: 'hreflang', implemented: false, method: 'not-implemented', note: 'Hreflang syntax, reciprocal links and locale alignment are not implemented.' },
  { id: 'METADATA', category: 'metadata', implemented: false, method: 'not-implemented', note: 'Title, description, headings and meta robots are not implemented.' },
  { id: 'LINKS', category: 'links', implemented: false, method: 'not-implemented', note: 'Internal link targets and orphan pages are not implemented.' },
  { id: 'SCHEMA', category: 'schema', implemented: false, method: 'not-implemented', note: 'JSON-LD and structured-data checks are not implemented.' },
  { id: 'IMAGES', category: 'images', implemented: false, method: 'not-implemented', note: 'Image accessibility and loading checks are not implemented.' },
  { id: 'HTTP', category: 'http', implemented: false, method: 'not-implemented', note: 'No live HTTP request or response is checked.' },
  { id: 'PERFORMANCE', category: 'performance', implemented: false, method: 'not-implemented', note: 'No Lighthouse or field metrics are measured.' },
  { id: 'ACCESSIBILITY', category: 'accessibility', implemented: false, method: 'not-implemented', note: 'No automated or manual WCAG evaluation is performed.' },
  { id: 'AEO_GEO', category: 'aeo-geo', implemented: false, method: 'not-implemented', note: 'No AEO/GEO assessment or AI citation measurement is performed.' },
];
