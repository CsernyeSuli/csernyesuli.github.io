/**
 * temak/szamok/halmazabra.js – „Számok és műveletek” felmérő, 1. feladat: számok elhelyezése a halmazábrában.
 *
 * Önálló feladat-modul: a gyűjtő lap (felmero.js) tölti be, és egy lebegő ablak (host) elembe építi fel a felületét.
 * Szerződés a gyűjtő lappal (window.UJITAS_FELADATOK[id] = { cim, max, indit(host, api) }):
 *   api.megerosit({cim, uzenet, igen, nem}) → Promise<boolean>   közös megerősítő ablak
 *   api.kesz(eredmeny)                                           az Értékelés után: átadja az eredményt, a lebegő ablak bezárul
 *   indit() visszaadja: { lezar(ok) → eredmeny }                 a gyűjtő lap külső lezárásához (pl. lapváltás)
 * eredmeny: { feladat, cim, pont, max, helyes, ellenorzesek, ujra, lezaras, mp, reszek: [{kod, nev, pont, max}], elhelyezes }
 *
 * Pontozás: minden jó helyre kerülő szám 1 pont (10 szám, összesen 10 pont). A részekhez tartozó pont a részben jó helyen lévő számok száma.
 * Az Ellenőrzés csak azt mondja meg, hogy helyes-e (a rossz helyen lévő kártyákat nem mutatja); az elért pontszám az Értékelésnél látszik.
 * A számok megjelenítéséhez és besorolásához a tortek-motor.js-t használja (emeletes törtek, pontos számítás).
 */
