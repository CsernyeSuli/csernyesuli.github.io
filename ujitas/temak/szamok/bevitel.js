/**
 * temak/szamok/bevitel.js – a „Számok és műveletek” felmérő 3–6. feladatának KÖZÖS eszközei (a felmero.js tölti be az első
 * feladat megnyitásakor; a tortek-motor.js-re épül). Globális neve: SZAMOK_BEVITEL.
 *
 *  1. Kifejezések beolvasása és pontos kiszámítása (BigInt-tört, nincs kerekítés). A motorhoz képest ismeri:
 *       hatvány: 4^2, 4², (−1)³ · abszolútérték: |−9/4| · vegyes szám: 2 1/3 (egész, szóköz, tört) · százalék: 45%
 *     A törtvonal (/) csak két egész szám között áll és egyetlen számnak számít (2/3 · 27). Az előjel gyengébb a hatványnál: −3² = −9.
 *  2. Emeletes megjelenítés HTML/CSS-sel (MathML nélkül, ezért a régi, pl. Android 8-as tableten is jó).
 *  3. A lépéslánc (a = b = c) elemzése: műveleti sorrend, egyenértékű terv, részeredmények keresése.
 *  4. A közös feladat-keret (S.urlap): tételek bevitellel, gombsor, Ellenőrzés / Újra / Értékelés, értékelő nézet.
 * A feladat-fájlok (igazhamis.js, muveletsorrend.js, tervszamitas.js, szamolas.js) csak az adatokat és a pontozást adják meg.
 */
