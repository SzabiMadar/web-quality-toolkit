# Web Quality Toolkit — Universal Website Audit Skillset

**A projekt elsődleges terméke egy hordozható AI-skillcsomag**, amelyet bármely weboldalprojekt átvizsgálásánál használhatsz Devin Desktopban, és a nyilvános SKILL.md fájlok alapján webes ChatGPT-ben vagy más agent környezetben is követhetsz. Az önálló TypeScript CLI megmarad opcionális, korlátozott technikai ellenőrzőként.

## Gyors indulás Devinben

**Devin plugin: web-audit v1.1.0.** A plugin gyökere: [plugins/web-audit](plugins/web-audit/).

Ha már korábban importáltad:

~~~bash
devin plugins update web-audit
devin plugins list
~~~

Ha nem frissíthető az adott Devin-verzióval, telepítsd újra a GitHub almappából:

~~~bash
devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit
~~~

Indíts friss Devin munkamenetet; ellenőrizd, hogy elérhető-e a **/web-audit:full-audit**, **/web-audit:technical-seo** és **/web-audit:aeo-geo** skill. A GitHubon végzett frissítés önmagában nem garantálja, hogy a helyi Devin-telepítés frissült.

**Mintaindító kérés:**

> Futtasd a /web-audit:full-audit skillt az aktuális weboldalprojekten. Csak olvass, semmit ne módosíts. SEO, AEO/GEO, performance és accessibility területeken csak ténylegesen elérhető adatból dolgozz; a hiányzó eszközök/ellenőrzések legyenek not-tested. Adj magyar nyelvű, URL-enként bizonyított és priorizált javítási tervet.

**19 önálló skill:**
full-audit, quick-audit, technical-seo, on-page-seo, international-seo, structured-data, internal-links, image-audit, performance, accessibility, content-seo, aeo-geo, local-seo, audit-report, sxo, ecommerce-seo, seo-drift, content-brief, agent-readiness.

Részletes telepítési és parancslista: [Plugin README](plugins/web-audit/README.md) és [Skillset használata](docs/SKILLSET_USAGE.md).

## Az új v1.1.0 képességek

A korábbi 14 skill mellé öt új modul került: **SXO (keresési szándék × felhasználói élmény)**, **e-commerce SEO**, **SEO-drift (valós baseline-összehasonlítás)**, **SEO content brief**, **AI-agent readiness**. A full-audit most a webhely valódi típusa alapján választja ki őket, nem futtat webshopos ellenőrzést minden projekten.

Három új, külső függőségek nélküli Node-eszköz: metadata-sablonminták, potenciálisan hivatkozás nélküli állítások és két meglévő audit-pillanatkép összehasonlítása. Egyik sem kér le internetes oldalakat. Használat és inputok: [TOOLS.md](docs/TOOLS.md).

**A CLI továbbra is v0.4.0.** A pluginban szereplő 19 skill eljárás; a CLI csak az általa megvalósított ellenőrzéseket futtatja.

## Webes ChatGPT

A Devin plugin nem települ automatikusan ChatGPT-be. Nyisd meg vagy add meg a GitHub-fájlokat, és használd az ehhez elkészített [ChatGPT projektutasítást](integrations/chatgpt/PROJECT_INSTRUCTIONS.md). A ChatGPT tényleges eszközelérése dönti el, mely vizsgálatok végezhetők el.

Codex / más agent: [integrációs útmutató](integrations/codex/README.md).

## Mi működik és mi nem?

| Funkció | Státusz |
|---|---|
| Skillalapú SEO, AEO/GEO, tartalom, hreflang, schema, accessibility, performance értelmezés | **Kész, eljárásként**; valós forrásokon ténylegesen alkalmazni kell |
| Devin plugin és 19 feladat-skill, közös protokoll és riportminta | **Elkészült**, 19 skill szerkezeti CI-validációval |
| Webes ChatGPT által olvasható módszertan | **Elkészült**; beolvasáshoz a GitHubhoz való tényleges hozzáférés kell |
| TypeScript CLI v0.4.0: canonical, alap sitemap és robots | **Meglévő, korlátozott** determinista ellenőrző |
| Automatikus hreflang, schema, image, CWV, WCAG, GEO hivatkozásmérés | **Nincs beépítve**; külső eszköz/adat vagy szakmai ellenőrzés kell |
| Éles ügyféloldal audit és Devin Desktopban való frissítés tesztje | **Külön validálandó** a saját környezetedben |

## Opcionális CLI (Node.js >=22.6)

A CLI **nem része** a telepített Devin plugin binárisainak; a forrásrepo és egy korábban generált, megbízható statikus site dist könyvtár kell hozzá:

~~~bash
npm test
npm run audit -- --dir /ABSOLUTE/PATH/TO/dist --site https://REAL-DOMAIN.example/ --out /SAFE/REPORT/PATH
npm run audit -- --config /ABSOLUTE/PATH/TO/web-quality.config.json
~~~

A valós ügyfél domainjét használd; a példák helyettesítendők. A CLI v0.4.0 quick = canonical, full = canonical/basic sitemap/basic robots, content = **nulla végrehajtott tartalmi teszt**. JSON schemaVersion 2 tartalmazza a coverage és manifest mezőket; a not-tested nem pass.

## Fejlesztési és szakmai referenciák

- [Teljes projektterv](docs/PROJECT_PLAN.md), [Roadmap](docs/ROADMAP.md), [Rule catalog](docs/RULE_CATALOG.md), [Repo referenciák](docs/REFERENCE_ADOPTION.md)
- [Skill közös módszertan](plugins/web-audit/references/AUDIT_PROTOCOL.md), [auditriport-sablon](plugins/web-audit/references/REPORT_TEMPLATE.md)
- https://github.com/coreyhaines31/marketingskills
- https://github.com/AgriciDaniel/claude-seo
- https://github.com/seoskillsai/seo-skills-ai

A skillek saját megfogalmazású módszertani adaptációk. Sem harmadik féltől származó szkripteket, sem fizetős API-t nem futtat automatikusan a plugin. Auditor munkában **read-only alapértelmezés**, mérési és jogosultsági korlátok őszinte jelzése.
