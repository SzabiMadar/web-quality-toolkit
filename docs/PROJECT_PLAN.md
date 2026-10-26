> **Fókuszfrissítés — 2026-10-26:** Az elsődleges termék most a **hordozható Web Audit skillset v1.0.0**, nem egy új SEO crawler. A 14 Devin skill, a közös protokoll, riportminta és a ChatGPT/Codex használati útmutató elkészült. A TypeScript CLI v0.4.0 opcionális segédeszköz marad. Az alábbi korábbi, teljes technikai automata motorra vonatkozó feladatok **nem automatikusan készültek el**; szükség esetén külön termékfejlesztésként kezeljük őket.

# Web Quality Toolkit — teljes projektterv

> **Verzió:** Concept 1.1 — 2026. október 26.  
> **Projekt:** https://github.com/SzabiMadar/web-quality-toolkit  
> **Nyelv:** magyar  
> **Rendeltetés:** tartós projektleírás ChatGPT, Codex és Devin számára.  
> **Kapcsolódó fájlok:** [ROADMAP.md](./ROADMAP.md), [RULE_CATALOG.md](./RULE_CATALOG.md), [REFERENCE_ADOPTION.md](./REFERENCE_ADOPTION.md).

Ez a dokumentum rögzíti a Web Quality Toolkit célját, MVP-jét, technikai architektúráját, a referenciaként vizsgált nyílt forráskódú projekteket, a GitHubon ténylegesen meglévő implementációt és a fejlesztés következő lépéseit.

**Fejlesztési frissítés (2026-10-26):** az A1 (CLI v0.3.0) és az A2 (CLI v0.4.0) implementációja elkészült. Az A2 JSON-konfigurációt, quick/full/content profilokat és auditmanifestet vezet be. A működő technikai SEO-szabályok változatlanul a canonical, alap sitemap és alap robots körre korlátozódnak. A későbbi AEO/GEO és Content-futtatás továbbra is tervezett. **Nem állítja, hogy a tervezett funkciók már működnek.** Az eredeti, ideiglenes beszélgetés nem érhető el; a tervezet a repóban megőrzött döntésekből és a frissen ellenőrzött referenciákból készült.

## 1. Mi a feladat, és miért építjük?

Egy saját, általánosan újrafelhasználható **weboldal-minőségellenőrző és SEO/AEO/GEO auditáló eszköztárat** fejlesztünk TypeScriptben. Először statikus, különösen **Astro** weboldalakhoz készül, majd más keretrendszerekre és élő weboldalakra bővíthető.

**A megoldandó probléma:** a technikai SEO, a tartalmi SEO, a teljesítmény, az akadálymentesség és az AI-keresőkre történő felkészítés vizsgálata jelenleg több eszközt és sok kézi munkát igényel. A különböző vizsgálatok eredményeit nehéz bizonyítható, egységes ügyfélriporttá és javítási tervvé alakítani.

A saját toolkit feladata:

1. A bizonyítható hibák objektív, megismételhető feltárása.
2. Eredmények és ellenőrzési korlátok közös adatszerkezetbe foglalása.
3. Szakmai AI-skillekkel végzett értelmezés és javítási javaslat.
4. Újrafuttatható ellenőrzés és később regressziófigyelés.
5. Saját webfejlesztési és SEO-szolgáltatások támogatása.
6. Hosszabb távon opcionális önálló fejlesztői termék, de **nem most építünk SaaS-t**.

A központi érték nem egy újabb SEO-pontszám, hanem a **valóban lefuttatott tesztekből származó, visszaellenőrizhető eredmény**.

## 2. Alapelvek

- **TypeScript a központban.** A tényleges ellenőrző logika ne függjön Devintől, ChatGPT-től, Codextől vagy más AI-platformtól.
- **Determinista ellenőrzés először.** A canonical, sitemap, hreflang és hasonló technikai hibákat lehetőleg kód állapítsa meg. Az AI magyarázzon, priorizáljon, de ne találjon ki mérést.
- **Alapértelmezetten csak olvasás.** Audit nem módosítja az ügyfél forráskódját. Build, telepítés, külső lekérés, deployment, fizetős API és agentfuttatás a megfelelő jóváhagyással történhet.
- **Őszinte lefedettség.** A ki nem próbált ellenőrzés állapota „not-tested”, nem „passed”.
- **Minden hibához bizonyíték.** Szabályazonosító, fájl/URL, megfigyelt és elvárt érték, tesztmódszer, szakmai hivatkozás.
- **Moduláris kialakítás.** Közös auditmotor, külön szabályok, bemeneti adapterek, riportkészítők és AI-skillek.
- **Függőségek tudatos kezelése.** Kiforrott HTML-, böngésző- és accessibility-eszközök használata megengedett, de minden új függőséget licenc, karbantartás, méret, Node-kompatibilitás és tesztlefedettség alapján kell értékelni.
- **Biztonság.** A HTML és a külső GitHub-skillek nem megbízható utasítások; ügyféladatokat, titkokat nem mentünk nyilvános riportba.

