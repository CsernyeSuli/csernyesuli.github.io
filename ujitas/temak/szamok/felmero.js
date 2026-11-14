/**
 * temak/szamok/felmero.js – felmérő GYŰJTŐ LAP: a feladatok listája, a lebegő ablak és az eredmények.
 *
 * A feladatok külön fájlok (pl. halmazabra.js), a lap csak akkor tölti be őket, amikor a tanuló megnyitja. A feladat a lebegő
 * ablakba (host) építi fel a saját felületét, az Értékelésnél átadja az eredményét, és az ablak bezárul (lásd halmazabra.js).
 *
 * Az oldal beállítása:
 *   window.UJITAS_CFG = { mod: 'elo', classId: '7', kodEllenorzes: true, tema: ['tortek-motor', 'szamok/felmero'],
 *     cim: 'Számok és műveletek', alcim: '7. osztály – gyakorló felmérő', visszaHref: '../../../7-osztaly.html',
 *     feladatok: [ { id: 'halmazabra', fajl: 'halmazabra', cim: 'Halmazábra', max: 10 }, { id: 'f7', cim: '7. feladat' } ] };
 *   (fajl nélküli feladat: „Hamarosan”; a fajl a felmero.js mappájához képest értendő; max: a feladat pontja, az összesítéshez kell)
 *
 * Az összesítés: a kész feladatok pontjai a feladatok összpontjához mérve; ha mind kész, az osztályzat a százalékból (egész számra kerekítve):
 *   0–33 elégtelen (1) · 34–50 elégséges (2) · 51–74 közepes (3) · 75–90 jó (4) · 91–100 jeles (5).
 * A 2–6. feladat közös eszközeit (bevitel.js) a lap az első feladat megnyitásakor tölti be.
 *
 * Élő módban a felmérő indításakor a közös keret bekéri a tanuló kódját (kodEllenorzes: a szerver ellenőrzi, hogy létezik-e),
 * és a lapvédelem működik, amíg egy feladat ablaka nyitva van. Nincs beküldés és nincs e-mail: az eredményeket a lap őrzi
 * (böngésző-munkamenet). Archív módban (mod: 'archiv') nincs kódbekérés és védelem.
 */
