/*
  SPEL: TIJDLIJN
  ------------------------------------------------------------
  Momenten uit content.js (CONTENT.tijdlijn) in de goede volgorde
  slepen. Elke ronde begint en eindigt met een vast moment
  (vast: 'begin' = 22-11-2025, vast: 'eind' = 22-11-2026); daartussen
  een handvol momenten in willekeurige volgorde. Na een paar rondes
  zijn alle momenten een keer langsgekomen.

  Score per ronde: in één keer goed = 3 hartjes, twee keer = 2,
  vaker = 1. De tegel krijgt het gemiddelde.
  Aan het eind: ons hele jaar als één tijdlijn.
*/
(function () {
  'use strict';

  const PER_RONDE = 6;    // maximaal zoveel momenten om te slepen per ronde
  const RAND = 90;        // px vanaf de schermrand waar de pagina meescrolt tijdens het slepen

  let api = null;
  let wortel = null;
  let alle = [];          // alle momenten, met hun plek (nr) in de goede volgorde
  let beginPunt = null;
  let eindPunt = null;
  let rondes = [];        // per ronde een lijst momenten
  let ronde = 0;
  let pogingen = 0;
  let scores = [];
  let sleep = null;       // gegevens van het kaartje dat nu gesleept wordt
  let animatie = 0;       // requestAnimationFrame voor het meescrollen

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

  function fotoOfHart(moment, klasse) {
    const vak = el('span', klasse);
    if (moment.foto) {
      const img = el('img');
      img.src = moment.foto;
      img.alt = '';
      img.addEventListener('error', () => { img.remove(); vak.textContent = '💞'; });
      vak.append(img);
    } else {
      vak.textContent = '💞';
    }
    return vak;
  }

  /* ----------------------------------------------------------
     Starten: rondes maken
     ---------------------------------------------------------- */
  function begin() {
    stopSlepen();
    alle = (api.content.tijdlijn || []).filter((m) => m && m.titel).map((m, nr) => Object.assign({ nr }, m));
    beginPunt = alle.find((m) => m.vast === 'begin') || null;
    eindPunt = alle.find((m) => m.vast === 'eind') || null;

    // Momenten tussen begin- en eindpunt (zonder vaste punten: dan alles).
    const van = beginPunt ? beginPunt.nr + 1 : 0;
    const tot = eindPunt ? eindPunt.nr : alle.length;
    const midden = alle.slice(van, tot).filter((m) => !m.vast);

    // Eerlijk verdelen over zo weinig mogelijk rondes van max PER_RONDE.
    const aantal = Math.max(1, Math.ceil(midden.length / PER_RONDE));
    const gehusseld = hussel(midden);
    rondes = [];
    for (let r = 0; r < aantal; r++) rondes.push([]);
    gehusseld.forEach((m, i) => rondes[i % aantal].push(m));

    ronde = 0;
    scores = [];

    if (midden.length < 2) {
      wortel.textContent = '';
      const kaart = el('div', 'melding-kaart');
      kaart.append(el('h3', 'sier', 'Nog even geduld'), el('p', '', 'Er staan nog te weinig momenten in de tijdlijn in content.js. 💌'));
      wortel.append(kaart);
      return;
    }
    toonRonde();
  }

  /* ----------------------------------------------------------
     Eén ronde
     ---------------------------------------------------------- */
  function toonRonde() {
    stopSlepen();
    pogingen = 0;
    wortel.textContent = '';
    window.scrollTo(0, 0);

    const kop = el('div', 'quiz-kop');
    kop.append(el('span', 'quiz-teller', `Ronde ${ronde + 1} van ${rondes.length}`));
    const balk = el('div', 'quiz-balk');
    const vulling = el('div', 'quiz-balk-vulling');
    vulling.style.width = (100 * (ronde + 1) / rondes.length) + '%';
    balk.append(vulling);
    kop.append(balk);
    wortel.append(kop, el('p', 'tl-uitleg', 'Sleep de momenten in de goede volgorde, van ons begin tot nu.'));

    const lijst = el('div', 'tl-lijst');
    if (beginPunt) lijst.append(vastPunt(beginPunt));

    // Beginvolgorde husselen, maar nooit al meteen goed.
    let volgorde = hussel(rondes[ronde]);
    for (let i = 0; i < 10 && isGoed(volgorde); i++) volgorde = hussel(rondes[ronde]);
    volgorde.forEach((m) => lijst.append(sleepKaart(m)));

    if (eindPunt) lijst.append(vastPunt(eindPunt));
    wortel.append(lijst);

    const melding = el('p', 'tl-melding');
    melding.hidden = true;
    wortel.append(melding, knop('knop', 'Controleer', () => controleer(lijst, melding)));
  }

  function isGoed(momenten) {
    return momenten.every((m, i) => i === 0 || momenten[i - 1].nr < m.nr);
  }

  function vastPunt(m) {
    const rij = el('div', 'tl-vast');
    rij.append(el('span', 'tl-vast-hart', m.vast === 'eind' ? '🎉' : '💗'));
    const tekst = el('span', 'tl-vast-tekst');
    tekst.append(el('b', '', m.titel), el('small', '', m.datum));
    rij.append(tekst);
    return rij;
  }

  function sleepKaart(m) {
    const kaart = el('div', 'tl-kaart');
    kaart.dataset.nr = m.nr;
    kaart.append(fotoOfHart(m, 'tl-foto'), el('span', 'tl-titel', m.titel), el('span', 'tl-greep', '⠿'));
    kaart.addEventListener('pointerdown', (e) => startSlepen(e, kaart));
    return kaart;
  }

  /* ----------------------------------------------------------
     Slepen (werkt met vinger en muis)
     ---------------------------------------------------------- */
  function startSlepen(e, kaart) {
    if (sleep || kaart.closest('.tl-lijst').classList.contains('klaar')) return;
    e.preventDefault();
    const lijst = kaart.parentElement;
    const kaarten = [...lijst.querySelectorAll('.tl-kaart')];
    const van = kaarten.indexOf(kaart);
    // Afstand tussen twee kaartjes (hoogte + tussenruimte)
    const stap = kaarten.length > 1
      ? Math.abs(kaarten[1].getBoundingClientRect().top - kaarten[0].getBoundingClientRect().top)
      : kaart.getBoundingClientRect().height;

    sleep = { kaart, lijst, kaarten, van, naar: van, stap, startY: e.clientY + window.scrollY, y: e.clientY, id: e.pointerId };
    try { kaart.setPointerCapture(e.pointerId); } catch (fout) { /* niet erg */ }
    kaart.classList.add('sleept');
    lijst.querySelectorAll('.goed, .fout').forEach((k) => k.classList.remove('goed', 'fout'));
    wortel.querySelector('.tl-melding').hidden = true;

    kaart.addEventListener('pointermove', beweeg);
    kaart.addEventListener('pointerup', loslaten);
    kaart.addEventListener('pointercancel', loslaten);
    animatie = requestAnimationFrame(meescrollen);
  }

  function beweeg(e) {
    if (!sleep || e.pointerId !== sleep.id) return;
    sleep.y = e.clientY;
    plaats();
  }

  // Kaartje onder de vinger houden en de andere kaartjes opzij schuiven.
  function plaats() {
    const s = sleep;
    const dy = s.y + window.scrollY - s.startY;
    s.kaart.style.transform = `translateY(${dy}px) scale(1.03)`;
    s.naar = Math.max(0, Math.min(s.kaarten.length - 1, s.van + Math.round(dy / s.stap)));
    s.kaarten.forEach((k, i) => {
      if (k === s.kaart) return;
      let schuif = 0;
      if (s.van < s.naar && i > s.van && i <= s.naar) schuif = -s.stap;
      if (s.van > s.naar && i >= s.naar && i < s.van) schuif = s.stap;
      k.style.transform = schuif ? `translateY(${schuif}px)` : '';
    });
  }

  // Bij de rand van het scherm de pagina laten meescrollen.
  function meescrollen() {
    if (!sleep) return;
    let stapje = 0;
    if (sleep.y < RAND) stapje = -Math.ceil((RAND - sleep.y) / 8);
    else if (sleep.y > window.innerHeight - RAND) stapje = Math.ceil((sleep.y - (window.innerHeight - RAND)) / 8);
    if (stapje) {
      window.scrollBy(0, stapje);
      plaats();
    }
    animatie = requestAnimationFrame(meescrollen);
  }

  function loslaten(e) {
    if (!sleep || e.pointerId !== sleep.id) return;
    const { kaart, lijst, kaarten, van, naar } = sleep;
    kaart.removeEventListener('pointermove', beweeg);
    kaart.removeEventListener('pointerup', loslaten);
    kaart.removeEventListener('pointercancel', loslaten);
    stopSlepen();

    // Zonder animatie op de nieuwe plek zetten, daarna animaties weer aan.
    lijst.classList.add('stil');
    kaarten.forEach((k) => { k.style.transform = ''; });
    kaart.classList.remove('sleept');
    if (naar > van) kaarten[naar].after(kaart);
    else if (naar < van) kaarten[naar].before(kaart);
    void lijst.offsetWidth;
    lijst.classList.remove('stil');
  }

  function stopSlepen() {
    cancelAnimationFrame(animatie);
    sleep = null;
  }

  /* ----------------------------------------------------------
     Controleren
     ---------------------------------------------------------- */
  function controleer(lijst, melding) {
    if (lijst.classList.contains('klaar')) return;
    pogingen++;
    const kaarten = [...lijst.querySelectorAll('.tl-kaart')];
    const juist = kaarten.map((k) => Number(k.dataset.nr)).sort((a, b) => a - b);
    let goed = 0;
    kaarten.forEach((k, i) => {
      const klopt = Number(k.dataset.nr) === juist[i];
      if (klopt) goed++;
      k.classList.remove('goed', 'fout');
      void k.offsetWidth;
      k.classList.add(klopt ? 'goed' : 'fout');
    });

    if (goed === kaarten.length) {
      lijst.classList.add('klaar');
      scores[ronde] = pogingen === 1 ? 3 : pogingen === 2 ? 2 : 1;
      melding.hidden = false;
      melding.textContent = pogingen === 1 ? 'In één keer goed!' : 'Alles staat goed!';
      setTimeout(onthul, 900);
    } else {
      melding.hidden = false;
      melding.textContent = `${goed} van de ${kaarten.length} staan al goed. Schuif de roze kaartjes en probeer opnieuw.`;
      requestAnimationFrame(() => melding.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    }
  }

  /* ----------------------------------------------------------
     Na een ronde: de momenten op volgorde, met datum en verhaal
     ---------------------------------------------------------- */
  function onthul() {
    if (!wortel.isConnected) return;
    wortel.textContent = '';
    window.scrollTo(0, 0);

    const score = scores[ronde];
    const kop = el('div', 'quiz-uitslag-kaart tl-ronde-klaar');
    kop.append(
      el('p', 'quiz-hartjes', '💗'.repeat(score) + '🤍'.repeat(3 - score)),
      el('h3', 'sier', `Ronde ${ronde + 1} klaar!`),
      el('p', 'quiz-slot', pogingen === 1 ? 'In één keer goed. Jij weet precies hoe ons jaar ging 😏' : `Gelukt in ${pogingen} pogingen. Zo ging het:`),
    );
    wortel.append(kop);

    const momenten = [beginPunt, ...rondes[ronde].slice().sort((a, b) => a.nr - b.nr), eindPunt].filter(Boolean);
    wortel.append(tijdlijnLijst(momenten, false));

    const laatste = ronde + 1 >= rondes.length;
    wortel.append(knop('knop tl-verder', laatste ? 'Naar de uitslag' : 'Volgende ronde', () => {
      ronde++;
      if (laatste) uitslag();
      else toonRonde();
    }));
  }

  function tijdlijnLijst(momenten, groot) {
    const lijst = el('ol', 'tl-verhaal' + (groot ? ' groot' : ''));
    momenten.forEach((m) => {
      const li = el('li', m.vast ? 'tl-punt vast' : 'tl-punt');
      const tekst = el('div', 'tl-punt-tekst');
      tekst.append(el('span', 'tl-punt-datum', m.datum), el('b', 'tl-punt-titel', m.titel), el('span', 'tl-punt-verhaal', m.tekst || ''));
      li.append(tekst);
      if (m.foto) li.append(fotoOfHart(m, 'tl-punt-foto'));
      lijst.append(li);
    });
    return lijst;
  }

  /* ----------------------------------------------------------
     Uitslag + ons hele jaar
     ---------------------------------------------------------- */
  function uitslag() {
    const gemiddeld = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    api.klaar({ hartjes: gemiddeld });

    wortel.textContent = '';
    window.scrollTo(0, 0);
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', '💗'.repeat(gemiddeld) + '🤍'.repeat(3 - gemiddeld)),
      el('h3', 'sier', gemiddeld === 3 ? 'Ons jaar, precies op volgorde' : 'Ons jaar staat op volgorde'),
      el('p', 'quiz-slot', 'Van dat ene berichtje tot nu:'),
    );
    wortel.append(kaart, tijdlijnLijst(alle, true));

    const knoppen = el('div', 'fotos-knoppen');
    knoppen.append(knop('knop', 'Nog een keer', begin), knop('knop zacht', 'Terug naar het menu', () => api.terug()));
    wortel.append(knoppen);
  }

  Spellen.registreer({
    id: 'tijdlijn',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      begin();
    },
    stop() {
      stopSlepen();
    },
  });
})();
