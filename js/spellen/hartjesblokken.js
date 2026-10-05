/*
  SPEL: HARTJESBLOKKEN
  ------------------------------------------------------------
  Een blokpuzzel op een 8x8-raster. Onderaan staan steeds 3 vormen
  van pastel hartjes; sleep ze op het raster. Volle rijen en kolommen
  verdwijnen (meerdere tegelijk = bonus). Past geen enkele vorm meer:
  einde potje.

  Achter het raster staat een vervaagde foto (CONTENT.hartjesblokken.fotos,
  elk potje de volgende) die bij elke weggespeelde rij of kolom scherper
  wordt. Na rijenTotScherp rijen is hij scherp en verschijnt het bijschrift.

  Punten (zoals bij echte blokpuzzels):
  - 1 punt per geplaatst hartje
  - rijen/kolommen tegelijk weg: 10 x n x (n+1) (1 = 20, 2 = 60, 3 = 120, 4 = 200 ...)
    keer de combo
  - combo: elke zet die iets wegspeelt verhoogt de combo (x2, x3, ...);
    na COMBO_ADEM zetten zonder wegspelen is hij weg
  - leeg raster: +LEEG_BONUS
  De vormengenerator zorgt dat er (bijna) altijd iets past.

  Hartjes voor de tegel (beste potje telt): vanaf HARTJES_GRENZEN[1] punten 3,
  vanaf HARTJES_GRENZEN[0] punten 2, anders 1.
*/
(function () {
  'use strict';

  const N = 8;                       // raster van N x N
  const MAX_VAAG = 14;               // px vervaging aan het begin
  const KLEUREN = ['#f6b8ca', '#cdb8f0', '#f9c9b0', '#a8dcc4', '#f7e09a', '#b9cff0'];
  const COMBO_ADEM = 3;               // zoveel zetten zonder wegspelen, dan is de combo weg
  const LEEG_BONUS = 300;             // bonus als het hele raster leeg is
  const KANS_HELE_SET = 0.75;         // kans dat een nieuwe set van 3 helemaal te plaatsen is
  const HARTJES_GRENZEN = [1000, 3000];   // afgesteld met proefpotjes: willekeurig spelen 40-800, goed spelen 6000+ in 120 zetten

  // Vormen als lijstjes [rij, kolom]; het getal is hoe vaak ze voorkomen (gewicht).
  const VORMEN = [
    [2, [[0, 0]]],
    [3, [[0, 0], [0, 1]]], [3, [[0, 0], [1, 0]]],
    [3, [[0, 0], [0, 1], [0, 2]]], [3, [[0, 0], [1, 0], [2, 0]]],
    [2, [[0, 0], [0, 1], [0, 2], [0, 3]]], [2, [[0, 0], [1, 0], [2, 0], [3, 0]]],
    [1, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]], [1, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]],
    [4, [[0, 0], [0, 1], [1, 0], [1, 1]]],
    [1, [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]],
    [1, [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]], [1, [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]],
    [2, [[0, 0], [1, 0], [1, 1]]], [2, [[0, 1], [1, 0], [1, 1]]], [2, [[0, 0], [0, 1], [1, 0]]], [2, [[0, 0], [0, 1], [1, 1]]],
    [1, [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]], [1, [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]]],
    [1, [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]]], [1, [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]],
    [2, [[0, 0], [0, 1], [0, 2], [1, 1]]], [2, [[1, 0], [1, 1], [1, 2], [0, 1]]], [2, [[0, 0], [1, 0], [2, 0], [1, 1]]], [2, [[0, 1], [1, 1], [2, 1], [1, 0]]],
    [2, [[0, 1], [0, 2], [1, 0], [1, 1]]], [2, [[0, 0], [0, 1], [1, 1], [1, 2]]], [2, [[0, 0], [1, 0], [1, 1], [2, 1]]], [2, [[0, 1], [1, 1], [1, 0], [2, 0]]],
    [1, [[0, 0], [1, 0], [2, 0], [2, 1]]], [1, [[0, 1], [1, 1], [2, 1], [2, 0]]], [1, [[0, 0], [0, 1], [1, 0], [2, 0]]], [1, [[0, 0], [0, 1], [1, 1], [2, 1]]],
    [1, [[0, 0], [0, 1], [0, 2], [1, 0]]], [1, [[0, 0], [0, 1], [0, 2], [1, 2]]], [1, [[0, 0], [1, 0], [1, 1], [1, 2]]], [1, [[0, 2], [1, 0], [1, 1], [1, 2]]],
  ];
  const TOTAAL_GEWICHT = VORMEN.reduce((s, v) => s + v[0], 0);

  let api = null;
  let wortel = null;
  let raster = [];         // N x N: null of een kleur
  let vakken = [];         // de N x N div's van het raster
  let lade = [];           // 3 plekken: { cellen, kleur } of null
  let score = 0;
  let rijenWeg = 0;
  let beste = 0;
  let combo = 0;           // aantal zetten op rij met wegspelen
  let zonderRij = 0;       // zetten sinds de laatste weggespeelde rij
  let recordGemeld = false;
  let foto = null;         // { pad, bijschrift }
  let bijschriftGetoond = false;
  let berichtNr = 0;
  let sleep = null;
  let bezig = false;       // even geen invoer tijdens het wegspelen
  let timers = [];
  let el$ = {};            // vaste onderdelen van het scherm

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
    if (sleep && sleep.zweef) sleep.zweef.remove();
    sleep = null;
  }

  function hb() { return api.content.hartjesblokken || {}; }

  function willekeurigeVorm() {
    let r = Math.random() * TOTAAL_GEWICHT;
    for (const [gewicht, cellen] of VORMEN) {
      r -= gewicht;
      if (r < 0) return { cellen, kleur: KLEUREN[Math.floor(Math.random() * KLEUREN.length)] };
    }
    return { cellen: VORMEN[0][1], kleur: KLEUREN[0] };
  }

  function maat(cellen) {
    return {
      rijen: Math.max(...cellen.map((c) => c[0])) + 1,
      kolommen: Math.max(...cellen.map((c) => c[1])) + 1,
    };
  }

  // Een hartje (blokje) in een kleur.
  function hartje(kleur) {
    const h = el('span', 'hb-hart');
    h.style.setProperty('--k', kleur);
    return h;
  }

  /* ----------------------------------------------------------
     Spelregels
     ---------------------------------------------------------- */
  function past(cellen, rij, kol) {
    return cellen.every(([r, c]) => {
      const R = rij + r;
      const C = kol + c;
      return R >= 0 && R < N && C >= 0 && C < N && !raster[R][C];
    });
  }

  function pastErgens(cellen) {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (past(cellen, r, c)) return true;
    return false;
  }

  // Welke rijen en kolommen zouden vol zijn als deze vorm hier ligt?
  function volleLijnen(cellen, rij, kol) {
    const bezet = (R, C) => raster[R][C] || cellen.some(([r, c]) => rij + r === R && kol + c === C);
    const rijen = [];
    const kolommen = [];
    for (let i = 0; i < N; i++) {
      let rijVol = true;
      let kolVol = true;
      for (let j = 0; j < N; j++) {
        if (!bezet(i, j)) rijVol = false;
        if (!bezet(j, i)) kolVol = false;
      }
      if (rijVol) rijen.push(i);
      if (kolVol) kolommen.push(i);
    }
    return { rijen, kolommen };
  }

  /* ----------------------------------------------------------
     Nieuw potje
     ---------------------------------------------------------- */
  function nieuwPotje() {
    opruimen();
    const bewaard = api.opslag.lees();
    beste = bewaard.beste || 0;
    const fotos = (hb().fotos || []).filter(Boolean);
    const nr = bewaard.fotoNr || 0;
    api.opslag.bewaar({ fotoNr: nr + 1 });          // volgende keer de volgende foto
    const pad = fotos.length ? fotos[nr % fotos.length] : null;
    const sleutel = pad && (String(pad).match(/foto-\d+/) || [])[0];
    const uitleg = sleutel && (api.content.fotoUitleg || {})[sleutel];
    foto = pad ? { pad, bijschrift: uitleg ? uitleg.bijschrift : '' } : null;

    raster = Array.from({ length: N }, () => Array(N).fill(null));
    score = 0;
    rijenWeg = 0;
    combo = 0;
    zonderRij = 0;
    recordGemeld = false;
    bijschriftGetoond = false;
    berichtNr = Math.floor(Math.random() * 10);
    bezig = false;
    bouwScherm();
    vulLade();
    tekenAlles();
  }

  function bouwScherm() {
    wortel.textContent = '';
    window.scrollTo(0, 0);

    const balk = el('div', 'hb-balk');
    el$.score = el('span', 'hb-score');
    el$.beste = el('span', 'hb-beste');
    el$.scherp = el('span', 'hb-scherp');
    balk.append(el$.score, el$.scherp, el$.beste);

    const bord = el('div', 'hb-bord');
    if (foto) {
      el$.foto = el('img', 'hb-foto');
      el$.foto.src = foto.pad;
      el$.foto.alt = '';
      bord.append(el$.foto);
    }
    const rasterEl = el('div', 'hb-raster');
    vakken = [];
    for (let r = 0; r < N; r++) {
      vakken.push([]);
      for (let c = 0; c < N; c++) {
        const v = el('div', 'hb-vak');
        vakken[r].push(v);
        rasterEl.append(v);
      }
    }
    bord.append(rasterEl);
    el$.combo = el('div', 'hb-combo');
    el$.combo.hidden = true;
    el$.punten = el('div', 'hb-punten-laag');
    bord.append(el$.combo, el$.punten);
    el$.melding = el('div', 'hb-melding');
    el$.bijschrift = el('div', 'hb-bijschrift');
    el$.bijschrift.hidden = true;
    bord.append(el$.melding, el$.bijschrift);
    el$.rasterEl = rasterEl;
    el$.bord = bord;

    el$.lade = el('div', 'hb-lade');
    wortel.append(balk, bord, el$.lade);
  }

  // Past deze set van vormen helemaal, in een of andere volgorde? (snelle, gulzige controle)
  function heleSetPast(set) {
    const volgordes = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const kopie = raster.map((r) => r.slice());
    for (const volgorde of volgordes) {
      let lukt = true;
      const proef = kopie.map((r) => r.slice());
      for (const i of volgorde) {
        let geplaatst = false;
        for (let r = 0; r < N && !geplaatst; r++) {
          for (let c = 0; c < N && !geplaatst; c++) {
            if (set[i].cellen.every(([a, b]) => r + a < N && c + b < N && !proef[r + a][c + b])) {
              set[i].cellen.forEach(([a, b]) => { proef[r + a][c + b] = 'x'; });
              // volle lijnen weghalen, net als in het spel
              for (let k = 0; k < N; k++) {
                if (proef[k].every(Boolean)) proef[k].fill(null);
              }
              for (let k = 0; k < N; k++) {
                if (proef.every((rij) => rij[k])) proef.forEach((rij) => { rij[k] = null; });
              }
              geplaatst = true;
            }
          }
        }
        if (!geplaatst) { lukt = false; break; }
      }
      if (lukt) return true;
    }
    return false;
  }

  // Nieuwe set van 3: meestal helemaal te plaatsen, en bijna altijd past er minstens één.
  function vulLade() {
    const moetHeel = Math.random() < KANS_HELE_SET;
    let reserve = null;
    for (let poging = 0; poging < 60; poging++) {
      const set = [willekeurigeVorm(), willekeurigeVorm(), willekeurigeVorm()];
      const eenPast = set.some((vorm) => pastErgens(vorm.cellen));
      if (!eenPast) continue;
      if (!moetHeel || heleSetPast(set)) { lade = set; return; }
      if (!reserve) reserve = set;
    }
    lade = reserve || [willekeurigeVorm(), willekeurigeVorm(), willekeurigeVorm()];
  }

  /* ----------------------------------------------------------
     Tekenen
     ---------------------------------------------------------- */
  function tekenAlles() {
    tekenRaster();
    tekenLade();
    tekenStand();
  }

  function tekenRaster() {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const v = vakken[r][c];
        v.className = 'hb-vak';
        v.textContent = '';
        if (raster[r][c]) v.append(hartje(raster[r][c]));
      }
    }
  }

  function tekenLade() {
    el$.lade.textContent = '';
    lade.forEach((vorm, i) => {
      const plek = el('div', 'hb-plek');
      if (vorm) {
        const stuk = maakStuk(vorm, 'hb-stuk');
        if (!pastErgens(vorm.cellen)) stuk.classList.add('past-niet');
        stuk.addEventListener('pointerdown', (e) => startSlepen(e, i, stuk));
        plek.append(stuk);
      }
      el$.lade.append(plek);
    });
  }

  function maakStuk(vorm, klasse) {
    const { rijen, kolommen } = maat(vorm.cellen);
    const stuk = el('div', klasse);
    stuk.style.gridTemplateColumns = `repeat(${kolommen}, var(--c))`;
    stuk.style.gridTemplateRows = `repeat(${rijen}, var(--c))`;
    vorm.cellen.forEach(([r, c]) => {
      const h = hartje(vorm.kleur);
      h.style.gridRow = r + 1;
      h.style.gridColumn = c + 1;
      stuk.append(h);
    });
    return stuk;
  }

  function tekenStand() {
    el$.score.textContent = `Score ${score}`;
    el$.beste.textContent = `Beste ${Math.max(beste, score)}`;
    const nodig = hb().rijenTotScherp || 10;
    const deel = Math.min(1, rijenWeg / nodig);
    el$.scherp.textContent = deel >= 1 ? '📸 scherp!' : `📸 ${Math.min(rijenWeg, nodig)}/${nodig}`;
    if (el$.foto) el$.foto.style.filter = `blur(${(MAX_VAAG * (1 - deel)).toFixed(1)}px) saturate(${0.75 + 0.35 * deel})`;
  }

  /* ----------------------------------------------------------
     Slepen
     ---------------------------------------------------------- */
  function rasterMaat() {
    const a = vakken[0][0].getBoundingClientRect();
    const b = vakken[0][1].getBoundingClientRect();
    return { links: a.left, boven: a.top, stap: b.left - a.left, vak: a.width };
  }

  function startSlepen(e, i, stuk) {
    if (sleep || bezig || !lade[i]) return;
    e.preventDefault();
    const vorm = lade[i];
    const m = rasterMaat();
    const zweef = maakStuk(vorm, 'hb-stuk hb-zweef');
    zweef.style.setProperty('--c', m.vak + 'px');
    zweef.style.gap = (m.stap - m.vak) + 'px';
    document.body.append(zweef);
    const { rijen, kolommen } = maat(vorm.cellen);
    sleep = {
      i, vorm, stuk, zweef, m,
      breed: kolommen * m.stap - (m.stap - m.vak),
      hoog: rijen * m.stap - (m.stap - m.vak),
      // De vorm zweeft boven de vinger: zo zie je waar hij komt.
      boven: Math.max(56, m.stap * 1.6),
      plek: null,
      id: e.pointerId,
    };
    stuk.classList.add('weg-uit-lade');
    try { stuk.setPointerCapture(e.pointerId); } catch (f) { /* niet erg */ }
    stuk.addEventListener('pointermove', beweeg);
    stuk.addEventListener('pointerup', loslaten);
    stuk.addEventListener('pointercancel', loslaten);
    beweeg(e);
  }

  function beweeg(e) {
    if (!sleep || e.pointerId !== sleep.id) return;
    const s = sleep;
    const x = e.clientX - s.breed / 2;
    const y = e.clientY - s.boven - s.hoog;
    s.zweef.style.transform = `translate(${x}px, ${y}px)`;
    const kol = Math.round((x - s.m.links) / s.m.stap);
    const rij = Math.round((y - s.m.boven) / s.m.stap);
    const plek = past(s.vorm.cellen, rij, kol) ? { rij, kol } : null;
    if (JSON.stringify(plek) !== JSON.stringify(s.plek)) {
      s.plek = plek;
      toonSchaduw();
    }
  }

  // Lichte schaduw waar de vorm landt + oplichten wat er vol raakt.
  function toonSchaduw() {
    vakken.flat().forEach((v) => v.classList.remove('schaduw', 'wordt-vol'));
    vakken.flat().forEach((v) => { const s = v.querySelector('.hb-schaduw'); if (s) s.remove(); });
    if (!sleep || !sleep.plek) return;
    const { rij, kol } = sleep.plek;
    sleep.vorm.cellen.forEach(([r, c]) => {
      const v = vakken[rij + r][kol + c];
      v.classList.add('schaduw');
      const h = hartje(sleep.vorm.kleur);
      h.classList.add('hb-schaduw');
      v.append(h);
    });
    const vol = volleLijnen(sleep.vorm.cellen, rij, kol);
    vol.rijen.forEach((r) => vakken[r].forEach((v) => v.classList.add('wordt-vol')));
    vol.kolommen.forEach((c) => vakken.forEach((rijV) => rijV[c].classList.add('wordt-vol')));
  }

  function loslaten(e) {
    if (!sleep || e.pointerId !== sleep.id) return;
    const s = sleep;
    s.stuk.removeEventListener('pointermove', beweeg);
    s.stuk.removeEventListener('pointerup', loslaten);
    s.stuk.removeEventListener('pointercancel', loslaten);
    sleep = null;
    toonSchaduw();
    if (s.plek) {
      s.zweef.remove();
      plaats(s.i, s.plek.rij, s.plek.kol);
    } else {
      // Terug naar de lade
      const doel = s.stuk.getBoundingClientRect();
      s.zweef.classList.add('terug');
      s.zweef.style.transform = `translate(${doel.left}px, ${doel.top}px) scale(0.6)`;
      s.zweef.style.opacity = '0';
      later(() => { s.zweef.remove(); s.stuk.classList.remove('weg-uit-lade'); }, 220);
    }
  }

  /* ----------------------------------------------------------
     Plaatsen en wegspelen
     ---------------------------------------------------------- */
  // Midden van een groepje vakjes (voor de zwevende punten), in % van het bord
  function middenVan(cellen) {
    const r = cellen.reduce((s, x) => s + x[0], 0) / cellen.length;
    const c = cellen.reduce((s, x) => s + x[1], 0) / cellen.length;
    return { x: ((c + 0.5) / N) * 100, y: ((r + 0.5) / N) * 100 };
  }

  function zweefPunten(tekst, plek, groot) {
    const p = el('span', 'hb-zweef-punten' + (groot ? ' groot' : ''), tekst);
    p.style.left = plek.x + '%';
    p.style.top = plek.y + '%';
    el$.punten.append(p);
    later(() => p.remove(), 1300);
  }

  function tekenCombo() {
    const b = el$.combo;
    b.hidden = combo < 2;
    if (combo < 2) return;
    b.textContent = '';
    b.append(el('b', '', `Combo x${combo}`));
    const bolletjes = el('span', 'hb-adem');
    for (let k = 0; k < COMBO_ADEM; k++) bolletjes.append(el('i', k < COMBO_ADEM - zonderRij ? 'vol' : ''));
    b.append(bolletjes);
  }

  function controleerRecord() {
    if (recordGemeld || beste <= 0 || score <= beste) return;
    recordGemeld = true;
    const r = el('div', 'hb-record', 'Nieuw record!');
    el$.bord.append(r);
    later(() => r.remove(), 2200);
  }

  function plaats(i, rij, kol) {
    const vorm = lade[i];
    vorm.cellen.forEach(([r, c]) => { raster[rij + r][kol + c] = vorm.kleur; });
    score += vorm.cellen.length;
    zweefPunten('+' + vorm.cellen.length, middenVan(vorm.cellen.map(([r, c]) => [rij + r, kol + c])), false);
    lade[i] = null;
    tekenRaster();
    vorm.cellen.forEach(([r, c]) => vakken[rij + r][kol + c].classList.add('neer'));

    // Volle rijen en kolommen
    const vol = volleLijnen([], 0, 0);
    const aantal = vol.rijen.length + vol.kolommen.length;
    if (aantal) {
      bezig = true;
      const weg = new Set();
      vol.rijen.forEach((r) => { for (let c = 0; c < N; c++) weg.add(r + ',' + c); });
      vol.kolommen.forEach((c) => { for (let r = 0; r < N; r++) weg.add(r + ',' + c); });
      weg.forEach((k) => { const [r, c] = k.split(',').map(Number); vakken[r][c].classList.add('weg'); });
      combo++;
      zonderRij = 0;
      const punten = 10 * aantal * (aantal + 1) * combo;
      score += punten;
      rijenWeg += aantal;
      toonBericht(aantal, punten);
      zweefPunten('+' + punten, middenVan([...weg].map((k) => k.split(',').map(Number))), true);
      later(() => {
        weg.forEach((k) => { const [r, c] = k.split(',').map(Number); raster[r][c] = null; });
        // Alles leeg? Flinke bonus.
        if (raster.every((rij) => rij.every((x) => !x))) {
          score += LEEG_BONUS;
          zweefPunten('+' + LEEG_BONUS, { x: 50, y: 50 }, true);
          toonLeeg();
        }
        bezig = false;
        naZet();
      }, 380);
    } else {
      zonderRij++;
      if (zonderRij >= COMBO_ADEM) combo = 0;
      naZet();
      vorm.cellen.forEach(([r, c]) => vakken[rij + r][kol + c].classList.add('neer'));
    }
    tekenCombo();
    tekenStand();
  }

  function naZet() {
    controleerRecord();
    tekenCombo();
    if (lade.every((v) => !v)) vulLade();
    tekenRaster();
    tekenLade();
    tekenStand();
    const nodig = hb().rijenTotScherp || 10;
    if (!bijschriftGetoond && rijenWeg >= nodig && foto) {
      bijschriftGetoond = true;
      toonBijschrift();
    }
    if (!lade.some((v) => v && pastErgens(v.cellen))) later(einde, 700);
  }

  function toonBericht(aantal, punten) {
    const lijst = hb().berichtjes || [];
    const extra = aantal === 2 ? 'Dubbel! ' : aantal === 3 ? 'Driedubbel! ' : aantal > 3 ? 'Wauw! ' : '';
    const comboTekst = (hb().comboTeksten || {})[combo];
    const tekst = comboTekst || (lijst.length ? lijst[berichtNr++ % lijst.length] : '');
    const m = el$.melding;
    m.textContent = '';
    // De punten zelf zweven al omhoog; hier alleen 'Dubbel!' e.d. en het berichtje.
    if (extra) m.append(el('b', '', extra.trim()));
    if (tekst) m.append(el('span', '', tekst));
    void punten;
    m.classList.remove('zichtbaar');
    void m.offsetWidth;
    m.classList.add('zichtbaar');
  }

  function toonLeeg() {
    const r = el('div', 'hb-record leeg', hb().leegTekst || 'Alles leeg!');
    el$.bord.append(r);
    later(() => r.remove(), 2000);
  }

  function toonBijschrift() {
    const b = el$.bijschrift;
    b.textContent = '';
    b.append(el('b', '', 'Helemaal scherp!'), el('span', '', foto.bijschrift || ''));
    b.hidden = false;
    b.classList.add('zichtbaar');
    later(() => { b.classList.remove('zichtbaar'); later(() => { b.hidden = true; }, 400); }, 4200);
  }

  /* ----------------------------------------------------------
     Einde potje
     ---------------------------------------------------------- */
  function einde() {
    const hartjes = score >= HARTJES_GRENZEN[1] ? 3 : score >= HARTJES_GRENZEN[0] ? 2 : 1;
    const nieuwRecord = beste > 0 && score > beste;   // bij het eerste potje is elk getal een "record"; dat zeggen we niet
    if (score > beste) { beste = score; api.opslag.bewaar({ beste }); }
    api.klaar({ hartjes });

    // Foto alvast helemaal scherp laten zien als afsluiter
    if (el$.foto) el$.foto.style.filter = 'none';
    el$.rasterEl.classList.add('vervaag');

    const kaart = el('div', 'hb-einde');
    kaart.append(
      el('p', 'quiz-hartjes', '💗'.repeat(hartjes) + '🤍'.repeat(3 - hartjes)),
      el('h3', 'sier', 'Geen plek meer!'),
      el('p', 'quiz-score', `Score ${score}${nieuwRecord ? ', nieuw record' : ''}`),
      el('p', 'quiz-slot', `${rijenWeg} rijen en kolommen weggespeeld.${foto && foto.bijschrift ? ' ' + foto.bijschrift : ''}`),
      knop('knop', 'Nog een keer', nieuwPotje),
      knop('knop zacht', 'Terug naar het menu', () => api.terug()),
    );
    el$.lade.replaceWith(kaart);
    requestAnimationFrame(() => kaart.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'hartjesblokken',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      nieuwPotje();
    },
    stop() {
      opruimen();
    },
  });
})();
