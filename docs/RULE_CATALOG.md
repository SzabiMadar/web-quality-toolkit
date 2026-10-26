# SEO/AEO/GEO rule inventory

This catalog is intentionally honest about current executable coverage. `Implemented (partial)` means the check is executable but not a complete validator. `Planned` or `manual` must **not** be reported as passed by `npm run audit`.

| Category | Rule family | Status | Evidence/source |
|---|---|---|---|
| Canonical | One valid canonical per generated HTML, correct expected output URL | Implemented | `src/canonical.ts`; Google Search Central canonical guidance |
| Sitemap | Locally discovered sitemap.xml, Astro sitemap-index.xml and referenced local sitemap files; URL sets vs built HTML | Implemented (partial) | `src/sitemap.ts`; Sitemaps protocol; AgriciDaniel `seo-sitemap` |
| Robots | Local robots presence, simple global disallow and sitemap directives; missing file is advisory, apparent block requires review | Implemented (partial) | `src/robots.ts`; Google robots documentation; AgriciDaniel `seo-technical` |
| HTTP | Live status codes, redirects and resource failures | Planned | Requires controlled network/browser audit |
| International | Hreflang, reciprocal return links, x-default, localized canonical | Planned | Google localized versions; AgriciDaniel `seo-hreflang`; Corey Haines `seo-audit` |
| Metadata | Title, description, headings, indexing hints | Planned | Google Search Central; Corey Haines `seo-audit` |
| Links | Internal graph, broken links, orphans | Planned | Corey Haines `seo-audit` |
| Structured data | JSON-LD syntax, @graph, applicable schema; runtime-injected schema | Planned | Schema.org; Corey Haines `schema` and `seo-audit` |
| Images | Alt, size, formats, responsive image tags | Planned | Astro; AgriciDaniel `seo-technical` |
| Performance | Lighthouse/Playwright and measured vs field CWV | Planned | web.dev, Lighthouse and Chrome User Experience Report |
| Accessibility | WCAG-oriented objective and human checks | Planned | W3C WCAG |
| AEO/GEO | Discoverability, answer extractability, source quality, citations vs actual presence | Manual skill guidance (not executed by CLI) | Corey Haines `ai-seo`; AgriciDaniel `seo-geo` |

As of CLI v0.3.0, `findings.json` schemaVersion 2 includes per-target `checks[]` and coverage totals. `passedPages` is a legacy **canonical-only** count. Rules not implemented by the local CLI appear as `not-tested` checks. Source-commit manifest, profiles and full semantic validators remain future work.

Rules should eventually include: stable id, severity, test method, preconditions, proof, official reference URL, source repository reference, and an explicit tested/not-tested status.
