/*
  BRIEVENBUS: één brief in delen (CONTENT.brief.delen)
  ------------------------------------------------------------
  Hoeveel delen er open zijn, rekent app.js uit (self.Brief.open()):
  per solospel één deel voor uitgespeeld en één voor 2 of meer hartjes.
  De delen gaan altijd op volgorde open.

  - De brief groeit: open delen onder elkaar, dichte delen met een slotje.
  - Nieuwe delen (sinds de vorige keer) zijn gemarkeerd; de brievenbus
    scrolt naar het eerste nieuwe deel.
  - Alles open: "Lees de hele brief" toont hem als één doorlopende brief.
*/
(function () {
  'use strict';

  let api = null;
  let wortel = null;

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

  const brief = () => api.content.brief || { delen: [] };

  function toonDelen() {
    wortel.textContent = '';
    window.scrollTo(0, 0);
    const delen = brief().delen;
    const totaal = delen.length;
    const open = self.Brief.open();
    const gelezen = Math.min(self.Brief.gelezen(), open);

    const kop = el('div', 'brief-kop');
    kop.append(
      el('h3', 'sier', 'Jouw brief'),
      el('p', 'brief-teller', `${open} van ${totaal}`),
      el('p', 'brief-uitleg', 'Speel je een spel uit, dan gaat er een deel open. Haal je bij dat spel 2 hartjes, dan nog een.'),
    );
    if (open === totaal && totaal > 0) kop.append(knop('knop', 'Lees de hele brief', toonHeleBrief));
    wortel.append(kop);

    const lijst = el('div', 'brief-delen');
    let eersteNieuw = null;
    delen.forEach((tekst, i) => {
      const nr = i + 1;
      if (i < open) {
        const deel = el('article', 'brief-deel' + (i >= gelezen ? ' nieuw' : ''));
        const label = el('p', 'brief-deel-nr', `Deel ${nr}`);
        if (i >= gelezen) label.append(el('span', 'pil', 'nieuw'));
        deel.append(label, el('p', 'brief-deel-tekst', tekst));
        if (nr === totaal && brief().ondertekening) deel.append(el('p', 'brief-onder sier', brief().ondertekening));
        lijst.append(deel);
        if (i >= gelezen && !eersteNieuw) eersteNieuw = deel;
      } else {
        const dicht = el('div', 'brief-dicht');
        dicht.append(el('span', 'brief-slot', '🔒'), el('span', '', `Deel ${nr}`));
        lijst.append(dicht);
      }
    });
    if (!open) lijst.prepend(el('p', 'brief-leeg', 'Nog geen enkel deel open. Speel een spel uit, dan komt deel 1 erbij.'));
    wortel.append(lijst);

    self.Brief.zetGelezen(open);
    if (eersteNieuw && gelezen > 0) {
      requestAnimationFrame(() => eersteNieuw.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }

  // De hele brief als één doorlopende brief
  function toonHeleBrief() {
    wortel.textContent = '';
    window.scrollTo(0, 0);
    wortel.append(knop('fotos-terug', '‹ Alle delen', toonDelen));
    const papier = el('article', 'brief-papier');
    brief().delen.forEach((tekst) => papier.append(el('p', '', tekst)));
    if (brief().ondertekening) papier.append(el('p', 'brief-onder sier', brief().ondertekening));
    wortel.append(papier);
  }

  Spellen.registreer({
    id: 'brievenbus',
    titel: 'Brievenbus',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      toonDelen();
    },
    stop() {},
  });

  // Voor tests
  self.__briefScherm = { toonHeleBrief };
})();
