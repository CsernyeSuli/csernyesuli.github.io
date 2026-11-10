'use strict';
/* =====================================================================
   MŰVELETI SORREND GYAKORLÓ – ARCHÍV LOGIKAI VÁZ
   ===================================================================== */

const TASKS_PER_GROUP = 5;
const MAX_STEP_ROWS = 10;
const PAGE_CONFIG = (typeof window !== 'undefined' && window.PAGE_CONFIG) || {};
const TASK_SET = PAGE_CONFIG.taskSet || 'orai';
const typeFix = s => String(s).replace(/\*/g, '·');

const GROUPS_BY_SET = {
  'orai': [
    { id: 1, title: '1. Feladatsor', tasks: ['2×(15:3−2×2)+12:4×5', '4×(24:6−1×5)+18:3×2', '3×(30:5−2×4)+20:2×3', '5×(18:2−3×3)+16:8×7', '2×(40:8−1×2)+35:5×4']},
    { id: 2, title: '2. Feladatsor', tasks: ['12:(2×4−10:2)+6×4:3', '20:(3×3−12:3)+8×5:2', '18:(1×5−8:4)+9×2:6', '30:(4×2−15:5)+7×6:2', '16:(2×5−18:3)+5×8:10']},
    { id: 3, title: '3. Feladatsor', tasks: ['(− 185) · (− 3) + 0 · (− 8) · 12', '(− 214) · (− 5) + (− 11) · 0 · (− 6)', '(− 96) · (− 7) + 15 · (− 4) · 0', '(− 342) · (− 2) + 0 · 14 · (− 9)', '(− 178) · (− 6) + (− 23) · 0 · 8']},
    { id: 4, title: '4. Feladatsor', tasks: ['(−145) : (+5) − 0 · (−15) · 6', '(−231) : (−3) − (−8) · 0 · (−12)', '(+88) : (−8) − 19 · (−5) · 0', '(−312) : (−2) − 0 · 21 · (−7)', '(−168) : (+6) − (−14) · 0 · 9']},
    { id: 5, title: '5. Feladatsor', tasks: ['[(− 18) − (− 6)] · (− 4) : 8', '[(− 25) − (− 10)] · (− 6) : 9', '[(− 32) − (− 12)] · (− 3) : 5', '[(− 15) − (− 3)] · (− 7) : 6', '[(− 40) − (− 16)] · (− 2) : 4']},
    { id: 6, title: '6. Feladatsor', tasks: ['[(−28) − (−4)] : (+8) · (−4)', '[(+36) + (−8)] : (−7) · (+3)', '[(−50) + (+10)] : (−8) · (+5)', '[(+45) − (+9)] : (−9) · (+6)', '[(−64) − (−16)] : (+12) · (−7)']},
    { id: 7, title: '7. Feladatsor', tasks: ['12 * (72 : 8 + 5 * 7) - 48 : 6 * 2', '-15 * [(-120) : 6 + 4 * 9] - 60 : (-5) * 3', '20 * [100 : (-5) + (-6) * (-8)] - (-72) : 9 * (-4)', '-8 * [(-144) : (-12) + 7 * (-6)] - 96 : (-8) * (-5)', '25 * [200 : 8 + (-9) * 5] - (-150) : 10 * 3']},
    { id: 8, title: '8. Feladatsor', tasks: ['160 : (6 * 8 - 40 : 5) + 48 * 2 : 6', '-112 : [(-12) * 5 - 36 : (-9)] + 60 * (-4) : 5', '108 : [10 * (-6) - (-48) : 8] + (-72) * 5 : (-6)', '-136 : [(-12) * 12 - 72 : (-9)] + 96 * (-5) : (-8)', '190 : [20 * 8 - (-150) : 5] + (-120) * 3 : 5']},
  ],
  'hazi': [
    { id: 1, title: '1. Feladatsor', tasks: ['(− 185) · (− 3) + 0 · (− 8) · 12', '(− 214) · (− 5) + (− 11) · 0 · (− 6)', '(− 96) · (− 7) + 15 · (− 4) · 0', '(− 342) · (− 2) + 0 · 14 · (− 9)', '(− 178) · (− 6) + (− 23) · 0 · 8']},
    { id: 2, title: '2. Feladatsor', tasks: ['(−145) : (+5) − 0 · (−15) · 6', '(−231) : (−3) − (−8) · 0 · (−12)', '(+88) : (−8) − 19 · (−5) · 0', '(−312) : (−2) − 0 · 21 · (−7)', '(−168) : (+6) − (−14) · 0 · 9']},
    { id: 3, title: '3. Feladatsor', tasks: ['[(− 18) − (− 6)] · (− 4) : 8', '[(− 25) − (− 10)] · (− 6) : 9', '[(− 32) − (− 12)] · (− 3) : 5', '[(− 15) − (− 3)] · (− 7) : 6', '[(− 40) − (− 16)] · (− 2) : 4']},
    { id: 4, title: '4. Feladatsor', tasks: ['[(−28) − (−4)] : (+8) · (−4)', '[(+36) + (−8)] : (−7) · (+3)', '[(−50) + (+10)] : (−8) · (+5)', '[(+45) − (+9)] : (−9) · (+6)', '[(−64) − (−16)] : (+12) · (+7)']},
    { id: 5, title: '5. Feladatsor', tasks: ['12 * (72 : 8 + 5 * 7) - 48 : 6 * 2', '-15 * [(-120) : 6 + 4 * 9] - 60 : (-5) * 3', '20 * [100 : (-5) + (-6) * (-8)] - (-72) : 9 * (-4)', '-8 * [(-144) : (-12) + 7 * (-6)] - 96 : (-8) * (-5)', '25 * [200 : 8 + (-9) * 5] - (-150) : 10 * 3']},
    { id: 6, title: '6. Feladatsor', tasks: ['160 : (6 * 8 - 40 : 5) + 48 * 2 : 6', '-112 : [(-12) * 5 - 36 : (-9)] + 60 * (-4) : 5', '108 : [10 * (-6) - (-48) : 8] + (-72) * 5 : (-6)', '-136 : [(-12) * 12 - 72 : (-9)] + 96 * (-5) : (-8)', '190 : [20 * 8 - (-150) : 5] + (-120) * 3 : 5']},
    { id: 7, title: '7. Feladatsor', tasks: ['180 : [6 · (-3) - (-40) : 5] + 12 · (-5) : (-3)', '-240 : [(-4) * 5 - 36 : (-9)] + 15 · 8 : 4', '400 : [4 · (-6) - (-36) : 9] + (-12) · 10 : (-4)', '-560 : [(-5) * (-4) - (-32) : 4] + 25 · 4 : (-5)', '720 : [8 · (-3) - (-72) : 8] + (-16) · 5 : (-4)']},
    { id: 8, title: '8. Feladatsor', tasks: ['180 : [6 · (-3) + (-60) : 5] - 12 · (-5) : (-3)', '-12 · [140 : (-7) - 36 : 9] + 15 · 8 : (-6)', '360 : [4 · (-6) - (-12) * 3] - (-180) : 10 · (-4)', '-5 · (-112) : 28 - (-32) : 4 + 240 : 4 · (-5)', '24 · [(-150) : 5 + (-72) : 8] - (-16) · 5 : (-4)']},
  ],
};
const GROUPS = GROUPS_BY_SET[TASK_SET] || GROUPS_BY_SET['orai'];

