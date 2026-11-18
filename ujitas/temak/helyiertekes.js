/**
 * temak/helyiertekes.js – 8. osztály, Helyiértékes feladatok (házi feladat) téma-modul
 * Betöltés: window.UJITAS_CFG.tema = ['helyiertekes']  (a kozos/v1/betolto.js tölti be)
 * Az azonosítást (kód), a védelmet és a küldést a közös modulok végzik.
 */
(function () {
  'use strict';
  var U = window.UJITAS;
  if (!U) { console.error('UJITAS hiányzik'); return; }
  var cfg = U.cfg || {};
  var $ = function (id) { return document.getElementById(id); };

  U.css('hh-css', `
  /* Csak a védelemhez és a lapfülekhez szükséges kiegészítések */
  #app, .modal-body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
  input, textarea { -webkit-user-select: text; user-select: text; }
  .btn-plain { border: 0; cursor: pointer; font-size: 14px; font-family: inherit; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  .row .input-group { flex: 1 1 200px; margin: 0; }
  .eredmeny { margin-top: 10px; font-weight: 600; min-height: 1.2em; }
  .ok { color: #10b981; } .rossz { color: #ef4444; } .info { color: #f59e0b; }
  .tabs { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
  .tabs .btn-back { opacity: .6; }
  .tabs .btn-back.on { opacity: 1; }
  .modal-content { max-width: 650px; text-align: left; }
  .modal-body p, .modal-body li { line-height: 1.6; }
  .modal-body table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 14px; }
  .modal-body th, .modal-body td { border: 1px solid #334155; padding: 5px 8px; text-align: center; }
  .modal-body th { background: #0f172a; }
  .modal-body tr.jo td { background: rgba(16,185,129,.2); font-weight: 700; }
  .modal-body .keret { background: #0f172a; border-left: 4px solid #f59e0b; padding: 8px 12px; border-radius: 0 8px 8px 0; margin: 10px 0; }
  .nowrap { white-space: nowrap; }
  .modal-body table.lepes { width: auto; margin: 10px 0; }
  .modal-body table.lepes td { border: 0; text-align: left; padding: 6px 0; vertical-align: middle; }
  .modal-body table.lepes td.eq { padding-right: 22px; white-space: nowrap; font-size: 1.02em; }
  .modal-body table.lepes td.mv { border-left: 2px solid #475569; padding-left: 14px; color: #94a3b8; font-size: .9em; white-space: nowrap; }
`);

  var HTML = `
  <header>
    <a class="btn-back" id="visszaGomb" href="/ujitas/osztaly/8/index.html">← Vissza</a>
    <span id="felhasznalo" style="color:#94a3b8; font-size:.9rem;"></span>
    <button class="btn-felveteli" id="ertekelesGomb">📧 Értékelés és eredmény küldése</button>
  </header>
  <div class="layout">
    <div class="main-content">
      <h2 class="date-title">📐 Helyiértékes feladatok – házi feladat</h2>
      <div class="modal-info-text" id="lezartSav" style="display:none; border-left-color:#ef4444;"></div>
      <div class="modal-info-text">
        <strong>Tájékoztató:</strong> Minden feladat alatt van egy gomb, amely lebegő ablakban megnyitja a feladatot. Ott beírhatod a választ, és az <b>Ellenőrzés</b> gombbal ellenőrizheted. A <b>Megoldás módja</b> gombbal megnézheted a levezetést (helyiértékes felbontás és egyenlet, illetve próbálgatás) – de ha a saját megoldásod előtt nézed meg, arra a feladatra nem jár pont.<br>
        <strong>Pontozás:</strong> elsőre jó = 2 pont, később jó = 1 pont, megoldás megnézése után = 0 pont.<br>
        <strong>Beadás:</strong> amikor mind az 5 feladatot megoldottad, az eredményed automatikusan, egyben elküldjük a tanárnak. Az <b>Értékelés és eredmény küldése</b> gombbal korábban is beadhatod, de akkor a feladatsor lezárul. Ha elhagyod a lapot, a feladatsor szintén lezárul, és az addigi pontjaid elmennek. <b>Az első beküldésed számít</b>, a további alkalmak csak gyakorlásnak minősülnek.
      </div>
      <div class="task-grid" id="feladatok"></div>
    </div>
  </div>

  <div class="modal-overlay" id="feladatModal">
    <div class="modal-content">
      <button class="modal-close" data-close="feladatModal">×</button>
      <h3 class="modal-title" id="feladatCim" style="font-size:20px;"></h3>
      <p id="feladatSzoveg" style="line-height:1.6;"></p>
      <div class="row"><div class="input-group"><input type="text" inputmode="numeric" id="valasz" placeholder="A válaszod" autocomplete="off"></div>
        <button class="btn-back btn-plain" id="ellGomb">✔ Ellenőrzés</button>
        <button class="btn-back btn-plain" style="background:#f59e0b;" id="megoldGomb">💡 Megoldás módja</button></div>
      <div class="eredmeny" id="eredmeny"></div>
    </div>
  </div>

  <div class="modal-overlay" id="megoldasModal">
    <div class="modal-content">
      <button class="modal-close" data-close="megoldasModal">×</button>
      <h3 class="modal-title" id="megoldasCim" style="font-size:20px;"></h3>
      <div class="tabs">
        <button class="btn-back btn-plain on" data-tab="0">1. Helyiértékes felbontás és egyenlet</button>
        <button class="btn-back btn-plain" data-tab="1">2. Próbálgatás</button>
      </div>
      <div class="modal-body">
        <div class="modal-step active" id="tab0"></div>
        <div class="modal-step" id="tab1"></div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="ertekelesModal">
    <div class="modal-content">
      <button class="modal-close" data-close="ertekelesModal">×</button>
      <div class="modal-icon">📊</div>
      <h3 class="modal-title">Értékelés</h3>
      <div class="modal-body" id="ertekelesTartalom"></div>
      <div class="eredmeny" id="kuldesAllapot"></div>
      <button class="modal-submit-btn" id="kuldesGomb" style="display:none;">🔁 Küldés újra</button>
    </div>
  </div>
`;

  /** Egyenlet-lépések egymás alatt: bal oszlop az egyenlet, jobb oszlop (függőleges vonal után) a végzett művelet. */
  function L(sorok) {
    return '<div style="overflow-x:auto"><table class="lepes">' + sorok.map(function (r) {
      return '<tr><td class="eq">' + r[0] + '</td><td class="mv">' + (r[1] || '') + '</td></tr>';
    }).join('') + '</table></div>';
  }

  var F = [
    { id: 'a', rovid: 'a) kétjegyű szám, első jegy = 1,5 × második, különbség 18', helyes: [64], tobb: false,
      szoveg: 'Egy kétjegyű szám első számjegye 1,5-szerese a másodiknak. Ha ebből a számból kivonjuk a számjegyei felcserélésével kapott számot, akkor 18-at kapunk. Mi volt az eredeti szám?',
      egyenlet:
        '<p>1. feltétel: a második számjegy <b>x</b>, az első számjegy <b>1,5x</b>.</p>' +
        '<p>2. feltétel: a szám és a számjegyei felcserélésével kapott szám különbsége 18.</p>' +
        L([
          ['(10 · 1,5x + x) − (10x + 1,5x) = 18', 'helyiértékes felbontás'],
          ['15x + x − 10x − 1,5x = 18', 'zárójelbontás, szorzás'],
          ['4,5x = 18', 'összevonás'],
          ['<b>x = 4</b>', ': 4,5']
        ]) +
        '<p>A második számjegy <b>4</b>, az első 1,5 · 4 = <b>6</b>.</p>' +
        '<div class="keret">Az eredeti szám: <b>64</b>. Ellenőrzés: 64 − 46 = 18 ✓</div>',
      proba:
        '<p>Az első számjegy (a tízesek száma) a második számjegy (az egyesek száma) 1,5-szerese, ezért a második számjegy páros kell legyen (különben nem egész az első). A számjegyeket úgy írtam, ahogy a számban állnak: elöl a tízes, utána az egyes.</p>' +
        '<table>' +
        '<tr><th colspan="3">EREDETI</th><th colspan="3" style="border-left:3px double #94a3b8">FELCSERÉLT</th><th rowspan="2" style="border-left:3px double #94a3b8">KÜLÖNBSÉG</th></tr>' +
        '<tr><th>első</th><th>második</th><th>szám</th><th style="border-left:3px double #94a3b8">első</th><th>második</th><th>szám</th></tr>' +
        '<tr><td>3</td><td>2</td><td><b>32</b></td><td style="border-left:3px double #94a3b8">2</td><td>3</td><td><b>23</b></td><td style="border-left:3px double #94a3b8">32 − 23 = 9</td></tr>' +
        '<tr class="jo"><td>6</td><td>4</td><td><b>64</b></td><td style="border-left:3px double #94a3b8">4</td><td>6</td><td><b>46</b></td><td style="border-left:3px double #94a3b8"><span style="color:#f87171">64 − 46 = 18</span></td></tr>' +
        '<tr><td>9</td><td>6</td><td><b>96</b></td><td style="border-left:3px double #94a3b8">6</td><td>9</td><td><b>69</b></td><td style="border-left:3px double #94a3b8">96 − 69 = 27</td></tr></table>' +
        '<div class="keret">Az eredeti szám: <b>64</b></div>' },

    { id: 'b', rovid: 'b) kétjegyű szám, számjegyösszeg 15, összeg 165', helyes: [69, 78, 87, 96], tobb: true,
      szoveg: 'Egy kétjegyű szám számjegyeinek összege 15. A szám és a számjegyeinek felcserélésével kapott szám összege 165. Melyik ez a szám? (Írd be az összes megfelelő számot, szóközzel vagy vesszővel elválasztva.)',
      egyenlet:
        '<p>1. feltétel: az első számjegy <b>x</b>, a második számjegy <b>15 − x</b> (mert a számjegyek összege 15).</p>' +
        '<p>2. feltétel: a szám és a számjegyei felcserélésével kapott szám összege 165.</p>' +
        L([
          ['(10x + 15 − x) + (10 · (15 − x) + x) = 165', 'helyiértékes felbontás'],
          ['10x + 15 − x + 150 − 10x + x = 165', 'zárójelbontás, szorzás'],
          ['165 = 165', 'összevonás']
        ]) +
        '<p>Az egyenlet <b>minden</b> x-re igaz (azonosság), vagyis a második feltétel nem szűkít tovább. Csak az kell, hogy x és 15 − x is számjegy legyen: 15 − x ≤ 9, tehát x ≥ 6, és x ≤ 9.</p>' +
        '<p>x = 6, 7, 8, 9 → 69 · 78 · 87 · 96</p>' +
        '<div class="keret">Négy megoldás van: <b>69, 78, 87, 96</b>. Ellenőrzés pl.: 69 + 96 = 165 ✓, 78 + 87 = 165 ✓</div>',
      proba:
        '<p>Azokat a számokat keressük, amelyeknél a két számjegy összege 15 (a számjegyek legfeljebb 9-esek).</p>' +
        '<table><tr><th>Szám</th><th>Felcserélt</th><th>Összeg</th><th></th></tr>' +
        '<tr class="jo"><td>69</td><td>96</td><td>165</td><td>✓</td></tr>' +
        '<tr class="jo"><td>78</td><td>87</td><td>165</td><td>✓</td></tr>' +
        '<tr class="jo"><td>87</td><td>78</td><td>165</td><td>✓</td></tr>' +
        '<tr class="jo"><td>96</td><td>69</td><td>165</td><td>✓</td></tr></table>' +
        '<div class="keret">Mind a négy szám jó: <b>69, 78, 87, 96</b>. A számjegyösszeg 15 miatt az összeg mindig 11·15 = 165.</div>' },

    { id: 'c', rovid: 'c) kétjegyű szám, első = fele a másodiknak, (+1) és (+2) összege 60', helyes: [24], tobb: false,
      szoveg: 'Egy kétjegyű szám első számjegye fele a második számjegyének. Ha az első számjegyhez 1-et, a másodikhoz 2-t adunk, és a két számot összeadjuk, akkor 60-at kapunk. Mi volt az eredeti szám?',
      egyenlet:
        '<p>1. feltétel: az első számjegy <b>x</b>, a második számjegy <b>2x</b> (az első a második fele).</p>' +
        '<p>2. feltétel: az első számjegyhez 1-et adva a szám 10(x + 1) + 2x, a másodikhoz 2-t adva 10x + (2x + 2). Az összegük 60.</p>' +
        L([
          ['(10(x + 1) + 2x) + (10x + 2x + 2) = 60', 'helyiértékes felbontás'],
          ['10x + 10 + 2x + 10x + 2x + 2 = 60', 'zárójelbontás'],
          ['24x + 12 = 60', 'összevonás'],
          ['24x = 48', '− 12'],
          ['<b>x = 2</b>', ': 24']
        ]) +
        '<p>Az első számjegy <b>2</b>, a második 2 · 2 = <b>4</b>.</p>' +
        '<div class="keret">Az eredeti szám: <b>24</b>. Ellenőrzés: 34 + 26 = 60 ✓</div>',
      proba:
        '<p>A második számjegy az első kétszerese: (1;2), (2;4), (3;6), (4;8).</p>' +
        '<table><tr><th>Szám</th><th>Első +1</th><th>Második +2</th><th>Összeg</th><th></th></tr>' +
        '<tr><td>12</td><td>22</td><td>14</td><td>36</td><td>✗</td></tr>' +
        '<tr class="jo"><td>24</td><td>34</td><td>26</td><td>60</td><td>✓</td></tr>' +
        '<tr><td>36</td><td>46</td><td>38</td><td>84</td><td>✗</td></tr>' +
        '<tr><td>48</td><td>58</td><td>50</td><td>108</td><td>✗</td></tr></table>' +
        '<div class="keret">Az eredeti szám: <b>24</b></div>' },

    { id: 'd', rovid: 'd) háromjegyű szám, középső 5, felcserélt összeg 807', helyes: [453], tobb: false,
      szoveg: 'Egy háromjegyű szám középső számjegye 5, az első számjegye 1-gyel nagyobb az utolsó számjegyénél. Ha ezt a számot és az első és utolsó számjegy felcserélésével kapott számot összeadjuk, akkor 807-et kapunk. Mi volt az eredeti szám?',
      egyenlet:
        '<p>1. feltétel: az utolsó számjegy <b>x</b>, az első számjegy <b>x + 1</b>, a középső 5.</p>' +
        '<p>2. feltétel: a szám 100(x + 1) + 50 + x, az első és utolsó számjegy felcserélésével kapott szám 100x + 50 + (x + 1). Az összegük 807.</p>' +
        L([
          ['(100(x + 1) + 50 + x) + (100x + 50 + x + 1) = 807', 'helyiértékes felbontás'],
          ['100x + 100 + 50 + x + 100x + 50 + x + 1 = 807', 'zárójelbontás'],
          ['202x + 201 = 807', 'összevonás'],
          ['202x = 606', '− 201'],
          ['<b>x = 3</b>', ': 202']
        ]) +
        '<p>Az utolsó számjegy <b>3</b>, az első 3 + 1 = <b>4</b>.</p>' +
        '<div class="keret">Az eredeti szám: <b>453</b>. Ellenőrzés: 453 + 354 = 807 ✓</div>',
      proba:
        '<p>Az első számjegy 1-gyel nagyobb az utolsónál, a középső 5: 1_0, 2_1, 3_2, … alakú számok.</p>' +
        '<table><tr><th>Szám</th><th>Felcserélt</th><th>Összeg</th><th></th></tr>' +
        '<tr><td>150</td><td>051 = 51</td><td>201</td><td>✗</td></tr>' +
        '<tr><td>251</td><td>152</td><td>403</td><td>✗</td></tr>' +
        '<tr><td>352</td><td>253</td><td>605</td><td>✗</td></tr>' +
        '<tr class="jo"><td>453</td><td>354</td><td>807</td><td>✓</td></tr></table>' +
        '<div class="keret">Az eredeti szám: <b>453</b> (az összeg minden lépésben 202-vel nő, ezért 807-nél meg lehet állni).</div>' },

    { id: 'e', rovid: 'e) háromjegyű szám, utolsó jegy előre → +171', helyes: [254], tobb: false,
      szoveg: 'Egy háromjegyű szám második számjegye 3-mal nagyobb az elsőnél, az utolsó számjegye 2-szerese az elsőnek. Ha ennek a számnak az utolsó számjegyét az első helyre tesszük, akkor az eredetinél 171-gyel nagyobb számot kapunk. Mi volt az eredeti szám?',
      egyenlet:
        '<p>1. feltétel: az első számjegy <b>x</b>, a második <b>x + 3</b>, a harmadik <b>2x</b>.</p>' +
        '<p>2. feltétel: az eredeti szám 100x + 10(x + 3) + 2x. Ha az utolsó számjegyet előre tesszük: 100 · 2x + 10x + (x + 3). Ez 171-gyel nagyobb az eredetinél.</p>' +
        L([
          ['200x + 10x + x + 3 = 100x + 10(x + 3) + 2x + 171', 'helyiértékes felbontás'],
          ['200x + 10x + x + 3 = 100x + 10x + 30 + 2x + 171', 'zárójelbontás'],
          ['211x + 3 = 112x + 201', 'összevonás'],
          ['99x + 3 = 201', '− 112x'],
          ['99x = 198', '− 3'],
          ['<b>x = 2</b>', ': 99']
        ]) +
        '<p>Az első számjegy <b>2</b>, a második 2 + 3 = <b>5</b>, a harmadik 2 · 2 = <b>4</b>.</p>' +
        '<div class="keret">Az eredeti szám: <b>254</b>. Ellenőrzés: 425 − 254 = 171 ✓</div>',
      proba:
        '<p>Az első számjegy a, a második a + 3, a harmadik 2a. Mivel 2a ≤ 9, így a legfeljebb 4.</p>' +
        '<table><tr><th>a</th><th>Szám</th><th>Utolsó előre</th><th>Különbség</th><th></th></tr>' +
        '<tr><td>1</td><td>142</td><td>214</td><td>72</td><td>✗</td></tr>' +
        '<tr class="jo"><td>2</td><td>254</td><td>425</td><td>171</td><td>✓</td></tr>' +
        '<tr><td>3</td><td>366</td><td>636</td><td>270</td><td>✗</td></tr>' +
        '<tr><td>4</td><td>478</td><td>847</td><td>369</td><td>✗</td></tr></table>' +
        '<div class="keret">Az eredeti szám: <b>254</b></div>' }
  ];


  /* ================= ÁLLAPOT ================= */
  var S = { akt: null, t0: 0, start: null, lezarva: false, befejezes: false, kuldesFolyik: false, elkuldve: false, reason: '', log: {} };
  F.forEach(function (f) { S.log[f.id] = { proba: 0, probak: [], mp: 0, jo: false, pont: 0, megnezte: false, valasz: '' }; });
  function F_(id) { return F.filter(function (x) { return x.id === id; })[0]; }
  function nyit(id) { $(id).style.display = 'flex'; }
  function zar(id) { $(id).style.display = 'none'; }
  function szamok(s) { return (s.match(/\d+/g) || []).map(Number); }

  /* ================= FELADATOK ================= */
  function renderFeladatok() {
    var h = '';
    F.forEach(function (f) {
      h += '<div class="task-card card-hazi" id="k_' + f.id + '">' +
        '<h4>📐 ' + f.id + ') feladat</h4>' +
        '<div class="card-preview" style="white-space:normal;">' + f.szoveg + '</div>' +
        '<div class="eredmeny" id="s_' + f.id + '"></div>' +
        '<button class="btn-back btn-plain" data-nyit="' + f.id + '">✏️ Megoldom</button></div>';
    });
    $('feladatok').innerHTML = h;
  }
  function kartya(id) {
    var L = S.log[id], e = $('s_' + id);
    if (L.jo) { e.className = 'eredmeny ok'; e.textContent = '✅ Megoldva (' + L.pont + ' pont)'; }
    else if (L.proba) { e.className = 'eredmeny rossz'; e.textContent = 'Még nem jó (' + L.proba + ' próba)'; }
  }
  function feladatNyit(id) {
    var f = F_(id), L = S.log[id]; S.akt = id;
    $('feladatCim').textContent = id + ') feladat';
    $('feladatSzoveg').textContent = f.szoveg;
    var inp = $('valasz'); inp.value = L.valasz || ''; inp.disabled = L.jo || S.lezarva;
    var e = $('eredmeny'); e.className = 'eredmeny'; e.textContent = L.jo ? '✅ Megoldva (' + L.pont + ' pont)' : '';
    nyit('feladatModal'); S.t0 = Date.now();
  }
  function feladatZar() {
    if (S.akt && S.t0) S.log[S.akt].mp += Math.round((Date.now() - S.t0) / 1000);
    S.t0 = 0;
  }
  function bezar(id) { if (id === 'feladatModal') feladatZar(); zar(id); }
  function ellenoriz() {
    if (S.lezarva) return;
    var id = S.akt, f = F_(id), L = S.log[id];
    var inp = $('valasz'), e = $('eredmeny'), raw = inp.value.trim();
    if (!raw) { e.className = 'eredmeny info'; e.textContent = 'Írj be egy választ!'; return; }
    if (L.jo) { e.className = 'eredmeny ok'; e.textContent = 'Ezt már megoldottad.'; return; }
    L.proba++; L.valasz = raw; L.probak.push(raw);
    var be = szamok(raw), ok;
    if (f.tobb) {
      var egyedi = be.filter(function (v, i) { return be.indexOf(v) === i; });
      ok = egyedi.length === f.helyes.length && f.helyes.every(function (h) { return egyedi.indexOf(h) > -1; });
      if (!ok && egyedi.length && egyedi.every(function (v) { return f.helyes.indexOf(v) > -1; })) {
        e.className = 'eredmeny info'; e.textContent = 'Ami itt van, az jó – de van még több megoldás is! Keresd meg az összeset.'; kartya(id); return;
      }
    } else {
      ok = be.length === 1 && be[0] === f.helyes[0];
    }
    if (ok) {
      L.jo = true; L.pont = L.megnezte ? 0 : (L.proba === 1 ? 2 : 1);
      e.className = 'eredmeny ok';
      e.textContent = '✅ Helyes! ' + (L.megnezte ? '(a megoldás megnézése miatt 0 pont)' : '(' + L.pont + ' pont)');
      inp.disabled = true;
    } else {
      e.className = 'eredmeny rossz'; e.textContent = '❌ Ez nem jó, próbáld újra! (' + L.proba + '. próbálkozás)';
    }
    kartya(id);
    if (L.jo && F.every(function (x) { return S.log[x.id].jo; })) befejez();
  }

  /* ================= MEGOLDÁS MODAL ================= */
  function megold(id) {
    var f = F_(id), L = S.log[id];
    if (!L.jo && !L.megnezte) {
      if (!confirm('Ha megnézed a megoldást, erre a feladatra nem kapsz pontot. Megnézed?')) return;
      L.megnezte = true;
    }
    $('megoldasCim').textContent = id + ') feladat – megoldás módja';
    $('tab0').innerHTML = f.egyenlet; $('tab1').innerHTML = f.proba;
    tab(0); nyit('megoldasModal');
  }
  function tab(n) {
    [0, 1].forEach(function (i) { $('tab' + i).classList.toggle('active', i === n); });
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-tab') === n); });
  }

  /* ================= ÉRTÉKELÉS ÉS KÜLDÉS ================= */
  function osszegzes() {
    var ossz = 0, max = F.length * 2, sorok = [];
    F.forEach(function (f) {
      var L = S.log[f.id]; ossz += L.pont;
      sorok.push({ feladat: f.id, allapot: L.jo ? 'megoldva' : 'nincs megoldva', pont: L.pont, proba: L.proba, megoldastMegnezte: L.megnezte });
    });
    var szazalek = Math.round(ossz / max * 100);
    var jegy = szazalek >= 90 ? 5 : szazalek >= 75 ? 4 : szazalek >= 55 ? 3 : szazalek >= 40 ? 2 : 1;
    return { ossz: ossz, max: max, szazalek: szazalek, jegy: jegy, sorok: sorok };
  }
  function sima(h) {   // HTML → egyszerű szöveg sorokban (a „helyes megoldásmenet” oszlophoz)
    return h.replace(/<br\s*\/?>/g, '\n').replace(/<\/td>/g, ' | ').replace(/<\/(p|div|tr)>/g, '\n').replace(/<[^>]+>/g, '')
      .split('\n').map(function (x) { return x.replace(/(\s*\|\s*)+$/, '').trim(); }).filter(Boolean);
  }
  function mpOf(id) { return S.log[id].mp + (S.akt === id && S.t0 ? Math.round((Date.now() - S.t0) / 1000) : 0); }

  /** A kuldes.js / Apps Script szerződése: score, total, grade, reason ('befejezve' | 'lapvaltas'), tasks[] */
  function payload(ok) {
    var r = osszegzes();
    return {
      setId: cfg.setId || 'helyiertekes',
      score: r.ossz, total: r.max,
      grade: 'Jegy: ' + r.jegy + ' (' + r.szazalek + '%)',
      reason: ok,
      tasks: F.map(function (f) {
        var L = S.log[f.id];
        return {
          expression: f.rovid, correct: L.jo,
          finalAnswer: L.valasz, correctAnswer: f.helyes.join(', '),
          seconds: mpOf(f.id), stepErrors: '',
          studentLines: L.probak.map(function (v, i) { return (i + 1) + '. próba: ' + v; }),
          correctLines: sima(f.egyenlet),
          feedback: ['Próbálkozások száma: ' + L.proba, 'Megoldás megnézve: ' + (L.megnezte ? 'igen' : 'nem'), 'Pont: ' + L.pont + ' / 2']
        };
      })
    };
  }
  function osszesites() {
    var r = osszegzes();
    var h = '<table><tr><th>Feladat</th><th>Állapot</th><th>Próbák</th><th>Megoldást megnézte</th><th>Pont</th></tr>';
    r.sorok.forEach(function (s) {
      h += '<tr><td>' + s.feladat + ')</td><td>' + s.allapot + '</td><td>' + s.proba + '</td><td>' + (s.megoldastMegnezte ? 'igen' : 'nem') + '</td><td>' + s.pont + '</td></tr>';
    });
    h += '</table><p><b>Összesen: ' + r.ossz + ' / ' + r.max + ' pont (' + r.szazalek + '%) – javasolt jegy: ' + r.jegy + '</b></p>';
    $('ertekelesTartalom').innerHTML = h;
    nyit('ertekelesModal');
  }
  function allapot(cls, txt) { var a = $('kuldesAllapot'); a.className = 'eredmeny ' + cls; a.textContent = txt; }

  function lezar(reason) {
    if (S.lezarva) return;
    feladatZar();
    S.lezarva = true; $('valasz').disabled = true;
    var v = $('lezartSav'), jo = reason === 'befejezve';
    v.textContent = jo ? '✅ Minden feladatot megoldottál, a feladatsor lezárult.'
                       : '⚠️ A feladatsor idő előtt lezárult. A jelenlegi pontjaidat elküldtük a tanárnak.';
    v.style.borderLeftColor = jo ? '#10b981' : '#ef4444';
    v.style.display = 'block';
    U.emit('lezarva');
  }

  /** Az egész feladatsor EGYSZERRE megy el (nem feladatonként); az e-mailt a szerver csak az első beküldésnél küldi. */
  async function kuldes(reason) {
    if (S.kuldesFolyik || S.elkuldve) return;
    S.reason = S.reason || reason;
    lezar(S.reason);
    S.kuldesFolyik = true; $('kuldesGomb').style.display = 'none'; allapot('info', 'Küldés…');
    var ok = false;
    try { ok = await U.kuldes(payload(S.reason)); } catch (e) { console.error(e); }
    S.kuldesFolyik = false;
    if (ok === true) { S.elkuldve = true; allapot('ok', '✅ Az eredményed elküldtük. Köszönjük!'); }
    else if (ok === null) { allapot('info', 'Archív módban nincs küldés.'); }
    else { allapot('rossz', '❌ A küldés nem sikerült. Ne zárd be az oldalt, próbáld újra!'); $('kuldesGomb').style.display = ''; }
  }

  /** Az utolsó feladat megoldásakor: rövid várakozás (látszik a „Helyes!”), majd összesítés és automatikus küldés. */
  function befejez() {
    if (S.befejezes) return;
    S.befejezes = true;
    setTimeout(function () { bezar('feladatModal'); osszesites(); kuldes('befejezve'); }, 1200);
  }
  /** A fejléc gombja: korai beadás (a feladatsor lezárul) vagy – lezárás után – az összesítő megnyitása. */
  function kezi() {
    if (S.lezarva) { osszesites(); return; }
    var mind = F.every(function (f) { return S.log[f.id].jo; });
    if (!mind && !confirm('Nem oldottál meg minden feladatot. Ha most beadod, a feladatsor lezárul, és az eddigi pontjaidat küldjük el. Beadod?')) return;
    osszesites(); kuldes(mind ? 'befejezve' : 'lapvaltas');
  }

  /* ================= INDÍTÁS ================= */
  /** A diák neve a fejlécbe (a szerver a kód alapján adja; ha nem érkezik meg, a mező üres marad). */
  function nevBetolt() {
    var url = window.UJITAS_URL;
    if (!url || !U.kod) return;
    try {
      fetch(url + '?akcio=kod&kod=' + encodeURIComponent(U.kod) + '&osztaly=' + encodeURIComponent(cfg.classId || ''), { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.ok === true && d.name) $('felhasznalo').textContent = '👤 ' + d.name; })
        .catch(function () { /* nem kritikus */ });
    } catch (e) { /* nem kritikus */ }
  }

  /** „Mégsem” a kódbekérőn: vissza az előző oldalra (ha az ugyanerről a webhelyről jött), különben az osztályoldalra. */
  function visszaMegy() {
    var ref = document.referrer;
    try { if (ref && new URL(ref).origin === location.origin && ref !== location.href) { location.replace(ref); return; } } catch (e) { /* tovább */ }
    location.replace(cfg.visszaHref || 'index.html');
  }

  function esemenyek() {
    document.addEventListener('click', function (e) {
      var t = e.target; if (!t.getAttribute) return;
      var c = t.getAttribute('data-close');
      if (c) { bezar(c); return; }
      if (t.getAttribute('data-nyit')) feladatNyit(t.getAttribute('data-nyit'));
      if (t.getAttribute('data-tab')) tab(+t.getAttribute('data-tab'));
      if (t.classList && t.classList.contains('modal-overlay') && $('app') && $('app').contains(t)) bezar(t.id);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'valasz') ellenoriz(); });
    $('ellGomb').addEventListener('click', ellenoriz);
    $('megoldGomb').addEventListener('click', function () { megold(S.akt); });
    $('ertekelesGomb').addEventListener('click', kezi);
    $('kuldesGomb').addEventListener('click', function () { kuldes(S.reason || 'befejezve'); });
  }

  (async function () {
    var app = $('app');
    if (!app) { console.error('Hiányzik a #app elem'); return; }
    if (!(await U.run('indulas'))) { visszaMegy(); return; }   // pl. a „Mégsem” gomb: vissza oda, ahonnan nyitották
    app.innerHTML = HTML;
    app.id = 'app';
    $('visszaGomb').href = cfg.visszaHref || 'index.html';
    nevBetolt();
    if (!U.elo) $('ertekelesGomb').style.display = 'none';
    S.start = Date.now();
    renderFeladatok(); esemenyek();
    // A lap elhagyásakor a böngésző elfelejti a kódot (sessionStorage), így legközelebb újra kérni fogja
    var kodTorles = function () { try { sessionStorage.removeItem('ujitas_kod'); sessionStorage.removeItem('ujitas_kod_ok'); } catch (e) { /* nem kritikus */ } };
    window.addEventListener('pagehide', kodTorles);
    window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });   // „vissza” gombbal visszatöltött lap: induljon újra
    U.aktiv = function () { return !S.lezarva; };
    // lapváltás: lezárjuk és elküldjük a jelenlegi pontokat; oldal eltűnésekor csendben, szinkron módon
    U.on('lapvaltas', function () { if (U.elo) kuldes('lapvaltas'); else lezar('lapvaltas'); });
    U.on('kilepes', function () { if (U.elo && !S.elkuldve && !S.kuldesFolyik) U.kuldes(payload(S.reason || 'lapvaltas'), { csendes: true }); });
  })();
})();
