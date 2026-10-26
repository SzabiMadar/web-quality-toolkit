# Web Quality Toolkit — v0.2.0 — technical SEO MVP

Portable, dependency-free TypeScript canonical, sitemap and robots.txt audit for static/Astro builds, plus a Devin plugin with one reusable skill.

## Requirements
- Node.js >= 22.6 (recommended Node.js 22 or newer)
- npm
- Existing static HTML output (`dist/`) from a trusted project

## Try it

```bash
npm test
npm run audit -- --dir /path/to/my-balaton/dist --site https://YOUR-REAL-DOMAIN/ --out /path/to/my-balaton/audits/latest
```

The `--site` URL **must** match the actual canonical production origin and any subpath. Do not use placeholder domains for customer reports.

Output: `findings.json`, `summary.md`.
Exit status: `0` no findings, `1` issues found, `2` execution problem.

This version recognizes `sitemap.xml` and Astro-style `sitemap-index.xml` + local `sitemap-N.xml` files. Child sitemap files outside the static build are flagged as not locally inspectable. `robots.txt` is technically optional; its absence is currently reported as an advisory finding, not a search-engine indexing failure.

This version assumes Astro `directory` output: `about/index.html` corresponds to `/about/`. With `file` output, a literal `about.html` URL is expected. Redirect aliases and intentionally non-self-canonical pages are currently flagged for manual review; more advanced indexing policies are planned.

## Devin plugin local test

```bash
devin plugins install --local ./plugins/web-audit
devin plugins list
```

Start a fresh Devin Agent session in Devin Desktop and invoke `/web-audit:full-audit` (or ask Devin to use the skill). A plugin stored in a GitHub subdirectory can later be installed with `devin plugins install owner/repo#plugins/web-audit` after publishing the repository. That remote install affects your personal Devin plugin scope by default.

**Plugin alone does not install the CLI.** Keep the toolkit in a central location accessible to Devin, or later publish the CLI as an npm package. This first milestone intentionally does not bundle an executable installer or a Dynamic Workflow.

## Constraints / not yet implemented
- Canonical parser is a pragmatic link-tag/attribute matcher, not a browser-grade HTML parser.
- Non-self-canonical URLs, redirect aliases and pagination rules require policy support.
- No request to the public site is made. All checks are on local generated HTML.
- No image, hreflang, schema, remote crawl, Lighthouse, GEO or AI analysis is included yet.
- Sitemap parsing supports common Astro XML shapes but is not a full validating XML parser.
- `passedPages` counts canonical successes only; other checks report findings separately.
- Plugin v0.1.0 was previously recognized successfully by Devin Desktop. After upgrading to v0.2.0, validate its refreshed instructions in Devin.

## Security
Audit output can contain URLs and HTML-derived attribute values. Review before sharing client reports. Do not run untrusted project build scripts without approval.

## Publishing a public GitHub repository

After reviewing files (the toolkit includes no client code), create a new **public**, empty repository named `web-quality-toolkit` at https://github.com/new. On your own Windows machine, run from `D:\tools\web-quality-toolkit`:

```powershell
git init
git branch -M main
git add .
git commit -m "feat: canonical, sitemap and robots SEO audit v0.2.0"
git remote add origin https://github.com/YOUR_USERNAME/web-quality-toolkit.git
git push -u origin main
```

Replace YOUR_USERNAME with the actual GitHub login. Use your usual GitHub authentication; never paste tokens into chat. Git repository publishing is a separate action from installing the Devin ZIP plugin.
