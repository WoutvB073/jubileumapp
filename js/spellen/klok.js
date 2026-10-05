/*
  SPEL: HOE LAAT IS HET? (klokkijken)
  ------------------------------------------------------------
  Tien vragen met een analoge klok, steeds iets moeilijker:
  vraag 1-3 hele en halve uren, 4-6 kwartieren, 7-10 per vijf minuten.
  Antwoorden in Nederlandse kloktaal ("vijf voor half acht").
  Foute antwoorden zijn logische vergissingen: voor/over omgedraaid,
  een uur ernaast (de klassieke "half"-fout), of de wijzers verwisseld.

  Na vraag 3, 6 en 9 een korte reactie uit CONTENT.klok (goed of fout).
  Hartjes: 9-10 goed = 3, 7-8 = 2, anders 1.
*/
(function () {
  'use strict';

  const AANTAL = 10;
  const UREN = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];

  let api = null;
  let wortel = null;
  let vragen = [];
  let bij = 0;
  let goedGeteld = 0;

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

  const kies = (lijst) => lijst[Math.floor(Math.random() * lijst.length)];
  function hussel(lijst) {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  }

  /* ----------------------------------------------------------
     Tijd en kloktaal (12-uursklok: uur 1..12, minuut 0..55)
     ---------------------------------------------------------- */
  const norm = (u) => ((u - 1 + 120) % 12) + 1;
  const naam = (u) => UREN[norm(u)];
  const sleutel = (t) => `${norm(t.u)}:${t.m}`;

  function kloktaal({ u, m }) {
    const nu = naam(u);
    const straks = naam(u + 1);
    switch (m) {
      case 0: return `${nu} uur`;
      case 5: return `vijf over ${nu}`;
      case 10: return `tien over ${nu}`;
      case 15: return `kwart over ${nu}`;
      case 20: return `tien voor half ${straks}`;
      case 25: return `vijf voor half ${straks}`;
      case 30: return `half ${straks}`;
      case 35: return `vijf over half ${straks}`;
      case 40: return `tien over half ${straks}`;
      case 45: return `kwart voor ${straks}`;
      case 50: return `tien voor ${straks}`;
      case 55: return `vijf voor ${straks}`;
      default: return '';
    }
  }

  // Tijd verschuiven met een aantal minuten
  function plus(t, minuten) {
    let totaal = (norm(t.u) % 12) * 60 + t.m + minuten;
    totaal = ((totaal % 720) + 720) % 720;
    return { u: norm(Math.floor(totaal / 60)), m: totaal % 60 };
  }

  // Logische vergissingen bij een tijd
  function vergissingen(t) {
    const uit = [];
    const { m } = t;
    // 'voor' en 'over' omgedraaid (gespiegeld rond het hele of het halve uur)
    if (m === 15 || m === 45) uit.push(plus(t, m === 15 ? -30 : 30));
    if (m === 5 || m === 10 || m === 50 || m === 55) uit.push(plus(t, m < 30 ? -2 * m : 2 * (60 - m)));
    if (m === 20 || m === 25 || m === 35 || m === 40) uit.push(plus(t, 2 * (30 - m)));
    // De klassieke half-fout: een uur te laat of te vroeg gelezen
    uit.push(plus(t, 60), plus(t, -60));
    // Wijzers verwisseld: de grote wijzer als uur, de kleine als minuten
    const urenPositie = (norm(t.u) % 12) * 5 + m / 12;        // positie kleine wijzer (in minuten)
    uit.push({ u: norm(Math.round(m / 5) || 12), m: (Math.round(urenPositie / 5) * 5) % 60 });
    // Net ernaast: vijf minuten verschil
    uit.push(plus(t, 5), plus(t, -5));
    return uit;
  }

  function maakVraag(nr) {
    const minuten = nr < 3 ? [0, 30] : nr < 6 ? [15, 45, 15, 45, 0, 30] : [5, 10, 20, 25, 35, 40, 50, 55];
    const t = { u: 1 + Math.floor(Math.random() * 12), m: kies(minuten) };
    const goed = kloktaal(t);
    const gezien = new Set([sleutel(t)]);
    const fout = [];
    // De voor/over-vergissing (staat als eerste in de lijst) altijd meenemen; de rest gehusseld,
    // met tijden van dezelfde soort (bv. kwartieren) bij voorkeur.
    const lijst = vergissingen(t);
    const eerst = t.m % 30 !== 0 ? [lijst.shift()] : [];
    const rest = hussel(lijst).sort((a, b) => (minuten.includes(b.m) ? 1 : 0) - (minuten.includes(a.m) ? 1 : 0));
    for (const v of eerst.concat(rest)) {
      if (fout.length === 3) break;
      if (gezien.has(sleutel(v))) continue;
      gezien.add(sleutel(v));
      fout.push(kloktaal(v));
    }
    while (fout.length < 3) {   // vangnet: willekeurige tijd in dezelfde soort
      const v = { u: 1 + Math.floor(Math.random() * 12), m: kies(minuten) };
      if (!gezien.has(sleutel(v))) { gezien.add(sleutel(v)); fout.push(kloktaal(v)); }
    }
    const opties = hussel([goed, ...fout]);
    return { t, opties, goed: opties.indexOf(goed) };
  }

  /* ----------------------------------------------------------
     De klok (SVG)
     ---------------------------------------------------------- */
  function maakKlok(t) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'klok');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Een klok');
    const deel = (tag, attr) => { const e = document.createElementNS(ns, tag); Object.entries(attr).forEach(([k, v]) => e.setAttribute(k, v)); svg.append(e); return e; };
    deel('circle', { cx: 100, cy: 100, r: 96, class: 'klok-rand' });
    deel('circle', { cx: 100, cy: 100, r: 88, class: 'klok-plaat' });
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180;
      const groot = i % 5 === 0;
      const r1 = groot ? 76 : 81, r2 = 86;
      deel('line', { x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a), x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a), class: groot ? 'klok-streep groot' : 'klok-streep' });
    }
    for (let u = 1; u <= 12; u++) {
      const a = (u * 30 * Math.PI) / 180;
      const tekst = deel('text', { x: 100 + 63 * Math.sin(a), y: 100 - 63 * Math.cos(a) + 6, class: 'klok-cijfer' });
      tekst.textContent = String(u);
    }
    const uurHoek = (norm(t.u) % 12) * 30 + t.m * 0.5;
    const minHoek = t.m * 6;
    deel('line', { x1: 100, y1: 112, x2: 100, y2: 52, class: 'klok-uur', transform: `rotate(${uurHoek} 100 100)` });
    deel('line', { x1: 100, y1: 116, x2: 100, y2: 26, class: 'klok-min', transform: `rotate(${minHoek} 100 100)` });
    deel('circle', { cx: 100, cy: 100, r: 6, class: 'klok-midden' });
    return svg;
  }

  /* ----------------------------------------------------------
     Spel
     ---------------------------------------------------------- */
  function begin() {
    vragen = [...Array(AANTAL)].map((_, i) => maakVraag(i));
    bij = 0;
    goedGeteld = 0;
    toonIntro();
  }

  function toonIntro() {
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const kaart = el('div', 'quiz-uitslag-kaart klok-intro');
    kaart.append(
      maakKlok({ u: 8, m: 0 }),
      el('h3', 'sier', 'Hoe laat is het?'),
      el('p', 'quiz-slot', 'Tien vragen over klokkijken. Geen idee waarom ik dit spel speciaal voor jou heb gemaakt 😂'),
      el('p', 'klok-uitleg', 'Eerst hele en halve uren, dan kwartieren, dan per vijf minuten.'),
      knop('knop', 'Begin', () => toonVraag()),
    );
    wortel.append(kaart);
  }

  function toonVraag() {
    const v = vragen[bij];
    wortel.textContent = '';
    window.scrollTo(0, 0);

    const kop = el('div', 'quiz-kop');
    kop.append(el('span', 'quiz-teller', `Vraag ${bij + 1} van ${vragen.length}`));
    const balk = el('div', 'quiz-balk');
    const vulling = el('div', 'quiz-balk-vulling');
    vulling.style.width = (100 * (bij + 1)) / vragen.length + '%';
    balk.append(vulling);
    kop.append(balk);
    wortel.append(kop);

    const kaart = el('div', 'quiz-kaart klok-kaart');
    kaart.append(maakKlok(v.t), el('h3', 'quiz-vraag klok-vraag', 'Hoe laat is het?'));
    const opties = el('div', 'quiz-opties');
    v.opties.forEach((tekst, i) => opties.append(knop('quiz-optie', tekst, () => antwoord(i, opties, kaart, v))));
    kaart.append(opties);
    wortel.append(kaart);
  }

  function antwoord(i, optiesBak, kaart, v) {
    const knoppen = [...optiesBak.children];
    if (knoppen.some((k) => k.disabled)) return;
    const isGoed = i === v.goed;
    if (isGoed) goedGeteld++;
    knoppen.forEach((k, j) => {
      k.disabled = true;
      if (j === v.goed) k.classList.add('goed');
      else if (j === i) k.classList.add('fout');
      else k.classList.add('grijs');
    });

    const na = el('div', 'quiz-na');
    na.append(el('p', 'quiz-uitslag ' + (isGoed ? 'is-goed' : 'is-fout'), isGoed ? 'Goed!' : 'Net niet…'));
    if (!isGoed) na.append(el('p', 'quiz-juist', 'Het is ' + v.opties[v.goed] + '.'));
    // Af en toe een reactie (na vraag 3, 6 en 9)
    const reacties = api.content.klok || {};
    if ((bij + 1) % 3 === 0) {
      const lijst = (isGoed ? reacties.goed : reacties.fout) || [];
      if (lijst.length) na.append(el('p', 'quiz-reactie', lijst[Math.floor((bij + 1) / 3 - 1) % lijst.length]));
    }
    na.append(knop('knop', bij + 1 < vragen.length ? 'Volgende' : 'Naar de uitslag', () => {
      bij++;
      if (bij < vragen.length) toonVraag(); else uitslag();
    }));
    kaart.append(na);
    requestAnimationFrame(() => na.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  function uitslag() {
    const hartjes = goedGeteld >= 9 ? 3 : goedGeteld >= 7 ? 2 : 1;
    api.klaar({ hartjes });
    let tekst;
    if (hartjes === 3) tekst = 'Je kunt dus gewoon klokkijken. Dan heb je vanaf nu geen excuus meer om te laat te komen ⏰';
    else if (hartjes === 2) tekst = 'Bijna alles goed. Ik reken er voortaan nog steeds vijf minuten bij 😂';
    else tekst = 'Oké, dit verklaart een hoop 😂';

    wortel.textContent = '';
    window.scrollTo(0, 0);
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', '💗'.repeat(hartjes) + '🤍'.repeat(3 - hartjes)),
      el('h3', 'sier', hartjes === 3 ? 'Precies op tijd' : 'Netjes geprobeerd'),
      el('p', 'quiz-score', `${goedGeteld} van de ${vragen.length} goed`),
      el('p', 'quiz-slot', tekst),
      knop('knop', 'Nog een keer', begin),
      knop('knop zacht', 'Terug naar het menu', () => api.terug()),
    );
    wortel.append(kaart);
  }

  // Voor tests: de kloktaal van buitenaf kunnen controleren
  self.__klokTaal = kloktaal;

  Spellen.registreer({
    id: 'klok',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      begin();
    },
  });
})();
