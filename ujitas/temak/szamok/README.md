# temak/szamok – „Számok és műveletek” felmérő (gyűjtő lap + külön feladatok)

| Fájl | Szerepe |
|---|---|
| `felmero.js` | A gyűjtő lap: feladatlista, lebegő ablak, megerősítő ablak, kódbekérés indításkor, lapvédelem, az eredmények őrzése (böngésző-munkamenet). |
| `halmazabra.js` | 1. feladat: számok elhelyezése a halmazábrában (húzással). |
| `../tortek-motor.js` | Pontos számolás és emeletes törtek (a halmazábra is ezt használja a számok besorolásához és megjelenítéséhez). |

Az oldal (`osztaly/7/szamok-es-muveletek.html`) csak a beállítását adja meg; a feladatok a `feladatok` listában szerepelnek
(`fajl` nélkül: „Hamarosan”). Archíváláskor: `mod: 'archiv'`.

## Új feladat készítése (2–6. feladat)

1. Új fájl ebbe a mappába, pl. `muveletek.js`; az oldal beállításában: `{ id: 'muveletek', fajl: 'muveletek', cim: '…' }`.
2. A fájl regisztrálja magát:

```js
window.UJITAS_FELADATOK = window.UJITAS_FELADATOK || {};
window.UJITAS_FELADATOK.muveletek = {
  cim: '…', max: 6,
  indit: function (host, api) {
    // host: a lebegő ablak üres eleme – ide építsd fel a feladat felületét (saját Ellenőrzés / Újra / Értékelés gombokkal)
    // api.megerosit({cim, uzenet, igen, nem}) → Promise<boolean>   közös megerősítő ablak (az Értékelés előtt)
    // api.kesz(eredmeny)                                           az Értékelés után: átadja az eredményt, az ablak bezárul
    return { lezar: function (ok) { return eredmeny; } };           // a gyűjtő lap hívja külső lezáráskor (lapváltás): add vissza az eddigi állapot eredményét
  },
};
```

3. `eredmeny`: `{ feladat, cim, pont, max, helyes, ellenorzesek, ujra, lezaras: 'ertekeles'|'lapvaltas', mp, reszek: [{kod, nev, pont, max}], … }`.
   A gyűjtő lap a `pont`/`max`/`lezaras` mezőket jeleníti meg, a többit eltárolja.
4. Tartsd be a halmazábra mintáját: az Ellenőrzés csak „helyes / még nem helyes”, a pontszám az Értékelésnél látszik; az Értékelés előtt
   megerősítő kérdés, utána az elért pontszám megjelenítése és `api.kesz(eredmeny)` a Bezárás gombbal.
5. A feladat saját stílusát az `UJITAS.css(id, szöveg)`-vel add az oldalhoz (előtag: a feladat neve).

Beküldés/e-mail ma nincs; az eredmények a `UJITAS.felmero.eredmenyek` objektumban érhetők el.
