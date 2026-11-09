/**
 * kozos/v1/betolto.js – közös betöltő és eseményvezérlő (v1)
 *
 * Az oldal a betöltő ELŐTT megadja a beállításait, majd betölti ezt a fájlt:
 *   <script>window.UJITAS_CFG = { mod: 'elo', classId: '7', assignmentType: 'Orai',
 *                                 taskTitle: 'Műveleti sorrend', setId: '1', tema: 'muveleti-sorrend' };</script>
 *   <script src="../../kozos/v1/betolto.js"></script>
 *
 * mod: 'elo'    – azonosítás + védelem + küldés (a téma-modul előtt betöltve; ha bármelyik hiányzik, az oldal NEM indul el)
 *      'archiv' – csak a téma-modul: nincs kódbekérés, védelem, küldés (az archíváláshoz elég ezt az egy szót átírni)
 * tema:         a ../../temak/<tema>.js téma-modul (az értékelés és a feladatok). Elhagyható, ha az oldal saját szkriptet használ.
 *
 * Szerződés a téma-modul felé (window.UJITAS):
 *   await UJITAS.run('indulas')   – indítás előtt hívd; false = ne indulj (pl. a diák nem adott meg kódot)
 *   UJITAS.aktiv = () => bool     – a téma írja felül: fut-e éppen feladatsor
 *   UJITAS.on('lapvaltas', fn)    – a diák másik lapra váltott: zárd le a feladatsort (és küldd el)
 *   UJITAS.on('kilepes', fn)      – az oldal éppen eltűnik: küldd el csendben, ami van (szinkron!)
 *   UJITAS.emit('lezarva')        – a téma jelzi, hogy a feladatsor véget ért (a figyelmeztetés eltűnik)
 *   await UJITAS.kuldes(payload)  – true / false; archív módban null (nincs küldés)
 */
(function () {
  'use strict';
  const cfg = window.UJITAS_CFG || {};
  const ELO = cfg.mod !== 'archiv';                       // alapértelmezés: élő (a biztonságos irány)
  const base = document.currentScript.src.replace(/[^\/]*$/, '');
  const temaBase = new URL('../../temak/', base).href;
  const hooks = {}, handlers = {};

  const U = window.UJITAS = {
    verzio: 'v1', cfg: cfg, elo: ELO, kod: '', _modulok: {},
    aktiv: function () { return false; },
    on: function (n, fn) { (handlers[n] = handlers[n] || []).push(fn); },
    emit: function (n, d) { (handlers[n] || []).forEach(function (fn) { try { fn(d); } catch (e) { console.error(e); } }); },
    hook: function (n, fn) { (hooks[n] = hooks[n] || []).push(fn); },
    run: async function (n, d) {
      for (const fn of (hooks[n] || [])) { if ((await fn(d)) === false) return false; }
      return true;
    },
    kuldes: async function () { return null; },            // a küldő modul felülírja
    /** Közös, előtaggal ellátott stílusok (egyszer kerülnek az oldalra). */
    css: function (id, text) {
      if (document.getElementById(id)) return;
      const s = document.createElement('style'); s.id = id; s.textContent = text; document.head.appendChild(s);
    },
  };

  U.css('uj-alap',
    '.uj-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'background:rgba(2,6,23,.9);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.uj-ov[hidden]{display:none}' +
    '.uj-box{width:100%;max-width:400px;box-sizing:border-box;padding:24px;border:1px solid #334155;border-radius:16px;' +
    'background:#0f172a;color:#e2e8f0;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.5)}' +
    '.uj-box h2{margin:0 0 8px;font-size:22px;font-weight:800}' +
    '.uj-box p{margin:8px 0;line-height:1.5}' +
    '.uj-btn{margin-top:16px;padding:10px 18px;border:0;border-radius:12px;background:#34d399;color:#0f172a;' +
    'font-weight:700;font-size:15px;cursor:pointer}' +
    '.uj-btn:disabled{opacity:.4;cursor:not-allowed}' +
    '.uj-btn.uj-masodlagos{background:transparent;color:#94a3b8;text-decoration:underline;font-weight:400}');

  const MODULOK = ELO ? ['azonosito.js', 'vedelem.js', 'kuldes.js'] : [];
  const load = function (src) {
    return new Promise(function (ok, fail) {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { fail(new Error('Nem tölthető be: ' + src)); };
      document.head.appendChild(s);
    });
  };
  const leall = function (err) {                           // biztonságos leállás: az oldal nem indul védelem nélkül
    console.error(err);
    const d = document.createElement('div');
    d.className = 'uj-ov';
    d.innerHTML = '<div class="uj-box"><h2>⚠️ Az oldal nem indult el</h2><p>Egy szükséges rész nem töltődött be. ' +
                  'Frissítsd az oldalt, ha pedig nem segít, jelezd a tanárodnak.</p></div>';
    (document.body || document.documentElement).appendChild(d);
  };

  const indit = async function () {
    try {
      for (const m of MODULOK) await load(base + m);
      if (ELO) {
        ['azonosito', 'vedelem', 'kuldes'].forEach(function (m) {
          if (!U._modulok[m]) throw new Error('Hiányzó modul: ' + m);
        });
      }
      if (cfg.tema) await load(temaBase + cfg.tema + '.js');
      U.emit('kesz');
    } catch (e) { leall(e); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', indit); else indit();
})();
