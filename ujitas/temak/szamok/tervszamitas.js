/**
 * temak/szamok/tervszamitas.js – „Számok és műveletek” felmérő, 5. feladat: a megoldási terv leírása és az eredmény kiszámítása.
 * A tanuló egy mezőbe írja a tervet és a számítást egyenlőségjelekkel: pl. (3,6+0,24)·6=3,84·6=23,04.
 * Pontozás tételenként (a–g): helyes megoldási terv 1 pont + helyes eredmény 2 pont = 3 pont (összesen 21).
 *  – Terv: az ELSŐ tag a szöveges feladat helyes kifejezése. Egyenértékű alakot elfogad (összeadás/szorzás tagjainak sorrendje, 0,6 = 3/5),
 *    de a már kiszámolt vagy más felépítésű alakot nem. A további elfogadott alakok a TERVEK listában vannak.
 *  – Eredmény: az utolsó tag egyetlen szám, értéke helyes (bármely egyenértékű alakban: 0,83 vagy 83/100, 11 1/4 vagy 45/4 vagy 11,25).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A tervszámítás feladathoz a bevitel.js szükséges.');
  const m = function (k) { return S.html(S.parse(k)); };

  // szöveg (HTML), elfogadott tervek (az első a mintamegoldás; az eredmény ebből számolódik)
  const TETELEK = [
    ['a', m('3,6') + ' és ' + m('0,24') + ' összegének a hatszorosa.', ['(3,6+0,24)*6']],
    ['b', m('8,3') + ' tízszeresének a százada.', ['8,3*10:100', '8,3*10*0,01', '8,3*10/100']],
    ['c', m('0,7') + ' négyzetének és ' + m('0,7') + '-nek a különbsége.', ['0,7^2-0,7', '0,7*0,7-0,7']],
    ['d', m('2 1/3') + ' és ' + m('0,8') + ' különbségének a fele.', ['(2 1/3-0,8):2', '(2 1/3-0,8)*1/2']],
    ['e', m('-9/4') + ' abszolút értékének az 5-szöröse.', ['|-9/4|*5']],
    ['f', '300-nak a 45%-a.', ['300*0,45', '300:100*45', '300*45:100']],
    ['g', 'Az a szám, amelynek a 30%-a 450.', ['450:0,3', '450:30*100', '450*100:30', '450:3*10', '450*10:3']],
  ];
  function ertekel(t, ch) {
    const v = S.evaluate(S.parse(t[2][0]));
    const terv = S.tervJo(ch, t[2]) ? 1 : 0, eredmeny = S.vegJo(ch, v) ? 2 : 0;
    return { pont: terv + eredmeny, tagok: [{ nev: 'Megoldási terv', pont: terv, max: 1 }, { nev: 'Eredmény', pont: eredmeny, max: 2 }] };
  }
  const f = S.urlap({
    id: 'tervszamitas', cim: 'Megoldási terv és számítás', egyenlo: false,
    felad: 'Írd le a feladatok megoldási tervét, és számítsd ki az eredményt!',
    tabla: [['a–g', 'Minden helyes megoldási terv 1-1 pont', TETELEK.length + ' pont'], ['a–g', 'Minden helyes eredmény 2-2 pont', TETELEK.length * 2 + ' pont']],
    tetelek: TETELEK.map(function (t) {
      return { kod: t[0], max: 3, elo: t[1], ertekel: function (sz, ch) { return ertekel(t, ch); } };
    }),
  });
  S.regisztral('tervszamitas', f, { TETELEK: TETELEK, ertekel: function (kod, sz) { return ertekel(TETELEK.filter(function (x) { return x[0] === kod; })[0], S.chain(sz)); } });
})();
