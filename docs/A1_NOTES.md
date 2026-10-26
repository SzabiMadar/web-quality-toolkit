# A1 — Audit results and coverage schema v2

Changes proposed on `feat/a1-audit-results` for pull request review.

## Scope

- Add `src/report.ts` as a pure audit aggregation / Markdown report / exit-code module.
- Evolve `Finding.status` from `confirmed` only to `confirmed` | `needs-review` | `recommendation`.
- Add `CheckExecution[]` and `CoverageSummary` to the v2 report. Canonical checks are page-specific; sitemap and robots are site-level. Other nine major families appear explicitly as `not-tested`.
- Retain `passedPages` for backward compatibility, **canonical-only**.
- Reclassify missing robots.txt as informational recommendation, apparent global block as needs-review. External-origin sitemap directive also needs review, since cross-origin declarations can be legitimate.
- Keep prior CLI invocation and JSON / Markdown filenames.
- Exit code 0 for advice-only results; 1 for confirmed or review-worthy results; 2 for runtime errors.
- New tests in `tests/report.test.ts` cover schema, coverage, stable outputs, statuses and CLI exit behavior.

## Limitations and deliberate follow-ups

- A1 does **not** fix the currently incomplete robots group parser or sitemap XML parser. Their output is explicitly labeled partial.
- `schemaVersion: 2` is a compatibility **break** for strict v1-only consumers. Legacy top-level fields remain, but downstream consumers must understand new finding status values.
- The complete manifest (source commit and fuller test inventory), project configuration and quick/full/content profiles are not in A1 and remain unchecked in ROADMAP.md.
- This branch does not modify the Devin plugin. On merge, verify plugin v0.3.0 can parse the v2 JSON and still invoke the CLI successfully.
- **GitHub Actions CI passed** on 2026-10-26: Node.js 22 complete `npm test` and CLI/JSON-schema-v2 smoke test. [Verified workflow run](https://github.com/SzabiMadar/web-quality-toolkit/actions/runs/40370810223).

## Suggested PR review checklist

- [x] Run `npm test` on the branch checkout (GitHub Actions CI).
- [ ] Run a real Astro build audit and compare report v1 vs v2 (post-merge integration check).
- [ ] Confirm no customer files were changed.
- [ ] Verify new `not-tested` entries do not appear as successful checks.
- [ ] Confirm advice-only missing robots yields process exit 0.
- [ ] Validate the imported Devin plugin against the v2 CLI in Devin Desktop (post-merge integration check; cannot be run via GitHub CI).
