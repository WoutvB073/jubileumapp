/*
  app.js — het geraamte van de app.
  - Opslag: voortgang en scores in localStorage
  - SPELLEN: de lijst met tegels in het hoofdmenu
  - Spellen.registreer(): hiermee melden de spelbestanden zich aan
  - Schermen wisselen: installatie-instructie, menu, spel
*/

/* ------------------------------------------------------------
   De spellen in het menu (volgorde = volgorde van de tegels).
   Een spel is speelbaar zodra js/spellen/<id>.js zich registreert;
   tot die tijd staat er "binnenkort" op de tegel.
------------------------------------------------------------ */
// Groepen in het menu, in deze volgorde.
const GROEPEN = [
  { id: 'solo', titel: 'Alleen spelen', sub: 'In je eentje, in je eigen tempo' },
  { id: 'samen', titel: 'Samen online', sub: 'Tegen elkaar, ieder op je eigen telefoon' },
];

const SPELLEN = [
  { id: 'quiz',           titel: 'Quiz over ons',     sub: 'Hoe goed ken je ons?',        icoon: '💬', kleur: 'var(--roze-licht)', groep: 'solo' },
  { id: 'wie',            titel: 'Wie van ons twee?', sub: 'Wout of Davinia?',            icoon: '👫', kleur: 'var(--lila-licht)', groep: 'solo' },
  { id: 'fotos',          titel: 'Fotospellen',       sub: 'Memory en raad de plek',      icoon: '📸', kleur: 'var(--perzik-licht)', groep: 'solo' },
  { id: 'tijdlijn',       titel: 'Tijdlijn',          sub: 'Zet ons jaar op volgorde',    icoon: '🗓️', kleur: 'var(--roze-licht)', groep: 'solo' },
  { id: 'woordspel',      titel: 'Woordspellen',      sub: 'Wordle en galgje',            icoon: '🔤', kleur: 'var(--lila-licht)', groep: 'solo' },
  { id: 'hartjesblokken', titel: 'Hartjesblokken',    sub: 'Puzzel de foto scherp',       icoon: '💗', kleur: 'var(--perzik-licht)', groep: 'solo' },
  { id: 'sudoku',         titel: 'Malta-sudoku',      sub: 'Net als op vakantie',         icoon: '☀️', kleur: 'var(--roze-licht)', groep: 'solo' },
  { id: 'woordzoeker',    titel: 'Woordpuzzels',      sub: 'Zoeken en kruisen',           icoon: '🔍', kleur: 'var(--lila-licht)', groep: 'solo' },
  { id: 'ditofdat',       titel: 'Dit of dat',        sub: 'Wat zou Wout kiezen?',        icoon: '⚖️', kleur: 'var(--perzik-licht)', groep: 'solo' },
  { id: 'kleuren',        titel: 'Kleuren op nummer', sub: 'Kleur ons in',                icoon: '🎨', kleur: 'var(--mint-licht)', groep: 'solo' },
  { id: 'klok',           titel: 'Hoe laat is het?',  sub: 'Klokkijken, heel serieus',    icoon: '🕰️', kleur: 'var(--lila-licht)', groep: 'solo' },
  // Samen online (deel 2 en 3): ieder op de eigen telefoon
  { id: 'uno',            titel: 'UNO',               sub: 'Samen, ieder op je eigen telefoon', icoon: '🃏', kleur: 'var(--roze-licht)', groep: 'samen' },
  { id: 'rummikub',       titel: 'Rummikub',          sub: 'Samen, ieder op je eigen telefoon', icoon: '🔢', kleur: 'var(--lila-licht)', groep: 'samen' },
];

const INHOUD = self.CONTENT || {};

/* ------------------------------------------------------------
   Opslag (localStorage)
   Vorm: { spellen: { quiz: { klaar: true, hartjes: 3, datum: '...' } } }
------------------------------------------------------------ */
const OPSLAG_SLEUTEL = 'jubileum.v1';

