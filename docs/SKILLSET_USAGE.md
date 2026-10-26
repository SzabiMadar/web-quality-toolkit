# Web Quality Toolkit — kész skillset használata

## Mi készült el?

A **Devin plugin v1.0.0** 14 eljárásskillt tartalmaz. A szakmai útmutatók hordozhatók; a telepítés és eszközhozzáférés platformfüggő. Az audit a rendelkezésre álló weboldal- vagy projektadatból készül.

### Kiválasztási példa

| Feladat | Devin-parancs |
|---|---|
| Teljes weboldalminőség-audit | /web-audit:full-audit |
| Gyors első vizsgálat | /web-audit:quick-audit |
| Technikai SEO | /web-audit:technical-seo |
| Metaadatok, headings | /web-audit:on-page-seo |
| Magyar–angol hreflang | /web-audit:international-seo |
| JSON-LD és Schema.org | /web-audit:structured-data |
| Belső linkek | /web-audit:internal-links |
| Képek | /web-audit:image-audit |
| Performance/CWV | /web-audit:performance |
| WCAG | /web-audit:accessibility |
| Tartalom SEO | /web-audit:content-seo |
| AEO/GEO felkészültség | /web-audit:aeo-geo |
| Helyi vállalkozások SEO-ja | /web-audit:local-seo |
| Összesítés és javítási terv | /web-audit:audit-report |

**Fontos:** a skill nem garantál valódi Lighthouse/Search Console/AI mérőeszközt. Ahol nincs végrehajtott teszt vagy hiteles adat, ott not-tested.

## Telepítés meglévő Devin plugin esetén

A felhasználó Devinbe korábban már importálta a web-audit plugint. A GitHub frissítése után ellenőrizni kell, hogy a helyi install is frissült-e. Ajánlott CLI:

~~~bash
devin plugins update web-audit
devin plugins list
~~~

Ha nem támogatott, telepítsd újra:

~~~bash
devin plugins install SzabiMadar/web-quality-toolkit#plugins/web-audit
~~~

Indíts új munkamenetet, majd keresd /web-audit:full-audit és /web-audit:international-seo parancsokat. A GitHub-változás **nem bizonyítja**, hogy a felhasználó Desktop kliensében már frissült a plugin.

## Valós prompt példák

**Astro projekt átadás előtt:** "Használd a /web-audit:full-audit skillt az aktuális projekten. A build csak olvasható. Ha megvan a CLI, vizsgáld a canonical/sitemap/robots állapotot; SEO, accessibility, content és AEO/GEO területen csak tényleges evidence-re alapozz. Ne módosíts forrást."

**Kétnyelvű ügyvédi iroda:** "A /web-audit:international-seo és /web-audit:structured-data módszertannal vizsgáld át a magyar–angol oldalakat, kérlek bizonyítsd az alternates viszonosságát URL-páronként."

**Ügyfélriport:** "Futtasd a /web-audit:audit-report skillt a már elkészült findings.json és a megadott forrásmegfigyelések alapján; sorold prioritás szerint, mit kell javítani."

## Reális készültség

**Kész és telepíthető:** skillcsomag, Devin manifest, közös protokoll, riport-sablon, ChatGPT-használati utasítás, statikus ellenőrző CI, külön meglévő CLI (v0.4.0).

**Nem történt meg:** valódi kliensoldali Devin Desktop plugin update, élő ügyfélweboldal crawl, Search Console vagy Lighthouse futtatás, AI-idézések mérése. Ezeket csak tényleges jogosultság/adat birtokában lehet validálni.
