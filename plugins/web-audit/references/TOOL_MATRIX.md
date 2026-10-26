# Available versus optional tool capabilities

| Category | Human/agent skill | Optional dedicated tool | Cannot infer |
|---|---|---|---|
| Canonical/basic sitemap/basic robots | technical-seo | Existing TypeScript CLI v0.4.0 | Live status/indexing or full robots parser |
| Metadata/hreflang | on-page-seo/international-seo | Real inspected HTML/DOM | Google indexing result |
| Structured data | structured-data | Google Rich Results Test if accessible | Guaranteed rich result |
| Internal links | internal-links | Linkinator if installed | Entire site's state from sample |
| Performance | performance | Lighthouse, CrUX, Playwright | Field CWV from lab tests |
| Accessibility | accessibility | axe-core/Pa11y if installed | Full WCAG compliance |
| AEO/GEO | aeo-geo | Real dated AI-answer samples if available | Visibility or citations without samples |

Reference methods: https://github.com/coreyhaines31/marketingskills ,
https://github.com/AgriciDaniel/claude-seo ,
https://github.com/seoskillsai/seo-skills-ai .
External executables are examples, **not** installed/bundled dependencies.
