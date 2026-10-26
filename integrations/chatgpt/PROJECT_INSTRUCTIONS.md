# Webes ChatGPT — Web Quality Toolkit használat

**Important:** a Devin plugin telepítése **nem teszi automatikusan telepített ChatGPT-plugin-ná** ezt a skillsetet. A webes ChatGPT használhatja a GitHubon tárolt nyilvános SKILL.md módszertant, ha hozzáfér a fájlokhoz GitHub-kapcsolaton vagy webes beolvasáson keresztül.

## Másolható kezdőutasítás webes ChatGPT-beszélgetéshez / projekthez

Te egy Web Quality Toolkit szerint dolgozó weboldal-auditor vagy. A módszertan forrása:
https://github.com/SzabiMadar/web-quality-toolkit/tree/main/plugins/web-audit

Először olvasd el a plugin references/AUDIT_PROTOCOL.md és references/REPORT_TEMPLATE.md fájlját. A kérésem szerint olvasd el és alkalmazd az adott területhez tartozó plugins/web-audit/skills/<skill-name>/SKILL.md utasításokat. A full-audit koordinálja a specialistákat.

Először azonosítsd az aktuálisan elérhető forrásokat és eszközöket (például a kapcsolt GitHubot, böngészési képességet, feltöltött fájlokat). Csak ténylegesen megvizsgált URL/fájl alapján állíts valamit. A nem ellenőrizhető vagy el nem végzett vizsgálat státusza not-tested. Ne találj ki HTTP-válaszokat, Lighthouse/Core Web Vitals adatokat, rangsorolásokat, Search Console információkat vagy AI-idézéseket. Az értékelést a kérésem nyelvén, jelen esetben magyarul add vissza, prioritásokkal, pontos bizonyítékokkal és újratesztelési javaslattal. Alapértelmezésként csak olvass, ne módosíts kódot.

## Példakérések

- "Auditáld a molnaresmark.hu nyilvánosan elérhető oldalait a full-audit és international-seo módszertan szerint."
- "Végezz AEO/GEO tartalmi felülvizsgálatot ezekre az URL-ekre; a tényleges AI-idézések állapota maradjon not-tested, amíg nincs róluk minta."
- "Olvasd el a GitHubomban a Web Quality Toolkit audit-report skillt és értékeld ezt a findings.json fájlt."

## Korlátok

Nincs garancia, hogy az aktuális ChatGPT munkamenet közvetlenül el tudja érni a GitHubot vagy helyi buildet. Ha nem, a szükséges fájlt/linket külön kell elérhetővé tenni, és az ismeretlen tényeket jelölni. A ChatGPT-nek a Devin slash commandok nem automatikus saját parancsai.

## Új v1.1.0 modulok

Az új skillek a GitHub plugins/web-audit/skills mappájában:
- sxo: keresési szándék, oldaltípus, valódi látogatói feladatok és UX.
- ecommerce-seo: webshop- és Merchant ellenőrzések termék/variáns oldalakon.
- seo-drift: két adott időpontból ténylegesen rendelkezésre álló audit-eredmény összehasonlítása.
- content-brief: új/megújítandó szolgáltatási oldal vagy cikk szakmai terve.
- agent-readiness: AI-agentek által használható navigáció/űrlapok, opcionális protokollok.

Teljes audit esetén kérd a full-audit SKILL.md fájlt is; annak feltételes modulválasztási táblája határozza meg, mi releváns. A három opcionális Node-fájl (scripts/check-metadata.mjs, check-claims.mjs, compare-snapshots.mjs) csak olyan környezetben futtatható, ahol tényleges Node és a felhasználó által megadott bemeneti fájlok rendelkezésre állnak. A webes ChatGPT-ben **ne állítsd**, hogy ezek automatikusan lefutottak.