const Opslag = {
  lees() {
    try {
      const data = JSON.parse(localStorage.getItem(OPSLAG_SLEUTEL));
      if (data && typeof data === 'object') {
        data.spellen = data.spellen || {};
        return data;
      }
    } catch (e) { /* kapotte of geen opslag: begin opnieuw */ }
    return { spellen: {} };
  },

  schrijf(data) {
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(data));
    } catch (e) { /* opslag vol of geblokkeerd: dan maar niet bewaren */ }
  },

  // Alles wat een spel heeft bewaard (of een leeg object).
  spel(id) {
    return this.lees().spellen[id] || {};
  },

  // Voeg gegevens toe aan wat een spel al had bewaard.
  zetSpel(id, extra) {
    const data = this.lees();
    data.spellen[id] = Object.assign({}, data.spellen[id], extra);
    this.schrijf(data);
  },
};

/* ------------------------------------------------------------
   Brievenbus: één brief in delen (CONTENT.brief.delen).
   Per solospel gaan er twee delen open: één als het spel voor het eerst
   is uitgespeeld, en één als er voor het eerst 2 of meer hartjes zijn
   gehaald. Het aantal verdiende delen bepaalt hoeveel delen er open zijn;
   ze gaan dus altijd op volgorde open, welk spel het ook was.
------------------------------------------------------------ */
const Brief = {
  totaal() {
    return (INHOUD.brief && INHOUD.brief.delen ? INHOUD.brief.delen.length : 0);
  },
  open(spellen = Opslag.lees().spellen) {
    let n = 0;
    SPELLEN.filter((s) => s.groep === 'solo').forEach((s) => {
      const d = spellen[s.id] || {};
      if (d.klaar) n++;
      if ((d.hartjes || 0) >= 2) n++;
    });
    return Math.min(n, this.totaal());
  },
  // Hoeveel delen er al gelezen zijn (in de brievenbus gezien)
  gelezen() {
    return (Opslag.lees().brief || {}).gelezen || 0;
  },
  zetGelezen(n) {
    const data = Opslag.lees();
    data.brief = Object.assign({}, data.brief, { gelezen: n });
    Opslag.schrijf(data);
  },
};
self.Brief = Brief;

// Melding onderin als er net een nieuw deel van de brief open is gegaan
let briefMeldingTimer = null;
function toonBriefMelding(van, tot) {
  clearTimeout(briefMeldingTimer);
  briefMeldingTimer = setTimeout(() => {
    sluitBriefMelding();
    const aantal = tot - van;
    const kaart = maak('div', 'brief-melding');
    kaart.setAttribute('role', 'status');
    kaart.append(
      maak('span', 'brief-melding-icoon', '💌'),
      maak('b', '', aantal === 1 ? 'Nieuw stukje van je brief' : `${aantal} nieuwe stukjes van je brief`),
      maak('span', 'brief-melding-sub', aantal === 1 ? `Deel ${tot} is open` : aantal === 2 ? `Deel ${van + 1} en ${tot} zijn open` : `Deel ${van + 1} t/m ${tot} zijn open`),
    );
    const lees = maak('button', 'knop', 'Lees het meteen');
    lees.type = 'button';
    lees.addEventListener('click', () => { sluitBriefMelding(); location.hash = 'spel/brievenbus'; });
    const later = maak('button', 'brief-melding-later', 'Later');
    later.type = 'button';
    later.addEventListener('click', sluitBriefMelding);
    kaart.append(lees, later);
    document.body.append(kaart);
  }, 900);
}
function sluitBriefMelding() {
  clearTimeout(briefMeldingTimer);
  document.querySelectorAll('.brief-melding').forEach((m) => m.remove());
}

