# Portable Web Audit skillset v1.1.0 — release notes

New skills (five): sxo, ecommerce-seo, seo-drift, content-brief, agent-readiness. The original 14 are unchanged and remain available, totaling **19 skills**.

New optional local-file-only Node helpers: check-metadata.mjs, check-claims.mjs, compare-snapshots.mjs. Each outputs JSON advisory evidence, never a full website crawler.

Updated: full-audit specialist routing, common upstream learning notes, Devin/ChatGPT/Codex documentation, plugin README, skill validator, tools regression tests and GitHub Actions test script.

**What this release does not claim:** automatic SERP/Google Search Console/Amazon Merchant API access, reliable real-world conversion measurement, live AI-agent capability, paid API execution, first-party rankings or actual AI citations. The separate TypeScript CLI stays **v0.4.0** and only runs canonical/basic sitemap/basic robots tests on local builds.

**Acceptance gates:** GitHub Actions npm test must pass, and an actual user refresh of Devin Desktop must be done before declaring the new version installed in that application. Site-specific live audits require accessible target pages and user permissions.

Upstream inspired by AgriciDaniel/claude-seo with independent text and code. See plugins/web-audit/references/UPSTREAM_LEARNINGS.md and docs/REFERENCE_ADOPTION.md.
