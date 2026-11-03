/*
  plaag.js — het plaagknopje in UNO en Rummikub
  ------------------------------------------------------------
  Tik op het knopje, kies een plaagje, en op de telefoon van de ander
  verschijnt een korte melding met een animatie. Het plaagje staat in
  kamers/{code}/stand/plaag (dus geen nieuwe databaseregels nodig):
  { van, soort, id }. Elke telefoon toont alleen plaagjes van de ander
  die hij nog niet gezien heeft.

  Gebruik in een spel:
    Plaag.begin(stand)                 bij het openen van een kamer
    Plaag.bekijk(stand, ik, namen)     bij elke update van de kamer
    Plaag.knop(() => kamerRef, ik)     het knopje in de bovenbalk
    Plaag.stop()                       bij het verlaten van het spel
*/
(function () {
  'use strict';

  const SOORTEN = {
    oor: { knop: 'In je oor blazen', melding: (n) => `${n} blaast in je oor`, icoon: '💨' },
    nek: { knop: 'In je nek ademen', melding: (n) => `${n} ademt in je nek`, icoon: '😮‍💨' },
    fuckertje: { knop: 'Fuckertje', melding: (n) => `${n} zegt: fuckertje`, icoon: '🤬' },
  };
  const WACHTTIJD = 10000;   // ms tussen twee plaagjes
  const ZICHTBAAR = 3200;    // ms dat de melding blijft staan

  let gezien = null;          // id van het laatst getoonde (of al bekende) plaagje
  let laatsteVerstuurd = 0;
  let wachtTimer = null;

  function el(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  function sluitMenu() {
    document.querySelectorAll('.plaag-menu').forEach((m) => m.remove());
    document.removeEventListener('pointerdown', buitenTik, true);
  }
  function buitenTik(e) {
    if (!e.target.closest('.plaag-menu, .plaag-knop')) sluitMenu();
  }

  // Nog even wachten? Geeft de resterende seconden (0 = mag weer).
  const nogWachten = () => Math.max(0, Math.ceil((laatsteVerstuurd + WACHTTIJD - Date.now()) / 1000));

  function zetKnopStaat(knop) {
    const s = nogWachten();
    knop.disabled = s > 0;
    knop.dataset.wacht = s > 0 ? String(s) : '';
  }

  // Het knopje (wordt bij elke herteken opnieuw gemaakt; de wachttijd loopt door)
  function knop(kamerRef, ik) {
    const k = el('button', 'plaag-knop', '😁');
    k.type = 'button';
    k.setAttribute('aria-label', 'Plagen');
    zetKnopStaat(k);
    clearInterval(wachtTimer);
    if (nogWachten()) {
      wachtTimer = setInterval(() => {
        document.querySelectorAll('.plaag-knop').forEach(zetKnopStaat);
        if (!nogWachten()) clearInterval(wachtTimer);
      }, 500);
    }
    k.addEventListener('click', (e) => {
      e.stopPropagation();
      if (document.querySelector('.plaag-menu')) { sluitMenu(); return; }
      if (nogWachten()) return;
      // Het menu hangt aan <body>, zodat het blijft staan als het spel opnieuw tekent
      const r = k.getBoundingClientRect();
      const menu = el('div', 'plaag-menu');
      menu.style.top = `${Math.round(r.bottom + 8)}px`;
      menu.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
      Object.entries(SOORTEN).forEach(([soort, s]) => {
        const optie = el('button', 'plaag-optie');
        optie.type = 'button';
        optie.append(el('span', 'plaag-optie-icoon', s.icoon), el('span', '', s.knop));
        optie.addEventListener('click', () => {
          sluitMenu();
          verstuur(kamerRef(), ik, soort);
        });
        menu.append(optie);
      });
      document.body.append(menu);
      setTimeout(() => document.addEventListener('pointerdown', buitenTik, true), 0);
    });
    return k;
  }

  function verstuur(ref, ik, soort) {
    if (!ref || nogWachten()) return;
    laatsteVerstuurd = Date.now();
    const id = `${ik}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    gezien = id;   // je eigen plaagje niet aan jezelf laten zien
    ref.child('stand/plaag').set({ van: ik, soort, id }).catch(() => { laatsteVerstuurd = 0; });
    document.querySelectorAll('.plaag-knop').forEach((k) => {
      zetKnopStaat(k);
      k.classList.remove('verstuurd');
      void k.offsetWidth;
      k.classList.add('verstuurd');
    });
    clearInterval(wachtTimer);
    wachtTimer = setInterval(() => {
      document.querySelectorAll('.plaag-knop').forEach(zetKnopStaat);
      if (!nogWachten()) clearInterval(wachtTimer);
    }, 500);
  }

  // Bij het openen van een kamer: wat er al stond, telt als gezien
  function begin(stand) {
    gezien = stand && stand.plaag ? stand.plaag.id : null;
  }

  // Nieuw plaagje van de ander? Dan de melding tonen.
  function bekijk(stand, ik, namen) {
    const p = stand && stand.plaag;
    if (!p || !p.id || p.id === gezien) return;
    gezien = p.id;
    if (p.van === ik || !SOORTEN[p.soort]) return;
    toon(p.soort, namen[p.van] || p.van);
  }

  function toon(soort, naam) {
    document.querySelectorAll('.plaag-melding').forEach((m) => m.remove());
    const s = SOORTEN[soort];
    const m = el('div', `plaag-melding plaag-${soort}`);
    m.setAttribute('role', 'status');
    m.append(el('span', 'plaag-melding-icoon', s.icoon), el('span', 'plaag-melding-tekst', s.melding(naam)));
    document.body.append(m);
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    setTimeout(() => m.classList.add('weg'), ZICHTBAAR);
    setTimeout(() => m.remove(), ZICHTBAAR + 500);
  }

  function stop() {
    sluitMenu();
    clearInterval(wachtTimer);
    document.querySelectorAll('.plaag-melding').forEach((m) => m.remove());
  }

  self.Plaag = { knop, begin, bekijk, stop, SOORTEN };
})();