## 3. Mi az MVP?

### 3.1. Már elkészült: korlátozott technikai SEO-MVP (CLI v0.2.0)

Bemenet: a weboldal statikus buildkönyvtára (általában dist), a **ténylegesen használt** publikus origin és a riportcélkönyvtár.

Működő ellenőrzéscsaládok:

- **Canonical:** hiányzó, többszörös, érvénytelen, nem elvárt URL-re mutató canonical.
- **Sitemap:** sitemap.xml; Astro sitemap-index.xml és helyi sitemap-N.xml; URL-lista és generált HTML-oldalak alapvető összevetése.
- **Robots:** robots.txt jelenléte, egyszerű globális tiltás és sitemap-direktívák.
- **Kimenet:** findings.json és summary.md, valamint 0 / 1 / 2 process exit code.

Az XML/robots parserek részlegesek; a jelenlegi implementáció **nem teljes körű technikai SEO-audit**.

### 3.2. Következő cél: megbízható, szélesebb technikai SEO-MVP (MVP-1)

Az MVP-1-hez ezek szükségesek:

- Verziózott, közös eredményséma, kifejezett „végrehajtott” és „nem tesztelt” állapotokkal.
- Auditmanifest (programverzió, konfiguráció, időbélyeg, futtatott és kihagyott szabályok).
- Gyors / teljes / tartalmi profil és projektkonfiguráció.
- Megbízható HTML/XML-feldolgozás és korrektebb robots szabályértelmezés.
- Canonical kivételek, Astro directory/file output, subpath és URL-policy.
- Hreflang és kölcsönös nyelvi hivatkozások.
- Title, meta description, headingek, meta robots és indexelési jelzések.
- Belső linkek, hiányzó célpontok és árva oldalak.
- JSON-LD szintaxis és szerkezeti validáció.
- Képek: alt, méret, responsive attribútumok és betöltési tulajdonságok.
- Automatizált tesztek valószerű, szándékosan hibás fixture-ökkel.
- Érthető, reprodukálható, priorizálható auditriport.

**Elfogadási feltétel:** legalább két különböző valós weboldalon (köztük egy kétnyelvűn) működjön, a szándékosan előállított canonical/hreflang/schema/kép hibákat találja meg, a ki nem futtatott ellenőrzésekről ne állítson megfelelést, és semmilyen alkalmazásforrást ne módosítson.

**Nem része az MVP-1-nek:** SaaS, teljes internetes crawler, élő Google-indexelési bizonyíték, önálló SERP/rank tracker, megvásárolt SEO-adatbázis és tényleges AI-idézések automatikus mérése.

## 4. Technikai felépítés

1. **Core Engine (TypeScript/Node):** szabályok, URL-kezelés, ellenőrzések végrehajtása, eredmények összesítése.
2. **Input adapterek:** először statikus HTML és Astro build; később böngészőben renderelt oldal és szabályozott távoli crawl.
3. **Rules:** külön canonical, sitemap, robots, hreflang, metadata, links, schema, images, accessibility és performance modulok.
4. **Reporter:** egységes JSON, Markdown; később HTML, PDF, audit-különbségek.
5. **Agent/skill réteg:** Devin plugin, később Codex/ChatGPT-illesztés. Mindenki ugyanazt a Core Engine-t használja.
6. **CI:** később GitHub Actions és regressziós kapuk.
7. **Jóváhagyási határ:** a hibafeltárás és a forráskód automatikus javítása két külön művelet.

### 4.1. A tervezett eredménykezelés

Jelenleg a src/types.ts Finding típusa csak a „confirmed” státuszt ismeri. Az MVP-1-ben a következő státuszokra van szükség:

