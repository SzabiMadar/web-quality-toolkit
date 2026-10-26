---
name: image-audit
description: Use when reviewing image alt text, formats, image SEO, responsive sources, loading priority and layout stability.
---

# Image quality, image SEO and loading

Follow ../../references/AUDIT_PROTOCOL.md.

1. Collect observed img/picture markup, actual assets and media roles on representative pages.
2. Evaluate alt based on function: **decorative** images may need empty alt; informative images need meaningful alternatives. Do not invent descriptions for unseen images.
3. Check width/height/aspect-ratio behavior, srcset/sizes and expected responsive sources; only claim real resource bytes/404 if measured.
4. Evaluate hero/LCP image priority and below-the-fold lazy loading as **recommendations** unless runtime evidence exists; do not infer actual LCP from HTML alone.
5. Assess descriptive filenames and important image discoverability without keyword stuffing.
6. Provide URL/asset, observed code or render, issue or recommendation, suggested change and verification. Mark absent network/field measurements **not-tested**.

Official: https://developers.google.com/search/docs/appearance/google-images and https://web.dev/articles/browser-level-image-lazy-loading .
