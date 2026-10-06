/*
  SPEL: MALTA-SUDOKU
  ------------------------------------------------------------
  Echte 9x9-sudoku's, elk met precies één oplossing (gemaakt en
  gecontroleerd met een generator), in drie niveaus.

  22-11 zit erin verstopt: in elke puzzel staat op rij 1, kolom 1
  een 1 en op rij 2, kolom 2 een 2 (1-1 en 2-2). De moeilijke
  puzzels hebben precies 22 startcijfers, en één heet "Nr. 22".

  Een blok helemaal goed = een Malta-herinnering (CONTENT.sudoku.maltaHerinneringen,
  blok 1 t/m 9). Hele sudoku af = de slotherinnering.

  Levens: elke puzzel begint met 3 levens. Een cijfer dat niet klopt
  met de oplossing kost meteen een leven: het wordt even rood, wiebelt
  en verdwijnt dan vanzelf. Potloodnotities tellen niet mee.
  Bij 0 levens: opnieuw beginnen met 3 levens (vrijgespeelde
  Malta-herinneringen blijven vrijgespeeld).
  Hartjes = het aantal levens dat over is bij het oplossen.
*/
(function () {
  'use strict';

  const LEVENS = 3;
  const FOUT_ZICHTBAAR = 900;   // zo lang blijft een fout cijfer staan (ms)

  const PUZZELS = [
    { id: 'makkelijk-1', niveau: 'makkelijk', naam: 'Qawra', start: '1..28...7.2.496.81......29631......4..7.4915.4591...7..71.328.5.4....3.9.3....76.', oplossing: '196285437723496581584371296318567924267849153459123678971632845642758319835914762' },
    { id: 'makkelijk-2', niveau: 'makkelijk', naam: 'Buġibba', start: '145..329..2.49..7..37....1.619.7...527.53.96...4.....77821.......3..7..949.3.87..', oplossing: '145783296826491573937625418619872345278534961354916827782159634563247189491368752' },
    { id: 'makkelijk-3', niveau: 'makkelijk', naam: 'Sliema', start: '14..9..8..2.....41893.......8.675319.7123....3.514..7..54.6719...8.1...7.1.8..4..', oplossing: '147596283526783941893421765482675319971238654365149872254367198638914527719852436' },
    { id: 'gemiddeld-1', niveau: 'gemiddeld', naam: 'Mdina', start: '1.6......92...8....782.6..95..6..24.2...5....64..9..7..9..7.3.28..42...7..2..5...', oplossing: '156739428924518736378246519519687243287354691643192875495871362861423957732965184' },
    { id: 'gemiddeld-2', niveau: 'gemiddeld', naam: 'Valletta', start: '1.8.4.3...2.8.154.4..2..1.....1.9..3..9652....6.....2..8...76..63...8...2.....79.', oplossing: '198546372723891546456273189572189463349652817861734925985427631637918254214365798' },
    { id: 'gemiddeld-3', niveau: 'gemiddeld', naam: 'Comino', start: '17.8......2956......421..5..4....2.........8593.7...4....17...9..7.5..2.21..385..', oplossing: '175843692329567418684219753548691237761324985932785146453172869897456321216938574' },
    { id: 'moeilijk-1', niveau: 'moeilijk', naam: 'Gozo', start: '1....9..2.2..7....9.5.2.....8..6...7....8..5.3....4.1..764...8.......53..........', oplossing: '137549862628173945945628371481365297769281453352794618576432189294817536813956724' },
    { id: 'moeilijk-2', niveau: 'moeilijk', naam: 'Blue Lagoon', start: '1....9.64.2...41...6...5..2......4...3.....9.8....17...4....5......8........9..86', oplossing: '185279364327864159469315872756932418231748695894651723948126537672583941513497286' },
    { id: 'moeilijk-3', niveau: 'moeilijk', naam: 'Nr. 22', start: '1......9.42.....7....95.......2...8..6.193.....2..6.....3.7.2.6........52.1......', oplossing: '156437892429618573738952164317245689865193427942786351593871246684329715271564938' },
  ];

  const NIVEAUS = [
    { id: 'makkelijk', naam: 'Makkelijk', sub: 'Om in te komen' },
    { id: 'gemiddeld', naam: 'Gemiddeld', sub: 'Iets meer nadenken' },
    { id: 'moeilijk', naam: 'Moeilijk', sub: 'Na de tweede cocktail 😂' },
  ];

  let api = null;
  let wortel = null;
  let timers = [];
  let toetsLuisteraar = null;

  // Stand van de puzzel die nu open is
  let pz = null;          // de puzzel uit PUZZELS
  let waarden = [];       // 81 cijfers (0 = leeg)
  let notities = [];      // 81 bitmaskers (bit 0 = cijfer 1)
  let levens = LEVENS;
  let blokkenAf = 0;      // bitmasker: welke blokken al een herinnering gaven
  let bezig = false;      // even geen invoer terwijl een fout cijfer zichtbaar is
  let gekozen = -1;
  let potlood = false;
  let geschiedenis = [];  // voor ongedaan maken
  let vakEls = [];
  let cijferKnoppen = [];
  let el$ = {};

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
  }

  const rij = (i) => Math.floor(i / 9);
  const kol = (i) => i % 9;
  const blok = (i) => Math.floor(rij(i) / 3) * 3 + Math.floor(kol(i) / 3);
  const buren = (i, j) => i !== j && (rij(i) === rij(j) || kol(i) === kol(j) || blok(i) === blok(j));
  const isStart = (i) => pz.start[i] !== '.';

  function sd() { return api.content.sudoku || {}; }
  function herinneringen() { return (sd().maltaHerinneringen || []).slice(0, 9); }

  function opslag() {
    const o = api.opslag.lees();
    return { puzzels: o.puzzels || {}, album: o.album || [] };
  }

  function bewaarPuzzel(extra) {
    const o = opslag();
    o.puzzels[pz.id] = Object.assign({}, o.puzzels[pz.id], {
      w: waarden.join(''),
      n: notities.slice(),
      levens,
      blokken: blokkenAf,
    }, extra);
    api.opslag.bewaar({ puzzels: o.puzzels });
  }


  /* ----------------------------------------------------------
     Keuzescherm
     ---------------------------------------------------------- */
  function toonKeuze() {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const o = opslag();

    const intro = el('div', 'sd-intro');
    intro.append(
      el('p', 'sd-intro-titel', '☀️ 🇲🇹 ☀️'),
      el('p', '', 'In het vliegtuig deden we ze samen. Nu sta je er alleen voor 😂'),
      el('p', 'sd-intro-klein', 'Elk blok dat helemaal klopt, levert een Malta-herinnering op.'),
    );
    wortel.append(intro);

    NIVEAUS.forEach((niv) => {
      const sectie = el('div', 'sd-niveau');
      sectie.append(el('h3', 'sd-niveau-titel', niv.naam), el('p', 'sd-niveau-sub', niv.sub));
      const rijEl = el('div', 'sd-puzzels');
      PUZZELS.filter((p) => p.niveau === niv.id).forEach((p) => {
        const s = o.puzzels[p.id];
        const k = knop('sd-puzzel', null, () => startPuzzel(p));
        let status = 'nieuw';
        if (s && s.klaar) status = '♥'.repeat(s.hartjes || 1) + '♡'.repeat(3 - (s.hartjes || 1));
        else if (s && s.w && /[1-9]/.test(s.w.replace(/./g, (c, i) => (p.start[i] === '.' ? c : '0')))) status = 'bezig…';
        k.append(el('span', 'sd-puzzel-naam', p.naam), el('span', 'sd-puzzel-status', status));
        if (s && s.klaar) k.classList.add('klaar');
        rijEl.append(k);
      });
      sectie.append(rijEl);
      wortel.append(sectie);
    });

    const aantal = o.album.filter(Boolean).length;
    const albumKnop = knop('sd-album-knop', null, toonAlbum);
    albumKnop.append(el('span', 'tegel-icoon', '📸'), el('span', 'sd-album-tekst', 'Malta-album'), el('span', 'pil', `${aantal} van 9`));
    wortel.append(albumKnop);
  }

  /* ----------------------------------------------------------
     Album: de herinneringen op de plek van hun blok
     ---------------------------------------------------------- */
  function toonAlbum() {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const o = opslag();
    wortel.append(knop('fotos-terug', '‹ Sudoku’s', toonKeuze));
    wortel.append(el('p', 'fotos-intro', 'Elk vol blok in een sudoku speelt de herinnering op dezelfde plek vrij.'));

    const raster = el('div', 'sd-album');
    herinneringen().forEach((h, b) => {
      const vak = el('button', 'sd-album-vak');
      vak.type = 'button';
      if (o.album[b] && h.foto) {
        const img = el('img');
        img.src = h.foto;
        img.alt = '';
        vak.append(img);
        vak.addEventListener('click', () => toonHerinnering(b, false));
      } else {
        vak.classList.add('dicht');
        vak.append(el('span', 'sd-slot', '🔒'), el('span', 'sd-album-nr', `Blok ${b + 1}`));
      }
      raster.append(vak);
    });
    wortel.append(raster);

    const slot = el('div', 'sd-slotkaart');
    const opgelost = Object.values(o.puzzels).some((s) => s && s.klaar);
    if (opgelost && sd().slotHerinnering) {
      slot.append(el('b', '', 'De laatste herinnering'), el('p', '', sd().slotHerinnering));
    } else {
      slot.classList.add('dicht');
      slot.append(el('b', '', '🔒 De laatste herinnering'), el('p', '', 'Los een hele sudoku op.'));
    }
    wortel.append(slot);
  }

  // Herinnering van blok b als kaart over het scherm.
  function toonHerinnering(b, nieuw) {
    const h = herinneringen()[b];
    if (!h) return;
    const laag = el('div', 'sd-laag');
    const kaart = el('div', 'sd-herinnering');
    kaart.append(el('p', 'sd-herinnering-kop', nieuw ? `Blok ${b + 1} klopt!` : `Blok ${b + 1}`));
    if (h.foto) {
      const img = el('img');
      img.src = h.foto;
      img.alt = '';
      kaart.append(img);
    }
    kaart.append(el('p', 'sd-herinnering-tekst', h.bijschrift || ''));
    const sluit = () => { laag.classList.add('weg'); later(() => laag.remove(), 250); };
    kaart.append(knop('knop', nieuw ? 'Verder puzzelen' : 'Sluiten', sluit));
    laag.append(kaart);
    laag.addEventListener('click', (e) => { if (e.target === laag) sluit(); });
    document.body.append(laag);
    if (nieuw) later(sluit, 6500);
  }

  /* ----------------------------------------------------------
     Een puzzel spelen
     ---------------------------------------------------------- */
  function startPuzzel(p) {
    opruimen();
    pz = p;
    const s = opslag().puzzels[p.id] || {};
    waarden = [...(s.w && s.w.length === 81 ? s.w : p.start.replace(/\./g, '0'))].map(Number);
    // Startcijfers altijd uit de puzzel zelf
    [...p.start].forEach((c, i) => { if (c !== '.') waarden[i] = Number(c); });
    notities = Array.isArray(s.n) && s.n.length === 81 ? s.n.slice() : Array(81).fill(0);
    levens = typeof s.levens === 'number' ? s.levens : LEVENS;
    blokkenAf = s.blokken || 0;
    bezig = false;
    gekozen = -1;
    potlood = false;
    geschiedenis = [];
    bouwScherm();
    teken();
    if (s.klaar) toonKlaar(true);
    else if (levens <= 0) toonOp();
  }

  function bouwScherm() {
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const niv = NIVEAUS.find((n) => n.id === pz.niveau);

    const balk = el('div', 'ws-balk');
    balk.append(knop('fotos-terug', '‹ Sudoku’s', toonKeuze));
    el$.info = el('span', 'ws-stand');
    balk.append(el$.info);
    wortel.append(balk);
    el$.titel = el('p', 'sd-titel', `${pz.naam} · ${niv ? niv.naam.toLowerCase() : ''}`);
    wortel.append(el$.titel);

    // Raster: 9 blokken van 3x3
    const raster = el('div', 'sd-raster');
    const blokEls = [];
    for (let b = 0; b < 9; b++) { const be = el('div', 'sd-blok'); blokEls.push(be); raster.append(be); }
    vakEls = [];
    for (let i = 0; i < 81; i++) {
      const v = el('div', 'sd-vak');
      v.dataset.i = i;
      vakEls.push(v);
      blokEls[blok(i)].append(v);
    }
    raster.addEventListener('click', (e) => {
      const v = e.target.closest('.sd-vak');
      if (v) kies(Number(v.dataset.i));
    });
    el$.raster = raster;
    el$.blokEls = blokEls;
    wortel.append(raster);

    // Gereedschap
    const tools = el('div', 'sd-tools');
    el$.undo = knop('sd-tool', '↶ Terug', ongedaan);
    el$.gum = knop('sd-tool', '⌫ Gum', gum);
    el$.potlood = knop('sd-tool', '✏️ Potlood', () => { potlood = !potlood; teken(); });
    tools.append(el$.undo, el$.gum, el$.potlood);
    wortel.append(tools);

    // Cijferbalk
    const cijfers = el('div', 'sd-cijfers');
    cijferKnoppen = [];
    for (let d = 1; d <= 9; d++) {
      const k = knop('sd-cijfer', null, () => vul(d));
      k.append(el('span', 'sd-cijfer-groot', String(d)), el('span', 'sd-cijfer-rest', ''));
      cijferKnoppen.push(k);
      cijfers.append(k);
    }
    el$.cijfers = cijfers;
    wortel.append(cijfers);

    // Echt toetsenbord (handig op de computer)
    toetsLuisteraar = (e) => {
      if (/^[1-9]$/.test(e.key)) vul(Number(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete') gum();
      else if (e.key.startsWith('Arrow') && gekozen >= 0) {
        const r = rij(gekozen), c = kol(gekozen);
        const nr = { ArrowUp: [r - 1, c], ArrowDown: [r + 1, c], ArrowLeft: [r, c - 1], ArrowRight: [r, c + 1] }[e.key];
        if (nr && nr[0] >= 0 && nr[0] < 9 && nr[1] >= 0 && nr[1] < 9) { kies(nr[0] * 9 + nr[1]); e.preventDefault(); }
      }
    };
    document.addEventListener('keydown', toetsLuisteraar);
  }

  /* ----------------------------------------------------------
     Tekenen
     ---------------------------------------------------------- */
  function teken() {
    const keuzeCijfer = gekozen >= 0 ? waarden[gekozen] : 0;
    for (let i = 0; i < 81; i++) {
      const v = vakEls[i];
      const k = ['sd-vak'];
      if (isStart(i)) k.push('start');
      else if (waarden[i]) k.push('eigen');
      if (gekozen >= 0) {
        if (i === gekozen) k.push('gekozen');
        else if (rij(i) === rij(gekozen) || kol(i) === kol(gekozen) || blok(i) === blok(gekozen)) k.push('buur');
        if (keuzeCijfer && waarden[i] === keuzeCijfer && i !== gekozen) k.push('zelfde');
      }
      v.className = k.join(' ');
      v.textContent = '';
      if (waarden[i]) {
        v.textContent = waarden[i];
      } else if (notities[i]) {
        const n = el('span', 'sd-notities');
        for (let d = 1; d <= 9; d++) {
          const s = el('span', '', notities[i] & (1 << (d - 1)) ? String(d) : '');
          if (keuzeCijfer === d) s.className = 'zelfde';
          n.append(s);
        }
        v.append(n);
      }
    }
    // Blokken die helemaal kloppen een zacht randje geven
    el$.blokEls.forEach((be, b) => be.classList.toggle('af', Boolean(blokkenAf & (1 << b))));

    // Cijferbalk: hoeveel van elk cijfer nog te plaatsen
    for (let d = 1; d <= 9; d++) {
      const over = 9 - waarden.filter((w) => w === d).length;
      const k = cijferKnoppen[d - 1];
      k.querySelector('.sd-cijfer-rest').textContent = over > 0 ? over : '';
      k.classList.toggle('op', over <= 0);
      k.classList.toggle('potlood', potlood);
    }
    el$.potlood.classList.toggle('aan', potlood);
    el$.undo.disabled = !geschiedenis.length;
    el$.info.textContent = '';
    el$.info.append(el('span', 'sd-levens', '❤️'.repeat(Math.max(0, levens)) + '🤍'.repeat(LEVENS - Math.max(0, levens))));
    el$.info.setAttribute('aria-label', `${levens} van de ${LEVENS} levens`);
  }

  /* ----------------------------------------------------------
     Invoer
     ---------------------------------------------------------- */
  function kies(i) {
    gekozen = i;
    teken();
  }

  function onthoud(i) {
    geschiedenis.push({ i, w: waarden[i], n: notities[i], ook: [] });
    if (geschiedenis.length > 200) geschiedenis.shift();
  }

  function vul(d) {
    if (bezig || levens <= 0) return;
    if (gekozen < 0) { api.toast('Tik eerst op een vakje'); return; }
    const i = gekozen;
    if (isStart(i)) return;
    if (!potlood && d !== Number(pz.oplossing[i])) { fout(i, d); return; }
    if (potlood) {
      if (waarden[i]) return;
      onthoud(i);
      notities[i] ^= 1 << (d - 1);
    } else {
      if (waarden[i] === d) return;
      onthoud(i);
      const stap = geschiedenis[geschiedenis.length - 1];
      waarden[i] = d;
      notities[i] = 0;
      // Dit cijfer uit de notities van de buren halen (en onthouden voor 'terug')
      for (let j = 0; j < 81; j++) {
        if (buren(i, j) && (notities[j] & (1 << (d - 1)))) {
          stap.ook.push({ j, n: notities[j] });
          notities[j] &= ~(1 << (d - 1));
        }
      }
      controleerBlok(blok(i));
    }
    teken();
    bewaarPuzzel();
    if (!potlood && waarden.every((w, j) => w === Number(pz.oplossing[j]))) later(() => toonKlaar(false), 600);
  }

  // Fout cijfer: leven eraf, even rood laten zien, daarna weer weg.
  function fout(i, d) {
    levens--;
    bezig = true;
    const oud = waarden[i];
    waarden[i] = d;
    teken();
    const v = vakEls[i];
    v.classList.add('fout-cijfer', 'schud');
    bewaarPuzzel();
    later(() => {
      waarden[i] = oud;
      bezig = false;
      teken();
      if (levens <= 0) toonOp();
    }, FOUT_ZICHTBAAR);
  }

  // Geen levens meer: nuchter berichtje en opnieuw beginnen.
  function toonOp() {
    gekozen = -1;
    teken();
    const kaart = el('div', 'sd-klaar sd-op');
    kaart.append(
      el('p', 'quiz-hartjes', '🤍'.repeat(LEVENS)),
      el('h3', 'sier', 'Levens op'),
      el('p', 'quiz-slot', 'Drie keer mis. Gewoon opnieuw, niemand die het ziet 🫡'),
      el('p', 'sd-op-klein', 'Herinneringen die je al hebt, blijven in het album.'),
      knop('knop', 'Opnieuw', opnieuw),
      knop('knop zacht', 'Andere sudoku', toonKeuze),
    );
    el$.cijfers.replaceWith(kaart);
    el$.cijfers = kaart;
    const tools = wortel.querySelector('.sd-tools');
    if (tools) tools.remove();
    requestAnimationFrame(() => kaart.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  function opnieuw() {
    const o = opslag();
    o.puzzels[pz.id] = Object.assign({}, o.puzzels[pz.id], { w: pz.start.replace(/\./g, '0'), n: Array(81).fill(0), levens: LEVENS, blokken: 0 });
    api.opslag.bewaar({ puzzels: o.puzzels });
    startPuzzel(pz);
  }

  function gum() {
    if (bezig) return;
    if (gekozen < 0 || isStart(gekozen)) return;
    if (!waarden[gekozen] && !notities[gekozen]) return;
    onthoud(gekozen);
    waarden[gekozen] = 0;
    notities[gekozen] = 0;
    teken();
    bewaarPuzzel();
  }

  function ongedaan() {
    if (bezig) return;
    const stap = geschiedenis.pop();
    if (!stap) return;
    waarden[stap.i] = stap.w;
    notities[stap.i] = stap.n;
    stap.ook.forEach(({ j, n }) => { notities[j] = n; });
    gekozen = stap.i;
    teken();
    bewaarPuzzel();
  }

  // Blok helemaal goed? Dan de herinnering van dat blok.
  function controleerBlok(b) {
    if (blokkenAf & (1 << b)) return;
    for (let i = 0; i < 81; i++) if (blok(i) === b && waarden[i] !== Number(pz.oplossing[i])) return;
    blokkenAf |= 1 << b;
    const o = opslag();
    const album = o.album.slice();
    const nieuw = !album[b];
    album[b] = true;
    api.opslag.bewaar({ album });
    const be = el$.blokEls[b];
    be.classList.remove('juich'); void be.offsetWidth; be.classList.add('juich');
    // Herinnering na de laatste zet van de puzzel laten wachten op het eindscherm
    const allesAf = waarden.every((w, j) => w === Number(pz.oplossing[j]));
    if (!allesAf) toonHerinnering(b, true);   // meteen, zodat een volgende tik niet per ongeluk op de herinnering valt
    else if (nieuw) later(() => api.toast('Nieuwe herinnering in het Malta-album'), 300);
  }

  /* ----------------------------------------------------------
     Opgelost
     ---------------------------------------------------------- */
  function toonKlaar(alEerder) {
    const s = opslag().puzzels[pz.id] || {};
    const hartjes = alEerder ? (s.hartjes || Math.max(1, levens)) : Math.max(1, levens);
    if (!alEerder) {
      bewaarPuzzel({ klaar: true, hartjes: Math.max(hartjes, s.hartjes || 0) });
      api.klaar({ hartjes });
    }
    gekozen = -1;
    teken();
    el$.raster.classList.add('opgelost');

    const kaart = el('div', 'sd-klaar');
    kaart.append(
      el('p', 'quiz-hartjes', '💗'.repeat(hartjes) + '🤍'.repeat(3 - hartjes)),
      el('h3', 'sier', 'Opgelost!'),
      el('p', 'quiz-score', levens >= LEVENS ? `${pz.naam} · zonder fouten` : `${pz.naam} · nog ${levens} ${levens === 1 ? 'leven' : 'levens'} over`),
    );
    if (sd().slotHerinnering) {
      const slot = el('div', 'sd-slotkaart');
      slot.append(el('b', '', 'Nog één herinnering'), el('p', '', sd().slotHerinnering));
      kaart.append(slot);
    }
    kaart.append(
      knop('knop', 'Naar het Malta-album', toonAlbum),
      knop('knop zacht', 'Andere sudoku', toonKeuze),
    );
    el$.cijfers.replaceWith(kaart);
    wortel.querySelector('.sd-tools').remove();
    if (!alEerder) requestAnimationFrame(() => kaart.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'sudoku',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      toonKeuze();
    },
    stop() {
      opruimen();
      document.querySelectorAll('.sd-laag').forEach((l) => l.remove());
    },
  });
})();