/* ------------------------------------------------------------
   Thema: Licht (pastel) of Donker (zwart met roze).
   De keuze staat in localStorage; een stukje in <head> zet hem al
   vóór het tekenen, zodat er niets knippert.
------------------------------------------------------------ */
const THEMA_SLEUTEL = 'jubileum.thema';
const THEMA_KLEUR = { licht: '#fff7f2', donker: '#151116' };
const Thema = {
  huidig() {
    return document.documentElement.dataset.thema === 'donker' ? 'donker' : 'licht';
  },
  zet(thema) {
    document.documentElement.dataset.thema = thema;
    try { localStorage.setItem(THEMA_SLEUTEL, thema); } catch (e) { /* niets */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEMA_KLEUR[thema];
    const balk = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (balk) balk.content = thema === 'donker' ? 'black-translucent' : 'default';
    const knop = $('thema-knop');
    if (knop) {
      knop.textContent = thema === 'donker' ? '☀️ Licht' : '🌙 Donker';
      knop.setAttribute('aria-label', thema === 'donker' ? 'Wissel naar het lichte thema' : 'Wissel naar het donkere thema');
    }
  },
};
self.Thema = Thema;

/* ------------------------------------------------------------
   Register: elk spelbestand roept Spellen.registreer({...}) aan.
------------------------------------------------------------ */
const Spellen = {
  lijst: {},
  registreer(spel) {
    if (spel && spel.id && typeof spel.start === 'function') {
      this.lijst[spel.id] = spel;
    }
  },
  bestaat(id) {
    return Boolean(this.lijst[id]);
  },
};
self.Spellen = Spellen;

/* ------------------------------------------------------------
   Hulpjes
------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);

// Maak een element met een class en (veilige) tekst.
function maak(tag, klasse, tekst) {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (tekst != null) el.textContent = tekst;
  return el;
}

function hartjes(aantal) {
  return '♥'.repeat(aantal) + '♡'.repeat(3 - aantal);
}

let toastTimer = null;
function toast(tekst, duur = 2200) {
  const el = $('toast');
  el.textContent = tekst;
  el.classList.add('zichtbaar');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('zichtbaar'), duur);
}

/* ------------------------------------------------------------
   Draait de app vanaf het beginscherm-icoon?
   In een gewone browser kun je de app bekijken met ?dev=1
   (blijft dan actief in dat tabblad).
------------------------------------------------------------ */
function isApp() {
  if (window.navigator.standalone === true) return true;                   // iPhone
  if (window.matchMedia('(display-mode: standalone)').matches) return true; // andere telefoons
  try {
    if (new URLSearchParams(location.search).has('dev')) sessionStorage.setItem('jubileum.dev', '1');
    return sessionStorage.getItem('jubileum.dev') === '1';
  } catch (e) {
    return false;
  }
}

/* ------------------------------------------------------------
   Schermen
------------------------------------------------------------ */
let huidigSpel = null;

function toonScherm(id) {
  for (const s of document.querySelectorAll('.scherm')) s.hidden = s.id !== id;
  window.scrollTo(0, 0);
}

function toonInstallatie() {
  const ua = navigator.userAgent;
  const isIPhone = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const andereApp = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Instagram|FBAN|FBAV|WhatsApp/.test(ua);

  let melding = '';
  if (!isIPhone) melding = 'Open deze link op je iPhone in Safari, dan werkt alles het best. 📱';
  else if (andereApp) melding = 'Lukt het niet? Open deze link dan in Safari en volg de stapjes hieronder. 🧭';

  const el = $('installeer-melding');
  el.textContent = melding;
  el.hidden = !melding;
  toonScherm('installeer');
}

/* ------------------------------------------------------------
   Hoofdmenu
------------------------------------------------------------ */
function dagenSamen() {
  const [j, m, d] = String(INHOUD.algemeen?.samenSinds || '').split('-').map(Number);
  if (!j || !m || !d) return null;
  const begin = new Date(j, m - 1, d);
  const nu = new Date();
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  return Math.round((vandaag - begin) / 86400000);
}

function tekenMenu() {
  const algemeen = INHOUD.algemeen || {};
  $('menu-naam').textContent = algemeen.naamZij || 'jou';
  $('menu-welkom').textContent = algemeen.welkom || '';

  const dagen = dagenSamen();
  const dagenEl = $('menu-dagen');
  if (dagen === 365) dagenEl.textContent = 'Vandaag precies 1 jaar samen ❤️';
  else if (dagen > 0) dagenEl.textContent = `Al ${dagen} dagen samen`;
  dagenEl.hidden = !(dagen > 0);

  // Tegels
  const opslag = Opslag.lees().spellen;
  const tegels = $('tegels');
  tegels.textContent = '';
  let gespeeld = 0;
  const solo = SPELLEN.filter((s) => s.groep !== 'samen');

  GROEPEN.forEach((groep) => {
    const spellen = SPELLEN.filter((s) => (s.groep || 'solo') === groep.id);
    if (!spellen.length) return;
    const kop = maak('div', 'tegels-kop');
    kop.append(maak('h2', '', groep.titel), maak('p', '', groep.sub));
    tegels.append(kop);
    spellen.forEach((spel, i) => tegels.append(maakTegel(spel, i)));
  });

  function maakTegel(spel, i) {
    const speelbaar = Spellen.bestaat(spel.id);
    const data = opslag[spel.id] || {};
    if (data.klaar && spel.groep !== 'samen') gespeeld++;

    const tegel = maak('button', 'tegel' + (speelbaar ? '' : ' binnenkort'));
    tegel.type = 'button';
    tegel.style.setProperty('--tegel-kleur', spel.kleur);
    // Tegels komen één voor één binnen; daarna de animatie weghalen,
    // anders werkt het indruk-effect (:active) niet.
    tegel.style.animation = `binnen 0.45s ease-out ${0.04 * i}s both`;
    tegel.addEventListener('animationend', () => { tegel.style.animation = ''; }, { once: true });

    tegel.append(
      maak('span', 'tegel-nr', String(i + 1)),
      maak('span', 'tegel-icoon', spel.icoon),
      maak('span', 'tegel-titel', spel.titel),
      maak('span', 'tegel-sub', spel.sub),
    );

    const status = maak('span', 'tegel-status');
    if (!speelbaar) status.append(maak('span', 'pil', 'binnenkort'));
    else if (typeof data.hartjes === 'number') status.textContent = hartjes(data.hartjes);
    else if (data.klaar) status.textContent = '✓ gespeeld';
    else status.append(maak('span', 'pil', 'nieuw'));
    tegel.append(status);

    tegel.setAttribute('aria-label', `${spel.titel}: ${speelbaar ? spel.sub : 'binnenkort'}`);
    tegel.addEventListener('click', () => {
      if (speelbaar) {
        location.hash = 'spel/' + spel.id;
      } else {
        tegel.classList.remove('wiebel');
        void tegel.offsetWidth; // animatie opnieuw laten starten
        tegel.classList.add('wiebel');
        toast('Dit spelletje komt binnenkort');
      }
    });
    return tegel;
  }

  // Voortgang
  $('voortgang-tekst').textContent = gespeeld === solo.length
    ? 'Alles gespeeld. Netjes 🎉'
    : `${gespeeld} van ${solo.length} spelletjes gespeeld`;
  $('voortgang-vulling').style.width = (100 * gespeeld / solo.length) + '%';

  // Brievenbus: teller en badge met het aantal ongelezen delen
  const open = Brief.open(opslag);
  const nieuw = Math.max(0, open - Brief.gelezen());
  $('brievenbus-sub').textContent = `${open} van ${Brief.totaal()} delen open`;
  const badge = $('brievenbus-badge');
  badge.textContent = nieuw ? String(nieuw) : '';
  badge.hidden = !nieuw;
}

/* ------------------------------------------------------------
   Een spel starten
------------------------------------------------------------ */
function startSpel(id) {
  const spel = Spellen.lijst[id];
  const info = SPELLEN.find((s) => s.id === id);
  if (!spel) {
    location.replace('#menu');
    return;
  }

  $('spel-titel').textContent = info ? info.titel : (spel.titel || '');
  const inhoud = $('spel-inhoud');
  inhoud.textContent = '';
  toonScherm('spel');
  huidigSpel = spel;

  // Wat een spel van de app mag gebruiken
  const api = {
    content: INHOUD,
    opslag: {
      lees: () => Opslag.spel(id),
      bewaar: (extra) => Opslag.zetSpel(id, extra),
    },
    // Aanroepen als het spel uitgespeeld is. Bewaart de beste score.
    klaar({ hartjes: score } = {}) { spelKlaar(id, score); },
    terug: () => { location.hash = 'menu'; },
    toast,
    maak,
  };

  try {
    spel.start(inhoud, api);
  } catch (fout) {
    console.error(fout);
    toonFout(inhoud);
  }
}

// Een spel is uitgespeeld: bewaar dat en de beste score.
// Gaat er daardoor een nieuw deel van de brief open, dan komt er een melding.
function spelKlaar(id, score) {
  const briefVoor = Brief.open();
  const oud = Opslag.spel(id);
  const extra = { klaar: true, datum: new Date().toISOString() };
  if (typeof score === 'number') {
    extra.hartjes = Math.max(0, Math.min(3, Math.round(score)), oud.hartjes || 0);
  }
  Opslag.zetSpel(id, extra);
  const briefNa = Brief.open();
  if (briefNa > briefVoor) toonBriefMelding(briefVoor, briefNa);
}
self.__spelKlaar = spelKlaar;   // voor tests

function stopSpel() {
  if (huidigSpel && typeof huidigSpel.stop === 'function') {
    try { huidigSpel.stop(); } catch (e) { console.error(e); }
  }
  huidigSpel = null;
}

function toonFout(inhoud) {
  inhoud.textContent = '';
  const kaart = maak('div', 'melding-kaart');
  kaart.append(
    maak('h3', 'sier', 'Oeps…'),
    maak('p', '', 'Dit spelletje doet even raar. Probeer een ander, dan kijk ik er nog naar 🥲'),
  );
  const knop = maak('button', 'knop', 'Terug naar het menu');
  knop.type = 'button';
  knop.addEventListener('click', () => { location.hash = 'menu'; });
  kaart.append(knop);
  inhoud.append(kaart);
}

/* ------------------------------------------------------------
   Navigatie via de #hash (#menu, #spel/quiz)
------------------------------------------------------------ */
function route() {
  stopSpel();
  if (location.hash.includes('brievenbus')) sluitBriefMelding();
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('spel/')) {
    startSpel(hash.slice(5));
  } else {
    tekenMenu();
    toonScherm('menu');
  }
}

