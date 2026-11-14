/**
 * temak/szamok/muveletsorrend.js – „Számok és műveletek” felmérő, 4. feladat: számítás a műveletek sorrendjének betartásával.
 * A tanuló a feladat kifejezése UTÁN, egyenlőségjelekkel összekapcsolva írja le a lépéseket: pl. −30+48=18.
 * Pontozás tételenként (a–d): helyes műveleti sorrend 1 pont + helyes eredmény 2 pont = 3 pont (összesen 12).
 *  – Sorrend: minden lépés az előzőből a műveleti sorrend szerint elvégezhető műveletek helyettesítésével áll elő (a számolási hiba itt nem számít),
 *    és legalább egy közbülső alak is látszik. Ha csak a végeredményt írja be, a sorrendért nem jár pont.
 *  – Eredmény: az utolsó tag egyetlen szám, és egyenlő a helyes értékkel.
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A műveleti sorrend feladathoz a bevitel.js szükséges.');
  const KIF = [['a', '-30+3*4^2'], ['b', '-30+(3*4)^2'], ['c', '(-30+3)*4^2'], ['d', '(-30+3*4)^2']];   // értékük: 18, 114, −432, 324

  function ertekel(kif, ch) {
    const fa = S.parse(kif), v = S.evaluate(fa);
    const sorrend = S.sorrendJo(fa, ch) ? 1 : 0, eredmeny = S.vegJo(ch, v) ? 2 : 0;
    return { pont: sorrend + eredmeny, tagok: [{ nev: 'Műveleti sorrend', pont: sorrend, max: 1 }, { nev: 'Eredmény', pont: eredmeny, max: 2 }] };
  }
  const f = S.urlap({
    id: 'muveletsorrend', cim: 'Műveleti sorrend',
    felad: 'Számítsd ki! Ügyelj a műveletek sorrendjére! Az eredményt az egyenlőségjel után írd le!',
    tabla: [['a–d', 'Tudja a helyes műveleti sorrendet: feladatonként 1-1 pont. Helyes eredmény feladatonként 2-2 pont', KIF.length * 3 + ' pont']],
    tetelek: KIF.map(function (k) {
      return { kod: k[0], max: 3, elo: S.html(S.parse(k[1])), ertekel: function (sz, ch) { return ertekel(k[1], ch); } };
    }),
  });
  S.regisztral('muveletsorrend', f, { KIF: KIF, ertekel: function (kod, sz) { const k = KIF.filter(function (x) { return x[0] === kod; })[0]; return ertekel(k[1], S.chain(sz)); } });
})();
