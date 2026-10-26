---
name: technical-seo
description: Use when inspecting canonical URLs, robots, sitemaps, crawlability, indexability, HTTP access and technical SEO regressions.
---


# Technical SEO — evidence-first method

Read ../../references/AUDIT_PROTOCOL.md.

1. Identify **source/build/live** surface, canonical origin, framework and audited URLs.
2. Inspect actual HTML head for canonical; verify count, syntax, intended target and policy exceptions (redirect aliases, pagination, locale variants).
3. Inspect robots and sitemap/index/child files, distinguish directives from live reachability; sample/verify user-agent group rules where parser/tool allows. Missing robots.txt alone is not an indexing blocker.
4. Check meta robots; check X-Robots-Tag, HTTP statuses and redirect chains **only if live headers were actually fetched**.
5. Compare site paths, navigability, common templates and localized canonical policies; delegate hreflang, link graph and structured data to their named skills.
6. If independent local CLI is available, run it only with authorized trusted build, read JSON and Markdown, and **declare** limited canonical/basic sitemap/basic robots scope.
7. Report URL/path, observed evidence, expected behavior, official rationale, severity, fix and verification. If Search Console isn't available, actual indexing is not-tested.

Official references: https://developers.google.com/search/docs/crawling-indexing and https://www.sitemaps.org/protocol.html .
