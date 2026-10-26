---
name: international-seo
description: Use when auditing multilingual sites, hreflang reciprocity, locale codes, translations, x-default and canonical alignment.
---

# Hreflang and international SEO

Follow ../../references/AUDIT_PROTOCOL.md.

1. Identify **actual** locale pairs/regions from the site: do not assume language-country suffixes.
2. Inspect real head/sitemap alternate links for each representative pair: correct absolute URL, valid language/region, self-reference as applicable, return reference and consistent target groups.
3. Compare localized canonicals and policy, including deliberately canonicalized duplicates; avoid universal self-canonical prescriptions for intentional aliases.
4. Assess x-default only when applicable; **not mandatory** for all multilingual sites.
5. Check selectors, translation completeness and parity only on observed pages.
6. Provide pairwise evidence table with source URL, target URL, found tag and reciprocal tag. Missing build/HTTP data must appear as **not-tested**.
7. The existing CLI does not implement hreflang tests: a manual/agent inspection is not a CLI pass.

Official: https://developers.google.com/search/docs/specialty/international/localized-versions .
