/*
  sw.js — service worker: maakt de app offline beschikbaar.

  BELANGRIJK: verhoog VERSIE bij elke wijziging die online gaat.
  Nieuw spelbestand? Zet het pad ook in KERN hieronder.
*/
const VERSIE = 'v27';
const CACHE = 'jubileum-' + VERSIE;

// De bestanden die de app nodig heeft om te starten.
const KERN = [
  './',
  'index.html',
  'css/style.css',
  'content.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  // Spellen (komen er per stap bij):
  'js/spellen/quiz.js',
  'js/spellen/wie.js',
  'js/spellen/fotos.js',
  'js/spellen/tijdlijn.js',
  'js/spellen/woordspel.js',
  'js/spellen/hartjesblokken.js',
  'js/spellen/sudoku.js',
  'js/spellen/woordzoeker.js',
  'js/spellen/ditofdat.js',
];

// content.js inlezen (moet bovenaan, niet later). Een wijziging in content.js
// laat de service worker zichzelf ook vernieuwen.
try { importScripts('content.js'); } catch (e) { /* fout in content.js: alleen de kern bewaren */ }

// Alle foto's uit content.js ook meteen bewaren, zodat elk spel offline werkt.
function fotosUitContent() {
  const fotos = new Set();
  try {
    (function zoek(waarde) {
      if (typeof waarde === 'string') {
        if (/\.(jpe?g|png|webp)$/i.test(waarde)) fotos.add(waarde);
      } else if (waarde && typeof waarde === 'object') {
        Object.values(waarde).forEach(zoek);
      }
    })(self.CONTENT);
  } catch (e) { /* niets */ }
  return [...fotos];
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(KERN);
    // Foto's los toevoegen: één ontbrekende foto mag de installatie niet breken.
    await Promise.all(fotosUitContent().map((f) => cache.add(f).catch(() => {})));
    await self.skipWaiting();
  })());
});

// Oude caches opruimen.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen.filter((n) => n.startsWith('jubileum-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Foto's: eerst uit de cache (snel). De rest: eerst het netwerk (altijd de
// nieuwste versie), en zonder internet terugvallen op de cache.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  const isFoto = req.destination === 'image';
  event.respondWith(isFoto ? cacheEerst(req) : netwerkEerst(req));
});

async function cacheEerst(req) {
  const cache = await caches.open(CACHE);
  const bewaard = await cache.match(req, { ignoreSearch: true });
  if (bewaard) return bewaard;
  const antwoord = await fetch(req);
  if (antwoord.ok) cache.put(req, antwoord.clone());
  return antwoord;
}

async function netwerkEerst(req) {
  const cache = await caches.open(CACHE);
  try {
    // Na 4 seconden zonder antwoord: gebruik de bewaarde versie.
    const antwoord = await Promise.race([
      fetch(req),
      new Promise((_, nee) => setTimeout(() => nee(new Error('te traag')), 4000)),
    ]);
    // De startpagina altijd onder één naam bewaren (ook als er ?dev=1 achter staat).
    if (antwoord.ok) cache.put(req.mode === 'navigate' ? './' : req, antwoord.clone());
    return antwoord;
  } catch (e) {
    const bewaard = await cache.match(req, { ignoreSearch: true })
      || (req.mode === 'navigate' ? await cache.match('./') : undefined);
    return bewaard || Response.error();
  }
}