class ParseError extends Error {}
class MathError extends Error {}

function normalizeInput(s) {
  return String(s)
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[×·∙]/g, '*')
    .replace(/[÷:]/g, '/')
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
      let j = i; while (j < s.length && /\d/.test(s[j])) j++;
      tokens.push({ t: 'num', v: Number(s.slice(i, j)) }); i = j; continue;
    }
    if ('+-*/'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }
    if (c === '(' || c === ')') { tokens.push({ t: c }); i++; continue; }
    throw new ParseError(`Ismeretlen jel: „${c}”`);
  }
  return tokens;
}

const num = v => ({ type: 'num', value: v });

function parse(src) {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (t, ops) => t && t.t === 'op' && ops.includes(t.v);

  function expr() {
    let left = term();
    while (isOp(peek(), '+-')) { const op = tokens[pos++].v; left = { type: 'bin', op, l: left, r: term() }; }
    return left;
  }
  function term() {
    let left = unary();
    while (isOp(peek(), '*/')) { const op = tokens[pos++].v; left = { type: 'bin', op, l: left, r: unary() }; }
    return left;
  }
  function unary() {
    if (isOp(peek(), '+')) { pos++; return unary(); }
    if (isOp(peek(), '-')) {
      pos++;
      const e = unary();
      return e.type === 'num' ? num(-e.value) : { type: 'neg', e };
    }
    return primary();
  }
  function primary() {
    const t = tokens[pos++];
    if (!t) throw new ParseError('A kifejezés félbemaradt');
    if (t.t === 'num') return num(t.v);
    if (t.t === '(') {
      const e = expr();
      if (!tokens[pos] || tokens[pos].t !== ')') throw new ParseError('Hiányzó záró zárójel');
      pos++; return e;
    }
    throw new ParseError('Itt szám vagy nyitó zárójel hiányzik');
  }

  if (!tokens.length) throw new ParseError('Üres kifejezés');
  const ast = expr();
  if (pos < tokens.length) throw new ParseError('Hiányzó műveleti jel vagy felesleges zárójel');
  return ast;
}

