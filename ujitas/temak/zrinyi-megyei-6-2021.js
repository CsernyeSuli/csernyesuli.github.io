/**
 * temak/zrinyi-megyei-6-2021.js – Zrínyi online feladatsor (6. osztály, 2021. évi megyei forduló)
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

  var VART_DB = 25, OLDAL = 9, MAXP = 5, IMG = 'img/zrinyi/megyei-2021-6o/', ABC = ['A', 'B', 'C', 'D', 'E'];
  var EGYIK = 'Az előzőek közül egyik sem.';
  /* HALADÁS MENTÉSE (sessionStorage): true → frissítés / lapváltás után a diák folytathatja ott, ahol abbahagyta; a feladatsor csak
   *   a befejezéskor vagy a Beadás gombbal zárul le és megy el. A böngészőlap BEZÁRÁSAKOR a haladás elvész (és nem megy el semmi).
   *   false → a régi viselkedés: a lap elhagyása lezárja a feladatsort és elküldi az addigi eredményt. */
  var FOLYTATHATO = true;

  /** Betűkártya-sor (18. feladat) és képes válaszlehetőség (16. feladat). */
  function KARTYA(s) { return s.split('').map(function (c) { return '<span style="display:inline-block;border:1px solid #cbd5e1;border-radius:3px;padding:0 6px;margin:0 2px;line-height:1.5">' + c + '</span>'; }).join(''); }
  function OPTIMG(L) { return '<img src="' + IMG + 'feladat-16-' + L + '.png" alt="' + L + ' rajz" style="height:96px;vertical-align:middle;background:#fff;border-radius:4px">'; }

  /* ================= FELADATOK ================= */
  var TASKS = {
    // 1–25.: nincs hivatalos kulcs; a kulcsok számítással és az ábrák alapján ellenőrzöttek:
    //   1: D · 2: A · 3: A · 4: B · 5: D · 6: D · 7: B · 8: D · 9: C · 10: B · 11: E · 12: D · 13: D
    //   14: D · 15: A · 16: D · 17: D · 18: E · 19: B · 20: D · 21: D · 22: D · 23: A · 24: B · 25: B
    1: { text: 'A 2021. év rovara a kacsafarkú szender. A kifejlett kacsafarkú szender pödörnyelve 3 cm hosszú. Hány milliméter ez?',
         options: { A: '0,003', B: '0,03', C: '0,3', D: '30', E: '300' }, key: 'D' },
    2: { text: 'Melyik szám a legnagyobb?',
         options: { A: '20,21', B: '2,021', C: '0,2021', D: '0,2022', E: '2,2021' }, key: 'A' },
    3: { text: 'Hány tallérba kerül egy csokigolyó, ha 6 kerek perec ára ugyanannyi, mint 7 csokigolyó ára, és 6 kerek perec 42 tallérba kerül?',
         options: { A: '6', B: '7', C: '13', D: '14', E: '42' }, key: 'A' },
    4: { text: 'Alíz négyzetrácsos lapra készített egy 5\u00d75-ös táblázatot, amelynek oszlopait betűkkel, sorait számokkal jelölte, és a táblázat néhány négyzetét szürkére színezte (lásd ábra). Melyik négyzeteket színezte szürkére Alíz?', img: 'feladat-4.png',
         options: { A: 'A4, B5, C3, D2, E1', B: 'A4, B5, C4, D3, E2', C: 'A4, B5, C3, D4, E2', D: 'A4, B5, C5, D3, E2', E: 'A4, B5, C5, D4, E3' }, key: 'B' },
    5: { text: 'Laurának kétszer annyi ötöse van matematikából, mint Grétának. Hány ötösük lehet kettőjüknek összesen?',
         options: { A: '22', B: '23', C: '25', D: '27', E: '29' }, key: 'D' },
    6: { text: 'Mennyi a \\(\\frac{4042}{2021}\\) és a \\(\\frac{2021}{4042}\\) törtek különbsége?',
         options: { A: '\\(\\frac{1}{2}\\)', B: '\\(\\frac{2}{3}\\)', C: '1', D: '\\(\\frac{3}{2}\\)', E: '2021' }, key: 'D' },
    7: { text: 'A galagonyafalvi iskola 6. évfolyamának öt osztályáról készült az ábrán látható hiányosan kitöltött táblázat. Melyik osztályba jár a legkevesebb lány?', img: 'feladat-7.png',
         options: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, key: 'B' },
    8: { text: 'Melyik lap lesz szemben az <i>F</i> jelű lappal abban a kockában, amelyet az ábrán látható kockaháló összehajtogatásával kapunk?', img: 'feladat-8.png',
         options: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, key: 'D' },
    9: { text: 'Hány téglalappal több látható az 1. ábrán, mint a 2. ábrán?', img: 'feladat-9.png',
         options: { A: '1', B: '2', C: '3', D: '4', E: '5' }, key: 'C' },
    10: { text: 'Firkász leírta azt a legnagyobb négyjegyű pozitív egész számot, amelyben bármely két számjegy összege kisebb, mint 6. Mennyi a Firkász által leírt szám számjegyeinek összege?',
          options: { A: '4', B: '5', C: '6', D: '9', E: '10' }, key: 'B' },
    11: { text: 'Az ábrán 16 kisnégyzet látható. Hány olyan van közöttük, amelyiknek csak olyan szomszédos kisnégyzete van, amelyben páros szám áll? (Két kisnégyzet szomszédos, ha van közös oldaluk.)', img: 'feladat-11.png',
          options: { A: '4', B: '5', C: '6', D: '7', E: '8' }, key: 'E' },
    12: { text: 'Az 1. ábrán látható gyűrűt négy darabra szétvágtuk. Melyik a 2. ábrán az a darab, amelyik nem a szétvágás során keletkezett?', img: 'feladat-12.png',
          options: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, key: 'D' },
    13: { text: 'Hány olyan háromjegyű pozitív egész szám van, amelynek mindhárom számjegye osztható 6-tal?',
          options: { A: '1', B: '2', C: '3', D: '4', E: '8' }, key: 'D' },
    // 14.: a PDF szövegkivonatából a kivonójel kimaradt; az ábra szerint a második feltétel P + A + P \u2212 A = 12 → P = 6, A = 8.
    14: { text: 'Mennyi az A + P + A összeg, ha P + A + P + A = 28 és P + A + P \u2212 A = 12?',
          options: { A: '12', B: '14', C: '20', D: '22', E: '27' }, key: 'D' },
    // 15.: a kitöltés: \u22122, 1, 4, 1, 7 (az üres négyzetek összege 30 \u2212 19 = 11); az egyik szám negatív.
    15: { text: 'Az ábrán látható 3\u00d73-as táblázatot Kati úgy tölti ki, hogy a táblázat minden sorában és minden oszlopában 10 legyen a három szám összege. Mennyi azoknak a számoknak az összege, amelyeket az üres négyzetekbe ír?', img: 'feladat-15.png',
          options: { A: '11', B: '15', C: '28', D: '30', E: 'Nem lehet így kitölteni a táblázatot.' }, key: 'A' },
    16: { text: 'Egy négyzet alakú papírlapot két lépésben meghajtogattunk, majd a fekete körrel jelzett helyen kilyukasztottuk (lásd ábra). Ezután a lapot kihajtogattuk. Melyiket kaptuk, ha a lyukakat fekete körök jelölik?', img: 'feladat-16.png',
          options: { A: OPTIMG('A'), B: OPTIMG('B'), C: OPTIMG('C'), D: OPTIMG('D'), E: OPTIMG('E') }, key: 'D' },
    17: { text: 'Az ábrán látható számegyenesen az öt betű öt pozitív egész számot jelöl, és két szomszédos beosztás távolsága 1. Az öt szám közül két szám egyjegyű és három szám páratlan. Az egyik szám többszöröse 5-nek. Melyik betű jelöli ezt a számot?', img: 'feladat-17.png',
          options: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, key: 'D' },
    18: { text: 'Egy kalapba belehelyeztük a ' + KARTYA('ZRÍNYI') + ' betűkártyákat és a ' + KARTYA('2021') + ' számkártyákat. Hány kártyát kell becsukott szemmel (véletlenszerűen) kihúznunk a kalapból ahhoz, hogy a kihúzott kártyák között legyen betűt, páros számot és páratlan számot tartalmazó, ha a kihúzott kártyák száma a lehető legkevesebb?',
          options: { A: '3', B: '6', C: '8', D: '9', E: '10' }, key: 'E' },
    19: { text: 'Hányféleképpen választhatunk ki két egyjegyű természetes számot úgy, hogy az összegük páratlan szám legyen? (Két kiválasztás nem különböző, ha ugyanazokat a számokat tartalmazza.)',
          options: { A: '20', B: '25', C: '45', D: '50', E: '90' }, key: 'B' },
    20: { text: 'A hét törpe egy háromszemélyes asztalnál úgy ebédel meg, hogy egyszerre három törpe ülhet le enni, és ha valaki végzett, rögtön más ül a helyére. Hapci 17, Kuka 20, Morgó 27, Tudor 26, Szende 18, Szundi 29, Vidor 28 perc alatt ebédel meg. Először Hapci és Szundi ül le az asztalhoz. Ki legyen ekkor a harmadik, ha a hét törpe a lehető legrövidebb idő alatt ebédel meg?',
          options: { A: 'Kuka', B: 'Hapci vagy Szundi', C: 'Tudor', D: 'Morgó vagy Vidor', E: 'Szende' }, key: 'D' },
    21: { text: 'Az ábrán látható 24 kör mindegyike szürke vagy fehér színű. Peti ezek közül néhány szürke kört fehérre, néhány fehér kört szürkére színezett át úgy, hogy a színezés után minden szürke kör összes szomszédja fehér, és minden fehér kör összes szomszédja szürke lett. Hány kört színezett át Peti, ha a lehető legkevesebbet színezte át? (Két kör szomszédos, ha érintkeznek.)', img: 'feladat-21.png',
          options: { A: '5', B: '7', C: '9', D: '11', E: '13' }, key: 'D' },
    22: { text: 'A 2021-es évben 52 kedd és 53 péntek van. Milyen nap lesz december 31-én?',
          options: { A: 'kedd', B: 'szerda', C: 'csütörtök', D: 'péntek', E: 'szombat' }, key: 'D' },
    23: { text: 'Anna talált egy papírlapot, amelyre valaki egymás alá felírt 2021 darab számot. Sokáig nézegetve a papírlapot észrevette, hogy a második számot elosztva az elsővel a hányados éppen a harmadik számmal egyenlő és így tovább, azaz például a tizedik szám egyenlő a kilencedik és a nyolcadik szám hányadosával. Mennyi az utolsó szám a papírlapon, ha az első a 43, a második pedig a 47?',
          options: { A: '\\(\\frac{1}{47}\\)', B: '\\(\\frac{1}{43}\\)', C: '43', D: '47', E: '2021' }, key: 'A' },
    24: { text: 'Egy egybevágó négyzetekből összerakott téglalapból elvettünk néhány négyzetet úgy, hogy területe \\(\\frac{11}{16}\\) részével csökkent. Így az ábrán látható sokszöget kaptuk. Hányféle alakú lehetett az eredeti téglalap? (Két téglalap különböző alakú, ha nem egybevágóak.)', img: 'feladat-24.png',
          options: { A: '2', B: '3', C: '4', D: '5', E: '6' }, key: 'B' },
    25: { text: 'Jancsi és Juliska egy százemeletes házban laknak, ahol minden emeleten 20 lakás van. A lakásokat az 1. emelet első lakásától kezdve sorban egyesével sorszámmal látták el egészen a 100. emelet 2000. lakásáig. (A földszinten nincsenek lakások.) Annak az emeletnek a sorszáma, ahol Jancsi lakása van egyenlő Juliska lakásának sorszámával. Lakásaik sorszámainak összege 2021. Hányadik emeleten lakik Juliska?',
          options: { A: '4.', B: '5.', C: '6.', D: '7.', E: '96.' }, key: 'B' }
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
      <p class="subtitle">Online feladatsor – 6. osztály · 2021. évi megyei forduló</p>
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
