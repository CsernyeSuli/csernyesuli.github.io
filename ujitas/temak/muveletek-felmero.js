/**
 * temak/muveletek-felmero.js – „Műveletek racionális számokkal” 8. osztályos felmérő modul (72 feladat).
 * Azonosítás, lapváltás- és kilépésvédelem, valamint beküldés: kozos/v1 (window.UJITAS).
 * Emeletes törtmegjelenítés és pontos BigInt-alapú tört/tizedestört-értékelés: tortek-motor.js (window.TORTEK_MOTOR).
 */
(function (U) {
  'use strict';
  const M = window.TORTEK_MOTOR;
  const cfg = U.cfg || {};
  const FX = M.fx();
  const $ = function (s) { return document.querySelector(s); };
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ===================== 72 FELADAT ADATAI ===================== */
  const SECTIONS = [
    {
      id: 'I',
      title: 'I. Egész számok',
      blocks: [
        {
          code: 'A',
          label: 'A) Összeadás, kivonás (14 és 9)',
          tasks: [
            { id: 'I_A_1', num: '1.', expr: '14+9' },
            { id: 'I_A_2', num: '2.', expr: '14-9' },
            { id: 'I_A_3', num: '3.', expr: '14+(-9)' },
            { id: 'I_A_4', num: '4.', expr: '14-(-9)' },
            { id: 'I_A_5', num: '5.', expr: '(-14)+9' },
            { id: 'I_A_6', num: '6.', expr: '(-14)-9' },
            { id: 'I_A_7', num: '7.', expr: '(-9)+14' },
            { id: 'I_A_8', num: '8.', expr: '(-9)-14' },
            { id: 'I_A_9', num: '9.', expr: '(-14)+(-9)' },
            { id: 'I_A_10', num: '10.', expr: '(-14)-(-9)' },
          ]
        },
        {
          code: 'B',
          label: 'B) Szorzás, osztás (13·7 és 161:7)',
          tasks: [
            { id: 'I_B_1', num: '1.', expr: '13·7' },
            { id: 'I_B_2', num: '2.', expr: '13·(-7)' },
            { id: 'I_B_3', num: '3.', expr: '(-13)·7' },
            { id: 'I_B_4', num: '4.', expr: '(-13)·(-7)' },
            { id: 'I_B_5', num: '5.', expr: '161:7' },
            { id: 'I_B_6', num: '6.', expr: '161:(-7)' },
            { id: 'I_B_7', num: '7.', expr: '(-161):7' },
            { id: 'I_B_8', num: '8.', expr: '(-161):(-7)' },
          ]
        },
        {
          code: 'C',
          label: 'C) Vegyes műveletek (14, 8, 17)',
          tasks: [
            { id: 'I_C_1', num: '1.', expr: '14·8+17' },
            { id: 'I_C_2', num: '2.', expr: '14·8-17' },
            { id: 'I_C_3', num: '3.', expr: '14·(8+17)' },
            { id: 'I_C_4', num: '4.', expr: '14·(8-17)' },
          ]
        },
        {
          code: 'D',
          label: 'D) Vegyes műveletek (156, 6, 7)',
          tasks: [
            { id: 'I_D_1', num: '1.', expr: '156:6+7' },
            { id: 'I_D_2', num: '2.', expr: '156:6-(-7)' },
            { id: 'I_D_3', num: '3.', expr: '156:(6+7)' },
            { id: 'I_D_4', num: '4.', expr: '156:(6-7)' },
          ]
        },
        {
          code: 'E',
          label: 'E) Szorzások összege/különbsége (9, 17, 8, 18)',
          tasks: [
            { id: 'I_E_1', num: '1.', expr: '9·17+8·18' },
            { id: 'I_E_2', num: '2.', expr: '9·17-8·18' },
            { id: 'I_E_3', num: '3.', expr: '(9+8)·17' },
            { id: 'I_E_4', num: '4.', expr: '9·(17+18)' },
          ]
        },
        {
          code: 'F',
          label: 'F) Háromtagú összeadás, kivonás (14, 7, 23)',
          tasks: [
            { id: 'I_F_1', num: '1.', expr: '14+7+23' },
            { id: 'I_F_2', num: '2.', expr: '(14+7)+23' },
            { id: 'I_F_3', num: '3.', expr: '14+(7+23)' },
            { id: 'I_F_4', num: '4.', expr: '14-7+23' },
            { id: 'I_F_5', num: '5.', expr: '(14-7)+23' },
            { id: 'I_F_6', num: '6.', expr: '14-(7+23)' },
          ]
        },
        {
          code: 'G',
          label: 'G) Zárójeles láncok (14, 7, 23)',
          tasks: [
            { id: 'I_G_1', num: '1.', expr: '14+7-23' },
            { id: 'I_G_2', num: '2.', expr: '(14+7)-23' },
            { id: 'I_G_3', num: '3.', expr: '14+(7-23)' },
            { id: 'I_G_4', num: '4.', expr: '14-7-23' },
            { id: 'I_G_5', num: '5.', expr: '(14-7)-23' },
            { id: 'I_G_6', num: '6.', expr: '14-(7-23)' },
          ]
        },
        {
          code: 'H',
          label: 'H) Összetett műveletek (egész számok)',
          tasks: [
            { id: 'I_H_1', num: '1.', expr: '14·7-23' },
            { id: 'I_H_2', num: '2.', expr: '14·(7-23)' },
            { id: 'I_H_3', num: '3.', expr: '(14+7)·(-2)' },
            { id: 'I_H_4', num: '4.', expr: '161:7+14' },
            { id: 'I_H_5', num: '5.', expr: '(161:7)-9' },
            { id: 'I_H_6', num: '6.', expr: '13·7-(14+9)' },
            { id: 'I_H_7', num: '7.', expr: '23-(14-7)·2' },
            { id: 'I_H_8', num: '8.', expr: '(14+9)·(13-7)' },
            { id: 'I_H_9', num: '9.', expr: '156:6+14·7' },
            { id: 'I_H_10', num: '10.', expr: '(14-9)·(23-17)' },
          ]
        },
      ]
    },
    {
      id: 'II',
      title: 'II. Tizedestörtek',
      blocks: [
        {
          code: 'A',
          label: 'A) Tizedestörtek műveletei (sűrített)',
          tasks: [
            { id: 'II_A_1', num: '1.', expr: '1,4+0,9' },
            { id: 'II_A_2', num: '2.', expr: '(-1,4)-(-0,9)' },
            { id: 'II_A_3', num: '3.', expr: '1,2·(-0,5)' },
            { id: 'II_A_4', num: '4.', expr: '(-3,6):(-0,6)' },
            { id: 'II_A_5', num: '5.', expr: '1,4·0,8+1,7' },
            { id: 'II_A_6', num: '6.', expr: '1,4·(0,8-1,7)' },
            { id: 'II_A_7', num: '7.', expr: '1,4+0,7+2,3' },
            { id: 'II_A_8', num: '8.', expr: '1,4-(0,7+2,3)' },
          ]
        },
      ]
    },
    {
      id: 'III',
      title: 'III. Törtek',
      blocks: [
        {
          code: 'A',
          label: 'A) Törtek műveletei (sűrített)',
          tasks: [
            { id: 'III_A_1', num: '1.', expr: '1/2+1/4' },
            { id: 'III_A_2', num: '2.', expr: '(-1/2)-(-1/4)' },
            { id: 'III_A_3', num: '3.', expr: '2/3·(-3/4)' },
            { id: 'III_A_4', num: '4.', expr: '(-3/4):(-1/2)' },
            { id: 'III_A_5', num: '5.', expr: '1/2+1/3+1/6' },
            { id: 'III_A_6', num: '6.', expr: '1/2-(1/3+1/6)' },
            { id: 'III_A_7', num: '7.', expr: '2/3·3/4+1/2' },
            { id: 'III_A_8', num: '8.', expr: '1/2-(1/3-1/4)' },
          ]
        },
      ]
    },
    {
      id: 'IV',
      title: 'IV. Vegyes műveletek',
      blocks: [
        {
          code: 'A',
          label: 'A) Vegyesen törtekkel és tizedestörtekkel',
          tasks: [
            { id: 'IV_A_1', num: '1.', expr: '1/6·9+0,75' },
            { id: 'IV_A_2', num: '2.', expr: '5:10/3-3,7' },
            { id: 'IV_A_3', num: '3.', expr: '4,05:5+7/10' },
            { id: 'IV_A_4', num: '4.', expr: '2 2/5-6,3·2/10', evalExpr: '12/5-6,3·2/10' },
          ]
        },
      ]
    },
  ];

  // Saját BigInt racionális kiértékelő tartalékként (ha a TORTEK_MOTOR egy kifejezést nem tudna elemezni)
  function gcdBig(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) { const t = a % b; a = b; b = t; }
    return a === 0n ? 1n : a;
  }
  function makeQ(num, den) {
    if (den === 0n) throw new Error('Nullával való osztás');
    if (den < 0n) { num = -num; den = -den; }
    const g = gcdBig(num, den);
    return { n: num / g, d: den / g };
  }
  function addQ(a, b) { return makeQ(a.n * b.d + b.n * a.d, a.d * b.d); }
  function subQ(a, b) { return makeQ(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mulQ(a, b) { return makeQ(a.n * b.n, a.d * b.d); }
  function divQ(a, b) { return makeQ(a.n * b.d, a.d * b.n); }

  function evalFallbackExpr(exprStr) {
    const s = String(exprStr || '').replace(/\s+/g, ' ').trim();
    // Vegyes számok (pl. 2 2/5 -> (2 + 2/5)) és tizedestörtek (pl. 1,4 -> (14/10)) és középpont (· -> *)
    let norm = s.replace(/·/g, '*');
    // Vegyes szám: egész + tört (pl. 2 2/5)
    norm = norm.replace(/\b(-?\d+)\s+(\d+)\/(\d+)\b/g, function (_, w, a, b) {
      const sign = BigInt(w) < 0n ? -1n : 1n;
      const absW = BigInt(w) < 0n ? -BigInt(w) : BigInt(w);
      const num = sign * (absW * BigInt(b) + BigInt(a));
      return '(' + num.toString() + '/' + b + ')';
    });
    // Tizedestört vesszővel: pl. 1,4 vagy 0,75
    norm = norm.replace(/(\d+),(\d+)/g, function (_, intP, decP) {
      const den = 10n ** BigInt(decP.length);
      const num = BigInt(intP + decP);
      return '(' + num.toString() + '/' + den.toString() + ')';
    });

    // Tokenizálás
    const tokens = [];
    let i = 0;
    while (i < norm.length) {
      const ch = norm[i];
      if (ch === ' ') { i++; continue; }
      if ('+-:*/()'.indexOf(ch) >= 0) {
        tokens.push({ type: 'op', val: ch });
        i++;
      } else if (/\d/.test(ch)) {
        let numStr = '';
        while (i < norm.length && /\d/.test(norm[i])) { numStr += norm[i]; i++; }
        tokens.push({ type: 'num', val: BigInt(numStr) });
      } else {
        i++;
      }
    }

    // Rekurzív leszálló értelmező: expr -> term (('+'|'-') term)*; term -> factor (('*'|':'|'/') factor)*; factor -> '(' expr ')' | ('+'|'-') factor | num
    let pos = 0;
    function peek() { return tokens[pos]; }
    function consume() { return tokens[pos++]; }

    function parseExpr() {
      let left = parseTerm();
      while (peek() && peek().type === 'op' && (peek().val === '+' || peek().val === '-')) {
        const op = consume().val;
        const right = parseTerm();
        left = op === '+' ? addQ(left, right) : subQ(left, right);
      }
      return left;
    }

    function parseTerm() {
      let left = parseFactor();
      while (peek() && peek().type === 'op' && (peek().val === '*' || peek().val === ':' || peek().val === '/')) {
        const op = consume().val;
        const right = parseFactor();
        left = op === '*' ? mulQ(left, right) : divQ(left, right);
      }
      return left;
    }

    function parseFactor() {
      const t = peek();
      if (!t) return makeQ(0n, 1n);
      if (t.type === 'op' && t.val === '(') {
        consume();
        const val = parseExpr();
        if (peek() && peek().type === 'op' && peek().val === ')') consume();
        return val;
      }
      if (t.type === 'op' && (t.val === '-' || t.val === '+')) {
        const op = consume().val;
        const val = parseFactor();
        return op === '-' ? makeQ(-val.n, val.d) : val;
      }
      if (t.type === 'num') {
        consume();
        return makeQ(t.val, 1n);
      }
      consume();
      return makeQ(0n, 1n);
    }

    const q = parseExpr();
    let ansText = q.n.toString();
    if (q.d !== 1n) {
      const neg = q.n < 0n;
      const absN = neg ? -q.n : q.n;
      if (absN > q.d) {
        const whole = absN / q.d;
        const rem = absN % q.d;
        ansText = (neg ? '-' : '') + (rem === 0n ? whole.toString() : whole.toString() + ' ' + rem.toString() + '/' + q.d.toString());
      } else {
        ansText = (neg ? '-' : '') + absN.toString() + '/' + q.d.toString();
      }
    }
    return { result: q, answerText: ansText };
  }

  function safeSolveReference(expr) {
    try {
      const r = M.solveReference(expr);
      if (r && r.result) return r;
    } catch (e) {}
    return evalFallbackExpr(expr);
  }

  function safeTaskHtml(expr, taskId) {
    if (taskId === 'IV_A_4') {
      try {
        return '<span class="inline-flex items-center gap-1">' +
          '<span>2</span>' +
          FX.task('2/5') +
          '<span>-6,3</span>' +
          '<span>·</span>' +
          FX.task('2/10') +
          '</span>';
      } catch (e) {}
    }
    try {
      return FX.task(expr);
    } catch (e) {
      return esc(expr);
    }
  }

  function safeAnswerHtml(ans) {
    try {
      return FX.answer(ans);
    } catch (e) {
      return esc(ans);
    }
  }

  // Laposított feladatlista pontos referencia-értékkel
  const ALL_TASKS = [];
  SECTIONS.forEach(function (sec) {
    sec.blocks.forEach(function (blk) {
      blk.tasks.forEach(function (t) {
        const evalExpr = t.evalExpr || t.expr;
        const dispExpr = t.expr;
        const ref = safeSolveReference(evalExpr);
        ALL_TASKS.push({
          id: t.id,
          sectionId: sec.id,
          sectionTitle: sec.title,
          blockCode: blk.code,
          blockLabel: blk.label,
          num: t.num,
          fullLabel: sec.id + '. ' + blk.code + t.num,
          expr: dispExpr,
          evalExpr: evalExpr,
          refQ: ref.result,
          correctAnswer: ref.answerText
        });
      });
    });
  });

  const TOTAL_TASKS = ALL_TASKS.length;

  /* ===================== ÉRTÉKELÉS (4. VARIÁCIÓ) ===================== */
  function gradeNameFor(pct) {
    if (pct <= 33) return 'elégtelen (1)';
    if (pct <= 50) return 'elégséges (2)';
    if (pct <= 74) return 'közepes (3)';
    if (pct <= 90) return 'jó (4)';
    return 'jeles (5)';
  }

  function gradeColorClass(pct) {
    if (pct <= 33) return 'text-red-400';
    if (pct <= 50) return 'text-amber-400';
    if (pct <= 74) return 'text-yellow-300';
    if (pct <= 90) return 'text-sky-400';
    return 'text-emerald-400';
  }

  function checkSingleAnswer(rawInput, refQ) {
    const raw = String(rawInput == null ? '' : rawInput).trim();
    if (!raw) return { answered: false, correct: false, parsedText: '' };

    let cleaned = raw.replace(/[\u2212\u2013\u2014]/g, '-').replace(/\u00a0/g, ' ').trim();
    if (/^\(\s*[+-]?\s*\d[\d\s.,/]*\)$/.test(cleaned)) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    if (cleaned.indexOf('/') < 0) {
      cleaned = cleaned.replace(/\s+/g, '');
    } else {
      cleaned = cleaned.replace(/\s+/g, ' ');
    }

    const res = M.gradeAnswer(cleaned, refQ);
    if (res.kind === null) {
      return { answered: true, correct: false, parsedText: raw };
    }
    return {
      answered: true,
      correct: !!res.valueOk,
      parsedText: raw
    };
  }

  /* ===================== STÍLUSOK ===================== */
  const mount = document.getElementById('app');
  if (!mount) throw new Error('Hiányzik az #app konténer.');

  U.css('muveletek-felmero-stilus',
    'math{font-size:1.18em}' +
    '.mf-expr math,.mf-expr .tk-m{font-size:clamp(1.02rem,2.6vw,1.25rem);color:#e2e8f0}' +
    '.mf-pv math,.mf-pv .tk-m{font-size:0.95em;color:#67e8f9}' +
    '.mf-sol math,.mf-sol .tk-m{font-size:1.05em}' +
    '.mf-card{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:12px 14px;transition:border-color .15s,box-shadow .15s}' +
    '.mf-card:focus-within{border-color:#34d399;box-shadow:0 0 0 2px rgba(52,211,153,.2)}' +
    '.mf-card.filled{border-color:#0284c7}' +
    '.mf-inp{width:100%;border-radius:9px;border:1px solid #475569;background:#1e293b;padding:7px 10px;color:#f8fafc;font-size:1rem;font-weight:600;outline:none;transition:border-color .15s}' +
    '.mf-inp:focus{border-color:#34d399;background:#020617}' +
    '.mf-inp:disabled{opacity:.65;cursor:not-allowed}' +
    '#mfPad{position:fixed;left:0;right:0;bottom:0;z-index:35;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));background:rgba(2,6,23,.97);border-top:1px solid #475569;box-shadow:0 -8px 24px rgba(0,0,0,.55)}' +
    '#mfPad.hidden{display:none}' +
    '.mf-padgrid{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:6px;max-width:760px;margin:0 auto}' +
    '.mf-key{height:44px;padding:0;border:1px solid #475569;border-radius:10px;background:#1e293b;color:#f1f5f9;font:600 19px/1 system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.mf-key.txt{font-size:12px}' +
    '.mf-key.sym{background:#0b1220;color:#7dd3fc}' +
    '.mf-key.act{background:#0f766e;color:#ecfeff}' +
    '.mf-key:active{background:#334155}' +
    '@media(max-width:640px){.mf-padgrid{grid-template-columns:repeat(6,minmax(0,1fr))}.mf-key{height:42px}}'
  );

  const BTN_G = 'rounded-xl bg-emerald-400 px-5 py-2.5 font-bold text-slate-900 shadow-[0_0_18px_rgba(52,211,153,0.45)] transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200';
  const BTN_B = 'rounded-xl bg-sky-500 px-5 py-2.5 font-bold text-white shadow-[0_0_18px_rgba(14,165,233,0.45)] transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300';
  const BTN_O = 'rounded-xl border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-400';
  const CARD = 'mb-5 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-lg shadow-black/30 md:p-6';

  /* ===================== KEZDŐ ÉS FELADATLAP FELÜLET ===================== */
  const policyHtml = U.elo ? `
    <div class="mb-5 rounded-2xl border border-amber-600/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 md:p-5">
      <h2 class="mb-2 flex items-center gap-2 text-lg font-bold text-amber-400"><span>ℹ️</span>Tájékoztató és Szabályzat</h2>
      <p class="mb-3 text-sm leading-relaxed text-slate-200">
        A felmérő <b>${TOTAL_TASKS} feladatot</b> tartalmaz négy témakörben (I. Egész számok, II. Tizedestörtek, III. Törtek, IV. Vegyes műveletek). Csak a végeredményeket kell beírnod a mezőkbe.
      </p>
      <div class="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-amber-300">Fontos szabályok:</h3>
        <ul class="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-300 md:text-sm">
          <li>Az osztályzat alapja a <b>kitöltöttségi arány</b> és a <b>megoldott feladatok pontosságának</b> átlaga.</li>
          <li>A felmérő beküldésekor az eredményed automatikusan rögzítésre kerül a tanárodnak.</li>
          <li>Többszöri indítás esetén kizárólag a <b>legkorábban beérkezett</b> megoldásod érvényes!</li>
          <li>Ha elhagyod az oldalt (másik lapra vagy alkalmazásra váltasz), a felmérő azonnal lezáródik és az addigi válaszaid kerülnek beküldésre.</li>
          <li>A személyes kódod csak a tiéd: ne add oda másnak!</li>
        </ul>
      </div>
    </div>` : `
    <div class="mb-5 rounded-2xl border border-sky-600/60 bg-slate-900/70 p-4 text-sm text-slate-200">
      <b>Archív gyakorló mód:</b> A feladatsor szabadon gyakorolható, az ellenőrzés azonnal megjelenik, és nem történik beküldés.
    </div>`;

  const sectionsHtml = SECTIONS.map(function (sec) {
    const blocksHtml = sec.blocks.map(function (blk) {
      const cardsHtml = blk.tasks.map(function (t) {
        const taskObj = ALL_TASKS.filter(function (x) { return x.id === t.id; })[0];
        return `
          <div class="mf-card" data-card="${esc(t.id)}">
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-sky-400">${esc(blk.code + t.num)}</span>
              <div class="mf-expr text-right font-semibold">${safeTaskHtml(t.expr, t.id)} <span class="text-slate-400">=</span></div>
            </div>
            <div class="flex items-center gap-2">
              <input type="text" class="mf-inp" data-tid="${esc(t.id)}" aria-label="${esc(taskObj.fullLabel)} végeredmény"
                autocomplete="off" spellcheck="false" placeholder="Eredmény...">
            </div>
            <div class="mf-pv mt-1 min-h-[1.25rem] text-right text-xs" data-pv="${esc(t.id)}"></div>
          </div>`;
      }).join('');

      return `
        <div class="mb-6 last:mb-0">
          <h3 class="mb-3 border-b border-slate-700/80 pb-1.5 text-base font-bold text-amber-300">${esc(blk.label)}</h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            ${cardsHtml}
          </div>
        </div>`;
    }).join('');

    return `
      <section class="${CARD}">
        <h2 class="mb-4 flex items-center justify-between border-b border-slate-700 pb-2.5 text-xl font-extrabold text-emerald-400">
          <span>${esc(sec.title)}</span>
          <span class="text-xs font-normal text-slate-400">${sec.blocks.reduce(function (s, b) { return s + b.tasks.length; }, 0)} feladat</span>
        </h2>
        ${blocksHtml}
      </section>`;
  }).join('');

  mount.innerHTML = `
<main class="mx-auto max-w-5xl px-4 pb-24 pt-6">
  <!-- KEZDŐ NÉZET -->
  <section id="view-start">
    <div class="mb-4 flex justify-start">
      <a id="backLink" href="${esc(cfg.visszaHref || 'index.html')}"
         class="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:bg-sky-500 hover:text-white">
        ⬅ Vissza a 8. osztály oldalára
      </a>
    </div>
    <header class="mb-5 text-center">
      <h1 class="text-2xl font-extrabold tracking-tight text-emerald-400 md:text-3xl">${esc(cfg.taskTitle || 'Műveletek racionális számokkal')}</h1>
      <p class="mt-1 text-base text-slate-300">${esc(cfg.subtitle || '8. osztály – témazáró felmérő')}</p>
    </header>
    ${policyHtml}
    <div class="${CARD} text-center">
      <h2 class="mb-2 text-lg font-bold text-slate-100">Készen állsz a kezdésre?</h2>
      <p class="mb-5 text-sm text-slate-400">
        Beírási segítség: negatív számoknál használhatod a mínusz jelet (pl. <b>-5</b>), tizedestörteknél a vesszőt (pl. <b>-0,9</b>),
        törteknél a perjelet (pl. <b>-3/4</b>), vegyes számoknál az egész és a tört között szóközt (pl. <b>2 2/5</b>).
      </p>
      <button type="button" id="startBtn" class="${BTN_G} text-base px-8 py-3">Felmérő indítása ➔</button>
    </div>
  </section>

  <!-- FELADATLAP NÉZET -->
  <section id="view-test" class="hidden">
    <div class="sticky top-0 z-20 -mx-4 mb-5 border-b border-slate-700/90 bg-slate-950/95 px-4 py-3 backdrop-blur">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <span class="font-bold text-emerald-400">Műveletek racionális számokkal</span>
          <span class="ml-2 text-xs text-slate-400">(${TOTAL_TASKS} feladat)</span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" id="kbToggle" class="hidden rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-emerald-400"></button>
          <span id="progressBadge" class="rounded-full border border-sky-500/40 bg-sky-950/60 px-3 py-1 text-xs font-bold text-sky-300">
            Kitöltve: 0 / ${TOTAL_TASKS}
          </span>
          <button type="button" id="finishTopBtn" class="${BTN_G} py-1.5 px-4 text-sm">Felmérő beküldése</button>
        </div>
      </div>
    </div>

    <div class="mb-5 rounded-xl border border-sky-500/40 bg-sky-950/30 p-3.5 text-xs leading-relaxed text-sky-100 md:text-sm">
      <b class="text-sky-300">💡 Beírási útmutató:</b>
      Tizedestörtet vesszővel írj (pl. <b>-0,9</b>). Törtet <b>/</b> jellel egyszerűsítve adj meg (pl. <b>-2/3</b>), vegyes számot az egész és a tört között szóközzel (pl. <b>2 2/5</b>).
    </div>

    <div id="sectionsContainer">
      ${sectionsHtml}
    </div>

    <div class="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
      <p id="bottomSummary" class="text-sm text-slate-300">Eddig <b>0 / ${TOTAL_TASKS}</b> feladatot töltöttél ki.</p>
      <button type="button" id="finishBottomBtn" class="${BTN_G} px-8 py-3 text-base">Felmérő lezárása és beküldése ✔</button>
    </div>
  </section>

  <!-- MEGERŐSÍTŐ ABLAK -->
  <div id="confirmModal" data-ov class="fixed inset-0 z-40 hidden overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" class="m-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
      <h2 class="mb-2 text-xl font-bold text-slate-100">Beküldöd a felmérőt?</h2>
      <p id="confirmText" class="text-sm leading-relaxed text-slate-300"></p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button id="cYes" type="button" class="${BTN_G}">Igen, beküldöm</button>
        <button id="cNo" type="button" class="${BTN_O}">Még ellenőrzöm</button>
      </div>
    </div>
  </div>

  <!-- EREDMÉNY ABLAK -->
  <div id="resultModal" data-ov class="fixed inset-0 z-40 hidden overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" aria-live="polite" class="m-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
      <div id="sending">
        <div class="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400"></div>
        <h2 class="text-xl font-bold text-slate-100">Eredmények küldése és mentése...</h2>
      </div>
      <div id="done" class="hidden">
        <h2 class="text-2xl font-extrabold text-slate-100">Felmérő értékelése</h2>
        <p id="forcedMsg" class="mt-2 hidden rounded-lg border border-amber-500/40 bg-amber-950/50 p-2 text-xs text-amber-300">
          A felmérő automatikusan lezárult, mert elhagytad az oldalt. Az addig beírt válaszaidat elküldtük.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <div class="text-xs uppercase tracking-wider text-slate-400">Jó válaszok</div>
            <div id="resScore" class="mt-1 text-3xl font-extrabold text-emerald-400"></div>
          </div>
          <div class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <div class="text-xs uppercase tracking-wider text-slate-400">Teljesítmény</div>
            <div id="resPercent" class="mt-1 text-3xl font-extrabold text-sky-400"></div>
          </div>
        </div>

        <div class="mt-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <div class="text-xs uppercase tracking-wider text-slate-400">Érdemjegy</div>
          <div id="resGrade" class="mt-1 text-2xl font-extrabold"></div>
        </div>

        <p id="sendMsg" class="mt-4 text-sm text-slate-400"></p>

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button id="rSol" type="button" class="${BTN_B}">Megoldás ellenőrzése</button>
          <button id="rClose" type="button" class="${BTN_O}">Bezárás</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MEGOLDÁS ELLENŐRZÉSE ABLAK (CSAK A MEGVÁLASZOLT FELADATOK) -->
  <div id="solModal" data-ov class="mf-sol fixed inset-0 z-50 hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" class="m-auto w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl md:p-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 class="text-xl font-extrabold text-emerald-400">Megoldások ellenőrzése</h2>
          <p class="text-xs text-slate-400">Csak azokat a feladatokat listázzuk, amelyekhez beírtál eredményt.</p>
        </div>
        <button id="solCloseTop" type="button" aria-label="Bezárás" class="rounded-xl px-3 py-1 text-2xl text-slate-300 hover:bg-slate-800 hover:text-white">✕</button>
      </div>

      <div id="solList" class="mt-4 max-h-[65vh] space-y-2.5 overflow-y-auto pr-1"></div>

      <div class="mt-5 flex justify-end border-t border-slate-800 pt-4">
        <button id="solCloseBottom" type="button" class="${BTN_G}">Vissza a 8. osztály oldalára</button>
      </div>
    </div>
  </div>

  <!-- LEBEGŐ SZÁMBILLENTYŰZET -->
  <div id="mfPad" class="hidden" role="group" aria-label="Számbillentyűzet">
    <div id="mfPadGrid" class="mf-padgrid"></div>
  </div>
</main>`;

  /* ===================== ÁLLAPOT ÉS MUNKAMENET ===================== */
  let started = false;
  let ended = false;
  let endReason = 'befejezve';
  let activeInput = null;
  let evaluationCache = null;
  const startTimeMap = {};
  const answersMap = {};
  const submissionId = (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);

  function syncBodyLock() {
    const anyOpen = [].slice.call(document.querySelectorAll('[data-ov]')).some(function (el) {
      return !el.classList.contains('hidden');
    });
    document.documentElement.classList.toggle('overflow-hidden', anyOpen);
    document.body.classList.toggle('overflow-hidden', anyOpen);
  }
  function openOv(id) {
    const el = $('#' + id);
    el.classList.remove('hidden');
    el.classList.add('flex');
    syncBodyLock();
  }
  function closeOv(id) {
    const el = $('#' + id);
    el.classList.add('hidden');
    el.classList.remove('flex');
    syncBodyLock();
  }

  /* ===================== BEÉPÍTETT SZÁMBILLENTYŰZET ===================== */
  const TOUCH = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  let padOn = TOUCH;

  const PAD_KEYS = [
    ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'],
    ['0'], [','], ['−', '−', 'sym', 'mínusz'], ['/', '/', 'sym', 'törtvonal'],
    ['(', '(', 'sym'], [')', ')', 'sym'], ['szóköz', 'space', 'sym txt', 'szóköz'],
    ['⌫', 'back', 'act', 'törlés'], ['⏎', 'next', 'act', 'következő mező']
  ];

  $('#mfPadGrid').innerHTML = PAD_KEYS.map(function (k) {
    return '<button type="button" class="mf-key' + (k[2] ? ' ' + k[2] : '') + '" data-k="' + esc(k[1] || k[0]) + '"' +
      (k[3] ? ' title="' + esc(k[3]) + '" aria-label="' + esc(k[3]) + '"' : '') + '>' + k[0] + '</button>';
  }).join('');

  function updatePadVisibility() {
    const showPad = padOn && started && !ended;
    const pad = $('#mfPad');
    pad.classList.toggle('hidden', !showPad);
    const kb = $('#kbToggle');
    kb.classList.toggle('hidden', !TOUCH);
    kb.textContent = padOn ? '⌨ Rendszerbillentyűzet' : '▦ Számbillentyűzet';
    document.querySelectorAll('.mf-inp').forEach(function (inp) {
      inp.setAttribute('inputmode', padOn ? 'none' : 'decimal');
    });
    const h = showPad ? pad.offsetHeight + 16 : 0;
    document.body.style.paddingBottom = h ? h + 'px' : '';
    document.documentElement.style.scrollPaddingBottom = h ? h + 'px' : '';
  }

  $('#kbToggle').addEventListener('click', function () {
    padOn = !padOn;
    updatePadVisibility();
    if (activeInput && !activeInput.disabled) {
      activeInput.blur();
      activeInput.focus();
    }
  });

  function typeIntoInput(inp, ch) {
    const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
    const e = inp.selectionEnd == null ? s : inp.selectionEnd;
    inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e);
    inp.setSelectionRange(s + ch.length, s + ch.length);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function backspaceInput(inp) {
    const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
    const e = inp.selectionEnd == null ? s : inp.selectionEnd;
    let a = s;
    if (s === e) {
      if (s === 0) return;
      a = s - 1;
    }
    inp.value = inp.value.slice(0, a) + inp.value.slice(e);
    inp.setSelectionRange(a, a);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function focusNextInput(current) {
    const all = [].slice.call(document.querySelectorAll('.mf-inp'));
    const idx = all.indexOf(current);
    const nxt = all[idx < 0 ? 0 : idx + 1];
    if (nxt && !nxt.disabled) {
      nxt.focus();
      try { nxt.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
  }

  document.addEventListener('mousedown', function (e) {
    if (e.target.closest('.mf-key')) e.preventDefault();
  });

  $('#mfPad').addEventListener('click', function (e) {
    const btn = e.target.closest('.mf-key');
    if (!btn || !started || ended) return;
    const k = btn.dataset.k;
    const target = activeInput || document.querySelector('.mf-inp');
    if (!target || target.disabled) return;
    if (k === 'next') {
      focusNextInput(target);
      return;
    }
    target.focus();
    if (k === 'back') backspaceInput(target);
    else typeIntoInput(target, k === 'space' ? ' ' : k);
  });

  /* ===================== BEVITEL ÉS ELŐNÉZET ===================== */
  function updateProgressCounters() {
    let filled = 0;
    ALL_TASKS.forEach(function (t) {
      if ((answersMap[t.id] || '').trim() !== '') filled++;
    });
    $('#progressBadge').textContent = 'Kitöltve: ' + filled + ' / ' + TOTAL_TASKS;
    $('#bottomSummary').innerHTML = 'Eddig <b>' + filled + ' / ' + TOTAL_TASKS + '</b> feladatot töltöttél ki.';
    return filled;
  }

  $('#sectionsContainer').addEventListener('focusin', function (e) {
    const inp = e.target.closest('.mf-inp');
    if (!inp) return;
    activeInput = inp;
    const tid = inp.dataset.tid;
    if (!startTimeMap[tid]) startTimeMap[tid] = Date.now();
    if (padOn) {
      setTimeout(function () {
        try { inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) {}
      }, 40);
    }
  });

  $('#sectionsContainer').addEventListener('input', function (e) {
    const inp = e.target.closest('.mf-inp');
    if (!inp) return;
    const tid = inp.dataset.tid;
    const val = inp.value;
    answersMap[tid] = val;

    const card = document.querySelector('[data-card="' + tid + '"]');
    if (card) card.classList.toggle('filled', val.trim() !== '');

    const pv = document.querySelector('[data-pv="' + tid + '"]');
    if (pv) {
      const cleaned = val.trim().replace(/^\((.*)\)$/, '$1').trim();
      pv.innerHTML = cleaned ? safeAnswerHtml(cleaned) : '';
    }
    updateProgressCounters();
  });

  $('#sectionsContainer').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.classList.contains('mf-inp')) {
      e.preventDefault();
      focusNextInput(e.target);
    }
  });

  /* ===================== INDÍTÁS ÉS ÉRTÉKELÉS ===================== */
  $('#startBtn').addEventListener('click', async function () {
    if (!(await U.run('indulas'))) return;
    started = true;
    $('#view-start').classList.add('hidden');
    $('#view-test').classList.remove('hidden');
    updatePadVisibility();
    window.scrollTo(0, 0);
    const first = document.querySelector('.mf-inp');
    if (first) first.focus();
  });

  function evaluateAll() {
    let answeredCount = 0;
    let correctCount = 0;
    const taskResults = [];

    ALL_TASKS.forEach(function (t) {
      const raw = (answersMap[t.id] || '').trim();
      const chk = checkSingleAnswer(raw, t.refQ);
      if (chk.answered) answeredCount++;
      if (chk.correct) correctCount++;

      const secs = startTimeMap[t.id] ? Math.max(1, Math.round((Date.now() - startTimeMap[t.id]) / 1000)) : 0;

      taskResults.push({
        id: t.id,
        fullLabel: t.fullLabel,
        expr: t.expr,
        answered: chk.answered,
        correct: chk.correct,
        studentRaw: raw,
        correctAnswer: t.correctAnswer,
        seconds: secs
      });
    });

    const completionPct = Math.round((answeredCount / TOTAL_TASKS) * 100);
    const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const finalPct = Math.round((completionPct + accuracyPct) / 2);
    const gradeText = gradeNameFor(finalPct);

    return {
      answeredCount: answeredCount,
      correctCount: correctCount,
      totalCount: TOTAL_TASKS,
      completionPct: completionPct,
      accuracyPct: accuracyPct,
      finalPct: finalPct,
      gradeText: gradeText,
      taskResults: taskResults
    };
  }

  function buildPayload(ev, reason) {
    const detailedGrade = ev.gradeText +
      ' | Kitöltve: ' + ev.answeredCount + '/' + ev.totalCount + ' (' + ev.completionPct + '%)' +
      ', Pontosság: ' + ev.correctCount + '/' + (ev.answeredCount || 0) + ' (' + ev.accuracyPct + '%)' +
      ', Átlag: ' + ev.finalPct + '%';

    return {
      reason: reason || 'befejezve',
      setId: String(cfg.setId || '1'),
      submissionId: submissionId,
      sentAt: new Date().toISOString(),
      score: ev.correctCount,
      total: ev.totalCount,
      grade: detailedGrade,
      tasks: ev.taskResults.map(function (r) {
        return {
          expression: (function(){ try { return r.fullLabel + ' ' + M.toText(M.parse(r.evalExpr || r.expr)); } catch (e) { return r.fullLabel + ' ' + r.expr; } })(),
          correct: r.correct,
          finalAnswer: r.studentRaw || '—',
          correctAnswer: r.correctAnswer,
          seconds: r.seconds,
          stepErrors: '',
          studentLines: r.studentRaw ? [r.studentRaw] : [],
          correctLines: [r.correctAnswer],
          feedback: []
        };
      })
    };
  }

  function askConfirmation() {
    if (!started || ended) return;
    const filled = updateProgressCounters();
    const missing = TOTAL_TASKS - filled;
    $('#confirmText').innerHTML =
      'Összesen <b>' + filled + ' / ' + TOTAL_TASKS + '</b> feladatot válaszoltál meg' +
      (missing > 0 ? ' (<b>' + missing + '</b> mező üresen maradt).' : ' (minden feladatot kitöltöttél).') +
      '<br><br>A beküldés után már nem módosíthatod a válaszaidat.';
    openOv('confirmModal');
    $('#cYes').focus();
  }

  $('#finishTopBtn').addEventListener('click', askConfirmation);
  $('#finishBottomBtn').addEventListener('click', askConfirmation);
  $('#cNo').addEventListener('click', function () { closeOv('confirmModal'); });
  $('#cYes').addEventListener('click', function () {
    closeOv('confirmModal');
    finishTest('befejezve');
  });

  async function finishTest(reason) {
    if (!started || ended) return;
    ended = true;
    endReason = reason || 'befejezve';
    U.emit('lezarva');
    closeOv('confirmModal');

    document.querySelectorAll('.mf-inp').forEach(function (inp) { inp.disabled = true; });
    $('#finishTopBtn').disabled = true;
    $('#finishBottomBtn').disabled = true;
    updatePadVisibility();

    evaluationCache = evaluateAll();
    await sendAndShowResult();
  }

  async function sendAndShowResult() {
    openOv('resultModal');
    if (U.elo) {
      $('#sending').classList.remove('hidden');
      $('#done').classList.add('hidden');
    }

    const ok = await U.kuldes(buildPayload(evaluationCache, endReason));
    const ev = evaluationCache;

    $('#sending').classList.add('hidden');
    $('#done').classList.remove('hidden');
    $('#forcedMsg').classList.toggle('hidden', !(U.elo && endReason === 'lapvaltas'));

    $('#resScore').textContent = ev.correctCount + ' / ' + ev.totalCount;
    $('#resPercent').textContent = ev.finalPct + '%';
    const gEl = $('#resGrade');
    gEl.textContent = ev.gradeText;
    gEl.className = 'mt-1 text-2xl font-extrabold ' + gradeColorClass(ev.finalPct);

    $('#sendMsg').innerHTML = ok === null
      ? 'Archív gyakorló mód – az eredmény nem került beküldésre.'
      : (ok
        ? 'Az eredményeid sikeresen rögzítve lettek ✔'
        : 'Az eredményeket nem sikerült elküldeni. <button type="button" id="retryBtn" class="font-bold text-sky-400 underline">Újrapróbálom</button>');
  }

  $('#sendMsg').addEventListener('click', function (e) {
    if (e.target.id === 'retryBtn') sendAndShowResult();
  });

  /* ===================== MEGOLDÁS ELLENŐRZÉSE (CSAK KITÖLTÖTTEK) ===================== */
  function renderSolutionsModal() {
    const answeredItems = (evaluationCache ? evaluationCache.taskResults : []).filter(function (r) {
      return r.answered;
    });

    if (!answeredItems.length) {
      $('#solList').innerHTML =
        '<div class="rounded-xl border border-slate-700 bg-slate-950/70 p-6 text-center text-sm italic text-slate-400">' +
        'Egyetlen feladathoz sem írtál be eredményt.' +
        '</div>';
      return;
    }

    $('#solList').innerHTML = answeredItems.map(function (item) {
      const borderCls = item.correct ? 'border-emerald-600/50 bg-emerald-950/20' : 'border-red-600/50 bg-red-950/20';
      const badgeHtml = item.correct
        ? '<span class="inline-flex items-center gap-1 rounded-full bg-emerald-900/80 px-2.5 py-0.5 text-xs font-bold text-emerald-300">✔ Helyes</span>'
        : '<span class="inline-flex items-center gap-1 rounded-full bg-red-900/80 px-2.5 py-0.5 text-xs font-bold text-red-300">✘ Hibás</span>';

      const studentFormatted = safeAnswerHtml(item.studentRaw.replace(/^\((.*)\)$/, '$1').trim()) || esc(item.studentRaw);
      const correctFormatted = safeAnswerHtml(item.correctAnswer) || esc(item.correctAnswer);

      const correctionHtml = item.correct
        ? ''
        : '<span class="ml-3 text-slate-300">Helyes végeredmény: <b class="text-emerald-300">' + correctFormatted + '</b></span>';

      return `
        <div class="rounded-xl border ${borderCls} p-3.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-sm font-bold text-slate-100">
              <span class="mr-1.5 text-sky-400">${esc(item.fullLabel)})</span>
              <span>${FX.task(item.expr)} =</span>
            </div>
            ${badgeHtml}
          </div>
          <div class="mt-2 flex flex-wrap items-center text-sm">
            <span class="text-slate-300">Beírt válaszod: <b class="${item.correct ? 'text-emerald-300' : 'text-red-300'}">${studentFormatted}</b></span>
            ${correctionHtml}
          </div>
        </div>`;
    }).join('');
  }

  $('#rSol').addEventListener('click', function () {
    renderSolutionsModal();
    closeOv('resultModal');
    openOv('solModal');
  });

  function exitToClassPage() {
    window.location.href = cfg.visszaHref || 'index.html';
  }

  $('#rClose').addEventListener('click', exitToClassPage);
  $('#solCloseTop').addEventListener('click', exitToClassPage);
  $('#solCloseBottom').addEventListener('click', exitToClassPage);

  /* ===================== KERET ESEMÉNYEK (LAPVÁLTÁS / KILÉPÉS) ===================== */
  U.aktiv = function () { return started && !ended; };

  U.on('lapvaltas', function () {
    finishTest('lapvaltas');
  });

  U.on('kilepes', function () {
    if (!U.aktiv()) return;
    ended = true;
    endReason = 'lapvaltas';
    const ev = evaluateAll();
    U.kuldes(buildPayload(ev, 'lapvaltas'), { csendes: true });
  });
})(window.UJITAS);
