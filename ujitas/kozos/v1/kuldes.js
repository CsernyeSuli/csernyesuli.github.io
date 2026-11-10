/**
 * kozos/v1/kuldes.js – eredmény beküldése az Apps Scriptnek (élő módban töltődik be)
 *
 * Az Apps Script webalkalmazás címét a vegpont.js adja (egyetlen helyen). Archív oldalon ez a modul nem töltődik be,
 * így ott sem a cím, sem a küldés nincs jelen.
 *
 * UJITAS.kuldes(payload, { csendes }) → true / false
 *   payload: { setId?, score, total, grade, reason, sentAt?, submissionId?, tasks: [...] }
 *   A modul hozzáteszi: classId, assignmentType, taskTitle (az oldal beállításából) és a diák kódját.
 */
(function (U) {
  'use strict';
  const URL_ = window.UJITAS_URL;

  U.kuldes = async function (payload, opt) {
    const c = U.cfg;
    if (!U.kod || !URL_) return false;
    const uid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    const body = Object.assign({ setId: c.setId, sentAt: new Date().toISOString(), submissionId: uid }, payload, {
      classId: c.classId, assignmentType: c.assignmentType, taskTitle: c.taskTitle, code: U.kod,
    });
    const probalkozasok = (opt && opt.csendes) ? 0 : 2;            // oldalelhagyáskor nincs idő újrapróbálni
    for (let i = 0; i <= probalkozasok; i++) {
      try {
        await fetch(URL_, {
          method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
        });
        return true;
      } catch (e) {
        await new Promise(function (r) { setTimeout(r, 800 * (i + 1)); });
      }
    }
    return false;
  };
  U._modulok.kuldes = true;
})(window.UJITAS);
