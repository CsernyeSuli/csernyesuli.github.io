/**
 * temak/teszt.js – EGYSZERŰ KIPRÓBÁLÓ téma-modul a közös keret teljes folyamatának ellenőrzéséhez.
 * (Két feladat, egy beírt végeredmény; nem a valódi műveleti sorrend értékelő.)
 * Az oldal markupja: #start, #felulet, #fel1, #fel2, #bef, #eredmeny, #kuldesInfo.
 */
(function (U) {
  'use strict';
  const $ = function (s) { return document.querySelector(s); };
  const FELADATOK = [{ kif: '2 + 3 · 4', jo: 14 }, { kif: '10 − 2 − 3', jo: 5 }];
  let fut = false, vege = false, indult = 0;
  U.aktiv = function () { return fut && !vege; };

  function csomag(ok) {
    const tasks = FELADATOK.map(function (f, i) {
      const v = $('#fel' + (i + 1)).value.trim();
      return { expression: f.kif, correct: Number(v) === f.jo && v !== '', finalAnswer: v, correctAnswer: String(f.jo),
               seconds: Math.round((Date.now() - indult) / 1000), studentLines: [], correctLines: [], feedback: [] };
    });
    const score = tasks.filter(function (t) { return t.correct; }).length;
    return { reason: ok, score: score, total: tasks.length, grade: score === tasks.length ? 'Jeles (5)' : 'Nem megfelelt', tasks: tasks };
  }

  async function befejez(ok) {
    if (!fut || vege) return;
    vege = true; U.emit('lezarva');
    $('#bef').disabled = true;
    const p = csomag(ok);
    $('#eredmeny').textContent = 'Eredmény: ' + p.score + ' / ' + p.total + ' · ' + p.grade;
    const r = await U.kuldes(p);
    $('#kuldesInfo').textContent = r === null ? '(archív mód: nincs küldés)' : (r ? 'Az eredményeid elküldve ✔' : 'Nem sikerült elküldeni ✘');
  }

  $('#start').addEventListener('click', async function () {
    if (!(await U.run('indulas'))) return;            // élő módban itt kér kódot a rendszer
    fut = true; indult = Date.now();
    $('#start').hidden = true; $('#felulet').hidden = false;
  });
  $('#bef').addEventListener('click', function () { befejez('befejezve'); });
  U.on('lapvaltas', function () { befejez('lapvaltas'); });
  U.on('kilepes', function () { if (fut && !vege) { vege = true; U.kuldes(csomag('lapvaltas'), { csendes: true }); } });
})(window.UJITAS);
