# Optional local verification helpers (WQT skillset v1.1)

These Node.js utilities work on files you provide; they do **not** fetch URLs, install packages, modify the audited site, infer Google rankings or verify real AI citations. Run them only on data you have permission to process. They supplement the 19 portable skills and don't replace professional review.

Requires Node.js >=22.6. All commands are executed **from the toolkit repository root**.

## 1. Metadata template candidates

Prepare a JSON array of actually inspected pages:

~~~json
[
  {"url":"https://example.com/hu/","title":"Szolgáltatások","description":"Egyedi, tényszerű bemutatkozás."},
  {"url":"https://example.com/en/","title":"Services","description":"A unique, useful description."}
]
~~~

Run:

~~~bash
node scripts/check-metadata.mjs /ABSOLUTE/PATH/pages.json
~~~

Finds missing input values, repeated titles/descriptions, title echoes and a few generic HU/EN CTA tails. These are **needs-review/recommendation** candidates. A duplicate title can be legitimate (e.g. canonicalized duplicates); no universal title-length rule is enforced.

## 2. Candidate factual claims / nearby citation syntax

~~~bash
node scripts/check-claims.mjs /ABSOLUTE/PATH/article.txt
~~~

Recognizes some Hungarian/English numerical, comparative and authority phrases and checks whether a nearby URL/Markdown or HTML hyperlink/footnote *syntax* is present. **Does not fact-check** the assertion, confirm source reliability, check that a URL exists, or guarantee complete Hungarian language coverage. The output names this limitation and uses recommendation/needs-review, never an automated truth verdict.

## 3. Before/after SEO snapshot diff

Supply both baseline and current JSON with the **same URL, evidence surface and actual observation times**:

~~~json
{
  "url":"https://example.com/",
  "capturedAt":"2026-10-01T12:00:00Z",
  "surface":"build",
  "canonical":"https://example.com/",
  "title":"Home",
  "noindex":false,
  "h1":["Welcome"],
  "schemaTypes":["Organization"]
}
~~~

~~~bash
node scripts/compare-snapshots.mjs /ABSOLUTE/PATH/baseline.json /ABSOLUTE/PATH/current.json
~~~

Supported observed comparison fields: canonical, noindex, title, metaDescription, h1, h2, schemaTypes, ogTags, contentHash and responseStatus. Each difference is **needs-review** until an auditor establishes whether the change is intentional/harmful. A field absent from one side is **not comparable** and never automatically treated as removed. No scheduled capture, remote network or CWV comparison is embedded.

## Test command

~~~bash
npm test
npm run test:tools
npm run test:skills
~~~

All utilities exit 0 for successful analysis (even if they find advisory items) and 2 on usage or input errors. Do not use their exit code as an SEO compliance gate without a separately designed, user-approved policy.

## How the agent should use them

Full-audit chooses the relevant specialist; the specialist uses optional local helpers only when actual input exists. The AI report states **which tool actually ran**, source file, method, sampled URLs and limitations. No new dependency, Python environment or paid API was added.
