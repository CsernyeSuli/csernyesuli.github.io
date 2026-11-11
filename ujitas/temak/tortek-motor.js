/**
 * temak/tortek-motor.js – műveletek törtekkel és tizedes törtekkel: pontos számolás, lépéselemzés, megoldásmenet.
 * Felület nélküli (csak logika), a téma-modul és a tesztek használják. Globális neve: TORTEK_MOTOR.
 *
 * Beírás (a diák és a feladatok is így íródnak):
 *   2/3   törtvonal (a számláló és a nevező csak egész szám)      :   osztás
 *   · * × szorzás        0,75 vagy 0.75 tizedes tört              ( ) [ ] { }  zárójel
 * A törtvonal erősebb, mint a szorzás és az osztás, a tört egyetlen számnak számít (2/3·27 egy művelet).
 *
 * Lépés = „részszámítások” + „új műveletsor”. A részszámítás (pontosvesszővel elválasztva):
 *   művelet = eredmény                  2/3·27 = 18
 *   művelet = közbülső alak = eredmény  1/2+2/5 = 5/10+4/10 = 9/10   (a közbülső alak értéke egyezzen)
 *   szám = egyenlő alakú szám           100/80 = 5/4 · 0,75 = 3/4     (egyszerűsítés, átalakítás)
 *   osztás = szorzás a reciprokkal      2/3:1/2 = 2/3·2/1
 *
 * A számolás pontos (BigInt-tört), nincs kerekítés.
 */
