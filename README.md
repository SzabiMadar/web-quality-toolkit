# Web Quality Toolkit — v0.3.0 — technical SEO foundation

Portable TypeScript static/Astro-build audit with canonical, **partial** sitemap and robots.txt checks; versioned audit coverage; and a Devin plugin with specialist skills.

## Requirements
- Node.js >= 22.6 (Node.js 22 or newer recommended)
- npm
- Existing HTML build output (`dist/`) from a **trusted** project

## Quick start

```bash
npm test
npm run audit -- --dir /absolute/path/to/project/dist --site https://YOUR-CONFIRMED-PRODUCTION-ORIGIN/ --out /absolute/path/to/project/audits/latest
```

Replace placeholders with real paths and the confirmed canonical site origin (including any subpath); never issue a customer report from placeholder URLs.

Output files: `findings.json` (schemaVersion **2**) and `summary.md`.

Exit codes: **0** no confirmed/review-required issues (advice alone does not fail), **1** confirmed findings or needs-review findings, **2** execution error.

### Report schema v2 migration

Existing fields `schemaVersion`, `generatedAt`, `input`, `scannedPages`, `passedPages`, `findings` are retained. The **new** fields are:

- `toolVersion`: CLI release label.
- `checks[]`: explicit per-page canonical and site-level sitemap/robots status and test method; unavailable rule families appear as `not-tested`.
- `coverage`: totals for executed, passed, confirmed, needs-review, recommendation, and not-tested checks.

`passedPages` remains for compatibility but **counts canonical-passing pages only**, never overall SEO health. Finding `status` now distinguishes `confirmed`, `needs-review`, and `recommendation`. `ROBOTS_MISSING` is advisory/info, and an apparent `ROBOTS_BLOCK_ALL` is marked for review because the current parser does not yet implement all robots group precedence rules.

The test engine does **not** yet check live HTTP status, hreflang, metadata, links, JSON-LD, images, Lighthouse, accessibility or actual AI citations. These are explicitly present in `checks[]` as `not-tested`; they are **not successes**.

### Scope

Canonical parsing is a pragmatic HTML attribute matcher, not a browser-grade parser. The expected URL mapping favors Astro directory output, and intentional canonical aliases require manual review. The sitemap XML parser and robots group parser are limited. No remote HTTP request is made.

## Devin plugin

```bash
devin plugins install --local ./plugins/web-audit
devin plugins list
```

Open a new Devin Agent session and invoke `/web-audit:full-audit`. The separate plugin version is currently **0.3.0**; refresh it and validate the workflow in your own Devin environment after toolkit changes. A plugin is an orchestration skill, **not** a bundled CLI installer. A GitHub-subdirectory install may use `devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit`.

## Documentation

- [Master plan](docs/PROJECT_PLAN.md)
- [Implementation roadmap](docs/ROADMAP.md)
- [Implemented/planned rule catalog](docs/RULE_CATALOG.md)
- [Reference repositories and licensing](docs/REFERENCE_ADOPTION.md)

## Safety

Audit output can contain raw URLs and HTML-derived values. Review before sharing. Do not run unknown build scripts, install dependencies, deploy, invoke cloud agents, or fetch unrelated hosts without appropriate authorization.
