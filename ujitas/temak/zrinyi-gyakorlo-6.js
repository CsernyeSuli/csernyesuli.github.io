/**
 * temak/zrinyi-gyakorlo-6.js – Zrínyi online gyakorló feladatsor (6. osztály, 2026/27, 1. feladatsor)
 *
 * ÚJ FELADATOK: csak a TASKS objektumot bővítsd (feladat száma → { text, options: {A..E}, key, img?, optImgs? }).
 *   - képlet: \\(33\\frac{2}{3}\\)   (a JS szövegben a visszaper duplán)
 *   - ábra: img: 'feladat-22.png'  (az IMG mappából), válaszlehetőség-kép: optImgs: { A: 'x.png' },
 *     megoldás-ábra (a feladat lezárása után látszik): solImg: 'feladat-21-megoldas.png'
 * VART_DB: a sorozat feladatainak száma. Amíg nincs feltöltve mind, a beküldés KI van kapcsolva (próbaváltozat),
 *   így nem kerül félkész eredmény a táblázatba, és nem „fogy el” az 1. beküldés.
 *   (A küldés kipróbálásához VART_DB ideiglenesen átírható a feltöltött feladatok számára.)
 * Értékelés (mint a 7-osztaly-2020-megyei.html-ben): helyes / sikertelen / megoldatlan, feladatonként 5 próba;
 *   a megoldás megmutatása vagy az 5. hibás próba a feladatot sikertelenként zárja. 1 feladat = 1 pont.
 */
