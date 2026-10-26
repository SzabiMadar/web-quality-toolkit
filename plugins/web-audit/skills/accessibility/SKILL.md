---
name: accessibility
description: Use when checking WCAG accessibility, forms, keyboard navigation, semantics, alt text, focus, contrast and screen-reader behavior.
---

# Accessibility review

Follow ../../references/AUDIT_PROTOCOL.md.

1. Establish intended WCAG target; do not claim conformance from limited sampling.
2. Inspect semantic landmarks/headings, form labels/errors, image alternatives, language, control roles and descriptive links on accessible DOM/source.
3. With browser access and permission check keyboard tab order, focus visible, modal focus traps, zoom, responsiveness and reduced-motion where relevant.
4. If available run axe-core/Pa11y and cite *actual* rule results. Automated tests cannot cover all WCAG success criteria.
5. Test contrast with actual computed colors when claiming numerical ratios; never guess from screenshots.
6. Report URL/component, user impact, related WCAG criterion when appropriate, status, fix and manual retest. Missing browser/AT tests = **not-tested**.

Official: https://www.w3.org/WAI/WCAG22/quickref/ .
