/*
  SPEL: RUMMIKUB (online, ieder op de eigen telefoon)
  ------------------------------------------------------------
  106 stenen: 1-13 in rood, blauw, zwart en oranje (elk twee keer) + 2 jokers.
  Ieder begint met 14 stenen. Officiële regels:
  - Combinaties van minimaal 3: groep (zelfde getal, verschillende kleuren)
    of reeks (zelfde kleur, opeenvolgend; 1 komt niet na 13).
  - Eerste uitleg: minimaal 30 punten, alleen eigen stenen, tafel nog niet ombouwen.
  - Daarna mag je de tafel vrij ombouwen, zolang aan het eind alles geldig is
    en je minstens één eigen steen hebt gelegd.
  - Niets leggen: pak een steen (beurt voorbij).
  - Joker: telt als de steen die hij vervangt. Een joker van tafel mag je
    gebruiken bij het ombouwen, maar hij moet op tafel blijven (net als in
    de officiële app: stenen van tafel kunnen nooit terug naar je rekje).
  - Winnaar: wie als eerste geen stenen meer heeft. Pot leeg: laagste
    puntenwaarde op het rekje wint (joker = 30).
  - Timer per beurt (uit, 1 of 2 minuten). Tijd op: beurt terugzetten + steen pakken.

  Tijdens je beurt werk je in een concept (stand.concept), dat de ander live
  ziet. Pas bij "Klaar" wordt het via een transactie de echte stand.
*/
(function () {
  'use strict';

  const KLEUREN = ['r', 'b', 'z', 'o'];               // rood, blauw, zwart, oranje
  const KLEURNAAM = { r: 'rood', b: 'blauw', z: 'zwart', o: 'oranje' };
  const NAMEN = { wout: 'Wout', davinia: 'Davinia' };
  const START_STENEN = 14;
  const EERSTE_UITLEG = 30;
  const JOKER_WAARDE = 30;
  const IK_SLEUTEL = 'jubileum.ik';
  const SPEL = 'rummikub';

  let api = null;
  let wortel = null;
  let ik = null;
  let code = null;
  let kamerRef = null;
  let kamerLuisteraar = null;
  let stopAanwezig = null;
  let tellerRef = null;
  let tellerLuisteraar = null;
  let tellers = {};
  let kamer = null;
  let tijdOffset = 0;
  let klokTimer = null;

  // Beurt-concept (alleen tijdens je eigen beurt)
  let begin = null;        // { tafel, rek, zet } bij het begin van je beurt
  let concept = null;      // { tafel, rek }
  let gekozen = null;      // aangetikte steen { id, van }
  let sortering = null;    // 'kleur' | 'getal' | null
  let conceptTimer = null;
  let tijdOpBezig = false;
  let sleep = null;

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
  const ander = (n) => (n === 'wout' ? 'davinia' : 'wout');
  const lijst = (x) => (Array.isArray(x) ? x.filter((v) => v != null) : x ? Object.values(x).filter((v) => v != null) : []);
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  const nu = () => Date.now() + tijdOffset;

  /* ----------------------------------------------------------
     Stenen: "r-7-a" (kleur-getal-exemplaar), jokers "J-0-a" en "J-0-b"
     ---------------------------------------------------------- */
  function steen(id) {
    const [k, w] = String(id).split('-');
    return k === 'J' ? { id, joker: true } : { id, k, w: Number(w) };
  }

  function nieuwePot() {
    const pot = [];
    KLEUREN.forEach((k) => { for (let w = 1; w <= 13; w++) ['a', 'b'].forEach((c) => pot.push(`${k}-${w}-${c}`)); });
    pot.push('J-0-a', 'J-0-b');
    return hussel(pot);
  }

  // Een combinatie bekijken: geldig?, soort, en de stenen in een logische volgorde
  // met de waarde die elke steen (ook een joker) vertegenwoordigt.
  function bekijk(ids) {
    const stenen = ids.map(steen);
    const jokers = stenen.filter((s) => s.joker);
    const gewoon = stenen.filter((s) => !s.joker).sort((a, b) => a.w - b.w || KLEUREN.indexOf(a.k) - KLEUREN.indexOf(b.k));
    const standaard = { geldig: false, soort: null, orde: gewoon.map((s) => s.id).concat(jokers.map((s) => s.id)), waarden: null };
    if (!stenen.length) return standaard;

    // Reeks?
    const kleuren = new Set(gewoon.map((s) => s.k));
    const getallen = gewoon.map((s) => s.w);
    let reeks = null;
    if (gewoon.length && kleuren.size === 1 && new Set(getallen).size === getallen.length) {
      const min = getallen[0];
      const max = getallen[getallen.length - 1];
      const gaten = max - min + 1 - gewoon.length;
      if (gaten <= jokers.length && stenen.length <= 13) {
        const orde = [];
        const waarden = [];
        const vrij = jokers.slice();
        for (let w = min; w <= max; w++) {
          const s = gewoon.find((x) => x.w === w);
          if (s) { orde.push(s.id); waarden.push(w); } else { orde.push(vrij.shift().id); waarden.push(w); }
        }
        let hoog = max, laag = min;
        while (vrij.length) {
          if (hoog < 13) { hoog++; orde.push(vrij.shift().id); waarden.push(hoog); }
          else if (laag > 1) { laag--; orde.unshift(vrij.shift().id); waarden.unshift(laag); }
          else break;
        }
        if (!vrij.length) reeks = { orde, waarden };
      }
    }
    // Groep?
    let groep = null;
    if (gewoon.length && new Set(getallen).size === 1 && kleuren.size === gewoon.length && stenen.length <= 4) {
      const w = getallen[0];
      groep = { orde: gewoon.sort((a, b) => KLEUREN.indexOf(a.k) - KLEUREN.indexOf(b.k)).map((s) => s.id).concat(jokers.map((s) => s.id)), waarden: stenen.map(() => w) };
    }
    if (!gewoon.length && jokers.length) reeks = { orde: jokers.map((s) => s.id), waarden: jokers.map((_, i) => i + 1) };

    const keuze = reeks || groep;
    if (!keuze) return standaard;
    return { geldig: stenen.length >= 3, soort: reeks ? 'reeks' : 'groep', orde: keuze.orde, waarden: keuze.waarden };
  }

  const punten = (ids) => { const b = bekijk(ids); return b.waarden ? b.waarden.reduce((s, w) => s + w, 0) : 0; };
  const rekWaarde = (ids) => ids.reduce((s, id) => s + (steen(id).joker ? JOKER_WAARDE : steen(id).w), 0);
  const sleutelVan = (set) => set.slice().sort().join(',');

  // Mag deze beurt zo? Geeft null (ja) of een uitleg (nee).
  function beurtFout(start, c, uitgelegd) {
    const gelegd = start.rek.filter((id) => !c.rek.includes(id));
    if (c.tafel.some((set) => !bekijk(set).geldig)) return 'Er ligt nog een ongeldige combinatie';
    if (!gelegd.length) return 'Leg minstens één eigen steen, of pak een steen';
    if (!uitgelegd) {
      const startSets = new Set(start.tafel.map(sleutelVan));
      const conceptSets = c.tafel.map(sleutelVan);
      if ([...startSets].some((k) => !conceptSets.includes(k))) return 'Bij je eerste uitleg mag je de tafel nog niet ombouwen';
      const nieuw = c.tafel.filter((set) => !startSets.has(sleutelVan(set)));
      if (nieuw.some((set) => set.some((id) => !gelegd.includes(id)))) return 'Bij je eerste uitleg mag je de tafel nog niet ombouwen';
      const totaal = nieuw.reduce((s, set) => s + punten(set), 0);
      if (totaal < EERSTE_UITLEG) return `Je eerste uitleg moet minstens ${EERSTE_UITLEG} punten zijn (nu ${totaal})`;
    }
    return null;
  }

  /* ----------------------------------------------------------
     Database
     ---------------------------------------------------------- */
  function normaal(s) {
    if (!s || (s.status !== 'spel' && s.status !== 'klaar')) return s;
    s.pot = lijst(s.pot);
    s.tafel = lijst(s.tafel).map(lijst).filter((set) => set.length);
    s.rekjes = { wout: lijst(s.rekjes && s.rekjes.wout), davinia: lijst(s.rekjes && s.rekjes.davinia) };
    s.uitgelegd = Object.assign({ wout: false, davinia: false }, s.uitgelegd);
    if (s.concept) {
      s.concept.tafel = lijst(s.concept.tafel).map(lijst);
      s.concept.rek = lijst(s.concept.rek);
    }
    return s;
  }

  function deel(begint, timer, vorige) {
    const s = {
      status: 'spel',
      pot: nieuwePot(),
      tafel: [],
      rekjes: { wout: [], davinia: [] },
      uitgelegd: { wout: false, davinia: false },
      begint,
      beurt: begint,
      beurtStart: firebase.database.ServerValue.TIMESTAMP,
      timer: timer || 0,
      zet: (vorige && vorige.zet) || 0,
      laatste: null,
      winnaar: null,
      concept: null,
    };
    for (let i = 0; i < START_STENEN; i++) ['wout', 'davinia'].forEach((n) => s.rekjes[n].push(s.pot.pop()));
    return s;
  }

  function markeer(s, soort, extra) {
    s.zet = (s.zet || 0) + 1;
    s.laatste = Object.assign({ wie: ik, soort, nr: s.zet }, extra || {});
    s.beurtStart = firebase.database.ServerValue.TIMESTAMP;
    s.concept = null;
  }

  function zet(fn) {
    return kamerRef.child('stand').transaction((huidig) => {
      if (huidig === null) return huidig;
      const uit = fn(normaal(huidig));
      return uit === undefined ? undefined : uit;
    }).then((r) => {
      kamerRef.child('bijgewerkt').set(Online.nu()).catch(() => {});
      return r;
    }).catch((e) => {
      console.warn(e);
      api.toast('Even geen verbinding, probeer het nog eens');
    });
  }

  // Pot leeg: laagste rekwaarde wint
  function eindigOpPunten(s) {
    const w = rekWaarde(s.rekjes.wout);
    const d = rekWaarde(s.rekjes.davinia);
    s.status = 'klaar';
    s.winnaar = w === d ? 'gelijk' : w < d ? 'wout' : 'davinia';
    s.potLeeg = { wout: w, davinia: d };
  }

  function pak(reden) {
    const startZet = begin ? begin.zet : null;
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik) return undefined;
      if (startZet != null && s.zet !== startZet) return undefined;
      if (!s.pot.length) { eindigOpPunten(s); markeer(s, 'potleeg'); return s; }
      s.rekjes[ik].push(s.pot.pop());
      s.beurt = ander(ik);
      markeer(s, reden || 'pak');
      return s;
    }).then((r) => afgerond(r));
  }

  function klaar() {
    if (!concept || !begin) return;
    const fout = beurtFout(begin, concept, kamer.stand.uitgelegd[ik]);
    if (fout) { api.toast(fout); return; }
    const c = kopie(concept);
    const startZet = begin.zet;
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik || s.zet !== startZet) return undefined;
      s.tafel = c.tafel.map((set) => bekijk(set).orde);
      s.rekjes[ik] = c.rek;
      s.uitgelegd[ik] = true;
      const gelegd = s.rekjes[ik].length;
      if (!gelegd) { s.status = 'klaar'; s.winnaar = ik; }
      else s.beurt = ander(ik);
      markeer(s, 'leg', { aantal: begin.rek.length - c.rek.length });
      return s;
    }).then((r) => afgerond(r));
  }

  function afgerond(r) {
    if (!r || !r.committed) return;
    const s = r.snapshot.val();
    if (s && s.status === 'klaar' && s.winnaar === ik && s.laatste && s.laatste.wie === ik) Online.telOp(SPEL, ik).catch(() => {});
  }

  // Tijd op bij de ander, en die reageert niet (app dicht): dan pakt de ander alsnog een steen.
  let geforceerdBij = -1;
  function forceerTijdOp() {
    const s = kamer.stand;
    if (geforceerdBij === s.zet) return;
    geforceerdBij = s.zet;
    const tegen = ander(ik);
    const startZet = s.zet;
    return zet((x) => {
      if (x.status !== 'spel' || x.beurt !== tegen || x.zet !== startZet || !x.timer) return undefined;
      if (nu() - x.beurtStart < x.timer * 1000 + 8000) return undefined;
      if (!x.pot.length) { eindigOpPunten(x); } else { x.rekjes[tegen].push(x.pot.pop()); x.beurt = ik; }
      x.zet = (x.zet || 0) + 1;
      x.laatste = { wie: tegen, soort: 'tijdop', nr: x.zet };
      x.beurtStart = firebase.database.ServerValue.TIMESTAMP;
      x.concept = null;
      return x;
    });
  }

  function nogEenPotje() {
    return zet((s) => {
      if (s.status !== 'klaar') return undefined;
      return deel(ander(s.begint || ik), s.timer, s);
    });
  }

  // Concept live delen (de ander kijkt mee)
  function deelConcept() {
    clearTimeout(conceptTimer);
    conceptTimer = setTimeout(() => {
      if (!kamerRef || !concept) return;
      kamerRef.child('stand/concept').set({ wie: ik, zet: begin.zet, tafel: concept.tafel, rek: concept.rek }).catch(() => {});
    }, 120);
  }

  /* ----------------------------------------------------------
     Verplaatsen van stenen (tijdens je beurt)
     van/naar: 'rek' | { set: i } | 'nieuw'
     ---------------------------------------------------------- */
  function isVast(setIndex) {
    // Vóór je eerste uitleg zijn de sets die al op tafel lagen op slot.
    if (kamer.stand.uitgelegd[ik]) return false;
    const set = concept.tafel[setIndex];
    return begin.tafel.some((b) => sleutelVan(b) === sleutelVan(set));
  }

  function magVerplaatsen(id, van, naar) {
    if (van !== 'rek' && isVast(van.set)) return 'Eerst je eigen uitleg van 30 punten';
    if (naar !== 'rek' && naar !== 'nieuw' && isVast(naar.set)) return 'Eerst je eigen uitleg van 30 punten';
    if (naar === 'rek' && van !== 'rek' && !begin.rek.includes(id)) return 'Stenen van tafel kunnen niet terug naar je rekje';
    return null;
  }

  function verplaats(id, van, naar) {
    if (!concept) return;
    if (van !== 'rek' && naar !== 'rek' && naar !== 'nieuw' && van.set === naar.set) return;
    const fout = magVerplaatsen(id, van, naar);
    if (fout) { api.toast(fout); return; }
    // Weghalen
    if (van === 'rek') concept.rek = concept.rek.filter((x) => x !== id);
    else concept.tafel[van.set] = concept.tafel[van.set].filter((x) => x !== id);
    // Neerleggen
    if (naar === 'rek') concept.rek.push(id);
    else if (naar === 'nieuw') concept.tafel.push([id]);
    else concept.tafel[naar.set].push(id);
    // Lege sets weg, sets in logische volgorde
    concept.tafel = concept.tafel.filter((set) => set.length).map((set) => bekijk(set).orde);
    gekozen = null;
    deelConcept();
    teken();
  }

  function herstel() {
    if (!begin) return;
    concept = { tafel: kopie(begin.tafel), rek: kopie(begin.rek) };
    gekozen = null;
    deelConcept();
    teken();
  }

  /* ----------------------------------------------------------
     Slepen en tikken
     ---------------------------------------------------------- */
  function plekVan(e) {
    const doel = e && e.closest && e.closest('[data-plek]');
    if (!doel) return null;
    const p = doel.dataset.plek;
    if (p === 'rek' || p === 'nieuw') return p;
    return { set: Number(p) };
  }

  function steenDown(e, id, van) {
    if (!concept) return;
    e.preventDefault();
    const tegel = e.currentTarget;
    sleep = { id, van, x0: e.clientX, y0: e.clientY, tegel, zweef: null, pid: e.pointerId };
    try { tegel.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
  }

  function steenMove(e) {
    if (!sleep || e.pointerId !== sleep.pid) return;
    const dx = e.clientX - sleep.x0, dy = e.clientY - sleep.y0;
    if (!sleep.zweef && Math.hypot(dx, dy) > 8) {
      sleep.zweef = steenEl(sleep.id, 'zweef');
      document.body.append(sleep.zweef);
      sleep.tegel.classList.add('opgepakt');
    }
    if (sleep.zweef) {
      // De steen zweeft boven de vinger, zodat je ziet waar hij komt
      sleep.zweef.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 80}px)`;
      document.querySelectorAll('.rk-doel').forEach((x) => x.classList.remove('rk-doel'));
      const onder = document.elementFromPoint(e.clientX, e.clientY - 56);
      const plek = onder && onder.closest('[data-plek]');
      if (plek) plek.classList.add('rk-doel');
    }
  }

  function steenUp(e) {
    if (!sleep || e.pointerId !== sleep.pid) return;
    const s = sleep;
    sleep = null;
    document.querySelectorAll('.rk-doel').forEach((x) => x.classList.remove('rk-doel'));
    if (s.zweef) {
      s.zweef.remove();
      s.tegel.classList.remove('opgepakt');
      const naar = plekVan(document.elementFromPoint(e.clientX, e.clientY - 56));
      if (naar) verplaats(s.id, s.van, naar);
    } else if (gekozen && gekozen.id !== s.id && JSON.stringify(gekozen.van) !== JSON.stringify(s.van)) {
      // Tik op een steen ergens anders terwijl je er al een gekozen had: daarheen verplaatsen
      verplaats(gekozen.id, gekozen.van, s.van);
    } else {
      // Tik: steen kiezen (of weer loslaten)
      gekozen = gekozen && gekozen.id === s.id ? null : { id: s.id, van: s.van };
      teken();
    }
  }

  function plekTik(e) {
    if (!gekozen || !concept) return;
    if (e.target.closest('.rk-steen')) return;   // tik op een steen zelf: dat regelt steenUp
    const naar = plekVan(e.target);
    if (naar) verplaats(gekozen.id, gekozen.van, naar);
  }

  /* ----------------------------------------------------------
     Tekenen
     ---------------------------------------------------------- */
  function steenEl(id, extra) {
    const s = steen(id);
    const e = el('div', 'rk-steen' + (extra ? ' ' + extra : ''));
    e.dataset.id = id;
    if (s.joker) {
      e.classList.add('joker');
      e.append(el('span', 'rk-getal', 'J'), el('span', 'rk-hart', '♥'));
    } else {
      e.classList.add('k-' + s.k);
      e.append(el('span', 'rk-getal', String(s.w)), el('span', 'rk-stip'));
    }
    return e;
  }

  function leeg() { wortel.textContent = ''; window.scrollTo(0, 0); }

  function opruimen() {
    if (kamerRef && kamerLuisteraar) kamerRef.off('value', kamerLuisteraar);
    if (tellerRef && tellerLuisteraar) tellerRef.off('value', tellerLuisteraar);
    if (stopAanwezig) stopAanwezig();
    clearInterval(klokTimer);
    clearTimeout(conceptTimer);
    kamerRef = kamerLuisteraar = tellerRef = tellerLuisteraar = stopAanwezig = null;
    begin = concept = gekozen = null;
    document.querySelectorAll('.rk-steen.zweef').forEach((z) => z.remove());
  }

  function teken() {
    const s = kamer && kamer.stand;
    if (!s) return;
    self.__rkStand = { ik, code, stand: s, begin, concept };   // voor tests
    if (s.status === 'wacht') return tekenWacht();
    tekenSpel(s);
  }

  function fotoVanOns(sleutel) {
    const l = (api.content.fotos && api.content.fotos.memory) || [];
    if (!l.length) return null;
    let h = 0;
    for (const c of String(sleutel)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const img = el('img', 'uno-foto');
    img.src = l[(h + 3) % l.length];
    img.alt = '';
    img.addEventListener('error', () => img.remove());
    return img;
  }

  function tekenWacht() {
    leeg();
    const k = el('div', 'quiz-uitslag-kaart uno-start');
    const t = kamer.stand.timer;
    k.append(
      el('h3', 'sier', 'Wachten op ' + NAMEN[ander(ik)]),
      el('p', 'quiz-slot', `Stuur deze code naar ${NAMEN[ander(ik)]}. Die kiest Rummikub, dan "Meedoen", en vult hem in.`),
      el('p', 'uno-code', code),
      el('p', 'rk-timerinfo', t ? `Timer: ${t / 60} ${t === 60 ? 'minuut' : 'minuten'} per beurt` : 'Zonder timer'),
      fotoVanOns(code) || el('span'),
      el('p', 'uno-laden', '♥'),
      knop('knop zacht', 'Stoppen', () => { Online.onthoud(SPEL, null); toonStart(); }),
    );
    wortel.append(k);
  }

  function tekenSpel(s) {
    const tegen = ander(ik);
    const mijnBeurt = s.status === 'spel' && s.beurt === ik;

    // Begin van mijn beurt vastleggen (of herstellen na herladen)
    if (mijnBeurt && (!begin || begin.zet !== s.zet)) {
      begin = { tafel: kopie(s.tafel), rek: kopie(s.rekjes[ik]), zet: s.zet };
      const c = s.concept;
      concept = c && c.wie === ik && c.zet === s.zet ? { tafel: kopie(c.tafel).filter((x) => x.length), rek: kopie(c.rek) } : { tafel: kopie(s.tafel), rek: kopie(s.rekjes[ik]) };
      gekozen = null;
      tijdOpBezig = false;
    }
    if (!mijnBeurt) { begin = null; concept = null; gekozen = null; }

    const online = (kamer.online || {})[tegen] === true;
    const tafel = mijnBeurt ? concept.tafel : (s.concept && s.concept.wie === tegen && s.concept.zet === s.zet ? s.concept.tafel : s.tafel);
    const rek = mijnBeurt ? concept.rek : s.rekjes[ik];
    const tegenAantal = !mijnBeurt && s.concept && s.concept.wie === tegen && s.concept.zet === s.zet ? s.concept.rek.length : s.rekjes[tegen].length;

    leeg();
    const scherm = el('div', 'rk-scherm' + (mijnBeurt ? ' mijn-beurt' : ''));

    // Bovenbalk
    const boven = el('div', 'uno-tegen rk-boven');
    const naam = el('div', 'uno-naam');
    naam.append(el('span', 'uno-stip' + (online ? ' aan' : ''), ''), el('b', '', NAMEN[tegen]), el('span', 'uno-aantal', `${tegenAantal} ${tegenAantal === 1 ? 'steen' : 'stenen'}`));
    boven.append(naam);
    const info = el('div', 'rk-info');
    info.append(el('span', '', `Pot: ${s.pot.length}`));
    const klok = el('span', 'rk-klok');
    info.append(klok);
    boven.append(info);
    if (!online && s.status === 'spel') boven.append(el('p', 'uno-offline', `${NAMEN[tegen]} is even weg. Het spel wacht gewoon.`));
    scherm.append(boven);

    // Beurt-balk
    const balk = el('div', 'uno-beurt');
    if (s.status === 'klaar') balk.textContent = s.winnaar === 'gelijk' ? 'Gelijkspel' : s.winnaar === ik ? 'Jij hebt gewonnen!' : `${NAMEN[s.winnaar]} heeft gewonnen`;
    else if (mijnBeurt) balk.textContent = s.uitgelegd[ik] ? 'Jouw beurt' : `Jouw beurt · eerste uitleg: minstens ${EERSTE_UITLEG} punten`;
    else balk.textContent = `${NAMEN[tegen]} is aan de beurt`;
    scherm.append(balk);

    // Laatste gebeurtenis
    if (s.status === 'spel' && s.laatste && s.laatste.wie === tegen) {
      const m = meldingVoor(s.laatste);
      if (m) scherm.append(el('p', 'uno-gebeurtenis', m));
    }

    // Tafel
    const tafelEl = el('div', 'rk-tafel');
    tafel.forEach((set, i) => {
      const b = bekijk(set);
      const setEl = el('div', 'rk-set' + (b.geldig ? '' : ' ongeldig'));
      setEl.dataset.plek = String(i);
      if (mijnBeurt && isVast(i)) setEl.classList.add('vast');
      b.orde.forEach((id) => {
        const t = steenEl(id, gekozen && gekozen.id === id ? 'gekozen' : '');
        if (mijnBeurt && !isVast(i)) koppelSteen(t, id, { set: i });
        setEl.append(t);
      });
      tafelEl.append(setEl);
    });
    if (mijnBeurt) {
      const nieuw = el('div', 'rk-set rk-nieuw', '+ nieuwe combinatie');
      nieuw.dataset.plek = 'nieuw';
      tafelEl.append(nieuw);
    } else if (!tafel.length) {
      tafelEl.append(el('p', 'rk-leeg', 'Nog niets op tafel'));
    }
    tafelEl.addEventListener('click', plekTik);
    scherm.append(tafelEl);

    // Knoppen
    if (mijnBeurt) {
      const fout = beurtFout(begin, concept, s.uitgelegd[ik]);
      const veranderd = JSON.stringify(concept.tafel) !== JSON.stringify(begin.tafel) || concept.rek.length !== begin.rek.length;
      const status = el('p', 'rk-status' + (fout && veranderd ? ' fout' : ''), veranderd ? (fout || 'Alles klopt. Tik op Klaar.') : 'Sleep stenen naar de tafel, of pak een steen');
      scherm.append(status);
      const knoppen = el('div', 'rk-knoppen');
      knoppen.append(
        knop('rk-knop', 'Herstel', herstel),
        knop('rk-knop', 'Pak steen', () => pak()),
      );
      const klaarKnop = knop('rk-knop klaar', 'Klaar', klaar);
      klaarKnop.disabled = Boolean(fout);
      knoppen.append(klaarKnop);
      knoppen.querySelectorAll('button')[0].disabled = !veranderd;
      knoppen.querySelectorAll('button')[1].disabled = veranderd;
      scherm.append(knoppen);
    }

    // Rekje
    const rekKop = el('div', 'rk-rekkop');
    rekKop.append(el('span', '', `Jouw rekje · ${rek.length}`), knop('rk-sorteer' + (sortering === 'kleur' ? ' aan' : ''), 'Kleur', () => { sortering = 'kleur'; teken(); }), knop('rk-sorteer' + (sortering === 'getal' ? ' aan' : ''), 'Getal', () => { sortering = 'getal'; teken(); }));
    scherm.append(rekKop);
    const rekEl = el('div', 'rk-rek');
    rekEl.dataset.plek = 'rek';
    gesorteerd(rek).forEach((id) => {
      const t = steenEl(id, gekozen && gekozen.id === id ? 'gekozen' : '');
      if (mijnBeurt) koppelSteen(t, id, 'rek');
      rekEl.append(t);
    });
    rekEl.addEventListener('click', plekTik);
    scherm.append(rekEl);
    scherm.append(el('p', 'uno-hand-tekst', `code ${code}`));
    wortel.append(scherm);

    // Klok
    clearInterval(klokTimer);
    const tik = () => {
      if (!s.timer || s.status !== 'spel') { klok.textContent = ''; return; }
      const over = Math.max(0, Math.ceil((s.beurtStart + s.timer * 1000 - nu()) / 1000));
      klok.textContent = `⏱ ${Math.floor(over / 60)}:${String(over % 60).padStart(2, '0')}`;
      klok.classList.toggle('bijna', over <= 10);
      if (over <= 0 && mijnBeurt && !tijdOpBezig) {
        tijdOpBezig = true;
        api.toast('Tijd op! Je beurt wordt teruggezet en je pakt een steen');
        herstel();
        pak('tijdop');
      }
      if (!mijnBeurt && nu() - s.beurtStart > s.timer * 1000 + 8000) forceerTijdOp();
    };
    tik();
    klokTimer = setInterval(tik, 500);

    if (s.status === 'klaar') tekenUitslag(s);
  }

  function koppelSteen(t, id, van) {
    t.addEventListener('pointerdown', (e) => steenDown(e, id, van));
    t.addEventListener('pointermove', steenMove);
    t.addEventListener('pointerup', steenUp);
    t.addEventListener('pointercancel', steenUp);
  }

  function gesorteerd(rek) {
    const r = rek.slice();
    const kl = (id) => { const s = steen(id); return s.joker ? 9 : KLEUREN.indexOf(s.k); };
    const w = (id) => { const s = steen(id); return s.joker ? 99 : s.w; };
    if (sortering === 'kleur') r.sort((a, b) => kl(a) - kl(b) || w(a) - w(b));
    if (sortering === 'getal') r.sort((a, b) => w(a) - w(b) || kl(a) - kl(b));
    return r;
  }

  function meldingVoor(l) {
    const wie = NAMEN[l.wie];
    if (l.soort === 'leg') return `${wie} legde ${l.aantal} ${l.aantal === 1 ? 'steen' : 'stenen'}`;
    if (l.soort === 'pak') return `${wie} pakte een steen`;
    if (l.soort === 'tijdop') return `${wie} was te laat en pakte een steen 😏`;
    return null;
  }

  function tekenUitslag(s) {
    const w = tellers.wout || 0;
    const d = tellers.davinia || 0;
    const kaartje = el('div', 'quiz-uitslag-kaart uno-uitslag');
    const foto = fotoVanOns(code + ':' + s.zet);
    if (foto) kaartje.append(foto);
    let titel, tekst;
    if (s.winnaar === 'gelijk') { titel = 'Gelijkspel'; tekst = 'Pot leeg en precies even veel punten. Dat had ik niet zien aankomen 😅'; }
    else if (s.winnaar === ik) { titel = 'Gewonnen!'; tekst = ik === 'wout' ? 'Zoals altijd 😏' : 'Ja ja, je hebt gewonnen. Deze keer 😅'; }
    else { titel = `${NAMEN[s.winnaar]} wint`; tekst = s.winnaar === 'wout' ? 'Volgende keer beter 😏' : 'Davinia wint. Ik heb je laten winnen, echt 😅'; }
    kaartje.append(el('h3', 'sier', titel), el('p', 'quiz-slot', tekst));
    if (s.potLeeg) kaartje.append(el('p', 'rk-potleeg', `Pot leeg · punten op het rekje: Wout ${s.potLeeg.wout}, Davinia ${s.potLeeg.davinia}`));
    kaartje.append(
      el('p', 'uno-teller', `Wout ${w} · Davinia ${d}`),
      el('p', 'uno-teller-sub', w > d ? 'Wout staat voor, ook met stenen 😏' : w < d ? 'Davinia staat voor. Tijdelijk 😅' : 'Gelijkspel. Spannend 😏'),
      knop('knop', 'Nog een potje', nogEenPotje),
      knop('knop zacht', 'Stoppen', () => { Online.onthoud(SPEL, null); api.terug(); }),
    );
    wortel.append(kaartje);
    requestAnimationFrame(() => kaartje.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  /* ----------------------------------------------------------
     Start, meedoen, kamer openen
     ---------------------------------------------------------- */
  function toonStart() {
    opruimen();
    leeg();
    try { ik = localStorage.getItem(IK_SLEUTEL); } catch (e) { ik = null; }
    if (!NAMEN[ik]) return toonWieBenJij();
    const k = el('div', 'quiz-uitslag-kaart uno-start');
    k.append(el('h3', 'sier', 'Rummikub'), el('p', 'quiz-slot', `Samen spelen, ieder op je eigen telefoon. Je speelt als ${NAMEN[ik]}.`));
    const vorig = Online.onthouden(SPEL);
    if (vorig && vorig.naam === ik) k.append(knop('knop', `Verder met ${vorig.code}`, () => meedoen(vorig.code)));
    k.append(
      knop(vorig ? 'knop zacht' : 'knop', 'Nieuw spel', toonTimerKeuze),
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

  function toonTimerKeuze() {
    leeg();
    const k = el('div', 'quiz-uitslag-kaart uno-start');
    k.append(el('h3', 'sier', 'Timer per beurt?'), el('p', 'quiz-slot', 'Is de tijd op, dan wordt je beurt teruggezet en pak je een steen.'));
    [[0, 'Geen timer'], [60, '1 minuut'], [120, '2 minuten']].forEach(([t, tekst], i) => k.append(knop(i === 0 ? 'knop' : 'knop zacht', tekst, () => nieuwSpel(t))));
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

  async function nieuwSpel(timer) {
    toonBezig('Kamer maken…');
    try {
      const c = await Online.maakKamer(SPEL, ik, { status: 'wacht', timer });
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
    const { db } = await Online.start();
    db.ref('.info/serverTimeOffset').once('value').then((s) => { tijdOffset = s.val() || 0; });
    kamerRef = db.ref(`kamers/${code}`);
    stopAanwezig = await Online.aanwezig(code, ik);
    tellerRef = db.ref(`tellers/${SPEL}`);
    tellerLuisteraar = tellerRef.on('value', (snap) => { tellers = snap.val() || {}; if (kamer && kamer.stand && kamer.stand.status === 'klaar') teken(); });
    kamerLuisteraar = kamerRef.on('value', (snap) => {
      kamer = snap.val();
      if (!kamer) { toonFout('Deze kamer bestaat niet meer.'); Online.onthoud(SPEL, null); return; }
      if (kamer.spel && kamer.spel !== SPEL) { toonFout('Deze code is van een ander spel.'); return; }
      kamer.stand = normaal(kamer.stand || { status: 'wacht' });
      if (kamer.stand.status === 'wacht' && kamer.spelers && kamer.spelers.wout && kamer.spelers.davinia) {
        const timer = kamer.stand.timer || 0;
        zet((s) => (s.status === 'wacht' ? deel(Math.random() < 0.5 ? 'wout' : 'davinia', timer) : undefined));
      }
      if (sleep) return;   // niet opnieuw tekenen midden in het slepen
      teken();
    }, (fout) => {
      console.warn(fout);
      toonFout('Geen toegang tot deze kamer.');
    });
  }

  Spellen.registreer({
    id: SPEL,
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

  // Voor tests: de regels los kunnen controleren
  self.__rkRegels = { bekijk, beurtFout, punten };
})();
