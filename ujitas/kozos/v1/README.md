# kozos/v1 – közös keret

Négy téma-független modul. A téma-modul (`temak/<tema>.js`) csak a feladatokat és az értékelést tartalmazza.

| Fájl | Feladata | Archív oldalon |
|---|---|---|
| `betolto.js` | beállítás, eseményvezérlés, modulok betöltése | betöltődik |
| `azonosito.js` | személyes kód bekérése (ellenőrző karakterrel) | **nincs** |
| `vedelem.js` | figyelmeztetés, lapváltás-figyelés, másolás tiltása | **nincs** |
| `kuldes.js` | küldés az Apps Scriptnek (itt van az egyetlen URL) | **nincs** |

## Oldal beállítása

```html
<script>
window.UJITAS_CFG = {
  mod: 'elo',                 // 'elo' | 'archiv'
  classId: '7',               // 6a | 6h | 7 | 8
  assignmentType: 'Orai',     // Orai | Hazi | Szorgalmi | Felmero  (betű, szám, _ és - lehet)
  taskTitle: 'Műveleti sorrend',   // az e-mail tárgyának eleje
  setId: '1',                 // a feladatsor azonosítója
  tema: 'muveleti-sorrend',   // temak/<tema>.js
};
</script>
<script src="../../kozos/v1/betolto.js"></script>   <!-- a </body> előtt -->
```

**Archíváláskor:** `mod: 'archiv'` (és a `classId`, `assignmentType`, `taskTitle` sorok elhagyhatók). Más teendő nincs.
Élő módban, ha bármelyik modul nem tölthető be, az oldal nem indul el (védelem nélkül nem fut).

## Szerződés a téma-modulnak (`window.UJITAS`)

```js
await UJITAS.run('indulas')         // indítás előtt; false = ne induljon (nincs kód) – archívban mindig true
UJITAS.aktiv = () => session && !session.ended      // fut-e éppen feladatsor
UJITAS.on('lapvaltas', () => finish('lapvaltas'))   // másik lapra váltott: zárd le és küldd el
UJITAS.on('kilepes',   () => { /* szinkron, csendes küldés: UJITAS.kuldes(payload, { csendes: true }) */ })
UJITAS.emit('lezarva')              // a feladatsor véget ért (a figyelmeztetés eltűnik)
const r = await UJITAS.kuldes(payload)   // true | false | null (null = archív, nincs küldés → ne mutass „elküldve” üzenetet)
```

`payload`: `{ score, total, grade, reason: 'befejezve'|'lapvaltas', tasks: [{ expression, correct, finalAnswer, correctAnswer,
seconds, stepErrors, studentLines[], correctLines[], feedback[] }] }`. A `classId`, `assignmentType`, `taskTitle`, `setId` és
a diák kódja a küldő modul hozzáteszi. A kód a böngésző munkamenetében marad (`sessionStorage`), a lap bezárásával törlődik.
