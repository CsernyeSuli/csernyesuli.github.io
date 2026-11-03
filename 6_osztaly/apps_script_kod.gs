/**
 * MŰVELETI SORREND GYAKORLÓ – Google Apps Script (web app, doPost)
 *
 * - Minden diák saját munkalapot kap (pl. "Teszt_Elek_6a"), a sorok a következő szabad sorba kerülnek.
 * - Az "Id_Log" lap tartja nyilván a beküldéseket: a kulcs (diák|csoport|típus) első előfordulása az ÉRVÉNYES
 *   beküldés, minden további GYAKORLÁS (a diák lapjára kerül, de e-mail nem megy).
 * - Ugyanaz a submissionId kétszer nem kerül be (no-cors újrapróbálkozás ellen).
 * Container-bound script: a Google Táblázatból nyisd (Bővítmények → Apps Script).
 */

const CONFIG = {
  TEACHER_EMAIL: 'csernyei.iskola@gmail.com',
  SHARED_SECRET: '',                           // opcionális; egyezzen a kliens APPS_SCRIPT_TOKEN-jével
  SEND_EMAIL: true,
  DEFAULT_TASK_TYPE: 'Szorgalmi_MuveletiSorrend',
  SHEET_IDLOG: 'Id_Log',
  SHEET_LOG: 'Log',
  TASKS_PER_GROUP: 5,
  MAX_TEXT: 2000,
  PRACTICE_NOTE: '[GYAKORLÁS - Nem számít]',
  PASS_TEXT: 'Jeles (5)',
  FAIL_TEXT: 'Most nem jártál sikerrel, próbáld meg egy másik feladatcsoporttal!',
};
const REASONS = { befejezve: 'Befejezve (mind az 5 feladat)', lapvaltas: 'Lapváltás – idő előtt lezárva' };
const ID_HEADERS = ['Kulcs (diák|csoport|típus)', 'submissionId', 'Fogadás ideje', 'Diák neve', 'Osztály',
                    'Csoport', 'Pontszám', 'Státusz', 'E-mail állapota'];

/* ===================== BELÉPÉSI PONT ===================== */

