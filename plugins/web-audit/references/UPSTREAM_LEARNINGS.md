# Claude SEO upstream research — selective adaptation record (2026-10-26)

**Reviewed:** https://github.com/AgriciDaniel/claude-seo (main branch, Python project v2.5.0 observed). Upstream MIT; other content or bundled prompt sets may carry their own license. The Web Quality Toolkit v1.1 implementation is independently written: **no upstream Python scripts or SKILL.md texts copied**.

## Reusable ideas and decisions

| Upstream location | Verified behavior/idea | WQT decision | Important limitation |
|---|---|---|---|
| skills/seo-sxo; references/page-type-taxonomy.md, persona-scoring.md, user-story-framework.md | Match target page type to sampled SERP intent; visitor task, trust, clarity and action review | New sxo SKILL.md | SERP consensus requires real search data; personas and scores are qualitative hypotheses |
| skills/seo-ecommerce; scripts/schema_ecommerce_validate.py | Product/variants/offer/shipping/return structured-data audits | New ecommerce-seo SKILL.md | Google eligibility requires current official documentation and actual markup; paid Merchant/API sources optional |
| skills/seo-drift; scripts/drift_baseline.py, drift_compare.py; 17 comparison rules | Compare before/after canonical, noindex, title, schema, CWV and more | New seo-drift SKILL.md + small Node snapshot comparator | Supplied snapshots are not live site measurement; difference does not prove lost rankings |
| skills/seo-content-brief | New and update-mode content briefs, SERP-informed outlines, existing-page preservation | New content-brief SKILL.md | No invented SERP results or volumes; medical/legal claims need SME review |
| skills/seo-agentic; scripts/agent_ux_check.py; agentic_check.py | Separate accessible agent interactions, access policy, optional discovery protocols | New agent-readiness SKILL.md | llms.txt/WebMCP/agent catalog adoption conditional, not universal SEO requirements |
| scripts/parse_html.py | Structured extraction of metadata, headings, links, image and JSON-LD | Reference for future optional parser adapter | Current plugin does not ship an HTML crawler; the existing CLI's basic parsers are unchanged |
| scripts/metadata_template.py | Detect duplicated/templated titles and descriptions | Independently implemented scripts/check-metadata.mjs | Text-template heuristic only, not a Google ranking score |
| scripts/content_verify.py | Candidate numerical/authority assertions and nearby citation indicators | Independently implemented scripts/check-claims.mjs | Hungarian/English regex coverage partial; a nearby URL does not validate a claim |
| scripts/consistency_check.py | Verify references and package completeness | Extend scripts/validate-skills.mjs and tests/tools.test.mjs | This is structural QA, not proof Devin Desktop has loaded the plugin |
| scripts/url_safety.py; fetch_page.py; render_page.py | Centralized SSRF/DNS safety, bounded network fetches and JS rendering | Security reference, **not ported** | Browser/pip packages and external network capabilities purposely outside lightweight v1.1 |
| scripts/pagespeed_check.py; lcp_subparts.py | PSI and CrUX field/lab split and LCP diagnosis | Prioritize in performance review methodology | Requires real source data and sometimes API keys; no fake field measurements |
| scripts/google_report.py | Structured business-facing HTML/PDF reports | Report-template inspiration only | Complex dependency/runtime; unnecessary for portable baseline |

## Rules to avoid copying as mandatory requirements

- Title tag length, description length, one H1, minimum blog-word-count and enforced above-fold CTA are **heuristics**, not universal Google ranking/pass rules.
- User-perspective scores, UX maturity percentages or E-E-A-T numeric subweights are not official ranking signals.
- Missing robots.txt, llms.txt, agent catalogs, WebMCP/UCP or unimplemented Merchant extensions is not automatically a blocker.
- Training bots, search bots and user-triggered browsing agents have different roles and provider policies; verify current primary-source documentation before advising.
- Mark live site performance, actual AI citation ranking, SERP search data, schema rich-result eligibility and real merchant feeds not-tested until measured.

## Licensing and implementation boundary

- Upstream root declares MIT. No direct code-port took place in v1.1. If any substantial upstream code is copied later, preserve applicable full upstream copyright/permission notice and verify file-level licensing.
- Tools in WQT v1.1 are small, local-file-only Node scripts with **zero new npm dependencies** and no unattended network access.
- The tool runner reads caller-supplied files and prints candidates/diffs, while the portable AI skills supply context, judgment and verification.

**Primary-source cross-checks:** Google Search Central (https://developers.google.com/search/docs), merchant structured data (https://developers.google.com/search/docs/appearance/structured-data/product), WCAG (https://www.w3.org/WAI/WCAG22/quickref/) and Core Web Vitals (https://web.dev/articles/vitals).
