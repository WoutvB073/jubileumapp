/*
  SPEL: UNO (online, ieder op de eigen telefoon)
  ------------------------------------------------------------
  Normale regels voor 2 spelers: 4 kleuren met 0-9, Sla over, Keer om
  (werkt als Sla over), +2, Joker (kleur kiezen) en +4 Joker.
  Kaarten zoals echte UNO (rood, geel, groen, blauw). Persoonlijk alleen
  waar het niet in de weg zit: de achterkant (W ♥ D), het wachtscherm en
  een foto van ons op het winnaarsscherm.
  - +2 en +4: de ander pakt de kaarten en jij bent weer aan de beurt.
  - Kun je niet (of wil je niet) spelen: pak een kaart. Past die, dan mag
    je hem meteen spelen; anders (of met "Pas") is de ander aan de beurt.
  - Nog 1 kaart over zonder "UNO!" te roepen: de ander kan "Betrapt!"
    tikken en dan pak jij er 2.
  - Geen stapelen van +2/+4; +4 mag altijd (geen uitdagen).

  Alle zetten gaan via een transactie op /kamers/{code}/stand, zodat beide
  telefoons altijd dezelfde stand zien. Tellers: /tellers/uno/{naam}.
*/
(function () {
  'use strict';

  const KLEUREN = ['rood', 'geel', 'groen', 'blauw'];
  const KLEURNAAM = { rood: 'rood', geel: 'geel', groen: 'groen', blauw: 'blauw' };
  const NAMEN = { wout: 'Wout', davinia: 'Davinia' };
  const START_KAARTEN = 7;
  const IK_SLEUTEL = 'jubileum.ik';

  let api = null;
  let wortel = null;
  let ik = null;            // 'wout' of 'davinia'
  let code = null;
  let kamerRef = null;
  let kamerLuisteraar = null;
  let stopAanwezig = null;
  let tellerRef = null;
  let tellerLuisteraar = null;
  let tellers = {};
  let laatsteZet = -1;
  let kamer = null;         // laatste stand uit de database
  let kleurKiezer = null;   // kaart die wacht op een kleurkeuze

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

  const ander = (naam) => (naam === 'wout' ? 'davinia' : 'wout');
  const lijst = (x) => (Array.isArray(x) ? x.filter(Boolean) : x ? Object.values(x).filter(Boolean) : []);

  /* ----------------------------------------------------------
     Kaarten: "kleur:waarde:nr", bv. "rood:7:1", "zwart:joker:3"
     waarde: 0-9, sla, keer, plus2, joker, plus4
     ---------------------------------------------------------- */
  function kaart(s) {
    const [kleur, waarde] = String(s).split(':');
    return { kleur, waarde, s };
  }

  function nieuweStapel() {
    const stapel = [];
    KLEUREN.forEach((k) => {
      stapel.push(`${k}:0:0`);
      for (let i = 0; i < 2; i++) {
        for (let n = 1; n <= 9; n++) stapel.push(`${k}:${n}:${i}`);
        ['sla', 'keer', 'plus2'].forEach((w) => stapel.push(`${k}:${w}:${i}`));
      }
    });
    for (let i = 0; i < 4; i++) stapel.push(`zwart:joker:${i}`, `zwart:plus4:${i}`);
    return hussel(stapel);
  }

  function kanSpelen(s, stand) {
    const k = kaart(s);
    const top = kaart(stand.afleg[stand.afleg.length - 1]);
    return k.kleur === 'zwart' || k.kleur === stand.kleur || k.waarde === top.waarde;
  }

  // Een kaart van de stapel pakken (stapel leeg: aflegstapel husselen, behalve de bovenste)
  function trek(stand, naam, aantal) {
    for (let i = 0; i < aantal; i++) {
      if (!stand.stapel.length) {
        const top = stand.afleg.pop();
        stand.stapel = hussel(stand.afleg);
        stand.afleg = [top];
      }
      if (!stand.stapel.length) return;
      stand.handen[naam].push(stand.stapel.pop());
    }
    stand.unoGezegd[naam] = false;
    if (stand.kwetsbaar === naam) stand.kwetsbaar = null;
  }

  function deel(begint, vorige) {
    const stand = {
      status: 'spel',
      stapel: nieuweStapel(),
      afleg: [],
      handen: { wout: [], davinia: [] },
      unoGezegd: { wout: false, davinia: false },
      kwetsbaar: null,
      getrokken: null,
      winnaar: null,
      begint,
      beurt: begint,
      zet: (vorige && vorige.zet) || 0,
      laatste: null,
    };
    for (let i = 0; i < START_KAARTEN; i++) ['wout', 'davinia'].forEach((n) => stand.handen[n].push(stand.stapel.pop()));
    // Eerste open kaart: een gewone cijferkaart
    let i = stand.stapel.length - 1;
    while (!/^\d$/.test(kaart(stand.stapel[i]).waarde)) i--;
    const eerste = stand.stapel.splice(i, 1)[0];
    stand.afleg.push(eerste);
    stand.kleur = kaart(eerste).kleur;
    return stand;
  }

  // Database-arrays kunnen als object of null binnenkomen: netjes maken.
  function normaal(s) {
    if (!s || s.status !== 'spel' && s.status !== 'klaar') return s;
    s.stapel = lijst(s.stapel);
    s.afleg = lijst(s.afleg);
    s.handen = { wout: lijst(s.handen && s.handen.wout), davinia: lijst(s.handen && s.handen.davinia) };
    s.unoGezegd = Object.assign({ wout: false, davinia: false }, s.unoGezegd);
    s.kwetsbaar = s.kwetsbaar || null;
    s.getrokken = s.getrokken || null;
    s.winnaar = s.winnaar || null;
    return s;
  }

  function markeer(s, soort, extra) {
    s.zet = (s.zet || 0) + 1;
    s.laatste = Object.assign({ wie: ik, soort, nr: s.zet }, extra || {});
  }

  /* ----------------------------------------------------------
     Zetten (transacties)
     ---------------------------------------------------------- */
  function zet(fn) {
    const ref = kamerRef.child('stand');
    return ref.transaction((huidig) => {
      if (huidig === null) return huidig;
      const s = normaal(huidig);
      const uit = fn(s);
      return uit === undefined ? undefined : uit;
    }).then((r) => {
      kamerRef.child('bijgewerkt').set(Online.nu()).catch(() => {});
      return r;
    }).catch((e) => {
      console.warn(e);
      api.toast('Even geen verbinding, probeer het nog eens');
    });
  }

  function speel(s0, gekozenKleur) {
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik) return undefined;
      const hand = s.handen[ik];
      const i = hand.indexOf(s0);
      if (i < 0 || !kanSpelen(s0, s)) return undefined;
      if (s.getrokken && s.getrokken !== s0) return undefined;   // na pakken alleen die kaart
      const k = kaart(s0);
      hand.splice(i, 1);
      s.afleg.push(s0);
      s.kleur = k.kleur === 'zwart' ? gekozenKleur : k.kleur;
      s.getrokken = null;
      const tegen = ander(ik);
      if (k.waarde === 'plus2') trek(s, tegen, 2);
      if (k.waarde === 'plus4') trek(s, tegen, 4);
      const nogEens = ['sla', 'keer', 'plus2', 'plus4'].includes(k.waarde);
      s.beurt = nogEens ? ik : tegen;
      // UNO-boekhouding
      if (hand.length === 1) s.kwetsbaar = s.unoGezegd[ik] ? null : ik;
      else { s.unoGezegd[ik] = false; if (s.kwetsbaar === ik) s.kwetsbaar = null; }
      if (!hand.length) { s.status = 'klaar'; s.winnaar = ik; s.kwetsbaar = null; }
      markeer(s, 'speel', { kaart: s0, kleur: s.kleur });
      return s;
    }).then((r) => {
      if (r && r.committed && r.snapshot.val() && r.snapshot.val().winnaar === ik && r.snapshot.val().laatste.wie === ik) {
        Online.telOp('uno', ik).catch(() => {});
      }
    });
  }

  function pak() {
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik || s.getrokken) return undefined;
      trek(s, ik, 1);
      const nieuw = s.handen[ik][s.handen[ik].length - 1];
      if (nieuw && kanSpelen(nieuw, s)) s.getrokken = nieuw;   // mag je meteen spelen
      else s.beurt = ander(ik);
      markeer(s, 'pak');
      return s;
    });
  }

  function pas() {
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik || !s.getrokken) return undefined;
      s.getrokken = null;
      s.beurt = ander(ik);
      markeer(s, 'pas');
      return s;
    });
  }

  function roepUno() {
    return zet((s) => {
      if (s.status !== 'spel' || s.handen[ik].length > 2 || s.unoGezegd[ik]) return undefined;
      s.unoGezegd[ik] = true;
      if (s.kwetsbaar === ik) s.kwetsbaar = null;
      markeer(s, 'uno');
      return s;
    });
  }

  function betrap() {
    return zet((s) => {
      const tegen = ander(ik);
      if (s.status !== 'spel' || s.kwetsbaar !== tegen || s.handen[tegen].length !== 1) return undefined;
      trek(s, tegen, 2);
      s.kwetsbaar = null;
      markeer(s, 'betrapt');
      return s;
    });
  }

  function nogEenPotje() {
    return zet((s) => {
      if (s.status === 'spel' && s.handen && (s.handen.wout.length || s.handen.davinia.length)) return undefined;
      return deel(ander(s.begint || ik), s);
    });
  }

  /* ----------------------------------------------------------
     Kaart tekenen
     ---------------------------------------------------------- */
  function kaartEl(s, klein) {
    const k = kaart(s);
    const e = el('div', `uno-kaart k-${k.kleur}` + (klein ? ' klein' : ''));
    e.dataset.kaart = s;
    let midden = k.waarde;
    let hoek = k.waarde;
    if (k.waarde === 'sla') { midden = '⊘'; hoek = '⊘'; }
    if (k.waarde === 'keer') { midden = '⇄'; hoek = '⇄'; }
    if (k.waarde === 'plus2') { midden = '+2'; hoek = '+2'; }
    if (k.waarde === 'plus4') { midden = '+4'; hoek = '+4'; }
    if (k.waarde === 'joker') { midden = ''; hoek = 'J'; }
    e.append(el('span', 'uno-hoek', hoek));
    const ovaal = el('span', 'uno-midden', midden);
    if (k.kleur === 'zwart') ovaal.classList.add('vierkleur');
    e.append(ovaal, el('span', 'uno-hoek onder', hoek));
    return e;
  }

  // Achterkant: zwart met een rood ovaal, en daarin W ♥ D
  function rugEl() {
    const e = el('div', 'uno-kaart rug');
    const ovaal = el('span', 'uno-rug-ovaal');
    ovaal.append(el('span', 'uno-rug-tekst', 'W♥D'));
    e.append(ovaal);
    return e;
  }

  // Een foto van ons (vast per potje, zodat hij niet verspringt bij elke zet)
  function fotoVanOns(sleutel) {
    const lijst = (api.content.fotos && api.content.fotos.memory) || [];
    if (!lijst.length) return null;
    let h = 0;
    for (const c of String(sleutel)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const img = el('img', 'uno-foto');
    img.src = lijst[h % lijst.length];
    img.alt = '';
    img.addEventListener('error', () => img.remove());
    return img;
  }

  /* ----------------------------------------------------------
     Schermen
     ---------------------------------------------------------- */
  function leeg() {
    wortel.textContent = '';
    window.scrollTo(0, 0);
  }

  function opruimen() {
    if (kamerRef && kamerLuisteraar) kamerRef.off('value', kamerLuisteraar);
    if (tellerRef && tellerLuisteraar) tellerRef.off('value', tellerLuisteraar);
    if (stopAanwezig) stopAanwezig();
    kamerRef = kamerLuisteraar = tellerRef = tellerLuisteraar = stopAanwezig = null;
    kleurKiezer = null;
    document.querySelectorAll('.uno-laag').forEach((l) => l.remove());
  }

  function toonStart() {
    opruimen();
    leeg();
    try { ik = localStorage.getItem(IK_SLEUTEL); } catch (e) { ik = null; }
    if (!NAMEN[ik]) return toonWieBenJij();

    const kaartje = el('div', 'quiz-uitslag-kaart uno-start');
    kaartje.append(
      el('h3', 'sier', 'UNO'),
      el('p', 'quiz-slot', `Samen spelen, ieder op je eigen telefoon. Je speelt als ${NAMEN[ik]}.`),
    );
    const vorig = Online.onthouden('uno');
    if (vorig && vorig.naam === ik) {
      kaartje.append(knop('knop', `Verder met ${vorig.code}`, () => meedoen(vorig.code)));
    }
    kaartje.append(
      knop(vorig ? 'knop zacht' : 'knop', 'Nieuw spel', nieuwSpel),
      knop('knop zacht', 'Meedoen met een code', toonCodeInvoer),
      knop('uno-wissel', `Ik ben niet ${NAMEN[ik]}`, toonWieBenJij),
    );
    wortel.append(kaartje);
  }

  function toonWieBenJij() {
    leeg();
    const kaartje = el('div', 'quiz-uitslag-kaart uno-start');
    kaartje.append(el('h3', 'sier', 'Wie ben jij?'), el('p', 'quiz-slot', 'Dan weet de andere telefoon wie er tegenover zit.'));
    const rij = el('div', 'wie-personen');
    ['wout', 'davinia'].forEach((n) => {
      const k = knop('wie-persoon ' + (n === 'wout' ? 'wie-ik' : 'wie-zij'), null, () => {
        ik = n;
        try { localStorage.setItem(IK_SLEUTEL, n); } catch (e) { /* niets */ }
        toonStart();
      });
      k.append(el('span', 'wie-letter', NAMEN[n][0]), el('span', 'wie-naam', NAMEN[n]));
      rij.append(k);
    });
    kaartje.append(rij);
    wortel.append(kaartje);
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

  async function nieuwSpel() {
    toonBezig('Kamer maken…');
    try {
      const c = await Online.maakKamer('uno', ik, { status: 'wacht' });
      openKamer(c);
    } catch (e) {
      console.warn(e);
      toonFout('Dat lukte niet. Heb je internet?');
    }
  }

  async function meedoen(c) {
    toonBezig('Verbinden…');
    try {
      await Online.doeMee('uno', c, ik);
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
    laatsteZet = -1;
    const { db } = await Online.start();
    kamerRef = db.ref(`kamers/${code}`);
    stopAanwezig = await Online.aanwezig(code, ik);
    tellerRef = db.ref('tellers/uno');
    tellerLuisteraar = tellerRef.on('value', (snap) => { tellers = snap.val() || {}; if (kamer) teken(); });
    kamerLuisteraar = kamerRef.on('value', (snap) => {
      kamer = snap.val();
      if (!kamer) { toonFout('Deze kamer bestaat niet meer.'); Online.onthoud('uno', null); return; }
      kamer.stand = normaal(kamer.stand || { status: 'wacht' });
      // Beide spelers er? Dan delen (wie het eerst ziet, deelt; de transactie zorgt dat het maar één keer gebeurt).
      if (kamer.stand.status === 'wacht' && kamer.spelers && kamer.spelers.wout && kamer.spelers.davinia) {
        zet((s) => (s.status === 'wacht' ? deel(Math.random() < 0.5 ? 'wout' : 'davinia') : undefined));
      }
      teken();
    }, (fout) => {
      console.warn(fout);
      toonFout('Geen toegang tot deze kamer.');
    });
  }

  /* ----------------------------------------------------------
     Tekenen van de stand
     ---------------------------------------------------------- */
  function teken() {
    const s = kamer && kamer.stand;
    if (!s) return;
    self.__unoStand = { ik, code, stand: s, online: kamer.online || {} };   // voor tests
    if (s.status === 'wacht') return tekenWacht();
    tekenSpel(s);
  }

  function tekenWacht() {
    leeg();
    const k = el('div', 'quiz-uitslag-kaart uno-start');
    k.append(
      el('h3', 'sier', 'Wachten op ' + NAMEN[ander(ik)]),
      el('p', 'quiz-slot', `Stuur deze code naar ${NAMEN[ander(ik)]}. Die kiest UNO, dan "Meedoen", en vult hem in.`),
      el('p', 'uno-code', code),
      fotoVanOns(code) || el('span'),
      el('p', 'uno-laden', '♥'),
      knop('knop zacht', 'Stoppen', () => { Online.onthoud('uno', null); toonStart(); }),
    );
    wortel.append(k);
  }

  function tekenSpel(s) {
    const tegen = ander(ik);
    const mijnHand = s.handen[ik];
    const zijnHand = s.handen[tegen];
    const mijnBeurt = s.status === 'spel' && s.beurt === ik;
    const nieuweZet = s.zet !== laatsteZet;
    const vorigeZet = laatsteZet;
    laatsteZet = s.zet;
    const online = (kamer.online || {})[tegen] === true;

    leeg();
    const scherm = el('div', 'uno-scherm' + (mijnBeurt ? ' mijn-beurt' : ''));

    // Tegenstander bovenin
    const boven = el('div', 'uno-tegen');
    const naam = el('div', 'uno-naam');
    naam.append(el('span', 'uno-stip' + (online ? ' aan' : ''), ''), el('b', '', NAMEN[tegen]), el('span', 'uno-aantal', `${zijnHand.length} ${zijnHand.length === 1 ? 'kaart' : 'kaarten'}`));
    boven.append(naam);
    const waaier = el('div', 'uno-waaier');
    zijnHand.slice(0, 12).forEach(() => waaier.append(rugEl()));
    boven.append(waaier);
    if (!online && s.status === 'spel') boven.append(el('p', 'uno-offline', `${NAMEN[tegen]} is even weg. Het spel wacht gewoon.`));
    scherm.append(boven);

    // Beurt-balk
    const balk = el('div', 'uno-beurt');
    if (s.status === 'klaar') balk.textContent = s.winnaar === ik ? 'Jij hebt gewonnen!' : `${NAMEN[s.winnaar]} heeft gewonnen`;
    else if (mijnBeurt) balk.textContent = s.getrokken ? 'Speel de kaart die je pakte, of pas' : 'Jouw beurt';
    else balk.textContent = `${NAMEN[tegen]} is aan de beurt`;
    scherm.append(balk);

    // Midden: stapel en aflegstapel
    const tafel = el('div', 'uno-tafel');
    const stapel = el('button', 'uno-stapel');
    stapel.type = 'button';
    stapel.append(rugEl(), el('span', 'uno-stapel-tekst', s.getrokken ? 'Pas' : 'Pak'));
    stapel.disabled = !mijnBeurt;
    stapel.addEventListener('click', () => (s.getrokken ? pas() : pak()));
    const top = kaartEl(s.afleg[s.afleg.length - 1]);
    top.classList.add('top');
    if (nieuweZet && vorigeZet >= 0 && s.laatste && s.laatste.soort === 'speel' && s.laatste.wie === tegen) top.classList.add('van-boven');
    if (nieuweZet && vorigeZet >= 0 && s.laatste && s.laatste.soort === 'speel' && s.laatste.wie === ik) top.classList.add('van-onder');
    const kleurBol = el('span', `uno-kleur k-${s.kleur}`, KLEURNAAM[s.kleur]);
    const afleg = el('div', 'uno-afleg');
    afleg.append(top, kleurBol);
    tafel.append(stapel, afleg);
    scherm.append(tafel);

    // Gebeurtenis-melding (wat deed de ander net?)
    if (nieuweZet && vorigeZet >= 0 && s.laatste) {
      const m = meldingVoor(s.laatste, s);
      if (m) {
        const melding = el('p', 'uno-gebeurtenis', m);
        scherm.append(melding);
      }
    }

    // Knoppen: UNO! en Betrapt!
    const knoppen = el('div', 'uno-knoppen');
    const unoKnop = knop('uno-roep', 'UNO!', roepUno);
    unoKnop.disabled = !(s.status === 'spel' && mijnHand.length <= 2 && !s.unoGezegd[ik]);
    if (s.unoGezegd[ik] && mijnHand.length <= 2) unoKnop.classList.add('gezegd');
    knoppen.append(unoKnop);
    if (s.status === 'spel' && s.kwetsbaar === tegen && zijnHand.length === 1) {
      knoppen.append(knop('uno-betrapt', 'Betrapt!', betrap));
    }
    scherm.append(knoppen);

    // Mijn hand
    const hand = el('div', 'uno-hand');
    const gesorteerd = mijnHand.slice().sort((a, b) => volgorde(a) - volgorde(b));
    gesorteerd.forEach((s0) => {
      const k = kaartEl(s0);
      const speelbaar = mijnBeurt && kanSpelen(s0, s) && (!s.getrokken || s.getrokken === s0);
      k.classList.add(speelbaar ? 'speelbaar' : 'niet');
      if (s.getrokken === s0) k.classList.add('getrokken');
      k.addEventListener('click', () => {
        if (!speelbaar) return;
        if (kaart(s0).kleur === 'zwart') kiesKleur(s0);
        else speel(s0);
      });
      hand.append(k);
    });
    scherm.append(hand);
    scherm.append(el('p', 'uno-hand-tekst', `Jij: ${mijnHand.length} ${mijnHand.length === 1 ? 'kaart' : 'kaarten'} · code ${code}`));
    wortel.append(scherm);

    if (s.status === 'klaar') tekenUitslag(s);
  }

  function volgorde(s) {
    const k = kaart(s);
    const kl = k.kleur === 'zwart' ? 4 : KLEUREN.indexOf(k.kleur);
    const w = /^\d$/.test(k.waarde) ? Number(k.waarde) : { sla: 10, keer: 11, plus2: 12, joker: 13, plus4: 14 }[k.waarde];
    return kl * 20 + w;
  }

  function meldingVoor(l, s) {
    const wie = l.wie === ik ? 'Jij' : NAMEN[l.wie];
    const k = l.kaart ? kaart(l.kaart) : null;
    if (l.soort === 'speel' && k) {
      if (k.waarde === 'plus2') return l.wie === ik ? `${NAMEN[ander(ik)]} pakt er 2` : `${wie} speelt +2: jij pakt er 2`;
      if (k.waarde === 'plus4') return l.wie === ik ? `${NAMEN[ander(ik)]} pakt er 4, kleur ${s.kleur}` : `${wie} speelt +4: jij pakt er 4, kleur ${s.kleur}`;
      if (k.waarde === 'joker') return `${wie} ${l.wie === ik ? 'kiest' : 'kiest'} ${s.kleur}`;   // Joker: kleur kiezen
      if (k.waarde === 'sla' || k.waarde === 'keer') return l.wie === ik ? 'Jij bent nog een keer' : `${wie} is nog een keer`;
      return null;
    }
    if (l.soort === 'pak' && l.wie !== ik) return `${wie} pakt een kaart`;
    if (l.soort === 'uno') return l.wie === ik ? 'UNO geroepen' : `${wie} roept UNO!`;
    if (l.soort === 'betrapt') return l.wie === ik ? `Betrapt! ${NAMEN[ander(ik)]} pakt er 2 😏` : `Betrapt! Jij vergat UNO te roepen, pak er 2 😅`;
    return null;
  }

  function kiesKleur(s0) {
    kleurKiezer = s0;
    const laag = el('div', 'uno-laag');
    const kaartje = el('div', 'uno-kleurkeuze');
    kaartje.append(el('p', 'sier', 'Welke kleur?'));
    const rij = el('div', 'uno-kleuren');
    KLEUREN.forEach((k) => rij.append(knop(`uno-kleurknop k-${k}`, KLEURNAAM[k], () => { laag.remove(); speel(s0, k); })));
    kaartje.append(rij, knop('knop zacht', 'Toch niet', () => laag.remove()));
    laag.append(kaartje);
    document.body.append(laag);
  }

  function tekenUitslag(s) {
    const gewonnen = s.winnaar === ik;
    const w = tellers.wout || 0;
    const d = tellers.davinia || 0;
    const kaartje = el('div', 'quiz-uitslag-kaart uno-uitslag');
    let tekst;
    if (s.winnaar === 'wout') tekst = gewonnen ? 'Zoals altijd 😏' : 'Wout wint, zoals altijd 😏';
    else tekst = gewonnen ? 'Ja ja, je hebt gewonnen. Deze keer 😅' : 'Davinia wint. Ik heb je laten winnen, echt 😅';
    const foto = fotoVanOns(code + ':' + s.zet);
    if (foto) kaartje.append(foto);
    kaartje.append(
      el('h3', 'sier', gewonnen ? 'Gewonnen!' : `${NAMEN[s.winnaar]} wint`),
      el('p', 'quiz-slot', tekst),
      el('p', 'uno-teller', `Wout ${w} · Davinia ${d}`),
      el('p', 'uno-teller-sub', w > d ? 'Wout wint altijd, de cijfers liegen niet 😏' : w < d ? 'Davinia staat voor. Tijdelijk 😅' : 'Gelijkspel. Spannend 😏'),
      knop('knop', 'Nog een potje', nogEenPotje),
      knop('knop zacht', 'Stoppen', () => { Online.onthoud('uno', null); api.terug(); }),
    );
    wortel.append(kaartje);
    requestAnimationFrame(() => kaartje.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Aanmelden
     ---------------------------------------------------------- */
  Spellen.registreer({
    id: 'uno',
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      if (!self.Online) { toonFout('De online verbinding kon niet laden.'); return; }
      toonStart();
    },
    stop() {
      opruimen();
    },
  });
})();
