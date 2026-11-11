/**
 * temak/tortek.js – „Műveletek törtekkel” téma-modul: felület + munkamenet. A feladatok a tortek-adat.js-ben,
 * a számolás és az értékelés a tortek-motor.js-ben van; az azonosítást, védelmet és küldést a közös keret adja (kozos/v1).
 *
 * Az oldal csak a beállítását adja meg, a felületet ez a modul építi fel az #app elembe:
 *   window.UJITAS_CFG = { mod: 'elo', classId: '7', assignmentType: 'Orai', taskTitle: 'Műveletek törtekkel',
 *                         tema: ['tortek-motor', 'tortek-adat', 'tortek'], keszlet: 'orai',
 *                         subtitle: '7. osztály – órai feladat', visszaHref: '../../../7-osztaly.html' };
 * Tailwind CDN a stílusokhoz (mint a korábbi oldalakon). Archív módban nincs kódbekérés, védelem és küldés.
 */
(function (U) {
  'use strict';
  const M = window.TORTEK_MOTOR, D = window.TORTEK_ADAT, cfg = U.cfg;
  const $ = function (s) { return document.querySelector(s); };
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const MAX_STEP_ROWS = 10;
  const PASS = 'Jeles (5)', FAIL = 'Most nem jártál sikerrel, próbáld meg egy másik feladatcsoporttal!';
  const gradeFor = function (sc, t) { return (t > 0 && sc === t) ? PASS : FAIL; };
  const typeFix = function (s) { return String(s).replace(/\*/g, '·'); };           // * → ·

  const mount = document.getElementById('app');
  const groups = (D.keszletek[cfg.keszlet] || []).map(function (id) { return D.csoportok.filter(function (g) { return g.id === id; })[0]; }).filter(Boolean);
  if (!mount || !groups.length) throw new Error('A téma beállítása hibás (hiányzó #app vagy ismeretlen készlet: ' + cfg.keszlet + ').');

  U.css('tortek-stilus',
    'math{font-size:1.2em}.tk-expr{overflow-x:auto}.tk-expr math{font-size:clamp(1.15rem,4.2vw,1.9rem);color:#67e8f9}' +
    '.tk-pv math{font-size:1.05em;color:#a5f3fc}.tk-sol math{font-size:1.1em}.tk-sol .tk-big math{font-size:1.5em;color:#67e8f9}');

  const INPUT = 'w-full select-text rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-60';
  const INSB = 'ins h-8 min-w-[2.25rem] rounded-lg border border-slate-600 bg-slate-800 px-2 font-mono text-base text-slate-100 transition hover:border-emerald-400 disabled:opacity-40';
  const BTN_G = 'rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-900 shadow-[0_0_18px_rgba(52,211,153,0.5)] transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200';
  const BTN_B = 'rounded-xl bg-sky-500 px-4 py-2 font-bold text-white shadow-[0_0_18px_rgba(14,165,233,0.45)] transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300';
  const BTN_O = 'rounded-xl border border-slate-600 px-4 py-2 font-semibold text-slate-200 hover:border-slate-400';
  const CARD = 'mb-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 shadow-lg shadow-black/30 md:p-5';

  /* ===================== FELÜLET ===================== */
  const policy = U.elo ? `
    <div class="mb-4 rounded-2xl border border-amber-600/70 bg-slate-900/60 p-4 shadow-lg shadow-black/30 md:p-5">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-amber-400"><span>ℹ️</span>Tájékoztató és Szabályzat</h2>
      <p class="mb-4 leading-relaxed text-slate-200">A gombra kattintva feladatlap nyílik meg. Old meg mindegyik feladatot! A végén, ha az összes megoldás jó, jeles osztályzatot érsz el!</p>
      <div class="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <h3 class="mb-3 text-sm font-semibold text-amber-300">FONTOS SZABÁLYOK ÉS FIGYELMEZTETÉSEK:</h3>
        <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>A feladatcsoport lezárásakor az eredményed automatikusan elküldésre kerül a tanárodnak, a neveddel és az eredményeddel.</li>
          <li>Ha a feladatcsoportot többször nyitod meg vagy küldöd be, a rendszerben kizárólag a legkorábban beérkezett megoldásod lesz érvényes!</li>
          <li>Ha elhagyod az oldalt (másik lapra kattintasz), a feladatod lezáródik és az addigi eredményeid lesznek elküldve.</li>
          <li>A személyes kódod csak a tiéd: ne add oda másnak!</li>
        </ul>
      </div>
    </div>` : '';

  mount.innerHTML = `
<main class="mx-auto max-w-3xl px-4 pb-16 pt-6">
<section id="view-start">
  <div class="mb-3 flex justify-start">
    <a id="backLink" class="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/60 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-sky-400 hover:bg-sky-500 hover:text-white">⬅ Vissza a 7. osztály oldalára</a>
  </div>
  <header class="mb-4 text-center">
    <h1 id="title" class="text-2xl font-extrabold tracking-tight text-emerald-400 md:text-3xl"></h1>
    <p id="subtitle" class="mt-1 text-base text-slate-300"></p>
  </header>
  ${policy}
  <div class="${CARD}">
    <h2 class="mb-3 border-b border-slate-700 pb-2 text-lg font-bold text-emerald-400">Feladatcsoportok</h2>
    <div id="groups" class="grid gap-3 md:grid-cols-2"></div>
  </div>
</section>

<section id="view-task" class="hidden">
  <div class="mb-3 flex items-center justify-between text-slate-400"><span id="grpTitle" class="font-semibold text-emerald-400"></span><b id="counter" class="text-slate-200"></b></div>
  <div class="mb-3 h-2 overflow-hidden rounded-full bg-slate-700"><div id="bar" class="h-full rounded-full bg-emerald-400 transition-all duration-500"></div></div>

  <div class="${CARD}"><div id="expr" class="tk-expr py-2 text-center"></div></div>

  <div class="${CARD}">
    <div class="mb-3 flex gap-3 rounded-xl border border-sky-500/50 bg-sky-950/40 p-3 text-sm leading-relaxed text-sky-100">
      <span class="text-lg">💡</span>
      <div><b class="text-sky-300">Fontos szabályok:</b> Egyszerre csak egyetlen műveletet végezz el! Több részszámítást pontosvesszővel válassz el (pl. 2/3*27=18; 5/4*2=5/2).
        Törtvonalnak a <b>/</b> jelet, osztásnak a <b>:</b> jelet használd. Osztásnál a reciprokkal is szorozhatsz (2/3:1/2=2/3·2/1).</div>
    </div>
    <div id="steps"></div>
    <div class="mt-2 flex flex-wrap items-center gap-3">
      <button id="addStep" type="button" class="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-white shadow-[0_0_18px_rgba(14,165,233,0.45)] transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-40">[+] Új lépés</button>
      <p id="stepErr" class="hidden text-sm font-medium text-red-400">A számítást zárd le egyenlőségjellel és az eredménnyel is (pl. 15:3=5)!</p>
    </div>
    <div id="insBar" class="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-400">
      <span class="mr-1 font-semibold text-slate-300">Beszúrás:</span>
      <button type="button" data-ins="/" title="törtvonal" class="${INSB}">/</button>
      <button type="button" data-ins="·" title="szorzás" class="${INSB}">·</button>
      <button type="button" data-ins=":" title="osztás" class="${INSB}">:</button>
      <button type="button" data-ins="+" title="összeadás" class="${INSB}">+</button>
      <button type="button" data-ins="−" title="kivonás" class="${INSB}">−</button>
      <button type="button" data-ins="(" class="${INSB}">(</button>
      <button type="button" data-ins=")" class="${INSB}">)</button>
      <button type="button" data-ins="=" class="${INSB}">=</button>
      <button type="button" data-ins=";" class="${INSB}">;</button>
      <span class="basis-full">A szorzáshoz használhatod a csillagot (*) is, a program szorzóponttá alakítja. A beírt képlet alatt emeletes alakban látod, hogyan értelmezte a program.</span>
    </div>
  </div>

  <div class="${CARD}">
    <label for="answer" class="mb-1.5 block text-sm text-slate-400">Végeredmény</label>
    <input id="answer" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="pl. 3/5 vagy 1 1/3" class="${INPUT}">
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" data-ins="−" data-target="answer" title="mínusz" class="${INSB}">−</button>
      <button type="button" data-ins="/" data-target="answer" title="törtvonal" class="${INSB}">/</button>
      <button type="button" data-ins=" " data-target="answer" title="szóköz (vegyes számhoz)" class="${INSB} px-3 text-sm">szóköz</button>
    </div>
    <p class="mt-2 text-xs text-slate-400">Egyszerűsítve add meg. Az 1-nél nagyobb értékű törtet vegyes számként írd (pl. 4/3 helyett 1 1/3: 1, szóköz, 1, /, 3).</p>
    <p id="ansErr" class="mt-2 hidden text-sm text-red-400">Írd be a végeredményt: egész szám, tört, vegyes szám (pl. 1 1/3) vagy tizedes tört.</p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button id="submitBtn" type="button" class="${BTN_G}">Beküld</button>
      <button id="nextBtn" type="button" class="hidden ${BTN_B}">Tovább a következő feladatra</button>
    </div>
  </div>
  <div id="feedback" class="hidden flex-wrap items-center gap-3 rounded-2xl border px-4 py-3"></div>
</section>

<div id="confirmModal" data-ov class="fixed inset-0 z-40 hidden overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
  <div role="dialog" aria-modal="true" class="m-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center shadow-2xl">
    <h2 class="mb-2 text-xl font-bold">Beküldöd?</h2>
    <p class="text-slate-300">Minden résszámítást leírtál és letisztáztál?</p>
    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <button id="cYes" type="button" class="${BTN_G}">Igen, beküldöm</button>
      <button id="cNo" type="button" class="${BTN_O}">Még nem</button>
    </div>
  </div>
</div>

<div id="resultModal" data-ov class="fixed inset-0 z-40 hidden overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
  <div role="dialog" aria-modal="true" aria-live="polite" class="m-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center shadow-2xl">
    <div id="sending"><div class="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400"></div>
      <h2 class="text-xl font-bold">Adatok küldése és mentése...</h2></div>
    <div id="done" class="hidden">
      <h2 class="text-xl font-bold">Gyakorlás kész!</h2>
      <p id="forcedMsg" class="mt-2 hidden text-sm text-amber-300">A feladatsor lezárult, mert elhagytad az oldalt. Az addigi eredményeidet elküldtük.</p>
      <div id="score" class="my-2 text-5xl font-extrabold text-emerald-400"></div>
      <p class="text-slate-400">sikeres feladat</p>
      <div class="mt-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4"><div class="text-sm text-slate-400">Osztályzat / Minősítés</div><div id="grade" class="mt-1 font-bold"></div></div>
      <p id="sendMsg" class="mt-4 text-sm text-slate-400"></p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button id="rClose" type="button" class="${BTN_O}">Bezárás</button>
        <button id="rSol" type="button" class="${BTN_B}">Megoldások</button>
      </div>
    </div>
  </div>
</div>

<div id="solModal" data-ov class="tk-sol fixed inset-0 z-40 hidden overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
  <div role="dialog" aria-modal="true" aria-labelledby="revTitle" class="m-auto w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl md:p-6">
    <div class="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
      <h2 id="revTitle" class="text-lg font-extrabold text-emerald-400 md:text-2xl"></h2>
      <button id="revClose" type="button" aria-label="Bezárás" class="rounded-xl px-3 text-2xl leading-none text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">✕</button>
    </div>
    <div class="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
      <div class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Kifejezés:</div>
      <div id="revExpr" class="tk-big tk-expr"></div>
      <div id="revSummary" class="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400"></div>
    </div>
    <div class="mt-3 grid gap-3 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"><h3 class="mb-3 font-bold text-slate-200">A te megoldásod:</h3><div id="revMine"></div></div>
      <div class="rounded-2xl border border-emerald-700/70 bg-slate-950/70 p-4"><h3 class="mb-3 font-bold text-emerald-300">A helyes megoldásmenet:</h3><div id="revCorrect"></div></div>
    </div>
    <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
      <button id="revPrev" type="button" class="rounded-2xl bg-slate-800 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-30">← Előző feladat</button>
      <span id="revCount" class="font-semibold text-slate-400"></span>
      <button id="revNext" type="button"></button>
    </div>
  </div>
</div>
</main>`;

  $('#title').textContent = D.cim;
  $('#subtitle').textContent = cfg.subtitle || '';
  $('#backLink').setAttribute('href', cfg.visszaHref || '../../../7-osztaly.html');
  document.title = D.cim + (cfg.subtitle ? ' – ' + cfg.subtitle : '');

  /* ===================== MUNKAMENET ===================== */
  class Session {
    constructor(group) {
      this.group = group; this.index = 0; this.results = []; this.ended = false; this.reason = '';
      this.id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      this.resetRows();
    }
    get task() { return this.group.feladatok[this.index]; }
    get total() { return this.group.feladatok.length; }
    resetRows() { this.rows = [{ calc: '', expr: '' }]; this.startedAt = Date.now(); }
    addRow() { if (this.rows.length < MAX_STEP_ROWS) this.rows.push({ calc: '', expr: '' }); return this.rows.length; }
    setRow(i, field, value) { this.rows[i][field] = value; }
    submit(finalRaw) {
      const steps = this.rows.filter(function (r) { return r.calc.trim() || r.expr.trim(); });
      const ev = M.evaluateTask(this.task.kif, steps, finalRaw);
      const res = Object.assign({ taskIndex: this.index, jel: this.task.jel, expression: this.task.kif, steps: steps, finalRaw: finalRaw,
                                  seconds: Math.round((Date.now() - this.startedAt) / 1000) }, ev);
      this.results[this.index] = res;
      return res;
    }
    next() { if (this.index < this.total - 1) { this.index++; this.resetRows(); return 'NEXT'; } return 'DONE'; }
    summary() { return { score: this.results.filter(function (r) { return r && r.correct; }).length, total: this.total }; }
    payload(reason) {
      const s = this.summary();
      return {
        reason: reason || 'befejezve', setId: String(this.group.id), submissionId: this.id, sentAt: new Date().toISOString(),
        score: s.score, total: s.total, grade: gradeFor(s.score, s.total),
        tasks: this.results.filter(Boolean).map(function (r) {
          return {
            expression: M.toText(M.parse(r.expression)), correct: r.correct,
            finalAnswer: r.finalRaw, correctAnswer: r.reference.answerText, seconds: r.seconds,
            stepErrors: r.analysis.reduce(function (a, x) { return a.concat(x.problems.map(function (p) { return p.code; })); }, []).join(','),
            studentLines: r.steps.map(function (st) { return st.calc + '  →  ' + st.expr; }),
            correctLines: r.reference.steps,
            feedback: [r.reasonMsg].concat(r.analysis.reduce(function (a, x) { return a.concat(x.problems.map(function (p) { return p.msg; })); }, [])).filter(Boolean),
          };
        }),
      };
    }
  }

  /* ===================== MEGJELENÍTÉS-SEGÉDEK ===================== */
  let session = null, lastInput = null;
  const show = function (v) { $('#view-start').classList.toggle('hidden', v !== 'start'); $('#view-task').classList.toggle('hidden', v !== 'task'); window.scrollTo(0, 0); };
  function syncLock() {
    const any = [].slice.call(document.querySelectorAll('[data-ov]')).some(function (e) { return !e.classList.contains('hidden'); });
    document.documentElement.classList.toggle('overflow-hidden', any); document.body.classList.toggle('overflow-hidden', any);
  }
  const openOv = function (id) { const e = $('#' + id); e.classList.remove('hidden'); e.classList.add('flex'); syncLock(); };
  const closeOv = function (id) { const e = $('#' + id); e.classList.add('hidden'); e.classList.remove('flex'); syncLock(); };
  /** Képlet, ha értelmezhető; különben a beírt szöveg. */
  const mm = function (text) { return M.previewMathML(text) || esc(text); };

  /* ===================== 1. KEZDŐLAP ===================== */
  $('#groups').innerHTML = groups.map(function (g) {
    return '<button type="button" data-id="' + g.id + '" class="flex items-center justify-between rounded-2xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left transition hover:border-emerald-400 hover:shadow-[0_0_22px_rgba(52,211,153,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">' +
      '<span><span class="block text-base font-bold text-slate-100">' + esc(g.cim) + '</span>' +
      '<span class="mt-1 block text-xs text-slate-400">' + g.feladatok.length + ' feladat</span></span>' +
      '<span class="ml-3 text-xl text-emerald-400">➔</span></button>';
  }).join('');

  $('#groups').addEventListener('click', async function (e) {
    const b = e.target.closest('button[data-id]'); if (!b) return;
    if (!(await U.run('indulas'))) return;                      // élő módban itt kér kódot a rendszer
    session = new Session(groups.filter(function (g) { return g.id === +b.dataset.id; })[0]);
    renderTask();
  });

  /* ===================== 2. FELADAT ===================== */
  function renderTask() {
    lastInput = null;
    $('#grpTitle').textContent = session.group.cim;
    $('#counter').textContent = (session.index + 1) + ' / ' + session.total;
    $('#bar').style.width = (session.index / session.total * 100) + '%';
    $('#expr').innerHTML = M.taskMathML(session.task.kif);
    $('#answer').value = ''; $('#answer').disabled = false;
    ['#ansErr', '#stepErr'].forEach(function (s) { $(s).classList.add('hidden'); });
    const f = $('#feedback'); f.classList.add('hidden'); f.classList.remove('flex');
    $('#nextBtn').classList.add('hidden'); $('#submitBtn').classList.remove('hidden');
    renderRows(); show('task');
  }

  function renderRows(locked) {
    $('#steps').innerHTML = session.rows.map(function (r, i) {
      return '<div class="mb-3"><div class="grid items-center gap-2 md:grid-cols-[2rem_1fr_1fr]">' +
        '<span class="text-slate-500 md:text-right">' + (i + 1) + '.</span>' +
        '<input data-i="' + i + '" data-f="calc" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + (i + 1) + '. részszámítás" class="' + INPUT + '" ' +
        'placeholder="' + (i ? 'Következő részszámítás' : 'Írd le, mivel kezded: pl. 2/3:1/2=4/3') + '" value="' + esc(r.calc) + '" ' + (locked ? 'disabled' : '') + '>' +
        '<input data-i="' + i + '" data-f="expr" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + (i + 1) + '. új műveletsor" class="' + INPUT + '" ' +
        'placeholder="Az új, letisztázott műveletsor" value="' + esc(r.expr) + '" ' + (locked ? 'disabled' : '') + '></div>' +
        '<div class="tk-pv mt-1 grid gap-2 md:grid-cols-[2rem_1fr_1fr]"><span></span>' +
        '<div data-pv="calc" data-i="' + i + '" class="min-h-[1.5rem] overflow-x-auto px-1">' + (r.calc ? M.previewMathML(r.calc) : '') + '</div>' +
        '<div data-pv="expr" data-i="' + i + '" class="min-h-[1.5rem] overflow-x-auto px-1">' + (r.expr ? M.previewMathML(r.expr) : '') + '</div></div></div>';
    }).join('');
    $('#addStep').disabled = !!locked || session.rows.length >= MAX_STEP_ROWS;
    document.querySelectorAll('.ins').forEach(function (b) { b.disabled = !!locked; });
  }

  $('#steps').addEventListener('input', function (e) {         // gépelés közben csak az előnézet frissül
    const t = e.target; if (!t.dataset.f) return;
    if (t.value.indexOf('*') >= 0) { const pos = t.selectionStart; t.value = typeFix(t.value); t.setSelectionRange(pos, pos); }
    session.setRow(+t.dataset.i, t.dataset.f, t.value); $('#stepErr').classList.add('hidden');
    const pv = document.querySelector('[data-pv="' + t.dataset.f + '"][data-i="' + t.dataset.i + '"]');
    if (pv) pv.innerHTML = M.previewMathML(t.value);
  });

  const calcClosed = function (s) {
    return s.split(';').map(function (x) { return x.trim(); }).filter(Boolean)
      .every(function (x) { const k = x.indexOf('='); return k > 0 && x.slice(k + 1).trim() !== ''; });
  };

  $('#steps').addEventListener('focusin', function (e) { if (e.target.dataset.f) lastInput = e.target; });
  $('#answer').addEventListener('focusin', function () { lastInput = $('#answer'); });
  document.addEventListener('mousedown', function (e) { if (e.target.closest('button[data-ins]')) e.preventDefault(); });   // a fókusz (és a billentyűzet) maradjon
  document.addEventListener('click', function (e) {
    const b = e.target.closest('button[data-ins]'); if (!b || b.disabled || !session) return;
    const t = b.dataset.target === 'answer' ? $('#answer')
      : ((lastInput && document.contains(lastInput)) ? lastInput
        : document.querySelector('#steps input[data-i="' + (session.rows.length - 1) + '"][data-f="calc"]'));
    if (!t || t.disabled) return;
    if (t.id === 'answer' && '−/ '.indexOf(b.dataset.ins) < 0) return;      // a végeredménybe csak mínusz, törtvonal és szóköz kerülhet
    t.focus();
    const s = t.selectionStart == null ? t.value.length : t.selectionStart, en = t.selectionEnd == null ? s : t.selectionEnd, ch = b.dataset.ins;
    t.value = t.value.slice(0, s) + ch + t.value.slice(en);
    t.setSelectionRange(s + ch.length, s + ch.length);
    t.dispatchEvent(new Event('input', { bubbles: true }));
  });

  $('#addStep').addEventListener('click', function () {
    const lastIdx = session.rows.length - 1, calc = session.rows[lastIdx].calc.trim();
    if (calc && !calcClosed(calc)) {
      $('#stepErr').classList.remove('hidden');
      document.querySelector('#steps input[data-i="' + lastIdx + '"][data-f="calc"]').focus(); return;
    }
    $('#stepErr').classList.add('hidden');
    const n = session.addRow(); renderRows();
    document.querySelector('#steps input[data-i="' + (n - 1) + '"]').focus();
  });

  $('#submitBtn').addEventListener('click', function () {
    if (M.gradeAnswer($('#answer').value, new M.Q(0n)).kind === null) { $('#ansErr').classList.remove('hidden'); $('#answer').focus(); return; }
    $('#ansErr').classList.add('hidden'); openOv('confirmModal'); $('#cYes').focus();
  });
  $('#cNo').addEventListener('click', function () { closeOv('confirmModal'); });
  $('#cYes').addEventListener('click', function () {
    closeOv('confirmModal');
    const res = session.submit($('#answer').value);
    renderRows(true); $('#answer').disabled = true; $('#submitBtn').classList.add('hidden');
    showFeedback(res);
    if (session.index === session.total - 1) finish('befejezve'); else $('#nextBtn').classList.remove('hidden');
  });
  $('#nextBtn').addEventListener('click', function () { session.next(); renderTask(); });

  /** Menet közben csak: helyes/hibás + az eddigi pontszám. A megoldásmenet a végén, a „Megoldások” ablakban látszik. */
  function showFeedback(res) {
    const f = $('#feedback'), ok = res.correct;
    f.className = 'flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ' +
      (ok ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-300' : 'border-red-500/60 bg-red-950/40 text-red-300');
    f.innerHTML = '<span class="text-lg font-bold">' + (ok ? '✔ Helyes' : '✘ Hibás') + '</span>' +
      '<span class="ml-auto text-slate-200">Elért pontszám: <b>' + session.summary().score + ' / ' + session.total + '</b></span>' +
      (res.reasonMsg ? '<span class="basis-full text-sm text-amber-300">' + esc(res.reasonMsg) + '</span>' : '');
    f.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ===================== 3. LEZÁRÁS, KÜLDÉS ===================== */
  async function finish(reason) {
    if (!session || session.ended) return;
    session.ended = true; session.reason = reason;
    U.emit('lezarva');
    closeOv('confirmModal');
    renderRows(true); $('#answer').disabled = true;
    await deliver();
  }
  async function deliver() {
    openOv('resultModal');
    if (U.elo) { $('#sending').classList.remove('hidden'); $('#done').classList.add('hidden'); }
    const ok = await U.kuldes(session.payload(session.reason));      // true | false | null (archív: nincs küldés)
    const s = session.summary(), g = gradeFor(s.score, s.total);
    $('#sending').classList.add('hidden'); $('#done').classList.remove('hidden');
    $('#forcedMsg').classList.toggle('hidden', !(U.elo && session.reason === 'lapvaltas'));
    $('#score').textContent = s.score + ' / ' + s.total;
    $('#grade').textContent = g; $('#grade').className = 'mt-1 font-bold ' + (g === PASS ? 'text-emerald-400' : 'text-amber-300');
    $('#sendMsg').innerHTML = ok === null ? '' : (ok ? 'Az eredményeid elküldve ✔'
      : 'Az eredményeket nem sikerült elküldeni. <button type="button" id="retry" class="text-sky-400 underline">Újrapróbálom</button>');
  }
  $('#sendMsg').addEventListener('click', function (e) { if (e.target.id === 'retry') deliver(); });

  function goHome() { ['confirmModal', 'resultModal', 'solModal'].forEach(closeOv); session = null; show('start'); }
  $('#rClose').addEventListener('click', goHome);

  /* ===================== 4. MEGOLDÁSOK ===================== */
  let reviewList = [], cur = 0;
  const NAV = 'rounded-2xl px-4 py-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ';
  const NAV_DARK = NAV + 'bg-slate-800 text-slate-100 hover:bg-slate-700';
  const NAV_BLUE = NAV + 'bg-sky-500 text-white shadow-[0_0_18px_rgba(14,165,233,0.45)] hover:bg-sky-400';
  const row = function (k, inner) { return '<div class="flex gap-2 py-2 text-sm ' + (k ? 'border-t border-slate-800' : '') + '">' + inner + '</div>'; };
  const arrow = function (line) { const p = line.split(' → '); return mm(p[0]) + ' <span class="text-slate-500">→</span> ' + (p[1] ? mm(p[1]) : ''); };

  function renderReview() {
    const n = reviewList.length, last = cur >= n - 1, next = $('#revNext');
    next.className = last ? NAV_BLUE : NAV_DARK; next.textContent = last ? 'Bezárás' : 'Következő feladat →';
    $('#revPrev').disabled = cur <= 0;
    if (!n) {
      $('#revTitle').textContent = 'Megoldások'; $('#revCount').textContent = ''; $('#revExpr').textContent = '—'; $('#revSummary').innerHTML = '';
      $('#revMine').innerHTML = $('#revCorrect').innerHTML = '<p class="italic text-slate-500">Még nem küldtél be egyetlen feladatot sem.</p>';
      return;
    }
    const r = reviewList[cur];
    $('#revTitle').textContent = session.group.cim + ' – ' + (r.taskIndex + 1) + '. feladat megoldásai';
    $('#revExpr').innerHTML = M.taskMathML(r.expression);
    $('#revCount').textContent = (cur + 1) + ' / ' + n;
    $('#revSummary').innerHTML = '<span class="rounded-full px-3 py-0.5 ' + (r.correct ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-200') + '">' + (r.correct ? '✔ helyes' : '✘ hibás') + '</span>' +
      '<span>Végeredményed: <b class="text-slate-200">' + (M.answerMathML(r.finalRaw) || esc(r.finalRaw)) + '</b> · helyes eredmény: <b class="text-slate-200">' + (M.answerMathML(r.reference.answerText) || esc(r.reference.answerText)) + '</b></span>' +
      (r.reasonMsg ? '<span class="block w-full text-sm text-amber-300">' + esc(r.reasonMsg) + '</span>' : '');
    $('#revMine').innerHTML = r.analysis.length
      ? r.analysis.map(function (a, k) {
          return row(k, '<span class="' + (a.ok ? 'text-emerald-400' : 'text-red-400') + '">' + (a.ok ? '✔' : '✘') + '</span>' +
            '<div class="min-w-0"><div class="break-words text-slate-200">' + mm(a.calc) + ' <span class="text-slate-500">→</span> ' + mm(a.expr) + '</div>' +
            a.problems.map(function (p) { return '<p class="mt-1 text-sm text-amber-300">' + esc(p.msg) + '</p>'; }).join('') + '</div>');
        }).join('')
      : '<p class="italic text-slate-500">nem írtál lépéseket</p>';
    $('#revCorrect').innerHTML = r.reference.steps.map(function (l, k) {
      return row(k, '<span class="text-slate-500">' + (k + 1) + '.</span><span class="break-words text-slate-200">' + arrow(l) + '</span>');
    }).join('') + row(1, '<span class="text-slate-500">✔</span><span class="text-slate-200">Végeredmény: ' + (M.answerMathML(r.reference.answerText) || esc(r.reference.answerText)) + '</span>');
  }
  const reviewGo = function (d) { cur += d; renderReview(); $('#solModal').scrollTop = 0; };
  $('#rSol').addEventListener('click', function () {
    reviewList = session.results.filter(Boolean); cur = 0;
    renderReview(); closeOv('resultModal'); openOv('solModal'); $('#solModal').scrollTop = 0;
  });
  $('#revPrev').addEventListener('click', function () { reviewGo(-1); });
  $('#revNext').addEventListener('click', function () { if (cur >= reviewList.length - 1) goHome(); else reviewGo(1); });
  $('#revClose').addEventListener('click', goHome);

  /* ===================== 5. A KERETTEL VALÓ KAPCSOLAT ===================== */
  U.aktiv = function () { return !!(session && !session.ended); };
  U.on('lapvaltas', function () { finish('lapvaltas'); });
  U.on('kilepes', function () {                                    // az oldal éppen eltűnik: csendes küldés
    if (!U.aktiv()) return;
    session.ended = true; session.reason = 'lapvaltas';
    U.kuldes(session.payload('lapvaltas'), { csendes: true });
  });
})(window.UJITAS);
