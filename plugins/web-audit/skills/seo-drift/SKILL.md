---
name: seo-drift
description: Use when comparing earlier and current website audit snapshots to detect SEO regressions after releases and plan recurring checks.
---

# SEO Drift — changes and regressions

Read ../../references/AUDIT_PROTOCOL.md and ../../references/REPORT_TEMPLATE.md. This skill detects *differences*, not proof of lost traffic or rankings.

## Preconditions

Need two real snapshots with URL, timestamp, source/build/live surface, comparable fields and metrics. If baseline/current evidence is absent, only design capture steps; comparison remains **not-tested**.

## Method

1. Confirm that site origin, localization, URL and evidence surface are comparable; URL canonicalization depends on actual site policy.
2. Prioritize high-risk changes: new noindex; removed/changed canonical; verified HTTP error (only if measured); JSON-LD or document title removed. An intentionally corrected canonical change is not automatically a fault.
3. Flag H1, meta description, Open Graph, schema types and content fingerprint differences for editorial review. Missing data in one snapshot means **not-tested**, never proof of removal.
4. Treat Core Web Vitals regression as measured only if both snapshots include comparable actual measurements and settings/time windows.
5. Show before/after evidence, status, severity versus confidence, risk hypothesis, investigation and retest action. Group same-template changes.
6. Suggest automated scheduled comparisons or CI gates only if authorized; do not deploy, send notifications or schedule work by default.

## Optional helper

Independent Node utility: scripts/compare-snapshots.mjs, which accepts supplied JSON snapshots, needs no network or third-party dependencies, and reports only observed supported field changes. It never captures pages itself.

Minimal snapshot example:

~~~json
{"url":"https://example.com/","capturedAt":"2026-10-01T12:00:00Z","surface":"build","title":"Home","canonical":"https://example.com/","noindex":false,"schemaTypes":["Organization"],"h1":["Welcome"]}
~~~

See ../../references/UPSTREAM_LEARNINGS.md and the claude-seo 17-rule drift catalogue.
