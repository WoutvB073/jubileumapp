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
const SPELLEN = [
  { id: 'quiz',           titel: 'Quiz over ons',     sub: 'Hoe goed ken je ons?',        icoon: '💬', kleur: 'var(--roze-licht)' },
  { id: 'wie',            titel: 'Wie van ons twee?', sub: 'Wout of Davinia?',            icoon: '👫', kleur: 'var(--lila-licht)' },
  { id: 'fotos',          titel: 'Fotospellen',       sub: 'Memory en raad de plek',      icoon: '📸', kleur: 'var(--perzik-licht)' },
  { id: 'tijdlijn',       titel: 'Tijdlijn',          sub: 'Zet ons jaar op volgorde',    icoon: '🗓️', kleur: 'var(--roze-licht)' },
  { id: 'woordspel',      titel: 'Woordspellen',      sub: 'Wordle en galgje',            icoon: '🔤', kleur: 'var(--lila-licht)' },
  { id: 'hartjesblokken', titel: 'Hartjesblokken',    sub: 'Puzzel de foto scherp',       icoon: '💗', kleur: 'var(--perzik-licht)' },
  { id: 'sudoku',         titel: 'Malta-sudoku',      sub: 'Net als op vakantie',         icoon: '☀️', kleur: 'var(--roze-licht)' },
  { id: 'woordzoeker',    titel: 'Woordpuzzels',      sub: 'Zoeken en kruisen',           icoon: '🔍', kleur: 'var(--lila-licht)' },
  { id: 'ditofdat',       titel: 'Dit of dat',        sub: 'Wat zou Wout kiezen?',        icoon: '⚖️', kleur: 'var(--perzik-licht)' },
  { id: 'kleuren',        titel: 'Kleuren op nummer', sub: 'Kleur ons in',                icoon: '🎨', kleur: 'var(--mint-licht)' },
  { id: 'klok',           titel: 'Hoe laat is het?',  sub: 'Klokkijken, heel serieus',    icoon: '🕰️', kleur: 'var(--lila-licht)' },
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

  SPELLEN.forEach((spel, i) => {
    const speelbaar = Spellen.bestaat(spel.id);
    const data = opslag[spel.id] || {};
    if (data.klaar) gespeeld++;

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
    tegels.append(tegel);
  });

  // Voortgang
  $('voortgang-tekst').textContent = gespeeld === SPELLEN.length
    ? 'Alles gespeeld. Netjes 😏'
    : `${gespeeld} van ${SPELLEN.length} spelletjes gespeeld`;
  $('voortgang-vulling').style.width = (100 * gespeeld / SPELLEN.length) + '%';

  // Brievenbus (wordt in stap 11 een eigen "spel" met id 'brievenbus')
  const brieven = INHOUD.brieven || [];
  const open = brieven.filter((b) => opslag[b.vrijBij]?.klaar).length;
  $('brievenbus-sub').textContent = brieven.length
    ? `${open} van ${brieven.length} briefjes vrijgespeeld`
    : 'Briefjes voor jou';
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
    klaar({ hartjes: score } = {}) {
      const oud = Opslag.spel(id);
      const extra = { klaar: true, datum: new Date().toISOString() };
      if (typeof score === 'number') {
        extra.hartjes = Math.max(0, Math.min(3, Math.round(score)), oud.hartjes || 0);
      }
      Opslag.zetSpel(id, extra);
    },
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
    maak('p', '', 'Dit spelletje doet even raar. Probeer een ander, dan kijk ik er nog naar 😅'),
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
