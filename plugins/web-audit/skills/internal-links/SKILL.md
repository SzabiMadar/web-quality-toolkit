---
name: internal-links
description: Use when checking navigation, internal link graphs, broken links, orphans, anchors, redirects and path depth.
---

# Internal linking

Follow ../../references/AUDIT_PROTOCOL.md.

1. Declare the audit scope: single page, site sample, complete local build or actual full crawler output. Do not call a page an orphan based on a partial sample.
2. Enumerate actual hrefs on inspected pages; resolve relative links and fragments against page URLs and site path policy.
3. Validate local targets only if complete generated assets exist. Remote broken links/HTTP statuses require **real fetches**, not inference from source.
4. Map priority routes, navigation, breadcrumbs and content links; note irrelevant anchors, avoidable redirects and dead ends when observed.
5. Use Linkinator or another crawler only if present and permitted. Do not pretend it is bundled with this plugin.
6. Report source URL, href/target, observed status/evidence, exact repair and retest.

Official: https://developers.google.com/search/docs/crawling-indexing/links-crawlable .
