/**
 * kozos/v1/osztalyoldal.js – osztályoldal a Torzs „Tartalom” lapjáról (mod: 'oldal')
 *
 * Az oldal beállítása:
 *   window.UJITAS_CFG = { mod: 'oldal', classId: '7', cim: '7. Osztály - Matematika', visszaHref: '../../../index.html' };
 * A megjelenés a webhely meglévő osztalylap_style.css-ét használja (ugyanazok az osztályok, mint a régi 7-osztaly.html-ben).
 *
 * Tartalom → felület:
 *   állapot „aktív”  → kártya (típusonként: órai, házi, szorgalmi; felmérő, tananyag is lehet); a kártya a Link oldalára visz
 *   állapot „archív” → az Archívum listába kerül (legújabb elöl)
 *   állapot „rejtett” → nem jelenik meg (a szerver ki sem adja)
 * Ha az Apps Script nem érhető el, az utoljára sikeresen betöltött tartalom látszik (böngészőben mentve).
 * A Link csak relatív (az oldalhoz képest) vagy https:// cím lehet, más (pl. javascript:) nem kattintható.
 */
(function (U) {
  'use strict';
  const cfg = U.cfg, URL_ = window.UJITAS_URL;
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  const TIPUSOK = {
    orai:      { ikon: '📘', cim: 'Órai feladatok',   cls: 'card-orai' },
    hazi:      { ikon: '✏️', cim: 'Házi feladat',     cls: 'card-hazi' },
    szorgalmi: { ikon: '⭐', cim: 'Szorgalmi feladat', cls: 'card-szorgalmi' },
    felmero:   { ikon: '📝', cim: 'Felmérő',           cls: 'card-orai' },
    anyag:     { ikon: '📚', cim: 'Tananyag',          cls: 'card-orai' },
  };
  const FO = ['orai', 'hazi', 'szorgalmi'];                 // ezekből mindig van kártya (tartalom nélkül: „Szerkesztés alatt”)
  const SORREND = FO.concat(['felmero', 'anyag']);
  const ALLAPOT = function (it) {
    const a = String(it.allapot || 'aktív').trim().toLowerCase();
    return a === 'archiv' ? 'archív' : (a === 'aktiv' ? 'aktív' : a);
  };

  /** Csak relatív vagy https cím; más (javascript:, data: …) nem. Üres/érvénytelen → ''. */
  function biztonsagosLink(u) {
    u = String(u == null ? '' : u).trim();
    if (!u) return '';
    if (/^https:\/\//i.test(u)) return u;
    if (/^\/\//.test(u) || /^[a-z][a-z0-9+.\-]*:/i.test(u)) return '';
    return u;
  }
  const datumSzoveg = function (d) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
    return m ? m[1] + '. ' + m[2] + '. ' + m[3] + '.' : String(d || '');
  };
  const sortKieg = function (s) { return esc(s).replace(/\r?\n/g, '<br>'); };

  /* ----- váz ----- */
  const cim = cfg.cim || (cfg.classId + '. osztály - Matematika');
  document.title = cim;
  document.body.insertAdjacentHTML('afterbegin',
    '<header><h2>' + esc(cim) + '</h2><a href="' + esc(cfg.visszaHref || '../../../index.html') + '" class="btn-back">⬅ Vissza a Főoldalra</a></header>' +
    '<div class="layout">' +
    '<aside class="sidebar"><h3>📂 Órai Archívum</h3><ul class="archive-list" id="uj-archivum"></ul></aside>' +
    '<main class="main-content"><h3 class="date-title">Aktuális óra tananyaga</h3>' +
    '<p id="uj-allapot" style="margin:0 0 10px;color:#94a3b8;font-size:13px"></p>' +
    '<div class="task-grid" id="uj-kartyak"></div></main></div>');
  U.css('uj-oldal', '.sidebar{box-sizing:border-box}');   // a közös stíluslapban a .sidebar mobilon 100% + belső tér: kilógna
  const $ = function (s) { return document.querySelector(s); };

  function kartya(tipus, it) {
    const t = TIPUSOK[tipus] || TIPUSOK.anyag;
    const href = it ? biztonsagosLink(it.link) : '';
    const elo = it
      ? esc(it.cim) + (it.leiras ? '<br><br>' + sortKieg(it.leiras) : '')
      : 'Szerkesztés alatt';
    return '<div class="task-card ' + t.cls + '"' + (href ? ' data-href="' + esc(href) + '" tabindex="0" role="link"' : '') + '>' +
      '<h4>' + t.ikon + ' ' + t.cim + '</h4>' +
      '<div class="card-preview">' + elo + '</div>' +
      '<span class="click-hint">' + (href ? 'Részletek ➔' : (it ? 'Hamarosan' : '')) + '</span></div>';
  }

  function render(items) {
    const aktiv = items.filter(function (i) { return ALLAPOT(i) === 'aktív'; });
    const arch = items.filter(function (i) { return ALLAPOT(i) === 'archív'; })
      .sort(function (a, b) { return a.datum < b.datum ? 1 : (a.datum > b.datum ? -1 : 0); });

    let html = '';
    SORREND.forEach(function (tipus) {
      const lista = aktiv.filter(function (i) { return (TIPUSOK[i.tipus] ? i.tipus : 'anyag') === tipus; });
      if (lista.length) lista.forEach(function (i) { html += kartya(tipus, i); });
      else if (FO.indexOf(tipus) >= 0) html += kartya(tipus, null);
    });
    $('#uj-kartyak').innerHTML = html;

    $('#uj-archivum').innerHTML = arch.length
      ? arch.map(function (i) {
          const href = biztonsagosLink(i.link);
          return '<li class="archive-item"' + (href ? ' data-href="' + esc(href) + '" tabindex="0" role="link"' : '') + '>📅 ' +
            esc(datumSzoveg(i.datum)) + ' - ' + esc(i.cim) + '</li>';
        }).join('')
      : '<li class="archive-item">Még nincs archivált óra.</li>';
  }

  /* ----- kattintás: a kártya és az archívum-elem a linkjére visz ----- */
  const nav = function (e) {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    const el = e.target.closest('[data-href]');
    if (el) location.href = el.getAttribute('data-href');
  };
  document.addEventListener('click', nav);
  document.addEventListener('keydown', nav);

  /* ----- betöltés: mentett tartalom azonnal, közben frissítés az Apps Scriptből ----- */
  const CKEY = 'ujitas_tartalom_' + cfg.classId;
  const olvas = function () { try { const v = JSON.parse(localStorage.getItem(CKEY) || 'null'); return v && Array.isArray(v.items) ? v : null; } catch (e) { return null; } };
  const ment = function (v) { try { localStorage.setItem(CKEY, JSON.stringify(v)); } catch (e) { /* nem kritikus */ } };
  const allapot = function (s) { $('#uj-allapot').textContent = s; };

  const mentett = olvas();
  if (mentett) render(mentett.items); else { render([]); allapot('Betöltés…'); }

  (async function () {
    try {
      if (!URL_) throw new Error('Hiányzó végpont');
      const ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 15000);
      const r = await fetch(URL_ + '?akcio=tartalom&osztaly=' + encodeURIComponent(cfg.classId), { cache: 'no-store', signal: ctl.signal });
      clearTimeout(to);
      const d = await r.json();
      if (!d || d.ok !== true || !Array.isArray(d.items)) throw new Error('Érvénytelen válasz');
      ment({ items: d.items, mikor: Date.now() });
      render(d.items); allapot('');
    } catch (e) {
      console.error(e);
      allapot(mentett ? 'A tartalom frissítése most nem sikerült, a legutóbb betöltött látszik.'
                      : 'A tartalom most nem tölthető be. Frissítsd az oldalt, vagy próbáld meg később.');
    }
  })();
})(window.UJITAS);