(function (g) {
  'use strict';
  const M = g.TORTEK_MOTOR;
  if (!M) throw new Error('A bevitel.js-hez a tortek-motor.js szükséges.');
  const Q = M.Q;

  /* ===================== SEGÉDEK ===================== */
  const qabs = function (q) { return q.n < 0n ? q.neg() : q; };
  const babs = function (x) { return x < 0n ? -x : x; };
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const PERR = function (m) { return new M.ParseError(m); };
  const frQ = function (n, d) { return new Q(BigInt(n), BigInt(d === undefined ? 1 : d)); };    // gyors tört: frQ(9, 4) = 9/4

  /* ===================== BEOLVASÁS ===================== */
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  /** A beírt szöveg egységesítése: mínusz, szorzás, osztás, törtvonal, zárójelek, felső indexű számjegyek (² → ^2). */
  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/[\u2212\u2012\u2013\u2014]/g, '-')
      .replace(/[×·∙⋅*]/g, '*')
      .replace(/÷/g, ':')
      .replace(/[\u2044\u2215]/g, '/')
      .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')')
      .replace(/\u00a0/g, ' ')
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) { return '^' + m.split('').map(function (c) { return SUP.indexOf(c); }).join(''); });
  }

  function tokenize(src) {
    const s = norm(src), out = [];
    let i = 0, m;
    while (i < s.length) {
      const c = s.charAt(i), rest = s.slice(i);
      if (c === ' ') { i++; continue; }
      if (/\d/.test(c)) {
        if ((m = /^(\d+) +(\d+) ?\/ ?(\d+)/.exec(rest))) { out.push({ t: 'mix', w: m[1], a: m[2], b: m[3] }); i += m[0].length; continue; }   // vegyes szám: 2 1/3
        m = /^\d+(?:[.,]\d+)?/.exec(rest);
        out.push({ t: 'num', v: m[0] }); i += m[0].length; continue;
      }
      if ('+-*:/^%'.indexOf(c) >= 0) { out.push({ t: 'op', v: c }); i++; continue; }
      if (c === '(' || c === ')' || c === '|') { out.push({ t: c }); i++; continue; }
      throw PERR('Ismeretlen jel: „' + c + '”');
    }
    return out;
  }

  /* számlevelek: a leírt alakjukat megőrzik (0,45 ≠ 0,450 ≠ 9/20 a megjelenítésben és az elemzésben) */
  const intLeaf = function (txt) { return { type: 'num', q: new Q(BigInt(txt)), form: 'int', txt: txt }; };
  function decLeaf(txt) {
    const p = txt.replace(',', '.').split('.');
    return { type: 'num', q: new Q(BigInt(p[0] + p[1]), 10n ** BigInt(p[1].length)), form: 'dec', dp: p[1].length, txt: p[0] + ',' + p[1] };
  }
  function fracLeaf(a, b, sgn) {
    if (b === 0n) throw new M.MathError('Nullával osztás');
    return { type: 'num', q: new Q(BigInt(sgn || 1) * a, b), form: 'frac', a: a, b: b };
  }
  function mixLeaf(w, a, b) {
    if (b === 0n) throw new M.MathError('Nullával osztás');
    return { type: 'num', q: new Q(w * b + a, b), form: 'mixed', w: w, a: a, b: b };
  }
  const pctLeaf = function (l) { return { type: 'num', q: l.q.div(new Q(100n)), form: 'pct', txt: l.txt }; };
  const negLeaf = function (l) { return Object.assign({}, l, { q: l.q.neg() }); };

  /** Rekurzív leszállás: kifejezés (+,−) > tag (·,:) > előjel > hatvány (^) > tört (a/b) > elem (szám, zárójel, |abszolútérték|).
      Csomópontok: num | neg | abs | pow {b, e} | bin {op, l, r}. A zárójelben állt kifejezés p:true jelölést kap (csak a megjelenítéshez). */
  function parse(src) {
    const tk = tokenize(src);
    let pos = 0;
    const peek = function () { return tk[pos]; };
    const isOp = function (t, ops) { return !!t && t.t === 'op' && ops.indexOf(t.v) >= 0; };
    const neg = function (e) { return e.type === 'num' ? negLeaf(e) : { type: 'neg', e: e }; };

    function expr() {
      let l = term();
      while (isOp(peek(), '+-')) { const op = tk[pos++].v; l = { type: 'bin', op: op, l: l, r: term() }; }
      return l;
    }
    function term() {
      let l = unary();
      while (isOp(peek(), '*:')) { const op = tk[pos++].v; l = { type: 'bin', op: op, l: l, r: unary() }; }
      return l;
    }
    function unary() {
      if (isOp(peek(), '+')) { pos++; return unary(); }
      if (isOp(peek(), '-')) { pos++; return neg(unary()); }
      return power();
    }
    function power() {
      const b = frac();
      if (!isOp(peek(), '^')) return b;
      pos++;
      let m = false;
      if (isOp(peek(), '-')) { pos++; m = true; } else if (isOp(peek(), '+')) pos++;
      const e = power();
      return { type: 'pow', b: b, e: m ? neg(e) : e };
    }
    function frac() {
      const a = atom();
      if (!isOp(peek(), '/')) return a;
      pos++;
      const b = atom();
      const plain = function (x) { return x.type === 'num' && x.form === 'int'; };
      if (!plain(a) || !plain(b)) throw PERR('A törtvonal (/) előtt és után csak egész szám állhat. Osztáshoz a : jelet használd.');
      if (b.q.isZero()) throw new M.MathError('Nullával osztás');
      return fracLeaf(babs(a.q.n), babs(b.q.n), (a.q.n < 0n ? -1 : 1) * (b.q.n < 0n ? -1 : 1));
    }
    function atom() {
      const t = tk[pos++];
      if (!t) throw PERR('A kifejezés félbemaradt');
      if (t.t === 'num') {
        let n = /[.,]/.test(t.v) ? decLeaf(t.v) : intLeaf(t.v);
        if (isOp(peek(), '%')) { pos++; n = pctLeaf(n); }
        return n;
      }
      if (t.t === 'mix') return mixLeaf(BigInt(t.w), BigInt(t.a), BigInt(t.b));
      if (t.t === '(') {
        const e = expr();
        if (!peek() || peek().t !== ')') throw PERR('Hiányzó záró zárójel');
        pos++;
        return (e.type === 'bin' || e.type === 'neg') ? Object.assign({}, e, { p: true }) : e;
      }
      if (t.t === '|') {
        const e = expr();
        if (!peek() || peek().t !== '|') throw PERR('Hiányzik az abszolútérték záró jele (|)');
        pos++;
        return { type: 'abs', e: e };
      }
      throw PERR('Itt szám vagy nyitó zárójel hiányzik');
    }

    if (!tk.length) throw PERR('Üres kifejezés');
    const tree = expr();
    if (pos < tk.length) {
      const t = tk[pos];
      if (t.t === 'num' || t.t === 'mix') throw PERR('Két szám között hiányzik a műveleti jel');
      if (t.t === ')') throw PERR('Felesleges záró zárójel');
      if (t.t === 'op' && t.v === '/') throw PERR('Két törtvonal nem követheti egymást');
      throw PERR('Hibás kifejezés');
    }
    return tree;
  }

  function evaluate(n) {
    switch (n.type) {
      case 'num': return n.q;
      case 'neg': return evaluate(n.e).neg();
      case 'abs': return qabs(evaluate(n.e));
      case 'pow': {
        const b = evaluate(n.b), e = evaluate(n.e);
        if (!e.isInt()) throw new M.MathError('A kitevő csak egész szám lehet');
        const k = Number(e.n);
        if (Math.abs(k) > 24) throw new M.MathError('Túl nagy kitevő');
        let r = new Q(1n);
        for (let i = 0; i < Math.abs(k); i++) r = r.mul(b);
        return k < 0 ? r.recip() : r;
      }
      case 'bin': {
        const a = evaluate(n.l), b = evaluate(n.r);
        if (n.op === '+') return a.add(b);
        if (n.op === '-') return a.sub(b);
        if (n.op === '*') return a.mul(b);
        return a.div(b);
      }
    }
    throw new Error('Ismeretlen csomópont');
  }
  const val = function (n) { try { return evaluate(n); } catch (e) { return null; } };      // hibánál (pl. nullával osztás) null

  function walk(n, fn) {
    fn(n);
    if (n.type === 'bin') { walk(n.l, fn); walk(n.r, fn); }
    else if (n.type === 'neg' || n.type === 'abs') walk(n.e, fn);
    else if (n.type === 'pow') { walk(n.b, fn); walk(n.e, fn); }
  }
  const leaves = function (n) { const o = []; walk(n, function (x) { if (x.type === 'num') o.push(x); }); return o; };

  /* ===================== MEGJELENÍTÉS (HTML/CSS) ===================== */
  const PREC = { '+': 1, '-': 1, '*': 2, ':': 2 };
  const OPJEL = { '+': '+', '-': '−', '*': '·', ':': ':' };
  const hasFrac = function (n) {
    switch (n.type) {
      case 'num': return n.form === 'frac' || n.form === 'mixed';
      case 'neg': case 'abs': return hasFrac(n.e);
      case 'pow': return hasFrac(n.b);
      case 'bin': return hasFrac(n.l) || hasFrac(n.r);
    }
    return false;
  };
  const fracHtml = function (a, b) { return '<span class="sz-f"><span class="sz-n">' + a + '</span><span class="sz-d">' + b + '</span></span>'; };
  const parHtml = function (inner, big) { return '<span class="sz-p' + (big ? ' sz-b' : '') + '">(</span>' + inner + '<span class="sz-p' + (big ? ' sz-b' : '') + '">)</span>'; };
  const barHtml = function (big) { return '<span class="sz-bar' + (big ? ' sz-b' : '') + '">|</span>'; };

  function leafHtml(l) {
    const sg = l.q.n < 0n ? '<span class="sz-s">−</span>' : '';
    if (l.form === 'frac') return sg + fracHtml(l.a, l.b);
    if (l.form === 'mixed') return sg + '<span>' + l.w + '</span>' + fracHtml(l.a, l.b);
    if (l.form === 'pct') return sg + '<span>' + l.txt + '%</span>';
    return sg + '<span>' + l.txt + '</span>';
  }
  function go(x) {
    switch (x.type) {
      case 'num': return leafHtml(x);
      case 'neg': return '<span class="sz-s">−</span>' + (x.e.type === 'bin' ? parHtml(go(x.e), hasFrac(x.e)) : go(x.e));
      case 'abs': { const big = hasFrac(x.e); return barHtml(big) + go(x.e) + barHtml(big); }
      case 'pow': {
        const b = x.b;
        const need = b.type === 'bin' || b.type === 'neg' || (b.type === 'num' && (b.q.n < 0n || b.form === 'frac' || b.form === 'mixed' || b.form === 'pct'));
        return (need ? parHtml(go(b), hasFrac(b)) : go(b)) + '<sup class="sz-e">' + (x.e.type === 'bin' ? parHtml(go(x.e), false) : go(x.e)) + '</sup>';
      }
      case 'bin': {
        const p = PREC[x.op];
        const lNeed = x.l.type === 'bin' && (PREC[x.l.op] < p || !!x.l.p);
        const rNeed = x.r.type === 'bin' ? (PREC[x.r.op] <= p || !!x.r.p) : (x.r.type === 'neg' || (x.r.type === 'num' && x.r.q.n < 0n));
        const L = go(x.l), R = go(x.r);
        return (lNeed ? parHtml(L, hasFrac(x.l)) : L) + '<span class="sz-o">' + OPJEL[x.op] + '</span>' + (rNeed ? parHtml(R, hasFrac(x.r)) : R);
      }
    }
    return '';
  }
  const html = function (tree) { return '<span class="sz-m">' + go(tree) + '</span>'; };
  /** Kifejezés emeletes alakban (a = b = c is lehet). Értelmezhetetlen részt a beírt szöveggel jelez. */
  function htmlSzoveg(text) {
    return String(text).split('=').map(function (s) {
      try { return html(parse(s)); } catch (e) { return '<span class="sz-hiba">' + esc(s.trim()) + '</span>'; }
    }).join('<span class="sz-o">=</span>');
  }

  /* ===================== LÉPÉSLÁNC ===================== */
  /** „a = b = c” → részek (mindegyik külön értelmezve). ok: minden rész értelmezhető. */
  function chain(text) {
    const parts = norm(text).split('=').map(function (s) { return s.trim(); }).map(function (s) {
      if (!s) return { src: s, tree: null, err: 'Üres tag' };
      try { return { src: s, tree: parse(s) }; } catch (e) { return { src: s, tree: null, err: e.message }; }
    });
    return { parts: parts, ok: parts.every(function (p) { return !!p.tree; }), ures: !String(text == null ? '' : text).trim() };
  }
  const utolso = function (ch) { const p = ch.parts[ch.parts.length - 1]; return p ? p.tree : null; };
  /** A lánc utolsó tagja egyetlen szám-e, és egyenlő-e a várt értékkel (bármilyen egyenértékű alakban). */
  function vegJo(ch, q) { const t = utolso(ch); return !!t && t.type === 'num' && t.q.eq(q); }
  const vanResz = function (ch, pred) { return ch.parts.some(function (p) { return !!p.tree && pred(p.tree); }); };

  /** Pontos szerkezet (az értékekkel): két ugyanolyan felépítésű kifejezés azonos szövege. */
  function exact(n) {
    switch (n.type) {
      case 'num': return n.q.toString();
      case 'neg': return 'N(' + exact(n.e) + ')';
      case 'abs': return 'A(' + exact(n.e) + ')';
      case 'pow': return 'P(' + exact(n.b) + ',' + exact(n.e) + ')';
      case 'bin': return '(' + exact(n.l) + n.op + exact(n.r) + ')';
    }
    return '?';
  }
  /** Műveleti sorrend: T az S-ből úgy áll elő, hogy egy vagy több, a sorrend szerint elvégezhető műveletet számmal helyettesítünk
      (a helyettesítő szám értéke nem számít: a számolási hibát az eredmény pontozza, nem a sorrend). */
  function reduces(S, T) {
    if (T.type === 'num') return S.type === 'num' ? S.q.eq(T.q) : true;
    if (S.type === 'num' || S.type !== T.type) return false;
    if (S.type === 'bin') return S.op === T.op && reduces(S.l, T.l) && reduces(S.r, T.r);
    if (S.type === 'pow') return reduces(S.b, T.b) && reduces(S.e, T.e);
    return reduces(S.e, T.e);                                    // neg, abs
  }
  /** Helyes-e a műveleti sorrend a láncban? Minden tag a megelőzőből sorrendhelyesen áll elő, és legalább egy közbülső (még nem
      szám) alak is látszik. A feladat kifejezésének újragépelése nem számít lépésnek. */
  function sorrendJo(start, ch) {
    if (!ch.ok) return false;
    let prev = start, volt = false;
    for (let i = 0; i < ch.parts.length; i++) {
      const t = ch.parts[i].tree;
      if (exact(t) === exact(prev)) continue;
      if (!reduces(prev, t)) return false;
      if (t.type !== 'num') volt = true;
      prev = t;
    }
    return volt;
  }

  /** Kanonikus alak az egyenértékű tervek összehasonlításához: az összeadás/szorzás tagjainak sorrendje és csoportosítása nem számít,
      a számok érték szerint egyeznek (0,6 = 3/5 = 6/10), a szorzás/osztás „· 1/2” és „: 2” különbözik (azt külön tervként kell felvenni). */
  function canon(n) {
    if (n.type === 'num') return n.q.toString();
    if (n.type === 'abs') return 'A(' + canon(n.e) + ')';
    if (n.type === 'pow') return 'P(' + canon(n.b) + ',' + canon(n.e) + ')';
    if (n.type === 'neg') return 'S[' + sumKeys(n, 1).sort().join(',') + ']';
    return (n.op === '+' || n.op === '-') ? 'S[' + sumKeys(n, 1).sort().join(',') + ']' : 'M[' + prodKeys(n, false).sort().join(',') + ']';
  }
  function sumKeys(n, sign) {
    if (n.type === 'bin' && (n.op === '+' || n.op === '-')) return sumKeys(n.l, sign).concat(sumKeys(n.r, n.op === '+' ? sign : -sign));
    if (n.type === 'neg') return sumKeys(n.e, -sign);
    if (n.type === 'num') return ['+' + (sign < 0 ? n.q.neg() : n.q).toString()];
    return [(sign < 0 ? '-' : '+') + canon(n)];
  }
  function prodKeys(n, inv) {
    if (n.type === 'bin' && (n.op === '*' || n.op === ':')) return prodKeys(n.l, inv).concat(prodKeys(n.r, n.op === ':' ? !inv : inv));
    if (n.type === 'num') return [(inv && !n.q.isZero() ? n.q.recip() : n.q).toString()];
    return [(inv ? '/' : '*') + canon(n)];
  }
  /** Az első tag (a „megoldási terv”) egyezik-e valamelyik elfogadott alakkal? */
  function tervJo(ch, elfogadott) {
    const t = ch.parts[0] && ch.parts[0].tree;
    if (!t || t.type === 'num') return false;
    const c = canon(t);
    return elfogadott.some(function (a) { return canon(parse(a)) === c; });
  }

  /** |q| = n · 10^k valamilyen egész k-ra? (részletszorzatok keresése, a tizedesvessző helyétől függetlenül) */
  function tizHatv(q, n) {
    const a = qabs(q);
    for (let k = -9; k <= 9; k++) {
      if (a.eq(k >= 0 ? new Q(n * 10n ** BigInt(k)) : new Q(n, 10n ** BigInt(-k)))) return true;
    }
    return false;
  }
  /** Nagyságrend: 10^k ≤ |q| < 10^(k+1) → k (nullánál null). A tizedesvessző helyének ellenőrzéséhez. */
  function nagysag(q) {
    if (q.isZero()) return null;
    const ten = new Q(10n), one = new Q(1n);
    let x = qabs(q), k = 0;
    while (x.sub(ten).n >= 0n) { x = x.div(ten); k++; }
    while (x.sub(one).n < 0n) { x = x.mul(ten); k--; }
    return k;
  }

  /* ===================== STÍLUS ===================== */
  const CSS =
    '.sz{position:relative;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.sz h2{margin:0 0 8px;font-size:22px;color:#34d399}.sz p{margin:0 0 10px;line-height:1.5}' +
    '.sz-felad{padding:10px 14px;border:1px solid #0e7490;border-radius:12px;background:rgba(8,47,73,.5);font-size:16px;color:#bae6fd}' +
    // emeletes tört, hatvány, zárójel (HTML/CSS: minden böngészőben, MathML nélkül is működik)
    '.sz-m{white-space:nowrap}' +
    '.sz-f{display:inline-block;vertical-align:middle;text-align:center;line-height:1.25;margin:0 .1em}' +
    '.sz-f>span{display:block;padding:0 .2em}.sz-f>.sz-n{border-bottom:.09em solid currentColor}' +
    '.sz-o{margin:0 .28em}.sz-s{margin-right:.08em}' +
    '.sz-p,.sz-bar{display:inline-block;vertical-align:middle;font-weight:300}.sz-p{transform:scaleX(.8)}.sz-bar{margin:0 .08em}' +
    '.sz-p.sz-b,.sz-bar.sz-b{font-size:2.3em;line-height:.85}' +
    '.sz-e{font-size:.72em;line-height:0;position:relative;top:-.5em;margin-left:.06em}' +
    '.sz-pt{position:relative;display:inline-block}.sz-pt:after{content:"";position:absolute;left:50%;top:-.02em;width:.15em;height:.15em;margin-left:-.075em;border-radius:50%;background:currentColor}' +
    '.sz-hiba{color:#fca5a5;text-decoration:underline;text-decoration-style:dotted}' +
    // tételek
    '.sz-tetel{margin:0 0 12px;padding:12px 14px;border:1px solid #334155;border-radius:12px;background:rgba(15,23,42,.6)}' +
    '.sz-tetel.ok{border-color:#34d399;background:rgba(16,185,129,.1)}.sz-tetel.rossz{border-color:#f87171;background:rgba(248,113,113,.08)}' +
    '.sz-fej{font-size:20px;color:#e0f2fe;line-height:1.5}.sz-kod{margin-right:10px;font-style:italic;font-weight:700;color:#94a3b8}' +
    '.sz-max{float:right;margin-left:10px;font-size:13px;color:#94a3b8}' +
    '.sz-in{box-sizing:border-box;display:block;width:100%;margin-top:8px;padding:10px 12px;border:1px solid #475569;border-radius:10px;background:#0f172a;color:#f1f5f9;font:inherit;font-size:18px}' +
    '.sz-in:focus{outline:none;border-color:#34d399;box-shadow:0 0 0 2px rgba(52,211,153,.3)}.sz-in:disabled{opacity:.75}' +
    '.sz-pv{min-height:1.5em;margin-top:2px;padding-top:.55em;padding-bottom:.15em;overflow-x:auto;-webkit-overflow-scrolling:touch;font-size:19px;color:#a5f3fc}' +
    '.sz-pv:empty{min-height:0;padding:0;margin:0}.sz-jel{min-height:1.2em;margin-top:4px;font-size:14px;font-weight:700}.sz-tetel.ok .sz-jel{color:#34d399}.sz-tetel.rossz .sz-jel{color:#f87171}' +
    // billentyűk
    '.sz-bill{margin:6px 0 2px}.sz-bt{min-width:42px;height:40px;margin:0 6px 6px 0;padding:0 10px;border:1px solid #475569;border-radius:10px;background:#1e293b;color:#f1f5f9;' +
    'font:600 18px/1 system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}.sz-bt:active{background:#334155}.sz-bt:disabled{opacity:.35}.sz-bt.txt{font-size:14px}' +
    '.sz-sugo{margin:2px 0 6px;font-size:13px;line-height:1.5;color:#94a3b8}' +
    // pontozási táblázat, gombok, üzenet
    '.sz-tabla{width:100%;margin:12px 0 4px;border-collapse:collapse;font-size:14px}.sz-tabla td{padding:7px 10px;border:1px solid #475569;background:#1e293b;color:#cbd5e1}' +
    '.sz-tabla td:first-child{white-space:nowrap}.sz-tabla td:last-child{text-align:right;white-space:nowrap;font-weight:700}' +
    '.sz-msg{min-height:1.6em;margin:10px 0 2px;font-weight:600}.sz-msg.ok{color:#34d399}.sz-msg.nem{color:#fbbf24}' +
    '.sz-gombok{margin-top:8px}.sz-gomb{margin:0 10px 8px 0;padding:10px 18px;border:0;border-radius:12px;background:#34d399;color:#0f172a;font-size:15px;font-weight:700;cursor:pointer}' +
    '.sz-gomb.kek{background:#38bdf8}.sz-gomb.szurke{background:transparent;color:#cbd5e1;border:1px solid #64748b}.sz-gomb:disabled{opacity:.4;cursor:not-allowed}' +
    // értékelő nézet
    '.sz-pontnagy{margin:6px 0 14px;font-size:40px;font-weight:800;color:#34d399;text-align:center}' +
    '.sz-ert{margin:0 0 10px;padding:10px 14px;border:1px solid #334155;border-left-width:6px;border-radius:12px;background:rgba(15,23,42,.6)}' +
    '.sz-ert.ok{border-color:#34d399}.sz-ert.rossz{border-color:#f87171}' +
    '.sz-valasz{margin-top:4px;font-size:19px}.sz-ert.ok .sz-valasz{color:#6ee7b7}.sz-ert.rossz .sz-valasz{color:#fca5a5}' +
    '.sz-pontsor{margin-top:6px;font-size:15px;font-weight:700}.sz-ert.ok .sz-pontsor{color:#34d399}.sz-ert.rossz .sz-pontsor{color:#f87171}' +
    '.sz-tagok{margin-top:2px;font-size:13px;color:#94a3b8}.sz-tagok .jo{color:#34d399}.sz-tagok .rossz{color:#f87171}';
  let cssKesz = false;
  function css() {
    if (cssKesz || !g.UJITAS || !g.UJITAS.css) return;
    cssKesz = true; g.UJITAS.css('sz-stilus', CSS);
  }

  /** Pontozási táblázat a feladatlap alján (a nyomtatott lap szürke téglalapja): sorok: [jelölés, szöveg, pont]. */
  function tabla(sorok) {
    return '<table class="sz-tabla">' + sorok.map(function (s) { return '<tr><td>' + esc(s[0]) + '</td><td>' + esc(s[1]) + '</td><td>' + esc(s[2]) + '</td></tr>'; }).join('') + '</table>';
  }
  /** Értékelő nézet kerete: nagy pontszám + sorok + Bezárás. Visszaadja a Bezárás gombot. */
  function ertekeloNezet(host, e, sorokHtml, jegyzet) {
    host.innerHTML = '<div class="sz"><h2>Értékelés</h2><div class="sz-pontnagy">Elért pontszám: ' + e.pont + ' / ' + e.max + '</div>' + sorokHtml +
      (jegyzet ? '<p style="text-align:center;font-size:14px;color:#94a3b8">' + jegyzet + '</p>' : '') +
      '<div class="sz-gombok" style="text-align:center"><button type="button" class="sz-gomb" data-sz="bezar">Bezárás</button></div></div>';
    const b = host.querySelector('[data-sz="bezar"]'); b.focus();
    return b;
  }
  const tagokHtml = function (tagok) {
    return tagok && tagok.length ? '<div class="sz-tagok">' + tagok.map(function (t) {
      return esc(t.nev) + ': <b class="' + (t.pont === t.max ? 'jo' : 'rossz') + '">' + t.pont + '/' + t.max + '</b>';
    }).join(' · ') + '</div>' : '';
  };

  /* ===================== BILLENTYŰK ===================== */
  // [kiírt jel, beszúrt szöveg, súgó, osztály]
  const KEYS = [
    ['+', '+', 'összeadás'], ['−', '−', 'kivonás'], ['·', '·', 'szorzás'], [':', ':', 'osztás'], ['=', '=', 'egyenlőségjel'],
    ['(', '(', 'nyitó zárójel'], [')', ')', 'záró zárójel'], ['/', '/', 'törtvonal'], [',', ',', 'tizedesvessző'],
    ['^', '^', 'hatvány (pl. 4^5)'], ['²', '²', 'négyzet'], ['³', '³', 'köb'], ['|', '|', 'abszolútérték jele (a szám elé és mögé is)'],
    ['szóköz', ' ', 'szóköz (vegyes szám: egész, szóköz, tört)', 'txt'], ['⌫', 'BACK', 'törlés', 'txt'],
  ];
  const billentyuHtml = function () {
    return '<div class="sz-bill" role="group" aria-label="Műveleti jelek" hidden>' + KEYS.map(function (k) {
      return '<button type="button" class="sz-bt' + (k[3] ? ' ' + k[3] : '') + '" data-k="' + esc(k[1]) + '" title="' + esc(k[2]) + '" aria-label="' + esc(k[2]) + '">' + k[0] + '</button>';
    }).join('') + '</div>' +
      '<p class="sz-sugo">Tört: <b>/</b> jellel (pl. 3/4) · vegyes szám: egész, <b>szóköz</b>, tört (pl. 2 1/3) · hatvány: <b>²</b> <b>³</b> gombbal vagy <b>^</b> jellel (pl. 4^5) · ' +
      'abszolútérték: <b>|</b> jel a szám előtt és után (pl. |−3|) · a lépéseket egyenlőségjellel kapcsold össze, az utolsó tag a végeredmény.</p>';
  };
  /** Szöveg beírása a kurzor helyére (a kijelölést felülírja), majd input esemény. */
  function beir(t, ch) {
    const s = t.selectionStart == null ? t.value.length : t.selectionStart, en = t.selectionEnd == null ? s : t.selectionEnd;
    t.value = t.value.slice(0, s) + ch + t.value.slice(en);
    t.setSelectionRange(s + ch.length, s + ch.length);
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function torol(t) {
    const s = t.selectionStart == null ? t.value.length : t.selectionStart, en = t.selectionEnd == null ? s : t.selectionEnd;
    let a = s;
    if (s === en) { if (s === 0) return; a = s - 1; }
    t.value = t.value.slice(0, a) + t.value.slice(en);
    t.setSelectionRange(a, a);
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ===================== KÖZÖS FELADAT-KERET ===================== */
  /** Tételes feladatlap: minden tételhez egy beviteli mező. cfg:
        id, cim            a feladat azonosítója (= a gyűjtő lap beállításának id-je) és rövid neve
        felad              a feladat szövege (HTML)
        mod                'lanc' (alapértelmezett: gombsor + emeletes előnézet, a = b = c lánc) | 'szoveg' (egyszerű szöveges válasz)
        tabla              pontozási táblázat sorai: [[jelölés, szöveg, pont], ...]
        tetelek            [{ kod, max, elo (HTML), ertekel(szoveg, lanc) → { pont, tagok: [{nev, pont, max}] } }]
      Az Ellenőrzés tételenként zöld/piros jelet ad (a pontot nem mutatja; a teljesen jó tételt lezárja), az Értékelés mutatja a pontokat. */
  function urlap(cfg) {
    const lanc = cfg.mod !== 'szoveg', egyenlo = lanc && cfg.egyenlo !== false;     // egyenlo:false: a tétel szövege után nem áll „=” jel
    const max = cfg.tetelek.reduce(function (a, t) { return a + t.max; }, 0);

    function indit(host, api) {
      css();
      const st = { valasz: {}, zarolt: {}, vege: false, ellenorzesek: 0, ujra: 0, start: Date.now() };
      cfg.tetelek.forEach(function (t) { st.valasz[t.kod] = ''; st.zarolt[t.kod] = false; });

      host.innerHTML = '<div class="sz"><h2>' + esc(cfg.cim) + '</h2><p class="sz-felad">' + cfg.felad + '</p>' +
        cfg.tetelek.map(function (t) {
          return '<div class="sz-tetel" data-t="' + t.kod + '"><div class="sz-fej"><span class="sz-max">' + t.max + ' pont</span><span class="sz-kod">' + t.kod + ')</span>' +
            t.elo + (egyenlo ? '<span class="sz-o">=</span>' : '') + '</div>' +
            '<input class="sz-in" data-in="' + t.kod + '" type="text" inputmode="' + (lanc ? 'decimal' : 'text') + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="' + t.kod + ') megoldás">' +
            (lanc ? '<div class="sz-pv" data-pv="' + t.kod + '"></div>' : '') + '<div class="sz-jel" data-jel="' + t.kod + '"></div></div>';
        }).join('') +
        (lanc ? billentyuHtml() : '') + tabla(cfg.tabla) +
        '<div class="sz-msg" data-sz="msg" role="status" aria-live="polite"></div>' +
        '<div class="sz-gombok"><button type="button" class="sz-gomb kek" data-sz="ellenorzes">Ellenőrzés</button>' +
        '<button type="button" class="sz-gomb szurke" data-sz="ujra">Újra</button><button type="button" class="sz-gomb" data-sz="ertekeles">Értékelés</button></div></div>';

      const gyoker = host.querySelector('.sz');            // az eseménykezelők ezen vannak (a host a következő feladatnál is ugyanaz az elem)
      const $ = function (n) { return host.querySelector('[data-sz="' + n + '"]'); };
      const tetelEl = function (k) { return host.querySelector('[data-t="' + k + '"]'); };
      const inEl = function (k) { return host.querySelector('[data-in="' + k + '"]'); };
      const msg = $('msg');
      const uzenet = function (s, o) { msg.textContent = s; msg.className = 'sz-msg' + (o ? ' ' + o : ''); };
      let utolsoMezo = null;

      /* ----- gépelés ----- */
      gyoker.addEventListener('input', function (e) {
        const t = e.target;
        if (!t.classList || !t.classList.contains('sz-in')) return;
        if (t.value.indexOf('*') >= 0) { const p = t.selectionStart; t.value = t.value.replace(/\*/g, '·'); t.setSelectionRange(p, p); }
        const k = t.getAttribute('data-in');
        st.valasz[k] = t.value;
        if (lanc) host.querySelector('[data-pv="' + k + '"]').innerHTML = t.value.trim() ? '<span class="sz-m">' + htmlSzoveg(t.value) + '</span>' : '';
        if (!st.zarolt[k]) { tetelEl(k).className = 'sz-tetel'; host.querySelector('[data-jel="' + k + '"]').textContent = ''; }
        uzenet('', '');
      });
      const bill = gyoker.querySelector('.sz-bill');
      gyoker.addEventListener('focusin', function (e) {
        if (!e.target.classList || !e.target.classList.contains('sz-in')) return;
        utolsoMezo = e.target;
        if (bill) {                                                  // a gombsor közvetlenül a kiválasztott mező (és előnézete) alatt jelenik meg
          const tet = e.target.closest('.sz-tetel');
          if (bill.parentNode !== tet) tet.insertBefore(bill, tet.querySelector('.sz-jel'));
          bill.hidden = false;
        }
      });
      gyoker.addEventListener('keydown', function (e) {                // Enter: következő mező
        if (e.key !== 'Enter' || !e.target.classList || !e.target.classList.contains('sz-in')) return;
        e.preventDefault();
        const all = [].slice.call(host.querySelectorAll('.sz-in')), nx = all[all.indexOf(e.target) + 1];
        if (nx && !nx.disabled) nx.focus(); else e.target.blur();
      });
      /* ----- billentyűsor: a jel a kurzor helyére kerül ----- */
      gyoker.addEventListener('mousedown', function (e) { if (e.target.closest && e.target.closest('.sz-bt')) e.preventDefault(); });   // a fókusz maradjon a mezőn
      gyoker.addEventListener('click', function (e) {
        const b = e.target.closest ? e.target.closest('.sz-bt') : null;
        if (!b || b.disabled || st.vege) return;
        let t = (utolsoMezo && !utolsoMezo.disabled && gyoker.contains(utolsoMezo)) ? utolsoMezo : null;
        if (!t) t = [].slice.call(host.querySelectorAll('.sz-in')).filter(function (x) { return !x.disabled; })[0];
        if (!t) return;
        t.focus();
        if (b.getAttribute('data-k') === 'BACK') torol(t); else beir(t, b.getAttribute('data-k'));
      });

      /* ----- pontozás ----- */
      function szamol() {
        const reszek = cfg.tetelek.map(function (t) {
          const sz = st.valasz[t.kod] || '';
          const r = t.ertekel(sz, lanc ? chain(sz) : null);
          return { kod: t.kod, nev: t.kod + ')', pont: Math.min(r.pont, t.max), max: t.max, tagok: r.tagok || [], valasz: sz };
        });
        return { reszek: reszek, pont: reszek.reduce(function (a, r) { return a + r.pont; }, 0), max: max };
      }
      function zar(be) {
        Object.keys(st.zarolt).forEach(function (k) { inEl(k).disabled = be || st.zarolt[k]; });
        $('ellenorzes').disabled = be || cfg.tetelek.every(function (t) { return st.zarolt[t.kod]; });
        [].slice.call(host.querySelectorAll('.sz-bt')).forEach(function (b) { b.disabled = be; });
      }

      $('ellenorzes').addEventListener('click', function () {
        if (st.vege) return;
        st.ellenorzesek++;
        const r = szamol();
        let osszes = true;
        r.reszek.forEach(function (x) {
          const jo = x.pont === x.max;
          if (!jo) osszes = false;
          tetelEl(x.kod).className = 'sz-tetel ' + (jo ? 'ok' : 'rossz');
          host.querySelector('[data-jel="' + x.kod + '"]').textContent = jo ? '✔ helyes' : '✘ még nem helyes';
          if (jo) { st.zarolt[x.kod] = true; inEl(x.kod).disabled = true; }
        });
        zar(false);
        uzenet(osszes ? '✔ Minden megoldásod helyes. Az elért pontszámot az Értékelés gombbal nézheted meg.'
          : '✘ A pirossal jelölt megoldások még nem helyesek. Javíthatod őket, majd újra ellenőrizheted.', osszes ? 'ok' : 'nem');
      });
      $('ujra').addEventListener('click', function () {
        if (st.vege) return;
        st.ujra++;
        cfg.tetelek.forEach(function (t) {
          st.valasz[t.kod] = ''; st.zarolt[t.kod] = false;
          const i = inEl(t.kod); i.value = ''; i.disabled = false;
          tetelEl(t.kod).className = 'sz-tetel'; host.querySelector('[data-jel="' + t.kod + '"]').textContent = '';
          if (lanc) host.querySelector('[data-pv="' + t.kod + '"]').innerHTML = '';
        });
        zar(false); uzenet('', '');
      });
      $('ertekeles').addEventListener('click', async function () {
        if (st.vege) return;
        const igen = await api.megerosit({ cim: 'Értékelés', uzenet: 'Biztosan befejezed a feladatot? Az értékelés után a lap bezárul.', igen: 'Igen, értékelem', nem: 'Még nem' });
        if (!igen || st.vege) return;
        eredmenyNezet(lezarEredmeny('ertekeles'));
      });

      /* ----- eredmény ----- */
      function lezarEredmeny(ok) {
        if (!st.vege) { st.vege = true; zar(true); }
        const r = szamol();
        return {
          feladat: cfg.id, cim: cfg.cim, pont: r.pont, max: r.max, helyes: r.pont === r.max,
          ellenorzesek: st.ellenorzesek, ujra: st.ujra, lezaras: ok, mp: Math.round((Date.now() - st.start) / 1000),
          reszek: r.reszek.map(function (x) { return { kod: x.kod, nev: x.nev, pont: x.pont, max: x.max }; }),
          valaszok: Object.assign({}, st.valasz), tagok: r.reszek.reduce(function (o, x) { o[x.kod] = x.tagok; return o; }, {}),
        };
      }
      function eredmenyNezet(e) {
        const sorok = cfg.tetelek.map(function (t, i) {
          const r = e.reszek[i], jo = r.pont === r.max, sz = e.valaszok[t.kod] || '';
          return '<div class="sz-ert ' + (jo ? 'ok' : 'rossz') + '"><div class="sz-fej"><span class="sz-kod">' + t.kod + ')</span>' + t.elo + (egyenlo ? '<span class="sz-o">=</span>' : '') + '</div>' +
            '<div class="sz-valasz">' + (sz.trim() ? (lanc ? '<span class="sz-m">' + htmlSzoveg(sz) + '</span>' : esc(sz)) : '<i>nincs válasz</i>') + '</div>' +
            '<div class="sz-pontsor">' + (jo ? '✔ ' : '✘ ') + r.pont + ' / ' + r.max + ' pont</div>' + tagokHtml(e.tagok[t.kod]) + '</div>';
        }).join('');
        ertekeloNezet(host, e, sorok).addEventListener('click', function () { api.kesz(e); });
      }

      return { lezar: function (ok) { return lezarEredmeny(ok || 'lezaras'); } };
    }
    return { cim: cfg.cim, max: max, indit: indit };
  }

  /** Feladat regisztrálása a gyűjtő lapnál: window.UJITAS_FELADATOK[id]. */
  function regisztral(id, feladat, teszt) {
    g.UJITAS_FELADATOK = g.UJITAS_FELADATOK || {};
    g.UJITAS_FELADATOK[id] = Object.assign({ _teszt: teszt }, feladat);
  }

  g.SZAMOK_BEVITEL = {
    norm: norm, parse: parse, evaluate: evaluate, val: val, walk: walk, leaves: leaves, frQ: frQ, qabs: qabs,
    html: html, htmlSzoveg: htmlSzoveg, chain: chain, utolso: utolso, vegJo: vegJo, vanResz: vanResz,
    exact: exact, reduces: reduces, sorrendJo: sorrendJo, canon: canon, tervJo: tervJo, tizHatv: tizHatv, nagysag: nagysag,
    css: css, tabla: tabla, ertekeloNezet: ertekeloNezet, tagokHtml: tagokHtml, urlap: urlap, regisztral: regisztral, esc: esc,
  };
})(typeof window !== 'undefined' ? window : globalThis);
