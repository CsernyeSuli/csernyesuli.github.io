/**
 * kozos/v1/vedelem.js – védelem a feladatsor közben (élő módban töltődik be)
 *
 *  1) Figyelmeztetés (nem zár le, nem küld): az egér elhagyta a felületet vagy az ablak elvesztette a fókuszt.
 *  2) Valódi elhagyás: lapváltás → 'lapvaltas' esemény (a téma lezárja és elküldi),
 *     az oldal eltűnése → 'kilepes' esemény (csendes küldés); bezárás / Vissza előtt a böngésző rákérdez.
 *  3) Másolás, kivágás, jobb gomb és húzás tiltása.
 * Mindez csak akkor él, amikor a téma szerint fut feladatsor (UJITAS.aktiv()).
 */
(function (U) {
  'use strict';
  const aktiv = function () { return !!U.aktiv(); };

  const fig = document.createElement('div');
  fig.className = 'uj-ov';
  fig.hidden = true;
  fig.style.zIndex = '2147483001';
  fig.innerHTML = '<div class="uj-box" role="alertdialog" aria-modal="true" aria-labelledby="uj-fig-t" style="border-color:rgba(245,158,11,.6);max-width:480px">' +
    '<div style="font-size:40px">⚠️</div>' +
    '<h2 id="uj-fig-t" style="color:#fbbf24">Figyelem! Ne hagyd el a felületet!</h2>' +
    '<p>Ha másik lapra váltasz vagy bezárod az ablakot, a feladatsorod azonnal lezárul, és a jelenlegi pontjaidat küldjük el a tanárnak.</p>' +
    '<button type="button" class="uj-btn">Kattints ide a folytatáshoz!</button></div>';
  document.body.appendChild(fig);
  const gomb = fig.querySelector('.uj-btn');

  const figyelmeztet = function () { if (aktiv() && fig.hidden) { fig.hidden = false; gomb.focus(); } };
  document.documentElement.addEventListener('mouseleave', figyelmeztet);
  window.addEventListener('blur', function () { setTimeout(function () { if (!document.hidden) figyelmeztet(); }, 60); });
  gomb.addEventListener('click', function () { fig.hidden = true; });
  U.on('lezarva', function () { fig.hidden = true; });

  document.addEventListener('visibilitychange', function () { if (document.hidden && aktiv()) U.emit('lapvaltas'); });
  window.addEventListener('beforeunload', function (e) { if (aktiv()) { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('pagehide', function () { if (aktiv()) U.emit('kilepes'); });

  ['contextmenu', 'copy', 'cut', 'dragstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  U._modulok.vedelem = true;
})(window.UJITAS);
