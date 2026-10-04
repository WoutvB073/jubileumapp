/*
  SPEL: WOORDPUZZELS (woordzoekers + kruiswoordpuzzel)
  ------------------------------------------------------------
  Woordzoekers (CONTENT.woordzoeker.puzzels): veeg over de letters.
  Woorden staan horizontaal, verticaal of schuin, nooit achterstevoren.
  De overgebleven letters vormen samen een zin. Het raster wordt in
  de browser gemaakt, maar altijd hetzelfde (vaste 'toevalsreeks' per
  titel), zodat bewaarde voortgang blijft kloppen.

  Kruiswoordpuzzel (CONTENT.woordzoeker.kruiswoord): wordt ook in de
  browser opgebouwd. Gemarkeerde vakjes vormen het oplossingswoord
  (kruiswoordOplossing).

  Hartjes:
  - woordzoeker: 0 tips = 3, 1-2 tips = 2, meer = 1
  - kruiswoord: 0-2 foute letters bij 'Controleer' = 3, 3-6 = 2, meer = 1
  De tegel krijgt het gemiddelde zodra de kruiswoordpuzzel en minstens
  één woordzoeker af zijn (woordzoekers tellen als gemiddelde).
*/
(function () {
  'use strict';

  const KLEUREN = ['#f6b8ca', '#cdb8f0', '#f9c9b0', '#a8dcc4', '#f7e09a', '#b9cff0', '#f3a6c8', '#bde3d0'];
  const RICHTINGEN = [[0, 1], [1, 0], [1, 1], [-1, 1]];   // rechts, omlaag, schuin omlaag, schuin omhoog
  const RIJEN = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  let api = null;
  let wortel = null;
  let timers = [];
  let toetsLuisteraar = null;
  let sleep = null;

  /* ----------------------------------------------------------
     Hulpjes
     ---------------------------------------------------------- */
  function el(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  function knop(klasse, tekst, actie) {
    const k = el('button', klasse, tekst);
    k.type = 'button';
    k.addEventListener('click', actie);
    return k;
  }

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function opruimen() {
    timers.forEach(clearTimeout);
    timers = [];
    if (toetsLuisteraar) document.removeEventListener('keydown', toetsLuisteraar);
    toetsLuisteraar = null;
    sleep = null;
  }

  const alleenLetters = (s) => String(s || '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
  const hartjesTekst = (n) => '💗'.repeat(n) + '🤍'.repeat(3 - n);
  const wz = () => api.content.woordzoeker || {};

  // Vaste 'toevalsreeks' op basis van een tekst: elke keer dezelfde puzzel.
  function rng(tekst) {
    let h = 1779033703 ^ tekst.length;
    for (let i = 0; i < tekst.length; i++) { h = Math.imul(h ^ tekst.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function opslag() {
    const o = api.opslag.lees();
    return { zoekers: o.zoekers || {}, kruis: o.kruis || {} };
  }

  // Tegel bijwerken als de kruiswoord en minstens één woordzoeker af zijn.
  function werkTegelBij() {
    const o = opslag();
    const zoekerScores = Object.values(o.zoekers).filter((z) => z && z.klaar).map((z) => z.hartjes || 1);
    if (!o.kruis.klaar || !zoekerScores.length) return;
    const gemZoeker = zoekerScores.reduce((a, b) => a + b, 0) / zoekerScores.length;
    api.klaar({ hartjes: Math.round((gemZoeker + (o.kruis.hartjes || 1)) / 2) });
  }

  function nieuwScherm(rechts) {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const balk = el('div', 'ws-balk');
    balk.append(knop('fotos-terug', '‹ Woordpuzzels', toonKeuze));
    const r = el('span', 'ws-stand', rechts || '');
    balk.append(r);
    wortel.append(balk);
    return r;
  }

  /* ----------------------------------------------------------
     Keuzescherm
     ---------------------------------------------------------- */
  function toonKeuze() {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const o = opslag();
    wortel.append(el('p', 'fotos-intro', 'Zoeken en kruisen met onze woorden. De letters die overblijven zeggen ook nog iets.'));

    wortel.append(el('h3', 'sd-niveau-titel wzk-kop', 'Woordzoekers'));
    const rij = el('div', 'sd-puzzels');
    (wz().puzzels || []).forEach((p) => {
      const s = o.zoekers[p.titel] || {};
      const k = knop('sd-puzzel wzk-puzzel', null, () => startZoeker(p));
      let status = 'nieuw';
      if (s.klaar) status = '♥'.repeat(s.hartjes || 1) + '♡'.repeat(3 - (s.hartjes || 1));
      else if (s.gevonden && s.gevonden.length) status = `${s.gevonden.length} van ${p.woorden.length}`;
      k.append(el('span', 'sd-puzzel-naam', p.titel), el('span', 'sd-puzzel-status', status));
      if (s.klaar) k.classList.add('klaar');
      rij.append(k);
    });
    wortel.append(rij);

    const kw = o.kruis;
    const kaart = knop('fotos-keuze wzk-kruis', null, startKruis);
    const status = el('span', 'fotos-keuze-status');
    if (kw.klaar) status.textContent = '♥'.repeat(kw.hartjes || 1) + '♡'.repeat(3 - (kw.hartjes || 1));
    else if (kw.letters && Object.keys(kw.letters).length) status.append(el('span', 'pil', 'bezig…'));
    else status.append(el('span', 'pil', 'nog niet gespeeld'));
    kaart.append(el('span', 'tegel-icoon', '✏️'), el('span', 'fotos-keuze-titel', 'Kruiswoordpuzzel'), el('span', 'fotos-keuze-sub', 'Hints over ons, één oplossingswoord'), status);
    wortel.append(kaart);
  }

  /* ==========================================================
     WOORDZOEKER
     ========================================================== */
  function telVoorkomens(raster, N, woord) {
    let n = 0;
    const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of dirs) {
      let ok = true;
      for (let k = 0; k < woord.length && ok; k++) {
        const R = r + dr * k, C = c + dc * k;
        if (R < 0 || R >= N || C < 0 || C >= N || raster[R * N + C] !== woord[k]) ok = false;
      }
      if (ok) n++;
    }
    return n;
  }

  // Raster maken waarin de overgebleven letters precies de zin vormen.
  function maakZoeker(p) {
    const N = p.grootte || 10;
    const random = rng(p.titel);
    const lijst = p.woorden.map(alleenLetters);
    const zin = alleenLetters(p.zin);
    const nodig = lijst.reduce((s, w) => s + w.length, 0) - (N * N - zin.length);   // benodigde overlappingen
    let reserve = null;
    for (let poging = 0; poging < 6000; poging++) {
      const raster = Array(N * N).fill(null);
      const plekken = [];
      let overlap = 0;
      let gelukt = true;
      const volgorde = lijst.slice().sort((a, b) => b.length - a.length || random() - 0.5);
      for (const w of volgorde) {
        const kandidaten = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (let d = 0; d < 4; d++) {
          const [dr, dc] = RICHTINGEN[d];
          const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
          if (er < 0 || er >= N || ec < 0 || ec >= N) continue;
          let ov = 0, ok = true;
          for (let k = 0; k < w.length; k++) {
            const v = raster[(r + dr * k) * N + c + dc * k];
            if (v === null) continue;
            if (v !== w[k]) { ok = false; break; }
            ov++;
          }
          if (ok && ov < w.length) kandidaten.push({ r, c, d, ov });
        }
        const binnen = nodig >= 0 ? kandidaten.filter((k) => overlap + k.ov <= nodig) : kandidaten;
        if (!binnen.length) { gelukt = false; break; }
        const k = binnen[Math.floor(random() * binnen.length)];
        const [dr, dc] = RICHTINGEN[k.d];
        for (let i = 0; i < w.length; i++) raster[(k.r + dr * i) * N + k.c + dc * i] = w[i];
        overlap += k.ov;
        plekken.push({ woord: w, r1: k.r, c1: k.c, r2: k.r + dr * (w.length - 1), c2: k.c + dc * (w.length - 1) });
      }
      if (!gelukt) continue;
      const sluitend = overlap === nodig;
      if (!sluitend && reserve) continue;
      // Lege vakjes vullen: met de zin, en als die niet precies past met willekeurige letters
      const kopie = raster.slice();
      let z = 0;
      for (let i = 0; i < N * N; i++) {
        if (kopie[i] === null) kopie[i] = z < zin.length ? zin[z++] : 'ABCDEFGHIJKLMNOPRSTUVWZ'[Math.floor(random() * 23)];
      }
      if (lijst.some((w) => telVoorkomens(kopie, N, w) !== 1)) continue;
      const uitkomst = { N, letters: kopie, plekken, zin: p.zin, sluitend };
      if (sluitend) return uitkomst;
      reserve = uitkomst;
      if (poging > 3000) break;
    }
    return reserve;
  }

  function startZoeker(p) {
    const puzzel = maakZoeker(p);
    const standEl = nieuwScherm();
    if (!puzzel) {
      wortel.append(el('p', 'fotos-intro', 'Deze woordzoeker lukt niet met deze woorden. Vraag Wout om content.js na te kijken. 💌'));
      return;
    }
    const { N, letters, plekken } = puzzel;
    const o = opslag();
    const s = Object.assign({ gevonden: [], tips: 0, klaar: false }, o.zoekers[p.titel]);
    const bewaar = () => { const nu = opslag(); nu.zoekers[p.titel] = s; api.opslag.bewaar({ zoekers: nu.zoekers }); };
    const toonStand = () => { standEl.textContent = `${s.gevonden.length} van ${plekken.length} gevonden`; };
    toonStand();

    wortel.append(el('p', 'sd-titel', p.titel));

    // Raster met letters + een tekenlaag voor de markeringen
    const bord = el('div', 'wzk-bord');
    bord.style.setProperty('--n', N);
    const rasterEl = el('div', 'wzk-raster');
    const vakken = letters.map((l) => { const v = el('span', 'wzk-letter', l); rasterEl.append(v); return v; });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${N} ${N}`);
    svg.setAttribute('class', 'wzk-lijnen');
    const keuzeLijn = document.createElementNS(svgNS, 'line');
    keuzeLijn.setAttribute('class', 'wzk-keuze');
    svg.append(keuzeLijn);
    bord.append(svg, rasterEl);
    wortel.append(bord);

    // Woordenlijst
    const lijst = el('div', 'wzk-lijst');
    const chips = {};
    plekken.slice().sort((a, b) => a.woord.localeCompare(b.woord)).forEach((pl) => {
      const c = el('span', 'wzk-woord', pl.woord);
      chips[pl.woord] = c;
      lijst.append(c);
    });
    wortel.append(lijst);
    const tipKnop = knop('sd-tool wzk-tip', '💡 Tip', geefTip);
    wortel.append(tipKnop);

    function lijn(pl, kleur) {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', pl.c1 + 0.5); l.setAttribute('y1', pl.r1 + 0.5);
      l.setAttribute('x2', pl.c2 + 0.5); l.setAttribute('y2', pl.r2 + 0.5);
      l.setAttribute('stroke', kleur);
      l.setAttribute('class', 'wzk-gevonden');
      svg.insertBefore(l, keuzeLijn);
    }

    function markeerGevonden(woord, animeer) {
      const pl = plekken.find((x) => x.woord === woord);
      if (!pl) return;
      const nr = plekken.indexOf(pl);
      lijn(pl, KLEUREN[nr % KLEUREN.length]);
      const c = chips[woord];
      c.classList.add('gevonden');
      c.style.setProperty('--kleur', KLEUREN[nr % KLEUREN.length]);
      if (animeer) { c.classList.add('pop'); }
    }
    s.gevonden.forEach((w) => markeerGevonden(w, false));

    // --- Vegen ---
    function vakOnder(x, y) {
      const r = rasterEl.getBoundingClientRect();
      const kol = Math.max(0, Math.min(N - 1, Math.floor((x - r.left) / (r.width / N))));
      const rij = Math.max(0, Math.min(N - 1, Math.floor((y - r.top) / (r.height / N))));
      return { r: rij, c: kol };
    }

    // Eind recht trekken naar horizontaal, verticaal of schuin
    function rechtTrekken(a, b) {
      let dr = b.r - a.r, dc = b.c - a.c;
      if (Math.abs(dc) > 2 * Math.abs(dr)) dr = 0;
      else if (Math.abs(dr) > 2 * Math.abs(dc)) dc = 0;
      else { const n = Math.max(Math.abs(dr), Math.abs(dc)); dr = Math.sign(dr) * n; dc = Math.sign(dc) * n; }
      let r = a.r + dr, c = a.c + dc;
      // binnen het raster houden
      while ((r < 0 || r >= N || c < 0 || c >= N) && (r !== a.r || c !== a.c)) { r -= Math.sign(dr); c -= Math.sign(dc); }
      return { r, c };
    }

    function toonKeuzeLijn(a, b) {
      keuzeLijn.setAttribute('x1', a.c + 0.5); keuzeLijn.setAttribute('y1', a.r + 0.5);
      keuzeLijn.setAttribute('x2', b.c + 0.5); keuzeLijn.setAttribute('y2', b.r + 0.5);
      keuzeLijn.style.opacity = '1';
    }

    bord.addEventListener('pointerdown', (e) => {
      if (s.klaar) return;
      e.preventDefault();
      const a = vakOnder(e.clientX, e.clientY);
      sleep = { a, b: a, id: e.pointerId };
      try { bord.setPointerCapture(e.pointerId); } catch (f) { /* niet erg */ }
      toonKeuzeLijn(a, a);
    });
    bord.addEventListener('pointermove', (e) => {
      if (!sleep || e.pointerId !== sleep.id) return;
      sleep.b = rechtTrekken(sleep.a, vakOnder(e.clientX, e.clientY));
      toonKeuzeLijn(sleep.a, sleep.b);
    });
    const loslaten = (e) => {
      if (!sleep || e.pointerId !== sleep.id) return;
      const { a, b } = sleep;
      sleep = null;
      keuzeLijn.style.opacity = '0';
      const n = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c));
      if (!n) return;
      const dr = Math.sign(b.r - a.r), dc = Math.sign(b.c - a.c);
      let woord = '';
      for (let k = 0; k <= n; k++) woord += letters[(a.r + dr * k) * N + a.c + dc * k];
      const omgekeerd = woord.split('').reverse().join('');
      const pl = plekken.find((x) => !s.gevonden.includes(x.woord) && (x.woord === woord || x.woord === omgekeerd));
      if (pl) {
        s.gevonden.push(pl.woord);
        markeerGevonden(pl.woord, true);
        toonStand();
        bewaar();
        if (s.gevonden.length === plekken.length) later(klaar, 500);
      } else {
        bord.classList.remove('mis'); void bord.offsetWidth; bord.classList.add('mis');
      }
    };
    bord.addEventListener('pointerup', loslaten);
    bord.addEventListener('pointercancel', loslaten);

    function geefTip() {
      const nog = plekken.find((x) => !s.gevonden.includes(x.woord));
      if (!nog || s.klaar) return;
      s.tips++;
      bewaar();
      const v = vakken[nog.r1 * N + nog.c1];
      v.classList.remove('tip'); void v.offsetWidth; v.classList.add('tip');
      api.toast(`${nog.woord} begint hier`);
    }

    // Alles gevonden: overgebleven letters oplichten en de zin tonen
    function klaar() {
      const opWoord = new Set();
      plekken.forEach((pl) => {
        const n = Math.max(Math.abs(pl.r2 - pl.r1), Math.abs(pl.c2 - pl.c1));
        const dr = Math.sign(pl.r2 - pl.r1), dc = Math.sign(pl.c2 - pl.c1);
        for (let k = 0; k <= n; k++) opWoord.add((pl.r1 + dr * k) * N + pl.c1 + dc * k);
      });
      let nr = 0;
      vakken.forEach((v, i) => {
        if (!opWoord.has(i)) { v.style.animationDelay = (nr++ * 0.04) + 's'; v.classList.add('zin'); }
      });
      if (!s.klaar) {
        s.klaar = true;
        s.hartjes = s.tips === 0 ? 3 : s.tips <= 2 ? 2 : 1;
        bewaar();
        werkTegelBij();
      }
      tipKnop.remove();
      const kaart = el('div', 'sd-klaar');
      kaart.append(
        el('p', 'quiz-hartjes', hartjesTekst(s.hartjes)),
        el('h3', 'sier', 'Alles gevonden!'),
        el('p', 'quiz-slot', puzzel.sluitend ? 'De letters die overbleven:' : 'Met deze woorden paste de zin niet precies, maar dit was hem:'),
        el('p', 'wzk-zin', `“${puzzel.zin}”`),
        el('p', 'quiz-score', s.tips ? `${s.tips} ${s.tips === 1 ? 'tip' : 'tips'} gebruikt` : 'Zonder tips'),
        knop('knop', 'Terug naar woordpuzzels', toonKeuze),
      );
      wortel.append(kaart);
      later(() => kaart.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300);
    }

    if (s.klaar) klaar();
  }

  /* ==========================================================
     KRUISWOORDPUZZEL
     ========================================================== */
  // Woorden zo compact mogelijk laten kruisen (max 10 bij 10).
  function maakKruiswoord(items, maxMaat = 10) {
    const random = rng('kruiswoord:' + items.map((i) => i.woord).join(','));
    let beste = null;
    for (let poging = 0; poging < 400; poging++) {
      const volgorde = items.slice().sort((a, b) => b.woord.length - a.woord.length + (random() - 0.5) * 3);
      const vak = new Map();
      const geplaatst = [];
      const zet = (w, r, c, h) => { for (let k = 0; k < w.length; k++) vak.set(h ? `${r},${c + k}` : `${r + k},${c}`, w[k]); };
      const leeg = (r, c) => !vak.has(`${r},${c}`);
      const kan = (w, r, c, h) => {
        let kruisingen = 0;
        const dr = h ? 0 : 1, dc = h ? 1 : 0;
        if (!leeg(r - dr, c - dc) || !leeg(r + dr * w.length, c + dc * w.length)) return -1;
        for (let k = 0; k < w.length; k++) {
          const R = r + dr * k, C = c + dc * k;
          const v = vak.get(`${R},${C}`);
          if (v !== undefined) {
            if (v !== w[k]) return -1;
            if (geplaatst.some((g) => g.h === h && (h ? g.r === R && C >= g.c && C < g.c + g.woord.length : g.c === C && R >= g.r && R < g.r + g.woord.length))) return -1;
            kruisingen++;
          } else if (!leeg(R + dc, C + dr) || !leeg(R - dc, C - dr)) return -1;
        }
        return kruisingen;
      };
      const [eerste, ...rest] = volgorde;
      zet(eerste.woord, 0, 0, true);
      geplaatst.push(Object.assign({}, eerste, { r: 0, c: 0, h: true }));
      let wachtrij = rest.slice();
      for (let ronde = 0; ronde < 3 && wachtrij.length; ronde++) {
        const nog = [];
        for (const it of wachtrij) {
          const w = it.woord;
          let opties = [];
          for (const g of geplaatst) for (let i = 0; i < g.woord.length; i++) for (let k = 0; k < w.length; k++) {
            if (g.woord[i] !== w[k]) continue;
            const h = !g.h;
            const r = g.h ? g.r - k : g.r + i;
            const c = g.h ? g.c + i : g.c - k;
            const kr = kan(w, r, c, h);
            if (kr > 0) opties.push({ r, c, h, kr });
          }
          opties = opties.filter((o) => {
            const rs = geplaatst.flatMap((g) => [g.r, g.h ? g.r : g.r + g.woord.length - 1]).concat([o.r, o.h ? o.r : o.r + w.length - 1]);
            const cs = geplaatst.flatMap((g) => [g.c, g.h ? g.c + g.woord.length - 1 : g.c]).concat([o.c, o.h ? o.c + w.length - 1 : o.c]);
            return Math.max(...rs) - Math.min(...rs) < maxMaat && Math.max(...cs) - Math.min(...cs) < maxMaat;
          });
          if (!opties.length) { nog.push(it); continue; }
          opties.sort((a, b) => b.kr - a.kr || random() - 0.5);
          const o = opties[0];
          zet(w, o.r, o.c, o.h);
          geplaatst.push(Object.assign({}, it, { r: o.r, c: o.c, h: o.h }));
        }
        wachtrij = nog;
      }
      if (wachtrij.length) continue;
      const sleutels = [...vak.keys()].map((k) => k.split(',').map(Number));
      const minR = Math.min(...sleutels.map((x) => x[0])), minC = Math.min(...sleutels.map((x) => x[1]));
      const rijen = Math.max(...sleutels.map((x) => x[0])) - minR + 1;
      const kolommen = Math.max(...sleutels.map((x) => x[1])) - minC + 1;
      const score = Math.max(rijen, kolommen) * 10 + (rijen * kolommen) / 10;
      if (!beste || score < beste.score) {
        beste = { score, rijen, kolommen, woorden: geplaatst.map((g) => Object.assign({}, g, { r: g.r - minR, c: g.c - minC })) };
      }
    }
    return beste;
  }

  function startKruis() {
    const items = (wz().kruiswoord || [])
      .map((it) => ({ woord: alleenLetters(it.woord), hint: it.hint || '' }))
      .filter((it) => it.woord.length > 1);
    const standEl = nieuwScherm();
    const kw = items.length ? (maakKruiswoord(items) || maakKruiswoord(items, 13)) : null;
    if (!kw) {
      wortel.append(el('p', 'fotos-intro', 'Deze kruiswoordpuzzel lukt niet met deze woorden. Vraag Wout om content.js na te kijken. 💌'));
      return;
    }
    const { rijen, kolommen, woorden } = kw;

    // Vakjes en nummers
    const cel = {};   // "r,c" -> { letter, woorden: { h: woord, v: woord } }
    woorden.forEach((w) => {
      for (let k = 0; k < w.woord.length; k++) {
        const r = w.h ? w.r : w.r + k, c = w.h ? w.c + k : w.c;
        const s = `${r},${c}`;
        cel[s] = cel[s] || { r, c, letter: w.woord[k], woorden: {} };
        cel[s].woorden[w.h ? 'h' : 'v'] = w;
      }
    });
    let nr = 0;
    const startNr = {};
    woorden.slice().sort((a, b) => a.r - b.r || a.c - b.c).forEach((w) => {
      const s = `${w.r},${w.c}`;
      if (!startNr[s]) startNr[s] = ++nr;
      w.nr = startNr[s];
    });

    // Oplossingswoord: per letter een vakje, zoveel mogelijk in verschillende woorden
    const oplossing = alleenLetters(wz().kruiswoordOplossing || '');
    const random = rng('oplossing:' + oplossing);
    const oplVakken = [];
    const gebruikteWoorden = new Set();
    [...oplossing].forEach((letter) => {
      const kandidaten = Object.keys(cel).filter((s) => cel[s].letter === letter && !oplVakken.includes(s));
      if (!kandidaten.length) return;
      kandidaten.sort((a, b) => {
        const nieuwA = Object.values(cel[a].woorden).some((w) => !gebruikteWoorden.has(w.woord)) ? 0 : 1;
        const nieuwB = Object.values(cel[b].woorden).some((w) => !gebruikteWoorden.has(w.woord)) ? 0 : 1;
        return nieuwA - nieuwB || random() - 0.5;
      });
      const s = kandidaten[0];
      oplVakken.push(s);
      Object.values(cel[s].woorden).forEach((w) => gebruikteWoorden.add(w.woord));
    });
    const oplossingOk = oplVakken.length === oplossing.length;

    // Stand
    const o = opslag();
    const st = Object.assign({ letters: {}, fouten: 0, klaar: false }, o.kruis);
    const bewaar = () => api.opslag.bewaar({ kruis: st });
    let huidig = null;            // "r,c"
    let richting = 'h';
    const toonStand = () => {};   // foute letters worden aan het eind getoond
    toonStand();

    // Hint
    const hintEl = el('div', 'kw-hint');
    wortel.append(hintEl);

    // Raster
    const raster = el('div', 'kw-raster');
    raster.style.setProperty('--k', kolommen);
    raster.style.setProperty('--r', rijen);
    const vakEls = {};
    for (let r = 0; r < rijen; r++) for (let c = 0; c < kolommen; c++) {
      const s = `${r},${c}`;
      const v = el('div', cel[s] ? 'kw-vak' : 'kw-leeg');
      if (cel[s]) {
        v.dataset.s = s;
        if (startNr[s]) v.append(el('span', 'kw-nr', String(startNr[s])));
        const i = oplVakken.indexOf(s);
        if (i >= 0) { v.classList.add('opl'); v.append(el('span', 'kw-opl-nr', String(i + 1))); }
        v.append(el('span', 'kw-letter', st.letters[s] || ''));
        vakEls[s] = v;
      }
      raster.append(v);
    }
    raster.addEventListener('click', (e) => {
      const v = e.target.closest('.kw-vak');
      if (v && !st.klaar) kies(v.dataset.s);
    });
    wortel.append(raster);

    // Oplossingswoord-vakjes
    const oplRij = el('div', 'kw-oplossing');
    if (oplossingOk) {
      oplRij.append(el('span', 'kw-opl-label', 'Oplossing'));
      oplVakken.forEach((s, i) => { const b = el('span', 'kw-opl-vak'); b.dataset.i = i; oplRij.append(b); });
      wortel.append(oplRij);
    }

    // Controleer (bovenin, scheelt ruimte) + toetsenbord
    const controle = knop('sd-tool kw-controle', '✓ Controleer', controleer);
    standEl.replaceWith(controle);
    const toetsen = maakToetsenbord(typ);
    wortel.append(toetsen);

    // Past alles op het scherm? Zo niet: vakjes iets kleiner, zodat het toetsenbord
    // nooit achter de thuisbalk valt.
    function pasAan() {
      if (!toetsen.isConnected) return;
      window.scrollTo(0, 0);
      const onder = parseFloat(getComputedStyle(wortel.closest('.scherm')).paddingBottom) || 20;
      const teveel = toetsen.getBoundingClientRect().bottom - (window.innerHeight - onder);
      if (teveel <= 0) return;
      const nu = raster.querySelector('.kw-vak').getBoundingClientRect().width;
      raster.style.setProperty('--cel', Math.max(22, Math.floor(nu - (teveel + 2) / rijen)) + 'px');
    }
    requestAnimationFrame(pasAan);

    function woordVan(s, r) { return cel[s] && cel[s].woorden[r]; }
    function vakkenVan(w) {
      return [...Array(w.woord.length)].map((_, k) => (w.h ? `${w.r},${w.c + k}` : `${w.r + k},${w.c}`));
    }

    function kies(s) {
      if (s === huidig && woordVan(s, 'h') && woordVan(s, 'v')) richting = richting === 'h' ? 'v' : 'h';
      else if (!woordVan(s, richting)) richting = richting === 'h' ? 'v' : 'h';
      huidig = s;
      teken();
    }

    function teken() {
      const w = huidig ? woordVan(huidig, richting) : null;
      const actief = new Set(w ? vakkenVan(w) : []);
      Object.entries(vakEls).forEach(([s, v]) => {
        v.classList.toggle('actief', actief.has(s));
        v.classList.toggle('huidig', s === huidig);
        v.querySelector('.kw-letter').textContent = st.letters[s] || '';
      });
      hintEl.textContent = '';
      if (w) hintEl.append(el('b', '', `${w.nr} ${w.h ? '→' : '↓'}`), el('span', '', w.hint));
      else hintEl.append(el('span', 'kw-hint-leeg', st.klaar ? 'Opgelost!' : 'Tik op een vakje om te beginnen'));
      oplRij.querySelectorAll('.kw-opl-vak').forEach((b) => { b.textContent = st.letters[oplVakken[b.dataset.i]] || ''; });
      toonStand();
    }

    function typ(toets) {
      if (st.klaar) return;
      if (!huidig) { api.toast('Tik eerst op een vakje'); return; }
      const w = woordVan(huidig, richting);
      const lijst = w ? vakkenVan(w) : [huidig];
      const plek = lijst.indexOf(huidig);
      if (toets === 'WIS') {
        if (st.letters[huidig]) delete st.letters[huidig];
        else if (plek > 0) { huidig = lijst[plek - 1]; delete st.letters[huidig]; }
      } else {
        st.letters[huidig] = toets;
        if (plek < lijst.length - 1) huidig = lijst[plek + 1];
      }
      bewaar();
      teken();
      controleerKlaar();
    }

    function controleerKlaar() {
      const alles = Object.keys(cel);
      if (alles.every((s) => st.letters[s] === cel[s].letter)) { later(klaar, 300); return; }
      if (alles.every((s) => st.letters[s])) api.toast('Alles ingevuld, maar nog niet alles klopt. Tik op Controleer.');
    }

    function controleer() {
      if (st.klaar) return;
      const fout = Object.keys(st.letters).filter((s) => cel[s] && st.letters[s] !== cel[s].letter);
      if (!fout.length) { api.toast(Object.keys(st.letters).length ? 'Alles wat er staat, klopt' : 'Er staat nog niks om te controleren'); return; }
      st.fouten += fout.length;
      bewaar();
      fout.forEach((s) => { const v = vakEls[s]; v.classList.remove('fout'); void v.offsetWidth; v.classList.add('fout'); });
      later(() => fout.forEach((s) => vakEls[s].classList.remove('fout')), 1600);
      toonStand();
    }

    function klaar() {
      if (!st.klaar) {
        st.klaar = true;
        st.hartjes = st.fouten <= 2 ? 3 : st.fouten <= 6 ? 2 : 1;
        bewaar();
        werkTegelBij();
      }
      opruimen();
      huidig = null;
      teken();
      raster.classList.add('opgelost');
      oplRij.classList.add('opgelost');
      controle.remove();
      const kaart = el('div', 'sd-klaar');
      kaart.append(
        el('p', 'quiz-hartjes', hartjesTekst(st.hartjes)),
        el('h3', 'sier', 'Kruiswoord af!'),
      );
      if (oplossingOk) kaart.append(el('p', 'kw-oplossingswoord', oplossing));
      kaart.append(
        el('p', 'quiz-score', st.fouten ? `${st.fouten} foute ${st.fouten === 1 ? 'letter' : 'letters'} onderweg` : 'Zonder foute letters'),
        knop('knop', 'Terug naar woordpuzzels', toonKeuze),
      );
      toetsen.replaceWith(kaart);
      later(() => kaart.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 200);
    }

    teken();
    if (st.klaar) klaar();
  }

  // Schermtoetsenbord (zelfde uiterlijk als bij de woordspellen), met ⌫.
  function maakToetsenbord(opDruk) {
    const bord = el('div', 'ws-toetsen');
    RIJEN.forEach((rij, r) => {
      const rijEl = el('div', 'ws-rij');
      [...rij].forEach((letter) => rijEl.append(knop('ws-toets', letter, () => opDruk(letter))));
      if (r === 2) {
        const w = knop('ws-toets breed', '⌫', () => opDruk('WIS'));
        w.setAttribute('aria-label', 'Wissen');
        rijEl.append(w);
      }
      bord.append(rijEl);
    });
    toetsLuisteraar = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[a-z]$/i.test(e.key)) opDruk(e.key.toUpperCase());
      else if (e.key === 'Backspace') opDruk('WIS');
    };
    document.addEventListener('keydown', toetsLuisteraar);
    return bord;
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'woordzoeker',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      toonKeuze();
    },
    stop() {
      opruimen();
    },
  });
})();
