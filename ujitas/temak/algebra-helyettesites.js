/**
 * temak/algebra-helyettesites.js – „Algebrai kifejezések helyettesítési értéke” téma-modul (3.09. feladat, házi).
 * A feladatok és az ellenőrzés itt vannak; az azonosítást, védelmet és küldést a közös keret adja (kozos/v1).
 * Az oldal a feladatok helyét a #feladatok elemmel adja meg, a stílusok (.hz-*, .fr) az oldalban vannak.
 * Új feladatsor: a TASKS tömböl szerkesztendő (html = megjelenített kifejezés, ha = helyettesítés, ans = helyes érték).
 */
(function (U) {
  'use strict';
  const mount = document.getElementById('feladatok');
  if (!mount) throw new Error('Hiányzik a #feladatok elem.');
  const $ = function (s) { return document.querySelector(s); };
  const fr = function (a, b) { return '<span class="fr"><span>' + a + '</span><span>' + b + '</span></span>'; };
  const v = function (s) { return '<i>' + s + '</i>'; };

  const TASKS = [
    { jel: 'a)', html: v('a') + ' + 2,5', ha: v('a') + ' = 4', txt: 'a + 2,5, ha a = 4', ans: '13/2' },
    { jel: 'b)', html: fr(3, 4) + v('x') + ' + ' + fr(1, 2), ha: v('x') + ' = 2', txt: '3/4·x + 1/2, ha x = 2', ans: '2' },
    { jel: 'c)', html: fr('2' + v('y') + ' − 1', 3), ha: v('y') + ' = 3', txt: '(2y − 1)/3, ha y = 3', ans: '5/3' },
    { jel: 'd)', html: '2(' + v('x') + ' − 3,5)', ha: v('x') + ' = 0,5', txt: '2(x − 3,5), ha x = 0,5', ans: '-6' },
    { jel: 'e)', html: '(' + v('b') + ' + 3,6) · ' + fr(1, 2), ha: v('b') + ' = −1', txt: '(b + 3,6)·1/2, ha b = −1', ans: '13/10' },
    { jel: 'f)', html: '−' + fr('2' + v('c') + ' + 3,5', 4), ha: v('c') + ' = 1', txt: '−(2c + 3,5)/4, ha c = 1', ans: '-11/8' },
    { jel: 'g)', html: fr(v('d') + ' · (−2) + 1', 3), ha: v('d') + ' = −2', txt: '(d·(−2) + 1)/3, ha d = −2', ans: '5/3' },
  ];
  const PASS = 'Jeles (5)';

  /* ----- válasz értelmezése: egész, tizedes tört, tört, vegyes szám (negatív is) ----- */
  const gcd = function (a, b) { return b ? gcd(b, a % b) : Math.abs(a); };
  const frac = function (n, d) { if (!d) return null; const g = gcd(n, d) || 1; return d < 0 ? [-n / g, -d / g] : [n / g, d / g]; };
  function parse(raw) {
    const s = String(raw).replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim(); let m, r;
    if ((m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s))) { r = frac(+m[2] * +m[4] + +m[3], +m[4]); return r && [(m[1] ? -1 : 1) * r[0], r[1]]; }
    if ((m = /^(-?)(\d+)\/(\d+)$/.exec(s))) { r = frac(+m[2], +m[3]); return r && [(m[1] ? -1 : 1) * r[0], r[1]]; }
    if ((m = /^(-?)(\d+)(?:[.,](\d{1,6}))?$/.exec(s))) { const k = m[3] || ''; r = frac(+(m[2] + k), Math.pow(10, k.length)); return [(m[1] ? -1 : 1) * r[0], r[1]]; }
    return null;
  }
  const same = function (a, b) { return a[0] === b[0] && a[1] === b[1]; };

  /* ----- felület ----- */
  const policy = U.elo ? '<ul class="hz-rules"><li>A kód megadása után nyílnak meg a feladatok. Egy feladatot addig próbálhatsz újra, amíg nem jó.</li>' +
    '<li>A beküldéskor az eredményed és a próbálkozásaid száma automatikusan a tanárodhoz kerül. Ha többször küldöd be, csak a legelső számít.</li>' +
    '<li>Ha másik lapra váltasz vagy elhagyod az oldalt, a feladatsor lezárul, és az addigi eredményed elküldjük.</li>' +
    '<li>A személyes kódod csak a tiéd: ne add oda másnak!</li></ul>' : '';
  mount.innerHTML = '<div id="hzStartBox"><p>Válaszként egész számot, tizedes törtet, törtet (pl. <b>13/2</b>) vagy vegyes számot (pl. <b>1 2/3</b>) is megadhatsz.</p>' + policy +
    '<button type="button" id="hzStart" class="hz-btn">Feladatok megnyitása</button></div>' +
    '<div id="hzWork" hidden><div class="hz-bar"><span id="hzCount" aria-live="polite"></span>' +
    '<span class="hz-ins">Beszúrás: <button type="button" data-ins="-" aria-label="mínusz">−</button><button type="button" data-ins="/" aria-label="törtvonal">/</button><button type="button" data-ins="," aria-label="tizedesvessző">,</button><button type="button" data-ins=" " aria-label="szóköz">szóköz</button></span></div>' +
    '<div id="hzTasks"></div><button type="button" id="hzSend" class="hz-btn">Befejezem és beküldöm</button></div>';

  let S = null, last = null;
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const solved = function () { return S.st.filter(function (t) { return t.solved; }).length; };
  const grade = function () { return solved() === TASKS.length ? PASS : 'Megoldva: ' + solved() + ' / ' + TASKS.length; };

  function begin() {
    S = { id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
          t0: Date.now(), ended: false, reason: '', st: TASKS.map(function () { return { att: 0, wrong: [], solved: false, last: '', sec: 0 }; }) };
    $('#hzTasks').innerHTML = TASKS.map(function (t, i) {
      return '<div class="hz-task" id="t' + i + '"><p class="hz-q"><b>' + t.jel + '</b> <span class="m">' + t.html + '</span> <span class="hz-ha">ha ' + t.ha + '</span></p>' +
        '<div class="hz-row"><label for="in' + i + '">Helyettesítési érték:</label>' +
        '<input id="in' + i + '" data-i="' + i + '" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="pl. 13/2">' +
        '<button type="button" class="hz-btn" data-chk="' + i + '">Ellenőrzés</button></div><div class="hz-fb" role="status" aria-live="polite"></div></div>';
    }).join('');
    $('#hzStartBox').hidden = true; $('#hzWork').hidden = false; count(); window.scrollTo(0, 0);
  }
  const count = function () { $('#hzCount').textContent = 'Megoldva: ' + solved() + ' / ' + TASKS.length; };
  const fb = function (i, cls, html) { const f = $('#t' + i + ' .hz-fb'); f.className = 'hz-fb ' + cls; f.innerHTML = html; };

  function check(i) {
    if (!S || S.ended || S.st[i].solved) return;
    const inp = $('#in' + i), raw = inp.value.trim();
    if (!raw) return fb(i, 'no', 'Írd be a kapott értéket, mielőtt ellenőriznél.');
    const val = parse(raw);
    if (!val) return fb(i, 'no', 'Ezt nem tudtam számként értelmezni. Használj egész számot, tizedes törtet (0,5), törtet (3/4) vagy vegyes számot (1 2/3).');
    const t = S.st[i]; t.att++; t.last = raw.slice(0, 50);
    if (same(val, parse(TASKS[i].ans))) {
      t.solved = true; t.sec = Math.round((Date.now() - S.t0) / 1000); inp.disabled = true;
      $('#t' + i).classList.add('ok'); fb(i, 'ok', '✔ Helyes!' + (t.att > 1 ? ' (' + t.att + '. próbálkozásra)' : '')); count();
    } else {
      if (t.wrong.length < 20) t.wrong.push(raw.slice(0, 50));
      fb(i, 'no', '✘ Még nem jó. Próbáld újra!' + (t.att >= 2 ? '<br>Tipp: a betű helyére a megadott számot írd, a negatív számot tedd zárójelbe, és tartsd be a műveleti sorrendet.' : ''));
      inp.focus(); inp.select();
    }
  }

  function payload(reason) {
    return { reason: reason || 'befejezve', setId: String(U.cfg.setId), submissionId: S.id, sentAt: new Date().toISOString(),
      score: solved(), total: TASKS.length, grade: grade(),
      tasks: TASKS.map(function (t, i) {
        const s = S.st[i];
        return { expression: t.txt, correct: s.solved, finalAnswer: s.last, correctAnswer: t.ans, seconds: s.sec || Math.round((Date.now() - S.t0) / 1000),
                 stepErrors: 'próbálkozás: ' + s.att, studentLines: s.wrong, correctLines: [], feedback: [] };
      }) };
  }

  /* ----- ablakok (a közös keret .uj-ov / .uj-box stílusával) ----- */
  function ablak(html) {
    const ov = document.createElement('div'); ov.className = 'uj-ov';
    ov.innerHTML = '<div class="uj-box" role="dialog" aria-modal="true">' + html + '</div>'; document.body.appendChild(ov); return ov;
  }
  function beker() {
    const n = TASKS.length - solved();
    const ov = ablak('<h2>Beküldöd?</h2><p>' + (n ? 'Még ' + n + ' feladat nincs megoldva. Beküldés után ez az eredmény kerül a tanárhoz.' : 'Mind a ' + TASKS.length + ' feladatot megoldottad.') + '</p>' +
      '<button type="button" class="uj-btn" data-y>Igen, beküldöm</button> <button type="button" class="uj-btn uj-masodlagos" data-n>Még dolgozom rajta</button>');
    ov.querySelector('[data-n]').onclick = function () { ov.remove(); };
    ov.querySelector('[data-y]').onclick = function () { ov.remove(); finish('befejezve'); };
  }
  async function finish(reason) {
    if (!S || S.ended) return;
    S.ended = true; S.reason = reason; U.emit('lezarva');
    document.querySelectorAll('#hzTasks input,#hzTasks [data-chk],#hzSend').forEach(function (e) { e.disabled = true; });
    await deliver();
  }
  async function deliver() {
    const ov = ablak('<h2>Adatok küldése…</h2>');
    const ok = await U.kuldes(payload(S.reason)), box = ov.firstChild;      // true | false | null (archív: nincs küldés)
    box.innerHTML = '<h2>Házi feladat kész!</h2>' + (U.elo && S.reason === 'lapvaltas' ? '<p style="color:#fbbf24;font-size:14px">A feladatsor lezárult, mert elhagytad az oldalt.</p>' : '') +
      '<div style="font-size:44px;font-weight:800;color:#34d399;margin:8px 0">' + solved() + ' / ' + TASKS.length + '</div><p>' + esc(grade()) + '</p>' +
      (ok === null ? '' : '<p style="font-size:14px;color:#94a3b8">' + (ok ? 'Az eredményed elküldve ✔' : 'Nem sikerült elküldeni. <button type="button" id="hzRetry" style="color:#38bdf8;background:none;border:0;text-decoration:underline;cursor:pointer;font:inherit">Újrapróbálom</button>') + '</p>') +
      '<button type="button" class="uj-btn" data-c>Bezárás</button> <button type="button" class="uj-btn uj-masodlagos" data-r>Újrakezdem gyakorlásnak</button>';
    box.querySelector('[data-c]').onclick = function () { ov.remove(); };
    box.querySelector('[data-r]').onclick = function () { ov.remove(); begin(); };
    const rt = box.querySelector('#hzRetry'); if (rt) rt.onclick = function () { ov.remove(); deliver(); };
  }

  /* ----- események ----- */
  $('#hzStart').addEventListener('click', async function () { if (await U.run('indulas')) begin(); });
  $('#hzSend').addEventListener('click', beker);
  mount.addEventListener('click', function (e) { const b = e.target.closest('[data-chk]'); if (b) check(+b.dataset.chk); });
  mount.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.i) { e.preventDefault(); check(+e.target.dataset.i); } });
  mount.addEventListener('focusin', function (e) { if (e.target.dataset && e.target.dataset.i) last = e.target; });
  mount.addEventListener('mousedown', function (e) { if (e.target.closest('[data-ins]')) e.preventDefault(); });
  mount.addEventListener('click', function (e) {
    const b = e.target.closest('[data-ins]'); if (!b || !last || last.disabled) return;
    const s = last.selectionStart == null ? last.value.length : last.selectionStart, en = last.selectionEnd == null ? s : last.selectionEnd;
    last.value = last.value.slice(0, s) + b.dataset.ins + last.value.slice(en); last.focus(); last.setSelectionRange(s + 1, s + 1);
  });

  /* ----- kapcsolat a közös kerettel ----- */
  U.aktiv = function () { return !!(S && !S.ended); };
  U.on('lapvaltas', function () { finish('lapvaltas'); });
  U.on('kilepes', function () {
    if (!U.aktiv()) return;
    S.ended = true; S.reason = 'lapvaltas'; U.kuldes(payload('lapvaltas'), { csendes: true });
  });
})(window.UJITAS);
