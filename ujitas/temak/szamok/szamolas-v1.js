/**
 * temak/szamok/szamolas-v1.js – „Számok és műveletek (v1)” felmérő, 6. feladat: műveletek törtekkel és tizedes törtekkel.
 * Összesen 19 pont: a) 3, b) 2, c) 5, d) 3, e) 3, f) 3.
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A számolás feladathoz a bevitel.js szükséges.');
  const q = S.frQ, qv = function (s) { return S.evaluate(S.parse(s)); };
  const tag = function (nev, pont, max) { return { nev: nev, pont: pont, max: max }; };
  const leaf = function (t) { return t.type === 'num'; };
  const bin = function (t, op) { return t.type === 'bin' && t.op === op && leaf(t.l) && leaf(t.r); };

  function minden(ch, pred) {
    return ch.parts.some(function (p) { return p.tree && S.leaves(p.tree).some(pred); });
  }

  const TETELEK = [
    { kod: 'a', kif: '2/3+3/5', max: 3, ertekel: function (ch, v) {
      const A = q(2, 3), B = q(3, 5);
      const bov = S.vanResz(ch, function (t) {
        return bin(t, '+') && t.l.form === 'frac' && t.r.form === 'frac' && t.l.b === t.r.b && ((t.l.q.eq(A) && t.r.q.eq(B)) || (t.l.q.eq(B) && t.r.q.eq(A)));
      }) ? 2 : 0;
      const ossz = S.vegJo(ch, v) ? 1 : 0;
      return { pont: bov + ossz, tagok: [tag('Helyes bővítések', bov, 2), tag('Jó az összeg', ossz, 1)] };
    } },
    { kod: 'b', kif: '0,36+(-1,425)', max: 2, ertekel: function (ch, v) {
      const x = qv('0,36'), y = qv('1,425'), vj = S.vegJo(ch, v);
      const igazitott = S.vanResz(ch, function (t) {
        return bin(t, '+') || bin(t, '-') ? (t.l.form === 'dec' && t.r.form === 'dec' && t.l.dp === t.r.dp && t.l.dp >= 3 &&
          ((S.qabs(t.l.q).eq(x) && S.qabs(t.r.q).eq(y)) || (S.qabs(t.l.q).eq(y) && S.qabs(t.r.q).eq(x)))) : false;
      });
      const hely = (vj || igazitott) ? 1 : 0, ossz = vj ? 1 : 0;
      return { pont: hely + ossz, tagok: [tag('Helyi érték szerint egymás alá', hely, 1), tag('Jó az összeg', ossz, 1)] };
    } },
    { kod: 'c', kif: '-0,142*4,5', max: 5, ertekel: function (ch, v) {
      const vj = S.vegJo(ch, v);
      // 142 * 5 = 710 (alap: 71), 142 * 40 = 5680 (alap: 568, aránya a 71-hez 8)
      const p1 = minden(ch, function (l) { return S.tizHatv(l.q, 71n); }), p2 = minden(ch, function (l) { return S.tizHatv(l.q, 568n); });
      const rsz = vj ? 2 : (p1 ? 1 : 0) + (p2 ? 1 : 0);
      const hely = (vj || S.vanResz(ch, function (t) {
        if (!bin(t, '+')) return false;
        const a = S.qabs(t.l.q), b = S.qabs(t.r.q), x8 = q(8);
        return (S.tizHatv(a, 71n) && b.eq(a.mul(x8))) || (S.tizHatv(b, 71n) && a.eq(b.mul(x8)));
      })) ? 1 : 0;
      const er = vj ? 2 : 0;
      return { pont: rsz + hely + er, tagok: [tag('A részletszorzatok jók', rsz, 2), tag('Jó helyi értéken állnak', hely, 1), tag('Jó eredmény', er, 2)] };
    } },
    { kod: 'd', kif: '0,8:3,2', max: 3, ertekel: function (ch, v) {
      const vj = S.vegJo(ch, v), t = S.utolso(ch);
      const alg = (vj || S.vanResz(ch, function (x) { return bin(x, ':') && x.l.form === 'int' && x.r.form === 'int' && !x.r.q.isZero() && x.l.q.div(x.r.q).eq(v); })) ? 1 : 0;
      const tiz = (vj || (!!t && t.type === 'num' && S.nagysag(t.q) !== null && S.nagysag(t.q) === S.nagysag(v))) ? 1 : 0;
      const er = vj ? 1 : 0;
      return { pont: alg + tiz + er, tagok: [tag('Jól használja az osztás algoritmusát', alg, 1), tag('Jó helyre teszi a tizedesvesszőt', tiz, 1), tag('Helyes a végeredmény', er, 1)] };
    } },
    { kod: 'e', kif: '1 3/5*(-5/8)*6', max: 3, ertekel: function (ch, v) {
      const at = S.vanResz(ch, function (t) { return S.leaves(t).some(function (l) { return l.form === 'frac' && l.q.eq(q(8, 5)); }); }) ? 1 : 0;
      const sz = S.vegJo(ch, v) ? 2 : 0;
      return { pont: at + sz, tagok: [tag('A vegyes tört átalakítása', at, 1), tag('Helyes szorzat', sz, 2)] };
    } },
    { kod: 'f', kif: '-5/8:(-15/16)', max: 3, ertekel: function (ch, v) {
      const osz = S.vanResz(ch, function (t) { return bin(t, '*') && S.qabs(t.l.q).eq(q(5, 8)) && S.qabs(t.r.q).eq(q(16, 15)); }) ? 1 : 0;
      const er = S.vegJo(ch, v) ? 2 : 0;
      return { pont: osz + er, tagok: [tag('Jól oszt törttel', osz, 1), tag('Helyes eredmény', er, 2)] };
    } },
  ];
  const ertekel = function (t, ch) { return t.ertekel(ch, S.evaluate(S.parse(t.kif))); };

  const f = S.urlap({
    id: 'szamolas', cim: 'Műveletek törtekkel és tizedes törtekkel', egyenlo: false,
    felad: 'Végezd el a műveleteket! Az alábbi mezőbe írd le a számítás lépéseit egyenlőségjelekkel összekapcsolva, és az utolsó egyenlőségjel után írd le a végeredményt!',
    tabla: [
      ['a', 'Helyes bővítések: 2 pont. Jó az összeg: 1 pont', '3 pont'],
      ['b', 'Helyi érték szerint írja egymás alá a számokat: 1 pont. Jó az összeg: 1 pont', '2 pont'],
      ['c', 'A részletszorzatok jók: 2 pont. A részletszorzatok jó helyi értéken állnak: 1 pont. Jó eredmény: 2 pont', '5 pont'],
      ['d', 'Jól használja az osztás algoritmusát: 1 pont. Jó helyre teszi ki a hányadosban a tizedesvesszőt: 1 pont (akkor is, ha a részeredmények rosszak). Helyes a végeredmény: 1 pont', '3 pont'],
      ['e', 'A vegyes tört átalakítása: 1 pont. Helyes szorzat: 2 pont', '3 pont'],
      ['f', 'Jól oszt törttel: 1 pont. Helyes eredmény: 2 pont', '3 pont'],
    ],
    tetelek: TETELEK.map(function (t) {
      return { kod: t.kod, max: t.max, elo: S.html(S.parse(t.kif)), ertekel: function (sz, ch) { return ertekel(t, ch); } };
    }),
  });
  S.regisztral('szamolas', f, { TETELEK: TETELEK, ertekel: function (kod, sz) { return ertekel(TETELEK.filter(function (x) { return x.kod === kod; })[0], S.chain(sz)); } });
})();