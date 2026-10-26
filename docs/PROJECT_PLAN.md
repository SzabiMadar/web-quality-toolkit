# Web Quality Toolkit — master project plan

> Version: Concept 1.1 (2026-10-26). Language: Hungarian.  
> Repository: https://github.com/SzabiMadar/web-quality-toolkit  
> This file records the product goal, architecture, MVP acceptance criteria, verified reference-repository shortlist, current implementation status and next milestones.  
> It complements (and does not silently replace) [ROADMAP.md](./ROADMAP.md), [RULE_CATALOG.md](./RULE_CATALOG.md) and [REFERENCE_ADOPTION.md](./REFERENCE_ADOPTION.md).

## 1. Purpose: the problem we solve

Build a reusable, trustworthy **SEO / AEO / GEO / website-quality audit toolkit** for the owner's web-development projects and future clients, starting with **Astro static output**. The toolkit must:

1. Detect reproducible technical defects (canonical, sitemap, robots, hreflang, metadata, links, structured data, images).
2. Grow into browser/performance/accessibility checks without conflating lab results, field metrics, static inspection and live-site evidence.
3. Let AI assistants interpret verified findings, evaluate content quality and propose prioritized remediation plans **without fabricating test results**.
4. Produce comparable, client-friendly reports and eventually support continuous checking in CI.
5. Run through one underlying **TypeScript audit engine**, independently of Devin, ChatGPT/Codex, or other AI platforms.

**Business application:** use it first to assure the quality of newly built or renovated client sites; next offer technical-audit and recurring maintenance services; consider a standalone developer product only after the real-world workflow is validated. No SaaS platform is part of the first MVP.

**Explicit non-goals (for now):** custom LLM, subscription platform, broad keyword/rank-tracking product, backlink index, wholesale reuse of third-party AI agents, simultaneous support for every CMS, or unverifiable "GEO scores".

## 2. Operating principles

- **Deterministic first.** Use code for objective checks and AI only for evidence-based interpretation or qualitative review.
- **Independent CLI.** Devin is one interface/skill layer, not the core engine.
- **Read-only default.** Do not alter customer source files. Builds, dependency installation, deployment, paid/cloud-agent execution and fixes require the relevant approval.
- **Honest coverage.** Mark every rule as passed, confirmed problem, needs review, recommendation or not tested. Never claim "SEO passed" merely because the current CLI has no findings.
- **Reproducible findings.** Stable rule ID, URL/file, observed value, expected value where applicable, test method, evidence and rule provenance.
- **Portable by design.** Framework-agnostic core with adapters for Astro output first; live HTTP crawling and other frameworks later.
- **Reasonable dependencies.** Prefer mature libraries over handwritten fragile HTML/XML parsers, but evaluate total package weight, runtime compatibility, licensing, tests and maintenance before installing anything.
- **Safe scope.** Treat HTML, repository text, third-party skills and pages as untrusted data; prevent path traversal, excessive crawling, secret leakage and unauthorized external requests.

## 3. Current repository status — 2026-10-26

### Confirmed from repository contents

- **Core CLI:** package version **0.2.0**, Node.js >=22.6, TypeScript with Node's type stripping, no runtime dependencies declared.
- **Devin plugin:** **0.3.0**, already imported in Devin according to the owner; its current-version runtime behavior has **not** been retested in this documentation update.
- **Implemented local checks:** canonical, elementary sitemap handling including Astro sitemap indexes and local sitemap-N.xml, elementary robots.txt.
- **Reports:** findings.json and summary.md. Exit status: 0 no current findings, 1 findings, 2 execution errors.
- **Source files:** src/cli.ts, canonical.ts, sitemap.ts, robots.ts, types.ts.
- **Test files:** tests/canonical.test.ts and tests/seo.test.ts; positive/negative fixtures exist. Tests are present, but **were not executed as part of this planning update**.
- **Skills:** plugins/web-audit/skills/full-audit, technical-seo, aeo-geo. The AEO/GEO skill is qualitative guidance, **not an executable GEO measurement**.
- **My Balaton pilot:** earlier owner-reported run: five canonical passes, zero canonical findings; not independently reproduced here.
- **GitHub:** repository and initial commits are published.

