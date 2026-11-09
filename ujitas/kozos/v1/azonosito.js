/**
 * kozos/v1/azonosito.js – személyes kód bekérése (élő módban töltődik be)
 *
 * A diák nevet nem ír be, csak a kódját (pl. K7M2-9QXA). A nevet és az osztályt a szerver tölti ki a kód alapján.
 * Az utolsó karakter ellenőrző: az elgépelést azonnal jelzi (ugyanaz a számítás, mint az Apps Scriptben).
 * A kód csak a böngésző munkamenetében (sessionStorage) marad meg, a lap bezárásával törlődik –
 * közös tableten így nem maradhat meg a következő diáknak.
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
      const tovabb = function () { const n = norm(inp.value); if (ervenyes(n)) { tar.set(n); lezar(n); } };
      inp.addEventListener('input', frissit);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tovabb(); });
      ok.addEventListener('click', tovabb);
      meg.addEventListener('click', function () { lezar(''); });
      inp.focus();
    });
  }

  U.hook('indulas', async function () {
    if (U.kod) return true;
    const mentett = norm(tar.get());
    if (ervenyes(mentett)) { U.kod = mentett; return true; }
    const n = await kerdez();
    if (!n) return false;
    U.kod = n;
    return true;
  });
  U._modulok.azonosito = true;
})(window.UJITAS);
