# Web Quality Toolkit — v0.4.0 (A2)

TypeScript/Node.js alapú, újrafelhasználható **lokális HTML/Astro build SEO-audit**; külön Devin plugin és egyértelmű audit-lefedettségi riportok.

**Jelenleg végrehajtott ellenőrzések:** canonical; egyszerű sitemap (Astro sitemap index is); részleges robots.txt. **Nem létezik még végrehajtható AEO/GEO, JSON-LD, hreflang, image, performance, akadálymentességi vagy HTTP-crawler modul.**

## Követelmények

- Node.js >= 22.6, npm
- Megbízható weboldal elkészült statikus buildje (pl. `dist/`)
- A weboldal ellenőrzött **valódi éles URL-je**, nem placeholder

## Korábbi CLI-használat — továbbra is működik

```bash
npm test
npm run audit -- --dir /absolute/path/to/site/dist --site https://REAL-PRODUCTION-DOMAIN.example/ --out /absolute/path/to/site/audits/latest
```

Az audit **nem** kéri le az éles weboldalt: kizárólag a helyi HTML/XML/robots fájlokat vizsgálja. Az `--site` az elvárt canonical/sitemap URL-ek meghatározásához kell. A példadomain helyére az ügyfél valódi domainjét kell írni.

## A2: JSON-projektkonfiguráció

Másold az [examples/web-quality.config.example.json](examples/web-quality.config.example.json) példát a **vizsgált projekt** mappájába, szükség szerint módosítsd, például `web-quality.config.json` néven. A toolkit nem írja módosítja a projektet; a fájlt te készíted el.

```json
{
  "configVersion": 1,
  "site": "https://example.com/",
  "dir": "./dist",
  "out": "./audits/latest",
  "profile": "full",
  "rules": {
    "include": [],
    "exclude": []
  }
}
```

Használat a **toolkit gyökérkönyvtárából**:

```bash
npm run audit -- --config /absolute/path/to/project/web-quality.config.json
```

- Az `--config` **explicit**: nincs automatikus konfigurációkeresés, így egy véletlen fájl nem befolyásol futást.
- A konfigurációban megadott relatív `dir` és `out` útvonalak a **konfigurációs fájl könyvtárához** képest értendők.
- A CLI-n megadott `--dir`, `--out`, `--site`, `--profile` mindig **felülírja** a JSON megfelelő értékét; relatív CLI-útvonalak az aktuális munkakönyvtárhoz viszonyítottak.
- A JSON kulcsok és a szabályazonosítók szigorúan validáltak. Ismeretlen érték, ütköző `include/exclude`, hibás URL vagy hibás JSON esetén a futtatás **2-es kóddal** leáll.
- `include`: szabályt ad a profilhoz; `exclude`: eltávolítja. Nem implementált szabály kérése **nem indít ellenőrzést**, hanem `not-tested` státuszt ad.
- A konfiguráció nem futtatható TypeScript/JS, hanem egyszerű JSON; nincsenek benne parancsok, kulcsok vagy titkok.

## Auditprofilok

| Profil | Jelenlegi működés | Korlát |
|---|---|---|
| `full` (alapértelmezett) | Canonical + alap sitemap + alap robots ellenőrzés | További 9 modul `not-tested` |
| `quick` | Csak canonical ellenőrzés | A kihagyott modulok `excluded-by-profile` |
| `content` | **Még nincs végrehajtható vizsgálat** | A kiválasztott METADATA, SCHEMA, AEO_GEO is `not-implemented` |

Példák:

```bash
npm run audit -- --config /path/to/project/web-quality.config.json --profile quick
npm run audit -- --dir /path/to/site/dist --site https://real-domain.example/ --profile content
```

A `content` profil `0` exit code-ja **nem tartalmi megfelelést** jelent, hanem azt, hogy nincs végrehajtott, hibát jelző ellenőrzés. A `coverage.executed = 0` ezt egyértelművé teszi.

## Auditriport és manifest

Kimeneti fájlok: `findings.json` (`schemaVersion: 2`) és `summary.md`. A korábbi mezőket megtartjuk, az A2 egy additív `manifest` objektumot vezet be:

- `profile`, `surface: local-build`, `configPath`
- `selectedRules`, `executedRules`
- `skippedRules` és `excluded-by-profile` / `not-implemented` okok
- `nodeVersion`, `sourceCommit` (csak `WQT_SOURCE_COMMIT` 40 karakteres SHA esetén; egyébként `null`)

A `coverage` az adott profilhoz tartozó ténylegesen végrehajtott és ki nem próbált **ellenőrzési egységeket** számolja. A régi `passedPages` kizárólag a canonical-vizsgálat során sikeres oldalak száma; nullának számít akkor is, ha a canonical nem futott.

**Exit code-ok:** 0 = nincs bizonyított vagy további vizsgálatot igénylő megállapítás; 1 = van confirmed/needs-review megállapítás; 2 = futtatási hiba. A 0 nem teljes SEO-tanúsítvány.

## Devin plugin

A `plugins/web-audit` plugin jelenlegi verziója **0.3.0**. Az A2 a plugin fájljait nem módosítja, ezért a korábban importált `/web-audit:full-audit` parancs továbbra is a korábbi `--dir --site --out` CLI-formát használhatja. A plugin **nem telepíti** önmagában a CLI-t.

```bash
devin plugins install --local ./plugins/web-audit
devin plugins list
```

Az éles Devin Desktop integrációt az új verzióval a saját környezetben külön ellenőrizni kell.

## Dokumentáció és fejlesztési terv

- [Teljes projektterv](docs/PROJECT_PLAN.md)
- [Fejlesztési roadmap](docs/ROADMAP.md)
- [Szabálykatalógus](docs/RULE_CATALOG.md)
- [Referencia-repók](docs/REFERENCE_ADOPTION.md)

A jelenlegi HTML/canonical és sitemap/robots parser részleges; ezek robusztusabb validátorokra történő lecserélése a következő fejlesztési fázis része.

**Biztonság:** ne futtass ismeretlen buildscriptet engedély nélkül, és ne publikálj ügyfél URL-eket, hitelesítési adatokat vagy privát HTML-t a nyilvános repositoryba.
