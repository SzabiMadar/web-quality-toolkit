---
name: aeo-geo
description: Conduct a qualitative AEO/GEO website content review without conflating content readiness with actual AI search citations or rankings.
---

# AEO and GEO — qualitative review

Source-informed design: [coreyhaines31/marketingskills: ai-seo](https://github.com/coreyhaines31/marketingskills/tree/main/skills/ai-seo), [AgriciDaniel/claude-seo: seo-geo](https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo-geo), and the multi-platform skill layout from [seoskillsai/seo-skills-ai](https://github.com/seoskillsai/seo-skills-ai). These projects are MIT licensed; see `docs/REFERENCE_ADOPTION.md`. Independently authored guidance, not a copy of their commands or code.

## Prerequisites

- Confirm business objective, intended geography, primary language(s) and the content URLs being reviewed; do not invent search intent.
- Distinguish a local source/build review from a browser-rendered page, crawled website or real AI answer sample.
- No automated GEO score or actual AI-citation measurement exists in the current Toolkit CLI. This skill describes a **manual/agent** review, not a CLI feature.

## Evaluate content, with concrete evidence

1. **Accessibility of core information**: Is business identity, offering, locality, contact and service detail visible in rendered content and useful standalone passages?
2. **Answerability**: Can a reader understand service scope, eligibility, conditions and next steps from the page without guessing? Flag unanswered user questions rather than inventing FAQs.
3. **Entity consistency**: Compare company name, location, professional credentials and services across audited pages; only claim an inconsistency when the evidence is visible.
4. **Citeability and provenance**: Identify meaningful facts, sources, author/date where applicable, and claims in need of verification. Link recommendations to actual passages.
5. **Markup support**: Suggest relevant schema types only where content is factual and visible; structured data alone does not ensure rich results or AI visibility.
6. **International behavior**: Check translation parity and locale signals only when a multilingual site exists.
7. **Crawler access**: If checking robots AI-crawler groups, distinguish *training crawlers* from *search/discovery crawlers* and verify provider-specific current docs before making claims.

## Evidence hierarchy

Use current official platform documentation for eligibility and crawler directives; then well-designed independent studies; then observational vendor data; finally marketing case studies. Mark unverified hypotheses and approximate impacts as recommendations, not confirmed problems. Never promise inclusion, ranking, citations, or a fixed percentage lift.

## Output

Group observations by URL with quote/excerpt or exact section; separately list verified facts, hypotheses/recommendations, and unavailable tests. Provide a prioritized editorial plan without editing the site's source without explicit approval.
