/*
  SPEL: DIT OF DAT
  ------------------------------------------------------------
  Davinia raadt bij elke keuze wat Wout zou kiezen
  (CONTENT.ditOfDat: a, b, mijnKeuze 'a' of 'b', reactie, optioneel vraag).
  Keuzes in willekeurige volgorde; a en b staan soms andersom,
  zodat er geen patroon in zit.

  Hartjes: 80% goed = 3, 55% goed = 2, anders 1.
*/
(function () {
  'use strict';

  const DREMPELS = [0.8, 0.55];

  let api = null;
  let wortel = null;
  let keuzes = [];
  let bij = 0;
  let goedGeteld = 0;
  let naamIk = 'Wout';

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

  /* ----------------------------------------------------------
     Starten
     ---------------------------------------------------------- */
  function begin() {
    naamIk = (api.content.algemeen && api.content.algemeen.naamIk) || 'Wout';
    keuzes = hussel((api.content.ditOfDat || []).filter((k) => k && k.a && k.b && (k.mijnKeuze === 'a' || k.mijnKeuze === 'b')))
      .map((k) => {
        const om = Math.random() < 0.5;   // soms links en rechts omdraaien
        const opties = om ? [k.b, k.a] : [k.a, k.b];
        const mijn = k.mijnKeuze === 'a' ? k.a : k.b;
        return { vraag: k.vraag || '', opties, mijn, reactie: k.reactie || '' };
      });
    bij = 0;
    goedGeteld = 0;
    if (!keuzes.length) {
      wortel.textContent = '';
      const kaart = el('div', 'melding-kaart');
      kaart.append(el('h3', 'sier', 'Nog even geduld'), el('p', '', 'Er staan nog geen keuzes in content.js.'));
      wortel.append(kaart);
      return;
    }
    toonKeuze();
  }

  /* ----------------------------------------------------------
     Eén keuze
     ---------------------------------------------------------- */
  function toonKeuze() {
    const k = keuzes[bij];
    wortel.textContent = '';

    const kop = el('div', 'quiz-kop');
    kop.append(el('span', 'quiz-teller', `Keuze ${bij + 1} van ${keuzes.length}`));
    const balk = el('div', 'quiz-balk');
    const vulling = el('div', 'quiz-balk-vulling');
    vulling.style.width = (100 * (bij + 1) / keuzes.length) + '%';
    balk.append(vulling);
    kop.append(balk);
    wortel.append(kop);

    wortel.append(el('p', 'dd-vraag', `Wat kiest ${naamIk}?`));
    if (k.vraag) wortel.append(el('p', 'dd-context', k.vraag));

    const paar = el('div', 'dd-paar');
    k.opties.forEach((tekst, i) => {
      const kaart = knop('dd-kaart ' + (i === 0 ? 'dd-links' : 'dd-rechts'), null, () => kies(i, paar, k));
      kaart.append(el('span', 'dd-tekst', tekst));
      paar.append(kaart);
    });
    paar.append(el('span', 'dd-of', 'of'));
    wortel.append(paar);
  }

  function kies(i, paar, k) {
    const kaarten = [...paar.querySelectorAll('.dd-kaart')];
    if (kaarten.some((x) => x.disabled)) return;
    const gekozen = k.opties[i];
    const goed = gekozen === k.mijn;
    if (goed) goedGeteld++;

    kaarten.forEach((kaart, j) => {
      kaart.disabled = true;
      const isMijn = k.opties[j] === k.mijn;
      if (j === i) kaart.classList.add('gekozen', goed ? 'goed' : 'fout');
      if (isMijn) {
        kaart.classList.add('mijn');   // Wouts keuze valt altijd op
        kaart.append(el('span', 'dd-badge', `${naamIk} ✓`));
      } else if (j !== i) {
        kaart.classList.add('niet');
      }
    });

    const na = el('div', 'quiz-na dd-na');
    na.append(el('p', 'quiz-uitslag ' + (goed ? 'is-goed' : 'is-fout'), goed ? 'Goed!' : 'Mis…'));
    if (!goed) na.append(el('p', 'quiz-juist', `${naamIk} koos: ${k.mijn}`));
    if (k.reactie) na.append(el('p', 'quiz-reactie', k.reactie));
    na.append(knop('knop', bij + 1 < keuzes.length ? 'Volgende' : 'Naar de uitslag', () => {
      bij++;
      if (bij < keuzes.length) { toonKeuze(); window.scrollTo(0, 0); } else uitslag();
    }));
    wortel.append(na);
    requestAnimationFrame(() => na.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Uitslag
     ---------------------------------------------------------- */
  function uitslag() {
    const deel = goedGeteld / keuzes.length;
    const hartjes = deel >= DREMPELS[0] ? 3 : deel >= DREMPELS[1] ? 2 : 1;
    api.klaar({ hartjes });

    let tekst;
    if (hartjes === 3) tekst = 'Je weet beter wat ik kies dan ik zelf. Beetje eng 💀';
    else if (hartjes === 2) tekst = 'Niet slecht. Je kent me best goed 😁';
    else tekst = 'Dat ging niet best. We moeten praten 💀';

    wortel.textContent = '';
    window.scrollTo(0, 0);
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', '💗'.repeat(hartjes) + '🤍'.repeat(3 - hartjes)),
      el('h3', 'sier', hartjes === 3 ? 'Gedachtenlezer' : 'Netjes geprobeerd'),
      el('p', 'quiz-score', `${goedGeteld} van de ${keuzes.length} goed`),
      el('p', 'quiz-slot', tekst),
      knop('knop', 'Nog een keer', begin),
      knop('knop zacht', 'Terug naar het menu', () => api.terug()),
    );
    wortel.append(kaart);
  }

  Spellen.registreer({
    id: 'ditofdat',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      begin();
    },
  });
})();