function doPost(e) {
  let p = null, idRow = null, isFirst = false;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();

  try {
    p = parsePayload_(e);
    lock.waitLock(25000);
    try {
      const idSheet = ensureSheet_(ss, CONFIG.SHEET_IDLOG, ID_HEADERS);
      if (inColumn_(idSheet, 2, p.submissionId)) {
        log_(ss, 'DUPLIKÁLT', p.submissionId, 'Már feldolgozott beküldés, kihagyva.');
        return json_({ ok: true, duplicate: true });
      }
      isFirst = !inColumn_(idSheet, 1, p.key);            // első beküldés = érvényes

      appendStudentRow_(ss, p, isFirst);                  // a diák saját lapjára MINDIG
      idRow = writeRow_(idSheet,
        [p.key, p.submissionId, new Date(), p.name, p.cls, p.group, p.score,
         isFirst ? 'ÉLES' : 'GYAKORLÁS', isFirst ? 'függőben' : 'nincs (gyakorlás)'],
        [3], [6, 7]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    if (isFirst) {                                         // e-mail csak az első beküldésről
      let status = 'kikapcsolva';
      if (CONFIG.SEND_EMAIL) {
        try { sendEmail_(p); status = 'elküldve'; }
        catch (err) { status = 'HIBA'; log_(ss, 'E-MAIL HIBA', p.submissionId, String(err)); }
      }
      ss.getSheetByName(CONFIG.SHEET_IDLOG).getRange(idRow, 9).setValue(status);
    }
    return json_({ ok: true, first: isFirst });

  } catch (err) {
    log_(ss, 'HIBA', p ? p.submissionId : '', String(err && err.stack || err));
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Műveleti sorrend gyakorló – a szolgáltatás működik.');
}

/* ===================== BEMENET ===================== */

function gradeFor_(score, total) {
  return (total > 0 && score === total) ? CONFIG.PASS_TEXT : CONFIG.FAIL_TEXT;
}

/** "Teszt Elek" + "6.a" -> "Teszt_Elek_6a" */
function studentSheetName_(name, cls) {
  const c = function (s) { return String(s).trim().replace(/\s+/g, '_').replace(/[^\p{L}\p{N}_-]/gu, ''); };
  let n = [c(name), c(cls)].filter(Boolean).join('_').slice(0, 90) || 'Ismeretlen';
  if (n === CONFIG.SHEET_IDLOG || n === CONFIG.SHEET_LOG) n = 'D_' + n;
  return n;
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('Üres kérés.');
  const p = JSON.parse(e.postData.contents);
  if (CONFIG.SHARED_SECRET && p.token !== CONFIG.SHARED_SECRET) throw new Error('Érvénytelen token.');

  const submissionId = clean_(p.submissionId, 100);
  if (!submissionId) throw new Error('Hiányzik a submissionId.');
  const group = Number(p.group);
  if (!(group >= 1 && group <= 7)) throw new Error('Érvénytelen feladatcsoport: ' + p.group);

  const st = p.student || {};
  const name = clean_(st.name, 100), cls = clean_(st.class || st.id, 50);
  if (!name) throw new Error('Hiányzik a diák neve.');

  const taskType = clean_(p.taskType, 60).replace(/[^A-Za-z0-9_-]/g, '') || CONFIG.DEFAULT_TASK_TYPE;
  const sheetName = studentSheetName_(name, cls);
  const rawTasks = (Array.isArray(p.tasks) ? p.tasks : [])
    .filter(function (t) { return t && typeof t === 'object'; }).slice(0, CONFIG.TASKS_PER_GROUP);

  return {
    submissionId: submissionId, sentAt: clean_(p.sentAt, 40),
    name: name, cls: cls, sheetName: sheetName, taskType: taskType,
    key: sheetName + '|' + group + '|' + taskType,
    group: group, score: Number(p.score) || 0, total: Number(p.total) || CONFIG.TASKS_PER_GROUP,
    reason: REASONS[p.reason] ? p.reason : 'befejezve',
    tasks: rawTasks.map(function (t) {
      return {
        expression: clean_(t.expression, 200), correct: !!t.correct,
        finalAnswer: clean_(t.finalAnswer, 50), correctAnswer: clean_(t.correctAnswer, 50),
        seconds: Number(t.seconds) || 0, studentSteps: clean_(t.studentSteps), stepErrors: clean_(t.stepErrors, 300),
        studentLines: cleanArr_(t.studentLines), correctLines: cleanArr_(t.correctLines), feedback: cleanArr_(t.feedback),
      };
    }),
  };
}
function clean_(v, max) { return String(v == null ? '' : v).slice(0, max || CONFIG.MAX_TEXT); }
function cleanArr_(a) { return Array.isArray(a) ? a.slice(0, 20).map(function (x) { return clean_(x, 300); }) : []; }

/* ===================== TÁBLÁZAT ===================== */

function studentHeaders_() {
  const h = ['Feladat típusa', 'Beküldés ideje (kliens)', 'Fogadás ideje (szerver)', 'Diák neve', 'Osztály',
             'Csoport', 'Pontszám', 'Összesen', 'Osztályzat / Minősítés', 'Lezárás oka', 'submissionId'];
  for (let i = 1; i <= CONFIG.TASKS_PER_GROUP; i++) {
    h.push('F' + i + ' műveletsor', 'F' + i + ' helyes?', 'F' + i + ' válasz', 'F' + i + ' helyes válasz',
           'F' + i + ' idő (mp)', 'F' + i + ' lépések', 'F' + i + ' hibakódok');
  }
  h.push('Megjegyzés');
  return h;
}

function appendStudentRow_(ss, p, isFirst) {
  const sh = ensureSheet_(ss, p.sheetName, studentHeaders_());
  const row = [p.taskType, safeDate_(p.sentAt), new Date(), p.name, p.cls, p.group, p.score, p.total,
               gradeFor_(p.score, p.total), REASONS[p.reason], p.submissionId];
  for (let i = 0; i < CONFIG.TASKS_PER_GROUP; i++) {
    const t = p.tasks[i];
    if (t) row.push(t.expression, t.correct ? 'igen' : 'nem', t.finalAnswer, t.correctAnswer,
                    String(t.seconds), t.studentSteps, t.stepErrors);
    else row.push('', '', '', '', '', '', '');
  }
  row.push(isFirst ? '' : CONFIG.PRACTICE_NOTE);       // a sor végére
  writeRow_(sh, row, [2, 3], [6, 7, 8]);
}

/** A következő szabad sorba ír. Dátum- és számoszlopokon kívül minden sima szöveg ('@'), így a "=…" jellegű
    beírások nem értelmeződnek képletként. Visszaadja a sor számát. */
function writeRow_(sh, values, dateCols, numCols) {
  const r = sh.getLastRow() + 1;
  const fm = [values.map(function (_, i) {
    const c = i + 1;
    return dateCols.indexOf(c) >= 0 ? 'yyyy-mm-dd hh:mm:ss' : (numCols.indexOf(c) >= 0 ? '0' : '@');
  })];
  sh.getRange(r, 1, 1, values.length).setNumberFormats(fm).setValues([values]);
  return r;
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#e8eaf6');
    sh.setFrozenRows(1);
  }
  return sh;
}

function inColumn_(sheet, col, value) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  return !!sheet.getRange(2, col, last - 1, 1).createTextFinder(value).matchEntireCell(true).findNext();
}

function log_(ss, type, id, message) {
  try {
    ensureSheet_(ss, CONFIG.SHEET_LOG, ['Idő', 'Típus', 'submissionId', 'Üzenet'])
      .appendRow([new Date(), type, id || '', String(message).slice(0, 1500)]);
  } catch (e) { /* a naplózás hibája ne törjön tovább */ }
}

/* ===================== E-MAIL (csak az első, érvényes beküldésről) ===================== */

function sendEmail_(p) {
  MailApp.sendEmail({
    to: CONFIG.TEACHER_EMAIL,
    subject: '[Műveleti sorrend] ' + p.name + ' (' + p.cls + ') – ' + p.group + '. feladatsor: ' + p.score + '/' + p.total,
    body: p.name + ' – ' + p.group + '. feladatsor: ' + p.score + '/' + p.total + '. ' + gradeFor_(p.score, p.total) +
          ' (a részletekhez HTML-képes levelezőt használj).',
    htmlBody: buildEmailHtml_(p),
    name: 'Műveleti sorrend gyakorló',
  });
}

function esc_(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildEmailHtml_(p) {
  const mono = 'font-family:Consolas,Menlo,monospace;font-size:13px;';
  const grade = gradeFor_(p.score, p.total), pass = grade === CONFIG.PASS_TEXT;
  let html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:0 auto;color:#222">' +
    '<h2 style="margin:0 0 4px">Műveleti sorrend – ' + esc_(p.group) + '. feladatsor</h2>' +
    '<p style="margin:0 0 10px;color:#555">' + esc_(p.name) + (p.cls ? ' (' + esc_(p.cls) + ')' : '') +
    ' · beküldve: ' + esc_(formatDate_(p.sentAt)) + ' · lap: ' + esc_(p.sheetName) + '</p>' +
    '<div style="font-size:20px;font-weight:bold;margin-bottom:4px">Eredmény: ' + esc_(p.score) + ' / ' + esc_(p.total) + '</div>' +
    '<div style="margin-bottom:6px;font-weight:bold;color:' + (pass ? '#2e7d32' : '#b26a00') + '">Osztályzat / Minősítés: ' + esc_(grade) + '</div>' +
    '<div style="margin-bottom:16px;color:#555;font-size:13px">Lezárás oka: ' + esc_(REASONS[p.reason]) +
    ' · megoldott feladat: ' + p.tasks.length + ' / ' + CONFIG.TASKS_PER_GROUP + '</div>';

  p.tasks.forEach(function (t, i) {
    const color = t.correct ? '#2e7d32' : '#c62828', bg = t.correct ? '#e8f5e9' : '#fdecea';
    const rows = Math.max(t.studentLines.length, t.correctLines.length, 1);
    html += '<table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;margin-bottom:18px;border:1px solid #ccc">' +
      '<tr><td colspan="2" style="background:' + bg + ';padding:8px 10px;border-bottom:1px solid #ccc"><b>' + (i + 1) + '. feladat</b> ' +
      '<span style="' + mono + '">' + esc_(t.expression) + '</span>' +
      '<span style="float:right;color:' + color + ';font-weight:bold">' + (t.correct ? '✔ helyes' : '✘ hibás') + '</span>' +
      '<div style="font-size:12px;color:#555;margin-top:3px">Beírt végeredmény: <b>' + esc_(t.finalAnswer || '—') +
      '</b> · helyes: <b>' + esc_(t.correctAnswer) + '</b> · idő: ' + esc_(t.seconds) + ' mp</div></td></tr>' +
      '<tr><th align="left" width="50%" style="padding:6px 10px;background:#f5f5f5;font-size:12px;border-right:1px solid #ddd">A diák megoldása</th>' +
      '<th align="left" width="50%" style="padding:6px 10px;background:#f5f5f5;font-size:12px">Helyes megoldásmenet</th></tr>';
    for (let k = 0; k < rows; k++) {
      const s = t.studentLines[k], c = t.correctLines[k];
      html += '<tr><td valign="top" style="padding:4px 10px;border-top:1px solid #eee;border-right:1px solid #ddd;' + mono + '">' +
        (s ? esc_(s) : (k === 0 && !t.studentLines.length ? '<i style="color:#888">nem írt lépéseket</i>' : '&nbsp;')) + '</td>' +
        '<td valign="top" style="padding:4px 10px;border-top:1px solid #eee;' + mono + '">' + (c ? esc_(c) : '&nbsp;') + '</td></tr>';
    }
    if (t.feedback.length) {
      html += '<tr><td colspan="2" style="padding:6px 10px;border-top:1px solid #ddd;background:#fffde7;font-size:12px"><b>Lépéselemzés:</b>' +
        '<ul style="margin:4px 0 0 18px;padding:0">' + t.feedback.map(function (m) { return '<li>' + esc_(m) + '</li>'; }).join('') + '</ul></td></tr>';
    }
    html += '</table>';
  });
  return html + '</div>';
}

/* ===================== SEGÉDEK ===================== */

function safeDate_(iso) { const d = new Date(iso); return isNaN(d.getTime()) ? new Date() : d; }
function formatDate_(iso) { return Utilities.formatDate(safeDate_(iso), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ===================== TELEPÍTÉS ÉS TESZT ===================== */

/** Egyszer futtasd: létrehozza a közös lapokat, és ilyenkor kéri el a jogosultságokat. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, CONFIG.SHEET_IDLOG, ID_HEADERS);
  ensureSheet_(ss, CONFIG.SHEET_LOG, ['Idő', 'Típus', 'submissionId', 'Üzenet']);
  Logger.log('Rendben. Hátralévő napi e-mail kvóta: ' + MailApp.getRemainingDailyQuota());
}

/** 1. hívás: érvényes (e-mail + lap) · 2. hívás: gyakorlás (csak lap) · 3. hívás: ugyanaz az id, mint a 2.: duplikátum. */
function testDoPost() {
  const mk = function (id, score) {
    return { postData: { contents: JSON.stringify({
      submissionId: id, sentAt: new Date().toISOString(), taskType: 'Szorgalmi_MuveletiSorrend', reason: 'befejezve',
      student: { name: 'Teszt Elek', class: '6.a' }, group: 1, score: score, total: 5,
      tasks: [{ expression: '2×(15:3−2×2)+12:4×5', correct: true, finalAnswer: '17', correctAnswer: '17', seconds: 74,
        studentSteps: '15:3=5 => 2×(5−2×2)+12:4×5', stepErrors: '',
        studentLines: ['15:3=5  →  2×(5−2×2)+12:4×5'],
        correctLines: ['15 : 3 = 5; 2 × 2 = 4; 12 : 4 = 3  →  2 × (5 − 4) + 3 × 5'], feedback: [] }] }) } };
  };
  const base = 'teszt-' + Date.now();
  Logger.log(doPost(mk(base + 'a', 3)).getContent());
  Logger.log(doPost(mk(base + 'b', 5)).getContent());
  Logger.log(doPost(mk(base + 'b', 5)).getContent());
}
