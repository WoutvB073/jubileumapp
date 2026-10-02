/*
  SPEL: WOORDSPELLEN
  ------------------------------------------------------------
  Twee spelletjes met onze woorden (CONTENT.woordspel):
  - Wordle: raad een woord van 5 letters in 6 pogingen.
  - Galgje, maar dan lief: bij elke foute letter smelt een ijsje
    een stukje verder (ons eerste ijsje bij de Maas). 6 fouten = gesmolten.

  De woorden worden één voor één gespeeld, in willekeurige volgorde.
  Tussendoor stoppen mag: de voortgang wordt na elke letter bewaard.
  Elk spelletje krijgt een hartjesscore als alle woorden gespeeld zijn;
  de tegel krijgt het gemiddelde zodra beide klaar zijn.
*/
(function () {
  'use strict';

  const POGINGEN = 6;                 // Wordle: aantal pogingen per woord
  const MAX_FOUTEN = 6;               // Galgje: bij zoveel fouten is het ijsje gesmolten
  const RIJEN = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  let api = null;
  let wortel = null;
  let toetsLuisteraar = null;        // voor een echt toetsenbord (handig op de computer)
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

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function opruimen() {
    timers.forEach(clearTimeout);
    timers = [];
    if (toetsLuisteraar) document.removeEventListener('keydown', toetsLuisteraar);
    toetsLuisteraar = null;
  }

  function hartjesTekst(n) { return '💗'.repeat(n) + '🤍'.repeat(3 - n); }

  function fotoBlok(pad) {
    const lijst = el('div', 'ws-foto');
    const img = el('img');
    img.src = pad;
    img.alt = '';
    img.addEventListener('error', () => lijst.remove());
    lijst.append(img);
    return lijst;
  }

  // Scherm leegmaken met bovenaan "‹ Woordspellen" en rechts een tekstje.
  function nieuwScherm(rechts) {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const balk = el('div', 'ws-balk');
    balk.append(knop('fotos-terug', '‹ Woordspellen', toonKeuze));
    if (rechts) balk.append(el('span', 'ws-stand', rechts));
    wortel.append(balk);
  }

  /* ----------------------------------------------------------
     Voortgang en score
     Opslag: { wordle: {volgorde, resultaten, gokken}, galgje: {...},
               wordleScore, galgjeScore }
     ---------------------------------------------------------- */
  function lijstVan(soort) {
    const bron = (api.content.woordspel && api.content.woordspel[soort]) || [];
    const geldig = soort === 'wordle' ? /^[A-Z]{5}$/ : /^[A-Z ]+$/;
    return bron
      .filter((w) => w && w.woord)
      .map((w) => Object.assign({}, w, { woord: String(w.woord).toUpperCase().trim() }))
      .filter((w) => geldig.test(w.woord));
  }

  // Voortgang ophalen en bijwerken als de woorden in content.js veranderd zijn.
  function voortgang(soort) {
    const woorden = lijstVan(soort).map((w) => w.woord);
    const v = Object.assign({ volgorde: [], resultaten: {}, huidig: null }, api.opslag.lees()[soort]);
    const nieuw = woorden.filter((w) => !v.volgorde.includes(w));
    v.volgorde = v.volgorde.filter((w) => woorden.includes(w)).concat(hussel(nieuw));
    Object.keys(v.resultaten).forEach((w) => { if (!woorden.includes(w)) delete v.resultaten[w]; });
    if (v.huidig && !woorden.includes(v.huidig.woord)) v.huidig = null;
    return v;
  }

  function bewaarVoortgang(soort, v) {
    api.opslag.bewaar({ [soort]: v });
  }

  function volgendWoord(v) {
    return v.volgorde.find((w) => !v.resultaten[w]) || null;
  }

  function scoreVan(v) {
    const punten = Object.values(v.resultaten).map((r) => r.punten);
    if (!punten.length) return 0;
    const gem = punten.reduce((a, b) => a + b, 0) / punten.length;
    return Math.max(1, Math.min(3, Math.round(gem)));
  }

  function bewaarScore(soort, hartjes) {
    const sleutel = soort + 'Score';
    const oud = api.opslag.lees()[sleutel] || 0;
    api.opslag.bewaar({ [sleutel]: Math.max(oud, hartjes) });
    const s = api.opslag.lees();
    if (s.wordleScore && s.galgjeScore) api.klaar({ hartjes: Math.round((s.wordleScore + s.galgjeScore) / 2) });
  }

  /* ----------------------------------------------------------
     Keuzescherm
     ---------------------------------------------------------- */
  function toonKeuze() {
    opruimen();
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const s = api.opslag.lees();
    wortel.append(el('p', 'fotos-intro', 'Woorden die bij ons horen. Speel ze allebei voor de hartjes op de tegel. 💬'));
    const keuzes = el('div', 'fotos-keuzes');
    keuzes.append(
      keuzeKaart('🟩', 'Wordle', 'Raad ons woord in 6 pogingen', 'wordle', s.wordleScore, startWordle),
      keuzeKaart('🍦', 'Galgje, maar dan lief', 'Red het ijsje!', 'galgje', s.galgjeScore, startGalgje),
    );
    wortel.append(keuzes);
  }

  function keuzeKaart(icoon, titel, sub, soort, score, actie) {
    const k = knop('fotos-keuze', null, actie);
    const v = voortgang(soort);
    const gedaan = Object.keys(v.resultaten).length;
    const status = el('span', 'fotos-keuze-status');
    if (score && gedaan >= v.volgorde.length) status.textContent = '♥'.repeat(score) + '♡'.repeat(3 - score);
    else if (gedaan || v.huidig) status.append(el('span', 'pil', `${gedaan} van ${v.volgorde.length} woorden`));
    else status.append(el('span', 'pil', 'nog niet gespeeld'));
    k.append(el('span', 'tegel-icoon', icoon), el('span', 'fotos-keuze-titel', titel), el('span', 'fotos-keuze-sub', sub), status);
    return k;
  }

  /* ----------------------------------------------------------
     Schermtoetsenbord
     opties: { wis, enter } voegen ⌫ en ENTER toe op de onderste rij.
     ---------------------------------------------------------- */
  function maakToetsenbord(opDruk, opties = {}) {
    const bord = el('div', 'ws-toetsen');
    const toetsen = {};
    RIJEN.forEach((rij, r) => {
      const rijEl = el('div', 'ws-rij');
      if (r === 2 && opties.enter) rijEl.append(knop('ws-toets breed', 'ENTER', () => opDruk('ENTER')));
      [...rij].forEach((letter) => {
        const t = knop('ws-toets', letter, () => opDruk(letter));
        toetsen[letter] = t;
        rijEl.append(t);
      });
      if (r === 2 && opties.wis) {
        const w = knop('ws-toets breed', '⌫', () => opDruk('WIS'));
        w.setAttribute('aria-label', 'Wissen');
        rijEl.append(w);
      }
      bord.append(rijEl);
    });

    // Kleur van een toets: goed > plek > fout (nooit terug naar een "slechtere" kleur).
    const rang = { fout: 1, plek: 2, goed: 3 };
    bord.kleur = (letter, status) => {
      const t = toetsen[letter];
      if (!t) return;
      const nu = t.dataset.status;
      if (!nu || rang[status] > rang[nu]) {
        t.dataset.status = status;
        t.classList.remove('fout', 'plek', 'goed');
        t.classList.add(status);
      }
    };

    // Echt toetsenbord (computer) doet ook mee.
    toetsLuisteraar = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[a-z]$/i.test(e.key)) opDruk(e.key.toUpperCase());
      else if (e.key === 'Backspace' && opties.wis) opDruk('WIS');
      else if (e.key === 'Enter' && opties.enter) opDruk('ENTER');
    };
    document.addEventListener('keydown', toetsLuisteraar);
    return bord;
  }

  /* ----------------------------------------------------------
     WORDLE
     ---------------------------------------------------------- */
  // Kleuren voor één gok, met de gewone Wordle-regels voor dubbele letters.
  function beoordeel(gok, woord) {
    const uit = Array(5).fill('fout');
    const over = {};
    for (let i = 0; i < 5; i++) {
      if (gok[i] === woord[i]) uit[i] = 'goed';
      else over[woord[i]] = (over[woord[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (uit[i] !== 'goed' && over[gok[i]]) {
        uit[i] = 'plek';
        over[gok[i]]--;
      }
    }
    return uit;
  }

  function startWordle() {
    const woorden = lijstVan('wordle');
    const v = voortgang('wordle');
    const woord = (v.huidig && v.huidig.woord) || volgendWoord(v);

    if (!woorden.length) {
      nieuwScherm();
      wortel.append(el('p', 'fotos-intro', 'Er staan nog geen Wordle-woorden in content.js. 💌'));
      return;
    }
    if (!woord) { wordleUitslag(v); return; }

    const info = woorden.find((w) => w.woord === woord);
    if (!v.huidig) v.huidig = { woord, gokken: [] };
    bewaarVoortgang('wordle', v);

    const nr = Object.keys(v.resultaten).length + 1;
    nieuwScherm(`Woord ${nr} van ${v.volgorde.length}`);

    const spel = el('div', 'wd-spel');
    const bord = el('div', 'wd-bord');
    const rijen = [];
    for (let r = 0; r < POGINGEN; r++) {
      const rij = el('div', 'wd-rij');
      const vakjes = [];
      for (let k = 0; k < 5; k++) { const vak = el('span', 'wd-vak'); vakjes.push(vak); rij.append(vak); }
      rijen.push({ rij, vakjes });
      bord.append(rij);
    }
    const melding = el('p', 'wd-melding', '');
    let invoer = '';
    let klaar = false;

    const toetsen = maakToetsenbord(druk, { wis: true, enter: true });
    spel.append(bord, melding, toetsen);
    wortel.append(spel);

    // Eerdere gokken (na tussendoor stoppen) terugzetten.
    v.huidig.gokken.forEach((gok, r) => toonGok(r, gok, false));

    function toonGok(r, gok, animeer) {
      const kleuren = beoordeel(gok, woord);
      rijen[r].vakjes.forEach((vak, i) => {
        vak.textContent = gok[i];
        const zet = () => { vak.classList.add('vol', kleuren[i]); toetsen.kleur(gok[i], kleuren[i]); };
        if (animeer) { vak.style.animationDelay = (i * 0.12) + 's'; vak.classList.add('draai'); later(zet, i * 120 + 160); }
        else zet();
      });
    }

    function toonInvoer() {
      const r = v.huidig.gokken.length;
      if (r >= POGINGEN) return;
      rijen[r].vakjes.forEach((vak, i) => {
        vak.textContent = invoer[i] || '';
        vak.classList.toggle('getypt', Boolean(invoer[i]));
      });
    }

    function druk(toets) {
      if (klaar) return;
      melding.textContent = '';
      if (toets === 'WIS') { invoer = invoer.slice(0, -1); toonInvoer(); return; }
      if (toets === 'ENTER') {
        if (invoer.length < 5) {
          melding.textContent = 'Nog niet genoeg letters';
          const rij = rijen[v.huidig.gokken.length].rij;
          rij.classList.remove('schud'); void rij.offsetWidth; rij.classList.add('schud');
          return;
        }
        const r = v.huidig.gokken.length;
        v.huidig.gokken.push(invoer);
        bewaarVoortgang('wordle', v);
        toonGok(r, invoer, true);
        const geraden = invoer === woord;
        invoer = '';
        if (geraden || v.huidig.gokken.length >= POGINGEN) {
          klaar = true;
          const pogingen = v.huidig.gokken.length;
          const punten = !geraden ? 0 : pogingen <= 3 ? 3 : pogingen <= 5 ? 2 : 1;
          v.resultaten[woord] = { geraden, pogingen, punten };
          v.huidig = null;
          bewaarVoortgang('wordle', v);
          later(() => woordKlaar(geraden, pogingen), 5 * 120 + 700);
        }
        return;
      }
      if (invoer.length < 5) { invoer += toets; toonInvoer(); }
    }

    function woordKlaar(geraden, pogingen) {
      opruimen();
      const kaart = el('div', 'ws-klaar');
      kaart.append(
        el('h3', 'sier', geraden ? (pogingen === 1 ? 'In één keer!' : `Geraden in ${pogingen}!`) : 'Net niet…'),
        el('p', 'ws-woord', woord),
      );
      if (info.uitleg) kaart.append(el('p', 'quiz-reactie', info.uitleg));
      if (info.foto) kaart.append(fotoBlok(info.foto));
      const laatste = !volgendWoord(v);
      kaart.append(knop('knop', laatste ? 'Naar de uitslag' : 'Volgend woord', startWordle));
      toetsen.replaceWith(kaart);
      requestAnimationFrame(() => kaart.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }

  function wordleUitslag(v) {
    const hartjes = scoreVan(v);
    bewaarScore('wordle', hartjes);
    nieuwScherm();
    const geraden = Object.values(v.resultaten).filter((r) => r.geraden).length;
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', hartjesTekst(hartjes)),
      el('h3', 'sier', hartjes === 3 ? 'Woordkampioen!' : 'Alle woorden gespeeld 💗'),
      el('p', 'quiz-score', `${geraden} van de ${v.volgorde.length} woorden geraden`),
      el('p', 'quiz-slot', 'Tien woorden, tien stukjes van ons jaar.'),
      knop('knop', 'Opnieuw spelen', () => { api.opslag.bewaar({ wordle: null }); startWordle(); }),
      knop('knop zacht', 'Terug naar woordspellen', toonKeuze),
    );
    wortel.append(kaart);
  }

  /* ----------------------------------------------------------
     GALGJE MET IJSJE
     ---------------------------------------------------------- */
  // Het ijsje: hoorntje met een bolletje aardbei en een bolletje chocola.
  function maakIjsje() {
    const wrap = el('div', 'ijs');
    wrap.innerHTML = `
      <svg viewBox="0 0 160 190" aria-hidden="true">
        <ellipse class="ijs-plas" cx="80" cy="176" rx="0" ry="0"/>
        <g class="ijs-hoorn">
          <path d="M52 96 L108 96 L80 168 Z" fill="#f3c88f"/>
          <path d="M58 104 L98 140 M66 98 L104 120 M100 104 L62 140 M92 98 L56 120" stroke="#dca468" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
        <g class="ijs-druppels">
          <path class="d1" d="M60 100 q-4 14 0 22 q4 -8 0 -22" fill="#f6b8ca"/>
          <path class="d2" d="M98 100 q-4 20 0 30 q4 -10 0 -30" fill="#c99a83"/>
          <path class="d3" d="M78 102 q-5 28 0 40 q5 -12 0 -40" fill="#f6b8ca"/>
        </g>
        <g class="ijs-onder">
          <circle cx="80" cy="84" r="28" fill="#f6b8ca"/>
          <circle cx="70" cy="76" r="5" fill="#ffffff" opacity=".55"/>
        </g>
        <g class="ijs-boven">
          <circle cx="80" cy="50" r="24" fill="#c99a83"/>
          <circle cx="71" cy="42" r="4" fill="#ffffff" opacity=".45"/>
          <path d="M60 52 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" fill="none" stroke="#b5826c" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="ijs-gezicht">
          <circle cx="71" cy="88" r="3.2" fill="#5a3848"/>
          <circle cx="89" cy="88" r="3.2" fill="#5a3848"/>
          <path class="ijs-mond" d="M72 96 Q80 104 88 96" fill="none" stroke="#5a3848" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="64" cy="95" r="3.5" fill="#e0708f" opacity=".35"/>
          <circle cx="96" cy="95" r="3.5" fill="#e0708f" opacity=".35"/>
        </g>
      </svg>`;
    return wrap;
  }

  // Ijsje laten smelten: 0 = nog heel, MAX_FOUTEN = helemaal gesmolten.
  function smelt(ijs, fouten) {
    const f = Math.min(1, fouten / MAX_FOUTEN);
    const svg = ijs.querySelector('svg');
    const boven = svg.querySelector('.ijs-boven');
    const onder = svg.querySelector('.ijs-onder');
    const gezicht = svg.querySelector('.ijs-gezicht');
    // Bovenste bolletje zakt in en wordt kleiner; vanaf de helft ook het onderste.
    boven.setAttribute('transform', `translate(0 ${26 * f}) translate(80 74) scale(${1 - 0.25 * f} ${1 - 0.85 * f}) translate(-80 -74)`);
    boven.style.opacity = String(1 - 0.9 * f);
    const g = Math.max(0, (f - 0.4) / 0.6);
    onder.setAttribute('transform', `translate(0 ${8 * g}) translate(80 112) scale(${1 + 0.08 * g} ${1 - 0.55 * g}) translate(-80 -112)`);
    gezicht.setAttribute('transform', `translate(0 ${10 * g})`);
    gezicht.style.opacity = String(1 - 0.6 * g);
    // Druppels en plas
    ['d1', 'd2', 'd3'].forEach((d, i) => svg.querySelector('.' + d).classList.toggle('zichtbaar', fouten >= [1, 3, 5][i]));
    const plas = svg.querySelector('.ijs-plas');
    plas.setAttribute('rx', String(f ? 14 + 50 * f : 0));
    plas.setAttribute('ry', String(f ? 4 + 7 * f : 0));
    // Mond: blij → recht → verdrietig
    const mond = svg.querySelector('.ijs-mond');
    const krul = 8 - 16 * f;   // 8 = lach, -8 = verdrietig
    mond.setAttribute('d', `M72 ${98 - krul / 2} Q80 ${98 + krul} 88 ${98 - krul / 2}`);
    ijs.classList.remove('schud'); void ijs.offsetWidth; if (fouten) ijs.classList.add('schud');
  }

  function startGalgje() {
    const woorden = lijstVan('galgje');
    const v = voortgang('galgje');
    const woord = (v.huidig && v.huidig.woord) || volgendWoord(v);

    if (!woorden.length) {
      nieuwScherm();
      wortel.append(el('p', 'fotos-intro', 'Er staan nog geen galgjewoorden in content.js. 💌'));
      return;
    }
    if (!woord) { galgjeUitslag(v); return; }

    const info = woorden.find((w) => w.woord === woord);
    if (!v.huidig) v.huidig = { woord, letters: [] };
    bewaarVoortgang('galgje', v);

    const nr = Object.keys(v.resultaten).length + 1;
    nieuwScherm(`Woord ${nr} van ${v.volgorde.length}`);

    const spel = el('div', 'gg-spel');
    const ijs = maakIjsje();
    const hint = el('p', 'gg-hint', info.hint ? '💡 ' + info.hint : '');
    // Per woorddeel een groepje, zodat een regel alleen bij een spatie afbreekt.
    const woordEl = el('div', 'gg-woord');
    const letterVakken = [];
    let deel = null;
    [...woord].forEach((l) => {
      if (l === ' ') { deel = null; letterVakken.push(null); return; }
      if (!deel) deel = woordEl.appendChild(el('span', 'gg-deel'));
      letterVakken.push(deel.appendChild(el('span', 'gg-letter')));
    });
    const teller = el('p', 'gg-teller');
    let klaar = false;

    const toetsen = maakToetsenbord(raad);
    spel.append(ijs, hint, woordEl, teller, toetsen);
    wortel.append(spel);

    const fouten = () => v.huidig.letters.filter((l) => !woord.includes(l)).length;
    const alles = () => [...woord].every((l) => l === ' ' || v.huidig.letters.includes(l));

    function teken(animeer) {
      [...woord].forEach((l, i) => {
        if (l === ' ') return;
        const vak = letterVakken[i];
        if (v.huidig.letters.includes(l) && !vak.textContent) {
          vak.textContent = l;
          if (animeer) vak.classList.add('erbij');
        }
      });
      v.huidig.letters.forEach((l) => toetsen.kleur(l, woord.includes(l) ? 'goed' : 'fout'));
      const f = fouten();
      teller.textContent = f ? `${f} van de ${MAX_FOUTEN} fouten` : 'Nog geen fouten 🍦';
      smelt(ijs, f);
    }
    teken(false);

    function raad(letter) {
      if (klaar || v.huidig.letters.includes(letter)) return;
      v.huidig.letters.push(letter);
      bewaarVoortgang('galgje', v);
      teken(true);
      const f = fouten();
      if (alles() || f >= MAX_FOUTEN) {
        klaar = true;
        const geraden = alles();
        const punten = !geraden ? 0 : f <= 1 ? 3 : f <= 3 ? 2 : 1;
        v.resultaten[woord] = { geraden, fouten: f, punten };
        v.huidig = null;
        bewaarVoortgang('galgje', v);
        if (geraden) ijs.classList.add('gered');
        later(() => woordKlaar(geraden, f), 900);
      }
    }

    function woordKlaar(geraden, f) {
      opruimen();
      // Het hele woord laten zien (ook als het niet geraden is).
      [...woord].forEach((l, i) => { if (l !== ' ' && !letterVakken[i].textContent) { letterVakken[i].textContent = l; letterVakken[i].classList.add('gemist'); } });
      const kaart = el('div', 'ws-klaar');
      kaart.append(el('h3', 'sier', geraden ? (f === 0 ? 'Zonder één fout!' : 'Ijsje gered! 🍦') : 'Oh nee, gesmolten…'));
      if (!geraden) kaart.append(el('p', 'ws-woord', woord));
      if (info.herinnering) kaart.append(el('p', 'quiz-reactie', info.herinnering));
      if (info.foto) kaart.append(fotoBlok(info.foto));
      const laatste = !volgendWoord(v);
      kaart.append(knop('knop', laatste ? 'Naar de uitslag' : 'Volgend woord', startGalgje));
      toetsen.replaceWith(kaart);
      teller.remove();
      requestAnimationFrame(() => kaart.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }

  function galgjeUitslag(v) {
    const hartjes = scoreVan(v);
    bewaarScore('galgje', hartjes);
    nieuwScherm();
    const gered = Object.values(v.resultaten).filter((r) => r.geraden).length;
    const kaart = el('div', 'quiz-uitslag-kaart');
    kaart.append(
      el('p', 'quiz-hartjes', hartjesTekst(hartjes)),
      el('h3', 'sier', hartjes === 3 ? 'Ijsjesredder!' : 'Alle woorden gespeeld 💗'),
      el('p', 'quiz-score', `${gered} van de ${v.volgorde.length} ijsjes gered`),
      el('p', 'quiz-slot', 'En het beste ijsje blijft dat eerste, bij de Maas. 🍦'),
      knop('knop', 'Opnieuw spelen', () => { api.opslag.bewaar({ galgje: null }); startGalgje(); }),
      knop('knop zacht', 'Terug naar woordspellen', toonKeuze),
    );
    wortel.append(kaart);
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'woordspel',
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
