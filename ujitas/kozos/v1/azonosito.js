/**
 * kozos/v1/azonosito.js – személyes kód bekérése (élő módban töltődik be)
 *
 * A diák nevet nem ír be, csak a kódját (pl. K7M2-9QXA). A nevet és az osztályt a szerver tölti ki a kód alapján.
 * Az utolsó karakter ellenőrző: az elgépelést azonnal jelzi (ugyanaz a számítás, mint az Apps Scriptben).
 * A kód csak a böngésző munkamenetében (sessionStorage) marad meg, a lap bezárásával törlődik –
 * közös tableten így nem maradhat meg a következő diáknak.
 *
 * UJITAS_CFG.kodEllenorzes = true: az ellenőrző karakter mellett a SZERVER is megmondja, hogy a kód létezik-e és az osztályé-e
 * (Apps Script: ?akcio=kod). Beküldés nélküli oldalakon (pl. gyakorló felmérő) ez adja a „csak kóddal indítható” védelmet.
 */
(function (U) {
  'use strict';
  const ABC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const KULCS = 'ujitas_kod';
  const norm = function (s) { return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  function ellenorzo(body) {
    let s = 0;
    for (let i = 0; i < body.length; i++) { const v = ABC.indexOf(body.charAt(i)); if (v < 0) return ''; s += (i + 1) * v; }
    return ABC.charAt(s % ABC.length);
  }
  const ervenyes = function (n) { return n.length === 8 && ellenorzo(n.slice(0, 7)) === n.charAt(7); };
  const formaz = function (n) { return n.length > 4 ? n.slice(0, 4) + '-' + n.slice(4) : n; };
  const tar = {
    get: function () { try { return sessionStorage.getItem(KULCS) || ''; } catch (e) { return ''; } },
    set: function (v) { try { sessionStorage.setItem(KULCS, v); } catch (e) { /* nem kritikus */ } },
  };
  const OK_KULCS = 'ujitas_kod_ok';                          // a szerver által megerősített kód + osztály
  const okTar = {
    get: function () { try { return sessionStorage.getItem(OK_KULCS) || ''; } catch (e) { return ''; } },
    set: function (v) { try { sessionStorage.setItem(OK_KULCS, v); } catch (e) { /* nem kritikus */ } },
  };
  const okJel = function (n) { return n + '|' + (U.cfg.classId || ''); };
  /** 'ok' | 'rossz' (a szerver szerint nem érvényes) | 'hiba' (nem sikerült megkérdezni) */
  async function szerverEllenorzes(n) {
    const url = window.UJITAS_URL;
    if (!url) return 'hiba';
    try {
      const ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 15000);
      const r = await fetch(url + '?akcio=kod&kod=' + encodeURIComponent(n) + '&osztaly=' + encodeURIComponent(U.cfg.classId || ''), { cache: 'no-store', signal: ctl.signal });
      clearTimeout(to);
      const d = await r.json();
      return d && d.ok === true ? 'ok' : (d && d.ok === false ? 'rossz' : 'hiba');
    } catch (e) { return 'hiba'; }
  }

  U.css('uj-azonosito',
    '.uj-kod{width:100%;box-sizing:border-box;margin-top:12px;padding:12px;border:2px solid #475569;border-radius:12px;' +
    'background:#020617;color:#f8fafc;text-align:center;font:700 24px Consolas,Menlo,monospace;letter-spacing:.15em;text-transform:uppercase}' +
    '.uj-kod:focus{outline:none;border-color:#38bdf8}' +
    '.uj-uzenet{min-height:1.5em;margin-top:8px;font-size:14px}.uj-hiba{color:#f87171}.uj-ok{color:#34d399}');

  function kerdez() {
    return new Promise(function (kesz) {
      const ov = document.createElement('div');
      ov.className = 'uj-ov';
      ov.innerHTML = '<div class="uj-box" role="dialog" aria-modal="true" aria-labelledby="uj-az-t">' +
        '<h2 id="uj-az-t">🔑 Azonosítás</h2>' +
        '<p>Írd be a személyes kódodat. A kódot a tanárodtól kaptad.</p>' +
        '<input class="uj-kod" type="text" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" ' +
        'inputmode="text" placeholder="XXXX-XXXX" aria-label="Személyes kód">' +
        '<div class="uj-uzenet" aria-live="polite"></div>' +
        '<button type="button" class="uj-btn" disabled>Tovább</button> ' +
        '<button type="button" class="uj-btn uj-masodlagos">Mégsem</button></div>';
      document.body.appendChild(ov);
      const inp = ov.querySelector('.uj-kod'), msg = ov.querySelector('.uj-uzenet');
      const ok = ov.querySelector('.uj-btn'), meg = ov.querySelector('.uj-masodlagos');
      const lezar = function (v) { ov.remove(); kesz(v); };
      const frissit = function () {
        const n = norm(inp.value).slice(0, 8);
        inp.value = formaz(n);
        const j = ervenyes(n);
        ok.disabled = !j;
        msg.className = 'uj-uzenet' + (n.length === 8 ? (j ? ' uj-ok' : ' uj-hiba') : '');
        msg.textContent = n.length === 8 ? (j ? 'Rendben ✔' : 'Elgépelted a kódot, ellenőrizd még egyszer.') : '';
      };
      const tovabb = async function () {
        const n = norm(inp.value); if (!ervenyes(n)) return;
        if (U.cfg.kodEllenorzes) {
          ok.disabled = true; msg.className = 'uj-uzenet'; msg.textContent = 'Ellenőrzés…';
          const v = await szerverEllenorzes(n);
          if (v !== 'ok') {
            ok.disabled = false; msg.className = 'uj-uzenet uj-hiba';
            msg.textContent = v === 'rossz' ? 'Ez a kód nem érvényes ehhez a felméréshez.' : 'Nem sikerült ellenőrizni a kódot. Próbáld újra.';
            return;
          }
          okTar.set(okJel(n));
        }
        tar.set(n); lezar(n);
      };
      inp.addEventListener('input', frissit);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tovabb(); });
      ok.addEventListener('click', tovabb);
      meg.addEventListener('click', function () { lezar(''); });
      inp.focus();
    });
  }

  U.hook('indulas', async function () {
    const kell = !!U.cfg.kodEllenorzes;
    if (U.kod && (!kell || U._kodOk)) return true;
    const mentett = norm(tar.get());
    if (ervenyes(mentett) && (!kell || okTar.get() === okJel(mentett))) { U.kod = mentett; U._kodOk = true; return true; }
    const n = await kerdez();
    if (!n) return false;
    U.kod = n; U._kodOk = kell;
    return true;
  });
  U._modulok.azonosito = true;
})(window.UJITAS);
