/**
 * temak/szamok/muveletsorrend-v1.js – „Számok és műveletek (v1)” felmérő, 4. feladat: számítás a műveletek sorrendjének betartásával.
 * Pontozás tételenként (a–d): helyes műveleti sorrend 1 pont + helyes eredmény 2 pont = 3 pont (összesen 12).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A műveleti sorrend feladathoz a bevitel.js szükséges.');
  const KIF = [['a', '-20+2*3^2'], ['b', '-20+(2*3)^2'], ['c', '(-20+2)*3^2'], ['d', '(-20+2*3)^2']]; // értékük: −2, 16, −162, 196

  function ertekel(kif, ch) {
    const fa = S.parse(kif), v = S.evaluate(fa);
    const sorrend = S.sorrendJo(fa, ch) ? 1 : 0, eredmeny = S.vegJo(ch, v) ? 2 : 0;
    return { pont: sorrend + eredmeny, tagok: [{ nev: 'Műveleti sorrend', pont: sorrend, max: 1 }, { nev: 'Eredmény', pont: eredmeny, max: 2 }] };
  }
  const f = S.urlap({
    id: 'muveletsorrend', cim: 'Műveleti sorrend', egyenlo: false,
    felad: 'Számítsd ki! Ügyelj a műveletek sorrendjére! Az alábbi mezőbe írd le a lépéseket (a részeredményekkel együtt) egyenlőségjelekkel összekapcsolva, és az utolsó egyenlőségjel után írd le a végeredményt!',
    tabla: [['a–d', 'Tudja a helyes műveleti sorrendet: feladatonként 1-1 pont. Helyes eredmény feladatonként 2-2 pont', KIF.length * 3 + ' pont']],
    tetelek: KIF.map(function (k) {
      return { kod: k[0], max: 3, elo: S.html(S.parse(k[1])), ertekel: function (sz, ch) { return ertekel(k[1], ch); } };
    }),
  });
  S.regisztral('muveletsorrend', f, { KIF: KIF, ertekel: function (kod, sz) { const k = KIF.filter(function (x) { return x[0] === kod; })[0]; return ertekel(k[1], S.chain(sz)); } });
})();