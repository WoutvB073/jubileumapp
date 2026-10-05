/*
  SPEL: WIE VAN ONS TWEE?
  ------------------------------------------------------------
  Stellingen uit content.js (CONTENT.wieVanOns). Per stelling
  kies je Wout, Davinia of Allebei. Daarna zie je het goede
  antwoord en een reactie van Wout.

  Aan het eind een score met hartjes (0-3), net als bij de quiz.
*/
(function () {
  'use strict';

  // Hoeveel procent goed er nodig is voor 3 of 2 hartjes (anders 1).
  const DREMPELS = [0.8, 0.5];

  let api = null;
  let stellingen = [];
  let bij = 0;
  let goedGeteld = 0;
  let wortel = null;
  let namen = { zij: 'Davinia', ik: 'Wout' };

  function hussel(lijst) {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  }

  function el(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  // Een animatie (opnieuw) laten afspelen op een element.
  function speel(e, klasse) {
    e.classList.remove(klasse);
    void e.offsetWidth;
    e.classList.add(klasse);
  }

  /* ----------------------------------------------------------
     Eén stelling tekenen
     ---------------------------------------------------------- */
  function toonStelling() {
    const s = stellingen[bij];
    wortel.textContent = '';

    // Voortgang (zelfde opmaak als de quiz)
    const kop = el('div', 'quiz-kop');
    kop.append(el('span', 'quiz-teller', `Stelling ${bij + 1} van ${stellingen.length}`));
    const balk = el('div', 'quiz-balk');
    const vulling = el('div', 'quiz-balk-vulling');
    vulling.style.width = (100 * (bij + 1) / stellingen.length) + '%';
    balk.append(vulling);
    kop.append(balk);
    wortel.append(kop);

    const kaart = el('div', 'wie-kaart');
    kaart.append(el('p', 'wie-label', 'Wat denk jij?'));
    kaart.append(el('h3', 'wie-stelling', s.stelling));
    wortel.append(kaart);

    // Keuzeknoppen: twee rondjes naast elkaar, Allebei eronder.
    const keuzes = el('div', 'wie-keuzes');
    const personen = el('div', 'wie-personen');
    personen.append(
      maakPersoon(namen.ik, namen.ik.charAt(0), 'wie-ik'),
      maakPersoon(namen.zij, namen.zij.charAt(0), 'wie-zij'),
    );
    const allebei = el('button', 'wie-allebei', 'Allebei 💞');
    allebei.type = 'button';
    allebei.dataset.antwoord = 'Allebei';
    keuzes.append(personen, allebei);
    wortel.append(keuzes);

    keuzes.querySelectorAll('button').forEach((knop) => {
      knop.addEventListener('click', () => kies(knop, keuzes, s));
    });

    const na = el('div', 'wie-na');
    na.hidden = true;
    wortel.append(na);
  }

  function maakPersoon(naam, letter, klasse) {
    const knop = el('button', 'wie-persoon ' + klasse);
    knop.type = 'button';
    knop.dataset.antwoord = naam;
    knop.setAttribute('aria-label', naam);
    knop.append(el('span', 'wie-letter', letter), el('span', 'wie-naam', naam));
    return knop;
  }

  /* ----------------------------------------------------------
     Keuze gemaakt
     ---------------------------------------------------------- */
  function kies(gekozenKnop, keuzes, s) {
    const knoppen = [...keuzes.querySelectorAll('button')];
    if (knoppen.some((k) => k.disabled)) return;   // al gekozen

    const goedAntwoord = s.antwoord;
    const isGoed = gekozenKnop.dataset.antwoord === goedAntwoord;
    if (isGoed) goedGeteld++;

    knoppen.forEach((knop) => {
      knop.disabled = true;
      if (knop.dataset.antwoord === goedAntwoord) {
        knop.classList.add('goed');
        speel(knop, 'hop');
      } else if (knop === gekozenKnop) {
        knop.classList.add('fout');
        speel(knop, 'wiebel');
      } else {
        knop.classList.add('grijs');
      }
    });

    const na = wortel.querySelector('.wie-na');
    na.textContent = '';
    na.hidden = false;

    na.append(el('p', 'quiz-uitslag ' + (isGoed ? 'is-goed' : 'is-fout'), isGoed ? 'Goed!' : 'Net niet…'));
    if (!isGoed) {
      na.append(el('p', 'quiz-juist', goedAntwoord === 'Allebei' ? 'Het antwoord: allebei!' : 'Het antwoord: ' + goedAntwoord));
    }
    if (s.reactie) na.append(el('p', 'quiz-reactie', s.reactie));

    const verder = el('button', 'knop', bij + 1 < stellingen.length ? 'Volgende stelling' : 'Naar de uitslag');
    verder.type = 'button';
    verder.addEventListener('click', () => {
      bij++;
      if (bij < stellingen.length) {
        toonStelling();
        wortel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else {
        toonUitslag();
      }
    });
    na.append(verder);
    // Antwoordvak in beeld brengen (valt op kleine schermen anders onder de rand).
    requestAnimationFrame(() => na.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Uitslag
     ---------------------------------------------------------- */
  function hartjesVoor(deel) {
    if (deel >= DREMPELS[0]) return 3;
    if (deel >= DREMPELS[1]) return 2;
    return 1;
  }

  function toonUitslag() {
    const totaal = stellingen.length;
    const score = hartjesVoor(totaal ? goedGeteld / totaal : 0);
    api.klaar({ hartjes: score });

    wortel.textContent = '';
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(el('p', 'quiz-hartjes', '💗'.repeat(score) + '🤍'.repeat(3 - score)));
    kaart.append(el('h3', 'sier', score === 3 ? 'Jij kent ons door en door' : 'Netjes geprobeerd'));
    kaart.append(el('p', 'quiz-score', `${goedGeteld} van de ${totaal} goed`));

    let tekst;
    if (score === 3) tekst = 'Ook de dingen waar ik liever niet aan herinnerd word 💀';
    else if (score === 2) tekst = 'Een paar keer mis, maar het grote werk klopt.';
    else tekst = 'Eén hartje? Ken je ons wel 💀';
    kaart.append(el('p', 'quiz-slot', tekst));

    const opnieuw = el('button', 'knop', 'Nog een keer');
    opnieuw.type = 'button';
    opnieuw.addEventListener('click', begin);
    const terug = el('button', 'knop zacht', 'Terug naar het menu');
    terug.type = 'button';
    terug.addEventListener('click', () => api.terug());
    kaart.append(opnieuw, terug);

    wortel.append(kaart);
  }

  /* ----------------------------------------------------------
     Starten
     ---------------------------------------------------------- */
  function begin() {
    const algemeen = api.content.algemeen || {};
    namen = { zij: algemeen.naamZij || 'Davinia', ik: algemeen.naamIk || 'Wout' };

    const geldig = [namen.ik, namen.zij, 'Allebei'];
    stellingen = hussel((api.content.wieVanOns || []).filter((s) => s && s.stelling && geldig.includes(s.antwoord)));
    bij = 0;
    goedGeteld = 0;

    if (!stellingen.length) {
      wortel.textContent = '';
      const kaart = el('div', 'melding-kaart');
      kaart.append(el('h3', 'sier', 'Nog even geduld'), el('p', '', 'Er staan nog geen stellingen in content.js.'));
      wortel.append(kaart);
      return;
    }
    toonStelling();
  }

  Spellen.registreer({
    id: 'wie',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      begin();
    },
  });
})();
