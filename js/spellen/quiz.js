/*
  SPEL: QUIZ OVER ONS
  ------------------------------------------------------------
  Meerkeuzevragen uit content.js (CONTENT.quiz). Per vraag:
  - een optionele foto
  - vier antwoorden, door elkaar gehusseld
  - na het antwoord een reactie van Wout

  Aan het eind een score met hartjes (0-3). De beste score blijft
  bewaard; dat regelt app.js in api.klaar().
*/
(function () {
  'use strict';

  // Hoeveel procent goed er nodig is voor 3, 2 of 1 hartje.
  const DREMPELS = [0.8, 0.5];

  let api = null;
  let vragen = [];     // de vragen van dit spelletje, met gehusselde opties
  let bij = 0;         // welke vraag we nu tonen
  let goedGeteld = 0;
  let wortel = null;   // het element waarin we tekenen

  /* Lijst door elkaar husselen (Fisher-Yates). */
  function hussel(lijst) {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  }

  /* Van een vraag uit content.js een speelbare vraag maken:
     de opties gehusseld, en 'goed' verwijst naar de nieuwe plek. */
  function maakSpeelbaar(vraag) {
    const opties = (vraag.opties || []).map((tekst, i) => ({ tekst, wasGoed: i === (vraag.goed || 0) }));
    const gehusseld = hussel(opties);
    return {
      vraag: vraag.vraag || '',
      foto: vraag.foto || null,
      fotoNa: vraag.fotoNa || null,
      reactie: vraag.reactie || '',
      opties: gehusseld.map((o) => o.tekst),
      goed: gehusseld.findIndex((o) => o.wasGoed),
    };
  }

  function el(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  /* Een foto in een lijstje. Laadt hij niet, dan verdwijnt het lijstje. */
  function maakFoto(src, klasse) {
    const lijst = el('div', klasse);
    const img = el('img');
    img.src = src;
    img.alt = '';
    img.addEventListener('error', () => lijst.remove());
    lijst.append(img);
    return lijst;
  }

  /* ----------------------------------------------------------
     Eén vraag tekenen
     ---------------------------------------------------------- */
  function toonVraag() {
    const v = vragen[bij];
    wortel.textContent = '';

    // Balkje met "vraag x van y"
    const kop = el('div', 'quiz-kop');
    kop.append(el('span', 'quiz-teller', `Vraag ${bij + 1} van ${vragen.length}`));
    const balk = el('div', 'quiz-balk');
    const vulling = el('div', 'quiz-balk-vulling');
    // De balk telt de vraag die je nu ziet mee, anders is hij bij vraag 1 leeg.
    vulling.style.width = (100 * (bij + 1) / vragen.length) + '%';
    balk.append(vulling);
    kop.append(balk);
    wortel.append(kop);

    const kaart = el('div', 'quiz-kaart');

    if (v.foto) kaart.append(maakFoto(v.foto, 'quiz-foto'));

    kaart.append(el('h3', 'quiz-vraag', v.vraag));

    const opties = el('div', 'quiz-opties');
    v.opties.forEach((tekst, i) => {
      const knop = el('button', 'quiz-optie', tekst);
      knop.type = 'button';
      knop.addEventListener('click', () => kies(i, opties, v));
      opties.append(knop);
    });
    kaart.append(opties);

    const na = el('div', 'quiz-na');
    na.hidden = true;
    kaart.append(na);

    wortel.append(kaart);
  }

  /* ----------------------------------------------------------
     Antwoord gekozen
     ---------------------------------------------------------- */
  function kies(gekozen, optiesBak, v) {
    const knoppen = [].slice.call(optiesBak.children);
    if (knoppen.some((k) => k.disabled)) return;   // al geantwoord

    const isGoed = gekozen === v.goed;
    if (isGoed) goedGeteld++;

    knoppen.forEach((knop, i) => {
      knop.disabled = true;
      if (i === v.goed) knop.classList.add('goed');
      else if (i === gekozen) knop.classList.add('fout');
      else knop.classList.add('grijs');
    });

    const na = optiesBak.parentElement.querySelector('.quiz-na');
    na.textContent = '';
    na.hidden = false;

    const uitslag = el('p', 'quiz-uitslag ' + (isGoed ? 'is-goed' : 'is-fout'),
      isGoed ? 'Goed! 💗' : 'Net niet…');
    na.append(uitslag);

    if (!isGoed) {
      na.append(el('p', 'quiz-juist', 'Het juiste antwoord: ' + v.opties[v.goed]));
    }
    if (v.reactie) {
      na.append(el('p', 'quiz-reactie', v.reactie));
    }
    // Foto die het antwoord zou verraden: pas nu laten zien.
    if (v.fotoNa) na.append(maakFoto(v.fotoNa, 'quiz-foto quiz-foto-na'));

    const verder = el('button', 'knop', bij + 1 < vragen.length ? 'Volgende vraag' : 'Naar de uitslag');
    verder.type = 'button';
    verder.addEventListener('click', () => {
      bij++;
      if (bij < vragen.length) {
        toonVraag();
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
    const totaal = vragen.length;
    const deel = totaal ? goedGeteld / totaal : 0;
    const score = hartjesVoor(deel);

    api.klaar({ hartjes: score });

    wortel.textContent = '';
    const kaart = el('div', 'quiz-uitslag-kaart');

    kaart.append(el('p', 'quiz-hartjes', '💗'.repeat(score) + '🤍'.repeat(3 - score)));
    kaart.append(el('h3', 'sier', score === 3 ? 'Jij kent ons!' : 'Netjes geprobeerd'));
    kaart.append(el('p', 'quiz-score', `${goedGeteld} van de ${totaal} goed`));

    let tekst;
    if (score === 3) tekst = 'Bijna alles goed. Je hebt dus echt opgelet.';
    else if (score === 2) tekst = 'Mooi gedaan. En de vragen die je miste, vertel ik je gewoon nog een keer.';
    else tekst = 'Geeft niets. Dan hebben we een goede smoes om alles nog eens door te nemen.';
    kaart.append(el('p', 'quiz-slot', tekst));

    const opnieuw = el('button', 'knop', 'Nog een keer');
    opnieuw.type = 'button';
    opnieuw.addEventListener('click', begin);
    kaart.append(opnieuw);

    const terug = el('button', 'knop zacht', 'Terug naar het menu');
    terug.type = 'button';
    terug.addEventListener('click', () => api.terug());
    kaart.append(terug);

    wortel.append(kaart);
  }

  /* ----------------------------------------------------------
     Starten
     ---------------------------------------------------------- */
  function begin() {
    const bron = (api.content && api.content.quiz) || [];
    vragen = bron.filter((v) => v && v.vraag && Array.isArray(v.opties) && v.opties.length > 1)
                 .map(maakSpeelbaar);
    bij = 0;
    goedGeteld = 0;

    if (!vragen.length) {
      wortel.textContent = '';
      const kaart = el('div', 'melding-kaart');
      kaart.append(
        el('h3', 'sier', 'Nog even geduld'),
        el('p', '', 'Er staan nog geen vragen in content.js. 💌'),
      );
      wortel.append(kaart);
      return;
    }

    toonVraag();
  }

  Spellen.registreer({
    id: 'quiz',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      begin();
    },
  });
})();