- **passed:** a szabály ténylegesen lefutott és az adott célon teljesült.
- **confirmed:** bizonyított hiba vagy észlelt probléma.
- **needs-review:** emberi vagy további technikai ellenőrzés szükséges.
- **recommendation:** szakmai fejlesztési javaslat, nem bizonyított hiba.
- **not-tested:** az ellenőrzés nem futott le vagy az adat nem áll rendelkezésre.

A státusz és a súlyosság két külön dimenzió legyen.

Például egy hiányzó robots.txt fájl nem szükségszerűen indexelési hiba; ezt nem szabad automatikusan „high severity confirmed SEO blocker”-nek nevezni.

**Fontos architekturális részlet:** ugyanaz a szabály tíz oldalon sikeres és egyen sikertelen lehet. Ezért külön kell modellezni a szabályfuttatás **lefedettségét**, és külön az egyedi problémákat.

Tervezési példa — még **nem implementált**:

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
  testMethod: string;
  evidence?: Record<string, string | number | boolean | null>;
  observed?: string;
  expected?: string;
  referenceUrl?: string;
}
~~~

Ez szemléltető modell. Az implementáció előtt a szabály-, oldal- és audit-szintű eredményeket részletesen szét kell választani, és meg kell határozni a séma migrációját.

## 5. Referenciaként használt GitHub-projektek

A következő repositorik létezését, GitHub-csillagszámát, licencét és az aktuális fejlesztési aktivitást **2026. október 26-án** ellenőriztük. A csillagok a közösségi érdeklődés mutatói, **nem független minőségi vagy biztonsági tanúsítványok**. A konkrét, futó verziók licencét és API-ját bevezetés előtt újra ellenőrizni kell.

### 5.1. Az eredetileg kiválasztott három SEO/AI-skill referencia