(function (U) {
  'use strict';
  const cfg = U.cfg;
  const DIR = document.currentScript.src.replace(/[^\/]*$/, '');       // a felmero.js mappája: itt vannak a feladat-fájlok
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const $ = function (s) { return document.querySelector(s); };
  const FELADATOK = Array.isArray(cfg.feladatok) ? cfg.feladatok : [];

  U.css('fm-stilus',
    'body{margin:0;min-height:100vh;background:linear-gradient(135deg,#020617 0%,#1e1b4b 55%,#0f172a 100%);background-attachment:fixed;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.fm-fo{max-width:900px;margin:0 auto;padding:18px 16px 60px}' +
    '.fm-vissza{display:inline-block;padding:8px 16px;border:1px solid #475569;border-radius:10px;background:rgba(51,65,85,.6);color:#cbd5e1;text-decoration:none;font-weight:600;font-size:14px}' +
    '.fm-vissza:hover{background:#0ea5e9;border-color:#38bdf8;color:#fff}' +
    '.fm-fo h1{margin:18px 0 4px;font-size:28px;color:#34d399;text-align:center}.fm-alcim{margin:0 0 18px;text-align:center;color:#cbd5e1}' +
    '.fm-kartya{margin-bottom:16px;padding:18px;border:1px solid #334155;border-radius:16px;background:rgba(15,23,42,.7);box-shadow:0 8px 24px rgba(0,0,0,.3)}' +
    '.fm-kartya p{margin:0 0 10px;line-height:1.55}.fm-kartya .fm-kicsi{font-size:14px;color:#94a3b8}' +
    '.fm-gomb{padding:11px 22px;border:0;border-radius:12px;background:#34d399;color:#0f172a;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 0 18px rgba(52,211,153,.45)}' +
    '.fm-gomb:hover{background:#6ee7b7}.fm-gomb.kek{background:#38bdf8;box-shadow:0 0 18px rgba(56,189,248,.45)}.fm-gomb.szurke{background:transparent;color:#cbd5e1;border:1px solid #64748b;box-shadow:none}' +
    '.fm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}' +
    '.fm-felt{display:flex;flex-direction:column;gap:6px;padding:16px;border:1px solid #334155;border-radius:14px;background:#0f172a;color:#e2e8f0;text-align:left;font:inherit;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s}' +
    '.fm-felt:hover:not(:disabled){transform:translateY(-3px);border-color:#38bdf8;box-shadow:0 8px 20px rgba(0,0,0,.4)}.fm-felt:disabled{opacity:.5;cursor:default}' +
    '.fm-szam{font-size:13px;font-weight:700;color:#38bdf8}.fm-nev{font-size:18px;font-weight:700}.fm-all{font-size:14px;color:#94a3b8}.fm-all.kesz{color:#34d399;font-weight:700}' +
    '.fm-max{margin-left:6px;color:#64748b;font-weight:400}.fm-ossz h2{margin:0 0 8px;font-size:19px;color:#34d399}.fm-ossz .fm-nagy{font-size:22px;font-weight:800;color:#e2e8f0}' +
    '.fm-jegy{margin:8px 0;font-size:20px;font-weight:800;color:#34d399}.fm-tabla{border-collapse:collapse;margin-top:8px;font-size:14px}.fm-tabla td,.fm-tabla th{padding:5px 12px;border:1px solid #475569;text-align:left}.fm-tabla th{background:#1e293b;color:#cbd5e1}.fm-tabla .akt td{background:rgba(52,211,153,.2);font-weight:700}' +
    '.fm-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:1000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px;box-sizing:border-box;background:rgba(2,6,23,.82);backdrop-filter:blur(4px)}' +
    '.fm-ov[hidden]{display:none}.fm-ov.fm-dlg{z-index:1100;align-items:center}' +
    '.fm-panel{position:relative;width:100%;max-width:780px;margin:auto;padding:22px 18px 20px;box-sizing:border-box;border:1px solid #334155;border-radius:18px;background:#0b1220;box-shadow:0 24px 60px rgba(0,0,0,.6)}' +
    '.fm-x{position:absolute;right:10px;top:8px;width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:#94a3b8;font-size:22px;cursor:pointer}.fm-x:hover{background:#1e293b;color:#fff}' +
    '.fm-doboz{width:100%;max-width:400px;margin:auto;padding:22px;box-sizing:border-box;border:1px solid #475569;border-radius:16px;background:#0f172a;text-align:center}' +
    '.fm-doboz h3{margin:0 0 8px;font-size:21px}.fm-doboz p{margin:0 0 18px;color:#cbd5e1;line-height:1.5}.fm-doboz .fm-sor{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}');

  /* ===================== VÁZ ===================== */
  document.title = (cfg.cim || 'Felmérő') + (cfg.alcim ? ' – ' + cfg.alcim : '');
  const KOD_SZOVEG = U.elo
    ? '<p class="fm-kicsi">A felmérő indításakor be kell írnod a személyes kódodat, amit a tanárodtól kaptál. Ha elhagyod az oldalt, a megnyitott feladat lezárul.</p>' : '';
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="fm-fo">' +
    '<a class="fm-vissza" href="' + esc(cfg.visszaHref || '../../../7-osztaly.html') + '">⬅ Vissza a 7. osztály oldalára</a>' +
    '<h1>' + esc(cfg.cim || 'Felmérő') + '</h1><p class="fm-alcim">' + esc(cfg.alcim || '') + '</p>' +
    '<section id="fm-start" class="fm-kartya"><p>Ez a lap gyakorlásra szolgál, az éles felmérő papíron lesz az órán. A feladatok egyenként, külön ablakban nyílnak meg.</p>' + KOD_SZOVEG +
    '<button type="button" id="fm-inditas" class="fm-gomb">Felmérő indítása</button></section>' +
    '<section id="fm-lista" hidden><p id="fm-megjegyzes" class="fm-kicsi" role="status"></p><div id="fm-grid" class="fm-grid"></div>' +
    '<div id="fm-ossz" class="fm-kartya fm-ossz" style="margin-top:18px"></div></section>' +
    '</div>' +
    '<div id="fm-ov" class="fm-ov" hidden><div class="fm-panel" role="dialog" aria-modal="true" aria-label="Feladat">' +
    '<button type="button" id="fm-x" class="fm-x" aria-label="Bezárás">✕</button><div id="fm-host"></div></div></div>' +
    '<div id="fm-dlg" class="fm-ov fm-dlg" hidden><div class="fm-doboz" role="alertdialog" aria-modal="true"><h3 id="fm-dlg-cim"></h3><p id="fm-dlg-szoveg"></p>' +
    '<div class="fm-sor"><button type="button" id="fm-dlg-igen" class="fm-gomb"></button><button type="button" id="fm-dlg-nem" class="fm-gomb szurke"></button></div></div></div>');

  /* ===================== EREDMÉNYEK (a böngésző-munkamenetben) ===================== */
  const eredmenyek = {};
  const tarKulcs = function () { return 'ujitas_felmero_' + (cfg.classId || '') + '_' + (cfg.cim || '') + '_' + (U.kod || 'archiv'); };
  const tarOlvas = function () { try { return JSON.parse(sessionStorage.getItem(tarKulcs()) || '{}') || {}; } catch (e) { return {}; } };
  const tarIr = function () { try { sessionStorage.setItem(tarKulcs(), JSON.stringify(eredmenyek)); } catch (e) { /* nem kritikus */ } };
  /** A gyűjtő lap eredményei (későbbi beküldéshez vagy megjelenítéshez). */
  U.felmero = { eredmenyek: eredmenyek, osszesit: function () { return osszesit(); } };

  /* ===================== LISTA ===================== */
  function allapotSzoveg(f) {
    const e = eredmenyek[f.id];
    if (!f.fajl) return ['Hamarosan', ''];
    if (!e) return ['Nyitott', ''];
    return ['Kész: ' + e.pont + ' / ' + e.max + ' pont' + (e.lezaras === 'lapvaltas' ? ' (lapváltás miatt lezárva)' : ''), ' kesz'];
  }

  /* ===================== ÖSSZESÍTÉS ÉS OSZTÁLYZAT ===================== */
  const SAVOK = [[33, 'elégtelen (1)', '0–33'], [50, 'elégséges (2)', '34–50'], [74, 'közepes (3)', '51–74'], [90, 'jó (4)', '75–90'], [100, 'jeles (5)', '91–100']];
  /** A százalék (egész számra kerekítve) osztályzata: [index, szöveg]. */
  function osztalyzat(szazalek) {
    const r = Math.round(szazalek);
    for (let i = 0; i < SAVOK.length; i++) if (r <= SAVOK[i][0]) return [i, SAVOK[i][1]];
    return [SAVOK.length - 1, SAVOK[SAVOK.length - 1][1]];
  }
  /** { pont, max, kesz, osszes, szazalek, jegy }: a pont és a max a kész feladatoké; a max a teljes felmérőé is (osszMax). */
  function osszesit() {
    const o = { pont: 0, max: 0, osszMax: 0, kesz: 0, osszes: 0 };
    FELADATOK.forEach(function (f) {
      if (!f.fajl) return;
      const e = eredmenyek[f.id], m = f.max != null ? f.max : (e ? e.max : 0);
      o.osszes++; o.osszMax += m;
      if (e) { o.kesz++; o.pont += e.pont; o.max += m; }
    });
    o.szazalek = o.osszMax ? o.pont / o.osszMax * 100 : 0;
    o.jegy = o.osszes > 0 && o.kesz === o.osszes ? osztalyzat(o.szazalek) : null;
    return o;
  }
  function osszesRajzol() {
    const o = osszesit(), el = $('#fm-ossz');
    if (!o.osszes) { el.hidden = true; return; }
    el.hidden = false;
    const tabla = '<table class="fm-tabla"><tr><th>Teljesítmény (%)</th><th>Érdemjegy</th></tr>' + SAVOK.map(function (s, i) {
      return '<tr' + (o.jegy && o.jegy[0] === i ? ' class="akt"' : '') + '><td>' + s[2] + '</td><td>' + esc(s[1]) + '</td></tr>';
    }).join('') + '</table>';
    el.innerHTML = '<h2>Összesítés</h2>' + (o.jegy
      ? '<div class="fm-nagy">' + o.pont + ' / ' + o.osszMax + ' pont (' + Math.round(o.szazalek) + '%)</div><div class="fm-jegy">Osztályzat: ' + esc(o.jegy[1]) + '</div>'
      : '<p>Eddig elért: <b>' + o.pont + ' / ' + o.max + '</b> pont (' + o.kesz + ' / ' + o.osszes + ' feladat kész). Az összes pont: ' + o.osszMax + '. Az osztályzat az összes feladat elvégzése után jelenik meg.</p>') + tabla;
  }
  function listaRajzol() {
    $('#fm-grid').innerHTML = FELADATOK.map(function (f, i) {
      const a = allapotSzoveg(f);
      return '<button type="button" class="fm-felt" data-id="' + esc(f.id) + '"' + (f.fajl ? '' : ' disabled') + '>' +
        '<span class="fm-szam">' + (i + 1) + '. feladat' + (f.max ? '<span class="fm-max">' + f.max + ' pont</span>' : '') + '</span><span class="fm-nev">' + esc(f.cim || f.id) + '</span>' +
        '<span class="fm-all' + a[1] + '">' + esc(a[0]) + (f.fajl && eredmenyek[f.id] ? ' · újra megnyitás' : '') + '</span></button>';
    }).join('');
    osszesRajzol();
  }
  function mutatLista() {
    Object.assign(eredmenyek, tarOlvas());
    $('#fm-start').hidden = true; $('#fm-lista').hidden = false; listaRajzol();
  }
  $('#fm-inditas').addEventListener('click', async function () {
    if (!(await U.run('indulas'))) return;                      // élő módban itt kéri a rendszer a kódot (és ellenőrzi)
    mutatLista();
  });
  if (!U.elo) mutatLista();                                      // archív módban nincs kódbekérés

  /* ===================== MEGERŐSÍTŐ ABLAK ===================== */
  function megerosit(o) {
    return new Promise(function (kesz) {
      $('#fm-dlg-cim').textContent = o.cim || ''; $('#fm-dlg-szoveg').textContent = o.uzenet || '';
      const igen = $('#fm-dlg-igen'), nem = $('#fm-dlg-nem');
      igen.textContent = o.igen || 'Igen'; nem.textContent = o.nem || 'Mégsem';
      const dlg = $('#fm-dlg'); dlg.hidden = false; igen.focus();
      const zar = function (v) { dlg.hidden = true; igen.onclick = nem.onclick = null; kesz(v); };
      igen.onclick = function () { zar(true); }; nem.onclick = function () { zar(false); };
    });
  }

  /* ===================== FELADAT MEGNYITÁSA A LEBEGŐ ABLAKBAN ===================== */
  let nyitott = null;                                            // { f, inst }
  const betoltve = {};
  function szkript(src) {
    return new Promise(function (ok, hiba) {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { hiba(new Error('Nem tölthető be: ' + src)); };
      document.head.appendChild(s);
    });
  }
  let kozosBetoltve = false;
  async function kozosBetolt() { if (kozosBetoltve) return; await szkript(DIR + 'bevitel.js'); kozosBetoltve = true; }   // a 2–6. feladat közös eszközei
  async function megnyit(f) {
    if (nyitott || !f.fajl) return;
    $('#fm-megjegyzes').textContent = '';
    try {
      await kozosBetolt();
      if (!betoltve[f.fajl]) { await szkript(DIR + f.fajl + '.js'); betoltve[f.fajl] = true; }
    } catch (e) { console.error(e); $('#fm-megjegyzes').textContent = 'A feladat most nem tölthető be. Frissítsd az oldalt, vagy jelezd a tanárodnak.'; return; }
    const reg = window.UJITAS_FELADATOK && window.UJITAS_FELADATOK[f.id];
    if (!reg) { $('#fm-megjegyzes').textContent = 'A feladat nem található.'; return; }
    const host = $('#fm-host'); host.innerHTML = '';
    $('#fm-ov').hidden = false; document.documentElement.style.overflow = 'hidden';
    nyitott = { f: f, inst: null };
    try { nyitott.inst = reg.indit(host, { megerosit: megerosit, kesz: function (e) { lezar(e); } }); }
    catch (err) { console.error(err); lezar(null, 'A feladat most nem indítható. Frissítsd az oldalt, vagy jelezd a tanárodnak.'); }
  }
  /** Az ablak bezárása: ha van eredmény, eltárolja. */
  function lezar(eredmeny, uzenet) {
    if (!nyitott) return;
    if (eredmeny) {
      if (nyitott.f.max != null && eredmeny.max !== nyitott.f.max) console.warn('A(z) ' + nyitott.f.id + ' feladat max pontja eltér a lap beállításától:', eredmeny.max, nyitott.f.max);
      eredmenyek[nyitott.f.id] = eredmeny; tarIr();
    }
    nyitott = null;
    $('#fm-host').innerHTML = ''; $('#fm-ov').hidden = true; $('#fm-dlg').hidden = true; document.documentElement.style.overflow = '';
    listaRajzol(); $('#fm-megjegyzes').textContent = uzenet || '';
    U.emit('lezarva');
  }
  $('#fm-grid').addEventListener('click', function (e) {
    const b = e.target.closest('.fm-felt'); if (!b || b.disabled) return;
    const f = FELADATOK.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (f) megnyit(f);
  });
  $('#fm-x').addEventListener('click', async function () {
    if (!nyitott) return;
    const igen = await megerosit({ cim: 'Bezárás', uzenet: 'Bezárod a feladatot értékelés nélkül? A feladatban végzett munkád elvész.', igen: 'Bezárom', nem: 'Folytatom' });
    if (igen) lezar(null);
  });

  /* ===================== LAPVÉDELEM (közös keret) ===================== */
  U.aktiv = function () { return !!nyitott; };
  U.on('lapvaltas', function () {                                // másik lapra váltott: a nyitott feladat az addigi állapotával lezárul
    if (!nyitott) return;
    const e = nyitott.inst && nyitott.inst.lezar ? nyitott.inst.lezar('lapvaltas') : null;
    lezar(e, 'A lapváltás miatt a feladat lezárult, az addigi eredményed rögzítettük.');
  });
})(window.UJITAS);
