/*
  SPEL: KLEUREN OP NUMMER
  ------------------------------------------------------------
  Een foto (CONTENT.kleurplaten) wordt in de browser omgezet in een
  raster van vakjes met een beperkt palet (verkleinen per vakje +
  k-means in Lab-kleuren, vaste startwaarde). Per foto drie niveaus.

  Bediening op het canvas:
  - één vinger: kleuren (tikken of vegen)
  - twee vingers: zoomen en schuiven
  Een fout gekleurd vakje mag je gewoon overschrijven.

  Voortgang per foto + niveau in opslag.platen[sleutel]; daar staat
  ook het berekende raster zelf, zodat een bewaarde puzzel altijd
  hetzelfde blijft.

  Hartjes: makkelijk = 1, gemiddeld = 2, moeilijk = 3 (beste telt).
*/
(function () {
  'use strict';

  // Rasters voor staande foto's; liggende foto's krijgen ze andersom.
  const NIVEAUS = [
    { id: 'makkelijk', naam: 'Makkelijk', kol: 27, rij: 36, kleuren: 8, hartjes: 1, uitleg: 'Grote vakjes, weinig kleuren. Lijkt er een beetje op.' },
    { id: 'gemiddeld', naam: 'Gemiddeld', kol: 33, rij: 44, kleuren: 10, hartjes: 2, uitleg: 'Meer vakjes en kleuren. Gezichten worden herkenbaar.' },
    { id: 'moeilijk', naam: 'Moeilijk', kol: 42, rij: 56, kleuren: 12, hartjes: 3, uitleg: 'Veel vakjes, veel kleuren. Lijkt het meest op de echte foto.' },
  ];
  const MIN_CEL_CIJFER = 11;   // vanaf deze vakgrootte (px) staan er cijfers in
  const MAX_CEL = 64;          // maximale vakgrootte bij inzoomen (px)
  const TIK_WACHT = 70;        // ms wachten of er een tweede vinger bijkomt

  let api = null;
  let wortel = null;
  let opruimers = [];
  const rasterCache = {};

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

  function opruimen() {
    opruimers.forEach((f) => { try { f(); } catch (e) { /* niets */ } });
    opruimers = [];
  }

  function luister(doel, type, fn, opties) {
    doel.addEventListener(type, fn, opties);
    opruimers.push(() => doel.removeEventListener(type, fn, opties));
  }

  function platen() {
    return (api.content.kleurplaten || []).filter((p) => p && p.foto);
  }

  function bijschriftVan(plaat) {
    if (plaat.bijschrift) return plaat.bijschrift;
    const sleutel = (String(plaat.foto).match(/foto-\d+/) || [])[0];
    const u = sleutel && (api.content.fotoUitleg || {})[sleutel];
    return u ? u.bijschrift : '';
  }

  function opslag() {
    return api.opslag.lees().platen || {};
  }

  function bewaarPlaat(sleutel, data) {
    const alle = opslag();
    alle[sleutel] = Object.assign({}, alle[sleutel], data);
    api.opslag.bewaar({ platen: alle });
  }

  const sleutelVan = (plaat, niveau) => `${plaat.foto}|${niveau.id}`;
  const lichtheid = (k) => 0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2];
  const rgb = (k) => `rgb(${k[0]},${k[1]},${k[2]})`;

  /* ----------------------------------------------------------
     Foto omzetten naar een raster
     ---------------------------------------------------------- */
  async function laadBeeld(src) {
    const img = new Image();
    img.src = src;
    await img.decode();
    return img;
  }

  // Uitsnede van de foto in de verhouding van het raster (midden, iets naar boven voor gezichten)
  function uitsnede(img, kol, rij) {
    const doel = kol / rij;
    let sw = img.width, sh = img.height;
    if (sw / sh > doel) sw = sh * doel; else sh = sw / doel;
    return { sx: (img.width - sw) / 2, sy: Math.max(0, (img.height - sh) * 0.35), sw, sh };
  }

  async function zetOm(src, niveau) {
    const img = await laadBeeld(src);
    const liggend = img.width > img.height;
    const kol = liggend ? niveau.rij : niveau.kol;
    const rij = liggend ? niveau.kol : niveau.rij;
    const k = niveau.kleuren;

    const { sx, sy, sw, sh } = uitsnede(img, kol, rij);

    // Stapsgewijs verkleinen: per vakje de gemiddelde kleur
    let c = document.createElement('canvas');
    c.width = Math.round(sw); c.height = Math.round(sh);
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    while (c.width / 2 > kol * 2) {
      const n = document.createElement('canvas');
      n.width = Math.round(c.width / 2); n.height = Math.round(c.height / 2);
      const g = n.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(c, 0, 0, n.width, n.height);
      c = n;
    }
    const e = document.createElement('canvas');
    e.width = kol; e.height = rij;
    const eg = e.getContext('2d'); eg.imageSmoothingQuality = 'high';
    eg.drawImage(c, 0, 0, kol, rij);
    const d = eg.getImageData(0, 0, kol, rij).data;

    // RGB -> Lab
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const lab = [];
    for (let i = 0; i < d.length; i += 4) {
      const r = lin(d[i]), g = lin(d[i + 1]), b = lin(d[i + 2]);
      const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
      const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
      lab.push([116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z)), d[i], d[i + 1], d[i + 2]]);
    }

    // k-means++ met vaste startwaarde: elke keer hetzelfde resultaat
    let zaad = 22;
    const rnd = () => (zaad = (zaad * 16807) % 2147483647) / 2147483647;
    const afst = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    const cen = [lab[Math.floor(rnd() * lab.length)].slice(0, 3)];
    while (cen.length < k) {
      const dd = lab.map((p) => Math.min(...cen.map((cc) => afst(p, cc))));
      let s = dd.reduce((a, b) => a + b, 0) * rnd();
      let i = 0;
      while (i < dd.length - 1 && s > dd[i]) { s -= dd[i]; i++; }
      cen.push(lab[i].slice(0, 3));
    }
    const toe = new Array(lab.length).fill(0);
    for (let it = 0; it < 20; it++) {
      lab.forEach((p, i) => {
        let best = 0, bd = Infinity;
        cen.forEach((cc, j) => { const dd = afst(p, cc); if (dd < bd) { bd = dd; best = j; } });
        toe[i] = best;
      });
      const som = cen.map(() => [0, 0, 0, 0]);
      lab.forEach((p, i) => { const s = som[toe[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      som.forEach((s, j) => { if (s[3]) cen[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
    }

    // Paletkleur = gemiddelde echte kleur; lege groepen weg; licht -> donker sorteren
    const pal = cen.map(() => [0, 0, 0, 0]);
    lab.forEach((p, i) => { const s = pal[toe[i]]; s[0] += p[3]; s[1] += p[4]; s[2] += p[5]; s[3]++; });
    const gebruikt = pal.map((s, j) => ({ j, n: s[3], k: s[3] ? [Math.round(s[0] / s[3]), Math.round(s[1] / s[3]), Math.round(s[2] / s[3])] : null }))
      .filter((x) => x.n)
      .sort((a, b) => lichtheid(b.k) - lichtheid(a.k));
    const nieuwNr = {};
    gebruikt.forEach((x, i) => { nieuwNr[x.j] = i; });
    return {
      kol, rij,
      palet: gebruikt.map((x) => x.k),
      toe: toe.map((t) => nieuwNr[t]),
    };
  }

  // Raster ophalen: uit de opslag (als de puzzel al begonnen is), anders berekenen.
  async function rasterVoor(plaat, niveau) {
    const sleutel = sleutelVan(plaat, niveau);
    const bewaard = opslag()[sleutel];
    if (bewaard && bewaard.toe && bewaard.palet) {
      return { kol: bewaard.kol, rij: bewaard.rij, palet: bewaard.palet, toe: [...bewaard.toe].map((c) => parseInt(c, 36)) };
    }
    if (!rasterCache[sleutel]) rasterCache[sleutel] = zetOm(plaat.foto, niveau);
    return rasterCache[sleutel];
  }

  // Klein voorbeeld (pixelversie) in een canvas.
  function tekenVoorbeeld(canvas, r, gekleurd) {
    canvas.width = r.kol;
    canvas.height = r.rij;
    const g = canvas.getContext('2d');
    const im = g.createImageData(r.kol, r.rij);
    r.toe.forEach((t, i) => {
      const k = gekleurd ? (gekleurd[i] ? r.palet[t] : [255, 255, 255]) : r.palet[t];
      im.data.set([k[0], k[1], k[2], 255], i * 4);
    });
    g.putImageData(im, 0, 0);
  }

  function voortgangVan(sleutel, aantal) {
    const s = opslag()[sleutel];
    if (!s || !s.v) return { deel: 0, klaar: false };
    const goed = [...s.v].filter((c, i) => c !== '0' && parseInt(c, 36) - 1 === parseInt(s.toe[i], 36)).length;
    return { deel: goed / aantal, klaar: Boolean(s.klaar) };
  }

  /* ----------------------------------------------------------
     Keuzescherm: foto's
     ---------------------------------------------------------- */
  function toonKeuze() {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    wortel.append(el('p', 'fotos-intro', 'Kleur een foto van ons in, vakje voor vakje. Met twee vingers zoom je in.'));
    const raster = el('div', 'kl-fotos');
    platen().forEach((plaat) => {
      const kaart = knop('kl-foto', null, () => toonNiveaus(plaat));
      const c = el('canvas', 'kl-mini');
      const status = el('span', 'kl-status');
      kaart.append(c, status);
      raster.append(kaart);
      // Klaar op een niveau? Hartjes. Bezig? Percentage.
      let beste = 0, bezig = 0;
      NIVEAUS.forEach((n) => {
        const s = opslag()[sleutelVan(plaat, n)];
        if (s && s.klaar) beste = Math.max(beste, n.hartjes);
        else if (s && s.v && /[1-9a-z]/.test(s.v)) bezig++;
      });
      if (beste) status.textContent = '♥'.repeat(beste) + '♡'.repeat(3 - beste);
      else status.append(el('span', 'pil', bezig ? 'bezig' : 'nieuw'));
      rasterVoor(plaat, NIVEAUS[0]).then((r) => tekenVoorbeeld(c, r)).catch(() => kaart.remove());
    });
    wortel.append(raster);
  }

  /* ----------------------------------------------------------
     Niveau kiezen, met voorbeeld per niveau
     ---------------------------------------------------------- */
  function toonNiveaus(plaat) {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    wortel.append(knop('fotos-terug', '‹ Foto\'s', toonKeuze));
    wortel.append(el('p', 'fotos-intro', 'Hoe moeilijker, hoe meer vakjes en kleuren, en hoe meer het lijkt op de echte foto.'));
    const lijst = el('div', 'kl-niveaus');
    NIVEAUS.forEach((niveau) => {
      const kaart = knop('kl-niveau', null, () => startPuzzel(plaat, niveau));
      const c = el('canvas', 'kl-voorbeeld');
      const tekst = el('span', 'kl-niveau-tekst');
      const titel = el('b', '', niveau.naam);
      const maat = el('span', 'kl-maat', '…');
      const status = el('span', 'kl-status');
      tekst.append(titel, maat, el('span', 'kl-uitleg', niveau.uitleg), status);
      kaart.append(c, tekst);
      lijst.append(kaart);
      rasterVoor(plaat, niveau).then((r) => {
        tekenVoorbeeld(c, r);
        maat.textContent = `${r.kol} × ${r.rij} = ${r.kol * r.rij} vakjes · ${r.palet.length} kleuren`;
        const v = voortgangVan(sleutelVan(plaat, niveau), r.kol * r.rij);
        if (v.klaar) status.textContent = '♥'.repeat(niveau.hartjes) + '♡'.repeat(3 - niveau.hartjes) + ' klaar';
        else if (v.deel > 0) status.append(el('span', 'pil', `${Math.floor(v.deel * 100)}% gekleurd`));
        else status.append(el('span', 'pil', '♥'.repeat(niveau.hartjes) + ' te verdienen'));
      });
    });
    wortel.append(lijst);
  }

  /* ----------------------------------------------------------
     Kleuren
     ---------------------------------------------------------- */
  async function startPuzzel(plaat, niveau) {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const sleutel = sleutelVan(plaat, niveau);
    const r = await rasterVoor(plaat, niveau);
    const N = r.kol * r.rij;
    const bewaard = opslag()[sleutel] || {};
    // gekleurd[i] = gekozen kleur + 1 (0 = nog leeg)
    const gekleurd = bewaard.v && bewaard.v.length === N ? [...bewaard.v].map((c) => parseInt(c, 36)) : new Array(N).fill(0);
    let klaar = Boolean(bewaard.klaar);
    const bewaar = () => bewaarPlaat(sleutel, {
      kol: r.kol, rij: r.rij, palet: r.palet,
      toe: r.toe.map((t) => t.toString(36)).join(''),
      v: gekleurd.map((g) => g.toString(36)).join(''),
    });
    if (!bewaard.toe) bewaar();   // raster meteen vastleggen

    const goed = (i) => gekleurd[i] === r.toe[i] + 1;
    const over = (k) => { let n = 0; for (let i = 0; i < N; i++) if (r.toe[i] === k && !goed(i)) n++; return n; };
    let gekozen = 0;
    while (gekozen < r.palet.length - 1 && over(gekozen) === 0) gekozen++;

    // --- Scherm ---
    const balk = el('div', 'ws-balk');
    balk.append(knop('fotos-terug', '‹ Niveaus', () => toonNiveaus(plaat)));
    const pct = el('span', 'ws-stand');
    balk.append(pct);
    wortel.append(balk);

    const vak = el('div', 'kl-vak');
    const canvas = el('canvas', 'kl-canvas');
    vak.append(canvas);
    const hulp = el('div', 'kl-hulp');
    const zoekKnop = knop('kl-hulpknop', 'Zoek', zoek);
    const passendKnop = knop('kl-hulpknop', 'Alles', () => { pasIn(); teken(); });
    hulp.append(zoekKnop, passendKnop);
    vak.append(hulp);
    wortel.append(vak);

    const palet = el('div', 'kl-palet');
    palet.style.setProperty('--n', Math.ceil(r.palet.length / 2));
    const paletKnoppen = r.palet.map((k, i) => {
      const b = knop('kl-kleur', null, () => { gekozen = i; tekenPalet(); teken(); });
      b.style.background = rgb(k);
      b.style.color = lichtheid(k) > 150 ? '#5a3848' : '#fff';
      b.append(el('span', 'kl-nr', String(i + 1)), el('span', 'kl-over', ''));
      palet.append(b);
      return b;
    });
    wortel.append(palet);

    // --- Afmetingen en zoom ---
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    let breed = 0, hoog = 0;
    let schaal = 1, ox = 0, oy = 0, minSchaal = 1;
    function maatBepalen() {
      const top = vak.getBoundingClientRect().top + window.scrollY;
      const paletHoog = palet.getBoundingClientRect().height;
      const onder = parseFloat(getComputedStyle(wortel.closest('.scherm')).paddingBottom) || 20;
      breed = vak.clientWidth;
      hoog = Math.max(220, window.innerHeight - top - paletHoog - onder - 14);
      vak.style.height = hoog + 'px';
      canvas.width = Math.round(breed * dpr);
      canvas.height = Math.round(hoog * dpr);
      canvas.style.width = breed + 'px';
      canvas.style.height = hoog + 'px';
      minSchaal = Math.min(breed / r.kol, hoog / r.rij);
    }
    function pasIn() {
      schaal = minSchaal;
      ox = (breed - r.kol * schaal) / 2;
      oy = (hoog - r.rij * schaal) / 2;
    }
    function begrens() {
      schaal = Math.max(minSchaal, Math.min(MAX_CEL, schaal));
      const w = r.kol * schaal, h = r.rij * schaal;
      ox = w <= breed ? (breed - w) / 2 : Math.min(0, Math.max(breed - w, ox));
      oy = h <= hoog ? (hoog - h) / 2 : Math.min(0, Math.max(hoog - h, oy));
    }

    // --- Tekenen ---
    const ctx = canvas.getContext('2d');
    let tekenGepland = false;
    function teken() {
      if (tekenGepland) return;
      tekenGepland = true;
      requestAnimationFrame(tekenNu);
    }
    let echt = null;        // de echte foto aan het eind
    let echtZicht = 0;      // 0..1
    function tekenNu() {
      tekenGepland = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#efe7ec';
      ctx.fillRect(0, 0, breed, hoog);
      const cel = schaal;
      const gat = cel >= 7 ? 1 : 0;
      const c0 = Math.max(0, Math.floor(-ox / cel)), c1 = Math.min(r.kol, Math.ceil((breed - ox) / cel));
      const r0 = Math.max(0, Math.floor(-oy / cel)), r1 = Math.min(r.rij, Math.ceil((hoog - oy) / cel));
      const cijfers = cel >= MIN_CEL_CIJFER && !klaar;
      ctx.font = `700 ${Math.round(cel * 0.42)}px ui-rounded, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let y = r0; y < r1; y++) {
        for (let x = c0; x < c1; x++) {
          const i = y * r.kol + x;
          const px = ox + x * cel, py = oy + y * cel;
          const g = gekleurd[i];
          const juist = r.toe[i];
          if (klaar || g === juist + 1) {
            ctx.fillStyle = rgb(r.palet[juist]);
            ctx.fillRect(px, py, cel + (klaar ? 0.5 : -gat), cel + (klaar ? 0.5 : -gat));
            continue;
          }
          if (g) {
            // fout gekleurd: kleur half doorzichtig, cijfer blijft zichtbaar
            ctx.fillStyle = '#fff';
            ctx.fillRect(px, py, cel - gat, cel - gat);
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = rgb(r.palet[g - 1]);
            ctx.fillRect(px, py, cel - gat, cel - gat);
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = juist === gekozen ? '#f6c6d7' : '#fff';
            ctx.fillRect(px, py, cel - gat, cel - gat);
          }
          if (cijfers) {
            ctx.fillStyle = g ? '#5a3848' : juist === gekozen ? '#b23a66' : '#a08f98';
            ctx.fillText(String(juist + 1), px + cel / 2, py + cel / 2 + 0.5);
          }
        }
      }
      if (echt && echtZicht > 0) {
        const u = uitsnede(echt, r.kol, r.rij);
        ctx.globalAlpha = echtZicht;
        ctx.drawImage(echt, u.sx, u.sy, u.sw, u.sh, ox, oy, r.kol * cel, r.rij * cel);
        ctx.globalAlpha = 1;
      }
    }

    function tekenPalet() {
      let totaalGoed = 0;
      for (let i = 0; i < N; i++) if (goed(i)) totaalGoed++;
      pct.textContent = `${Math.floor((100 * totaalGoed) / N)}% gekleurd`;
      paletKnoppen.forEach((b, i) => {
        const n = over(i);
        b.classList.toggle('kies', i === gekozen);
        b.classList.toggle('af', n === 0);
        b.querySelector('.kl-over').textContent = n === 0 ? '✓' : String(n);
      });
    }

    // --- Kleuren met één vinger, zoomen/schuiven met twee ---
    const vingers = new Map();
    let modus = null;            // 'wacht' | 'kleur' | 'zoom'
    let wachtTimer = null;
    let laatsteCel = null;
    let pinch = null;
    let gewijzigd = false;

    function celOnder(x, y) {
      const b = canvas.getBoundingClientRect();
      const cx = Math.floor((x - b.left - ox) / schaal);
      const cy = Math.floor((y - b.top - oy) / schaal);
      if (cx < 0 || cy < 0 || cx >= r.kol || cy >= r.rij) return null;
      return [cx, cy];
    }

    function kleurCel(cx, cy) {
      const i = cy * r.kol + cx;
      if (goed(i) || gekleurd[i] === gekozen + 1) return;
      gekleurd[i] = gekozen + 1;
      gewijzigd = true;
    }

    // Ook de vakjes tussen twee meetpunten kleuren (snel vegen)
    function kleurLijn(a, b) {
      if (!a) { kleurCel(b[0], b[1]); return; }
      const stappen = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      for (let s = 1; s <= stappen; s++) {
        kleurCel(Math.round(a[0] + ((b[0] - a[0]) * s) / stappen), Math.round(a[1] + ((b[1] - a[1]) * s) / stappen));
      }
    }

    function startKleuren(plek) {
      modus = 'kleur';
      const p = plek || [...vingers.values()][0];
      if (!p) return;
      const c = celOnder(p.x, p.y);
      if (c) kleurCel(c[0], c[1]);
      laatsteCel = c;
      teken();
    }

    function startPinch() {
      clearTimeout(wachtTimer);
      modus = 'zoom';
      const [a, b] = [...vingers.values()];
      const bb = canvas.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - bb.left, my = (a.y + b.y) / 2 - bb.top;
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: schaal, wx: (mx - ox) / schaal, wy: (my - oy) / schaal };
    }

    function neer(e) {
      if (klaar) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (f) { /* niet erg */ }
      vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (vingers.size === 1) {
        modus = 'wacht';
        clearTimeout(wachtTimer);
        wachtTimer = setTimeout(() => { if (modus === 'wacht') startKleuren(); }, TIK_WACHT);
      } else if (vingers.size === 2) {
        startPinch();
      }
    }

    function beweeg(e) {
      if (!vingers.has(e.pointerId)) return;
      e.preventDefault();
      vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (modus === 'wacht') {
        clearTimeout(wachtTimer);
        startKleuren();
      }
      if (modus === 'kleur') {
        const c = celOnder(e.clientX, e.clientY);
        if (c && (!laatsteCel || c[0] !== laatsteCel[0] || c[1] !== laatsteCel[1])) {
          kleurLijn(laatsteCel, c);
          laatsteCel = c;
          teken();
        }
      } else if (modus === 'zoom' && vingers.size >= 2) {
        const [a, b] = [...vingers.values()];
        const bb = canvas.getBoundingClientRect();
        const mx = (a.x + b.x) / 2 - bb.left, my = (a.y + b.y) / 2 - bb.top;
        schaal = (pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d;
        schaal = Math.max(minSchaal, Math.min(MAX_CEL, schaal));
        ox = mx - pinch.wx * schaal;
        oy = my - pinch.wy * schaal;
        begrens();
        teken();
      }
    }

    function los(e) {
      if (!vingers.has(e.pointerId)) return;
      const plek = vingers.get(e.pointerId);
      vingers.delete(e.pointerId);
      if (modus === 'wacht' && vingers.size === 0) startKleuren(plek);   // korte tik
      if (vingers.size === 1 && modus === 'zoom') {
        modus = 'klaar-met-zoom';   // tweede vinger los: niet ineens gaan kleuren
      }
      if (vingers.size === 0) {
        clearTimeout(wachtTimer);
        modus = null;
        laatsteCel = null;
        if (gewijzigd) {
          gewijzigd = false;
          bewaar();
          tekenPalet();
          controleerKlaar();
        }
      }
    }

    luister(canvas, 'pointerdown', neer);
    luister(canvas, 'pointermove', beweeg);
    luister(canvas, 'pointerup', los);
    luister(canvas, 'pointercancel', los);
    // iOS: geen paginazoom tijdens het knijpen
    const stop = (e) => e.preventDefault();
    luister(document, 'gesturestart', stop);
    luister(document, 'gesturechange', stop);
    luister(canvas, 'touchmove', stop, { passive: false });
    // iOS: geen dubbeltik-zoom op het kleurvlak (snel twee keer tikken = twee keer kleuren)
    luister(canvas, 'touchend', stop, { passive: false });
    luister(window, 'resize', () => { maatBepalen(); if (klaar) pasIn(); else begrens(); teken(); });

    // Zoek: inzoomen op het eerste vakje dat nog moet in de gekozen kleur
    function zoek() {
      let doel = -1;
      for (let i = 0; i < N; i++) if (r.toe[i] === gekozen && !goed(i)) { doel = i; break; }
      if (doel < 0) { api.toast('Deze kleur is al af'); return; }
      schaal = Math.max(schaal, 30);
      const x = doel % r.kol, y = Math.floor(doel / r.kol);
      ox = breed / 2 - (x + 0.5) * schaal;
      oy = hoog / 2 - (y + 0.5) * schaal;
      begrens();
      teken();
    }

    // --- Klaar ---
    function controleerKlaar() {
      for (let i = 0; i < N; i++) if (!goed(i)) return;
      klaar = true;
      bewaarPlaat(sleutel, { klaar: true });
      api.klaar({ hartjes: niveau.hartjes });
      afronden();
    }

    function afronden() {
      // Rustig uitzoomen naar de hele pixelversie
      const start = { s: schaal, x: ox, y: oy };
      pasIn();
      const doel = { s: schaal, x: ox, y: oy };
      const t0 = performance.now();
      const duur = 900;
      (function stap(nu) {
        const t = Math.min(1, (nu - t0) / duur);
        const e = 1 - Math.pow(1 - t, 3);
        schaal = start.s + (doel.s - start.s) * e;
        ox = start.x + (doel.x - start.x) * e;
        oy = start.y + (doel.y - start.y) * e;
        tekenNu();
        if (t < 1) requestAnimationFrame(stap);
      })(t0);
      hulp.remove();
      palet.classList.add('weg');
      // Daarna de echte foto er zacht overheen
      laadBeeld(plaat.foto).then((img) => {
        echt = img;
        const tijd = setTimeout(() => {
          const t1 = performance.now();
          (function vervaag(nu) {
            echtZicht = Math.min(1, (nu - t1) / 1200);
            tekenNu();
            if (echtZicht < 1 && canvas.isConnected) requestAnimationFrame(vervaag);
          })(t1);
        }, 1800);
        opruimers.push(() => clearTimeout(tijd));
      }).catch(() => { /* geen foto: dan blijft de pixelversie staan */ });

      const kaart = el('div', 'sd-klaar kl-klaar');
      kaart.append(
        el('p', 'quiz-hartjes', '💗'.repeat(niveau.hartjes) + '🤍'.repeat(3 - niveau.hartjes)),
        el('h3', 'sier', 'Ingekleurd!'),
        el('p', 'quiz-slot', bijschriftVan(plaat)),
        el('p', 'kl-niveau-klaar', `${niveau.naam} · ${N} vakjes`),
        knop('knop', 'Andere foto', toonKeuze),
        knop('knop zacht', 'Terug naar het menu', () => api.terug()),
      );
      palet.replaceWith(kaart);
      const tijd2 = setTimeout(() => kaart.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 2400);
      opruimers.push(() => clearTimeout(tijd2));
    }

    maatBepalen();
    pasIn();
    tekenPalet();
    teken();
    if (klaar) {
      afronden();
    } else if (!opslag()[sleutel].hint) {
      api.toast('Eén vinger kleurt, twee vingers zoomen en schuiven');
      bewaarPlaat(sleutel, { hint: true });
    }
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'kleuren',
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