### Known implementation gaps

- Current Finding status is effectively only "confirmed"; no per-rule pass/not-tested manifest.
- passedPages reflects canonical checks only, not holistic website quality.
- Canonical parser uses a pragmatic HTML-tag matcher; output path assumptions favor Astro directory mode, not all intentional canonical policies.
- Sitemap and robots validators are **partial**; not complete XML / robots precedence implementations.
- Missing robots.txt is advisory, but current severity/status model does not represent advisory cleanly.
- No executable hreflang, metadata, internal-link, JSON-LD, image, Lighthouse, live HTTP, accessibility or automated GEO tests.
- No first-class CI integration or client-ready PDF/HTML report yet.

**Readiness:** foundation built; comprehensive technical SEO MVP **not yet complete**. See [ROADMAP.md](./ROADMAP.md) for checked/unchecked task tracking.

## 4. Product architecture and workflow

### Components

1. **Engine / rules:** TypeScript modules evaluate supplied data and yield versioned findings and explicit check coverage.
2. **Input adapters:** static HTML (first), Astro path mapping (first), optional browser-rendered snapshot and rate-limited remote crawler (later).
3. **Outputs:** structured JSON and Markdown now; machine-readable manifest, HTML/PDF reports and audit diffs later.
4. **AI skills:** Devin (available), followed by optional Codex/ChatGPT-compatible interfaces using the same CLI output. Skills do not redefine factual findings.
5. **Automation:** optional GitHub Actions / scheduled audits after reproducible local operation.
6. **Human approval:** fixes are separate from observation. Recommendations are not silently applied.

### Local static audit (works within current scope)

1. Verify project and configured production origin.
2. Obtain the trusted project's existing build output; get approval before executing its build script.
3. Run from the toolkit root:

~~~bash
npm test
npm run audit -- --dir /ABSOLUTE/PATH/TO/PROJECT/dist --site https://actual-site.example/ --out /ABSOLUTE/PATH/TO/PROJECT/audits/latest
~~~

4. Read both findings.json and summary.md, report actual scan count and evidence.
5. Separate implemented results from missing checks.
6. Recommend fixes; after approval, fix the *application* in its own repository and repeat the audit.

The site URL above is syntactic demonstration only: customer reports must contain a **confirmed real origin**, never a placeholder.

### Devin integration

~~~bash
devin plugins install --local ./plugins/web-audit
devin plugins list
~~~

In a fresh Devin Agent session invoke the installed **/web-audit:full-audit** skill. The plugin **does not install the CLI** or grant automatic access to every customer project's build output. Keep the toolkit executable available to the agent and revalidate the installed plugin whenever its version or skill contents change.

A published-repository install is supported by the documented plugin layout:
**devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit**.
Check actual Devin environment/version and permissions before relying on this for unattended work.

## 5. MVP definition and gates

### MVP-0 — Existing limited technical SEO baseline (CLI v0.2.0)

- Scan local generated HTML.
- Check canonical existence, number, URL validity and expected-path alignment.
- Inspect local sitemap / Astro sitemap index and basic page coverage.
- Inspect simple robots directives and sitemap references.
- Emit JSON + Markdown and process exit code.

**Status: implemented, with documented parser/policy limitations.**

### MVP-1 — First dependable full technical SEO audit (target)

- Stable versioned findings/coverage model and deterministic manifest.
- Configurable origins, path mapping, canonical exception policies, indexing policies and rule profiles.
- Robust HTML/XML interpretation and sensible handling of robots groups.
- Hreflang reciprocity, syntax, x-default when appropriate and canonical compatibility.
- Title, description, headings, robots meta and indexability cues.
- Internal link graph, missing local targets, orphan-page identification.
- JSON-LD parsing, structural checks and transparent limits on schema eligibility.
- Images: alt, dimensions, source/srcset/sizes and loading attributes.
- Repeatable regression fixtures with deliberate invalid examples.
- Clear human-readable and machine-readable reports distinguishing executed/untested checks.