(function () {
  'use strict';
  var U = window.UJITAS;
  if (!U) { console.error('UJITAS hiányzik'); return; }
  var cfg = U.cfg || {};
  var $ = function (id) { return document.getElementById(id); };

  var VART_DB = 25, OLDAL = 9, MAXP = 5, IMG = 'img/zrinyi/gyakorlo-2627-6o/', ABC = ['A', 'B', 'C', 'D', 'E'];
  var EGYIK = 'Az előzőek közül egyik sem.';
  /* HALADÁS MENTÉSE (sessionStorage): true → frissítés / lapváltás után a diák folytathatja ott, ahol abbahagyta; a feladatsor csak
   *   a befejezéskor vagy a Beadás gombbal zárul le és megy el. A böngészőlap BEZÁRÁSAKOR a haladás elvész (és nem megy el semmi).
   *   false → a régi viselkedés: a lap elhagyása lezárja a feladatsort és elküldi az addigi eredményt. */
  var FOLYTATHATO = true;

  /* ================= FELADATOK ================= */
  var TASKS = {
    // 1–25.: nincs hivatalos kulcs; a kulcsok számítással ellenőrzöttek:
    //   1: D · 2: D · 3: D · 4: D · 5: D · 6: C · 7: C · 8: B · 9: D · 10: B · 11: B · 12: D · 13: D
    //   14: B · 15: C · 16: B · 17: B · 18: E · 19: D · 20: A · 21: D · 22: C · 23: B · 24: C · 25: A
    1: { text: 'Mennyivel egyenlő 20 százas + 20 tízes?',
         options: { A: '202', B: '220', C: '2020', D: '2200', E: EGYIK }, key: 'D' },
    2: { text: 'Hány milliméter a 2 m 2 cm?',
         options: { A: '22', B: '202', C: '220', D: '2020', E: EGYIK }, key: 'D' },
    3: { text: 'Mennyi a 48 \u2212 18 : 6 + 3 \u00b7 5 műveletsor eredménye?',
         options: { A: '18', B: '30', C: '40', D: '60', E: EGYIK }, key: 'D' },
    4: { text: 'Jóska bácsi téglalap alakú kertjének két szomszédos oldala 18 m és 27 m hosszú. Hány négyzetméter a kert területe?',
         options: { A: '45', B: '90', C: '436', D: '486', E: EGYIK }, key: 'D' },
    5: { text: 'Kati leírta a kétjegyű természetes számokat. Hány számjegyet írt le?',
         options: { A: '90', B: '99', C: '100', D: '180', E: '200' }, key: 'D' },
    6: { text: 'Mennyi a 20,2 : 16 osztás eredménye?',
         options: { A: '0,12625', B: '1,26', C: '1,2625', D: '12,625', E: EGYIK }, key: 'C' },
    7: { text: 'Egy kocka felszíne 210 cm<sup>2</sup>. Hány négyzetcentiméter egy lapjának a területe?',
         options: { A: '21', B: '25', C: '35', D: '52,5', E: '105' }, key: 'C' },
    8: { text: 'Mennyi a \\(3\\frac{7}{12} - 1\\frac{5}{8}\\) kivonás eredménye?',
         options: { A: '\\(1\\frac{13}{24}\\)', B: '\\(1\\frac{23}{24}\\)', C: '\\(2\\frac{1}{24}\\)', D: '\\(2\\frac{1}{2}\\)', E: EGYIK }, key: 'B' },
    // 9.: szándékos megfogalmazás („az 12” = a tucat jelentése: 12 kopasz kukac), nem elírás.
    9: { text: 'Egy tucat kopasz kukac az 12 kopasz kukac. Hány kopasz kukac 10 tucat kopasz kukac?',
         options: { A: '10', B: '12', C: '100', D: '120', E: '144' }, key: 'D' },
    10: { text: 'Egy farsangi álarc készítésének lépései láthatóak az ábrán. Milyen sorrendben készült az álarc?', img: 'feladat-10.png',
          options: { A: 'EACBD', B: 'EABCD', C: 'EABDC', D: 'AEBCD', E: 'DCBEA' }, key: 'B' },
    11: { text: 'Jancsi kerékpáron ment el meglátogatni barátját. Miután megtett 12 km-t, észrevette, hogy elvesztette a pumpáját. Ekkor visszafordult, hogy megkeresse. Pontosan 3 km-t haladt visszafelé, amikor ráakadt a pumpájára. Újból megfordult, és 8 km megtétele után érkezett oda barátjához. Hány kilométert biciklizett volna Jancsi, ha nem veszíti el pumpáját?',
          options: { A: '15', B: '17', C: '20', D: '23', E: '25' }, key: 'B' },
    12: { text: 'A hétfejű sárkányoknak hét fejük és három farkuk, a háromfejű sárkányoknak három fejük és hét farkuk van. Hány farka van összesen három hétfejű és hét háromfejű sárkánynak?',
          options: { A: '30', B: '42', C: '49', D: '58', E: '70' }, key: 'D' },
    13: { text: 'Hány fácán tömegével egyenlő 1 róka tömege, ha 1 nyúl tömege egyenlő 2 fácánéval és 2 róka tömege egyenlő 5 nyúléval?',
          options: { A: '3', B: '\\(3\\frac{1}{2}\\)', C: '4', D: '5', E: '10' }, key: 'D' },
    14: { text: 'Három egymást követő pozitív egész szám közül a legkisebb és a legnagyobb szorzata 99. Melyik a középső szám?',
          options: { A: '9', B: '10', C: '32', D: '33', E: '34' }, key: 'B' },
    15: { text: 'A Szegedet romba döntő 1879-es árvíz 807 cm-rel tetőzött. A múlt században 1970-ben volt legmagasabb a Tisza vízállása Szegednél, ekkor az 1879-es árvízi vízállásnál 154 cm-rel mértek többet. Ezt a vízszintet ebben az évszázadban, a 2006-os árvíz tetőzésekor a Tisza 48 cm-rel meghaladta. Hány centiméterrel volt magasabb a vízállás a 2006-os árvíz idején, mint az 1879-es árvízkor?',
          options: { A: '106', B: '127', C: '202', D: '1009', E: '2012' }, key: 'C' },
    16: { text: 'A triciklin menekülő triciklitolvajokat a rendőrök biciklin üldözik. Összesen tíz keréken gurulnak. Hány triciklit loptak el? (A tricikli a biciklihez hasonló háromkerekű jármű.)',
          options: { A: '1', B: '2', C: '3', D: '4', E: 'Ezekből az adatokból nem lehet meghatározni.' }, key: 'B' },
    17: { text: 'Ali Babától a 40 rabló drágakövekkel teli ládikót zsákmányolt. A rablók közül néhányan elvettek fejenként 1 drágakövet, és ellovagoltak. Az ott maradt rablók fele fejenként 2 drágakövet vett el, a másik felének nem jutott a drágakőből. Hány drágakő volt Ali Baba ládikójában?',
          options: { A: '35', B: '40', C: '50', D: '55', E: '80' }, key: 'B' },
    // 18.: a feladat szövege a PDF-ben teljesen hiányzik; a 7. osztályos gyakorló azonos feladatának szövege (ORSI → ÁGNES).
    18: { text: 'Rovásírással leírva ORSI nevét a <img src="' + IMG + 'feladat-18-jelek.png" alt="jelsorozat" style="height:34px;vertical-align:middle"> jelsorozatot kapjuk.<br>Melyik jelsorozat jelentheti ÁGNES nevét?<br>(A rovásírást jobbról balra kell olvasni, és egy betűnek pontosan egy jel felel meg.)',
          options: { A: '<img src="' + IMG + 'feladat-18-A.png" alt="A jelsorozat" style="height:34px;vertical-align:middle">', B: '<img src="' + IMG + 'feladat-18-B.png" alt="B jelsorozat" style="height:34px;vertical-align:middle">', C: '<img src="' + IMG + 'feladat-18-C.png" alt="C jelsorozat" style="height:34px;vertical-align:middle">', D: '<img src="' + IMG + 'feladat-18-D.png" alt="D jelsorozat" style="height:34px;vertical-align:middle">', E: '<img src="' + IMG + 'feladat-18-E.png" alt="E jelsorozat" style="height:34px;vertical-align:middle">' }, key: 'E' },
    19: { text: 'Egy nagy kockát építünk 25 darab kék és 2 darab piros színű, azonos méretű kis kockából. Mennyi lehet a nagy kocka teljesen kék színű lapjainak száma, ha az a lehető legnagyobb?',
          options: { A: '2', B: '3', C: '4', D: '5', E: '6' }, key: 'D' },
    // 20.: az ábrák újrarajzoltak. Darabok: 14 és 6 kis háromszög területűek, a nagy hatszög 54 → 3·14 + 2·6 → 5 darab (a megoldás ábrája: feladat-20-megoldas.png).
    20: { text: 'Kriszti az ábrán látható nagy hatszöget ollóval feldarabolta a rácsvonalak mentén úgy, hogy a keletkező részek mindegyike egybevágó a két kisebb hatszög valamelyikével:' +
                '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin:10px 0">' +
                '<img src="' + IMG + 'feladat-20-1.png" alt="" style="max-width:46%;height:auto;background:#fff;border-radius:6px">' +
                '<img src="' + IMG + 'feladat-20-2.png" alt="" style="max-width:46%;height:auto;background:#fff;border-radius:6px"></div>' +
                'Legkevesebb hány darabra vághatta szét a nagy hatszöget?', img: 'feladat-20.png', solImg: 'feladat-20-megoldas.png',
          options: { A: '5', B: '6', C: '7', D: '8', E: 'Nem lehet így feldarabolni a nagy hatszöget.' }, key: 'A' },
    21: { text: 'Hány különböző módon olvasható ki az ábráról a TÜKÖRPONTY szó, ha a T betűtől elindulva csak a nyilak által meghatározott irányokban haladhatunk az olvasással?', img: 'feladat-21.png', solImg: 'feladat-21-megoldas.png',
          options: { A: '25', B: '50', C: '70', D: '140', E: '280' }, key: 'D' },
    // 22.: a háló érvényes kockaháló (6 lap, 5 érintkező él → 14 határél), a = 7 cm → kerület 14·7 = 98.
    22: { text: 'Az ábrán egy kocka hálója látható. Területe 294 cm<sup>2</sup>. Hány centiméter a kerülete?', img: 'feladat-22.png',
          options: { A: '14', B: '94', C: '98', D: '168', E: 'Ez nem lehet egy kocka hálója.' }, key: 'C' },
    23: { text: 'Egy matematikaversenyen négy feladatot tűztek ki. A versenyen elindult 50 versenyző közül az első feladatot 43-an, a másodikat 34-en, a harmadikat 36-an, a negyediket pedig 37-en oldották meg. Hányan oldották meg a harmadik és a negyedik feladatot is, ha mind a négy feladatot senki sem oldotta meg?',
          options: { A: '20', B: '23', C: '27', D: '30', E: 'Ezekből az adatokból nem lehet meghatározni.' }, key: 'B' },
    24: { text: 'Ugri a legmagasabb oszlop tetején áll (lásd ábra). Hányféleképpen tud onnan ugrásokkal lejutni a földre, ha minden egyes ugrásával lejjebb kell kerülnie? (Két lejutás nem különböző, ha azokban ugyanazokra az oszlopokra ugrik.)', img: 'feladat-24.png',
          options: { A: '8', B: '12', C: '16', D: '24', E: '32' }, key: 'C' },
    25: { text: 'Az olyan többjegyű pozitív egész számot, amelynek számjegyei balról jobbra haladva növekednek (az egyesek száma nagyobb, mint a tízesek száma; a tízesek száma nagyobb, mint a százasok száma; a százasok száma nagyobb, mint az ezresek száma; …) növekvő számnak nevezzük. Az összes növekvő számot csökkenő sorrendbe rendeztük. Mennyi a hatodik szám számjegyeinek összege?',
          options: { A: '40', B: '41', C: '42', D: '43', E: '44' }, key: 'A' }
  };

  /* A MathJax-törtek legyenek teljes méretűek (ne a szövegbe simuló, kicsinyített változat). */
  Object.keys(TASKS).forEach(function (k) {
    var t = TASKS[k], nagy = function (s) { return typeof s === 'string' ? s.split('\\(').join('\\(\\displaystyle ') : s; };
    t.text = nagy(t.text); Object.keys(t.options).forEach(function (o) { t.options[o] = nagy(t.options[o]); });
  });

  U.css('zr-css',
    '.task-item.disabled{opacity:.4;cursor:not-allowed}.task-item.disabled:hover{transform:none;border-color:rgba(255,255,255,.1)}' +
    '.fb-info{background:rgba(245,158,11,.15);border:1px solid #f59e0b;color:#fbbf24}' +
    '.zr-ok{color:#4ade80}.zr-rossz{color:#f87171}.zr-info{color:#fbbf24}.zr-sav{margin:0 0 15px;padding:10px 14px;border-radius:8px;font-size:14px}' +
    '.zr-tbl{width:100%;border-collapse:collapse;font-size:14px}.zr-tbl th,.zr-tbl td{border:1px solid #334155;padding:5px 8px;text-align:center}.zr-tbl th{background:#0f172a}' +
    '.btn:disabled,.btn-check:disabled,.btn-modal-nav:disabled{opacity:.4;cursor:not-allowed}.mjx-chtml{display:inline-block!important;margin:0!important}');

  var HTML = `
  <div class="container">
    <header>
      <a href="zrinyi-valaszto.html" class="back-link" id="visszaGomb"><i class="fa-solid fa-arrow-left"></i> Vissza a Választóhoz</a>
      <h1>Zrínyi Ilona Matematikaverseny</h1>
      <p class="subtitle">Online gyakorló feladatsor – 6. osztály (2026/27) · 1. feladatsor</p>
      <div class="user-bar">
        <span><i class="fa-solid fa-user" style="color:#fbbf24"></i> Tanuló: <strong id="nev">-</strong></span><span>|</span>
        <span>Osztály: <strong id="osztaly">-</strong></span><span>|</span>
        <span>Helyes: <span id="st-c" class="stat-correct">0</span></span><span>|</span>
        <span>Sikertelen: <span id="st-f" class="stat-failed">0</span></span>
        <button class="btn" id="bead-gomb" data-act="bead" style="padding:4px 12px;font-size:13px"><i class="fa-solid fa-paper-plane"></i> Beadás</button>
      </div>
    </header>
    <div class="zr-sav" id="proba-sav" style="display:none;background:rgba(245,158,11,.15);border:1px solid #f59e0b;color:#fbbf24"></div>
    <div class="zr-sav" id="lezart-sav" style="display:none"></div>
    <div id="ujra-sor" style="display:none;margin:0 0 15px;text-align:center"><button class="btn" data-act="ujrakezd"><i class="fa-solid fa-rotate-right"></i> Új próbálkozás (gyakorlás)</button></div>
    <div class="pagination-bar">
      <button class="btn btn-secondary" id="elozo" data-act="oldal" data-d="-1"><i class="fa-solid fa-chevron-left"></i> Előző oldal</button>
      <span>Oldal: <strong id="oldal-szam" style="color:#fbbf24">1</strong> / <span id="oldal-db"></span></span>
      <button class="btn btn-secondary" id="kovetkezo" data-act="oldal" data-d="1">Következő oldal <i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div id="oldal-0" class="page-card" style="text-align:center">
      <h2 style="color:#fbbf24;margin-bottom:15px">Címlap és tudnivalók</h2>
      <p style="margin-bottom:20px;color:#cbd5e1;font-size:15px;line-height:1.7">
        Válaszd ki a helyesnek gondolt választ, majd nyomd meg az <strong>Ellenőrzés</strong> gombot! Egy feladatra legfeljebb <strong>5-ször</strong> próbálkozhatsz;
        ha elfogynak a próbák, vagy megnézed a megoldást, a feladat sikertelenként záródik.<br><br>
        Amikor minden feladat lezárult, az eredményed <strong>automatikusan elküldjük a tanárnak</strong>. A <strong>Beadás</strong> gombbal korábban is beadhatod,
        de akkor a feladatsor lezárul. ${FOLYTATHATO ? 'Ha frissíted az oldalt vagy másik lapra váltasz, a haladásod megmarad, és folytathatod. Ha viszont bezárod a böngészőlapot, a haladás elvész.' : 'Ha elhagyod a lapot vagy másik lapra váltasz, az is lezárja a feladatsort.'} <strong>Az első beküldésed számít</strong>, a további alkalmak gyakorlásnak minősülnek.
      </p>
      <button class="btn" data-act="oldal" data-d="1">Kezdés <i class="fa-solid fa-arrow-right"></i></button>
    </div>
    <div id="racsok"></div>
  </div>

  <div id="feladat-modal" class="modal-overlay hidden"><div class="modal-body">
    <div class="modal-header">
      <div><h3 id="m-cim" style="color:#fbbf24">Feladat</h3><div id="m-probak" style="font-size:12px;color:#cbd5e1;margin-top:2px"></div></div>
      <div class="modal-nav-group">
        <button class="btn-modal-nav" id="elozo-f" data-act="nav" data-d="-1"><i class="fa-solid fa-chevron-left"></i> Előző</button>
        <button class="btn-modal-nav" id="kovetkezo-f" data-act="nav" data-d="1">Következő <i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <i class="fa-solid fa-xmark" data-act="zar" style="cursor:pointer;font-size:20px;color:#cbd5e1"></i>
    </div>
    <div class="modal-content" id="m-doboz">
      <div id="m-kep"></div>
      <div id="m-szoveg" style="margin-bottom:20px;font-size:15px;line-height:1.5;color:#e2e8f0"></div>
      <div id="m-opciok"></div>
      <div id="m-fb" class="feedback-box hidden"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="megold-gomb" data-act="megold">Megoldás megmutatása</button>
      <button class="btn-check" id="ell-gomb" data-act="ell"><i class="fa-solid fa-check"></i> Ellenőrzés</button>
      <button class="btn" data-act="zar">Bezárás</button>
    </div>
  </div></div>

  <div id="rossz-modal" class="modal-overlay hidden" style="z-index:1100"><div class="modal-body" style="padding:25px;text-align:center;max-width:450px;border-color:#ef4444">
    <i class="fa-solid fa-triangle-exclamation" style="font-size:45px;color:#f87171;margin-bottom:15px"></i>
    <h2 style="color:#f87171;margin-bottom:10px">Helytelen válasz!</h2>
    <p id="rossz-szoveg" style="font-size:14px;color:#cbd5e1;margin-bottom:25px;line-height:1.5"></p>
    <div style="display:flex;gap:10px;justify-content:center">
      <button class="btn-check" style="background:#3b82f6" data-act="ujra"><i class="fa-solid fa-rotate-right"></i> Próbáld újra</button>
      <button class="btn" style="background:#ef4444;color:#fff" data-act="vege"><i class="fa-solid fa-flag-checkered"></i> Befejezés</button>
    </div>
  </div></div>

  <div id="kerdes-modal" class="modal-overlay hidden" style="z-index:1150"><div class="modal-body" style="padding:25px;text-align:center;max-width:450px">
    <p id="k-szoveg" style="font-size:15px;color:#e2e8f0;margin-bottom:22px;line-height:1.5"></p>
    <div style="display:flex;gap:10px;justify-content:center"><button class="btn-check" data-act="igen">Igen</button><button class="btn btn-secondary" data-act="nem">Mégsem</button></div>
  </div></div>

  <div id="eredmeny-modal" class="modal-overlay hidden" style="z-index:1200"><div class="modal-body" style="max-width:520px">
    <div class="modal-header"><h3 style="color:#fbbf24">📊 Értékelés</h3><i class="fa-solid fa-xmark" data-act="rezar" style="cursor:pointer;font-size:20px;color:#cbd5e1"></i></div>
    <div class="modal-content" id="eredmeny-tartalom"></div>
    <div class="modal-footer"><div id="kuld-allapot" style="font-weight:600"></div>
      <button class="btn" id="kuldujra" data-act="kuldujra" style="display:none">🔁 Küldés újra</button></div>
  </div></div>`;

  /* ================= ÁLLAPOT ================= */
  var D = {}, S = { oldal: 0, akt: null, t0: 0, lezarva: false, befejezes: false, folyik: false, elkuldve: false, reason: '', cb: null, torolve: false };
  var OLDALAK = Math.ceil(VART_DB / OLDAL);
  var KESZ = (function () { for (var i = 1; i <= VART_DB; i++) if (!TASKS[i]) return false; return true; })();
  for (var i = 1; i <= VART_DB; i++) D[i] = { st: 'unsolved', sel: null, n: 0, probak: [], mp: 0, megnezte: false };

  function mutat(id, be) { $(id).classList.toggle('hidden', !be); }
  function mutat2(id, be) { $(id).style.display = be ? '' : 'none'; }
  function stopT() { if (S.akt && S.t0) D[S.akt].mp += Math.round((Date.now() - S.t0) / 1000); S.t0 = 0; }
  function mpOf(id) { return D[id].mp + (S.akt === id && S.t0 ? Math.round((Date.now() - S.t0) / 1000) : 0); }
  function mj(el, n) {
    n = n || 0;
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise(el ? [el] : undefined).catch(function () {});
    else if (n < 30) setTimeout(function () { mj(el, n + 1); }, 300);
  }
  /** HTML/képlet → egyszerű szöveg (e-mailhez és táblázathoz) */
  function plain(s) {
    return String(s || '').replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, '$1').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, ' $1/$2')
      .replace(/\\displaystyle ?/g, '')
      .replace(/\\cdot/g, '·').replace(/\\[()]|\$\$/g, '').replace(/\s+/g, ' ').trim();
  }
  function statok() {
    var c = 0, f = 0, u = 0;
    for (var i = 1; i <= VART_DB; i++) { var s = D[i].st; if (s === 'correct') c++; else if (s === 'failed') f++; else u++; }
    $('st-c').textContent = c; $('st-f').textContent = f;
    return { c: c, f: f, u: u };
  }

  /* ================= HALADÁS MENTÉSE ================= */
  function mentKulcs() { return 'zrinyi_gy_' + (cfg.setId || '1') + '_' + (U.kod || 'x'); }
  function ment() {
    if (!FOLYTATHATO || !KESZ || S.torolve) return;
    try {
      var o = { v: 1, n: VART_DB, oldal: S.oldal, lezarva: S.lezarva, elkuldve: S.elkuldve, reason: S.reason, D: {} };
      for (var i = 1; i <= VART_DB; i++) { var d = D[i]; o.D[i] = { st: d.st, sel: d.sel, n: d.n, probak: d.probak, mp: mpOf(i), megnezte: d.megnezte }; }
      sessionStorage.setItem(mentKulcs(), JSON.stringify(o));
    } catch (e) { /* nem kritikus */ }
  }
  /** Visszatölti a mentett haladást; null, ha nincs (vagy nem használható) mentés. */
  function betolt() {
    if (!FOLYTATHATO || !KESZ) return null;
    var o; try { o = JSON.parse(sessionStorage.getItem(mentKulcs()) || 'null'); } catch (e) { return null; }
    if (!o || o.v !== 1 || o.n !== VART_DB || !o.D) return null;
    var OKST = { unsolved: 1, correct: 1, failed: 1 };
    for (var i = 1; i <= VART_DB; i++) {
      var s = o.D[i]; if (!s || !OKST[s.st]) continue;
      var d = D[i];
      d.st = s.st; d.n = Math.max(0, Math.min(MAXP, +s.n || 0));
      d.probak = Array.isArray(s.probak) ? s.probak.filter(function (x) { return ABC.indexOf(x) >= 0; }).slice(0, MAXP) : [];
      d.mp = Math.max(0, +s.mp || 0); d.megnezte = !!s.megnezte;
      d.sel = ABC.indexOf(s.sel) >= 0 ? s.sel : null;
    }
    S.oldal = Math.max(0, Math.min(OLDALAK, +o.oldal || 0));
    S.reason = o.reason ? String(o.reason) : ''; S.elkuldve = !!o.elkuldve;
    return { lezarva: !!o.lezarva };
  }

  /* ================= OLDALAK ÉS RÁCS ================= */
  function mutatOldal() {
    mutat('oldal-0', S.oldal === 0);
    for (var p = 1; p <= OLDALAK; p++) mutat('oldal-' + p, S.oldal === p);
    $('oldal-szam').textContent = S.oldal + 1; $('oldal-db').textContent = OLDALAK + 1;
    $('elozo').disabled = S.oldal === 0; $('kovetkezo').disabled = S.oldal === OLDALAK;
  }
  function renderOldalak() {
    var h = '';
    for (var p = 1; p <= OLDALAK; p++) {
      var s = (p - 1) * OLDAL + 1, e = Math.min(p * OLDAL, VART_DB), g = '';
      for (var i = s; i <= e; i++) {
        var ok = !!TASKS[i], st = D[i].st;
        var t = st === 'correct' ? ['Helyes', 'correct'] : st === 'failed' ? ['Sikertelen', 'failed'] : [ok ? 'Megoldatlan' : 'Hamarosan', ''];
        g += '<div class="task-item' + (ok ? '' : ' disabled') + '"' + (ok ? ' data-act="nyit" data-id="' + i + '"' : '') + '>' +
          '<div style="display:flex;align-items:center"><div class="task-badge">' + i + '</div><div><div style="font-weight:bold;font-size:14px">Feladat #' + i +
          '</div><div class="task-status ' + t[1] + '">' + t[0] + '</div></div></div><i class="fa-solid fa-chevron-right" style="color:#64748b"></i></div>';
      }
      h += '<div class="page-card hidden" id="oldal-' + p + '"><h3 style="color:#fbbf24;margin-bottom:10px">' + s + '. – ' + e + '. feladatok</h3><div class="task-grid">' + g + '</div></div>';
    }
    $('racsok').innerHTML = h; mutatOldal();
  }

  /* ================= FELADATABLAK ================= */
  function jelez(cls, html) { var f = $('m-fb'); f.className = 'feedback-box ' + cls; f.innerHTML = html; }
  function frissitModal() {
    var id = S.akt, T = TASKS[id], d = D[id], nyitott = d.st === 'unsolved' && !S.lezarva, h = '';
    $('m-probak').textContent = 'Próbálkozások: ' + d.n + ' / ' + MAXP;
    ABC.forEach(function (o) {
      var cls = 'option-item', ic = '';
      if (d.st !== 'unsolved' && o === T.key) { cls += ' status-correct'; ic = '<i class="fa-solid fa-check option-icon"></i>'; }
      else if (d.sel === o && nyitott) cls += ' selected';
      h += '<div class="' + cls + '"' + (nyitott ? ' data-act="valaszt" data-o="' + o + '"' : '') + '><span><strong>' + o + ')</strong> ' + T.options[o] + '</span>' +
        (T.optImgs && T.optImgs[o] ? '<img class="option-img" src="' + IMG + T.optImgs[o] + '" alt="">' : '') + ic + '</div>';
    });
    $('m-opciok').innerHTML = h;
    if (d.st === 'correct') jelez('feedback-correct', '<i class="fa-solid fa-check"></i> Helyes válasz! Ez a feladat meg van oldva.' + (T.solImg ? '<div class="task-image-box" style="margin-top:10px"><img src="' + IMG + T.solImg + '" alt="A megoldás ábrája" style="max-width:100%;height:auto"></div>' : ''));
    else if (d.st === 'failed') jelez('feedback-failed', '<i class="fa-solid fa-xmark"></i> Sikertelenként lezárva. A helyes válasz: <strong>' + T.key + ') ' + T.options[T.key] + '</strong>' + (T.solImg ? '<div class="task-image-box" style="margin-top:10px"><img src="' + IMG + T.solImg + '" alt="A megoldás ábrája" style="max-width:100%;height:auto"></div>' : ''));
    else mutat('m-fb', false);
    $('ell-gomb').disabled = $('megold-gomb').disabled = !nyitott;
    $('elozo-f').disabled = !TASKS[id - 1]; $('kovetkezo-f').disabled = !TASKS[id + 1];
    mj($('m-opciok'));
  }
  function nyit(id) {
    stopT(); S.akt = id; S.t0 = Date.now();
    var T = TASKS[id];
    $('m-cim').textContent = id + '. Feladat'; $('m-szoveg').innerHTML = T.text;
    $('m-kep').innerHTML = T.img ? '<div class="task-image-box"><img src="' + IMG + T.img + '" alt="' + id + '. feladat ábrája" onerror="this.parentNode.innerHTML=\'<p style=&quot;color:#fbbf24;font-size:13px&quot;>Az ábra még nincs feltöltve.</p>\'"></div>' : '';
    frissitModal(); mutat('feladat-modal', true); $('m-doboz').scrollTop = 0; mj($('m-szoveg'));
  }
  function zarFeladat() { stopT(); mutat('feladat-modal', false); mutat('rossz-modal', false); }
  function lezart(id) {
    frissitModal(); statok(); renderOldalak(); mutat('rossz-modal', false);
    if (!KESZ || S.befejezes) return;
    for (var i = 1; i <= VART_DB; i++) if (D[i].st === 'unsolved') return;
    S.befejezes = true;
    setTimeout(function () { zarFeladat(); osszesites(); kuldes('befejezve'); }, 1200);
  }
  function ell() {
    if (S.lezarva) return;
    var id = S.akt, T = TASKS[id], d = D[id];
    if (d.st !== 'unsolved') return;
    if (!d.sel) { frissitModal(); jelez('fb-info', 'Válassz egy választ az ellenőrzés előtt!'); return; }
    d.n++; d.probak.push(d.sel);
    if (d.sel === T.key) { d.st = 'correct'; lezart(id); return; }
    if (d.n >= MAXP) { d.st = 'failed'; lezart(id); return; }
    $('rossz-szoveg').innerHTML = 'A megadott válasz nem helyes.<br><strong>Eddigi próbálkozások száma: ' + d.n + ' / ' + MAXP + '</strong>';
    frissitModal(); mutat('rossz-modal', true);
  }
  function feladVeg() {
    var d = D[S.akt]; if (S.lezarva || d.st !== 'unsolved') return;
    d.st = 'failed'; d.megnezte = true; lezart(S.akt);
  }
  function kerdez(szoveg, cb) { S.cb = cb; $('k-szoveg').textContent = szoveg; mutat('kerdes-modal', true); }

  /* ================= ÉRTÉKELÉS ÉS KÜLDÉS ================= */
  var CIMKE = { correct: 'Helyes', failed: 'Sikertelen', unsolved: 'Megoldatlan' };
  function osszesites() {
    var s = statok(), h = '<p><b>Helyes: ' + s.c + ' · Sikertelen: ' + s.f + ' · Megoldatlan: ' + s.u + '</b> (összesen ' + VART_DB + ' feladat)</p>' +
      '<div style="max-height:40vh;overflow:auto"><table class="zr-tbl"><tr><th>Feladat</th><th>Állapot</th><th>Próbák</th></tr>';
    for (var i = 1; i <= VART_DB; i++) h += '<tr><td>' + i + '.</td><td>' + CIMKE[D[i].st] + '</td><td>' + D[i].n + '</td></tr>';
    $('eredmeny-tartalom').innerHTML = h + '</table></div>'; mutat('eredmeny-modal', true);
  }
  function allapot(cls, txt) { var a = $('kuld-allapot'); a.className = 'zr-' + cls; a.textContent = txt; }
  /** A kuldes.js / Apps Script szerződése: score, total, grade, reason, tasks[] */
  function payload(reason) {
    var s = statok();
    return {
      setId: cfg.setId || '1', score: s.c, total: VART_DB, reason: reason,
      grade: 'Helyes: ' + s.c + ', sikertelen: ' + s.f + ', megoldatlan: ' + s.u + ' (' + Math.round(s.c / VART_DB * 100) + '%)',
      tasks: Object.keys(TASKS).map(Number).sort(function (a, b) { return a - b; }).map(function (i) {
        var T = TASKS[i], d = D[i], jo = T.key + ') ' + plain(T.options[T.key]);
        return {
          expression: i + '. ' + plain(T.text).slice(0, 150), correct: d.st === 'correct',
          finalAnswer: d.probak.length ? d.probak[d.probak.length - 1] : '', correctAnswer: jo, seconds: mpOf(i), stepErrors: '',
          studentLines: d.probak.map(function (v, k) { return (k + 1) + '. próba: ' + v; }),
          correctLines: ['Helyes válasz: ' + jo],
          feedback: ['Állapot: ' + CIMKE[d.st].toLowerCase() + (d.megnezte ? ' (megoldás megnézve / feladva)' : ''), 'Próbálkozások: ' + d.n + ' / ' + MAXP]
        };
      })
    };
  }
  function lezar(reason) {
    if (S.lezarva) return;
    zarFeladat(); S.lezarva = true;
    var v = $('lezart-sav'), jo = reason === 'befejezve';
    v.textContent = jo ? '✅ Minden feladat lezárult, a feladatsor véget ért.' : '⚠️ A feladatsor idő előtt lezárult. A jelenlegi eredményedet elküldtük a tanárnak.';
    v.style.cssText = 'display:block;background:' + (jo ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)') + ';border:1px solid ' + (jo ? '#22c55e' : '#ef4444') + ';color:' + (jo ? '#4ade80' : '#f87171');
    U.emit('lezarva');
  }
  /** Az egész feladatsor EGYSZERRE megy el; az e-mailt a szerver csak az első beküldésnél küldi. */
  async function kuldes(reason) {
    if (!KESZ || S.folyik || S.elkuldve) return;
    S.reason = S.reason || reason; lezar(S.reason); ment();
    S.folyik = true; mutat('kuldujra', false); allapot('info', 'Küldés…');
    var ok = false;
    try { ok = await U.kuldes(payload(S.reason)); } catch (e) { console.error(e); }
    S.folyik = false;
    if (ok === true) { S.elkuldve = true; allapot('ok', '✅ Az eredményed elküldtük. Köszönjük!'); mutat2('ujra-sor', true); }
    else if (ok === null) allapot('info', 'Archív módban nincs küldés.');
    else { allapot('rossz', '❌ A küldés nem sikerült. Ne zárd be az oldalt, próbáld újra!'); $('kuldujra').style.display = ''; }
    ment();
  }
  function bead() {
    if (S.lezarva) { osszesites(); return; }
    var u = statok().u;
    var menj = function () { zarFeladat(); osszesites(); kuldes(u ? 'lapvaltas' : 'befejezve'); };
    if (u) kerdez('Még ' + u + ' feladat nincs lezárva. Ha most beadod, a feladatsor lezárul, és az eddigi eredményedet elküldjük. Beadod?', menj); else menj();
  }

  /** A mentett haladás visszaállítása után: lezárt sor → csak olvasható (és ha kell, újraküldés); különben folytatás. */
  function folytat(m) {
    var s = statok();
    if (m.lezarva) {
      lezar(S.reason || 'befejezve'); renderOldalak();
      if (S.elkuldve) { allapot('ok', '✅ Az eredményed elküldtük. Köszönjük!'); mutat2('ujra-sor', true); }
      else kuldes(S.reason || 'befejezve');
    } else if (!s.u) {
      S.befejezes = true; osszesites(); kuldes('befejezve');     // minden feladat lezárt, de a beküldés még nem történt meg
    } else if (s.c + s.f > 0) {
      var p = $('proba-sav'); p.style.display = 'block';
      p.textContent = 'Folytatod a megkezdett feladatsort (' + (s.c + s.f) + ' / ' + VART_DB + ' feladat lezárva).';
    }
  }

  /* ================= INDÍTÁS ================= */
  function nevBetolt() {
    var url = window.UJITAS_URL; if (!url || !U.kod) return;
    try {
      fetch(url + '?akcio=kod&kod=' + encodeURIComponent(U.kod) + '&osztaly=' + encodeURIComponent(cfg.classId || ''), { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || d.ok !== true) return;
          if (d.name) $('nev').textContent = d.name;
          if (d['class']) $('osztaly').textContent = d['class'];   // a diák valódi osztálya (pl. 6a)
        })
        .catch(function () { /* nem kritikus */ });
    } catch (e) { /* nem kritikus */ }
  }
  function esemenyek() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null; if (!el) return;
      var a = el.getAttribute('data-act'), d = +el.getAttribute('data-d');
      if (a === 'oldal') { S.oldal = Math.max(0, Math.min(OLDALAK, S.oldal + d)); mutatOldal(); }
      else if (a === 'nyit') nyit(+el.getAttribute('data-id'));
      else if (a === 'nav') { if (TASKS[S.akt + d]) nyit(S.akt + d); }
      else if (a === 'valaszt') { D[S.akt].sel = el.getAttribute('data-o'); frissitModal(); }
      else if (a === 'ell') ell();
      else if (a === 'megold') kerdez('Ha megnézed a megoldást, a feladat sikertelenként záródik. Megnézed?', feladVeg);
      else if (a === 'ujra') { D[S.akt].sel = null; mutat('rossz-modal', false); frissitModal(); }
      else if (a === 'vege') feladVeg();
      else if (a === 'zar') zarFeladat();
      else if (a === 'bead') bead();
      else if (a === 'rezar') mutat('eredmeny-modal', false);
      else if (a === 'kuldujra') kuldes(S.reason || 'befejezve');
      else if (a === 'igen') { mutat('kerdes-modal', false); var f = S.cb; S.cb = null; if (f) f(); }
      else if (a === 'nem') { mutat('kerdes-modal', false); S.cb = null; }
      else if (a === 'ujrakezd') kerdez('Új próbálkozást kezdesz. Ez gyakorlásnak számít, az első beküldésed marad érvényes. Folytatod?', function () {
        S.torolve = true; try { sessionStorage.removeItem(mentKulcs()); } catch (e) { /* nem kritikus */ } location.reload();
      });
      ment();
    });
    if (FOLYTATHATO) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopT(); ment(); }
        else if (S.akt && !S.lezarva && !$('feladat-modal').classList.contains('hidden')) S.t0 = Date.now();   // az elrejtett idő nem számít
      });
      window.addEventListener('pagehide', function () { stopT(); ment(); });
    }
  }

  (async function () {
    var app = $('app');
    if (!app) { console.error('Hiányzik a #app elem'); return; }
    if (!(await U.run('indulas'))) return;           // pl. nem adott meg kódot
    app.innerHTML = HTML;
    if (FOLYTATHATO) {   // a keret (vedelem.js) figyelmeztetése még a régi, lezáró viselkedésről szólna – átírjuk
      var ft = document.getElementById('uj-fig-t'), fp = ft && ft.nextElementSibling;
      if (fp) fp.textContent = 'Ha másik lapra váltasz vagy frissíted az oldalt, a haladásod megmarad, és folytathatod. Ha viszont bezárod a böngészőlapot, a haladásod elvész.';
    }
    $('visszaGomb').href = cfg.visszaHref || 'zrinyi-valaszto.html';
    try { $('osztaly').textContent = sessionStorage.getItem('zrinyi_student_class') || '-'; } catch (e) { $('osztaly').textContent = '-'; }
    if (!KESZ || !U.elo) {
      $('bead-gomb').style.display = 'none';
      var p = $('proba-sav'); p.style.display = 'block';
      p.textContent = KESZ ? 'Archív mód: a beküldés nincs bekapcsolva.' : 'Próbaváltozat: még csak ' + Object.keys(TASKS).length + ' / ' + VART_DB + ' feladat van feltöltve, a beküldés ki van kapcsolva.';
    }
    var mentett = betolt();
    nevBetolt(); statok(); renderOldalak(); esemenyek();
    U.aktiv = function () { return KESZ && U.elo && !S.lezarva; };
    U.on('lapvaltas', function () {
      if (!KESZ || !U.elo) return;
      if (FOLYTATHATO) ment(); else kuldes('lapvaltas');
    });
    U.on('kilepes', function () {
      if (!KESZ || !U.elo) return;
      if (FOLYTATHATO) { ment(); return; }
      if (!S.elkuldve && !S.folyik) U.kuldes(payload(S.reason || 'lapvaltas'), { csendes: true });
    });
    if (mentett) folytat(mentett);
  })();
})();
