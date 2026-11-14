/**
 * temak/szamok/igazhamis.js – „Számok és műveletek” felmérő, 3. feladat: melyik állítás igaz, melyik hamis?
 * A tanuló szövegesen válaszol („igaz” / „hamis”, kis- és nagybetűvel is). Minden helyes válasz 2 pont (összesen 10).
 * A közös keretet a bevitel.js adja (S.urlap). Az e) állítás tizedes tört alakja: 0,07 szakaszos (a 0 és a 7 fölött pont).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('Az igaz/hamis feladathoz a bevitel.js szükséges.');
  const m = function (k) { return S.html(S.parse(k)); };            // kifejezés emeletes alakban
  const pt = function (c) { return '<span class="sz-pt">' + c + '</span>'; };

  const ALLITASOK = [
    { kod: 'a', elo: 'A ' + m('0,27') + ' ellentettje a ' + m('-0,27') + '.', jo: 'igaz' },
    { kod: 'b', elo: m('2^4*2^2-3^5:3^3') + '<span class="sz-o">=</span>' + m('55'), jo: 'igaz' },
    { kod: 'c', elo: m('5/6') + '-nak a ' + m('3/5') + ' része ' + m('3/6') + '.', jo: 'igaz' },
    { kod: 'd', elo: 'A ' + m('2,5') + ' reciproka ' + m('5/2') + '.', jo: 'hamis' },
    { kod: 'e', elo: m('7/99') + '<span class="sz-o">=</span>0,' + pt('0') + pt('7'), jo: 'igaz' },
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
