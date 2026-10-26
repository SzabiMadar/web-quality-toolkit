# Upstream skill and repository adoption

Reviewed: 2026-10-26. This document tracks design decisions, not claims that upstream code is already executed by the CLI.

## Reviewed sources

| Repository | Inspected artifacts | License | Reuse decision |
|---|---|---|---|
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | `skills/seo-technical/SKILL.md`, `skills/seo-sitemap/SKILL.md`, `skills/seo-hreflang/SKILL.md`, `skills/seo-audit/SKILL.md`, `skills/seo-schema/SKILL.md` | MIT (Copyright (c) 2026 agricidaniel) | Adapt technical audit coverage, the distinction between sitemap discovery and validation, reciprocal hreflang checks and evidence-driven reporting. Do not execute its Claude-specific commands. |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/seo-audit/SKILL.md`, `skills/ai-seo/SKILL.md`, `skills/schema/SKILL.md` | MIT (Copyright (c) 2025 Corey Haines) | Adapt crawlability-first prioritization, JS-rendering limitations for detecting schema, and separation of citations from measured visibility. |
| [seoskillsai/seo-skills-ai](https://github.com/seoskillsai/seo-skills-ai) | `skills/seo-technical/SKILL.md`, `skills/seo-audit/SKILL.md`, repository `packages/cli/` and `.codex-plugin/` structure | MIT (Copyright (c) 2026 SEO Skills AI (seoskillsai.com)) | Adapt modular cross-agent skill architecture. Do not depend on its scripts, CLI, MCP settings or multi-agent defaults for a simple audit. |

All three root repositories published an MIT `LICENSE` file at the time of review. MIT permits reuse with the copyright and permission notices retained in copies or substantial portions. **No third-party source code or full skill text has been copied into this repository in this integration.** The new skills are independently authored adaptations of workflows and cite their reference sources. A future direct port must include the upstream license text and attribution, document exact file/revision, test dependencies and check security.

## Explicit decisions

1. **Deterministic CLI remains authoritative for tests actually implemented.** It scans local build output. It does not assert HTTP status, live indexing, client-side rendered JSON-LD, or real-world AI citations.
2. **`full-audit` orchestrates; specialized skills evaluate.** Newly added `technical-seo` and `aeo-geo` are standalone procedures, not silent additions to executable checker coverage.
3. **Sitemap discovery is not validation.** A `Sitemap:` declaration is not proof that a sitemap is accessible. The local checker can validate only local generated output; remote network checks are future work.
4. **Missing `robots.txt` is not automatically an SEO failure.** The current checker reports an advisory finding, not a demonstrated indexing block.
5. **Avoid blind upstream use.** Skills contain model assumptions and potentially stale platform advice. Check official documentation before adding an objective rule.
6. **Record provenance per rule.** See `docs/RULE_CATALOG.md`. Rules requiring a real browser or external service remain `not-tested` until instrumented.

## Official references for verification

- [Google Search Central](https://developers.google.com/search/docs)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Sitemaps XML protocol](https://www.sitemaps.org/protocol.html)
- [Schema.org](https://schema.org/)
- [Astro docs](https://docs.astro.build/)

This inventory is a snapshot. Do not automatically treat any upstream project's guidance, star count or README claim as evidence of a search engine ranking factor.

## Portable skillset v1 (2026-10-26)

The primary deliverable is now the Devin skill plugin under plugins/web-audit, consisting of **independently written instructions**, not imported upstream source or runnable upstream SEO tools. The original three projects above remain **methodological** references. Lighthouse (GoogleChrome/lighthouse), Playwright (microsoft/playwright), axe-core (dequelabs/axe-core) and Linkinator (JustinBeckwith/linkinator) are **optional integrations**, not installed plugin dependencies. No license-covered third-party code or full SKILL.md was copied as part of this release. Refer to docs/SKILLSET_RELEASE.md for scope and limitations.
