/*
  SPEL: TEKENEN EN RADEN (online, samen)
  ------------------------------------------------------------
  De tekenaar kiest uit 3 woorden (CONTENT.tekenen) en tekent met de vinger;
  de ander ziet de tekening live meegroeien en raadt door te typen, met
  streepjes van het woord als hulp (halverwege verschijnt de eerste letter).
  Goed geraden: 3 tot 10 punten, meer naarmate het sneller gaat.
  Tijd per tekening bij de start: 60, 90, 120 seconden of geen limiet.
  Een potje = 6 tekeningen (ieder tekent 3 keer), max 60 punten, samen-record.

  De tekening staat los van de stand, in kamers/{code}/tekening:
  { ronde: "potje:ronde", streken: { id: { k: kleur, d: dikte, p: "x,y;x,y" } } }
  met x en y van 0 tot 1000, zodat het op elk scherm hetzelfde is.
  Het scherm wordt niet bij elke update opnieuw opgebouwd: het canvas en het
  invoerveld blijven staan (dan hapert het tekenen niet en blijft het
  toetsenbord open); alleen de kleine dingen worden bijgewerkt.
*/
(function () {
  'use strict';

  const RONDES = 6;
  const KLEUREN = ['#2b2230', '#e5484d', '#2f7cf6', '#33a64a', '#f7c51e', '#ec6fa3', '#8a5a3b'];
  const DIKTES = [6, 14, 28];          // in duizendsten van de breedte
  const GUM = '#ffffff';
  const { ander } = OnlineSpel;

  let content = null;
  let opbouw = null;          // sleutel van het scherm dat nu staat (potje:ronde:fase)
  let delen = {};             // verwijzingen naar elementen die bijgewerkt worden
  let klokTimer = null;
  // Tekening
  let doek = null, pen = null;
  let streken = new Map();    // id -> { k, d, p: [[x,y], ...] }
  let tekeningSleutel = null; // potje:ronde van de tekening die in `streken` staat
  let tekeningRef = null, tekeningCode = null, tekeningLuisteraars = [];
  let eigen = null;           // de streep die ik nu teken { id, k, d, p }
  let schrijfTimer = null;
  let kleur = KLEUREN[0], dikte = DIKTES[1], gum = false;
  let hertekenGepland = false;
  let gezienKey = null;
  let gestoptVoor = null;     // tijd-op al verstuurd voor deze ronde

  const tekenaar = (s) => (s.ronde % 2 === 0 ? s.begint : ander(s.begint));
  const normaal = (t) => String(t || '').normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const woordVan = (s) => content.tekenen[s.woord];
  const sleutelVan = (s) => `${s.potje}:${s.ronde}`;

  function nieuwPotje(begint, opties, vorige, ctx) {
    content = ctx.api.content;
    return {
      status: 'spel',
      potje: Math.random().toString(36).slice(2, 8),
      begint,
      ronde: 0,
      keuzes: OnlineSpel.trek('tekenen', content.tekenen.length, RONDES * 3),
      fase: 'kiezen',
      woord: null,
      start: null,
      score: 0,
      punten: [],
      gokken: null,
    };
  }

  /* ---------- punten ---------- */
  function puntenNa(seconden, limiet) {
    if (limiet) return 3 + Math.round(7 * Math.max(0, 1 - seconden / limiet));
    return Math.max(3, 10 - Math.floor(seconden / 15));
  }

  /* ---------- zetten ---------- */
  function kiesWoord(ctx, w) {
    const { ronde, potje } = ctx.stand;
    // De tekening van deze ronde leegmaken, dan pas beginnen
    ctx.kamerRef.child('tekening').set({ ronde: `${potje}:${ronde}` }).catch(() => {});
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'kiezen') return undefined;
      s.woord = w;
      s.fase = 'tekenen';
      s.start = firebase.database.ServerValue.TIMESTAMP;
      s.gokken = null;
      return s;
    });
  }

  function raad(ctx, gok) {
    const { ronde, potje } = ctx.stand;
    const nu = ctx.nu();
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'tekenen') return undefined;
      if (normaal(gok) === normaal(content.tekenen[s.woord])) {
        const p = puntenNa(Math.max(0, (nu - s.start) / 1000), s.opties || 0);
        s.punten = ctx.lijst(s.punten).concat(p);
        s.score = (s.score || 0) + p;
        s.fase = 'uitkomst';
        s.geraden = true;
        s.tijd = Math.round((nu - s.start) / 1000);
      } else {
        s.gokken = ctx.lijst(s.gokken).concat(gok).slice(-6);
      }
      return s;
    });
  }

  function stopRonde(ctx) {
    const { ronde, potje } = ctx.stand;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'tekenen') return undefined;
      s.punten = ctx.lijst(s.punten).concat(0);
      s.fase = 'uitkomst';
      s.geraden = false;
      return s;
    });
  }

  function volgende(ctx) {
    const { ronde, potje } = ctx.stand;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'uitkomst') return undefined;
      if (s.ronde + 1 >= RONDES) { s.status = 'klaar'; return s; }
      s.ronde += 1;
      s.fase = 'kiezen';
      s.woord = null;
      s.start = null;
      s.gokken = null;
      s.geraden = null;
      s.tijd = null;
      return s;
    });
  }

  /* ---------- de tekening: live via de database ---------- */
  const codeer = (p) => p.map(([x, y]) => `${x},${y}`).join(';');
  const decodeer = (t) => String(t || '').split(';').filter(Boolean).map((xy) => xy.split(',').map(Number));

  function luisterTekening(ctx) {
    if (tekeningCode === ctx.code && tekeningRef) return;
    stopTekening();
    tekeningCode = ctx.code;
    tekeningRef = ctx.kamerRef.child('tekening');
    const strekenRef = tekeningRef.child('streken');
    const bij = (snap) => {
      if (eigen && snap.key === eigen.id) return;   // mijn eigen streep heb ik al
      const v = snap.val();
      if (!v) return;
      streken.set(snap.key, { k: v.k, d: v.d, p: decodeer(v.p) });
      planHerteken();
    };
    const weg = (snap) => { streken.delete(snap.key); planHerteken(); };
    const rondeRef = tekeningRef.child('ronde');
    const opRonde = (snap) => {
      const r = snap.val();
      // Alleen onthouden: oude strepen verdwijnen vanzelf (child_removed) als er een nieuwe ronde begint
      tekeningSleutel = r;
    };
    rondeRef.on('value', opRonde);
    strekenRef.on('child_added', bij);
    strekenRef.on('child_changed', bij);
    strekenRef.on('child_removed', weg);
    tekeningLuisteraars = [
      () => rondeRef.off('value', opRonde),
      () => strekenRef.off('child_added', bij),
      () => strekenRef.off('child_changed', bij),
      () => strekenRef.off('child_removed', weg),
    ];
  }
  function stopTekening() {
    tekeningLuisteraars.forEach((f) => f());
    tekeningLuisteraars = [];
    tekeningRef = null;
    tekeningCode = null;
    tekeningSleutel = null;
    streken.clear();
  }

  function planHerteken() {
    if (hertekenGepland) return;
    hertekenGepland = true;
    requestAnimationFrame(() => { hertekenGepland = false; hertekenAlles(); });
  }

  function trekStreep(st) {
    if (!pen || !st.p.length) return;
    const b = doek.width / 1000;
    pen.strokeStyle = st.k;
    pen.fillStyle = st.k;
    pen.lineWidth = st.d * b;
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    if (st.p.length === 1) {
      pen.beginPath();
      pen.arc(st.p[0][0] * b, st.p[0][1] * b, (st.d * b) / 2, 0, Math.PI * 2);
      pen.fill();
      return;
    }
    pen.beginPath();
    pen.moveTo(st.p[0][0] * b, st.p[0][1] * b);
    for (let i = 1; i < st.p.length; i++) pen.lineTo(st.p[i][0] * b, st.p[i][1] * b);
    pen.stroke();
  }
  function hertekenAlles() {
    if (!pen) return;
    pen.fillStyle = '#ffffff';
    pen.fillRect(0, 0, doek.width, doek.height);
    streken.forEach(trekStreep);
    if (eigen) trekStreep(eigen);
  }

  function maakDoek() {
    if (!doek) {
      doek = document.createElement('canvas');
      doek.className = 'tk-doek';
      pen = doek.getContext('2d');
    }
    return doek;
  }
  function pasDoekAan() {
    const w = doek.clientWidth;
    if (!w) return;
    const px = Math.round(w * Math.min(2, window.devicePixelRatio || 1));
    if (doek.width !== px) { doek.width = px; doek.height = px; }
    hertekenAlles();
  }

  // Tekenen met de vinger (alleen de tekenaar)
  function koppelTekenen(ctx) {
    if (doek.dataset.gekoppeld) return;
    doek.dataset.gekoppeld = '1';
    const plek = (e) => {
      const r = doek.getBoundingClientRect();
      return [Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 1000), Math.round(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) * 1000)];
    };
    const schrijf = (direct) => {
      if (!eigen || !tekeningRef) return;
      const doe = () => { if (eigen && tekeningRef) tekeningRef.child('streken/' + eigen.id).set({ k: eigen.k, d: eigen.d, p: codeer(eigen.p) }).catch(() => {}); };
      // Tijdens het tekenen hooguit elke 60 ms versturen (niet wachten tot je stopt)
      if (direct) { clearTimeout(schrijfTimer); schrijfTimer = null; doe(); } else if (!schrijfTimer) schrijfTimer = setTimeout(() => { schrijfTimer = null; doe(); }, 60);
    };
    doek.addEventListener('pointerdown', (e) => {
      if (!doek.dataset.mag || !tekeningRef) return;
      e.preventDefault();
      try { doek.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
      eigen = { id: tekeningRef.child('streken').push().key, k: gum ? GUM : kleur, d: gum ? DIKTES[2] * 1.4 : dikte, p: [plek(e)], pid: e.pointerId };
      trekStreep(eigen);
      schrijf(true);
    });
    doek.addEventListener('pointermove', (e) => {
      if (!eigen || e.pointerId !== eigen.pid) return;
      const p = plek(e);
      const vorige = eigen.p[eigen.p.length - 1];
      if (Math.hypot(p[0] - vorige[0], p[1] - vorige[1]) < 4) return;
      eigen.p.push(p);
      // Alleen het nieuwe stukje tekenen: snel en zonder haperen
      const b = doek.width / 1000;
      pen.strokeStyle = eigen.k; pen.lineWidth = eigen.d * b; pen.lineCap = 'round'; pen.lineJoin = 'round';
      pen.beginPath(); pen.moveTo(vorige[0] * b, vorige[1] * b); pen.lineTo(p[0] * b, p[1] * b); pen.stroke();
      schrijf(false);
    });
    const los = (e) => {
      if (!eigen || e.pointerId !== eigen.pid) return;
      schrijf(true);
      streken.set(eigen.id, { k: eigen.k, d: eigen.d, p: eigen.p });
      eigen = null;
      setTimeout(() => ctx.naGebaar(), 0);
    };
    doek.addEventListener('pointerup', los);
    doek.addEventListener('pointercancel', los);
  }

  function wisAlles() {
    if (!tekeningRef) return;
    streken.clear();
    tekeningRef.child('streken').remove().catch(() => {});
    hertekenAlles();
  }

  /* ---------- schermen ---------- */
  function streepjes(w, toonEerste) {
    return [...w].map((c, i) => (c === ' ' ? '   ' : /[a-zA-ZÀ-ſ]/.test(c) ? (i === 0 && toonEerste ? c.toUpperCase() : '_') : c)).join(' ');
  }

  function tekenKlaar(ctx) {
    const { stand: s, el, wortel } = ctx;
    wortel.textContent = '';
    const score = s.score || 0;
    ctx.zetRecord(score);
    const tekst = score >= 45 ? 'Picasso en zijn muze. Of andersom 😁' : score >= 25 ? 'Goed gekrabbeld 👍' : 'Kunst is lastig. Vooral als ik teken 😂';
    const scherm = el('div', 'os-scherm tk-scherm');
    scherm.append(ctx.bovenbalk(), ctx.uitslag({ titel: `Samen ${score} punten`, tekst, score, max: RONDES * 10 }));
    wortel.append(scherm);
  }

  function bouw(ctx) {
    const { stand: s, ik, NAMEN, el, knop, wortel } = ctx;
    wortel.textContent = '';
    delen = {};
    const scherm = el('div', 'os-scherm tk-scherm');
    const ikTeken = tekenaar(s) === ik;
    const t = tekenaar(s);
    delen.boven = el('div');
    delen.boven.append(ctx.bovenbalk(`Tekening ${s.ronde + 1}/${RONDES} · ${s.score || 0} punten`));
    scherm.append(delen.boven);

    if (s.fase === 'kiezen') {
      const kaart = el('div', 'rkg-kaart');
      if (ikTeken) {
        kaart.append(el('p', 'rkg-wie', 'Jij tekent'), el('h3', 'rkg-titel', 'Kies een woord'));
        const keuzes = el('div', 'tk-keuzes');
        ctx.lijst(s.keuzes).slice(s.ronde * 3, s.ronde * 3 + 3).forEach((w) => keuzes.append(knop('knop zacht tk-keuze', content.tekenen[w], () => kiesWoord(ctx, w))));
        kaart.append(keuzes);
      } else {
        kaart.append(el('p', 'rkg-wie', `${NAMEN[t]} tekent, jij raadt`), el('p', 'rkg-uitleg', `${NAMEN[t]} kiest een woord…`), el('p', 'uno-laden', '♥'));
      }
      scherm.append(kaart);
      wortel.append(scherm);
      return;
    }

    // Tekenen of uitkomst: het doek staat er altijd
    const info = el('div', 'tk-info');
    delen.woord = el('p', 'tk-woord');
    delen.klok = el('span', 'tk-klok');
    info.append(delen.woord, delen.klok);
    scherm.append(info);
    const vak = el('div', 'tk-vak');
    vak.append(maakDoek());
    scherm.append(vak);
    doek.dataset.mag = ikTeken && s.fase === 'tekenen' ? '1' : '';
    vak.classList.toggle('mag', Boolean(doek.dataset.mag));

    if (s.fase === 'tekenen' && ikTeken) {
      koppelTekenen(ctx);
      const gereedschap = el('div', 'tk-gereedschap');
      const kleurRij = el('div', 'tk-kleuren');
      KLEUREN.forEach((k) => {
        const b = knop('tk-kleur' + (!gum && k === kleur ? ' aan' : ''), null, () => { kleur = k; gum = false; tekenGereedschap(); });
        b.style.background = k;
        b.setAttribute('aria-label', 'Kleur');
        kleurRij.append(b);
      });
      const dikteRij = el('div', 'tk-diktes');
      DIKTES.forEach((d) => {
        const b = knop('tk-dikte' + (!gum && d === dikte ? ' aan' : ''), null, () => { dikte = d; gum = false; tekenGereedschap(); });
        const stip = el('span', 'tk-stip');
        stip.style.width = stip.style.height = `${6 + d / 1.6}px`;
        b.append(stip);
        dikteRij.append(b);
      });
      dikteRij.append(
        knop('tk-gum' + (gum ? ' aan' : ''), 'Gum', () => { gum = !gum; tekenGereedschap(); }),
        knop('tk-wis', 'Alles wissen', wisAlles),
      );
      gereedschap.append(kleurRij, dikteRij);
      delen.gereedschap = gereedschap;
      scherm.append(gereedschap);
      delen.gokken = el('p', 'tk-gokken');
      scherm.append(delen.gokken);
    } else if (s.fase === 'tekenen') {
      delen.hint = el('p', 'tk-streepjes');
      scherm.append(delen.hint);
      const rij = el('div', 'tk-raadrij');
      const invoer = el('input', 'tk-invoer');
      invoer.placeholder = 'Wat is het?';
      invoer.autocomplete = 'off';
      invoer.autocapitalize = 'off';
      invoer.spellcheck = false;
      const stuur = () => { const g = invoer.value.trim(); if (!g) return; invoer.value = ''; raad(ctx, g); };
      invoer.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); stuur(); } });
      rij.append(invoer, knop('knop tk-raad', 'Raad', stuur));
      scherm.append(rij);
      delen.gokken = el('p', 'tk-gokken');
      scherm.append(delen.gokken, knop('uno-wissel', 'Ik weet het niet', () => stopRonde(ctx)));
    } else {
      // Uitkomst
      const p = ctx.lijst(s.punten)[s.ronde] || 0;
      const uit = el('div', 'rkg-kaart');
      uit.append(el('p', 'rkg-punten', s.geraden ? `Geraden in ${s.tijd} seconden. +${p} punten 🎉` : 'Niet geraden 🥲'));
      uit.append(el('p', 'rkg-uitleg', `Het woord was: ${woordVan(s)}`));
      uit.append(knop('knop', s.ronde + 1 >= RONDES ? 'Naar de uitslag' : 'Volgende tekening', () => volgende(ctx)));
      scherm.append(uit);
    }
    wortel.append(scherm);
    requestAnimationFrame(pasDoekAan);
  }

  function tekenGereedschap() {
    if (!delen.gereedschap) return;
    delen.gereedschap.querySelectorAll('.tk-kleur').forEach((b, i) => b.classList.toggle('aan', !gum && KLEUREN[i] === kleur));
    delen.gereedschap.querySelectorAll('.tk-dikte').forEach((b, i) => b.classList.toggle('aan', !gum && DIKTES[i] === dikte));
    const g = delen.gereedschap.querySelector('.tk-gum');
    if (g) g.classList.toggle('aan', gum);
  }

  // De kleine dingen bijwerken zonder het scherm opnieuw te bouwen
  function werkBij(ctx) {
    const { stand: s, ik, NAMEN, el } = ctx;
    if (delen.boven) { delen.boven.textContent = ''; delen.boven.append(ctx.bovenbalk(`Tekening ${s.ronde + 1}/${RONDES} · ${s.score || 0} punten`)); }
    const ikTeken = tekenaar(s) === ik;
    const w = s.woord != null ? woordVan(s) : '';
    if (delen.woord) delen.woord.textContent = s.fase === 'uitkomst' ? w : ikTeken ? `Jij tekent: ${w}` : `${NAMEN[tekenaar(s)]} tekent`;
    if (delen.gokken) {
      const g = ctx.lijst(s.gokken);
      delen.gokken.textContent = g.length ? (ikTeken ? `${NAMEN[ander(ik)]} raadde: ` : 'Mis: ') + g.join(', ') : '';
    }
    tik(ctx);
  }

  // Elke kwart seconde: klok, eerste letter na de helft, en tijd op
  function tik(ctx) {
    const s = ctx.stand;
    if (s.status !== 'spel' || s.fase !== 'tekenen' || typeof s.start !== 'number') { if (delen.klok) delen.klok.textContent = ''; return; }
    const limiet = s.opties || 0;
    const gehad = Math.max(0, (ctx.nu() - s.start) / 1000);
    if (delen.klok) {
      if (limiet) {
        const over = Math.max(0, Math.ceil(limiet - gehad));
        delen.klok.textContent = `⏱ ${over}`;
        delen.klok.classList.toggle('bijna', over <= 10);
      } else {
        delen.klok.textContent = `⏱ ${Math.floor(gehad)}`;
      }
    }
    const helft = limiet ? gehad >= limiet / 2 : gehad >= 45;
    if (delen.hint) delen.hint.textContent = streepjes(woordVan(s), helft);
    if (limiet && gehad >= limiet) {
      // Tijd op: de tekenaar sluit de ronde af (of de rader, als de tekenaar weg is)
      const k = sleutelVan(s);
      if (gestoptVoor !== k && (tekenaar(s) === ctx.ik || gehad >= limiet + 4)) { gestoptVoor = k; stopRonde(ctx); }
    }
  }

  function teken(ctx) {
    const s = ctx.stand;
    content = ctx.api.content;
    if (s.keuzes) OnlineSpel.markeer('tekenen', ctx.lijst(s.keuzes), content.tekenen.length);
    luisterTekening(ctx);
    if (s.status === 'klaar') {
      opbouw = null;
      clearInterval(klokTimer);
      tekenKlaar(ctx);
      return;
    }
    const sleutel = `${sleutelVan(s)}:${s.fase}`;
    const opnieuw = opbouw !== sleutel || !ctx.wortel.contains(delen.boven || null);
    if (opnieuw) {
      if (gezienKey !== sleutelVan(s)) { gezienKey = sleutelVan(s); eigen = null; if (s.fase === 'kiezen') { streken.clear(); } }
      opbouw = sleutel;
      bouw(ctx);
    }
    werkBij(ctx);
    clearInterval(klokTimer);
    klokTimer = setInterval(() => tik(ctx), 250);
  }

  OnlineSpel.maak({
    id: 'tekenen',
    naam: 'Tekenen en raden',
    modus: 'samen',
    intro: 'Samen spelen, ieder op je eigen telefoon. De een tekent, de ander raadt. Samen punten halen. Je speelt als {ik}.',
    optieVraag: 'Tijd per tekening?',
    optieUitleg: 'Hoe sneller geraden, hoe meer punten.',
    opties: [
      { waarde: 90, tekst: '90 seconden' },
      { waarde: 60, tekst: '60 seconden' },
      { waarde: 120, tekst: '120 seconden' },
      { waarde: 0, tekst: 'Geen limiet' },
    ],
    nieuwPotje,
    teken,
    bezigMetGebaar: () => Boolean(eigen),
    stop() {
      clearInterval(klokTimer);
      clearTimeout(schrijfTimer);
      stopTekening();
      opbouw = null;
      delen = {};
      eigen = null;
      gezienKey = null;
    },
  });

  // Voor tests
  self.__tekenenIntern = { streken: () => streken, puntenNa };
})();
