# Codex / más AI-agent környezet

A skillek tartalma platformfüggetlen SKILL.md eljárás. A **forrásigazság** a plugins/web-audit/skills/ és references/ könyvtárban marad.

Használat:
1. Kérd a fejlesztői agentet, hogy olvassa el a GitHub repó plugins/web-audit/references/AUDIT_PROTOCOL.md fájlját.
2. Válaszd a specialistát, például international-seo vagy performance. A specialista útmutatója a plugins/web-audit/skills/<név>/SKILL.md fájlban van.
3. Add meg a vizsgált repo-t, a build/élő URL-eket és az engedélyezett eszközöket.
4. Szöveges auditot és not-tested lefedettséget kérj a REPORT_TEMPLATE.md struktúrájában.

Codexben nem állítjuk, hogy a Devin plugin automatikusan települt, vagy a fájljai automatikusan megjelentek agent skillként. Egyedi környezetben a megfelelő skillfájlok másolása/linkelése és a platform telepítési módjának ellenőrzése szükséges. Ne másolj projektkódot vagy ügyfél titkokat a publikus skillsetbe.

A TypeScript CLI külön eszköz, opcionálisan futtatható a saját Node-os projekten.
