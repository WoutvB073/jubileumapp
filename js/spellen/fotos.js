/*
  SPEL: FOTOSPELLEN
  ------------------------------------------------------------
  Twee spelletjes met onze foto's:
  - Memory: zoek de paren (CONTENT.fotos.memory)
  - Raad de plek of datum bij een foto (CONTENT.fotos.raadDePlek)

  Elk spelletje krijgt een eigen hartjesscore. Als ze allebei
  gespeeld zijn, telt het gemiddelde als score voor de tegel.
  Na de memory zie je de foto's met hun bijschrift
  (CONTENT.fotoUitleg).
*/
(function () {
  'use strict';

  // Memory: zoveel zetten (twee kaartjes omdraaien = één zet) voor 3 of 2 hartjes.
  const MEMORY_DREMPELS = [14, 20];
  // Raad de plek: zoveel procent goed voor 3 of 2 hartjes.
  const RAAD_DREMPELS = [0.8, 0.5];
  // Zo lang blijven twee verkeerde kaartjes open (ms).
  const OMDRAAI_PAUZE = 900;

  let api = null;
  let wortel = null;
  let timers = [];

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

  function hussel(lijst) {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function stopTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function hartjesTekst(n) {
    return '💗'.repeat(n) + '🤍'.repeat(3 - n);
  }

  // Bijschrift bij een foto uit CONTENT.fotoUitleg ('images/foto-07.jpg' → 'foto-07').
  function uitlegBij(pad) {
    const sleutel = (String(pad).match(/foto-\d+/) || [])[0];
    return (sleutel && (api.content.fotoUitleg || {})[sleutel]) || null;
  }

  function scores() {
    const bewaard = api.opslag.lees();
    return { memory: bewaard.memory, raad: bewaard.raad };
  }

  // Score van één spelletje bewaren (beste telt) en, als beide gespeeld zijn, de tegel bijwerken.
  function bewaarScore(welk, hartjes) {
    const oud = scores();
    const nieuw = Math.max(hartjes, oud[welk] || 0);
    api.opslag.bewaar({ [welk]: nieuw });
    const s = scores();
    if (s.memory && s.raad) api.klaar({ hartjes: Math.round((s.memory + s.raad) / 2) });
  }

  function terugNaarKeuze() {
    return knop('fotos-terug', '‹ Fotospellen', toonKeuze);
  }

  /* ----------------------------------------------------------
     Keuzescherm
     ---------------------------------------------------------- */
  function toonKeuze() {
    stopTimers();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const s = scores();

    wortel.append(el('p', 'fotos-intro', "Twee spelletjes met onze foto's. Speel ze allebei voor de hartjes op de tegel."));

    const keuzes = el('div', 'fotos-keuzes');
    keuzes.append(
      keuzeKaart('🧩', 'Memory', 'Zoek de paren', s.memory, startMemory),
      keuzeKaart('📍', 'Raad de plek of datum', 'Waar en wanneer was dit?', s.raad, startRaad),
    );
    wortel.append(keuzes);
  }

  function keuzeKaart(icoon, titel, sub, score, actie) {
    const k = knop('fotos-keuze', null, actie);
    const status = el('span', 'fotos-keuze-status');
    if (score) status.textContent = '♥'.repeat(score) + '♡'.repeat(3 - score);
    else status.append(el('span', 'pil', 'nog niet gespeeld'));
    k.append(
      el('span', 'tegel-icoon', icoon),
      el('span', 'fotos-keuze-titel', titel),
      el('span', 'fotos-keuze-sub', sub),
      status,
    );
    return k;
  }

  /* ----------------------------------------------------------
     MEMORY
     ---------------------------------------------------------- */
  function startMemory() {
    stopTimers();
    const fotos = (api.content.fotos && api.content.fotos.memory || []).filter(Boolean);
    wortel.textContent = '';
    window.scrollTo(0, 0);
    wortel.append(terugNaarKeuze());

    if (fotos.length < 2) {
      wortel.append(el('p', 'fotos-intro', 'Er staan nog geen foto’s voor de memory in content.js.'));
      return;
    }

    // Foto's alvast laden, zodat ze er meteen staan bij het omdraaien.
    fotos.forEach((f) => { const i = new Image(); i.src = f; });

    let zetten = 0;
    let gevonden = 0;
    let open = [];       // de kaartjes die nu openliggen (max 2)
    let bezig = false;   // even wachten tot twee verkeerde kaartjes weer dicht zijn

    const stand = el('p', 'mem-stand');
    const toonStand = () => { stand.textContent = `Zetten: ${zetten}  ·  Paren: ${gevonden} van ${fotos.length}`; };
    toonStand();
    wortel.append(stand);

    const raster = el('div', 'mem-raster');
    const kaartjes = hussel(fotos.concat(fotos));
    kaartjes.forEach((foto, i) => {
      const kaart = el('button', 'mem-kaart');
      kaart.type = 'button';
      kaart.dataset.foto = foto;
      kaart.setAttribute('aria-label', 'Kaartje ' + (i + 1));
      const binnen = el('span', 'mem-binnen');
      const rug = el('span', 'mem-rug', '♥');
      const voor = el('span', 'mem-voor');
      const img = el('img');
      img.src = foto;
      img.alt = '';
      voor.append(img);
      binnen.append(rug, voor);
      kaart.append(binnen);
      kaart.addEventListener('click', () => draai(kaart));
      raster.append(kaart);
    });
    wortel.append(raster);

    function draai(kaart) {
      if (bezig || kaart.classList.contains('om')) return;
      kaart.classList.add('om');
      open.push(kaart);
      if (open.length < 2) return;

      zetten++;
      const [a, b] = open;
      open = [];
      if (a.dataset.foto === b.dataset.foto) {
        gevonden++;
        toonStand();
        later(() => { a.classList.add('gevonden'); b.classList.add('gevonden'); }, 350);
        if (gevonden === fotos.length) later(() => klaarMemory(zetten, fotos), 1100);
      } else {
        toonStand();
        bezig = true;
        later(() => {
          a.classList.remove('om');
          b.classList.remove('om');
          bezig = false;
        }, OMDRAAI_PAUZE);
      }
    }
  }

  function klaarMemory(zetten, fotos) {
    const hartjes = zetten <= MEMORY_DREMPELS[0] ? 3 : zetten <= MEMORY_DREMPELS[1] ? 2 : 1;
    bewaarScore('memory', hartjes);

    wortel.textContent = '';
    window.scrollTo(0, 0);
    wortel.append(terugNaarKeuze());

    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', hartjesTekst(hartjes)),
      el('h3', 'sier', hartjes === 3 ? 'Wat een geheugen' : 'Alle paren gevonden'),
      el('p', 'quiz-score', `In ${zetten} zetten`),
      el('p', 'quiz-slot', 'En dit zijn ze:'),
    );
    wortel.append(kaart);

    // De foto's met hun bijschrift
    const lijst = el('div', 'fotos-album');
    fotos.forEach((foto) => {
      const u = uitlegBij(foto);
      const fig = el('figure', 'fotos-album-foto');
      const img = el('img');
      img.src = foto;
      img.alt = '';
      img.loading = 'lazy';
      fig.append(img);
      if (u) {
        const onder = el('figcaption');
        onder.append(el('span', 'fotos-album-tekst', u.bijschrift || ''), el('span', 'fotos-album-wanneer', u.wanneer || ''));
        fig.append(onder);
      }
      lijst.append(fig);
    });
    wortel.append(lijst);

    const knoppen = el('div', 'fotos-knoppen');
    knoppen.append(knop('knop', 'Nog een keer', startMemory), knop('knop zacht', 'Terug naar fotospellen', toonKeuze));
    wortel.append(knoppen);
  }

  /* ----------------------------------------------------------
     RAAD DE PLEK OF DATUM
     ---------------------------------------------------------- */
  function startRaad() {
    stopTimers();
    const bron = (api.content.fotos && api.content.fotos.raadDePlek || [])
      .filter((v) => v && v.foto && v.vraag && Array.isArray(v.opties) && v.opties.length > 1);
    const vragen = hussel(bron).map((v) => {
      const opties = hussel(v.opties.map((tekst, i) => ({ tekst, goed: i === (v.goed || 0) })));
      return { foto: v.foto, vraag: v.vraag, reactie: v.reactie || '', opties: opties.map((o) => o.tekst), goed: opties.findIndex((o) => o.goed) };
    });
    let bij = 0;
    let goedGeteld = 0;

    // Alvast laden
    vragen.forEach((v) => { const i = new Image(); i.src = v.foto; });

    if (!vragen.length) {
      wortel.textContent = '';
      wortel.append(terugNaarKeuze(), el('p', 'fotos-intro', 'Er staan nog geen foto-vragen in content.js.'));
      return;
    }
    toonVraag();

    function toonVraag() {
      const v = vragen[bij];
      wortel.textContent = '';
      wortel.append(terugNaarKeuze());

      const kop = el('div', 'quiz-kop');
      kop.append(el('span', 'quiz-teller', `Foto ${bij + 1} van ${vragen.length}`));
      const balk = el('div', 'quiz-balk');
      const vulling = el('div', 'quiz-balk-vulling');
      vulling.style.width = (100 * (bij + 1) / vragen.length) + '%';
      balk.append(vulling);
      kop.append(balk);
      wortel.append(kop);

      const kaart = el('div', 'quiz-kaart');
      const lijst = el('div', 'raad-foto');
      const img = el('img');
      img.src = v.foto;
      img.alt = '';
      lijst.append(img);
      kaart.append(lijst, el('h3', 'quiz-vraag', v.vraag));

      const opties = el('div', 'quiz-opties');
      v.opties.forEach((tekst, i) => {
        opties.append(knop('quiz-optie', tekst, () => kies(i, opties, kaart, v)));
      });
      kaart.append(opties);
      wortel.append(kaart);
    }

    function kies(gekozen, optiesBak, kaart, v) {
      const knoppen = [...optiesBak.children];
      if (knoppen.some((k) => k.disabled)) return;
      const isGoed = gekozen === v.goed;
      if (isGoed) goedGeteld++;

      knoppen.forEach((k, i) => {
        k.disabled = true;
        if (i === v.goed) k.classList.add('goed');
        else if (i === gekozen) k.classList.add('fout');
        else k.classList.add('grijs');
      });

      const na = el('div', 'quiz-na');
      na.append(el('p', 'quiz-uitslag ' + (isGoed ? 'is-goed' : 'is-fout'), isGoed ? 'Goed!' : 'Net niet…'));
      if (!isGoed) na.append(el('p', 'quiz-juist', 'Het juiste antwoord: ' + v.opties[v.goed]));
      if (v.reactie) na.append(el('p', 'quiz-reactie', v.reactie));
      na.append(knop('knop', bij + 1 < vragen.length ? 'Volgende foto' : 'Naar de uitslag', () => {
        bij++;
        if (bij < vragen.length) {
          toonVraag();
          window.scrollTo(0, 0);
        } else {
          klaarRaad();
        }
      }));
      kaart.append(na);
      requestAnimationFrame(() => na.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    }

    function klaarRaad() {
      const deel = goedGeteld / vragen.length;
      const hartjes = deel >= RAAD_DREMPELS[0] ? 3 : deel >= RAAD_DREMPELS[1] ? 2 : 1;
      bewaarScore('raad', hartjes);

      wortel.textContent = '';
      window.scrollTo(0, 0);
      wortel.append(terugNaarKeuze());
      const kaart = el('div', 'quiz-uitslag-kaart');
      kaart.append(
        el('p', 'quiz-hartjes', hartjesTekst(hartjes)),
        el('h3', 'sier', hartjes === 3 ? 'Jij weet het allemaal nog' : 'Netjes geprobeerd'),
        el('p', 'quiz-score', `${goedGeteld} van de ${vragen.length} goed`),
        el('p', 'quiz-slot', hartjes === 3
          ? 'Elke plek, elke datum. Jij weet het beter dan ik 🥲'
          : 'Te veel uitjes om te onthouden, dat is ook een compliment 😁'),
        knop('knop', 'Nog een keer', startRaad),
        knop('knop zacht', 'Terug naar fotospellen', toonKeuze),
      );
      wortel.append(kaart);
    }
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'fotos',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      toonKeuze();
    },
    stop() {
      stopTimers();
    },
  });
})();