const PREC = { '+': 1, '-': 1, '*': 2, '/': 2 };
const EPS = 1e-9;

function evaluate(n) {
  switch (n.type) {
    case 'num': return n.value;
    case 'neg': return -evaluate(n.e);
    case 'bin': {
      const a = evaluate(n.l), b = evaluate(n.r);
      if (n.op === '+') return a + b;
      if (n.op === '-') return a - b;
      if (n.op === '*') return a * b;
      if (b === 0) throw new MathError('Nullával osztás');
      return a / b;
    }
  }
}

function toCanonical(n) {
  switch (n.type) {
    case 'num': return String(n.value);
    case 'neg': return '-(' + toCanonical(n.e) + ')';
    case 'bin': {
      const p = PREC[n.op];
      const lNeed = n.l.type === 'bin' && PREC[n.l.op] < p;
      const rNeed = n.r.type === 'bin'
        ? PREC[n.r.op] <= p
        : (n.r.type === 'neg' || (n.r.type === 'num' && n.r.value < 0));
      const L = toCanonical(n.l), R = toCanonical(n.r);
      return `${lNeed ? `(${L})` : L} ${n.op} ${rNeed ? `(${R})` : R}`;
    }
  }
}

function findRedexes(n, path = []) {
  if (n.type === 'bin') {
    if (n.l.type === 'num' && n.r.type === 'num') return [{ path, node: n }];
    return [...findRedexes(n.l, [...path, 'l']), ...findRedexes(n.r, [...path, 'r'])];
  }
  if (n.type === 'neg') return findRedexes(n.e, [...path, 'e']);
  return [];
}

function replaceAt(n, path, newNode) {
  if (!path.length) return newNode;
  const [k, ...rest] = path;
  if (n.type === 'bin') return { ...n, [k]: replaceAt(n[k], rest, newNode) };
  return { ...n, e: replaceAt(n.e, rest, newNode) };
}

function foldNeg(n) {
  if (n.type === 'neg') { const e = foldNeg(n.e); return e.type === 'num' ? num(-e.value) : { type: 'neg', e }; }
  if (n.type === 'bin') return { ...n, l: foldNeg(n.l), r: foldNeg(n.r) };
  return n;
}

function collectSubtrees(n, out = new Set()) {
  out.add(toCanonical(n));
  if (n.type === 'bin') { collectSubtrees(n.l, out); collectSubtrees(n.r, out); }
  if (n.type === 'neg') collectSubtrees(n.e, out);
  return out;
}

function solveReference(exprStr) {
  let tree = parse(exprStr);
  const steps = [];
  for (let guard = 0; tree.type !== 'num' && guard < 50; guard++) {
    const statements = [];
    for (const r of findRedexes(tree)) {
      const value = evaluate(r.node);
      statements.push({ text: `${toCanonical(r.node)} = ${value}`, value });
      tree = replaceAt(tree, r.path, num(value));
    }
    tree = foldNeg(tree);
    steps.push({ statements, expression: toCanonical(tree) });
  }
  return { start: toCanonical(parse(exprStr)), steps, result: evaluate(tree) };
}

function analyzeStep(prevTree, { calc, expr }) {
  const problems = [];
  let variants = [prevTree];
  let okStatements = 0;

  const stmts = String(calc).split(';').map(s => s.trim()).filter(Boolean);
  if (!stmts.length) problems.push({ code: 'FORMAT', msg: 'Nem írtál be részszámítást.' });

  for (const s of stmts) {
    const parts = s.split('=');
    if (parts.length !== 2) { problems.push({ code: 'FORMAT', stmt: s, msg: `„${s}”: a forma legyen „művelet = eredmény”.` }); continue; }
    let left, right;
    try { left = parse(parts[0]); right = parse(parts[1]); }
    catch (e) { problems.push({ code: 'PARSE', stmt: s, msg: `„${s}”: ${e.message}.` }); continue; }
    if (right.type !== 'num') { problems.push({ code: 'NOT_NUMBER', stmt: s, msg: `„${s}”: az egyenlőségjel után egyetlen szám kell.` }); continue; }

    const key = toCanonical(left);
    const expanded = [];
    let truth = null;
    for (const v of variants) {
      const rs = findRedexes(v).filter(r => toCanonical(r.node) === key);
      if (!rs.length) continue;
      truth = evaluate(rs[0].node);
      const options = [rs]; if (rs.length > 1) options.push([rs[0]]);
      for (const opt of options) expanded.push(foldNeg(opt.reduce((acc, r) => replaceAt(acc, r.path, num(truth)), v)));
    }
    if (!expanded.length) {
      const known = new Set(variants.flatMap(v => [...collectSubtrees(v)]));
      problems.push(known.has(key)
        ? { code: 'MULTI_OP', stmt: s, msg: `„${s}”: egy részszámításban csak egy műveletet végezz el.` }
        : { code: 'NOT_IN_EXPRESSION', stmt: s, msg: `„${s}”: ez a művelet most nem végezhető el.` });
      continue;
    }
    if (Math.abs(truth - right.value) > EPS) { problems.push({ code: 'ARITHMETIC', stmt: s, msg: `„${s}”: számolási hiba.` }); continue; }
    variants = expanded; okStatements++;
  }

  let studentTree = null;
  try { studentTree = parse(expr); }
  catch (e) { problems.push({ code: 'EXPR_PARSE', msg: `Az új műveletsor hibás: ${e.message}.` }); }

  if (studentTree && stmts.length && okStatements === stmts.length) {
    if (!variants.map(toCanonical).includes(toCanonical(studentTree))) {
      let same = false;
      try { same = Math.abs(evaluate(studentTree) - evaluate(prevTree)) < EPS; } catch {}
      problems.push(same
        ? { code: 'SUBST_MISMATCH', msg: 'Az új műveletsor értéke jó, de nem a felírt részeredmények behelyettesítése.' }
        : { code: 'VALUE_CHANGED', msg: 'Az új műveletsor értéke megváltozott.' });
    }
  }
  return { ok: problems.length === 0, problems, nextTree: studentTree || prevTree };
}