| GitHub repository | Csillag (ellenőrzéskor) | Licenc | Mire használjuk? |
|---|---:|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 56 638 | MIT | **Elsődleges tartalmi SEO és AI SEO referencia:** seo-audit, ai-seo, schema skillek |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 21 886 | MIT | **Elsődleges technikai SEO módszertani referencia:** sitemap, hreflang, schema, modulok, riportolás |
| [seoskillsai/seo-skills-ai](https://github.com/seoskillsai/seo-skills-ai) | 20 | MIT | Többagent-platformos skillarchitektúra **mintája**, de nem tekintjük széles körben validáltnak |

**Szabály:** a harmadik féltől származó AI-skilleket nem futtatjuk automatikusan. A saját skilljeink önállóan megírt módszertant tartalmaznak. A külső SEO-állításokat hivatalos dokumentációval ellenőrizzük.

### 5.2. Kiforrott technikai eszközök — az egyes feladatokhoz

| GitHub repository | Csillag | Licenc | Feladat | Bevezetési döntés |
|---|---:|---|---|---|
| [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio) | 30 532 | MIT | HTML/XML feldolgozás | **Korán kipróbálandó**, megbízható DOM-kiválasztásra |
| [inikulin/parse5](https://github.com/inikulin/parse5) | 3 940 | MIT | HTML5 szabványkövető parser | Korai alternatíva a regex-alapú feldolgozó helyett |
| [ekalinin/sitemap.js](https://github.com/ekalinin/sitemap.js) | 1 709 | MIT | Sitemap segédeszközök | API-vizsgálat; elsősorban generáló library, nem feltétlenül teljes validátor |
| [samclarke/robots-parser](https://github.com/samclarke/robots-parser) | 168 | MIT | robots.txt parser | Szűk, célzott használatra kiértékelendő |
| [JustinBeckwith/linkinator](https://github.com/JustinBeckwith/linkinator) | 1 277 | MIT | Hibás linkek és belső/külső hivatkozások | **Erős integrációs jelölt** CLI/API szinten |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | 30 950 | Apache-2.0 | Laboratóriumi performance, accessibility, SEO | Későbbi böngészős auditmodul |
| [harlan-zw/unlighthouse](https://github.com/harlan-zw/unlighthouse) | 4 916 | MIT | Teljes webhelyre kiterjesztett Lighthouse | **Erős jelölt** későbbi site-wide performance-hoz |
| [microsoft/playwright](https://github.com/microsoft/playwright) | 98 565 | Apache-2.0 | Renderelt DOM, konzol- és hálózati hibák | Későbbi böngészőadapter |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | 7 710 | MPL-2.0 | Objektív akadálymentességi tesztek | Későbbi integráció; automatizált WCAG-lefedettség korlátozott |
| [pa11y/pa11y](https://github.com/pa11y/pa11y) | 4 585 | LGPL-3.0 | Accessibility CLI audit | Alternatíva/benchmark; redisztribúciós licencet vizsgálni kell |
| [apify/crawlee](https://github.com/apify/crawlee) | 26 269 | Apache-2.0 | Nagyobb TypeScript-alapú crawler | **Halasszuk**, amíg az élő crawler valóban szükséges |
| [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) | 7 117 | Apache-2.0 | Lighthouse regresszió CI-ben | Későbbi GitHub Actions támogatás |
| [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) | 8 660 | Apache-2.0 | Valós böngészőoldali teljesítménymutatók mérése | Opcionális field instrumentation; nem Lighthouse-helyettesítő |
| [google/schema-dts](https://github.com/google/schema-dts) | 1 252 | Apache-2.0 | Schema.org JSON-LD TypeScript típusok | Opcionális típussegéd; **nem** JSON-LD szemantikai validátor |

### 5.3. Egész terméket bemutató benchmarkok — nem függőségek

| Repository | Csillag | Licenc | Miért érdemes tanulmányozni? |
|---|---:|---|---|
| [every-app/open-seo](https://github.com/every-app/open-seo) | 25 042 | MIT | Összetett SEO-platform felépítése, riportok és UX; az MVP-nél jóval nagyobb scope |
| [PhialsBasement/LibreCrawl](https://github.com/PhialsBasement/LibreCrawl) | 1 076 | MIT | Teljes site crawl, auditdashboard, export; főleg Python alapú |
| [StJudeWasHere/seonaut](https://github.com/StJudeWasHere/seonaut) | 839 | MIT | Sitewide technikai SEO-hibák csoportosítása és megjelenítése |

Ezek inspirációt adnak; nem tervezzük a teljes termékük beágyazását vagy lemásolását.

### 5.4. A szabályok elsődleges hivatalos forrásai

- [Google Search Central](https://developers.google.com/search/docs)
- [Google canonical útmutató](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google nemzetközi / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Sitemaps XML protokoll](https://www.sitemaps.org/protocol.html)
- [Schema.org](https://schema.org/)
- [Astro](https://docs.astro.build/)
- [W3C WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

**Bevezetési döntési szabály:** minden külső könyvtárnál dokumentáljuk a konkrét funkciót, korlátokat, Node-kompatibilitást, függőségeket, licencfeltételeket, verziót, költséget és a saját Finding sémába történő integrációt. **Nem telepítjük automatikusan az összes felsorolt csomagot.**

## 6. Mit csinál most a GitHub-repo?

**Ellenőrzött állapot 2026-10-26:**

| Terület | Állapot | Bizonyíték |
|---|---|---|
| TypeScript CLI, JSON/Markdown kimenet | **Kész, v0.2.0** | src/cli.ts, package.json |
| Canonical | **Működő alapváltozat** | src/canonical.ts |
| Sitemap / Astro sitemap index | **Részleges, működő** | src/sitemap.ts |
| Robots.txt | **Részleges, működő** | src/robots.ts |
| Tesztfájlok és fixture-ök | **Megvannak** | tests/, fixtures/ |
| Devin plugin | **0.3.0, importálva a felhasználó szerint** | plugins/web-audit/ |
| Full audit skill | **Megvan** | plugins/web-audit/skills/full-audit |
| Technical SEO skill | **Megvan** | plugins/web-audit/skills/technical-seo |
| AEO/GEO skill | **Kvalitatív útmutató, nem automata teszt** | plugins/web-audit/skills/aeo-geo |
| Közös pass/not-tested eredményséma | **Hiányzik** | src/types.ts jelenleg csak confirmed |
| Hreflang, metadata, links, schema, images | **Még nincs implementálva** | RULE_CATALOG.md |
| Playwright, Lighthouse, accessibility futtatók | **Még nincs implementálva** | ROADMAP.md |
| HTML/PDF ügyfélriport, CI, audit diff | **Tervezett** | ROADMAP.md |

A projekt tesztjeit ebben a dokumentációs körben **nem futtattuk újra**.

A My Balaton projekt korábbi, tulajdonos által jelzett eredménye: 5 canonical ellenőrzés sikeres, 0 canonical hiba. Ezt a számot nem reprodukáltuk most.

## 7. Hogyan használjuk?

### 7.1. Lokális Astro/static audit

A toolkit gyökérkönyvtárából:

~~~bash
npm test
npm run audit -- --dir /valos/projekt/dist --site https://valos-eles-domain.hu/ --out /valos/projekt/audits/latest
~~~

A példaként megadott domain és útvonal lecserélendő. A site URL a tényleges canonical origin legyen; az audit **nem élő weboldal-crawl**, hanem a meglévő build ellenőrzése.

Munkafolyamat:

1. Projekt, build output és éles domain azonosítása.
2. Build létezésének ellenőrzése; scriptfuttatáshoz megfelelő jóváhagyás.
3. CLI audit.
4. JSON + Markdown eredmények feldolgozása.
5. Bizonyított hibák elkülönítése a figyelmeztetésektől és ki nem próbált ellenőrzésektől.
6. Javítási terv készítése.
7. Jóváhagyott javítás az alkalmazás saját repositoryjában.
8. Újrafuttatás és eredmények összehasonlítása.

### 7.2. Devin plugin

Lokális telepítési parancs:

~~~bash
devin plugins install --local ./plugins/web-audit
devin plugins list
~~~

Új Devin Agent munkamenetben a skill: **/web-audit:full-audit**.

A GitHubról történő telepítés lehetséges formája:

~~~bash
devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit
~~~

**Korlát:** a plugin önmagában nem telepíti a TypeScript CLI-t, és nem ad automatikusan hozzáférést más projektek fájljaihoz. A legutóbbi Devin pluginfrissítést (0.3.0) a saját Devin környezetben külön érdemes regressziótesztelni.

### 7.3. Későbbi ChatGPT/Codex és CI

A platformintegrációk egyazon CLI-n és JSON-adatformátumon osztoznak. Nem készítünk párhuzamos, egymástól eltérő auditlogikákat AI-agentenként.

## 8. Fejlesztési roadmap — prioritással

### A. fázis: közös eredménymodell (A1 és A2 teljesítve, további bővítés később)

- [x] A Finding modell áttervezése.
- [x] Állapotok: passed, confirmed, needs-review, recommendation, not-tested.
- [x] Súlyosság és végrehajtási státusz elválasztása.
- [x] Szabálycsaládok és canonical URL-ek végrehajtási lefedettsége (A1).
- [x] Auditmanifest: tool/schema-verzió, profil, futtatott/kimaradt tesztek, Node-verzió és opcionális commit SHA (A2).
- [x] A1 schemaVersion 2, az A2 során additív manifestbővítés.
- [x] JSON-konfiguráció, quick/full/content profilok, include/exclude szabályválasztás (A2).
- [x] Regressziós tesztek GitHub Actions alatt.

**Elfogadási feltétel:** minden régi modul az új közös eredményrendszerben működik; a ki nem tesztelt szabály soha nem válik automatikusan sikeressé; a riport megmutatja a lefedettséget.

### B. fázis: robusztus technikai SEO-ellenőrzések

- [ ] Cheerio/parse5 célzott összehasonlítása; megfelelő HTML-parser kiválasztása.
- [ ] XML/sitemap feldolgozás javítása, gyermek-sitemap és URL-policy.
- [ ] Robots user-agent csoportok, allow/disallow precedenciák.
- [ ] Canonical szabályok: aliasok, kivételek, Astro file/directory output.
- [ ] Hreflang szintaxis, reciprocity, x-default, canonical-alignment.
- [ ] Title, meta description, heading, meta robots és indexability.

**Elfogadási feltétel:** jó és hibás magyar–angol fixture-ök, reprodukálható eredmények, dokumentált kivételek.

### C. fázis: teljes lokális technikai SEO-MVP

- [ ] Belső linkgráf, hiányzó céloldalak, árva oldalak.
- [ ] JSON-LD szintaxis és struktúra; nem ígérünk rich result jogosultságot pusztán szintaxis alapján.
- [ ] Képek: alt, dimensions, srcset/sizes, loading.
- [ ] Duplikált hibák összevonása.
- [ ] Fontosság és javíthatóság szerinti prioritások.
- [ ] Két különböző valós oldal tesztelése, egyik kétnyelvű.
- [ ] Dokumentált korlátok és konfigurálható kivételek.

**Elfogadási feltétel:** hibás fixture-ökkel igazolt canonical/hreflang/schema/image ellenőrzések, stabil riport, forráskód módosítása nélkül.

### D. fázis: böngésző és AI-szakmai elemzés

- [ ] Engedélyezett, korlátozott élő HTTP crawl és redirect / status vizsgálatok.
- [ ] Playwright böngészőfuttató, JS/network hibák, renderelt DOM.
- [ ] Lighthouse vagy Unlighthouse teljesítménymérés.
- [ ] axe-core vagy Pa11y automatikus akadálymentességi vizsgálat, manuális határok.
- [ ] Tartalmi SEO/AEO/GEO szakmai felülvizsgálat látható bizonyítékkal.
- [ ] Megkülönböztetett lab és valódi felhasználói teljesítménymutatók.
- [ ] **Nem állítunk tényleges AI-keresős idézést tartalmi heurisztikából.**

### E. fázis: CI, riportok és szolgáltatás

- [ ] GitHub Actions és ellenőrzési kapuk.
- [ ] Audit-diff és regressziófigyelés.
- [ ] Ügyfélbarát HTML/PDF riport.
- [ ] Képernyőképes bizonyítékok.
- [ ] Opcionális Search Console integráció.
- [ ] Multi-agent Devin Dynamic Workflow csak mért haszon esetén.
- [ ] Más frameworkök, ügyfélhasználat, és csak utána külön termék/szolgáltatás.

## 9. Következő konkrét fejlesztési feladat (A1)

**Feladat:** az audit-eredmény- és lefedettségi modell megvalósítása **minden új SEO-szabály hozzáadása előtt**.

Javasolt lépések:

1. Meglévő src/types.ts és CLI-output egyeztetése a report kontraktusával.
2. CheckExecution és Finding elkülönítése (egy szabály több oldalt is tesztelhet).
3. Új schemaVersion, determinisztikus reportmezők és explicit lefedettség.
4. A jelenlegi canonical/sitemap/robots modulok migrálása.
5. A „hiányzó robots.txt” jellegű tanácsadó megállapítások korrekt státusza.
6. Tesztek: pass, failure, skipped, needs-review, advisory, részleges oldal-lefedettség.
7. README, ROADMAP és RULE_CATALOG frissítése a tényleges implementáció után.
8. **Javasolt munkamenet:** rövid fejlesztői branch, tesztek, PR, majd merge; ne írjuk át észrevétlenül a main forráskódját.

A1 kész, ha a jelenlegi tesztfunkciók megmaradnak, a riport nem állít teljes SEO-megfelelést, és az új ellenőrzések ugyanarra a szerződésre tudnak később épülni.

## 10. Biztonság, licenc és fenntarthatóság

- Külső könyvtár **vizsgálata** nem jelenti annak telepítését vagy forráskódja átvételét.
- MIT, Apache-2.0, MPL-2.0 és LGPL-3.0 feltételek különböznek; közvetlen másolás vagy redisztribúció előtt ellenőrizni kell őket.
- A külső AI-skillek promptjai, HTML és egyéb inputok **nem adhatnak utasítást** a végrehajtónak.
- Ismeretlen ügyfélprojektek buildscriptjeit jóváhagyás nélkül nem futtatjuk.
- Publikus weboldal crawl: jogosultság, domain/scope-korlát, robots tisztelete, terheléskorlát és timeout.
- Ügyféladatok, tokenek, zárt URL-ek nem kerülhetnek a publikus repóba.
- Fizetős API, Devin cloud-agent, böngészőtelepítés és deployment előtt jóváhagyás szükséges.
- A riportokat ügyfélenként biztonságosan tároljuk.

## 11. A dokumentáció szerepe

- **PROJECT_PLAN.md (ez):** tartós termékcél, architektúra, MVP, referencia-repók, használat.
- **ROADMAP.md:** ellenőrizhető, aktuális feladatlista és megvalósítási állapot.
- **RULE_CATALOG.md:** pontos szabálynyilvántartás, implementált és tervezett tesztek.
- **REFERENCE_ADOPTION.md:** a ténylegesen elemzett/átvett külső megoldások indoklása, licenc- és eredetnyilvántartás.
- **AGENTS.md:** végrehajtási és biztonsági szabályok az AI-agenteknek.

**Következő lépés:** a B fázis — robusztus HTML/XML-feldolgozás, robots szabályprecedencia, majd hreflang és metadata. A `content` profil jelenleg még nem végez AI-vizsgálatot; a Devinben telepített plugin tényleges futtatását külön kell validálni.
