/*
  online-spel.js — gedeelde basis voor de nieuwere online spellen
  (Rankingspel, Wavelength, Tekenen en raden, Yahtzee).
  ------------------------------------------------------------
  Regelt alles rond het spel: wie ben jij, kamer maken of meedoen met een
  code, wachten op de ander, verdergaan na wegvallen, de plaagknop, en de
  stand (tegen elkaar: tellers/{spel}) of het samen-record (records/{spel}).

  Een spel gebruikt het zo:
    OnlineSpel.maak({
      id: 'ranking', naam: 'Rankingspel', modus: 'samen' | 'tegen',
      intro: 'tekst op het startscherm',
      opties: [{ waarde, tekst }]  (optioneel: keuze vóór een nieuw spel, bijv. tijd)
      optieVraag, optieUitleg      (tekst bij die keuze)
      nieuwPotje(begint, opties, vorige, ctx) -> stand (status 'spel')
      teken(ctx)                    tekent het spel in ctx.wortel
      stop()                        (optioneel) timers opruimen
    });
  ctx bevat o.a.: stand, ik, tegen, online, wortel, code, kamerRef, zet(fn),
  bovenbalk(), uitslag({...}), record, tellers, NAMEN, api.
*/
(function () {
  'use strict';

  const NAMEN = { wout: 'Wout', davinia: 'Davinia' };
  const IK_SLEUTEL = 'jubileum.ik';
  const ander = (n) => (n === 'wout' ? 'davinia' : 'wout');

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
  // Firebase geeft lijsten soms terug als object: altijd een echte lijst maken
  const lijst = (x) => (Array.isArray(x) ? x.filter((v) => v != null) : x ? Object.values(x).filter((v) => v != null) : []);

  function maak(def) {
    const SPEL = def.id;
    let api = null;
    let wortel = null;
    let ik = null;
    let code = null;
    let kamerRef = null;
    let luisteraars = [];
    let uitgesteld = false;
    let tekent = false;       // bezig met tekenen
    let nogEens = false;      // tijdens het tekenen kwam er een nieuwe stand binnen   // herteken overgeslagen tijdens een gebaar (slepen, tekenen)
    let stopAanwezig = null;
    let extraRef = null;
    let extraLuisteraar = null;
    let kamer = null;
    let tellers = {};
    let record = null;   // samen-record (null = nog geen)
    let tijdOffset = 0;
    let bezig = false;   // het spel is open (niet gestopt)

    function leeg() {
      wortel.textContent = '';
      window.scrollTo(0, 0);
    }

    function opruimen() {
      luisteraars.forEach((f) => f());
      luisteraars = [];
      if (extraRef && extraLuisteraar) extraRef.off('value', extraLuisteraar);
      if (stopAanwezig) stopAanwezig();
      kamerRef = extraRef = extraLuisteraar = stopAanwezig = null;
      kamer = null;
      if (self.Plaag) Plaag.stop();
      if (def.stop) { try { def.stop(); } catch (e) { console.warn(e); } }
    }

    // Een zet: altijd via een transactie op de hele stand
    function zet(fn) {
      if (!kamerRef) return Promise.resolve(null);
      return kamerRef.child('stand').transaction((huidig) => {
        if (huidig === null) return huidig;
        const uit = fn(huidig);
        return uit === undefined ? undefined : uit;
      }).then((r) => {
        kamerRef && kamerRef.child('bijgewerkt').set(Online.nu()).catch(() => {});
        return r;
      }).catch((e) => {
        console.warn(e);
        api.toast('Even geen verbinding, probeer het nog eens');
        return null;
      });
    }

    // Wout of Davinia wint: teller +1 (alleen door de telefoon die de laatste zet deed)
    function telWinst(winnaar) {
      if (winnaar !== ik) return;
      Online.telOp(SPEL, ik).catch(() => {});
    }

    // Samen-record: alleen omhoog (de databaseregels dwingen dat ook af)
    function zetRecord(score) {
      if (!kamerRef || typeof score !== 'number') return;
      firebase.database().ref(`records/${SPEL}`).transaction((oud) => (oud == null || score > oud ? score : undefined)).catch(() => {});
    }

    function fotoVanOns(sleutel) {
      const l = (api.content.fotos && api.content.fotos.memory) || [];
      if (!l.length) return null;
      let h = 0;
      for (const c of String(sleutel)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const img = el('img', 'uno-foto');
      img.src = l[(h + SPEL.length) % l.length];
      img.alt = '';
      img.addEventListener('error', () => img.remove());
      return img;
    }

    /* ---------- schermen vóór het spel ---------- */
    function toonStart() {
      opruimen();
      leeg();
      try { ik = localStorage.getItem(IK_SLEUTEL); } catch (e) { ik = null; }
      if (!NAMEN[ik]) return toonWieBenJij();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      k.append(el('h3', 'sier', def.naam), el('p', 'quiz-slot', def.intro.replace('{ik}', NAMEN[ik])));
      const vorig = Online.onthouden(SPEL);
      if (vorig && vorig.naam === ik) k.append(knop('knop', `Verder met ${vorig.code}`, () => meedoen(vorig.code)));
      k.append(
        knop(vorig ? 'knop zacht' : 'knop', 'Nieuw spel', () => (def.opties ? toonOpties() : nieuwSpel(null))),
        knop('knop zacht', 'Meedoen met een code', toonCodeInvoer),
        knop('uno-wissel', `Ik ben niet ${NAMEN[ik]}`, toonWieBenJij),
      );
      wortel.append(k);
    }

    function toonWieBenJij() {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      k.append(el('h3', 'sier', 'Wie ben jij?'), el('p', 'quiz-slot', 'Dan weet de andere telefoon wie er tegenover zit.'));
      const rij = el('div', 'wie-personen');
      ['wout', 'davinia'].forEach((n) => {
        const b = knop('wie-persoon ' + (n === 'wout' ? 'wie-ik' : 'wie-zij'), null, () => {
          ik = n;
          try { localStorage.setItem(IK_SLEUTEL, n); } catch (e) { /* niets */ }
          toonStart();
        });
        b.append(el('span', 'wie-letter', NAMEN[n][0]), el('span', 'wie-naam', NAMEN[n]));
        rij.append(b);
      });
      k.append(rij);
      wortel.append(k);
    }

    function toonOpties() {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      k.append(el('h3', 'sier', def.optieVraag || 'Kies'));
      if (def.optieUitleg) k.append(el('p', 'quiz-slot', def.optieUitleg));
      def.opties.forEach((o, i) => k.append(knop(i === 0 ? 'knop' : 'knop zacht', o.tekst, () => nieuwSpel(o.waarde))));
      k.append(knop('uno-wissel', 'Terug', toonStart));
      wortel.append(k);
    }

    function toonBezig(tekst) {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      k.append(el('p', 'uno-laden', '♥'), el('p', 'quiz-slot', tekst));
      wortel.append(k);
    }

    function toonFout(tekst) {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      k.append(el('h3', 'sier', 'Oeps'), el('p', 'quiz-slot', tekst), knop('knop', 'Terug', toonStart));
      wortel.append(k);
    }

    function toonCodeInvoer() {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      const invoer = el('input', 'uno-code-invoer');
      invoer.placeholder = 'HART-22';
      invoer.autocapitalize = 'characters';
      invoer.autocomplete = 'off';
      invoer.spellcheck = false;
      invoer.maxLength = 8;
      const melding = el('p', 'uno-melding');
      k.append(
        el('h3', 'sier', 'Meedoen'),
        el('p', 'quiz-slot', 'Vul de code in die op de andere telefoon staat.'),
        invoer, melding,
        knop('knop', 'Meedoen', () => {
          const c = Online.normaliseer(invoer.value);
          if (!c) { melding.textContent = 'Een code is 4 letters en 2 cijfers, bijv. HART-22'; return; }
          meedoen(c);
        }),
        knop('knop zacht', 'Terug', toonStart),
      );
      wortel.append(k);
      setTimeout(() => invoer.focus(), 50);
    }

    async function nieuwSpel(opties) {
      toonBezig('Kamer maken…');
      try {
        const c = await Online.maakKamer(SPEL, ik, { status: 'wacht', opties: opties == null ? 0 : opties });
        openKamer(c);
      } catch (e) {
        console.warn(e);
        toonFout('Dat lukte niet. Heb je internet?');
      }
    }

    async function meedoen(c) {
      toonBezig('Verbinden…');
      try {
        await Online.doeMee(SPEL, c, ik);
        openKamer(c);
      } catch (e) {
        console.warn(e);
        if (e.message === 'onbekend') toonFout(`Code ${c} bestaat niet (meer). Typfoutje?`);
        else if (e.message === 'bezet') toonFout(`${NAMEN[ik]} speelt al mee in ${c}, op een andere telefoon.`);
        else toonFout('Dat lukte niet. Heb je internet?');
      }
    }

    async function openKamer(c) {
      opruimen();
      code = c;
      let eerste = true;
      const { db } = await Online.start();
      if (!bezig) return;
      db.ref('.info/serverTimeOffset').once('value').then((s) => { tijdOffset = s.val() || 0; });
      kamerRef = db.ref(`kamers/${code}`);
      stopAanwezig = await Online.aanwezig(code, ik);
      // Stand (tegen elkaar) of record (samen)
      extraRef = def.modus === 'tegen' ? db.ref(`tellers/${SPEL}`) : db.ref(`records/${SPEL}`);
      extraLuisteraar = extraRef.on('value', (snap) => {
        if (def.modus === 'tegen') tellers = snap.val() || {};
        else record = snap.val();
        if (kamer && kamer.stand && kamer.stand.status === 'klaar') teken();
      }, () => {});
      const soort = (await kamerRef.child('spel').once('value')).val();
      if (soort && soort !== SPEL) { toonFout('Deze code is van een ander spel.'); return; }
      // Apart luisteren naar stand, online en spelers (niet naar de hele kamer:
      // dan geeft bijvoorbeeld de live tekening niet bij elke streep een herteken)
      const staat = { stand: undefined, online: {}, spelers: undefined };
      const luister = (deel, fn) => {
        const ref = kamerRef.child(deel);
        const f = ref.on('value', (snap) => { staat[deel] = snap.val(); fn(); }, (fout) => { console.warn(fout); toonFout('Geen toegang tot deze kamer.'); });
        luisteraars.push(() => ref.off('value', f));
      };
      const bij = () => {
        if (staat.stand === undefined || staat.spelers === undefined) return;
        if (!staat.spelers) { toonFout('Deze kamer bestaat niet meer.'); Online.onthoud(SPEL, null); return; }
        kamer = { stand: staat.stand || { status: 'wacht' }, online: staat.online || {}, spelers: staat.spelers };
        if (eerste) { if (self.Plaag) Plaag.begin(kamer.stand); eerste = false; } else if (self.Plaag) Plaag.bekijk(kamer.stand, ik, NAMEN);
        // Beide spelers er? Dan begint het eerste potje (de transactie zorgt dat het één keer gebeurt)
        if (kamer.stand.status === 'wacht' && kamer.spelers && kamer.spelers.wout && kamer.spelers.davinia) {
          const opties = kamer.stand.opties;
          const recordNu = record;
          zet((s) => (s.status === 'wacht' ? Object.assign(def.nieuwPotje(Math.random() < 0.5 ? 'wout' : 'davinia', opties, null, ctx()), { opties, recordVoor: recordNu || 0 }) : undefined));
        }
        teken();
      };
      luister('spelers', bij);
      luister('online', bij);
      luister('stand', bij);
    }

    function tekenWacht() {
      leeg();
      const k = el('div', 'quiz-uitslag-kaart uno-start');
      const opt = def.opties && def.opties.find((o) => o.waarde === kamer.stand.opties);
      k.append(
        el('h3', 'sier', 'Wachten op ' + NAMEN[ander(ik)]),
        el('p', 'quiz-slot', `Stuur deze code naar ${NAMEN[ander(ik)]}. Die kiest ${def.naam}, dan "Meedoen", en vult hem in.`),
        el('p', 'uno-code', code),
      );
      if (opt) k.append(el('p', 'rk-timerinfo', opt.tekst));
      k.append(
        fotoVanOns(code) || el('span'),
        el('p', 'uno-laden', '♥'),
        knop('knop zacht', 'Stoppen', () => { Online.onthoud(SPEL, null); toonStart(); }),
      );
      wortel.append(k);
    }

    /* ---------- tijdens het spel ---------- */
    function ctx() {
      const s = kamer && kamer.stand;
      return {
        stand: s, ik, tegen: ander(ik), code, kamerRef, wortel, api, NAMEN, lijst,
        online: Boolean(kamer && (kamer.online || {})[ander(ik)] === true),
        record, tellers, zet, el, knop, nu: () => Date.now() + tijdOffset,
        telWinst, zetRecord, fotoVanOns, opnieuw: teken,
        naGebaar: () => { if (uitgesteld) teken(); },
        bovenbalk: (extra) => bovenbalk(extra),
        uitslag: (u) => uitslag(u),
        nogEenPotje,
      };
    }

    // Bovenbalk: de ander (online-stip), eventueel extra info, en het plaagknopje
    function bovenbalk(extra) {
      const tegen = ander(ik);
      const online = (kamer.online || {})[tegen] === true;
      const boven = el('div', 'uno-tegen os-boven');
      const naam = el('div', 'uno-naam');
      naam.append(el('span', 'uno-stip' + (online ? ' aan' : ''), ''), el('b', '', NAMEN[tegen]));
      if (extra) naam.append(el('span', 'uno-aantal', extra));
      if (self.Plaag) naam.append(Plaag.knop(() => kamerRef, ik));
      boven.append(naam);
      if (!online && kamer.stand.status === 'spel') boven.append(el('p', 'uno-offline', `${NAMEN[tegen]} is even weg. Het spel wacht gewoon.`));
      return boven;
    }

    function nogEenPotje() {
      const recordNu = record;
      return zet((s) => {
        if (s.status !== 'klaar') return undefined;
        return Object.assign(def.nieuwPotje(ander(s.begint || ik), s.opties, s, ctx()), { opties: s.opties, recordVoor: Math.max(recordNu || 0, s.recordVoor || 0, s.score || 0) });
      });
    }

    // Uitslag: foto, titel, tekst, score of stand, en Nog een potje / Stoppen
    function uitslag({ titel, tekst, score, max, extra }) {
      const s = kamer.stand;
      const kaartje = el('div', 'quiz-uitslag-kaart uno-uitslag');
      const foto = fotoVanOns(code + ':' + (s.potje || s.zet || 0));
      if (foto) kaartje.append(foto);
      kaartje.append(el('h3', 'sier', titel));
      if (tekst) kaartje.append(el('p', 'quiz-slot', tekst));
      if (extra) kaartje.append(extra);
      if (def.modus === 'samen') {
        const voor = s.recordVoor || 0;
        kaartje.append(el('p', 'uno-teller', `${score} van ${max} punten`));
        if (score > voor) kaartje.append(el('p', 'os-record nieuw', voor ? `Nieuw record! Het was ${voor}` : 'Jullie eerste record 🎉'));
        else kaartje.append(el('p', 'os-record', `Record: ${Math.max(voor, record || 0)}`));
      } else {
        const w = tellers.wout || 0;
        const d = tellers.davinia || 0;
        kaartje.append(
          el('p', 'uno-teller', `Wout ${w} · Davinia ${d}`),
          el('p', 'uno-teller-sub', w > d ? 'Wout staat voor 😁' : w < d ? 'Davinia staat voor. Tijdelijk 😂' : 'Gelijkspel. Spannend 😁'),
        );
      }
      kaartje.append(
        knop('knop', 'Nog een potje', nogEenPotje),
        knop('knop zacht', 'Stoppen', () => { Online.onthoud(SPEL, null); api.terug(); }),
      );
      return kaartje;
    }

    function teken() {
      if (!bezig || !kamer) return;
      if (def.bezigMetGebaar && def.bezigMetGebaar()) { uitgesteld = true; return; }
      uitgesteld = false;
      const s = kamer.stand;
      self['__' + SPEL] = { ik, code, stand: s, record, tellers };   // voor tests
      if (!s || s.status === 'wacht') return tekenWacht();
      // Niet midden in het tekenen opnieuw beginnen (bijv. als het record meteen terugkomt)
      if (tekent) { nogEens = true; return; }
      tekent = true;
      try {
        def.teken(ctx());
      } catch (e) {
        console.error(e);
        toonFout('Dit spelletje doet even raar. Probeer het opnieuw 🥲');
      }
      tekent = false;
      if (nogEens) { nogEens = false; setTimeout(teken, 0); }
    }

    Spellen.registreer({
      id: SPEL,
      start(doel, spelApi) {
        api = spelApi;
        wortel = doel;
        bezig = true;
        if (!self.Online) { toonFout('De online verbinding kon niet laden.'); return; }
        toonStart();
      },
      stop() {
        bezig = false;
        opruimen();
      },
    });
  }

  // Een stapel zonder herhaling: pas als alles geweest is, begint hij opnieuw.
  // Bijgehouden op deze telefoon (localStorage); beide telefoons markeren wat
  // er gespeeld wordt, dus de stapel loopt op allebei gelijk op.
  const STAPEL = 'jubileum.stapel.';
  function gehad(sleutel) {
    try { return new Set(JSON.parse(localStorage.getItem(STAPEL + sleutel)) || []); } catch (e) { return new Set(); }
  }
  function trek(sleutel, totaal, aantal) {
    let weg = gehad(sleutel);
    let over = [];
    for (let i = 0; i < totaal; i++) if (!weg.has(i)) over.push(i);
    const hussel = (l) => { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
    over = hussel(over);
    if (over.length < aantal) {
      // Bijna alles geweest: eerst de rest, dan een nieuwe ronde door de stapel
      const opnieuw = hussel([...Array(totaal).keys()].filter((i) => !over.includes(i)));
      over = over.concat(opnieuw);
      weg = new Set();
      try { localStorage.setItem(STAPEL + sleutel, '[]'); } catch (e) { /* niets */ }
    }
    return over.slice(0, aantal);
  }
  function markeer(sleutel, ids, totaal) {
    const weg = gehad(sleutel);
    ids.forEach((i) => weg.add(i));
    const lijstWeg = weg.size >= totaal ? [] : [...weg];
    try { localStorage.setItem(STAPEL + sleutel, JSON.stringify(lijstWeg)); } catch (e) { /* niets */ }
  }

  self.OnlineSpel = { maak, NAMEN, ander, lijst, trek, markeer };
})();
