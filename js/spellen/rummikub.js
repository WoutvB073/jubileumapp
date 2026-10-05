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

  Bediening (zoals de officiële app):
  - slepen of tikken (steen, dan plek); lang indrukken = meerdere stenen kiezen
  - 789 / 777: slim sorteren, combinaties uit je rekje vooraan en gemarkeerd
    (tik op zo'n combinatie = alle stenen ervan kiezen)
  - rekje vrij herschikken door te slepen; de volgorde blijft bewaard
  - Ongedaan (laatste zet) en Herstel (hele beurt)
  - tafel: knijpen = zoomen, vegen = schuiven
*/
(function () {
  'use strict';

  const KLEUREN = ['r', 'b', 'z', 'o'];               // rood, blauw, zwart, oranje
  const NAMEN = { wout: 'Wout', davinia: 'Davinia' };
  const START_STENEN = 14;
  const EERSTE_UITLEG = 30;
  const JOKER_WAARDE = 30;
  const IK_SLEUTEL = 'jubileum.ik';
  const REK_SLEUTEL = 'jubileum.rummikub.rek';
  const SPEL = 'rummikub';
  const LANG_DRUKKEN = 380;      // ms
  const OPLICHTEN = 4500;        // ms
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 1.8;
  const ZOOM_AUTO = 1.2;      // bij weinig stenen iets groter

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
  let lichtTimer = null;

  // Beurt-concept (alleen tijdens je eigen beurt)
  let begin = null;        // { tafel, rek, zet } bij het begin van je beurt
  let concept = null;      // { tafel, rek }
  let geschiedenis = [];   // eerdere concepten (voor Ongedaan)
  let selectie = [];       // gekozen stenen (ids)
  let multi = false;       // kiezen-modus (lang indrukken of combinatie aangetikt)
  let conceptTimer = null;
  let tijdOpBezig = false;

  // Rekje (alleen op deze telefoon)
  let rekOrde = [];        // volgorde van de stenen
  let rekCombos = [];      // combinaties van slim sorteren
  let sortering = null;    // 'reeks' | 'groep' | null
  let rekPotje = null;     // bij welk potje deze volgorde hoort (steen-ids zijn elk potje hetzelfde)
  let rekLijst = [];       // zoals nu getoond
  const nieuwOpRek = {};   // id -> tot wanneer oplichten
  let lichtZet = -1;       // stenen die de ander net legde/verschoof
  let lichtTot = 0;
  let beurtPop = -1;       // de beurt-balk wipt alleen bij het begin van je beurt

  // Vinger-gebaren
  let druk = null;         // steen ingedrukt of aan het slepen
  let pan = null;          // tafel schuiven
  let knijp = null;        // tafel zoomen
  let uitgesteld = false;  // tekenen na het gebaar
  let zoom = 1;
  let zoomHandmatig = false;
  let tafelY = 0;
  let tafelEls = null;     // { venster, vilt }
  let uitlegCache = { sleutel: null, punten: 0 };

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
  const klem = (x, a, b) => Math.max(a, Math.min(b, x));

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
     Combinaties zoeken in je rekje (slim sorteren en uitlegpunten)
     ---------------------------------------------------------- */
  function voorraadVan(ids) {
    const per = {};
    const jokers = [];
    ids.forEach((id) => {
      const s = steen(id);
      if (s.joker) jokers.push(id);
      else (per[s.k + s.w] = per[s.k + s.w] || []).push(id);
    });
    return { per, jokers };
  }

  // Alle combinaties die met deze stenen te maken zijn (per soort steen, niet per exemplaar)
  function kandidaten(v, soort) {
    const J = v.jokers.length;
    const heeft = (k, w) => Boolean(v.per[k + w]);
    const uit = [];
    const gezien = new Set();
    const voegToe = (s, sleutels, jokers) => {
      const sig = sleutels.slice().sort().join(',') + '|' + jokers;
      if (gezien.has(sig)) return;
      gezien.add(sig);
      const nep = sleutels.map((x) => `${x[0]}-${x.slice(1)}-a`).concat(['J-0-a', 'J-0-b'].slice(0, jokers));
      if (!bekijk(nep).geldig) return;
      uit.push({ soort: s, sleutels, jokers, punten: punten(nep), stenen: sleutels.length + jokers });
    };
    if (soort !== 'groep') {
      KLEUREN.forEach((k) => {
        for (let a = 1; a <= 11; a++) {
          for (let L = 3; a + L - 1 <= 13; L++) {
            const sleutels = [];
            let mis = 0;
            for (let w = a; w < a + L; w++) { if (heeft(k, w)) sleutels.push(k + w); else mis++; }
            if (mis > J) break;
            if (sleutels.length) voegToe('reeks', sleutels, mis);
          }
        }
      });
    }
    if (soort !== 'reeks') {
      for (let w = 1; w <= 13; w++) {
        const kl = KLEUREN.filter((k) => heeft(k, w));
        for (let m = 1; m < 1 << kl.length; m++) {
          const deel = kl.filter((_, i) => m & (1 << i));
          for (let j = 0; j <= Math.min(J, 4 - deel.length); j++) {
            if (deel.length + j >= 3) voegToe('groep', deel.map((k) => k + w), j);
          }
        }
      }
    }
    return uit;
  }

  // Beste set losse combinaties (zoeken met snoeien, met een maximum aan stappen)
  function besteKeuze(kands, v, waarde, perSteen) {
    const tel = {};
    Object.keys(v.per).forEach((s) => { tel[s] = v.per[s].length; });
    let J = v.jokers.length;
    const lijstK = kands.slice().sort((a, b) => waarde(b) - waarde(a));
    let beste = { score: 0, keuze: [] };
    const huidig = [];
    let stappen = 0;
    const rest = () => {
      let r = J * perSteen(null);
      Object.keys(tel).forEach((s) => { r += tel[s] * perSteen(s); });
      return r;
    };
    (function zoek(i, score) {
      if (++stappen > 40000) return;
      if (score > beste.score) beste = { score, keuze: huidig.slice() };
      if (score + rest() <= beste.score) return;
      for (let j = i; j < lijstK.length; j++) {
        const c = lijstK[j];
        if (c.jokers > J || c.sleutels.some((s) => !tel[s])) continue;
        c.sleutels.forEach((s) => { tel[s]--; });
        J -= c.jokers;
        huidig.push(c);
        zoek(j, score + waarde(c));   // j: dezelfde combinatie mag nog een keer (dubbele stenen)
        huidig.pop();
        J += c.jokers;
        c.sleutels.forEach((s) => { tel[s]++; });
      }
    })(0, 0);
    return beste.keuze;
  }

  // Van "soorten" terug naar echte stenen
  function naarIds(keuze, v) {
    const per = {};
    Object.keys(v.per).forEach((s) => { per[s] = v.per[s].slice(); });
    const jok = v.jokers.slice();
    return keuze.map((c) => {
      const ids = c.sleutels.map((s) => per[s].shift());
      for (let j = 0; j < c.jokers; j++) ids.push(jok.shift());
      return bekijk(ids).orde;
    });
  }

  const waardeStenen = (c) => c.stenen * 100 - c.jokers * 40 + c.punten / 1000;
  const perSteenStenen = () => 100;

  // modus 'reeks': eerst zoveel mogelijk reeksen, dan groepen van wat over is (en andersom)
  function zoekCombos(ids, modus) {
    const v = voorraadVan(ids);
    const eerst = naarIds(besteKeuze(kandidaten(v, modus), v, waardeStenen, perSteenStenen), v);
    const gebruikt = new Set(eerst.flat());
    const rest = ids.filter((id) => !gebruikt.has(id));
    const v2 = voorraadVan(rest);
    const dan = naarIds(besteKeuze(kandidaten(v2, modus === 'reeks' ? 'groep' : 'reeks'), v2, waardeStenen, perSteenStenen), v2);
    const volgorde = (set) => {
      const s = steen(set.find((id) => !steen(id).joker) || set[0]);
      return modus === 'reeks' ? KLEUREN.indexOf(s.k) * 100 + (s.w || 0) : (s.w || 0) * 10 + KLEUREN.indexOf(s.k);
    };
    const sorteer = (a, b) => volgorde(a) - volgorde(b);
    return eerst.sort(sorteer).concat(dan.sort(sorteer));
  }

  // Hoeveel punten kun je nu maximaal uitleggen met je eigen stenen?
  function uitlegPunten(ids) {
    const sleutel = ids.slice().sort().join(',');
    if (uitlegCache.sleutel === sleutel) return uitlegCache.punten;
    const v = voorraadVan(ids);
    const perSteen = (s) => (s ? Number(s.slice(1)) : 13);
    const keuze = besteKeuze(kandidaten(v, 'alles'), v, (c) => c.punten, perSteen);
    const p = naarIds(keuze, v).reduce((s, set) => s + punten(set), 0);
    uitlegCache = { sleutel, punten: p };
    return p;
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
    if (s.laatste && s.laatste.licht) s.laatste.licht = lijst(s.laatste.licht);
    return s;
  }

  function deel(begint, timer, vorige) {
    const s = {
      status: 'spel',
      potje: Math.random().toString(36).slice(2, 8),
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

  // Welke stenen zijn nieuw op tafel of naar een andere combinatie geschoven?
  // Elke oude combinatie "hoort" bij de nieuwe combinatie met de meeste van haar stenen.
  function verschoven(oud, nieuw) {
    const oudSet = {};
    oud.forEach((set, i) => set.forEach((id) => { oudSet[id] = i; }));
    const overlap = [];
    nieuw.forEach((set, n) => {
      const tel = {};
      set.forEach((id) => { if (id in oudSet) tel[oudSet[id]] = (tel[oudSet[id]] || 0) + 1; });
      Object.keys(tel).forEach((o) => overlap.push({ n, o: Number(o), aantal: tel[o] }));
    });
    overlap.sort((a, b) => b.aantal - a.aantal);
    const herkomst = {};
    const bezet = new Set();
    overlap.forEach((x) => {
      if (x.n in herkomst || bezet.has(x.o)) return;
      herkomst[x.n] = x.o;
      bezet.add(x.o);
    });
    const licht = [];
    nieuw.forEach((set, n) => set.forEach((id) => {
      if (!(id in oudSet) || oudSet[id] !== herkomst[n]) licht.push(id);
    }));
    return licht;
  }

  function klaar() {
    if (!concept || !begin) return;
    const fout = beurtFout(begin, concept, kamer.stand.uitgelegd[ik]);
    if (fout) { api.toast(fout); return; }
    const c = kopie(concept);
    const startZet = begin.zet;
    const licht = verschoven(begin.tafel, c.tafel);
    const aantal = begin.rek.length - c.rek.length;
    return zet((s) => {
      if (s.status !== 'spel' || s.beurt !== ik || s.zet !== startZet) return undefined;
      s.tafel = c.tafel.map((set) => bekijk(set).orde);
      s.rekjes[ik] = c.rek;
      s.uitgelegd[ik] = true;
      if (!s.rekjes[ik].length) { s.status = 'klaar'; s.winnaar = ik; }
      else s.beurt = ander(ik);
      markeer(s, 'leg', { aantal, licht });
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
     Rekje: volgorde, slim sorteren
     ---------------------------------------------------------- */
  function bewaarRek() {
    try { localStorage.setItem(REK_SLEUTEL, JSON.stringify({ code, potje: rekPotje, ik, orde: rekOrde, combos: rekCombos, sortering })); } catch (e) { /* niets */ }
  }

  function laadRek() {
    rekOrde = []; rekCombos = []; sortering = null; rekPotje = null;
    try {
      const r = JSON.parse(localStorage.getItem(REK_SLEUTEL) || 'null');
      if (r && r.ik === ik) {
        sortering = r.sortering || null;   // je sorteerkeuze blijft, ook in een nieuw spel
        if (r.code === code) { rekOrde = r.orde || []; rekCombos = r.combos || []; rekPotje = r.potje || null; }
      }
    } catch (e) { /* niets */ }
  }

  const opKleur = (a, b) => {
    const x = steen(a), y = steen(b);
    return (x.joker ? 9 : KLEUREN.indexOf(x.k)) - (y.joker ? 9 : KLEUREN.indexOf(y.k)) || (x.w || 99) - (y.w || 99) || (a < b ? -1 : 1);
  };
  const opGetal = (a, b) => {
    const x = steen(a), y = steen(b);
    return (x.joker ? 99 : x.w) - (y.joker ? 99 : y.w) || (x.joker ? 9 : KLEUREN.indexOf(x.k)) - (y.joker ? 9 : KLEUREN.indexOf(y.k)) || (a < b ? -1 : 1);
  };

  function slimSorteer(modus, rek) {
    const combos = zoekCombos(rek, modus);
    const inCombo = new Set(combos.flat());
    const rest = rek.filter((id) => !inCombo.has(id)).sort(modus === 'reeks' ? opKleur : opGetal);
    const elders = rekOrde.filter((id) => !rek.includes(id));   // nu op tafel (komen terug bij Ongedaan)
    rekOrde = combos.flat().concat(rest, elders);
    rekCombos = combos;
    sortering = modus;
    bewaarRek();
  }

  function sorteerKnop(modus) {
    const s = kamer && kamer.stand;
    if (!s || !s.rekjes) return;
    const rek = concept ? concept.rek : s.rekjes[ik];
    slimSorteer(modus, rek);
    selectie = []; multi = false;
    teken();
  }

  // Wat staat er nu op het rekje, in welke volgorde? Nieuwe stenen gaan achteraan
  // (of worden meegesorteerd) en lichten even op.
  function rekWeergave(rek) {
    const bekend = new Set(rekOrde);
    const nieuw = rek.filter((id) => !bekend.has(id));
    if (nieuw.length) {
      const eerderGezien = rek.some((id) => bekend.has(id));
      if (eerderGezien) {
        const tot = Date.now() + OPLICHTEN;
        nieuw.forEach((id) => { nieuwOpRek[id] = tot; });
        planOplichten();
      }
      // Alleen bewaren wat nog ergens hoort (rekje of, tijdens je beurt, je eigen stenen op tafel)
      const houd = new Set(rek.concat(begin ? begin.rek : []));
      rekOrde = rekOrde.filter((id) => houd.has(id));
      if (sortering) slimSorteer(sortering, rek);
      else { rekOrde = rekOrde.concat(nieuw); bewaarRek(); }
    }
    const inRek = new Set(rek);
    return rekOrde.filter((id) => inRek.has(id));
  }

  function herschik(ids, voor) {
    const blok = rekOrde.filter((id) => ids.includes(id)).concat(ids.filter((id) => !rekOrde.includes(id)));
    rekOrde = rekOrde.filter((id) => !ids.includes(id));
    const plek = voor ? rekOrde.indexOf(voor) : -1;
    if (plek < 0) rekOrde.push(...blok); else rekOrde.splice(plek, 0, ...blok);
    sortering = null;
    bewaarRek();
  }

  // Combinatie (van slim sorteren) waar deze steen in zit, als die nog compleet en aaneengesloten op het rekje ligt
  function zichtbareCombos() {
    const uit = [];
    rekCombos.forEach((combo) => {
      const plek = rekLijst.indexOf(combo[0]);
      if (plek < 0) return;
      const stuk = rekLijst.slice(plek, plek + combo.length);
      if (stuk.length === combo.length && combo.every((id) => stuk.includes(id))) uit.push(stuk);
    });
    return uit;
  }

  /* ----------------------------------------------------------
     Verplaatsen van stenen (tijdens je beurt)
     plek: 'rek' | { set: i } | 'nieuw'
     ---------------------------------------------------------- */
  function isVast(setIndex) {
    // Vóór je eerste uitleg zijn de sets die al op tafel lagen op slot.
    if (kamer.stand.uitgelegd[ik]) return false;
    const set = concept.tafel[setIndex];
    return Boolean(set) && begin.tafel.some((b) => sleutelVan(b) === sleutelVan(set));
  }

  function magVerplaatsen(id, van, naar) {
    if (van !== 'rek' && isVast(van.set)) return 'Eerst je eigen uitleg van 30 punten';
    if (naar !== 'rek' && naar !== 'nieuw' && isVast(naar.set)) return 'Eerst je eigen uitleg van 30 punten';
    if (naar === 'rek' && van !== 'rek' && !begin.rek.includes(id)) return 'Stenen van tafel kunnen niet terug naar je rekje';
    return null;
  }

  function waarIs(id) {
    if (!concept) return null;
    if (concept.rek.includes(id)) return 'rek';
    const i = concept.tafel.findIndex((set) => set.includes(id));
    return i >= 0 ? { set: i } : null;
  }

  const zelfdePlek = (a, b) => a === b || (a && b && a.set !== undefined && a.set === b.set);

  // Eén of meer stenen naar een plek. voor: op het rekje vóór deze steen (null = achteraan).
  function verplaatsMeer(ids, naar, voor) {
    if (!concept) return;
    const items = ids.map((id) => ({ id, van: waarIs(id) })).filter((x) => x.van);
    const echt = items.filter((x) => !zelfdePlek(x.van, naar));
    for (const x of echt) {
      const fout = magVerplaatsen(x.id, x.van, naar);
      if (fout) { api.toast(fout); return; }
    }
    if (echt.length) {
      geschiedenis.push(kopie(concept));
      echt.forEach((x) => {
        if (x.van === 'rek') concept.rek = concept.rek.filter((id) => id !== x.id);
        else concept.tafel[x.van.set] = concept.tafel[x.van.set].filter((id) => id !== x.id);
      });
      const weg = echt.map((x) => x.id);
      if (naar === 'rek') concept.rek.push(...weg);
      else if (naar === 'nieuw') concept.tafel.push(weg);
      else concept.tafel[naar.set].push(...weg);
      // Lege sets weg, stenen vallen vanzelf op de goede plek
      concept.tafel = concept.tafel.filter((set) => set.length).map((set) => bekijk(set).orde);
      deelConcept();
    }
    if (naar === 'rek' && voor !== undefined) herschik(items.map((x) => x.id), voor);
    selectie = [];
    multi = false;
    teken();
  }

  function ongedaan() {
    if (!geschiedenis.length) return;
    concept = geschiedenis.pop();
    selectie = []; multi = false;
    deelConcept();
    teken();
  }

  function herstel() {
    if (!begin) return;
    concept = { tafel: kopie(begin.tafel), rek: kopie(begin.rek) };
    geschiedenis = [];
    selectie = []; multi = false;
    deelConcept();
    teken();
  }

  function wisSelectie() {
    selectie = []; multi = false;
    teken();
  }

  /* ----------------------------------------------------------
     Vingers: tikken, lang indrukken, slepen
     ---------------------------------------------------------- */
  function plekVan(e) {
    const doel = e && e.closest && e.closest('[data-plek]');
    if (!doel) return null;
    const p = doel.dataset.plek;
    if (p === 'rek' || p === 'nieuw') return p;
    return { set: Number(p) };
  }

  // Waar op het rekje komt een steen? Geeft de steen waarvóór hij komt (null = achteraan).
  function rekPositie(x, y, zonder) {
    const onder = document.elementFromPoint(x, y);
    if (!onder || !onder.closest('.rk-rek')) return undefined;
    const volgende = (id) => {
      for (let i = rekLijst.indexOf(id) + 1; i < rekLijst.length; i++) if (!zonder.includes(rekLijst[i])) return rekLijst[i];
      return null;
    };
    const tegel = onder.closest('.rk-steen');
    if (tegel && tegel.dataset.id) {
      const r = tegel.getBoundingClientRect();
      const id = tegel.dataset.id;
      if (x < r.left + r.width / 2) return zonder.includes(id) ? volgende(id) : id;
      return volgende(id);
    }
    const rij = onder.closest('.rk-rij');
    if (rij) {
      const tegels = [...rij.querySelectorAll('.rk-steen')].filter((t) => !zonder.includes(t.dataset.id));
      const na = tegels.find((t) => { const r = t.getBoundingClientRect(); return x < r.left + r.width / 2; });
      if (na) return na.dataset.id;
      if (tegels.length) return volgende(tegels[tegels.length - 1].dataset.id);
    }
    return null;
  }

  function annuleerDruk() {
    if (!druk) return;
    clearTimeout(druk.langTimer);
    if (druk.zweef) druk.zweef.remove();
    document.querySelectorAll('.rk-steen.opgepakt').forEach((t) => t.classList.remove('opgepakt'));
    druk = null;
  }

  function steenDown(e, id, van) {
    if (knijp || druk) return;
    if (!concept && van !== 'rek') return;
    e.preventDefault();
    const tegel = e.currentTarget;
    druk = { id, van, x0: e.clientX, y0: e.clientY, tegel, zweef: null, pid: e.pointerId, lang: false, langTimer: null, items: null };
    try { tegel.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
    if (concept) {
      druk.langTimer = setTimeout(() => {
        if (!druk || druk.zweef) return;
        druk.lang = true;
        // Lang ingedrukt: kiezen-modus, deze steen erbij
        multi = true;
        if (!selectie.includes(id)) selectie.push(id);
        tegel.classList.add('gekozen');
        if (navigator.vibrate) navigator.vibrate(12);
      }, LANG_DRUKKEN);
    }
  }

  function zweefVoor(ids) {
    const z = el('div', 'rk-zweef');
    ids.forEach((id) => z.append(steenEl(id)));
    document.body.append(z);
    return z;
  }

  function steenMove(e) {
    if (!druk || e.pointerId !== druk.pid) return;
    const dx = e.clientX - druk.x0, dy = e.clientY - druk.y0;
    if (!druk.zweef && Math.hypot(dx, dy) > 8) {
      clearTimeout(druk.langTimer);
      // Slepen: een gekozen steen neemt alle gekozen stenen mee
      druk.items = concept && selectie.includes(druk.id) ? rekEerst(selectie) : [druk.id];
      druk.zweef = zweefVoor(druk.items);
      druk.items.forEach((id) => document.querySelectorAll(`.rk-scherm .rk-steen[data-id="${id}"]`).forEach((t) => t.classList.add('opgepakt')));
    }
    if (!druk.zweef) return;
    const w = druk.zweef.offsetWidth;
    druk.zweef.style.transform = `translate(${e.clientX - w / 2}px, ${e.clientY - 80}px)`;
    document.querySelectorAll('.rk-doel, .rk-invoeg').forEach((x) => x.classList.remove('rk-doel', 'rk-invoeg'));
    const x = e.clientX, y = e.clientY - 56;
    const onder = document.elementFromPoint(x, y);
    const plek = onder && onder.closest('[data-plek]');
    if (plek) {
      plek.classList.add('rk-doel');
      if (plek.dataset.plek === 'rek') {
        const voor = rekPositie(x, y, druk.items);
        const t = voor && document.querySelector(`.rk-rek .rk-steen[data-id="${voor}"]`);
        if (t) t.classList.add('rk-invoeg');
      }
    }
    // Tafel schuift mee als je bij de rand komt
    if (tafelEls) {
      const b = tafelEls.venster.getBoundingClientRect();
      if (x > b.left && x < b.right) {
        if (y < b.top + 30 && y > b.top - 30) { tafelY += 9; zetZoom(); }
        else if (y > b.bottom - 80 && y < b.bottom) { tafelY -= 9; zetZoom(); }
      }
    }
  }

  // Volgorde bij meerdere stenen: zoals ze op het rekje liggen, dan de rest
  function rekEerst(ids) {
    return ids.slice().sort((a, b) => {
      const x = rekLijst.indexOf(a), y = rekLijst.indexOf(b);
      return (x < 0 ? 999 : x) - (y < 0 ? 999 : y);
    });
  }

  function steenUp(e) {
    if (!druk || e.pointerId !== druk.pid) return;
    const d = druk;
    druk = null;
    clearTimeout(d.langTimer);
    document.querySelectorAll('.rk-doel, .rk-invoeg').forEach((x) => x.classList.remove('rk-doel', 'rk-invoeg'));
    if (d.zweef) {
      d.zweef.remove();
      document.querySelectorAll('.rk-steen.opgepakt').forEach((t) => t.classList.remove('opgepakt'));
      if (e.type === 'pointercancel') { naGebaar(true); return; }
      const x = e.clientX, y = e.clientY - 56;
      const naar = plekVan(document.elementFromPoint(x, y));
      if (naar === 'rek') {
        const voor = rekPositie(x, y, d.items);
        const vanTafel = d.items.some((id) => !rekLijst.includes(id));
        if (concept && vanTafel) verplaatsMeer(d.items, 'rek', voor === undefined ? null : voor);
        else { herschik(d.items, voor === undefined ? null : voor); naGebaar(true); }
        return;
      }
      if (naar && concept) { verplaatsMeer(d.items, naar); return; }
      naGebaar(true);
      return;
    }
    if (e.type === 'pointercancel') { naGebaar(true); return; }
    if (d.lang) { naGebaar(true); return; }
    tik(d.id, d.van);
  }

  function tik(id, van) {
    if (!concept) return;
    if (multi) {
      selectie = selectie.includes(id) ? selectie.filter((x) => x !== id) : selectie.concat(id);
      if (!selectie.length) multi = false;
      return teken();
    }
    if (selectie.length === 1) {
      const g = selectie[0];
      if (g === id) { selectie = []; return teken(); }
      const gVan = waarIs(g);
      if (gVan && !zelfdePlek(gVan, van)) {
        // Tik op een steen ergens anders: de gekozen steen gaat daarheen
        return verplaatsMeer([g], van, van === 'rek' ? id : undefined);
      }
    }
    // Tik op een gemarkeerde combinatie op je rekje: alle stenen ervan kiezen
    const combo = van === 'rek' && zichtbareCombos().find((c) => c.includes(id));
    if (combo && !selectie.length) {
      selectie = combo.slice();
      multi = true;
      return teken();
    }
    selectie = [id];
    teken();
  }

  // Tik op een lege plek (combinatie, nieuwe combinatie, rekje): gekozen stenen daarheen
  function tikPlek(doel) {
    if (!concept || !selectie.length || !doel) return;
    if (doel.closest('.rk-steen')) return;
    const naar = plekVan(doel);
    if (naar) verplaatsMeer(selectie, naar, naar === 'rek' ? null : undefined);
  }

  function naGebaar(altijd) {
    if (druk || pan || knijp) return;
    if (altijd || uitgesteld) { uitgesteld = false; teken(); }
  }

  function koppelSteen(t, id, van) {
    t.addEventListener('pointerdown', (e) => steenDown(e, id, van));
    t.addEventListener('pointermove', steenMove);
    t.addEventListener('pointerup', steenUp);
    t.addEventListener('pointercancel', steenUp);
  }

  /* ----------------------------------------------------------
     Tafel: zoomen (knijpen) en schuiven (vegen)
     De inhoud wordt breder als je uitzoomt, zodat er meer naast elkaar past.
     ---------------------------------------------------------- */
  function zetZoom(automatisch) {
    if (!tafelEls) return;
    const { venster, vilt } = tafelEls;
    const W = venster.clientWidth, H = venster.clientHeight;
    if (!W || !H) return;
    const onder = concept ? 60 : 0;   // ruimte voor "nieuwe combinatie"
    // Echte hoogte van de inhoud bij zoom z (op het scherm)
    const meet = (z) => {
      vilt.style.width = (W / z) + 'px';
      vilt.style.minHeight = '0px';
      return vilt.offsetHeight * z;
    };
    // De langste combinatie moet in de breedte passen (er is geen zijwaarts schuiven)
    const breedste = Math.max(0, ...[...vilt.querySelectorAll('.rk-set')].map((x) => x.offsetWidth));
    const zBreed = breedste ? (W - 2) / (breedste + 22) : ZOOM_MAX;
    if (automatisch && !zoomHandmatig) {
      let z = Math.min(ZOOM_AUTO, zBreed);
      let h = meet(z);
      for (let i = 0; i < 4 && h > H - onder && z > ZOOM_MIN; i++) {
        z = Math.max(ZOOM_MIN, z * Math.sqrt((H - onder) / h) * 0.97);
        h = meet(z);
      }
      zoom = z;
    }
    zoom = klem(zoom, ZOOM_MIN, Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zBreed)));
    const h = meet(zoom);
    vilt.style.minHeight = (H / zoom) + 'px';   // het vilt vult altijd het hele zicht (tikken op lege plek)
    tafelY = klem(tafelY, Math.min(0, H - onder - h), 0);
    vilt.style.transform = `translate3d(0, ${tafelY}px, 0) scale(${zoom})`;
  }

  function koppelTafel(venster) {
    const vingers = new Map();
    venster.addEventListener('pointerdown', (e) => {
      vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const opSteen = e.target.closest('.rk-steen');
      if (vingers.size === 2) {
        if (druk && druk.zweef) return;
        annuleerDruk();
        pan = null;
        const [a, b] = [...vingers.values()];
        const top = venster.getBoundingClientRect().top;
        const my = (a.y + b.y) / 2 - top;
        knijp = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: zoom, wy: (my - tafelY) / zoom };
        return;
      }
      if (vingers.size === 1 && !opSteen) {
        e.preventDefault();
        pan = { y0: e.clientY, ty: tafelY, doel: e.target, bewogen: false, pid: e.pointerId };
        try { venster.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
      }
    });
    venster.addEventListener('pointermove', (e) => {
      if (!vingers.has(e.pointerId)) return;
      vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (knijp && vingers.size >= 2) {
        const [a, b] = [...vingers.values()];
        const top = venster.getBoundingClientRect().top;
        const my = (a.y + b.y) / 2 - top;
        zoom = klem(knijp.z * Math.hypot(a.x - b.x, a.y - b.y) / knijp.d, ZOOM_MIN, ZOOM_MAX);
        zoomHandmatig = true;
        tafelY = my - knijp.wy * zoom;
        zetZoom();
        return;
      }
      if (pan && e.pointerId === pan.pid) {
        const dy = e.clientY - pan.y0;
        if (Math.abs(dy) > 6) pan.bewogen = true;
        if (pan.bewogen) { tafelY = pan.ty + dy; zetZoom(); }
      }
    });
    const los = (e) => {
      if (!vingers.has(e.pointerId)) return;
      vingers.delete(e.pointerId);
      if (knijp) {
        if (vingers.size < 2) knijp = null;
        if (!vingers.size) naGebaar();
        return;
      }
      if (pan && e.pointerId === pan.pid) {
        const p = pan;
        pan = null;
        if (!p.bewogen && e.type === 'pointerup') tikPlek(p.doel);
        naGebaar();
      }
    };
    venster.addEventListener('pointerup', los);
    venster.addEventListener('pointercancel', los);
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

  function leeg() {
    wortel.textContent = '';
    tafelEls = null;
    document.body.classList.remove('rk-vol');
    window.scrollTo(0, 0);
  }

  function opruimen() {
    if (kamerRef && kamerLuisteraar) kamerRef.off('value', kamerLuisteraar);
    if (tellerRef && tellerLuisteraar) tellerRef.off('value', tellerLuisteraar);
    if (stopAanwezig) stopAanwezig();
    clearInterval(klokTimer);
    clearTimeout(conceptTimer);
    clearTimeout(lichtTimer);
    kamerRef = kamerLuisteraar = tellerRef = tellerLuisteraar = stopAanwezig = null;
    begin = concept = null;
    selectie = []; multi = false; geschiedenis = [];
    druk = pan = knijp = null;
    zoom = 1; zoomHandmatig = false; tafelY = 0;
    document.querySelectorAll('.rk-zweef').forEach((z) => z.remove());
    document.body.classList.remove('rk-vol');
  }

  function teken() {
    const s = kamer && kamer.stand;
    if (!s) return;
    if (druk || pan || knijp) { uitgesteld = true; return; }   // niet midden in een gebaar
    self.__rkStand = { ik, code, stand: s, begin, concept, rekOrde, rekLijst, selectie, multi, zoom };   // voor tests
    if (s.status === 'wacht') return tekenWacht();
    tekenSpel(s);
    self.__rkStand.rekLijst = rekLijst;
  }

  // Na het oplichten nog één keer tekenen, zodat het weer normaal wordt
  function planOplichten() {
    clearTimeout(lichtTimer);
    lichtTimer = setTimeout(() => teken(), OPLICHTEN + 100);
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
      geschiedenis = [];
      selectie = []; multi = false;
      tijdOpBezig = false;
    }
    if (!mijnBeurt) { begin = null; concept = null; selectie = []; multi = false; geschiedenis = []; }
    if (concept) selectie = selectie.filter((id) => waarIs(id));

    const online = (kamer.online || {})[tegen] === true;
    const kijkMee = !mijnBeurt && s.concept && s.concept.wie === tegen && s.concept.zet === s.zet;
    const tafel = mijnBeurt ? concept.tafel : (kijkMee ? s.concept.tafel : s.tafel);
    const rek = mijnBeurt ? concept.rek : s.rekjes[ik];
    const tegenAantal = kijkMee ? s.concept.rek.length : s.rekjes[tegen].length;

    // Stenen die de ander net legde of verschoof, even laten oplichten
    const l = s.laatste;
    let licht = new Set();
    if (l && l.wie === tegen && l.soort === 'leg' && l.licht) {
      if (lichtZet !== s.zet) { lichtZet = s.zet; lichtTot = Date.now() + OPLICHTEN; planOplichten(); }
      if (Date.now() < lichtTot) licht = new Set(l.licht);
    }

    const oudRek = wortel.querySelector('.rk-rek');
    const rekScroll = oudRek ? oudRek.scrollLeft : 0;
    leeg();
    document.body.classList.add('rk-vol');
    const scherm = el('div', 'rk-scherm' + (mijnBeurt ? ' mijn-beurt' : ''));

    // Kop: terug, de ander, pot, timer
    const kop = el('div', 'rk-kop');
    const terug = knop('rk-terug', '‹', () => api.terug());
    terug.setAttribute('aria-label', 'Terug naar het menu');
    const wie = el('div', 'rk-tegen');
    wie.append(el('span', 'uno-stip' + (online ? ' aan' : '')), el('b', '', NAMEN[tegen]));
    if (!online && s.status === 'spel') wie.append(el('span', 'uno-offline rk-weg', 'even weg'));
    else wie.append(el('span', 'rk-tegen-aantal', `${tegenAantal} ${tegenAantal === 1 ? 'steen' : 'stenen'}`));
    const klok = el('span', 'rk-klok');
    kop.append(terug, wie, el('span', 'rk-pot', `Pot ${s.pot.length}`), klok);
    scherm.append(kop);

    // Wie is er aan de beurt
    const balk = el('div', 'uno-beurt rk-beurt');
    if (s.status === 'klaar') balk.textContent = s.winnaar === 'gelijk' ? 'Gelijkspel' : s.winnaar === ik ? 'Jij hebt gewonnen!' : `${NAMEN[s.winnaar]} heeft gewonnen`;
    else if (mijnBeurt) balk.textContent = s.uitgelegd[ik] ? 'Jouw beurt' : `Jouw beurt · eerste uitleg ${EERSTE_UITLEG} punten`;
    else balk.textContent = `${NAMEN[tegen]} is aan de beurt`;
    if (mijnBeurt && beurtPop !== s.zet) { beurtPop = s.zet; balk.classList.add('pop'); }   // alleen bij het begin van je beurt
    scherm.append(balk);

    // Statusregel
    const status = el('div', 'rk-status');
    let fout = null, veranderd = false;
    if (mijnBeurt) {
      fout = beurtFout(begin, concept, s.uitgelegd[ik]);
      veranderd = JSON.stringify(concept.tafel) !== JSON.stringify(begin.tafel) || concept.rek.length !== begin.rek.length;
    }
    if (mijnBeurt && multi && selectie.length) {
      status.classList.add('kiezen');
      status.append(el('span', '', `${selectie.length} ${selectie.length === 1 ? 'steen' : 'stenen'} gekozen`), knop('rk-wis', 'Wissen', wisSelectie));
    } else if (mijnBeurt && veranderd) {
      status.textContent = fout || 'Alles klopt. Tik op Klaar.';
      if (fout) status.classList.add('fout');
    } else if (mijnBeurt) {
      status.textContent = (l && l.wie === tegen && meldingVoor(l)) || 'Sleep stenen naar de tafel, of pak een steen';
    } else if (s.status === 'spel') {
      status.textContent = 'Je kunt je rekje alvast ordenen';
    }
    scherm.append(status);

    // Tafel
    const venster = el('div', 'rk-tafel');
    const vilt = el('div', 'rk-vilt');
    tafel.forEach((set, i) => {
      const b = bekijk(set);
      const setEl = el('div', 'rk-set' + (b.geldig ? '' : ' ongeldig'));
      setEl.dataset.plek = String(i);
      const vast = mijnBeurt && isVast(i);
      if (vast) setEl.classList.add('vast');
      b.orde.forEach((id) => {
        const t = steenEl(id, [selectie.includes(id) ? 'gekozen' : '', licht.has(id) ? 'licht' : ''].filter(Boolean).join(' '));
        if (mijnBeurt && !vast) koppelSteen(t, id, { set: i });
        setEl.append(t);
      });
      vilt.append(setEl);
    });
    if (!tafel.length) vilt.append(el('p', 'rk-leeg', 'Nog niets op tafel'));
    venster.append(vilt);
    if (mijnBeurt) {
      const nieuw = el('div', 'rk-nieuw', '+ nieuwe combinatie');
      nieuw.dataset.plek = 'nieuw';
      venster.append(nieuw);
    }
    koppelTafel(venster);
    scherm.append(venster);

    // Knoppen
    const knoppen = el('div', 'rk-knoppen');
    const kOngedaan = knop('rk-knop', 'Ongedaan', ongedaan);
    const kHerstel = knop('rk-knop', 'Herstel', herstel);
    const kPak = knop('rk-knop', 'Pak steen', () => pak());
    const kKlaar = knop('rk-knop klaar', 'Klaar', klaar);
    kOngedaan.disabled = !mijnBeurt || !geschiedenis.length;
    kHerstel.disabled = !mijnBeurt || !veranderd;
    kPak.disabled = !mijnBeurt || veranderd;
    kKlaar.disabled = !mijnBeurt || Boolean(fout);
    knoppen.append(kOngedaan, kHerstel, kPak, kKlaar);
    scherm.append(knoppen);

    // Rekje: kop met uitlegpunten en sorteerknoppen
    if (rekPotje !== (s.potje || code)) { rekOrde = []; rekCombos = []; rekPotje = s.potje || code; }
    rekLijst = rekWeergave(rek);
    const rekKop = el('div', 'rk-rekkop');
    rekKop.append(el('span', 'rk-rektitel', `Jouw rekje · ${rek.length}`));
    if (s.status === 'spel' && !s.uitgelegd[ik]) {
      const p = uitlegPunten(mijnBeurt ? begin.rek : rek);
      rekKop.append(el('span', 'rk-uitleg' + (p >= EERSTE_UITLEG ? ' genoeg' : ''), `Uitleg ${p}/${EERSTE_UITLEG}`));
    }
    const k789 = knop('rk-sorteer' + (sortering === 'reeks' ? ' aan' : ''), '789', () => sorteerKnop('reeks'));
    k789.setAttribute('aria-label', 'Sorteer op reeksen');
    const k777 = knop('rk-sorteer' + (sortering === 'groep' ? ' aan' : ''), '777', () => sorteerKnop('groep'));
    k777.setAttribute('aria-label', 'Sorteer op groepen');
    rekKop.append(k789, k777);
    scherm.append(rekKop);

    // Rekje: twee rijen, combinaties bij elkaar
    const rekEl = el('div', 'rk-rek');
    rekEl.dataset.plek = 'rek';
    const combos = zichtbareCombos();
    const eenheden = [];
    for (let i = 0; i < rekLijst.length;) {
      const c = combos.find((x) => x[0] === rekLijst[i]);
      if (c) { eenheden.push(c); i += c.length; } else { eenheden.push([rekLijst[i]]); i++; }
    }
    // Splitsen in twee rijen: rij 1 zo vol mogelijk zolang beide rijen passen,
    // anders zo gelijk mogelijk (dan schuift het rekje opzij)
    const pas = Math.max(1, Math.floor((Math.min(window.innerWidth, 520) - 32) / steenBreedte()));
    const grenzen = [0];
    eenheden.forEach((e) => grenzen.push(grenzen[grenzen.length - 1] + e.length));
    const n = rekLijst.length;
    const passend = grenzen.filter((a) => a <= pas && n - a <= pas);
    const splits = passend.length ? Math.max(...passend)
      : grenzen.reduce((best, a) => (Math.max(a, n - a) < Math.max(best, n - best) || (Math.max(a, n - a) === Math.max(best, n - best) && a > best) ? a : best), 0);
    const rijen = [el('div', 'rk-rij'), el('div', 'rk-rij')];
    let telRij = 0, rij = 0;
    eenheden.forEach((eenheid) => {
      if (telRij >= splits) rij = 1;
      const doel = eenheid.length > 1 ? el('div', 'rk-combo') : rijen[rij];
      eenheid.forEach((id) => {
        const extra = [selectie.includes(id) ? 'gekozen' : '', (nieuwOpRek[id] || 0) > Date.now() ? 'nieuw' : ''].filter(Boolean).join(' ');
        const t = steenEl(id, extra);
        if (s.status === 'spel') koppelSteen(t, id, 'rek');
        doel.append(t);
      });
      if (doel !== rijen[rij]) rijen[rij].append(doel);
      telRij += eenheid.length;
    });
    rekEl.append(...rijen);
    rekEl.addEventListener('click', (e) => tikPlek(e.target));
    scherm.append(rekEl);
    wortel.append(scherm);

    tafelEls = { venster, vilt };
    zetZoom(true);
    rekEl.scrollLeft = rekScroll;

    // Klok
    clearInterval(klokTimer);
    const tikKlok = () => {
      if (!s.timer || s.status !== 'spel') { klok.textContent = ''; return; }
      const over = Math.max(0, Math.ceil((s.beurtStart + s.timer * 1000 - nu()) / 1000));
      klok.textContent = `⏱ ${Math.floor(over / 60)}:${String(over % 60).padStart(2, '0')}`;
      klok.classList.toggle('bijna', over <= 10);
      if (over <= 0 && mijnBeurt && !tijdOpBezig) {
        tijdOpBezig = true;
        annuleerDruk();
        api.toast('Tijd op! Je beurt wordt teruggezet en je pakt een steen');
        herstel();
        pak('tijdop');
      }
      if (!mijnBeurt && nu() - s.beurtStart > s.timer * 1000 + 8000) forceerTijdOp();
    };
    tikKlok();
    klokTimer = setInterval(tikKlok, 500);

    if (s.status === 'klaar') tekenUitslag(s, scherm);
  }

  // Breedte van een steen op het rekje + tussenruimte (zelfde als in de CSS)
  function steenBreedte() {
    return window.innerHeight <= 700 ? 42 : 44;
  }

  function meldingVoor(l) {
    const wie = NAMEN[l.wie];
    if (l.soort === 'leg') return `${wie} legde ${l.aantal} ${l.aantal === 1 ? 'steen' : 'stenen'}`;
    if (l.soort === 'pak') return `${wie} pakte een steen`;
    if (l.soort === 'tijdop') return `${wie} was te laat en pakte een steen 😏`;
    return null;
  }

  function tekenUitslag(s, scherm) {
    const w = tellers.wout || 0;
    const d = tellers.davinia || 0;
    const laag = el('div', 'rk-uitslag');
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
    laag.append(kaartje);
    scherm.append(laag);
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
    laadRek();
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
      teken();
    }, (fout) => {
      console.warn(fout);
      toonFout('Geen toegang tot deze kamer.');
    });
  }

  // iOS: tijdens het spel geen paginazoom (knijpen) en geen dubbeltik-zoom op tafel en stenen
  function geenPaginaZoom(e) {
    if (!document.body.classList.contains('rk-vol')) return;
    if (e.type === 'touchend' && !(e.target.closest && e.target.closest('.rk-tafel, .rk-steen'))) return;
    e.preventDefault();
  }
  const ZOOM_EVENTS = ['gesturestart', 'gesturechange', 'touchend'];

  Spellen.registreer({
    id: SPEL,
    start(doel, spelApi) {
      api = spelApi;
      wortel = doel;
      ZOOM_EVENTS.forEach((t) => document.addEventListener(t, geenPaginaZoom, { passive: false }));
      if (!self.Online) { toonFout('De online verbinding kon niet laden.'); return; }
      toonStart();
    },
    stop() {
      opruimen();
      ZOOM_EVENTS.forEach((t) => document.removeEventListener(t, geenPaginaZoom, { passive: false }));
    },
  });

  // Voor tests: de regels los kunnen controleren
  self.__rkRegels = { bekijk, beurtFout, punten, zoekCombos, uitlegPunten, verschoven };
})();
