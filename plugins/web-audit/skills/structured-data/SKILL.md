---
name: structured-data
description: Use when reviewing JSON-LD, Schema.org, rich result eligibility, entity references and visible-page-data consistency.
---

# Schema / JSON-LD

Follow ../../references/AUDIT_PROTOCOL.md.

1. Inspect actual source/build or rendered DOM; know that JS-inserted JSON-LD can be absent from static HTML.
2. Locate JSON-LD script blocks, parse JSON when available, inspect @context, @type, @id, @graph and nested references; record exact syntax/property defects.
3. Distinguish Schema.org vocabulary support, Google-specific rich-result requirements, and actual visible facts. Never invent reviews, professional qualifications or ratings.
4. Compare the markup against visible real page content (business identity, contact, article author/date, breadcrumbs, services).
5. Run live Rich Results Test or a schema checker only when really available; its absence is **not-tested** for eligibility.
6. Recommend specific minimal fixes and a verification procedure; do not guarantee rich results or AI citations.

Official: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data and https://schema.org/ .