(function (g) {
  'use strict';

  /* ===================== PONTOS TÖRT ===================== */
  class MathError extends Error {}
  class ParseError extends Error {}

  const abs = function (x) { return x < 0n ? -x : x; };
  const gcd = function (a, b) { a = abs(a); b = abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };

  class Q {
    constructor(n, d) {
      if (d === undefined) d = 1n;
      if (d === 0n) throw new MathError('Nullával osztás');
      if (d < 0n) { n = -n; d = -d; }
      const k = gcd(n, d) || 1n;
      this.n = n / k; this.d = d / k;
    }
    add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Q(this.n * o.n, this.d * o.d); }
    div(o) { if (o.n === 0n) throw new MathError('Nullával osztás'); return new Q(this.n * o.d, this.d * o.n); }
    neg() { return new Q(-this.n, this.d); }
    recip() { if (this.n === 0n) throw new MathError('Nullával osztás'); return new Q(this.d, this.n); }
    eq(o) { return this.n === o.n && this.d === o.d; }
    isInt() { return this.d === 1n; }
    isZero() { return this.n === 0n; }
    toString() { return this.d === 1n ? String(this.n) : this.n + '/' + this.d; }
    toJSON() { return this.toString(); }
  }

  function isFiniteDec(q) {                       // csak 2 és 5 szerepel a nevezőben
    let d = q.d;
    while (d % 2n === 0n) d /= 2n;
    while (d % 5n === 0n) d /= 5n;
    return d === 1n;
  }
  function decStr(q) {                            // pl. −0,04 (tizedesvessző, valódi mínusz)
    const neg = q.n < 0n, n = abs(q.n);
    let k = 0, p = 1n;
    while (p % q.d !== 0n) { p *= 10n; k++; if (k > 60) throw new MathError('Nem véges tizedes tört'); }
    let s = (n * (p / q.d)).toString();
    if (k > 0) { s = s.padStart(k + 1, '0'); s = s.slice(0, -k) + ',' + s.slice(-k); }
    return (neg ? '−' : '') + s;
  }

  /* ===================== SZÁM-LEVELEK ===================== */
  // form: 'int' | 'dec' | 'frac'. A tört a leírt alakját is megőrzi (a, b, sgn), mert 100/80 ≠ 5/4 megjelenítésben.
  const leafInt  = function (q) { return { type: 'num', q: q, form: 'int' }; };
  const leafDec  = function (q) { return { type: 'num', q: q, form: 'dec' }; };
  const leafFrac = function (a, b, sgn) {
    sgn = sgn || 1;
    return { type: 'num', q: new Q(BigInt(sgn) * a, b), form: 'frac', a: a, b: b, sgn: sgn };
  };
  function leafFromQ(q, prefer) {                 // prefer: 'dec' (véges tizedes tört, ha lehet) | 'frac'
    if (q.d === 1n) return leafInt(q);
    if (prefer === 'dec' && isFiniteDec(q)) return leafDec(q);
    return leafFrac(abs(q.n), q.d, q.n < 0n ? -1 : 1);
  }
  function negLeaf(l) {
    const q = l.q.neg();
    return l.form === 'frac' ? Object.assign({}, l, { q: q, sgn: -l.sgn }) : Object.assign({}, l, { q: q });
  }
  function leafText(l) {
    if (l.form === 'frac') return (l.sgn < 0 ? '−' : '') + l.a + '/' + l.b;
    if (l.form === 'dec') return decStr(l.q);
    return (l.q.n < 0n ? '−' : '') + abs(l.q.n);
  }
  const leafCanon = function (l) { return l.q.toString(); };

  /* ===================== BEOLVASÁS ===================== */
  function normalizeInput(s) {
    return String(s)
      .replace(/[\u2212\u2013\u2014]/g, '-')
      .replace(/[×·∙⋅*]/g, '*')
      .replace(/[÷:]/g, ':')
      .replace(/\u2044/g, '/')
      .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')')
      .replace(/\u00a0/g, ' ');
  }

  function tokenize(src) {
    const s = normalizeInput(src);
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/\d/.test(c)) {
        const m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i));
        tokens.push({ t: 'num', v: m[0] }); i += m[0].length; continue;
      }
      if ('+-*:/'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }
      if (c === '(' || c === ')') { tokens.push({ t: c }); i++; continue; }
      throw new ParseError('Ismeretlen jel: „' + c + '”');
    }
    return tokens;
  }

  function numLeaf(text) {
    const t = text.replace(',', '.');
    if (t.indexOf('.') < 0) return leafInt(new Q(BigInt(t)));
    const parts = t.split('.');
    return leafDec(new Q(BigInt(parts[0] + parts[1]), 10n ** BigInt(parts[1].length)));
  }

  /** Rekurzív leszállás: kifejezés (+,-) > tag (·,:) > előjel > tört (a/b) > elem. */
  function parse(src) {
    const tokens = tokenize(src);
    let pos = 0;
    const peek = function () { return tokens[pos]; };
    const isOp = function (t, ops) { return t && t.t === 'op' && ops.indexOf(t.v) >= 0; };

    function expr() {
      let left = term();
      while (isOp(peek(), '+-')) { const op = tokens[pos++].v; left = { type: 'bin', op: op, l: left, r: term() }; }
      return left;
    }
    function term() {
      let left = unary();
      while (isOp(peek(), '*:')) { const op = tokens[pos++].v; left = { type: 'bin', op: op, l: left, r: unary() }; }
      return left;
    }
    function unary() {
      if (isOp(peek(), '+')) { pos++; return unary(); }
      if (isOp(peek(), '-')) {
        pos++;
        const e = unary();
        return e.type === 'num' ? negLeaf(e) : { type: 'neg', e: e };
      }
      return fraction();
    }
    function fraction() {
      const a = primary();
      if (!isOp(peek(), '/')) return a;
      pos++;
      const b = primary();
      const plain = function (x) { return x.type === 'num' && x.form === 'int'; };
      if (!plain(a) || !plain(b)) throw new ParseError('A tört számlálójában és nevezőjében csak egész szám állhat – számold ki előbb');
      if (b.q.isZero()) throw new MathError('Nullával osztás');
      const sgn = (a.q.n < 0n ? -1 : 1) * (b.q.n < 0n ? -1 : 1);
      return leafFrac(abs(a.q.n), abs(b.q.n), sgn);
    }
    function primary() {
      const t = tokens[pos++];
      if (!t) throw new ParseError('A kifejezés félbemaradt');
      if (t.t === 'num') return numLeaf(t.v);
      if (t.t === '(') {
        const e = expr();
        if (!tokens[pos] || tokens[pos].t !== ')') throw new ParseError('Hiányzó záró zárójel');
        pos++; return e;
      }
      throw new ParseError('Itt szám vagy nyitó zárójel hiányzik');
    }

    if (!tokens.length) throw new ParseError('Üres kifejezés');
    const ast = expr();
    if (pos < tokens.length) {
      const t = tokens[pos];
      if (t.t === 'num') throw new ParseError('Két szám között hiányzik a műveleti jel (vegyes számot ne használj a műveletsorban, írd át törtté)');
      if (t.t === 'op' && t.v === '/') throw new ParseError('Két törtvonal nem követheti egymást (osztáshoz a : jelet használd)');
      throw new ParseError('Hiányzó műveleti jel vagy felesleges zárójel');
    }
    return ast;
  }

  /* ===================== FA-ESZKÖZÖK ===================== */
  const PREC = { '+': 1, '-': 1, '*': 2, ':': 2 };

  function evaluate(n) {
    switch (n.type) {
      case 'num': return n.q;
      case 'neg': return evaluate(n.e).neg();
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

  const isNegLeaf = function (n) { return n.type === 'num' && n.q.n < 0n; };

  /** Szöveg-bejárás közös szabályokkal. leaf: levél kiírása; opText: műveleti jel kiírása; wrapLeftNegLeaf: a bal oldali negatív szám zárójele. */
  function render(n, leaf, opText, wrapLeftNeg) {
    switch (n.type) {
      case 'num': return leaf(n);
      case 'neg': return '-(' + render(n.e, leaf, opText, wrapLeftNeg) + ')';
      case 'bin': {
        const p = PREC[n.op];
        const lNeed = (n.l.type === 'bin' && PREC[n.l.op] < p) ||
                      (wrapLeftNeg && isNegLeaf(n.l) && n.l.form !== 'int' && (n.op === '*' || n.op === ':'));
        const rNeed = n.r.type === 'bin' ? PREC[n.r.op] <= p : (n.r.type === 'neg' || isNegLeaf(n.r));
        const L = render(n.l, leaf, opText, wrapLeftNeg), R = render(n.r, leaf, opText, wrapLeftNeg);
        return (lNeed ? '(' + L + ')' : L) + ' ' + opText(n.op) + ' ' + (rNeed ? '(' + R + ')' : R);
      }
    }
    throw new Error('Ismeretlen csomópont');
  }
  /** Kanonikus szöveg az ÖSSZEHASONLÍTÁSHOZ: érték szerinti (6/14 és 3/7 ugyanaz, 0,5 és 1/2 is). */
  const toCanonical = function (n) { return render(n, leafCanon, function (o) { return o; }, false); };
  const OPTXT = { '+': '+', '-': '−', '*': '·', ':': ':' };
  /** Megjelenítés: a számok a leírt alakjukban (0,75 · 3/4 · 100/80), · és : jelekkel. */
  const toText = function (n) { return render(n, leafText, function (o) { return OPTXT[o]; }, true); };

  /** Képletmegjelenítés emeletes törttel (MathML). Az e-mailben nem használható, ott a toText vagy HTML-es tört kell. */
  function toMathML(n, bare) {
    const esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    const leaf = function (l) {
      const sign = l.q.n < 0n ? '<mo>−</mo>' : '';
      if (l.form === 'frac') return '<mrow>' + sign + '<mfrac><mn>' + l.a + '</mn><mn>' + l.b + '</mn></mfrac></mrow>';
      const t = leafText(l).replace('−', '');
      return sign ? '<mrow>' + sign + '<mn>' + esc(t) + '</mn></mrow>' : '<mn>' + esc(t) + '</mn>';
    };
    const go = function (x) {
      if (x.type === 'num') return leaf(x);
      if (x.type === 'neg') return '<mrow><mo>−</mo><mo>(</mo>' + go(x.e) + '<mo>)</mo></mrow>';
      const p = PREC[x.op];
      const lNeed = (x.l.type === 'bin' && PREC[x.l.op] < p) ||
                    (isNegLeaf(x.l) && x.l.form !== 'int' && (x.op === '*' || x.op === ':'));
      const rNeed = x.r.type === 'bin' ? PREC[x.r.op] <= p : (x.r.type === 'neg' || isNegLeaf(x.r));
      const wrap = function (need, s) { return need ? '<mo>(</mo>' + s + '<mo>)</mo>' : s; };
      const mo = x.op === ':' ? '<mo lspace="0.28em" rspace="0.28em">:</mo>' : '<mo>' + OPTXT[x.op] + '</mo>';   // az osztásjel köré kell hely
      return '<mrow>' + wrap(lNeed, go(x.l)) + mo + wrap(rNeed, go(x.r)) + '</mrow>';
    };
    return bare ? go(n) : '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">' + go(n) + '</math>';
  }
  const MML_NS = 'xmlns="http://www.w3.org/1998/Math/MathML" display="inline"';

  /** Gépelés közbeni előnézet: „2/3·27=18; 5−4=1” → emeletes alakú képlet. Ha valamelyik rész még nem értelmezhető, '' (nincs előnézet). */
  function previewMathML(text) {
    const t = String(text == null ? '' : text).trim();
    if (!t) return '';
    try {
      const inner = t.split(';').map(function (s) { return s.trim(); }).filter(Boolean).map(function (st) {
        return st.split('=').map(function (p) { return toMathML(parse(p), true); }).join('<mo>=</mo>');
      }).join('<mo rspace="0.6em">;</mo>');
      return '<math ' + MML_NS + '><mrow>' + inner + '</mrow></math>';
    } catch (e) { return ''; }
  }

  /** A végeredmény szövegének részei megjelenítéshez: {sign, whole, a, b} | {sign, dec}. Nem értelmezhető szövegnél null. */
  function answerParts(text) {
    const s = String(text == null ? '' : text).replace(/[\u2212\u2013\u2014]/g, '-').trim();
    const sign = s.charAt(0) === '-';
    const body = s.replace(/^[-+]\s?/, '');
    let m;
    if ((m = /^(\d+) (\d+) ?\/ ?(\d+)$/.exec(body))) return { sign: sign, whole: m[1], a: m[2], b: m[3] };
    if ((m = /^(\d+) ?\/ ?(\d+)$/.exec(body))) return { sign: sign, a: m[1], b: m[2] };
    if ((m = /^(\d+(?:[.,]\d+)?)$/.exec(body))) return { sign: sign, dec: m[1].replace('.', ',') };
    return null;
  }

  /** Végeredmény megjelenítése: 1 1/3, −3/5, 0,76, 18. Nem értelmezhető szövegnél '' . */
  function answerMathML(text) {
    const q = answerParts(text);
    if (!q) return '';
    const frac = '<mfrac><mn>' + q.a + '</mn><mn>' + q.b + '</mn></mfrac>';
    const inner = q.dec != null ? '<mn>' + q.dec + '</mn>' : (q.whole != null ? '<mn>' + q.whole + '</mn>' : '') + frac;
    return '<math ' + MML_NS + '><mrow>' + (q.sign ? '<mo>−</mo>' : '') + inner + '</mrow></math>';
  }

  /* ===================== HTML/CSS-ES TÖRTMEGJELENÍTÉS ===================== */
  // A régebbi Chrome/WebView (109 előtt, pl. egy 2017-es tabletén) a MathML-t nem jeleníti meg: a számlálót és a nevezőt
  // egymás mellé írja (5/3 helyett „53”). Ezért van egy minden böngészőben működő, HTML/CSS-es változat is.
  const HTML_CSS =
    '.tk-m{white-space:nowrap}' +
    '.tk-f{display:inline-block;vertical-align:middle;text-align:center;line-height:1.25;margin:0 .1em}' +
    '.tk-f>span{display:block;padding:0 .2em}.tk-f>.tk-n{border-bottom:.09em solid currentColor}' +
    '.tk-o{margin:0 .28em}.tk-s{margin-right:.08em}' +
    '.tk-p{display:inline-block;vertical-align:middle;transform:scaleX(.8);font-weight:300}' +
    '.tk-p.tk-b{font-size:2.3em;line-height:.85}';

  const hasFracNode = function (n) {
    return n.type === 'num' ? n.form === 'frac' : (n.type === 'neg' ? hasFracNode(n.e) : hasFracNode(n.l) || hasFracNode(n.r));
  };
  const htmlFrac = function (a, b) { return '<span class="tk-f"><span class="tk-n">' + a + '</span><span class="tk-d">' + b + '</span></span>'; };

  function toHTML(n, bare) {
    const par = function (open, big) { return '<span class="tk-p' + (big ? ' tk-b' : '') + '">' + (open ? '(' : ')') + '</span>'; };
    const leaf = function (l) {
      if (l.form === 'frac') return (l.q.n < 0n ? '<span class="tk-s">−</span>' : '') + htmlFrac(l.a, l.b);
      return '<span>' + leafText(l) + '</span>';
    };
    const go = function (x) {
      if (x.type === 'num') return leaf(x);
      if (x.type === 'neg') { const big = hasFracNode(x.e); return '<span class="tk-s">−</span>' + par(true, big) + go(x.e) + par(false, big); }
      const p = PREC[x.op];
      const lNeed = (x.l.type === 'bin' && PREC[x.l.op] < p) ||
                    (isNegLeaf(x.l) && x.l.form !== 'int' && (x.op === '*' || x.op === ':'));
      const rNeed = x.r.type === 'bin' ? PREC[x.r.op] <= p : (x.r.type === 'neg' || isNegLeaf(x.r));
      const wrap = function (need, node, str) { const big = hasFracNode(node); return need ? par(true, big) + str + par(false, big) : str; };
      return wrap(lNeed, x.l, go(x.l)) + '<span class="tk-o">' + OPTXT[x.op] + '</span>' + wrap(rNeed, x.r, go(x.r));
    };
    const inner = go(n);
    return bare ? inner : '<span class="tk-m">' + inner + '</span>';
  }
  function previewHTML(text) {
    const t = String(text == null ? '' : text).trim();
    if (!t) return '';
    try {
      const inner = t.split(';').map(function (x) { return x.trim(); }).filter(Boolean).map(function (st) {
        return st.split('=').map(function (p) { return toHTML(parse(p), true); }).join('<span class="tk-o">=</span>');
      }).join('<span class="tk-o">;</span>');
      return '<span class="tk-m">' + inner + '</span>';
    } catch (e) { return ''; }
  }
  function answerHTML(text) {
    const q = answerParts(text);
    if (!q) return '';
    const inner = q.dec != null ? '<span>' + q.dec + '</span>' : (q.whole != null ? '<span>' + q.whole + '</span>' : '') + htmlFrac(q.a, q.b);
    return '<span class="tk-m">' + (q.sign ? '<span class="tk-s">−</span>' : '') + inner + '</span>';
  }

  /** Van-e MathML-támogatás? Egy 1/2 törtet mér: ha a tört kétszer olyan magas, mint a szám, a böngésző érti.
      A „html” paraméter csak teszteléshez van: ismeretlen elemekkel utánozza a MathML-t nem ismerő böngészőt. */
  function detectMathML(mode) {
    if (typeof document === 'undefined' || !document.body) return true;
    try {
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:0;font-size:20px';
      host.innerHTML = mode === 'html' ? '<span><mfrac><mn>1</mn><mn>2</mn></mfrac></span>'
        : '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>1</mn><mn>2</mn></mfrac></math>';
      document.body.appendChild(host);
      const f = host.querySelector('mfrac'), n = host.querySelector('mn');
      const ok = !!f && !!n && f.getBoundingClientRect().height > n.getBoundingClientRect().height * 1.5;
      host.parentNode.removeChild(host);
      return ok;
    } catch (e) { return false; }
  }
  function installCss() {
    if (typeof document === 'undefined' || document.getElementById('tk-fx-css')) return;
    const st = document.createElement('style'); st.id = 'tk-fx-css'; st.textContent = HTML_CSS; document.head.appendChild(st);
  }
  let FX = null;
  /** Automatikus választás: MathML, ha a böngésző érti, különben HTML/CSS. Kipróbáláshoz az oldal címéhez fűzhető:
      ?tort=html (kényszerített HTML/CSS) vagy ?tort=mathml. Eredmény: { mathml, task(kif), preview(szöveg), answer(szöveg) }. */
  function fx() {
    if (FX) return FX;
    let mml = detectMathML();
    try { const m = /[?&]tort=(html|mathml)\b/.exec(location.search); if (m) mml = m[1] === 'mathml'; } catch (e) { /* nincs böngésző */ }
    FX = mml
      ? { mathml: true, task: function (k) { return toMathML(parse(k)); }, preview: previewMathML, answer: answerMathML }
      : { mathml: false, task: function (k) { return toHTML(parse(k)); }, preview: previewHTML, answer: answerHTML };
    installCss();
    return FX;
  }

  /* ===================== FA-ESZKÖZÖK (redex, csere, összegyűjtés) ===================== */
  /** Redex = olyan művelet, aminek mindkét operandusa már szám (a tört is egy szám). */
  function findRedexes(n, path) {
    path = path || [];
    if (n.type === 'bin') {
      if (n.l.type === 'num' && n.r.type === 'num') return [{ path: path, node: n }];
      return findRedexes(n.l, path.concat('l')).concat(findRedexes(n.r, path.concat('r')));
    }
    if (n.type === 'neg') return findRedexes(n.e, path.concat('e'));
    return [];
  }
  function replaceAt(n, path, newNode) {
    if (!path.length) return newNode;
    const k = path[0], rest = path.slice(1);
    if (n.type === 'bin') { const c = Object.assign({}, n); c[k] = replaceAt(n[k], rest, newNode); return c; }
    return Object.assign({}, n, { e: replaceAt(n.e, rest, newNode) });
  }
  function foldNeg(n) {
    if (n.type === 'neg') { const e = foldNeg(n.e); return e.type === 'num' ? negLeaf(e) : { type: 'neg', e: e }; }
    if (n.type === 'bin') return Object.assign({}, n, { l: foldNeg(n.l), r: foldNeg(n.r) });
    return n;
  }
  function collectSubtrees(n, out) {
    out = out || new Set();
    out.add(toCanonical(n));
    if (n.type === 'bin') { collectSubtrees(n.l, out); collectSubtrees(n.r, out); }
    if (n.type === 'neg') collectSubtrees(n.e, out);
    return out;
  }
  function collectLeaves(n, out) {
    out = out || new Set();
    if (n.type === 'num') out.add(leafCanon(n));
    else if (n.type === 'bin') { collectLeaves(n.l, out); collectLeaves(n.r, out); }
    else if (n.type === 'neg') collectLeaves(n.e, out);
    return out;
  }
  const getAt = function (n, path) { return path.reduce(function (x, k) { return x[k]; }, n); };

  /* ===================== REFERENCIA-MEGOLDÓ ===================== */
  const lcm = function (a, b) { return a / gcd(a, b) * b; };
  const wrapRight = function (l) { return l.q.n < 0n ? '(' + leafText(l) + ')' : leafText(l); };

  /** Körönként az ÖSSZES éppen elvégezhető műveletet elvégzi. Törteknél: tizedes→tört átírás vegyes műveletnél,
      osztás törttel = szorzás a reciprokkal, összeadás/kivonás közös nevezővel, az eredmény mindig egyszerűsítve. */
  function solveReference(src) {
    let tree = parse(src);
    const steps = [];
    for (let guard = 0; tree.type !== 'num' && guard < 80; guard++) {
      const statements = [];
      for (const r of findRedexes(tree)) {
        let node = getAt(tree, r.path);

        // 1) tizedes tört + tört: a tizedes tört átírása törtté
        if ((node.l.form === 'frac' && node.r.form === 'dec') || (node.l.form === 'dec' && node.r.form === 'frac')) {
          const side = node.l.form === 'dec' ? 'l' : 'r';
          const conv = leafFromQ(node[side].q, 'frac');
          statements.push({ text: leafText(node[side]) + ' = ' + leafText(conv) });
          node = Object.assign({}, node); node[side] = conv;
        }
        const l = node.l, rr = node.r;
        const anyFrac = l.form === 'frac' || rr.form === 'frac';

        // 2) osztás törttel (vagy tört osztása egésszel) = szorzás a reciprokkal
        if (node.op === ':' && (rr.form === 'frac' || (l.form === 'frac' && rr.form === 'int'))) {
          if (rr.q.isZero()) throw new MathError('Nullával osztás');
          const rec = rr.form === 'frac' ? leafFrac(rr.b, rr.a, rr.sgn) : leafFrac(1n, abs(rr.q.n), rr.q.n < 0n ? -1 : 1);
          statements.push({ text: toText(node) + ' = ' + leafText(l) + ' · ' + wrapRight(rec) });
          tree = replaceAt(tree, r.path, { type: 'bin', op: '*', l: l, r: rec });
          continue;
        }

        // 3) a művelet elvégzése
        const value = evaluate(node);
        const res = leafFromQ(value, anyFrac ? 'frac' : 'dec');
        let text = toText(node);
        if ((node.op === '+' || node.op === '-') && anyFrac) {            // közös nevező
          const dl = l.form === 'frac' ? l.b : 1n, dr = rr.form === 'frac' ? rr.b : 1n;
          if (dl !== dr) {
            const D = lcm(dl, dr);
            const conv = function (x, d) { return x.form === 'frac' ? leafFrac(x.a * (D / d), D, x.sgn) : leafFrac(abs(x.q.n) * D, D, x.q.n < 0n ? -1 : 1); };
            text += ' = ' + toText({ type: 'bin', op: node.op, l: conv(l, dl), r: conv(rr, dr) });
          }
        }
        statements.push({ text: text + ' = ' + leafText(res) });
        tree = replaceAt(tree, r.path, res);
      }
      tree = foldNeg(tree);
      steps.push({ statements: statements, expression: toText(tree) });
    }
    const result = evaluate(tree);
    const lastForm = tree.type === 'num' ? tree.form : 'int';
    return {
      start: toText(parse(src)), steps: steps, result: result,
      answerText: formatAnswer(result, lastForm === 'dec' ? 'dec' : 'frac'),
    };
  }

  /** A végeredmény előírt alakja: egész | véges tizedes tört (ha a feladat is tizedes volt) | valódi tört | vegyes szám. */
  function formatAnswer(q, prefer) {
    if (q.d === 1n) return (q.n < 0n ? '−' : '') + abs(q.n);
    if (prefer === 'dec' && isFiniteDec(q)) return decStr(q);
    const neg = q.n < 0n ? '−' : '', n = abs(q.n);
    if (n < q.d) return neg + n + '/' + q.d;
    const w = n / q.d, rest = n % q.d;
    return neg + w + (rest === 0n ? '' : ' ' + rest + '/' + q.d);
  }

  /* ===================== A DIÁK LÉPÉSEINEK ELEMZÉSE ===================== */
  /** Hibakódok: FORMAT, PARSE, NOT_NUMBER, NOT_IN_EXPRESSION, MULTI_OP, ARITHMETIC, DECIMAL_APPROX, CHAIN_MISMATCH,
                 RECIPROCAL, EXPR_PARSE, VALUE_CHANGED, SUBST_MISMATCH */
  function analyzeStep(prevTree, step) {
    const problems = [];
    let variants = [prevTree];
    let okStatements = 0;
    const calc = String(step.calc), expr = String(step.expr);

    const stmts = calc.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!stmts.length) problems.push({ code: 'FORMAT', msg: 'Nem írtál be részszámítást.' });

    for (const s of stmts) {
      const parts = s.split('=').map(function (p) { return p.trim(); });
      if (parts.length < 2 || parts.some(function (p) { return !p; })) {
        problems.push({ code: 'FORMAT', stmt: s, msg: '„' + s + '”: a forma legyen „művelet = eredmény”.' }); continue;
      }
      let trees, truth;
      try { trees = parts.map(parse); truth = evaluate(trees[0]); }
      catch (e) { problems.push({ code: 'PARSE', stmt: s, msg: '„' + s + '”: ' + e.message + '.' }); continue; }
      const first = trees[0], last = trees[trees.length - 1];

      const reciprocalCandidate = trees.length === 2 && first.type === 'bin' && first.op === ':' && last.type === 'bin' && last.op === '*';
      if (last.type !== 'num' && !reciprocalCandidate) {
        problems.push({ code: 'NOT_NUMBER', stmt: s, msg: '„' + s + '”: az utolsó egyenlőségjel után egyetlen szám kell (osztásnál a reciprokkal való szorzás is jó).' }); continue;
      }
      const kind = first.type === 'num' ? 'B' : (last.type === 'num' ? 'A' : 'C');   // B: átalakítás, A: eredmény, C: reciprok

      // az egyenlőségjelek közötti alakok értéke egyezzen
      let valueError = null;
      try {
        for (const t of trees.slice(1, kind === 'C' ? 1 : undefined)) {
          if (!evaluate(t).eq(truth)) {
            valueError = (t === last && last.type === 'num')
              ? ((t.form === 'dec' && !isFiniteDec(truth))
                ? { code: 'DECIMAL_APPROX', msg: '„' + s + '”: ez a tört nem írható át pontos tizedes törtté (végtelen szakaszos), ezért maradj a törtalaknál.' }
                : { code: 'ARITHMETIC', msg: '„' + s + '”: számolási hiba.' })
              : { code: 'CHAIN_MISMATCH', msg: '„' + s + '”: az egyenlőségjelek két oldalán nem egyenlő értékek állnak.' };
            break;
          }
        }
      } catch (e) { valueError = { code: 'PARSE', msg: '„' + s + '”: ' + e.message + '.' }; }

      const key = toCanonical(first);

      if (kind === 'B') {                                              // egy szám átírása egyenlő alakra
        const known = new Set(); variants.forEach(function (v) { collectLeaves(v, known); });
        if (!known.has(key)) { problems.push({ code: 'NOT_IN_EXPRESSION', stmt: s, msg: '„' + s + '”: ez a szám most nincs a műveletsorban.' }); continue; }
        if (valueError) { problems.push(Object.assign({ stmt: s }, valueError)); continue; }
        okStatements++; continue;
      }

      const expanded = [];
      let node0 = null;
      for (const v of variants) {
        const rs = findRedexes(v).filter(function (x) { return toCanonical(x.node) === key; });
        if (!rs.length) continue;
        node0 = rs[0].node;
        const replacement = kind === 'A' ? leafFromQ(truth, 'frac') : last;
        const options = [rs]; if (rs.length > 1) options.push([rs[0]]);     // mind / csak az első
        for (const opt of options) {
          expanded.push(foldNeg(opt.reduce(function (acc, x) { return replaceAt(acc, x.path, replacement); }, v)));
        }
      }
      if (!expanded.length) {
        const known = new Set(); variants.forEach(function (v) { collectSubtrees(v, known); });
        problems.push(known.has(key)
          ? { code: 'MULTI_OP', stmt: s, msg: '„' + s + '”: egy részszámításban csak egy műveletet végezz el (több lépés: pontosvessző).' }
          : { code: 'NOT_IN_EXPRESSION', stmt: s, msg: '„' + s + '”: ez a művelet most nem végezhető el – ellenőrizd a műveleti sorrendet.' });
        continue;
      }
      if (valueError) { problems.push(Object.assign({ stmt: s }, valueError)); continue; }
      if (kind === 'C') {
        const okRec = last.l.type === 'num' && last.r.type === 'num' && last.l.q.eq(node0.l.q) && !node0.r.q.isZero() && last.r.q.eq(node0.r.q.recip());
        if (!okRec) {
          problems.push({ code: 'RECIPROCAL', stmt: s, msg: '„' + s + '”: osztás helyett az osztó reciprokával kell szorozni (a tört fordítottjával).' }); continue;
        }
      }
      variants = expanded; okStatements++;
    }

    // Az új (behelyettesített) műveletsor
    let studentTree = null;
    try { studentTree = parse(expr); }
    catch (e) { problems.push({ code: 'EXPR_PARSE', msg: 'Az új műveletsor hibás: ' + e.message + '.' }); }

    if (studentTree && stmts.length && okStatements === stmts.length) {
      if (variants.map(toCanonical).indexOf(toCanonical(studentTree)) < 0) {
        let same = false;
        try { same = evaluate(studentTree).eq(evaluate(prevTree)); } catch (e) { /* nullával osztás */ }
        problems.push(same
          ? { code: 'SUBST_MISMATCH', msg: 'Az új műveletsor értéke jó, de nem a felírt részeredmények behelyettesítése.' }
          : { code: 'VALUE_CHANGED', msg: 'Az új műveletsor értéke megváltozott – hibásan helyettesítettél be vagy másoltál át.' });
      }
    }
    // Hibás lépés után is a diák saját sorából haladunk tovább, hogy a hibák ne halmozódjanak.
    return { ok: problems.length === 0, problems: problems, nextTree: studentTree || prevTree };
  }

  function analyzeSolution(taskExpr, studentSteps) {
    let tree = parse(taskExpr);
    return studentSteps.map(function (step) {
      const res = analyzeStep(tree, step);
      tree = res.nextTree;
      return Object.assign({}, step, { ok: res.ok, problems: res.problems });
    });
  }

  /* ===================== VÉGEREDMÉNY ===================== */
  /** true: az egzaktul egyenlő véges tizedes tört is elfogadott végeredmény (pl. 0,76 vagy 1,5). */
  const ANSWER_ALLOW_DECIMAL = true;

  /** A beírt végeredmény értelmezése és az előírt alak ellenőrzése.
      Alakok: egész | tizedes tört | valódi tört (a/b, egyszerűsítve) | vegyes szám (1 1/3, egyszerűsítve).
      1-nél nagyobb értékű törtet vegyes számként kell megadni (4/3 nem jó, 1 1/3 igen). */
  function gradeAnswer(raw, refQ) {
    const out = { valueOk: false, formatOk: false, reason: 'ANSWER', msg: '', kind: null, value: null };
    const s = String(raw == null ? '' : raw).replace(/[\u2212\u2013\u2014]/g, '-').replace(/\u00a0/g, ' ').trim().replace(/\s+/g, ' ');
    let m, q = null, kind = null, a, b, w;
    const sign = s.charAt(0) === '-' ? -1n : 1n;
    const body = s.replace(/^[-+]\s?/, '');
    if ((m = /^(\d+)$/.exec(body))) { kind = 'int'; q = new Q(sign * BigInt(m[1])); }
    else if ((m = /^(\d+)[.,](\d+)$/.exec(body))) { kind = 'dec'; q = new Q(sign * BigInt(m[1] + m[2]), 10n ** BigInt(m[2].length)); }
    else if ((m = /^(\d+) ?\/ ?(\d+)$/.exec(body))) {
      kind = 'frac'; a = BigInt(m[1]); b = BigInt(m[2]);
      if (b === 0n) { out.msg = 'A nevező nem lehet nulla.'; return out; }
      q = new Q(sign * a, b);
    } else if ((m = /^(\d+) (\d+) ?\/ ?(\d+)$/.exec(body))) {
      kind = 'mixed'; w = BigInt(m[1]); a = BigInt(m[2]); b = BigInt(m[3]);
      if (b === 0n) { out.msg = 'A nevező nem lehet nulla.'; return out; }
      q = new Q(sign * (w * b + a), b);
    }
    if (!q) { out.msg = 'A végeredmény egész szám, tört, vegyes szám (pl. 1 1/3) vagy tizedes tört legyen.'; return out; }
    out.kind = kind; out.value = q;

    if (!q.eq(refQ)) {
      out.msg = (kind === 'dec' && !isFiniteDec(refQ))
        ? 'A pontos érték nem írható fel véges tizedes törtként – törtalakban (vagy vegyes számként) add meg.' : '';
      return out;
    }
    out.valueOk = true;
    const fail = function (reason, msg) { out.reason = reason; out.msg = msg; return out; };
    if (kind === 'dec' && !ANSWER_ALLOW_DECIMAL) return fail('FORMAT', 'A végeredményt törtként (vagy vegyes számként) add meg.');
    if (kind === 'frac') {
      if (gcd(a, b) !== 1n || b === 1n) return fail('SIMPLIFY', 'A végeredmény értéke jó, de még egyszerűsíthető – egyszerűsítsd, ezért a feladat nem számít helyesnek.');
      if (a > b) return fail('MIXED', 'A végeredmény értéke jó, de az 1-nél nagyobb értékű törtet vegyes számként kell megadni (pl. 4/3 = 1 1/3), ezért a feladat nem számít helyesnek.');
    }
    if (kind === 'mixed') {
      if (w < 1n || a < 1n || a >= b || gcd(a, b) !== 1n) return fail('MIXED_FORMAT', 'A végeredmény értéke jó, de a vegyes szám alakja hibás: az egész rész legyen legalább 1, a törtrész pedig egyszerűsített és 1-nél kisebb.');
    }
    out.formatOk = true; out.reason = '';
    return out;
  }

  /* ===================== EGY FELADAT TELJES ÉRTÉKELÉSE ===================== */
  const REASON_MSG = {
    NO_STEPS:    'A végeredmény jó, de nem írtál lépéseket – a megoldás menetét is le kell írni, ezért a feladat nem számít helyesnek.',
    STEP_ERRORS: 'A végeredmény jó, de a leírt lépéseid hibásak vagy hiányosak, ezért a feladat nem számít helyesnek.',
    INCOMPLETE:  'A végeredmény jó, de a lépéseid nem jutnak el a végeredményig, ezért a feladat nem számít helyesnek.',
  };

  function lastStepReachesResult(steps, refQ) {
    try {
      const t = foldNeg(parse(steps[steps.length - 1].expr));
      return t.type === 'num' && t.q.eq(refQ);
    } catch (e) { return false; }
  }

  /** Helyes = jó végeredmény az előírt alakban ÉS végigvezetett, hibátlan lépések (egyetlen szám a végén).
      steps: [{calc, expr}] (az üres sorok nélkül). Csak egyszerű adatot ad vissza (szöveg, szám, logikai). */
  function evaluateTask(taskExpr, steps, finalRaw) {
    const ref = solveReference(taskExpr);
    const ans = gradeAnswer(finalRaw, ref.result);
    const analysis = analyzeSolution(taskExpr, steps);
    let reason = '', msg = '';
    if (!ans.valueOk) { reason = 'ANSWER'; msg = ans.msg; }
    else if (!ans.formatOk) { reason = ans.reason; msg = ans.msg; }
    else if (!steps.length) reason = 'NO_STEPS';
    else if (!analysis.every(function (a) { return a.ok; })) reason = 'STEP_ERRORS';
    else if (!lastStepReachesResult(steps, ref.result)) reason = 'INCOMPLETE';
    return {
      correct: reason === '', reason: reason, reasonMsg: msg || REASON_MSG[reason] || '',
      analysis: analysis,
      reference: {
        start: ref.start, answerText: ref.answerText,
        steps: ref.steps.map(function (s) { return s.statements.map(function (x) { return x.text; }).join('; ') + ' → ' + s.expression; }),
      },
    };
  }

  g.TORTEK_MOTOR = {
    Q: Q, MathError: MathError, ParseError: ParseError, ANSWER_ALLOW_DECIMAL: ANSWER_ALLOW_DECIMAL,
    parse: parse, evaluate: evaluate, toText: toText, toCanonical: toCanonical, toMathML: toMathML,
    solveReference: solveReference, formatAnswer: formatAnswer,
    analyzeStep: analyzeStep, analyzeSolution: analyzeSolution, gradeAnswer: gradeAnswer,
    evaluateTask: evaluateTask, lastStepReachesResult: lastStepReachesResult, REASON_MSG: REASON_MSG,
    taskMathML: function (src) { return toMathML(parse(src)); },
    previewMathML: previewMathML, answerMathML: answerMathML,
    toHTML: toHTML, previewHTML: previewHTML, answerHTML: answerHTML, taskHTML: function (src) { return toHTML(parse(src)); },
    fx: fx, installCss: installCss, detectMathML: detectMathML,
  };
})(typeof window !== 'undefined' ? window : globalThis);