/* ------------------------------------------------------------
   Zwevende hartjes op de achtergrond
------------------------------------------------------------ */
function maakZweefHartjes() {
  const vak = document.querySelector('.zweef');
  for (let i = 0; i < 12; i++) {
    const h = maak('span', '', '♥');
    const duur = 16 + Math.random() * 14;
    h.style.left = (Math.random() * 96) + '%';
    h.style.fontSize = (14 + Math.random() * 18) + 'px';
    h.style.animationDuration = duur + 's';
    h.style.animationDelay = (-Math.random() * duur) + 's';
    vak.append(h);
  }
}

/* ------------------------------------------------------------
   Opstarten
------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  maakZweefHartjes();
  Thema.zet(Thema.huidig());
  $('thema-knop').addEventListener('click', () => Thema.zet(Thema.huidig() === 'donker' ? 'licht' : 'donker'));

  if (!isApp()) {
    toonInstallatie();
  } else {
    $('terug-knop').addEventListener('click', () => { location.hash = 'menu'; });
    $('brievenbus-knop').addEventListener('click', () => {
      if (Spellen.bestaat('brievenbus')) location.hash = 'spel/brievenbus';
      else toast('De brievenbus gaat binnenkort open');
    });
    window.addEventListener('hashchange', route);
    route();
  }

  // Offline beschikbaar maken (werkt alleen via https of localhost)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker niet gelukt:', e));
  }
});
