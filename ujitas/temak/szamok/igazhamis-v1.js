/**
 * temak/szamok/igazhamis-v1.js – „Számok és műveletek (v1)” felmérő, 3. feladat: melyik állítás igaz, melyik hamis?
 * A tanuló szövegesen válaszol („igaz” / „hamis”, kis- és nagybetűvel is). Minden helyes válasz 2 pont (összesen 10).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('Az igaz/hamis feladathoz a bevitel.js szükséges.');
  const m = function (k) { return S.html(S.parse(k)); };
  const pt = function (c) { return '<span class="sz-pt">' + c + '</span>'; };

  const ALLITASOK = [
    { kod: 'a', elo: 'A ' + m('0,43') + ' ellentettje a ' + m('-0,43') + '.', jo: 'igaz' },
    { kod: 'b', elo: m('2^3*2^2-3^3:3^1') + '<span class="sz-o">=</span>' + m('23'), jo: 'igaz' },
    { kod: 'c', elo: m('4/5') + '-nak a ' + m('5/8') + ' része ' + m('4/8') + '.', jo: 'igaz' },
    { kod: 'd', elo: 'A ' + m('1,5') + ' reciproka ' + m('3/2') + '.', jo: 'hamis' },
    { kod: 'e', elo: m('13/99') + '<span class="sz-o">=</span>0,' + pt('1') + pt('3'), jo: 'igaz' },
  ];
  const PONT = 2;
  const egyszer = function (s) { return String(s || '').trim().toLowerCase().replace(/[.\s]+$/, ''); };

  const f = S.urlap({
    id: 'igazhamis', cim: 'Igaz vagy hamis', mod: 'szoveg',
    felad: 'Melyik állítás igaz, melyik hamis? Írd a megoldást (igaz vagy hamis) az állítás alá!',
    tabla: [['a–e', 'Minden helyes válasz 2-2 pont', ALLITASOK.length * PONT + ' pont']],
    tetelek: ALLITASOK.map(function (a) {
      return { kod: a.kod, max: PONT, elo: a.elo, ertekel: function (sz) { return { pont: egyszer(sz) === a.jo ? PONT : 0 }; } };
    }),
  });
  S.regisztral('igazhamis', f, { allitasok: ALLITASOK, egyszer: egyszer });
})();