# temak/szamok – „Számok és műveletek” felmérő (gyűjtő lap + külön feladatok)

| Fájl | Szerepe |
|---|---|
| `felmero.js` | Gyűjtő lap: feladatlista, lebegő ablak, megerősítő ablak, kódbekérés, lapvédelem, eredmények őrzése, **összesítés és osztályzat**. |
| `bevitel.js` | A 3–6. feladat közös eszközei: kifejezés-beolvasás (hatvány, abszolútérték, vegyes szám), emeletes HTML/CSS megjelenítés, gombsor, lépéslánc-elemzés, közös keret (`S.urlap`). |
| `halmazabra.js` | 1. feladat (10 pont: minden jó helyre kerülő szám 1 pont). |
| `szamkartya.js` | 2. feladat: számkártyák húzása négyszögekbe (10 pont). |
| `igazhamis.js` | 3. feladat: igaz/hamis szöveges válasz (10 pont). |
| `muveletsorrend.js` | 4. feladat: műveleti sorrend (12 pont). |
| `tervszamitas.js` | 5. feladat: megoldási terv + eredmény (21 pont). |
| `szamolas.js` | 6. feladat: törtek és tizedes törtek műveletei (19 pont). |
| `../tortek-motor.js` | Pontos számolás (BigInt-tört); a `bevitel.js` a `Q` osztályát használja. |

Az oldal (`osztaly/7/szamok-es-muveletek.html`) a feladatok listáját adja: `{ id, fajl, cim, max }`. Az `id` egyezzen a fájl regisztrált nevével,
a `max` a feladat pontja (az összesítéshez). Archíváláskor: `mod: 'archiv'`.

Osztályzat (az összes feladat kész, a százalék egész számra kerekítve): 0–33 elégtelen (1), 34–50 elégséges (2), 51–74 közepes (3), 75–90 jó (4), 91–100 jeles (5).

## Új tételes feladat (bevitellel)
```js
const S = window.SZAMOK_BEVITEL;
const f = S.urlap({ id: 'uj', cim: '…', felad: 'A feladat szövege', tabla: [['a–b', 'pontozás', '6 pont']],
  tetelek: [{ kod: 'a', max: 3, elo: S.html(S.parse('3/4+5/6')), ertekel: function (szoveg, lanc) { return { pont: 3, tagok: [] }; } }] });
S.regisztral('uj', f, {});
```
Segédek a pontozáshoz: `S.vegJo(lanc, érték)`, `S.sorrendJo(fa, lanc)`, `S.tervJo(lanc, ['alak', …])`, `S.vanResz(lanc, fa => …)`, `S.leaves(fa)`.
Egyéni felületű feladat (mint a `szamkartya.js`): a `halmazabra.js` szerződése szerint, `api.megerosit` / `api.kesz`.

Beküldés/e-mail ma nincs; az eredmények a `UJITAS.felmero.eredmenyek`, az összesítés a `UJITAS.felmero.osszesit()` hívással érhető el.
