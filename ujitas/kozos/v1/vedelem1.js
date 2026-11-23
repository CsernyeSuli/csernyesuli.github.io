/**
 * kozos/v1/vedelem.js – védelem a feladatsor közben (élő módban töltődik be)
 */
(function (U) {
  'use strict';
  const aktiv = function () { return !!U.aktiv(); };

  U.css('uj-vedelem-print',
    '@media print {' +
    '  body.uj-vedett-aktiv > *:not(#uj-print-tiltas) { display: none !important; }' +
    '  #uj-print-tiltas { display: block !important; padding: 32px; font-family: system-ui, sans-serif; color: #111; }' +
    '}' +
    '#uj-print-tiltas { display: none; }'
  );

  const printBox = document.createElement('div');
  printBox.id = 'uj-print-tiltas';
  printBox.innerHTML = '<h2>Nyomtatás tiltva</h2><p>A feladatsor közben a nyomtatás és a másolás nem engedélyezett.</p>';
  document.body.appendChild(printBox);

  const fig = document.createElement('div');
  fig.className = 'uj-ov';
  fig.hidden = true;
  fig.style.zIndex = '2147483001';
  fig.innerHTML = '<div class="uj-box" role="alertdialog" aria-modal="true" aria-labelledby="uj-fig-t" style="border-color:rgba(245,158,11,.6);max-width:480px">' +
    '<div style="font-size:40px">⚠️</div>' +
    '<h2 id="uj-fig-t" style="color:#fbbf24">Figyelem! Ne hagyd el a felületet!</h2>' +
    '<p>Ha másik lapra váltasz, másik alkalmazást nyitsz vagy bezárod az ablakot, a feladatsorod lezárulhat, és a jelenlegi pontjaidat küldjük el a tanárnak.</p>' +
    '<button type="button" class="uj-btn">Kattints ide a folytatáshoz!</button></div>';
  document.body.appendChild(fig);
  const gomb = fig.querySelector('.uj-btn');

  const szinkronizalAllapot = function () {
    document.body.classList.toggle('uj-vedett-aktiv', aktiv());
  };

  const figyelmeztet = function () {
    szinkronizalAllapot();
    if (aktiv() && fig.hidden) { fig.hidden = false; gomb.focus(); }
  };

  document.documentElement.addEventListener('mouseleave', figyelmeztet);
  window.addEventListener('blur', function () {
    setTimeout(function () { if (!document.hidden) figyelmeztet(); }, 60);
  });
  window.addEventListener('beforeprint', function (e) {
    if (aktiv()) {
      szinkronizalAllapot();
      figyelmeztet();
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
    }
  });
  gomb.addEventListener('click', function () { fig.hidden = true; });
  U.on('lezarva', function () { fig.hidden = true; document.body.classList.remove('uj-vedett-aktiv'); });

  document.addEventListener('visibilitychange', function () {
    szinkronizalAllapot();
    if (document.hidden && aktiv()) U.emit('lapvaltas');
  });
  window.addEventListener('beforeunload', function (e) {
    if (aktiv()) { e.preventDefault(); e.returnValue = ''; }
  });
  window.addEventListener('pagehide', function () {
    if (aktiv()) U.emit('kilepes');
  });

  ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (aktiv() || ev === 'contextmenu') e.preventDefault();
    });
  });

  U._modulok.vedelem = true;
})(window.UJITAS);