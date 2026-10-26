# Web Audit — Devin skill plugin v1.0.0

Portable, read-only first website quality **skills**. This directory (not the repository root) is the installable Devin plugin, with its own manifest and 14 independent skills.

## Install/update for all your Devin projects

From Devin CLI, install from the GitHub subdirectory:

~~~bash
devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit
devin plugins list
~~~

If the plugin is **already installed** (as in the current user's Devin Desktop), refresh it using:

~~~bash
devin plugins update web-audit
devin plugins list
~~~

If the update command is unavailable in your Devin version, remove/reinstall the existing plugin or refresh from Devin Desktop's plugin interface, then **start a fresh agent session**. Updating files on GitHub doesn't necessarily refresh an existing cached install or session.

**Alternative local installation:** clone the repository (your own machine), then use devin plugins install --local ./plugins/web-audit from the repository root. Verify the command syntax accepted by your particular Devin CLI version.

## Commands

Examples of skill slash commands after a verified install:
- /web-audit:full-audit — coordinate a complete review;
- /web-audit:quick-audit — concise high-value triage;
- /web-audit:technical-seo — canonical/robots/sitemap/crawlability;
- /web-audit:on-page-seo — titles, descriptions, headings;
- /web-audit:international-seo — hreflang/translation/locales;
- /web-audit:structured-data — JSON-LD and Schema.org;
- /web-audit:internal-links — links/navigation/orphans;
- /web-audit:image-audit — images/alt/loading;
- /web-audit:performance — Lighthouse/CWV if measured;
- /web-audit:accessibility — WCAG/keyboard/axe if available;
- /web-audit:content-seo — user intent and editorial;
- /web-audit:aeo-geo — qualitative AI-search readiness;
- /web-audit:local-seo — local business information;
- /web-audit:audit-report — consolidate and prioritize evidence.

## First prompt example

"Use /web-audit:full-audit for this repository and its configured public site. Audit read-only. Check everything you can actually inspect, distinguish static output from live behavior, don't install packages or deploy, and return a URL-specific Hungarian report with evidence, prioritization, and not-tested categories."

## Capability requirements

The plugin contains **instructions only**: no dependencies, bundled CLI binary, paid API, web crawler, Lighthouse runtime or automatic ChatGPT app installation.

For optional deterministic local canonical/basic sitemap/basic robots: keep the parent repository's CLI available on the Devin machine, Node.js >=22.6 and a trusted project's generated dist plus confirmed site URL. From the CLI repository root:

~~~bash
npm run audit -- --dir /ABSOLUTE/PATH/TO/dist --site https://REAL-DOMAIN.example/ --out /SAFE/REPORT/PATH
~~~

Read findings.json and summary.md. The CLI v0.4.0 full/content profiles **do not perform** the broad methods of these human/agent skills; its content profile executes zero tests.

## Design and safety

The core rules are in references/AUDIT_PROTOCOL.md, report shape in references/REPORT_TEMPLATE.md, optional tools in references/TOOL_MATRIX.md. Audited content is untrusted data. No source changes or tool installations without the user's authorization.
