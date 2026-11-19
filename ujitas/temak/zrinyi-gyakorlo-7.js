/**
 * temak/zrinyi-gyakorlo-7.js – Zrínyi online gyakorló feladatsor (7. osztály, 2026/27, 1. feladatsor)
 *
 * ÚJ FELADATOK: csak a TASKS objektumot bővítsd (feladat száma → { text, options: {A..E}, key, img?, optImgs? }).
 *   - képlet: \\(33\\frac{2}{3}\\)   (a JS szövegben a visszaper duplán)
 *   - ábra: img: 'feladat-23.png'  (az IMG mappából), válaszlehetőség-kép: optImgs: { A: 'x.png' }
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

  var VART_DB = 30, OLDAL = 11, MAXP = 5, IMG = 'img/zrinyi/gyakorlo-2627-7o/', ABC = ['A', 'B', 'C', 'D', 'E'];
  var EGYIK = 'Az előzőek közül egyik sem.';

  /* ================= FELADATOK ================= */
  var TASKS = {
    1: { text: 'Egy kenyérboltban 3 darab kifli ára 108 Ft. Hány forintba kerül ugyanebben a boltban 5 darab kifli?',
         options: { A: '64,8', B: '180', C: '324', D: '540', E: EGYIK }, key: 'B' },
    2: { text: 'Egy kocka éleinek hossza 4 cm. Hány négyzetcentiméter a felszíne?',
         options: { A: '16', B: '24', C: '64', D: '96', E: EGYIK }, key: 'D' },
    3: { text: 'Hány óra a 2020 perc?',
         options: { A: '2,02', B: '20,2', C: '33,6', D: '\\(33\\frac{2}{3}\\)', E: '202' }, key: 'D' },
    4: { text: 'Egy téglatest egy csúcsból induló három élének hossza 5 cm, 6 cm és 8 cm. Hány köbcentiméter a téglatest térfogata?',
         options: { A: '19', B: '118', C: '236', D: '240', E: EGYIK }, key: 'D' },
    5: { text: 'Egy munkán Karcsi 4 órát, Zoli 5 órát dolgozott. A munkáért kapott 7200 Ft-ot a ledolgozott órák arányában osztják el egymás között. Hány forintot kapott a munkáért Zoli?',
         options: { A: '800', B: '3200', C: '3600', D: '4000', E: EGYIK }, key: 'D' },
    6: { text: 'Mennyi a 72 és 84 legkisebb közös többszöröse?',
         options: { A: '6', B: '12', C: '24', D: '504', E: '6048' }, key: 'D' },
    7: { text: 'Melyik számjegyeket lehet a 8729<i>x</i> ötjegyű számban az <i>x</i> helyére írni, hogy a szám osztható legyen 3-mal?',
         options: { A: '3', B: '6', C: '2; 5 és 8', D: '9', E: '1; 4 és 7' }, key: 'E' },
    // 8.: a művelet zárójel nélküli, ezért 7,5 − 5/6 = 6⅔ → D (a tanár megerősítette).
    8: { text: 'Mennyi a \\(2\\frac{1}{2} \\cdot 3 - 1\\frac{2}{3} : 2\\) műveletsor eredménye?',
         options: { A: '\\(2\\frac{2}{3}\\)', B: '\\(2\\frac{11}{12}\\)', C: '\\(6\\frac{1}{6}\\)', D: '\\(6\\frac{2}{3}\\)', E: EGYIK }, key: 'D' },
    9: { text: 'Pista elvállalta Sanyi bácsi kertjének felásását. Eddig a kert területének 64%-át ásta fel. Hány négyzetméteres Sanyi bácsi kertje, ha Pistának még 144 négyzetmétert kell felásnia?',
         options: { A: '225', B: '256', C: '400', D: '512', E: EGYIK }, key: 'C' },
    10: { text: 'Mennyi a 2020 : 0,101 osztás eredménye?',
          options: { A: '200', B: '2000', C: '20\u00a0000', D: '200\u00a0000', E: '2\u00a0000\u00a0000' }, key: 'C' },
    11: { text: 'Egy farsangi álarc készítésének lépései láthatóak az ábrán. Milyen sorrendben készült az álarc?', img: 'feladat-11.png',
          options: { A: 'EACBD', B: 'EABCD', C: 'EABDC', D: 'AEBCD', E: 'DCBEA' }, key: 'B' },
    // 12.: az ábra (út-idő grafikon) még nincs meg – a PDF-ben levágott; tedd be: img/zrinyi/gyakorlo-2627-7o/feladat-12.png
    12: { text: 'Dani otthonról elsétált a barátjához, ott töltött valamennyi időt, majd újra hazasétált. Erről készítette az ábrán látható út-idő grafikont. Hány percet töltött Dani a barátjánál?', img: 'feladat-12.png',
          options: { A: '10', B: '15', C: '20', D: '25', E: '40' }, key: 'C' },
    13: { text: 'Nekeresdország királya mindhárom lányát férjhez adta. Az első lány esküvőjén 574, a második lány esküvőjén 861 vendég volt. A harmadik lány esküvőjén a vendégek száma az előző kettő összegének kétötödszöröse volt. Hány vendég volt a harmadik királylány esküvőjén?',
          options: { A: '574', B: '861', C: '1148', D: '1435', E: '2009' }, key: 'A' },
    14: { text: 'Sanyinak 4-féle színű ceruzája van, összesen 12 darab. Zöld ugyanannyi van, mint sárga, piros pedig kétszer annyi, mint kék. Hány piros színű ceruzája van Sanyinak?',
          options: { A: '2', B: '3', C: '4', D: '6', E: '8' }, key: 'C' },
    15: { text: 'Három egymást követő pozitív páratlan szám közül a legkisebb és a legnagyobb szorzata 77. Melyik a középső szám?',
          options: { A: '7', B: '9', C: '11', D: '13', E: '15' }, key: 'B' },
    // 16–20.: nincs hivatalos kulcs; a kulcsok számítással ellenőrzöttek (16: B, 17: B, 18: B, 19: E, 20: C).
    16: { text: 'Egy háromszög legnagyobb szöge 20°-kal nagyobb, mint a legkisebb. A legkisebb szög 7°-kal kisebb, mint a középső. Hány fokos a háromszög legkisebb szöge?',
          options: { A: '46', B: '51', C: '58', D: '68', E: '153' }, key: 'B' },
    17: { text: 'A triciklin menekülő triciklitolvajokat a rendőrök biciklin üldözik. Összesen tíz keréken gurulnak. Hány triciklit loptak el? (A tricikli a biciklihez hasonló háromkerekű jármű.)',
          options: { A: '1', B: '2', C: '3', D: '4', E: 'Ezekből az adatokból nem lehet meghatározni.' }, key: 'B' },
    18: { text: 'A matematikaszakkörön 12-en vannak jelen, lányok és fiúk vegyesen. A lányok háromheted része hibátlanul megoldotta az egyik nehéz feladatot. Hány fiú van a szakkörön?',
          options: { A: '3', B: '5', C: '6', D: '7', E: '8' }, key: 'B' },
    // 19.: a feladat szövegének vége a PDF-ben levágva („kap…”), a „kapjuk” a feltételezett befejezés.
    19: { text: 'Rovásírással leírva ORSI nevét a <img src="' + IMG + 'feladat-19-jelek.png" alt="jelsorozat" style="height:34px;vertical-align:middle"> jelsorozatot kapjuk.<br>Melyik jelsorozat jelentheti ÁGNES nevét?<br>(A rovásírást jobbról balra kell olvasni, és egy betűnek pontosan egy jel felel meg.)',
          options: { A: '<img src="' + IMG + 'feladat-19-A.png" alt="A jelsorozat" style="height:34px;vertical-align:middle">', B: '<img src="' + IMG + 'feladat-19-B.png" alt="B jelsorozat" style="height:34px;vertical-align:middle">', C: '<img src="' + IMG + 'feladat-19-C.png" alt="C jelsorozat" style="height:34px;vertical-align:middle">', D: '<img src="' + IMG + 'feladat-19-D.png" alt="D jelsorozat" style="height:34px;vertical-align:middle">', E: '<img src="' + IMG + 'feladat-19-E.png" alt="E jelsorozat" style="height:34px;vertical-align:middle">' }, key: 'E' },
    20: { text: 'Hány különböző módon olvasható ki a TÖRPEHARCSA szó az ábráról, ha a T betűtől elindulva csak a nyilak által meghatározott irányokban haladhatunk az olvasással?', img: 'feladat-20.png',
          options: { A: '21', B: '60', C: '120', D: '512', E: '1024' }, key: 'C' },
    // 21–25.: nincs hivatalos kulcs; a kulcsok számítással ellenőrzöttek (21: B, 22: E, 23: C, 24: D, 25: A).
    21: { text: 'Egy öttagú családban a családtagok életkorai egész számok, és az életkorok összege 82 év. Az apa két évvel idősebb az anyánál, és éveinek háromszorosához 1-et hozzáadva 100-at kapunk. Mennyi volt 2 évvel ezelőtt a családtagok életkorának összege, ha a legkisebb gyerek 4 évesnél idősebb, és a gyerekek között nincsenek ikrek?',
          options: { A: '62', B: '72', C: '77', D: '80', E: 'Ezekből az adatokból nem lehet meghatározni.' }, key: 'B' },
    22: { text: 'Egy nagy kockát építünk 25 darab kék és 2 darab piros színű, azonos méretű kis kockából. Mennyi lehet a nagy kocka nem teljesen kék színű lapjainak legnagyobb száma?',
          options: { A: '2', B: '3', C: '4', D: '5', E: '6' }, key: 'E' },
    // 23.: az ábrát a tanár újrarajzolta (50°) → α = 180° − 50° = 130° → C.
    23: { text: 'Hány fok az ábrán az \\(\\alpha\\)-val jelölt szög nagysága, ha \\(e\\) és \\(f\\) egyenesek párhuzamosak?', img: 'feladat-23.png',
          options: { A: '110', B: '120', C: '130', D: '140', E: '150' }, key: 'C' },
    24: { text: 'Budapesttől Szeged 172,2 km távolságra van Kecskemét központján áthaladva. Kecskemét központjától Szeged 1,2 km-rel messzebb van, mint Budapest. Hány kilométerre van Kecskemét központjától Szeged?',
          options: { A: '85,5', B: '86,2', C: '86,5', D: '86,7', E: '87,2' }, key: 'D' },
    25: { text: 'Egy szabályos sokszöget két átlója négy részre oszt: egy háromszögre, egy négyszögre, egy ötszögre és egy hatszögre. Hány oldalú a szabályos sokszög?',
          options: { A: '10', B: '12', C: '15', D: '16', E: '18' }, key: 'A' },
    // 26–28.: nincs hivatalos kulcs; a kulcsok számítással ellenőrzöttek (a Gemini kulcsa eltért, a Google AI-é egyezett):
    //   26: n = 12 és 28 → 2 db (A) · 27: csak a 44 lehet az utolsó (C) · 28: a 7. szám 12345789 → 39 (C).
    26: { text: 'Hány olyan 10-nél nagyobb és 30-nál kisebb <i>n</i> egész szám van, amely esetén az 5<i>n</i> + 4 kifejezés egy egész szám négyzete?',
          options: { A: '2', B: '3', C: '4', D: '5', E: '6' }, key: 'A' },
    27: { text: 'Egy lottóhúzás során a 35; 40; 44; 46 és 55 számokat egyesével olyan sorrendben húzták ki, hogy az addig kihúzott számok átlaga (számtani közepe) minden húzás után egész szám volt. Melyik számot húzták ki utoljára?',
          options: { A: '35', B: '40', C: '44', D: '46', E: '55' }, key: 'C' },
    28: { text: 'Az olyan többjegyű pozitív egész számot, amelynek számjegyei balról jobbra haladva növekednek (az egyesek száma nagyobb, mint a tízesek száma; a tízesek száma nagyobb, mint a százasok száma; a százasok száma nagyobb, mint az ezresek száma; …) növekvő számnak nevezzük. Az összes növekvő számot csökkenő sorrendbe rendeztük. Mennyi a hetedik szám számjegyeinek összege?',
          options: { A: '37', B: '38', C: '39', D: '40', E: '42' }, key: 'C' },
    29: { text: 'Egy kör <i>P</i> ponton átmenő leghosszabb húrja 30 cm, legrövidebb húrja pedig 24 cm. Hány <i>P</i>-n áthaladó, centiméterben mérve egész hosszúságú húrja van a körnek?',
          options: { A: '7', B: '11', C: '12', D: '13', E: '14' }, key: 'C' },
    30: { text: 'Ugri a legmagasabb oszlop tetején áll (lásd ábra). Hányféleképpen tud onnan ugrásokkal lejutni a földre, ha minden egyes ugrásával lejjebb kell kerülnie? (Két lejutás nem különböző, ha azokban ugyanazokra az oszlopokra ugrik.)', img: 'feladat-30.png',
          options: { A: '16', B: '32', C: '48', D: '56', E: '64' }, key: 'C' }
  };

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
      <p class="subtitle">Online gyakorló feladatsor – 7. osztály (2026/27) · 1. feladatsor</p>
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
        de akkor a feladatsor lezárul. Ha elhagyod a lapot vagy másik lapra váltasz, az is lezárja a feladatsort. <strong>Az első beküldésed számít</strong>, a további alkalmak gyakorlásnak minősülnek.
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
  var D = {}, S = { oldal: 0, akt: null, t0: 0, lezarva: false, befejezes: false, folyik: false, elkuldve: false, reason: '', cb: null };
  var OLDALAK = Math.ceil(VART_DB / OLDAL);
  var KESZ = (function () { for (var i = 1; i <= VART_DB; i++) if (!TASKS[i]) return false; return true; })();
  for (var i = 1; i <= VART_DB; i++) D[i] = { st: 'unsolved', sel: null, n: 0, probak: [], mp: 0, megnezte: false };

  function mutat(id, be) { $(id).classList.toggle('hidden', !be); }
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
      .replace(/\\cdot/g, '·').replace(/\\[()]|\$\$/g, '').replace(/\s+/g, ' ').trim();
  }
  function statok() {
    var c = 0, f = 0, u = 0;
    for (var i = 1; i <= VART_DB; i++) { var s = D[i].st; if (s === 'correct') c++; else if (s === 'failed') f++; else u++; }
    $('st-c').textContent = c; $('st-f').textContent = f;
    return { c: c, f: f, u: u };
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
    if (d.st === 'correct') jelez('feedback-correct', '<i class="fa-solid fa-check"></i> Helyes válasz! Ez a feladat meg van oldva.');
    else if (d.st === 'failed') jelez('feedback-failed', '<i class="fa-solid fa-xmark"></i> Sikertelenként lezárva. A helyes válasz: <strong>' + T.key + ') ' + T.options[T.key] + '</strong>');
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
    S.reason = S.reason || reason; lezar(S.reason);
    S.folyik = true; mutat('kuldujra', false); allapot('info', 'Küldés…');
    var ok = false;
    try { ok = await U.kuldes(payload(S.reason)); } catch (e) { console.error(e); }
    S.folyik = false;
    if (ok === true) { S.elkuldve = true; allapot('ok', '✅ Az eredményed elküldtük. Köszönjük!'); }
    else if (ok === null) allapot('info', 'Archív módban nincs küldés.');
    else { allapot('rossz', '❌ A küldés nem sikerült. Ne zárd be az oldalt, próbáld újra!'); $('kuldujra').style.display = ''; }
  }
  function bead() {
    if (S.lezarva) { osszesites(); return; }
    var u = statok().u;
    var menj = function () { zarFeladat(); osszesites(); kuldes(u ? 'lapvaltas' : 'befejezve'); };
    if (u) kerdez('Még ' + u + ' feladat nincs lezárva. Ha most beadod, a feladatsor lezárul, és az eddigi eredményedet elküldjük. Beadod?', menj); else menj();
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
    });
  }

  (async function () {
    var app = $('app');
    if (!app) { console.error('Hiányzik a #app elem'); return; }
    if (!(await U.run('indulas'))) return;           // pl. nem adott meg kódot
    app.innerHTML = HTML;
    $('visszaGomb').href = cfg.visszaHref || 'zrinyi-valaszto.html';
    try { $('osztaly').textContent = sessionStorage.getItem('zrinyi_student_class') || '-'; } catch (e) { $('osztaly').textContent = '-'; }
    if (!KESZ || !U.elo) {
      $('bead-gomb').style.display = 'none';
      var p = $('proba-sav'); p.style.display = 'block';
      p.textContent = KESZ ? 'Archív mód: a beküldés nincs bekapcsolva.' : 'Próbaváltozat: még csak ' + Object.keys(TASKS).length + ' / ' + VART_DB + ' feladat van feltöltve, a beküldés ki van kapcsolva.';
    }
    nevBetolt(); statok(); renderOldalak(); esemenyek();
    U.aktiv = function () { return KESZ && U.elo && !S.lezarva; };
    U.on('lapvaltas', function () { if (KESZ && U.elo) kuldes('lapvaltas'); });
    U.on('kilepes', function () { if (KESZ && U.elo && !S.elkuldve && !S.folyik) U.kuldes(payload(S.reason || 'lapvaltas'), { csendes: true }); });
  })();
})();
