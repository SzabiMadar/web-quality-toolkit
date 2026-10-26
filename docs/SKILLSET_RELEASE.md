# Skillset v1.0.0 — what is complete and what isn't

## Delivered in this release

- Devin plugin with 14 standalone, evidence-first audit skills.
- Shared protocol, capability/tool matrix, client-report template, plugin-level AGENTS.md.
- Repeatable quick and full coordination, plus SEO, international, schema, links, images, performance, accessibility, local and AEO/GEO content review procedures.
- Setup guides for Devin Desktop, web ChatGPT and Codex usage.
- Node-based static validation for every SKILL.md and all required reference files, in GitHub CI.
- Existing CLI v0.4.0 deliberately preserved; no parser dependencies or new remote API introduced.

## Not claimed in this release

- A fully automated SEO/Screaming Frog clone, live URL crawler, paid platform data, or site-specific implementation fixes.
- True performance metrics without Lighthouse/CrUX, WCAG compliance from static markup, Search Console indexing or actual AI citations without samples.
- Automatic installation in web ChatGPT or confirmation of the user's installed Devin Desktop state.
- Integration tests against a real client's repository, which requires real project access and deployment environment.

## Release gate

1. npm test passes (existing CLI regression suite + skill packaging validator).
2. Devin manifest and all skill metadata/relative references exist.
3. A fresh Devin install/update must be performed **by the user on their environment**, then one full-audit and one focused skill test against their own project.
4. If a skill fails to load, correct metadata/path and repeat CI; never claim remote install success based on GitHub alone.

The abandoned experimental B1 parser branch is not part of this plugin release. Do not merge it merely to deliver the skills.
