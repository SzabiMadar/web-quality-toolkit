---
name: performance
description: Use when assessing site speed, Lighthouse, Core Web Vitals, loading chains, JavaScript/CSS, images and mobile performance.
---

# Web performance

Follow ../../references/AUDIT_PROTOCOL.md.

1. State tested URLs, device conditions, actual performance tool and date.
2. Distinguish **lab Lighthouse** from **field CrUX/RUM**; INP needs appropriate real interaction/field data, and lab TBT is not the same metric.
3. Run Lighthouse/PageSpeed/Playwright only when accessible and permitted. Record actual LCP, CLS, TTFB, TBT or INP with sources and repeatability caveats.
4. From actual waterfall/bundle/render evidence inspect LCP resource discovery, images, blocking CSS/JS, fonts, hydration, caching and third parties.
5. If only source is available, list performance **hypotheses**, explicitly mark CWV measurement not-tested, and specify a reproducible measurement plan.
6. Prioritize observed bottlenecks over synthetic scores, and do not promise percentages without before/after evidence.

Official: https://web.dev/articles/vitals and https://developer.chrome.com/docs/lighthouse/ .