(function () {
  'use strict';
  const U = window.UJITAS, M = window.TORTEK_MOTOR;
  if (!M) throw new Error('A halmazábra feladathoz a tortek-motor.js szükséges.');
  const FX = M.fx();

  /* ===================== ADATOK ===================== */
  const KIFEJEZESEK = ['2', '−3', '2/3', '0', '−0,7', '−8/4', '−7', '0,06', '12/4', '−3,58'];   // a feladat sorrendjében
  const ZONA_NEV = {
    R:  'Racionális számok (csak)',
    E:  'Egész számok (csak)',
    EN: 'Egész és negatív számok (közös rész)',
    N:  'Negatív számok (csak)',
  };
  const ZONAK = ['R', 'E', 'EN', 'N'];

  /** Egy szám helye a halmazábrán az értéke alapján (pontos számolással, nem kézzel megadva). */
  function zonaSzamhoz(kif) {
    const q = M.evaluate(M.parse(kif));
    const egesz = q.isInt(), negativ = q.n < 0n;
    return egesz && negativ ? 'EN' : (egesz ? 'E' : (negativ ? 'N' : 'R'));
  }
  const KARTYAK = KIFEJEZESEK.map(function (k, i) { return { id: 'k' + i, kif: k, zona: zonaSzamhoz(k) }; });

  /* ===================== GEOMETRIA (tervezési egységekben) ===================== */
  const W = 700, H = 430;                                      // a halmazábra mérete
  const R = { cx: 350, cy: 215, rx: 346, ry: 211 };            // racionális számok (külső)
  const E = { cx: 280, cy: 249, rx: 190, ry: 116 };            // egész számok
  const N = { cx: 420, cy: 249, rx: 190, ry: 116 };            // negatív számok
  const CW = 58, CH = 44;                                      // kártyaméret
  const TRAY_Y = 446, BH = 572;                                // a tálca helye, a teljes tábla magassága
  const LABELS = [
    { x: R.cx - 72, y: 4, w: 144, h: 28, t: 'Racionális számok', c: '#38bdf8' },
    { x: 234, y: 120, w: 114, h: 26, t: 'Egész számok', c: '#34d399' },
    { x: 352, y: 120, w: 114, h: 26, t: 'Negatív számok', c: '#fbbf24' },
  ];
  const inEl = function (e, x, y) { return Math.pow((x - e.cx) / e.rx, 2) + Math.pow((y - e.cy) / e.ry, 2) <= 1; };
  /** Melyik részben van a pont? 'R' (csak racionális) | 'E' | 'N' | 'EN' (közös) | null (a halmazábrán kívül) */
  function zonaAt(x, y) {
    if (!inEl(R, x, y)) return null;
    const e = inEl(E, x, y), n = inEl(N, x, y);
    return e && n ? 'EN' : (e ? 'E' : (n ? 'N' : 'R'));
  }
  const atfed = function (a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; };

  /** Rácsos kártyahelyek részenként: olyan helyek, ahol a kártya TELJESEN az adott részben van, és nem takar címkét.
      Részenként a legtöbb helyet adó rácseltolást keresi (egyszer számolja ki). */
  let HELYEK = null;
  function helyek() {
    if (HELYEK) return HELYEK;
    const GX = CW + 6, GY = CH + 6, out = { R: [], E: [], N: [], EN: [] };
    const zonaKartya = function (x, y) {
      const kr = { x: x - CW / 2, y: y - CH / 2, w: CW, h: CH };
      if (LABELS.some(function (l) { return atfed(kr, { x: l.x - 3, y: l.y - 3, w: l.w + 6, h: l.h + 6 }); })) return null;
      let z0 = null;
      for (const fx of [0, 0.25, 0.5, 0.75, 1]) for (const fy of [0, 0.5, 1]) {
        const z = zonaAt(kr.x + fx * kr.w, kr.y + fy * kr.h);
        if (!z) return null;
        if (z0 === null) z0 = z; else if (z !== z0) return null;
      }
      return z0;
    };
    ZONAK.forEach(function (Z) {
      let top = [];
      for (let ox = 0; ox < GX; ox += 3) for (let oy = 0; oy < GY; oy += 3) {
        const s = [];
        for (let y = oy + CH / 2; y < H; y += GY) for (let x = ox + CW / 2; x < W; x += GX) {
          if (zonaKartya(x, y) === Z) s.push({ x: Math.round(x), y: Math.round(y) });
        }
        if (s.length > top.length) top = s;
      }
      out[Z] = top;
    });
    HELYEK = out;
    return out;
  }
  const otthon = function (i) { return { x: 70 + 140 * (i % 5), y: TRAY_Y + 42 + 56 * Math.floor(i / 5) }; };   // tálca-hely

  /* ===================== PONTOZÁS (felület nélkül, tesztelhető) ===================== */
  /** elhelyezes: { kartyaId: zóna | null } → { pont, max, helyes, reszek: [{kod, nev, pont, max}] } */
  function pontoz(elhelyezes) {
    const reszek = ZONAK.map(function (Z) {
      const vart = KARTYAK.filter(function (k) { return k.zona === Z; });
      const jo = vart.filter(function (k) { return elhelyezes[k.id] === Z; }).length;
      return { kod: Z, nev: ZONA_NEV[Z], pont: jo, max: vart.length };
    });
    const pont = reszek.reduce(function (a, r) { return a + r.pont; }, 0), max = KARTYAK.length;
    return { pont: pont, max: max, helyes: pont === max, reszek: reszek };
  }

  /* ===================== FELÜLET ===================== */
  U.css('hz-stilus',
    '.hz{color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.hz h2{margin:0 0 8px;font-size:22px;color:#34d399}.hz p{margin:0 0 10px;line-height:1.5}' +
    '.hz-info{padding:10px 14px;border:1px solid #0e7490;border-radius:12px;background:rgba(8,47,73,.5);font-size:14px;color:#bae6fd}' +
    '.hz-wrap{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}' +
    '.hz-board{position:relative;transform-origin:0 0}' +
    '.hz-svg{position:absolute;left:0;top:0}' +
    '.hz-tray{position:absolute;left:0;width:700px;border:1px dashed #475569;border-radius:16px;background:rgba(15,23,42,.6)}' +
    '.hz-card{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:2px solid #38bdf8;border-radius:10px;background:#0f172a;color:#e0f2fe;' +
    'font-size:17px;font-weight:600;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;white-space:nowrap;' +
    'transition:left .14s ease,top .14s ease,box-shadow .14s ease}' +
    '.hz-card.frac{font-size:15px}.hz-card.drag{transition:none;z-index:20;cursor:grabbing;box-shadow:0 10px 22px rgba(0,0,0,.55);border-color:#e0f2fe}' +
    '.hz-card.rogzitett{cursor:default;border-color:#34d399}' +
    '.hz-msg{min-height:1.6em;margin:10px 0 2px;font-weight:600}.hz-msg.ok{color:#34d399}.hz-msg.nem{color:#fbbf24}' +
    '.hz-gombok{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}' +
    '.hz-gomb{padding:10px 18px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;color:#0f172a;background:#34d399}' +
    '.hz-gomb.kek{background:#38bdf8}.hz-gomb.szurke{background:transparent;color:#cbd5e1;border:1px solid #64748b}.hz-gomb:disabled{opacity:.4;cursor:not-allowed}' +
    '.hz-pont{margin:6px 0 14px;font-size:44px;font-weight:800;color:#34d399;text-align:center}' +
    '.hz-reszek{width:100%;border-collapse:collapse;margin-bottom:14px}.hz-reszek td{padding:8px 10px;border-top:1px solid #334155}' +
    '.hz-reszek td:last-child{text-align:right;font-weight:700;white-space:nowrap}.hz-reszek .ok{color:#34d399}.hz-reszek .nem{color:#f87171}');

  function indit(host, api) {
    const allapot = { elhelyezes: {}, hely: {}, zarolt: false, vege: false, ellenorzesek: 0, ujra: 0, start: Date.now() };
    KARTYAK.forEach(function (k) { allapot.elhelyezes[k.id] = null; });
    const foglalt = {};                                          // 'Z:i' → kártya id

    const svgEl = '<svg class="hz-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<ellipse cx="' + R.cx + '" cy="' + R.cy + '" rx="' + R.rx + '" ry="' + R.ry + '" fill="rgba(56,189,248,.06)" stroke="#38bdf8" stroke-width="2"/>' +
      '<ellipse cx="' + E.cx + '" cy="' + E.cy + '" rx="' + E.rx + '" ry="' + E.ry + '" fill="rgba(16,185,129,.12)" stroke="#34d399" stroke-width="2"/>' +
      '<ellipse cx="' + N.cx + '" cy="' + N.cy + '" rx="' + N.rx + '" ry="' + N.ry + '" fill="rgba(245,158,11,.12)" stroke="#fbbf24" stroke-width="2"/>' +
      LABELS.map(function (l) {
        return '<rect x="' + l.x + '" y="' + l.y + '" width="' + l.w + '" height="' + l.h + '" rx="5" fill="#0f172a" stroke="' + l.c + '" stroke-width="1.5"/>' +
          '<text x="' + (l.x + l.w / 2) + '" y="' + (l.y + l.h / 2 + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#e2e8f0" font-family="system-ui,sans-serif">' + l.t + '</text>';
      }).join('') + '</svg>';

    host.innerHTML =
      '<div class="hz">' +
      '<h2>Helyezd el a számokat a halmazábrában!</h2>' +
      '<p class="hz-info">Értékelés: minden jó helyre kerülő szám 1-1 pont. Összesen 10 pont.</p>' +
      '<p style="font-size:14px;color:#94a3b8">Húzd a számkártyákat a halmazábra megfelelő részébe. A kártyákat a lezárásig szabadon mozgathatod, a halmazábrán kívülre húzott kártya visszakerül a tálcára.</p>' +
      '<div class="hz-wrap" data-hz="wrap"><div class="hz-board" data-hz="board" style="width:' + W + 'px;height:' + BH + 'px">' + svgEl +
      '<div class="hz-tray" style="top:' + TRAY_Y + 'px;height:' + (BH - TRAY_Y) + 'px"></div></div></div>' +
      '<div class="hz-msg" data-hz="msg" role="status" aria-live="polite"></div>' +
      '<div class="hz-gombok"><button type="button" class="hz-gomb kek" data-hz="ellenorzes">Ellenőrzés</button>' +
      '<button type="button" class="hz-gomb szurke" data-hz="ujra">Újra</button>' +
      '<button type="button" class="hz-gomb" data-hz="ertekeles">Értékelés</button></div></div>';

    const $ = function (n) { return host.querySelector('[data-hz="' + n + '"]'); };
    const wrap = $('wrap'), board = $('board'), msg = $('msg');
    const kartyaEl = {};

    /* ----- kártyák ----- */
    KARTYAK.forEach(function (k, i) {
      const el = document.createElement('div');
      el.className = 'hz-card' + (k.kif.indexOf('/') >= 0 ? ' frac' : '');
      el.setAttribute('role', 'img'); el.setAttribute('aria-label', k.kif + ' számkártya');
      el.style.width = CW + 'px'; el.style.height = CH + 'px';
      el.innerHTML = M.toHTML(M.parse(k.kif));                    // a kártyákon mindig a HTML/CSS-es tört: egyenletes méret, régi böngészőben is jó
      el.dataset.id = k.id;
      board.appendChild(el); kartyaEl[k.id] = el;
      tegyHelyre(k.id, otthon(i), false);
      el.addEventListener('pointerdown', function (e) { lefog(e, k); });
    });
    function tegyHelyre(id, p, anim) {
      const el = kartyaEl[id];
      if (!anim) { el.style.transition = 'none'; }
      el.style.left = (p.x - CW / 2) + 'px'; el.style.top = (p.y - CH / 2) + 'px';
      if (!anim) { void el.offsetWidth; el.style.transition = ''; }
    }

    /* ----- méretezés: keskeny képernyőn kisebbre veszi a táblát ----- */
    let sk = 1;
    function meretez() {
      sk = Math.max(0.6, Math.min(1, wrap.clientWidth / W));
      board.style.transform = 'scale(' + sk + ')';
      wrap.style.height = (BH * sk) + 'px';
    }
    meretez();
    const onResize = function () { meretez(); };
    window.addEventListener('resize', onResize);
    const tervPont = function (e) { const r = board.getBoundingClientRect(), s = r.width / W; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; };

    /* ----- húzás (egér, érintés, toll: pointer események) ----- */
    let drag = null;
    function felszabadit(id) {
      const h = allapot.hely[id];
      if (h) { delete foglalt[h.zona + ':' + h.i]; delete allapot.hely[id]; }
      allapot.elhelyezes[id] = null;
    }
    function lefog(e, k) {
      if (allapot.zarolt || allapot.vege || (e.button !== undefined && e.button !== 0)) return;
      e.preventDefault();
      const el = kartyaEl[k.id], p = tervPont(e);
      drag = { id: k.id, el: el, dx: p.x - (parseFloat(el.style.left) + CW / 2), dy: p.y - (parseFloat(el.style.top) + CH / 2), pid: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch (x) { /* nem kritikus */ }
      felszabadit(k.id);
      el.classList.add('drag');
      el.addEventListener('pointermove', mozog); el.addEventListener('pointerup', elenged); el.addEventListener('pointercancel', elenged);
    }
    function mozog(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const p = tervPont(e);
      drag.el.style.left = (p.x - drag.dx - CW / 2) + 'px'; drag.el.style.top = (p.y - drag.dy - CH / 2) + 'px';
    }
    function elenged(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag; drag = null;
      d.el.classList.remove('drag');
      d.el.removeEventListener('pointermove', mozog); d.el.removeEventListener('pointerup', elenged); d.el.removeEventListener('pointercancel', elenged);
      try { d.el.releasePointerCapture(e.pointerId); } catch (x) { /* nem kritikus */ }
      const cx = parseFloat(d.el.style.left) + CW / 2, cy = parseFloat(d.el.style.top) + CH / 2;
      lerak(d.id, cx, cy);
      torolUzenet();
    }
    /** A kártya az elengedés helye szerinti részbe kerül a legközelebbi szabad helyre; kívül: vissza a tálcára. */
    function lerak(id, cx, cy) {
      const z = cy < H ? zonaAt(cx, cy) : null;
      if (!z) { tegyHelyre(id, otthon(KARTYAK.findIndex(function (k) { return k.id === id; })), true); return; }
      const lista = helyek()[z];
      let legjobb = -1, tav = Infinity, tavFoglalt = -1, tavF = Infinity;
      lista.forEach(function (h, i) {
        const t = Math.pow(h.x - cx, 2) + Math.pow(h.y - cy, 2);
        if (!foglalt[z + ':' + i]) { if (t < tav) { tav = t; legjobb = i; } } else if (t < tavF) { tavF = t; tavFoglalt = i; }
      });
      let p;
      if (legjobb >= 0) { foglalt[z + ':' + legjobb] = id; allapot.hely[id] = { zona: z, i: legjobb }; p = lista[legjobb]; }
      else {                                                       // betelt a rész: a legközelebbi hely fölé, kissé eltolva
        const h = lista[tavFoglalt >= 0 ? tavFoglalt : 0] || { x: cx, y: cy };
        p = { x: h.x + 8, y: h.y + 8 };
      }
      allapot.elhelyezes[id] = z;
      tegyHelyre(id, p, true);
    }

    /* ----- gombok ----- */
    function uzenet(szoveg, osztaly) { msg.textContent = szoveg; msg.className = 'hz-msg' + (osztaly ? ' ' + osztaly : ''); }
    function torolUzenet() { uzenet('', ''); }
    function rogzit(be) {
      allapot.zarolt = be;
      Object.keys(kartyaEl).forEach(function (id) { kartyaEl[id].classList.toggle('rogzitett', be); });
      $('ellenorzes').disabled = be;
    }
    $('ellenorzes').addEventListener('click', function () {
      if (allapot.zarolt || allapot.vege) return;
      allapot.ellenorzesek++;
      if (pontoz(allapot.elhelyezes).helyes) {
        rogzit(true);
        uzenet('✔ Helyes! Minden szám a helyén van. Az elért pontszámot az Értékelés gombbal nézheted meg.', 'ok');
      } else {
        uzenet('✘ Még nem helyes. Próbáld újra!', 'nem');           // szándékosan nem mutatja, melyik kártya rossz
      }
    });
    $('ujra').addEventListener('click', function () {
      if (allapot.vege) return;
      allapot.ujra++;
      Object.keys(foglalt).forEach(function (k) { delete foglalt[k]; });
      allapot.hely = {};
      KARTYAK.forEach(function (k, i) { allapot.elhelyezes[k.id] = null; tegyHelyre(k.id, otthon(i), true); });
      rogzit(false); torolUzenet();
    });
    $('ertekeles').addEventListener('click', async function () {
      if (allapot.vege) return;
      const igen = await api.megerosit({
        cim: 'Értékelés', uzenet: 'Biztosan befejezed a feladatot? Az értékelés után a lap bezárul.', igen: 'Igen, értékelem', nem: 'Még nem',
      });
      if (!igen || allapot.vege) return;
      const e = lezarEredmeny('ertekeles');
      eredmenyNezet(e);
    });

    /* ----- eredmény ----- */
    function lezarEredmeny(ok) {
      if (!allapot.vege) { allapot.vege = true; rogzit(true); window.removeEventListener('resize', onResize); }
      const p = pontoz(allapot.elhelyezes);
      return {
        feladat: 'halmazabra', cim: 'Halmazábra', pont: p.pont, max: p.max, helyes: p.helyes,
        ellenorzesek: allapot.ellenorzesek, ujra: allapot.ujra, lezaras: ok, mp: Math.round((Date.now() - allapot.start) / 1000),
        reszek: p.reszek, elhelyezes: Object.assign({}, allapot.elhelyezes),
      };
    }
    function eredmenyNezet(e) {
      const KOZEP = { R: { x: R.cx, y: 78 }, E: { x: 168, y: 256 }, EN: { x: 350, y: 256 }, N: { x: 532, y: 256 } };   // a pontok helye (a pontozási ábra szerint)
      const pontok = e.reszek.map(function (r) {
        const k = KOZEP[r.kod];
        return '<text x="' + k.x + '" y="' + k.y + '" text-anchor="middle" font-size="24" font-weight="800" font-family="system-ui,sans-serif" fill="' +
          (r.pont === r.max ? '#34d399' : '#f87171') + '">' + r.pont + ' pont</text>';
      }).join('');
      host.innerHTML = '<div class="hz"><h2>Értékelés</h2>' +
        '<div class="hz-pont">Elért pontszám: ' + e.pont + ' / ' + e.max + '</div>' +
        '<div style="max-width:560px;margin:0 auto 12px">' + svgEl.replace('class="hz-svg" width="' + W + '" height="' + H + '"', 'style="width:100%;height:auto;display:block"').replace('</svg>', pontok + '</svg>') + '</div>' +
        '<p style="text-align:center;font-size:14px;color:#94a3b8">Minden jó helyre kerülő szám 1 pontot ér. A halmazábra egyes részeinél a bennük jó helyen álló számok pontjai látszanak.</p>' +
        '<div class="hz-gombok" style="justify-content:center"><button type="button" class="hz-gomb" data-hz="bezar">Bezárás</button></div></div>';
      const b = host.querySelector('[data-hz="bezar"]');
      b.addEventListener('click', function () { api.kesz(e); });
      b.focus();
    }

    return { lezar: function (ok) { return lezarEredmeny(ok || 'lezaras'); } };
  }

  window.UJITAS_FELADATOK = window.UJITAS_FELADATOK || {};
  window.UJITAS_FELADATOK.halmazabra = {
    cim: 'Halmazábra', max: KARTYAK.length, indit: indit,
    _teszt: { kartyak: KARTYAK, zonaAt: zonaAt, helyek: helyek, pontoz: pontoz, otthon: otthon, meretek: { W: W, H: H, CW: CW, CH: CH, BH: BH } },   // csak a teszteléshez
  };
})();
