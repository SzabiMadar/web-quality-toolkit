---
name: ecommerce-seo
description: Use when auditing a webshop, product pages, collection pages, SKU variants, product JSON-LD and Google Merchant readiness.
---

# E-commerce SEO and merchant readiness

Read ../../references/AUDIT_PROTOCOL.md. Run only when real commerce is in scope; do not audit an ordinary law-firm website as a webshop.

## Inputs

Determine actual category, product and variant URL(s), platform only if verified, operating market, displayed currency, customer task and available sources (HTML, rendered DOM, merchant feeds, checkout or Search Console). **Never** place real orders or submit payment forms without approval.

## Checks

1. Product/category discovery, breadcrumbs, facet and filter indexing, pagination, canonical/variant policy, sitemap membership and internal navigation. Product variants can validly have different canonical strategies.
2. Product information: unique descriptive name, actual photos, brand, SKU/materials/compatibility, visible price, truthful stock, shipping, returns and support. No minimum word-count as universal ranking threshold.
3. Inspect actual JSON-LD: Product, ProductGroup, Offer/AggregateOffer in correct contexts, identifiers, offer price/currency/availability, variant relationship, merchant policy. Distinguish required, recommended and context-dependent properties using up-to-date Google documentation.
4. If source **and** rendered HTML are available, compare markup, visible price and variants; never claim merchant feed parity without the real feed.
5. Assess add-to-cart, checkout steps, variation selection, responsiveness and keyboard access only if actually tested. Coordinate with sxo, performance and accessibility.
6. Marketplace/ranking/pricing intelligence requires actual external data or authorized API. Ask for approval before paid DataForSEO, Merchant API or Amazon calls.
7. Emerging UCP/agent commerce and discovery mechanisms are optional reviews, not automatic ranking blockers.

## Output

Categorize by page template; give product/variant comparison table, observed markup vs visible page, finding confidence and a reproducible verification step. No invented inventory, prices, stars, merchant errors, cart behavior or rich results.

Optional independent helper: scripts/check-metadata.mjs for title/description duplicates when user supplies page-pair JSON. See ../../references/UPSTREAM_LEARNINGS.md and https://developers.google.com/search/docs/appearance/structured-data/product .