function analyzeSolution(taskExpr, studentSteps) {
  let tree = parse(taskExpr);
  return studentSteps.map(step => {
    const res = analyzeStep(tree, step);
    tree = res.nextTree;
    return { ...step, ok: res.ok, problems: res.problems };
  });
}

function parseAnswer(raw) {
  const s = String(raw).trim().replace(',', '.');
  if (!/^[-\u2212]?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s.replace('\u2212', '-'));
}

const REASON_MSG = {
  NO_STEPS:    'A végeredmény jó, de nem írtál lépéseket.',
  STEP_ERRORS: 'A végeredmény jó, de a leírt lépéseid hibásak vagy hiányosak.',
  INCOMPLETE:  'A végeredmény jó, de a lépéseid nem jutnak el a végeredményig.',
};

function lastStepReachesResult(steps, result) {
  try {
    const t = foldNeg(parse(steps[steps.length - 1].expr));
    return t.type === 'num' && Math.abs(t.value - result) < EPS;
  } catch { return false; }
}

class PracticeSession {
  constructor(group) {
    this.group = group;
    this.index = 0; this.results = []; this.rows = [];
    this.resetRows();
  }
  get task() { return this.group.tasks[this.index]; }
  resetRows() { this.rows = [{ calc: '', expr: '' }]; this.startedAt = Date.now(); }
  addRow() { if (this.rows.length < MAX_STEP_ROWS) this.rows.push({ calc: '', expr: '' }); return this.rows.length; }
  setRow(i, field, value) { this.rows[i][field] = value; }

  submit(finalRaw) {
    const steps = this.rows.filter(r => r.calc.trim() || r.expr.trim());
    const reference = solveReference(this.task);
    const finalAnswer = parseAnswer(finalRaw);
    const analysis = analyzeSolution(this.task, steps);
    const finalOk = finalAnswer !== null && Math.abs(finalAnswer - reference.result) < EPS;
    let reason = '';
    if (!finalOk) reason = 'ANSWER';
    else if (!steps.length) reason = 'NO_STEPS';
    else if (!analysis.every(a => a.ok)) reason = 'STEP_ERRORS';
    else if (!lastStepReachesResult(steps, reference.result)) reason = 'INCOMPLETE';
    const correct = reason === '';
    const result = {
      taskIndex: this.index, expression: this.task,
      steps, analysis,
      finalRaw, finalAnswer, correct, reason, reasonMsg: REASON_MSG[reason] || '', reference,
      seconds: Math.round((Date.now() - this.startedAt) / 1000),
    };
    this.results[this.index] = result;
    return result;
  }
  next() {
    if (this.index < TASKS_PER_GROUP - 1) { this.index++; this.resetRows(); return 'NEXT'; }
    return 'DONE';
  }
  summary() {
    const score = this.results.filter(r => r.correct).length;
    return { score, total: TASKS_PER_GROUP, results: this.results };
  }
}

const pretty = t => t.replace(/ \* /g, ' · ').replace(/ \/ /g, ' : ');

function sideBySide(result) {
  return {
    student: result.steps.map(s => `${s.calc}  →  ${s.expr}`),
    correct: result.reference.steps.map(s => pretty(`${s.statements.map(x => x.text).join('; ')}  →  ${s.expression}`)),
  };
}