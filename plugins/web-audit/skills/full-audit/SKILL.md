---
name: full-audit
description: Use when coordinating a comprehensive website review of technical SEO, content, accessibility, performance, AEO/GEO and related quality across a project.
---


# Full website audit — orchestrator

First read ../../references/AUDIT_PROTOCOL.md and ../../references/REPORT_TEMPLATE.md.

1. Identify user goal, website/repository, framework, market/languages, available tools and permitted sources. Audit can proceed with a limited scope even without a build.
2. Sample representative home, services/products, content/blog, contact, and localized pages as relevant. List checked and inaccessible URLs.
3. Invoke or follow these specialist **methods** as applicable: technical-seo, on-page-seo, international-seo, structured-data, internal-links, image-audit, performance, accessibility, content-seo, aeo-geo, local-seo.
4. Use the optional TypeScript CLI only where a trusted local dist, confirmed origin, Node and permitted execution exist. It is not bundled with this plugin; its full profile means local canonical, basic sitemap and robots only. Do not claim it tested the other specialties.
5. Independently inspect actual web/browser data where available; never invent HTTP statuses, Lighthouse measurements, indexing, field metrics or AI citations.
6. Merge duplicate findings and contradictions. Keep the evidence for each and separate verified problems, needs-review, recommendations and not-tested.
7. Produce a client-friendly summary, coverage table, prioritized URL/file-specific changes and a retest plan using REPORT_TEMPLATE.md.
8. Keep project sources unchanged until user explicitly approves remediation. Respond in user's language.

No automatic subagents, paid calls, dependency installations or deployments.
