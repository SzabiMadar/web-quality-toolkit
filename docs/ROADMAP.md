# Web Quality Toolkit — implementation roadmap

This is the practical implementation checklist based on the project's **Universal SEO/AEO/GEO Audit Toolkit, Concept 1.0 (2026-10-26)**. The plan's requirements remain authoritative; this file tracks implementation status only.

## Goal and constraints

One reusable read-only-by-default audit workflow usable through Devin Desktop, ChatGPT/Codex development environments, CLI and later GitHub Actions. Deterministic TypeScript checks produce verified findings; AI reviews provide clearly labeled professional interpretation. Never treat an untested check as a pass. Build, installs, deployments, edits and cloud agent runs require applicable approval.

## Phase 1 — Foundation and real integration

- [x] Standalone TypeScript CLI, repeatable tests and JSON/Markdown output (v0.1.0).
- [x] Personal Devin plugin with `full-audit` skill; tested reading and executing via Devin Desktop.
- [x] My Balaton real build audited: 5 canonical pages passed, 0 canonical findings (user-reported result, not reproduced in this repository).
- [x] Review three reference repositories and their licenses; record adoption decisions (`REFERENCE_ADOPTION.md`).
- [x] Initialize central GitHub repository with current baseline.
- [x] Schema v2: finding statuses (`confirmed`, `needs-review`, `recommendation`), per-target check statuses (`passed`, `not-tested` included), explicit coverage counts, CLI v0.3.0 tool version and regression tests (PR A1; subject to merge).
- [ ] Full audit manifest: source commit, complete rule coverage, richer execution metadata and migration tooling.
- [ ] Project configuration and `quick` / `full` / `content` profiles.

## Phase 2 — Complete technical SEO MVP

- [x] Canonical local-build checks.
- [x] Initial local sitemap and robots.txt checks (v0.2.0, **partial validators**, not comprehensive standards parsers).
- [ ] Robust XML parsing / validated sitemap semantics and coverage tests; correct robots user-agent group precedence and crawl directives.
- [ ] Hreflang reciprocity, locale codes, x-default, canonical alignment.
- [ ] Title, meta description, H1–H6, meta robots and indexability indicators.
- [ ] Internal links / missing targets / orphan pages.
- [ ] JSON-LD parse/structure/schema checks and optional rendered checks.
- [ ] Images: formats, dimensions, alt, srcset/sizes, lazy/eager behavior.
- [ ] Framework-agnostic runner plus Astro-specific adapter; fault-injection fixtures.

## Phase 3 — Performance and AI professional review

- [ ] Playwright browser runtime and console/network failures.
- [ ] Lighthouse lab metrics; distinguish measured field metrics from lab estimates.
- [ ] Mobile and accessibility checks; manual exceptions documented.
- [ ] Content SEO and AEO/GEO reviews via skills, evidence tiers and cautious claims.
- [ ] Deduplicated findings, risk/impact ranking, fix planner and verification.

## Phase 4 — Optional Devin Dynamic Workflows

- [ ] Test local/cloud file access and cost implications.
- [ ] Pilot with only 2–3 specialist agents and one consolidator.
- [ ] Compare quality, latency and ACU usage against non-workflow audit.
- [ ] Save reusable workflow only if net benefit is demonstrated.

## Phase 5 — CI, regression and client delivery

- [ ] GitHub Actions automated tests/audits.
- [ ] Audit diffs and quality gates; deterministic manifest.
- [ ] Client-friendly HTML/PDF reports and screenshots.
- [ ] Optional Search Console integration.
- [ ] Independent validation on a second site.
- [ ] Next.js, WordPress and plain HTML adapters later.

## Acceptance gate before marketing as a full technical SEO audit

A single invocation processes expected HTML files; seeded bad fixtures demonstrate canonical, hreflang, schema and image findings; reports explicitly distinguish `passed` from `not-tested`; re-runs are comparable; the application source stays unchanged; CLI and Devin use the same test engine.