**Definition of done:** run against two different real sites, including a bilingual site; seeded canonical/hreflang/schema/image errors are detected; intended exceptions do not create spurious high-severity failures; every reported pass is tied to an executed rule; repeated runs have comparable results; the site source remains untouched.

**Not required for MVP-1:** sitewide browser crawl, dynamic rendering, complete Lighthouse, Google Search Console, actual AI citations, SaaS.

### Follow-on quality suite

- Playwright live/browser snapshots and network/console errors.
- Lighthouse/Unlighthouse lab performance; optional field CrUX/Search Console data clearly distinguished.
- axe-core/Pa11y objective accessibility checks + human review.
- AI-assisted content/answerability/entity/citation-readiness analysis.
- Priority/impact/remediation planning, reporting and CI.

## 6. Reference repositories — verified shortlist on 2026-10-26

Selection criteria: directly relevant functionality, available source code and clear license, maintained repository, substantial adoption where available, APIs/CLI suited to TypeScript, and realistic integration cost. GitHub stars show **community interest, not an independent quality or security certification**. Last-push activity is not equivalent to proof that tests pass. Versions/licenses must be rechecked at the exact revision before copying code or adding a dependency.

### A. Original three skill / workflow references (confirmed earlier)

| Repository | GitHub stars (snapshot) | License | Our intended use |
|---|---:|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 56,638 | MIT | **Primary content/AI SEO reference**: seo-audit, ai-seo, schema methodology |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 21,886 | MIT | **Primary technical audit skill reference**: technical SEO, hreflang, sitemap, reporting, specialists |
| [seoskillsai/seo-skills-ai](https://github.com/seoskillsai/seo-skills-ai) | 20 | MIT | **Architecture inspiration only**: cross-agent modular skills; too little public adoption to call widely validated |

The first two are **professional-methodology references**, not trusted executables. Independently author Devin skills; do not run scripts copied blindly from third-party agent repositories.

### B. Mature implementation / integration candidates

| Repository | GitHub stars (snapshot) | License | Specific possible function | Decision |
|---|---:|---|---|---|
| [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio) | 30,532 | MIT | HTML/XML extraction and traversal | **Evaluate early** as common HTML abstraction |
| [inikulin/parse5](https://github.com/inikulin/parse5) | 3,940 | MIT | HTML5-compliant parsing | **Evaluate early** as alternate/underlying parser |
| [ekalinin/sitemap.js](https://github.com/ekalinin/sitemap.js) | 1,709 | MIT | Sitemap tooling and XML-oriented utilities | **Investigate API**: primarily sitemap generator, not assumed comprehensive validator |
| [samclarke/robots-parser](https://github.com/samclarke/robots-parser) | 168 | MIT | robots.txt user-agent, allow/disallow rules | **Evaluate for focused use**; modest adoption |
| [JustinBeckwith/linkinator](https://github.com/JustinBeckwith/linkinator) | 1,277 | MIT | Broken-link detection, local/remote crawling | **Strong optional CLI/adapter candidate**; do not duplicate mature HTTP checks |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | 30,950 | Apache-2.0 | Lab performance/SEO/accessibility audits | **Future authoritative audit engine** for browser metrics |
| [harlan-zw/unlighthouse](https://github.com/harlan-zw/unlighthouse) | 4,916 | MIT | Sitewide Lighthouse orchestration/reporting | **Strong optional integration**; avoid rewriting sitewide Lighthouse runner |
| [microsoft/playwright](https://github.com/microsoft/playwright) | 98,565 | Apache-2.0 | Browser execution, rendered DOM, console and network | **Future browser adapter** |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | 7,710 | MPL-2.0 | Objective accessibility engine | **Future integration**; automated accessibility is inherently partial |
| [pa11y/pa11y](https://github.com/pa11y/pa11y) | 4,585 | LGPL-3.0 | Accessibility auditing CLI | **Alternative/benchmark**; review license obligations before redistribution |
| [apify/crawlee](https://github.com/apify/crawlee) | 26,269 | Apache-2.0 | Scalable TypeScript live-web crawling | **Defer** until remote-crawl scope justifies it |
| [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) | 7,117 | Apache-2.0 | Lighthouse regression checks in CI | **Future CI option** |
| [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) | 8,660 | Apache-2.0 | Browser-side collection of actual page experience metrics | **Optional field instrumentation**; not a local Lighthouse replacement |
| [google/schema-dts](https://github.com/google/schema-dts) | 1,252 | Apache-2.0 | TypeScript declarations for Schema.org JSON-LD | **Optional typing**; NOT schema validation or Google rich-result testing |

### C. Whole-product benchmarking references (not planned as dependencies)

| Repository | Stars | License | Why examine it |
|---|---:|---|---|
| [every-app/open-seo](https://github.com/every-app/open-seo) | 25,042 | MIT | Broad SEO platform architecture and UX; much larger product scope |
| [PhialsBasement/LibreCrawl](https://github.com/PhialsBasement/LibreCrawl) | 1,076 | MIT | Full-site crawler reports and UI; Python, not our primary stack |
| [StJudeWasHere/seonaut](https://github.com/StJudeWasHere/seonaut) | 839 | MIT | Technical crawl coverage, severity presentation and sitewide navigation |

The benchmark references help us avoid feature blind spots; **do not vendor or transplant their product**.

### D. Official references, ranked above community claims

- [Google Search Central](https://developers.google.com/search/docs)
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google hreflang / localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Sitemaps.org protocol](https://www.sitemaps.org/protocol.html)
- [Schema.org](https://schema.org/)
- [Astro documentation](https://docs.astro.build/)
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

**Adoption policy:** for each implementation candidate open an evaluation record documenting what it actually tests, semantic blind spots, license, security/dependency surface, Node support, cost, version pinning, and how its output maps into our own Finding schema. Do not add all candidates as dependencies. Prefer one suitable parser and a few optional integrations.

## 7. Prioritized implementation plan

### Phase A — Stabilize engine contracts (next active work)

- [ ] Extend src/types.ts to separate a **check execution result** (passed, failed, needs-review, not-tested) from finding severity and recommendation text.
- [ ] Introduce explicit **coverage** per rule/site and versioned audit manifest (tool version, source revision if available, input, timestamp, executed/skipped rules).
- [ ] Provide a migration path from existing findings.json schemaVersion 1; preserve existing rule IDs.
- [ ] Change reporting so a warning/advisory (e.g. robots.txt absence) does not automatically imply a confirmed indexing blocker.
- [ ] Add tests for all statuses, partial coverage, error exit codes and deterministic report fields.
- [ ] Introduce project configuration and named quick/full/content profiles; document actual implemented rules for each.

**Acceptance:** existing baseline tests still pass, all old rules emit compliant results, no unexecuted category reported as passed, and outputs are deterministic apart from documented metadata.

**Suggested development workflow:** short feature branch + tests + pull request before main update. No production-site modifications.

### Phase B — Robust technical SEO parser and semantics

- [ ] Compare Cheerio / parse5 with current regex parser against real HTML and malformed fixtures; choose the smallest robust solution.
- [ ] Evaluate XML parsing and sitemap library features; avoid treating generation helpers as validators.
- [ ] Correct robots user-agent group behavior, precedence and severity/context.
- [ ] Improve expected URL mapping for Astro directory/file modes, subpaths, redirect aliases and canonical exceptions.
- [ ] Implement reciprocal hreflang including language/region and optional x-default.
- [ ] Add metadata/headings/indexability modules and intentional-policy exceptions.

**Acceptance:** multilingual fixture tests catch missing reciprocal links and wrong canonical targets without rejecting legitimate, documented setups.

### Phase C — Complete local-build technical SEO MVP

- [ ] Internal link graph and local broken-target/orphan checks.
- [ ] JSON-LD syntax / structure checks (avoid unsupported rich-results claims).
- [ ] Image checks: alt, loading, size and responsive attributes.
- [ ] Cross-rule deduplication and prioritized remediation plan.
- [ ] Validate My Balaton and a distinct bilingual website.
- [ ] Publish coverage and known limitations in every report.

**Acceptance:** fault-injection fixtures catch canonical/hreflang/schema/image defects; two real websites tested; source files unchanged.

### Phase D — Optional runtime/browser and AI review

- [ ] Add carefully scoped live HTTP tests with host allowlists, limits, rate control and robots consideration.
- [ ] Integrate Playwright and Lighthouse or Unlighthouse only after verifying measurable added value.
- [ ] Integrate axe-core accessibility audits plus explicitly named manual checks.
- [ ] Run qualitative AEO/GEO skills on observed text and exact passages with evidence tiers.
- [ ] Separate lab performance from real-user field data and **never claim actual AI citations from a content heuristic**.

### Phase E — Delivery / CI / productization

- [ ] GitHub Actions, comparison against baseline, actionable quality gates.
- [ ] Human-readable HTML/PDF reports and client summary.
- [ ] Optional Search Console integration with user authorization.
- [ ] Evaluate Devin Dynamic Workflows against one-agent solution by quality, latency and cloud cost.
- [ ] Beyond Astro: Next.js, WordPress and general remote-site adapters.
- [ ] Only then evaluate packaged npm CLI, open-source contributor experience and commercial extensions.

## 8. Immediate next coding increment: A1 (recommended)

**Task:** implement the shared check-result/status model *before* adding more audit rules.

Suggested contract, **not yet implemented**:

~~~ts
type CheckStatus =
  | 'passed'
  | 'confirmed'
  | 'needs-review'
  | 'recommendation'
  | 'not-tested';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface RuleResult {
  ruleId: string;
  category: string;
  status: CheckStatus;
  severity?: Severity;
  file?: string;
  url?: string;
  message: string;
  evidence?: Record<string, string | number | boolean | null>;
  observed?: string;
  expected?: string;
  testMethod: string;
  referenceUrl?: string;
}
~~~

Design consideration: distinguish **rule execution** from individual findings. A single rule could evaluate five URLs, pass on four, fail on one, or be partially not-tested. It is better to model explicit per-rule/per-URL execution coverage than to equate a zero-length findings array with an overall pass.

Suggested A1 tests:
- Current canonical passes, failures and CLI exit codes are preserved.
- Advisory robots warning does not masquerade as proven crawl blockage.
- A not-executed schema or image check appears as not-tested, never passed.
- JSON schemaVersion is advanced explicitly and migration is documented.
- Reports list rule ID, evidence and executed vs skipped coverage.

## 9. Safety, licensing and operational boundaries

- Do not execute build scripts of unknown repos or scripts embedded in third-party AI skills without authorization.
- Never run active crawlers against unrelated customer domains without scope, rate limits and permission.
- Do not export URLs containing credentials, private content, API tokens or PII into public GitHub reports.
- No direct third-party code/skill files were imported by this planning document.
- For direct reuse or packaging, verify license and preserve required notices; MPL/LGPL/Apache and MIT have different compliance obligations.
- Browser audits, Chrome binaries, paid APIs and Devin cloud agents may add machine/storage/time costs and require explicit approval.
- Capture source/version/test coverage rather than advertising blanket "SEO health scores."

## 10. What to do with this file

- Use this as **the persistent product/architecture brief**, shared between ChatGPT, Codex and Devin.
- Keep [ROADMAP.md](./ROADMAP.md) as the checkable work-status ledger.
- Keep [RULE_CATALOG.md](./RULE_CATALOG.md) as the exact implemented/planned rule inventory.
- Update [REFERENCE_ADOPTION.md](./REFERENCE_ADOPTION.md) only after an upstream implementation is genuinely evaluated or adopted.
- For each completed development increment, add tests and update the roadmap + relevant rules; do not advance a checkbox based only on an AI-generated claim.

**Next action:** Phase A / increment A1. Implement and test the common finding/check-coverage schema, then update the CLI and reports. No extra Devin workflows or external runtime dependencies are required to start A1.
