/**
 * temak/szamok/felmero.js – házi dolgozat GYŰJTŐ LAP: a feladatok listája, a lebegő ablak és az eredmények.
 *
 * A feladatok külön fájlok (pl. halmazabra.js), a lap csak akkor tölti be őket, amikor a tanuló megnyitja. A feladat a lebegő
 * ablakba (host) építi fel a saját felületét, az Értékelésnél átadja az eredményét, és az ablak bezárul.
 *
 * A már értékelt feladat addig nem nyitható meg újra / nem írható újra, amíg a tanuló el nem küldi a lap értékelését
 * a Küldés gombbal. A Küldés gomb a gyűjtő nézeten bármikor aktív: figyelmeztet, ha lezárul az értékelés és ha maradt
 * megoldatlan feladat, majd EGYETLEN összevont beküldésként küldi el az oldal értékelését (1 küldés = 1 e-mail), és
 * megjeleníti az összesített értékelést az osztályzási táblázatnál.
 */
(function (U) {
  'use strict';
  const cfg = U.cfg;
  const DIR = document.currentScript.src.replace(/[^\/]*$/, '');
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const $ = function (s) { return document.querySelector(s); };
  const FELADATOK = Array.isArray(cfg.feladatok) ? cfg.feladatok : [];

  U.css('fm-stilus',
    'body{margin:0;min-height:100vh;background:linear-gradient(135deg,#020617 0%,#1e1b4b 55%,#0f172a 100%);background-attachment:fixed;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.fm-fo{max-width:900px;width:100%;margin:0 auto;padding:0 16px 60px;box-sizing:border-box}' +
    '.fm-fejlec{position:sticky;top:0;z-index:200;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:12px 16px;margin:0 -16px 18px;background:rgba(15,23,42,.96);border-bottom:1px solid #334155;box-shadow:0 6px 20px rgba(0,0,0,.35);box-sizing:border-box}' +
    '.fm-vissza{flex-shrink:0;display:inline-block;padding:8px 14px;border:1px solid #475569;border-radius:10px;background:rgba(51,65,85,.7);color:#e2e8f0;text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap}' +
    '.fm-vissza:hover{background:#0ea5e9;border-color:#38bdf8;color:#fff}' +
    '.fm-fejlec h1{flex:1 1 auto;min-width:0;margin:0;font-size:22px;line-height:1.25;color:#34d399;text-align:center}' +
    '.fm-alcim{flex-basis:100%;width:100%;margin:0;font-size:13px;color:#cbd5e1;text-align:center}' +
    '@media (max-width:600px){' +
      '.fm-fo{padding:0 12px 60px}' +
      '.fm-fejlec{gap:6px 10px;padding:10px 12px;margin:0 -12px 14px}' +
      '.fm-vissza{padding:6px 10px;font-size:13px}' +
      '.fm-fejlec h1{font-size:17px;text-align:left}' +
      '.fm-alcim{font-size:12px;text-align:center}' +
    '}' +
    '.fm-kartya{margin-bottom:16px;padding:18px;border:1px solid #334155;border-radius:16px;background:rgba(15,23,42,.7);box-shadow:0 8px 24px rgba(0,0,0,.3)}' +
    '.fm-kartya p{margin:0 0 10px;line-height:1.55}.fm-kartya .fm-kicsi{font-size:14px;color:#94a3b8}' +
    '.fm-gomb{padding:11px 22px;border:0;border-radius:12px;background:#34d399;color:#0f172a;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 0 18px rgba(52,211,153,.45)}' +
    '.fm-gomb:hover{background:#6ee7b7}.fm-gomb.kek{background:#38bdf8;box-shadow:0 0 18px rgba(56,189,248,.45)}.fm-gomb.szurke{background:transparent;color:#cbd5e1;border:1px solid #64748b;box-shadow:none}' +
    '.fm-gomb:disabled{opacity:.45;cursor:not-allowed}' +
    '.fm-kuldes-sor{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:16px}' +
    '.fm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}' +
    '.fm-felt{display:flex;flex-direction:column;gap:6px;padding:16px;border:1px solid #334155;border-radius:14px;background:#0f172a;color:#e2e8f0;text-align:left;font:inherit;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s}' +
    '.fm-felt:hover:not(:disabled){transform:translateY(-3px);border-color:#38bdf8;box-shadow:0 8px 20px rgba(0,0,0,.4)}.fm-felt:disabled{opacity:.65;cursor:default}' +
    '.fm-felt.zarolt{border-color:#34d399}' +
    '.fm-szam{font-size:13px;font-weight:700;color:#38bdf8}.fm-nev{font-size:18px;font-weight:700}.fm-all{font-size:14px;color:#94a3b8}.fm-all.kesz{color:#34d399;font-weight:700}' +
    '.fm-max{margin-left:6px;color:#64748b;font-weight:400}.fm-ossz h2{margin:0 0 8px;font-size:19px;color:#34d399}.fm-ossz .fm-nagy{font-size:22px;font-weight:800;color:#e2e8f0}' +
    '.fm-jegy{margin:8px 0;font-size:20px;font-weight:800;color:#34d399}.fm-tabla{border-collapse:collapse;margin-top:8px;font-size:14px}.fm-tabla td,.fm-tabla th{padding:5px 12px;border:1px solid #475569;text-align:left}.fm-tabla th{background:#1e293b;color:#cbd5e1}.fm-tabla .akt td{background:rgba(52,211,153,.2);font-weight:700}' +
    '.fm-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:1000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px;box-sizing:border-box;background:rgba(2,6,23,.82);backdrop-filter:blur(4px)}' +
    '.fm-ov[hidden]{display:none}.fm-ov.fm-dlg{z-index:1100;align-items:center}' +
    '.fm-panel{position:relative;width:100%;max-width:780px;margin:auto;padding:22px 18px 20px;box-sizing:border-box;border:1px solid #334155;border-radius:18px;background:#0b1220;box-shadow:0 24px 60px rgba(0,0,0,.6)}' +
    '.fm-x{position:absolute;z-index:5;right:10px;top:8px;width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:#94a3b8;font-size:22px;cursor:pointer}.fm-x:hover{background:#1e293b;color:#fff}' +
    '.fm-doboz{width:100%;max-width:440px;margin:auto;padding:22px;box-sizing:border-box;border:1px solid #475569;border-radius:16px;background:#0f172a;text-align:center}' +
    '.fm-doboz h3{margin:0 0 8px;font-size:21px}.fm-doboz p{margin:0 0 18px;color:#cbd5e1;line-height:1.5;white-space:pre-line}.fm-doboz .fm-sor{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}' +
    '.fm-szabaly{border-color:rgba(217,119,6,.7)}.fm-szabaly h3{margin:0 0 6px;font-size:13px;color:#fcd34d;letter-spacing:.02em}' +
    '.fm-szabaly ul{margin:0;padding-left:20px;font-size:14px;color:#cbd5e1}.fm-szabaly li{margin:6px 0;line-height:1.5}' +
    '.fm-ujra{margin-left:8px;padding:4px 12px;border:1px solid #f59e0b;border-radius:8px;background:transparent;color:#fbbf24;font:inherit;font-size:13px;cursor:pointer}');

  /* ===================== VÁZ ===================== */
  document.title = (cfg.cim || 'Házi dolgozat') + (cfg.alcim ? ' – ' + cfg.alcim : '');
  const SZABALYOK = U.elo
    ? '<section class="fm-kartya fm-szabaly"><h3>FONTOS SZABÁLYOK ÉS FIGYELMEZTETÉSEK:</h3><ul>' +
      '<li>A feladatok külön ablakban nyílnak meg, és az Értékelés gombbal zárhatók le. A már értékelt feladat addig nem nyitható meg újra, amíg el nem küldöd az értékelést a Küldés gombbal.</li>' +
      '<li>A Küldés gomb megnyomásakor a feladatsor értékelése lezárul, és az eredményed automatikusan elküldésre kerül a csernyei.iskola@gmail.com címre.</li>' +
      '<li>Ha a feladatsort többször nyitod meg vagy küldöd be, a rendszerben kizárólag a legkorábban beérkezett megoldásod lesz érvényes!</li>' +
      '<li>Ha elhagyod az oldalt (másik lapra kattintasz), a feladatod lezáródik és az addigi eredményeid lesznek elküldve.</li></ul></section>' : '';
  const KOD_SZOVEG = U.elo
    ? '<p class="fm-kicsi">A házi dolgozat indításakor be kell írnod a személyes kódodat, amit a tanárodtól kaptál. Ha elhagyod az oldalt, a feladatsor lezárul.</p>' : '';
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="fm-fo">' +
    '<header class="fm-fejlec">' +
      '<a class="fm-vissza" href="' + esc(cfg.visszaHref || '../../../7-osztaly.html') + '">⬅ Vissza</a>' +
      '<h1>' + esc(cfg.cim || 'Házi dolgozat') + '</h1>' +
      (cfg.alcim ? '<p class="fm-alcim">' + esc(cfg.alcim) + '</p>' : '') +
    '</header>' +
    SZABALYOK +
    '<section id="fm-start" class="fm-kartya"><p>Ez a lap házi dolgozatként működik. A feladatok egyenként, külön ablakban nyílnak meg, és az Értékelés gombbal zárhatók le.</p>' + KOD_SZOVEG +
    '<button type="button" id="fm-inditas" class="fm-gomb">Házi dolgozat indítása</button></section>' +
    '<section id="fm-lista" hidden><p id="fm-megjegyzes" class="fm-kicsi" role="status"></p><div id="fm-grid" class="fm-grid"></div>' +
    '<div class="fm-kuldes-sor"><button type="button" id="fm-kuldes" class="fm-gomb kek">Küldés</button><span id="fm-kuldes-allapot" class="fm-kicsi"></span></div>' +
    '<div id="fm-ossz" class="fm-kartya fm-ossz" style="margin-top:18px" hidden></div></section>' +
    '</div>' +
    '<div id="fm-ov" class="fm-ov" hidden><div class="fm-panel" role="dialog" aria-modal="true" aria-label="Feladat">' +
    '<button type="button" id="fm-x" class="fm-x" aria-label="Bezárás">✕</button><div id="fm-host"></div></div></div>' +
    '<div id="fm-dlg" class="fm-ov fm-dlg" hidden><div class="fm-doboz" role="alertdialog" aria-modal="true"><h3 id="fm-dlg-cim"></h3><p id="fm-dlg-szoveg"></p>' +
    '<div class="fm-sor"><button type="button" id="fm-dlg-igen" class="fm-gomb"></button><button type="button" id="fm-dlg-nem" class="fm-gomb szurke"></button></div></div></div>');

  /* ===================== ÁLLAPOT ÉS EREDMÉNYEK ===================== */
  const eredmenyek = {};
  let felmeroAktiv = false;
  let ertekelesLezarva = false;
  let osszevontKuldve = null; // null = még nem küldve, true = elküldve, false = hiba
  let kuldesFolyamatban = false;

  const tarKulcs = function () { return 'ujitas_felmero_' + (cfg.classId || '') + '_' + (cfg.cim || '') + '_' + (U.kod || 'archiv'); };
  const kKulcs = function () { return tarKulcs() + '_kuldve_ossz'; };
  const zKulcs = function () { return tarKulcs() + '_lezart'; };

  const tarOlvas = function () { try { return JSON.parse(sessionStorage.getItem(tarKulcs()) || '{}') || {}; } catch (e) { return {}; } };
  const tarIr = function () { try { sessionStorage.setItem(tarKulcs(), JSON.stringify(eredmenyek)); } catch (e) { /* nem kritikus */ } };
  const kIr = function () { try { sessionStorage.setItem(kKulcs(), osszevontKuldve === null ? '' : (osszevontKuldve ? '1' : '0')); } catch (e) { /* nem kritikus */ } };
  const zIr = function () { try { sessionStorage.setItem(zKulcs(), ertekelesLezarva ? '1' : '0'); } catch (e) { /* nem kritikus */ } };

  function feladatZarolt(f) {
    return !!f.fajl && !!eredmenyek[f.id] && !ertekelesLezarva;
  }

  /** Egyetlen összevont payload az összes értékelt (és megoldatlan) feladatról (1 küldés = 1 e-mail). */
  function osszevontPayload(ok) {
    const o = osszesit();
    const szaz = o.osszMax ? Math.round(o.pont / o.osszMax * 100) : 0;
    const reason = ok || 'befejezve';
    const tasks = [];

    FELADATOK.forEach(function (f, i) {
      if (!f.fajl) return;
      const e = eredmenyek[f.id];
      const max = f.max != null ? f.max : (e ? e.max : 0);
      if (!e) {
        tasks.push({
          expression: (i + 1) + '. feladat: ' + (f.cim || f.id),
          correct: false,
          finalAnswer: 'nem megoldott (0 / ' + max + ' pont)',
          correctAnswer: max + ' pont',
          seconds: 0,
          stepErrors: '',
          studentLines: [],
          correctLines: [],
          feedback: ['A feladat nem került megoldásra a lezárásig.'],
        });
        return;
      }
      const pont = Number(e.pont) || 0;
      const reszSorok = Array.isArray(e.reszek)
        ? e.reszek.map(function (r) { return (r.nev || r.kod) + ': ' + r.pont + ' / ' + r.max + ' pont'; })
        : [];
      const valaszSorok = e.valaszok
        ? Object.keys(e.valaszok).map(function (k) { return k + ') ' + (e.valaszok[k] || '—'); })
        : [];
      tasks.push({
        expression: (i + 1) + '. feladat: ' + (f.cim || f.id),
        correct: max > 0 && pont >= max,
        finalAnswer: pont + ' / ' + max + ' pont',
        correctAnswer: max + ' pont',
        seconds: Math.round(Number(e.mp || e.masodperc) || 0),
        stepErrors: '',
        studentLines: valaszSorok,
        correctLines: reszSorok,
        feedback: e.lezaras === 'lapvaltas' ? ['A feladat lapváltás miatt lezárult, az addigi eredmény került rögzítésre.'] : [],
      });
    });

    return {
      setId: String(cfg.setId || 'szamok'),
      score: o.pont,
      total: o.osszMax,
      grade: o.pont + ' / ' + o.osszMax + ' pont (' + szaz + '%) – ' + o.jegy[1],
      reason: reason,
      tasks: tasks,
    };
  }

  function megj(szoveg, ujra) {
    const el = $('#fm-megjegyzes'); el.textContent = szoveg || '';
    if (ujra) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fm-ujra'; b.textContent = 'Küldés újra';
      b.addEventListener('click', function () { kuldesInditasa(true); });
      el.appendChild(b);
    }
  }

  U.felmero = { eredmenyek: eredmenyek, osszesit: function () { return osszesit(); } };

  /* ===================== LISTA ===================== */
  function allapotSzoveg(f) {
    const e = eredmenyek[f.id];
    if (!f.fajl) return ['Hamarosan', ''];
    if (!e) return ['Nyitott', ''];
    const zarSzoveg = feladatZarolt(f) ? ' · értékelve (küldésig zárolva)' : '';
    const kuldSzoveg = U.elo && osszevontKuldve === true ? ' · elküldve ✔' : '';
    return ['Kész: ' + e.pont + ' / ' + e.max + ' pont' + (e.lezaras === 'lapvaltas' ? ' (lapváltás miatt lezárva)' : '') + zarSzoveg + kuldSzoveg, ' kesz'];
  }

  /* ===================== ÖSSZESÍTÉS ÉS OSZTÁLYZAT ===================== */
  const SAVOK = [[33, 'elégtelen (1)', '0–33'], [50, 'elégséges (2)', '34–50'], [74, 'közepes (3)', '51–74'], [90, 'jó (4)', '75–90'], [100, 'jeles (5)', '91–100']];
  function osztalyzat(szazalek) {
    const r = Math.round(szazalek);
    for (let i = 0; i < SAVOK.length; i++) if (r <= SAVOK[i][0]) return [i, SAVOK[i][1]];
    return [SAVOK.length - 1, SAVOK[SAVOK.length - 1][1]];
  }
  function osszesit() {
    const o = { pont: 0, max: 0, osszMax: 0, kesz: 0, osszes: 0 };
    FELADATOK.forEach(function (f) {
      if (!f.fajl) return;
      const e = eredmenyek[f.id], m = f.max != null ? f.max : (e ? e.max : 0);
      o.osszes++; o.osszMax += m;
      if (e) { o.kesz++; o.pont += e.pont; o.max += m; }
    });
    o.szazalek = o.osszMax ? o.pont / o.osszMax * 100 : 0;
    o.jegy = osztalyzat(o.szazalek);
    return o;
  }
  function osszesRajzol() {
    const o = osszesit(), el = $('#fm-ossz');
    if (!o.osszes || !ertekelesLezarva) { el.hidden = true; return; }
    el.hidden = false;
    const tabla = '<table class="fm-tabla"><tr><th>Teljesítmény (%)</th><th>Érdemjegy</th></tr>' + SAVOK.map(function (s, i) {
      return '<tr' + (o.jegy && o.jegy[0] === i ? ' class="akt"' : '') + '><td>' + s[2] + '</td><td>' + esc(s[1]) + '</td></tr>';
    }).join('') + '</table>';
    el.innerHTML = '<h2>Összesítés</h2>' +
      '<div class="fm-nagy">' + o.pont + ' / ' + o.osszMax + ' pont (' + Math.round(o.szazalek) + '%)</div>' +
      '<div class="fm-jegy">Osztályzat: ' + esc(o.jegy[1]) + '</div>' +
      '<p class="fm-kicsi">Megoldott feladatok: ' + o.kesz + ' / ' + o.osszes + '.</p>' + tabla;
  }
  function listaRajzol() {
    $('#fm-grid').innerHTML = FELADATOK.map(function (f, i) {
      const a = allapotSzoveg(f);
      const zar = feladatZarolt(f);
      return '<button type="button" class="fm-felt' + (zar ? ' zarolt' : '') + '" data-id="' + esc(f.id) + '"' + (!f.fajl || zar ? ' disabled' : '') + '>' +
        '<span class="fm-szam">' + (i + 1) + '. feladat' + (f.max ? '<span class="fm-max">' + f.max + ' pont</span>' : '') + '</span><span class="fm-nev">' + esc(f.cim || f.id) + '</span>' +
        '<span class="fm-all' + a[1] + '">' + esc(a[0]) + (f.fajl && eredmenyek[f.id] && !zar ? ' · újra megnyitás' : '') + '</span></button>';
    }).join('');
    const keszDb = FELADATOK.filter(function (f) { return f.fajl && eredmenyek[f.id]; }).length;
    const osszDb = FELADATOK.filter(function (f) { return f.fajl; }).length;
    const allap = $('#fm-kuldes-allapot');
    if (allap) {
      allap.textContent = ertekelesLezarva
        ? 'Az értékelés lezárult (' + keszDb + ' / ' + osszDb + ' feladat értékelve).' + (U.elo && osszevontKuldve === true ? ' Az eredmény elküldve ✔' : '')
        : 'Értékelt feladatok: ' + keszDb + ' / ' + osszDb + '. A Küldés gomb lezárja az értékelést és elküldi az eredményt.';
    }
    const kGomb = $('#fm-kuldes');
    if (kGomb) kGomb.disabled = kuldesFolyamatban;
    osszesRajzol();
  }

  function mutatLista() {
    Object.assign(eredmenyek, tarOlvas());
    try {
      const kv = sessionStorage.getItem(kKulcs());
      osszevontKuldve = kv === '1' ? true : (kv === '0' ? false : null);
    } catch (e) { /* nem kritikus */ }
    try { ertekelesLezarva = sessionStorage.getItem(zKulcs()) === '1'; } catch (e) { /* nem kritikus */ }
    felmeroAktiv = U.elo && !ertekelesLezarva;
    $('#fm-start').hidden = true; $('#fm-lista').hidden = false; listaRajzol();
  }

  $('#fm-inditas').addEventListener('click', async function () {
    if (!(await U.run('indulas'))) return;
    mutatLista();
  });
  if (!U.elo) {
    mutatLista();
  } else {
    (async function () {
      if (await U.run('indulas')) mutatLista();
    })();
  }

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
  let nyitott = null;
  const betoltve = {};
  function szkript(src) {
    return new Promise(function (ok, hiba) {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { hiba(new Error('Nem tölthető be: ' + src)); };
      document.head.appendChild(s);
    });
  }
  let kozosBetoltve = false;
  async function kozosBetolt() { if (kozosBetoltve) return; await szkript(DIR + 'bevitel.js'); kozosBetoltve = true; }
  async function megnyit(f) {
    if (nyitott || !f.fajl || feladatZarolt(f)) return;
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
    try { nyitott.inst = reg.indit(host, { megerosit: megerosit, kesz: function (e) { lezarFeladat(e); } }); }
    catch (err) { console.error(err); lezarFeladat(null, 'A feladat most nem indítható. Frissítsd az oldalt, vagy jelezd a tanárodnak.'); }
  }

  function lezarFeladat(eredmeny, uzenet) {
    if (!nyitott) return;
    if (eredmeny) {
      if (nyitott.f.max != null && eredmeny.max !== nyitott.f.max) console.warn('A(z) ' + nyitott.f.id + ' feladat max pontja eltér a lap beállításától:', eredmeny.max, nyitott.f.max);
      eredmenyek[nyitott.f.id] = eredmeny;
      tarIr();
    }
    nyitott = null;
    $('#fm-host').innerHTML = ''; $('#fm-ov').hidden = true; $('#fm-dlg').hidden = true; document.documentElement.style.overflow = '';
    listaRajzol();
    $('#fm-megjegyzes').textContent = uzenet || (eredmeny ? 'A feladat értékelése elmentve. Az elküldésig nem nyitható meg újra.' : '');
  }

  /* ===================== KÜLDÉS GOMB (EGYETLEN ÖSSZEVONT KÜLDÉS) ===================== */
  async function kuldesInditasa(ujraproba) {
    if (kuldesFolyamatban) return;
    const megoldatlan = FELADATOK.filter(function (f) { return f.fajl && !eredmenyek[f.id]; });

    if (!ujraproba) {
      let szoveg = 'A Küldés gomb megnyomásával az értékelés lezárul, és az eredményed elküldésre kerül.';
      if (megoldatlan.length) {
        szoveg += '\n\nFigyelem: még van ' + megoldatlan.length + ' megoldatlan (még nem értékelt) feladat (' +
          megoldatlan.map(function (f) { return (FELADATOK.indexOf(f) + 1) + '. ' + (f.cim || f.id); }).join(', ') + ').';
      }
      const igen = await megerosit({
        cim: 'Értékelés lezárása és küldése',
        uzenet: szoveg,
        igen: 'Igen, lezárom és elküldöm',
        nem: 'Mégsem',
      });
      if (!igen) return;
    }

    ertekelesLezarva = true;
    felmeroAktiv = false;
    zIr();
    listaRajzol();
    U.emit('lezarva');

    if (!U.elo) {
      megj('Archív módban nincs küldés. Az összesített értékelés megjelenítve.', false);
      return;
    }

    kuldesFolyamatban = true;
    listaRajzol();
    let ok = false;
    try {
      ok = (await U.kuldes(osszevontPayload('befejezve'))) === true;
    } catch (e) {
      console.error(e);
    }
    osszevontKuldve = ok;
    kIr();
    kuldesFolyamatban = false;
    listaRajzol();
    megj(ok
      ? 'Az értékelés lezárult, és az eredményedet elküldtük. Köszönjük!'
      : 'Az eredményt nem sikerült elküldeni. Ne zárd be az oldalt, próbáld újra!',
      !ok);
  }

  $('#fm-kuldes').addEventListener('click', function () { kuldesInditasa(false); });

  $('#fm-grid').addEventListener('click', function (e) {
    const b = e.target.closest('.fm-felt'); if (!b || b.disabled) return;
    const f = FELADATOK.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (f) megnyit(f);
  });
  $('#fm-x').addEventListener('click', async function () {
    if (!nyitott) return;
    const igen = await megerosit({ cim: 'Bezárás', uzenet: 'Bezárod a feladatot értékelés nélkül? A feladatban végzett munkád elvész.', igen: 'Bezárom', nem: 'Folytatom' });
    if (igen) lezarFeladat(null);
  });

  /* ===================== LAPVÉDELEM ===================== */
  U.aktiv = function () { return felmeroAktiv || !!nyitott; };
  U.on('lapvaltas', function () {
    if (nyitott) {
      const fNyitott = nyitott.f;
      const e = nyitott.inst && nyitott.inst.lezar ? nyitott.inst.lezar('lapvaltas') : null;
      nyitott = null;
      $('#fm-host').innerHTML = ''; $('#fm-ov').hidden = true; $('#fm-dlg').hidden = true; document.documentElement.style.overflow = '';
      if (e) {
        eredmenyek[fNyitott.id] = e;
        tarIr();
      }
    }
    if (felmeroAktiv && !ertekelesLezarva) {
      ertekelesLezarva = true;
      felmeroAktiv = false;
      zIr();
      listaRajzol();
      U.emit('lezarva');
      if (U.elo) {
        U.kuldes(osszevontPayload('lapvaltas')).then(function (ok) {
          osszevontKuldve = ok === true;
          kIr();
          listaRajzol();
        });
      }
      $('#fm-megjegyzes').textContent = 'A lapváltás miatt az értékelés lezárult, és az addigi eredményeid elküldésre kerültek a tanárnak.';
    }
  });
  U.on('kilepes', function () {
    if (!U.elo) return;
    if (nyitott) {
      let e = null;
      try { e = nyitott.inst && nyitott.inst.lezar ? nyitott.inst.lezar('lapvaltas') : null; } catch (x) { /* nem kritikus */ }
      const f = nyitott.f;
      nyitott = null;
      if (e) {
        eredmenyek[f.id] = e;
        tarIr();
      }
    }
    if (!ertekelesLezarva || osszevontKuldve !== true) {
      ertekelesLezarva = true;
      felmeroAktiv = false;
      zIr();
      U.kuldes(osszevontPayload('lapvaltas'), { csendes: true });
    }
  });
})(window.UJITAS);
