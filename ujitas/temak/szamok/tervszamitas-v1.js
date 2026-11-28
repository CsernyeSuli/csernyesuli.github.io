/**
 * temak/szamok/tervszamitas-v1.js – „Számok és műveletek (v1)” felmérő, 5. feladat: a megoldási terv leírása és az eredmény kiszámítása.
 * Pontozás tételenként (a–g): helyes megoldási terv 1 pont + helyes eredmény 2 pont = 3 pont (összesen 21).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A tervszámítás feladathoz a bevitel.js szükséges.');
  const m = function (k) { return S.html(S.parse(k)); };

  const TETELEK = [
    ['a', m('2,4') + ' és ' + m('0,35') + ' összegének a négyszerese.', ['(2,4+0,35)*4']],
    ['b', m('6,7') + ' tízszeresének a százada.', ['6,7*10:100', '6,7*10*0,01', '6,7*10/100']],
    ['c', m('0,6') + ' négyzetének és ' + m('0,6') + '-nek a különbsége.', ['0,6^2-0,6', '0,6*0,6-0,6']],
    ['d', m('1 3/4') + ' és ' + m('0,5') + ' különbségének a fele.', ['(1 3/4-0,5):2', '(1 3/4-0,5)*1/2']],
    ['e', m('-7/3') + ' abszolút értékének a 6-szorosa.', ['|-7/3|*6']],
    ['f', '200-nak a 35%-a.', ['200*0,35', '200:100*35', '200*35:100']],
    ['g', 'Az a szám, amelynek a 25%-a 300.', ['300:0,25', '300:25*100', '300*100:25', '300:5*20', '300*20:5']],
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