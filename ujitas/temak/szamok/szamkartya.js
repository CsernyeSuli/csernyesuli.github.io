/**
 * temak/szamok/szamkartya.js – „Számok és műveletek” házi dolgozat, 2. feladat: számkártyák húzása a megfelelő négyszögbe.
 * Pontozás: minden jó helyre tett szám 1 pont (10 pont), rossz helyre tett szám az adott négyszögben 1 pontot levon (minimum 0).
 */
(function () {
  'use strict';
  const S = window.SZAMOK_BEVITEL;
  if (!S) throw new Error('A számkártya feladathoz a bevitel.js szükséges.');
  const LEVONAS = true;

  /* ===================== ADATOK ===================== */
  const KIFEJEZESEK = ['3/5', '-8', '-5/6', '3^2', '-12/4', '0,2^2', '0/5', '(-1)^5', '0,64'];
  const ZONAK = [
    { kod: 'a', nev: 'Természetes számok', jo: function (q) { return q.isInt() && q.n >= 0n; } },
    { kod: 'b', nev: 'Nem pozitív egészek', jo: function (q) { return q.isInt() && q.n <= 0n; } },
    { kod: 'c', nev: 'Pozitív racionális számok', jo: function (q) { return q.n > 0n; } },
  ];
  const KARTYAK = KIFEJEZESEK.map(function (k, i) {
    const fa = S.parse(k), q = S.evaluate(fa);
    return { id: 'k' + i, kif: k, html: S.html(fa), zonak: ZONAK.filter(function (z) { return z.jo(q); }).map(function (z) { return z.kod; }) };
  });
  const KARTYA = KARTYAK.reduce(function (o, k) { o[k.id] = k; return o; }, {});
  const vart = function (kod) { return KARTYAK.filter(function (k) { return k.zonak.indexOf(kod) >= 0; }).map(function (k) { return k.id; }); };
  const MAX = ZONAK.reduce(function (a, z) { return a + vart(z.kod).length; }, 0);

  /* ===================== PONTOZÁS ===================== */
  function pontoz(elh) {
    const reszek = ZONAK.map(function (z) {
      const v = vart(z.kod), van = elh[z.kod] || [];
      const joDb = van.filter(function (id) { return v.indexOf(id) >= 0; }).length, rosszDb = van.length - joDb;
      return { kod: z.kod, nev: z.kod + ') ' + z.nev, pont: Math.max(0, joDb - (LEVONAS ? rosszDb : 0)), max: v.length, jo: joDb === v.length && rosszDb === 0, joDb: joDb, rosszDb: rosszDb };
    });
    const pont = reszek.reduce(function (a, r) { return a + r.pont; }, 0);
    return { pont: pont, max: MAX, helyes: reszek.every(function (r) { return r.jo; }), reszek: reszek };
  }

  /* ===================== STÍLUS ===================== */
  const CSS =
    '.szk-tray{margin:10px 0 14px;padding:10px 6px 2px 10px;border:1px dashed #475569;border-radius:14px;background:rgba(15,23,42,.6)}' +
    '.szk-k{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:66px;min-height:56px;margin:0 8px 8px 0;padding:0 12px;border:2px solid #38bdf8;border-radius:10px;' +
    'background:#0f172a;color:#e0f2fe;font-size:18px;font-weight:600;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;white-space:nowrap;vertical-align:top}' +
    '.szk-k.szk-szellem{position:absolute;z-index:60;margin:0;pointer-events:none;cursor:grabbing;border-color:#e0f2fe;box-shadow:0 10px 22px rgba(0,0,0,.55)}' +
    '.szk-k.jo{border-color:#34d399;color:#d1fae5}.szk-k.rossz{border-color:#f87171;color:#fee2e2}.szk-zona.zar .szk-k{cursor:default;border-color:#34d399}' +
    '.szk-zona{margin:0 0 12px;padding:10px 12px 6px;border:2px solid #475569;border-radius:12px;background:rgba(15,23,42,.6)}' +
    '.szk-zona.over{border-color:#38bdf8;background:rgba(56,189,248,.08)}' +
    '.szk-cim{font-size:18px;color:#e0f2fe}.szk-cim i{margin-right:8px;font-weight:700;color:#94a3b8}' +
    '.szk-doboz{min-height:66px;margin-top:8px;padding:6px 4px 0 6px;border:1px dashed #64748b;border-radius:8px}' +
    '.szk-doboz:empty:before{content:"húzd ide a megfelelő számokat";color:#64748b;font-size:14px;line-height:54px}';

  /* ===================== FELÜLET ===================== */
  function indit(host, api) {
    S.css(); window.UJITAS.css('szk-stilus', CSS);
    const st = { zonak: {}, vege: false, start: Date.now() };
    ZONAK.forEach(function (z) { st.zonak[z.kod] = []; });

    host.innerHTML = '<div class="sz"><h2>Számok csoportosítása</h2>' +
      '<p class="sz-felad">A megadott számok közül válaszd ki a feltételeknek megfelelőket! Húzd a számkártyákat a megfelelő négyszögbe. ' +
      'Egy szám több négyszögbe is kerülhet. A négyszögből kihúzott kártya eltűnik onnan.</p>' +
      '<div class="szk-tray" data-szk="tray">' + KARTYAK.map(function (k) { return '<div class="szk-k" data-id="' + k.id + '" role="img" aria-label="' + S.esc(k.kif) + ' számkártya">' + k.html + '</div>'; }).join('') + '</div>' +
      ZONAK.map(function (z) {
        return '<div class="szk-zona" data-z="' + z.kod + '"><span class="sz-max">' + vart(z.kod).length + ' pont</span><div class="szk-cim"><i>' + z.kod + ')</i>' + z.nev + ':</div>' +
          '<div class="szk-doboz" data-doboz="' + z.kod + '"></div></div>';
      }).join('') +
      S.tabla([['a–c', 'Minden jó helyre tett szám 1 pont. Rossz helyre tett szám az adott négyszögben 1 pontot levon.', MAX + ' pont']]) +
      '<div class="sz-gombok"><button type="button" class="sz-gomb" data-sz="ertekeles">Értékelés</button></div></div>';

    const root = host.querySelector('.sz');
    const $ = function (n) { return host.querySelector('[data-sz="' + n + '"]'); };
    const zonaEl = function (k) { return host.querySelector('[data-z="' + k + '"]'); };
    const sorrend = function (ids) { return ids.slice().sort(function (a, b) { return +a.slice(1) - +b.slice(1); }); };

    function rajzol() {
      ZONAK.forEach(function (z) {
        host.querySelector('[data-doboz="' + z.kod + '"]').innerHTML = sorrend(st.zonak[z.kod]).map(function (id) {
          return '<div class="szk-k" data-id="' + id + '" data-z="' + z.kod + '">' + KARTYA[id].html + '</div>';
        }).join('');
        zonaEl(z.kod).classList.toggle('zar', st.vege);
      });
    }
    rajzol();

    /* ----- húzás ----- */
    let drag = null;
    function zonaAlatt(x, y) {
      for (let i = 0; i < ZONAK.length; i++) {
        const r = zonaEl(ZONAK[i].kod).getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return ZONAK[i].kod;
      }
      return null;
    }
    function gorgetoSzulo(el) {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const o = window.getComputedStyle(p).overflowY;
        if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
      }
      return null;
    }
    function mozgat() {
      const r = root.getBoundingClientRect();
      drag.sz.style.left = (drag.x - r.left - drag.w / 2) + 'px';
      drag.sz.style.top = (drag.y - r.top - drag.h / 2 - 26) + 'px';
      const z = zonaAlatt(drag.x, drag.y - 26);
      ZONAK.forEach(function (q) { zonaEl(q.kod).classList.toggle('over', q.kod === z && !st.vege); });
    }
    function gorget() {
      if (!drag) return;
      const d = drag.y > window.innerHeight - 70 ? 14 : (drag.y < 70 ? -14 : 0);
      if (!d) return;
      if (drag.gorgeto) drag.gorgeto.scrollTop += d; else window.scrollBy(0, d);
      mozgat();
    }
    function mozog(e) { if (!drag || e.pointerId !== drag.pid) return; drag.x = e.clientX; drag.y = e.clientY; mozgat(); }
    function elenged(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag; drag = null;
      clearInterval(d.timer);
      d.el.removeEventListener('pointermove', mozog); d.el.removeEventListener('pointerup', elenged); d.el.removeEventListener('pointercancel', elenged);
      try { d.el.releasePointerCapture(e.pointerId); } catch (x) { /* nem kritikus */ }
      if (d.sz.parentNode) d.sz.parentNode.removeChild(d.sz);
      d.el.style.opacity = '';
      ZONAK.forEach(function (q) { zonaEl(q.kod).classList.remove('over'); });
      if (e.type !== 'pointercancel' && !st.vege) {
        const z = zonaAlatt(e.clientX, e.clientY - 26);
        if (d.honnan) st.zonak[d.honnan] = st.zonak[d.honnan].filter(function (x) { return x !== d.id; });
        if (z && st.zonak[z].indexOf(d.id) < 0) st.zonak[z].push(d.id);
      }
      rajzol();
    }
    root.addEventListener('pointerdown', function (e) {
      const el = e.target.closest ? e.target.closest('.szk-k') : null;
      if (!el || drag || st.vege || (e.button !== undefined && e.button !== 0)) return;
      const honnan = el.getAttribute('data-z');
      e.preventDefault();
      const id = el.getAttribute('data-id'), r = el.getBoundingClientRect();
      const sz = document.createElement('div');
      sz.className = 'szk-k szk-szellem'; sz.innerHTML = KARTYA[id].html; sz.style.width = r.width + 'px'; sz.style.height = r.height + 'px';
      root.appendChild(sz);
      drag = { id: id, honnan: honnan, el: el, sz: sz, pid: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height, gorgeto: gorgetoSzulo(root) };
      if (honnan) el.style.opacity = '.25';
      try { el.setPointerCapture(e.pointerId); } catch (x) { /* nem kritikus */ }
      el.addEventListener('pointermove', mozog); el.addEventListener('pointerup', elenged); el.addEventListener('pointercancel', elenged);
      drag.timer = setInterval(gorget, 30);
      mozgat();
    });

    /* ----- értékelés ----- */
    $('ertekeles').addEventListener('click', async function () {
      if (st.vege) return;
      const igen = await api.megerosit({
        cim: 'Értékelés',
        uzenet: 'Biztosan befejezed és lezárod ezt a feladatot? Az értékelés után már nem módosíthatod az elhelyezést.',
        igen: 'Igen, értékelem',
        nem: 'Még nem',
      });
      if (!igen || st.vege) return;
      eredmenyNezet(lezarEredmeny('ertekeles'));
    });

    /* ----- eredmény ----- */
    function lezarEredmeny(ok) {
      if (!st.vege) {
        st.vege = true;
        $('ertekeles').disabled = true;
        if (drag) { clearInterval(drag.timer); if (drag.sz.parentNode) drag.sz.parentNode.removeChild(drag.sz); drag = null; }
      }
      const p = pontoz(st.zonak);
      const valaszok = {};
      ZONAK.forEach(function (z) {
        const van = sorrend(st.zonak[z.kod]);
        valaszok[z.kod] = van.length ? van.map(function (id) { return KARTYA[id].kif; }).join(', ') : 'üres';
      });
      return {
        feladat: 'szamkartya', cim: 'Számok csoportosítása', pont: p.pont, max: p.max, helyes: p.helyes,
        lezaras: ok, mp: Math.round((Date.now() - st.start) / 1000),
        reszek: p.reszek.map(function (r) { return { kod: r.kod, nev: r.nev, pont: r.pont, max: r.max }; }),
        elhelyezes: JSON.parse(JSON.stringify(st.zonak)),
        valaszok: valaszok,
      };
    }
    function eredmenyNezet(e) {
      const sorok = ZONAK.map(function (z, i) {
        const r = e.reszek[i], v = vart(z.kod), van = sorrend(e.elhelyezes[z.kod]);
        const hianyzik = v.filter(function (id) { return van.indexOf(id) < 0; }).length, jo = r.pont === r.max && van.length === v.length;
        return '<div class="sz-ert ' + (jo ? 'ok' : 'rossz') + '"><div class="sz-fej"><span class="sz-kod">' + z.kod + ')</span>' + z.nev + ':</div>' +
          '<div style="margin-top:6px">' + (van.length ? van.map(function (id) { return '<div class="szk-k ' + (v.indexOf(id) >= 0 ? 'jo' : 'rossz') + '" style="cursor:default">' + KARTYA[id].html + '</div>'; }).join('') : '<i style="color:#94a3b8">nem tettél ide számot</i>') + '</div>' +
          '<div class="sz-pontsor">' + (jo ? '✔ ' : '✘ ') + r.pont + ' / ' + r.max + ' pont</div>' +
          (hianyzik || (!jo && van.length) ? '<div class="sz-tagok">' + (hianyzik ? 'Hiányzó számok: ' + hianyzik + ' db' : '') + (hianyzik && van.length - (v.length - hianyzik) ? ' · ' : '') + (van.length - (v.length - hianyzik) ? 'Rossz helyre tett szám: ' + (van.length - (v.length - hianyzik)) + ' db' : '') + '</div>' : '') + '</div>';
      }).join('');
      S.ertekeloNezet(host, e, sorok).addEventListener('click', function () { api.kesz(e); });
    }

    return { lezar: function (ok) { return lezarEredmeny(ok || 'lezaras'); } };
  }

  S.regisztral('szamkartya', { cim: 'Számok csoportosítása', max: MAX, indit: indit }, { kartyak: KARTYAK, pontoz: pontoz });
})();