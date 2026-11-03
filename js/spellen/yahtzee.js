/*
  SPEL: YAHTZEE (online, tegen elkaar)
  ------------------------------------------------------------
  Gewone regels: om de beurt maximaal 3 keer gooien, tussendoor stenen
  vasthouden, daarna één vak invullen. 13 vakken; bonus 35 bij 63 of meer
  in het bovenste deel; elke extra Yahtzee +100 (als het Yahtzee-vak 50 heeft)
  met de jokerregel: eerst het bijbehorende bovenste vak, anders mag een
  onderste vak met de volle waarde (full house 25, straten 30/40).
  Gooien met de knop of door de telefoon te schudden (iPhone vraagt één keer
  toestemming voor de bewegingssensor). Gooi je 5 stenen die samen 22 ogen
  hebben: een kleine verrassing (geen punten). Stand in tellers/yahtzee.
*/
(function () {
  'use strict';

  const { ander } = OnlineSpel;
  const BOVEN = [
    ['een', 'Enen', 1], ['twee', 'Tweeën', 2], ['drie', 'Drieën', 3],
    ['vier', 'Vieren', 4], ['vijf', 'Vijven', 5], ['zes', 'Zessen', 6],
  ];
  const ONDER = [
    ['drieGelijk', 'Drie gelijk'], ['vierGelijk', 'Vier gelijk'], ['fullHouse', 'Full house'],
    ['kleineStraat', 'Kleine straat'], ['groteStraat', 'Grote straat'], ['yahtzee', 'Yahtzee'], ['kans', 'Kans'],
  ];
  const ALLE = BOVEN.map((v) => v[0]).concat(ONDER.map((v) => v[0]));
  const NAAM = Object.fromEntries(BOVEN.map(([k, n]) => [k, n]).concat(ONDER));

  let laatsteWorp = -1;      // welke worp ik al heb laten rollen
  let laatsteGeluk = -1;
  let schudAan = false;
  let schudLuisteraar = null;
  let laatsteSchud = 0;
  let huidigeCtx = null;

  /* ---------- puntentelling ---------- */
  const telling = (d) => { const t = [0, 0, 0, 0, 0, 0, 0]; d.forEach((x) => { t[x]++; }); return t; };
  const som = (d) => d.reduce((a, x) => a + x, 0);
  const isYahtzee = (d) => d.length === 5 && d[0] > 0 && d.every((x) => x === d[0]);
  function straat(d, lengte) {
    const u = [...new Set(d)].sort((a, b) => a - b).join('');
    return lengte === 4 ? ['1234', '2345', '3456'].some((r) => u.includes(r)) : ['12345', '23456'].includes(u);
  }
  // Punten voor een vak met deze worp. joker = extra Yahtzee waarbij de jokerregel geldt.
  function punten(vak, d, joker) {
    const t = telling(d);
    const b = BOVEN.find((x) => x[0] === vak);
    if (b) return t[b[2]] * b[2];
    switch (vak) {
      case 'drieGelijk': return t.some((n) => n >= 3) ? som(d) : 0;
      case 'vierGelijk': return t.some((n) => n >= 4) ? som(d) : 0;
      case 'fullHouse': return joker || (t.includes(3) && t.includes(2)) ? 25 : 0;
      case 'kleineStraat': return joker || straat(d, 4) ? 30 : 0;
      case 'groteStraat': return joker || straat(d, 5) ? 40 : 0;
      case 'yahtzee': return isYahtzee(d) ? 50 : 0;
      case 'kans': return som(d);
      default: return 0;
    }
  }
  // Welke vakken mag je nu kiezen (jokerregel bij een extra Yahtzee)?
  function mogelijk(kaart, d) {
    const open = ALLE.filter((v) => kaart[v] == null);
    if (isYahtzee(d) && kaart.yahtzee != null) {
      const bijbehorend = BOVEN[d[0] - 1][0];
      if (kaart[bijbehorend] == null) return { vakken: [bijbehorend], joker: false };
      const onder = open.filter((v) => ONDER.some((o) => o[0] === v));
      return onder.length ? { vakken: onder, joker: true } : { vakken: open, joker: true };
    }
    return { vakken: open, joker: false };
  }
  function totalen(kaart, bonus) {
    const boven = BOVEN.reduce((a, [k]) => a + (kaart[k] || 0), 0);
    const bovenBonus = boven >= 63 ? 35 : 0;
    const onder = ONDER.reduce((a, [k]) => a + (kaart[k] || 0), 0);
    const extra = (bonus || 0) * 100;
    return { boven, bovenBonus, onder, extra, totaal: boven + bovenBonus + onder + extra };
  }
  const kaartVol = (kaart) => ALLE.every((v) => kaart[v] != null);

  /* ---------- stand ---------- */
  function nieuwPotje(begint) {
    return {
      status: 'spel',
      potje: Math.random().toString(36).slice(2, 8),
      begint,
      beurt: begint,
      worp: [0, 0, 0, 0, 0],
      vast: [0, 0, 0, 0, 0],
      worpen: 0,
      worpNr: 0,
      kaarten: { wout: { leeg: 1 }, davinia: { leeg: 1 } },
      bonus: { wout: 0, davinia: 0 },
      laatste: null,
      winnaar: null,
    };
  }
  function normaalStand(s, ctx) {
    s.worp = ctx.lijst(s.worp).map(Number);
    if (s.worp.length !== 5) s.worp = [0, 0, 0, 0, 0];
    s.vast = ctx.lijst(s.vast).map(Number);
    if (s.vast.length !== 5) s.vast = [0, 0, 0, 0, 0];
    s.kaarten = s.kaarten || {};
    ['wout', 'davinia'].forEach((n) => { s.kaarten[n] = s.kaarten[n] || { leeg: 1 }; });
    s.bonus = Object.assign({ wout: 0, davinia: 0 }, s.bonus);
    return s;
  }

  /* ---------- zetten ---------- */
  function gooi(ctx) {
    const { ik } = ctx;
    const potje = ctx.stand.potje;
    const forceer = self.__yahtzeeTest && self.__yahtzeeTest.forceer;   // alleen voor tests
    if (self.__yahtzeeTest) self.__yahtzeeTest.forceer = null;
    return ctx.zet((s) => {
      s = normaalStand(s, ctx);
      if (s.status !== 'spel' || s.potje !== potje || s.beurt !== ik || s.worpen >= 3) return undefined;
      s.worp = s.worp.map((x, i) => (s.vast[i] && s.worpen > 0 ? x : forceer ? forceer[i] : 1 + Math.floor(Math.random() * 6)));
      s.worpen += 1;
      s.worpNr = (s.worpNr || 0) + 1;
      s.laatste = { wie: ik, soort: 'gooi', nr: s.worpNr };
      if (isYahtzee(s.worp)) s.laatste = { wie: ik, soort: 'yahtzee', nr: s.worpNr };
      if (som(s.worp) === 22) s.geluk = s.worpNr;
      return s;
    });
  }
  function houdVast(ctx, i) {
    const { ik } = ctx;
    const { potje, worpNr } = ctx.stand;
    return ctx.zet((s) => {
      s = normaalStand(s, ctx);
      if (s.status !== 'spel' || s.potje !== potje || s.beurt !== ik || !s.worpen || s.worpen >= 3 || s.worpNr !== worpNr) return undefined;
      s.vast[i] = s.vast[i] ? 0 : 1;
      return s;
    });
  }
  function kies(ctx, vak) {
    const { ik } = ctx;
    const { potje, worpNr } = ctx.stand;
    return ctx.zet((s) => {
      s = normaalStand(s, ctx);
      if (s.status !== 'spel' || s.potje !== potje || s.beurt !== ik || !s.worpen || s.worpNr !== worpNr) return undefined;
      const kaart = s.kaarten[ik];
      const m = mogelijk(kaart, s.worp);
      if (!m.vakken.includes(vak)) return undefined;
      // Extra Yahtzee-bonus
      if (isYahtzee(s.worp) && kaart.yahtzee === 50) s.bonus[ik] = (s.bonus[ik] || 0) + 1;
      const p = punten(vak, s.worp, m.joker);
      kaart[vak] = p;
      delete kaart.leeg;
      s.laatste = { wie: ik, soort: p === 0 ? 'nul' : 'vak', vak, punten: p, nr: (s.worpNr || 0) + 1, vol: kaartVol(kaart) };
      s.worpNr = (s.worpNr || 0) + 1;
      s.worp = [0, 0, 0, 0, 0];
      s.vast = [0, 0, 0, 0, 0];
      s.worpen = 0;
      if (kaartVol(s.kaarten.wout) && kaartVol(s.kaarten.davinia)) {
        const w = totalen(s.kaarten.wout, s.bonus.wout).totaal;
        const d = totalen(s.kaarten.davinia, s.bonus.davinia).totaal;
        s.status = 'klaar';
        s.winnaar = w === d ? 'gelijk' : w > d ? 'wout' : 'davinia';
        s.eind = { wout: w, davinia: d };
      } else {
        s.beurt = ander(ik);
      }
      return s;
    }).then((r) => {
      if (r && r.committed) {
        const s = r.snapshot.val();
        if (s && s.status === 'klaar' && s.winnaar && s.winnaar !== 'gelijk') ctx.telWinst(s.winnaar);
      }
    });
  }

  /* ---------- schudden ---------- */
  function schudden() {
    if (schudLuisteraar) return;
    let vorige = null;
    schudLuisteraar = (e) => {
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a) return;
      const nu = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
      if (vorige) {
        const kracht = Math.abs(nu.x - vorige.x) + Math.abs(nu.y - vorige.y) + Math.abs(nu.z - vorige.z);
        if (kracht > 28 && Date.now() - laatsteSchud > 1200) {
          laatsteSchud = Date.now();
          const ctx = huidigeCtx;
          if (ctx && ctx.stand.status === 'spel' && ctx.stand.beurt === ctx.ik && (ctx.stand.worpen || 0) < 3) gooi(ctx);
        }
      }
      vorige = nu;
    };
    window.addEventListener('devicemotion', schudLuisteraar);
    schudAan = true;
  }
  async function zetSchuddenAan() {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const antwoord = await DeviceMotionEvent.requestPermission();
        if (antwoord !== 'granted') { huidigeCtx.api.toast('Geen toestemming. Gooien met de knop kan altijd'); return; }
      }
      schudden();
      huidigeCtx.api.toast('Schudden staat aan');
      huidigeCtx.opnieuw();
    } catch (e) {
      huidigeCtx.api.toast('Schudden lukt hier niet. Gooien met de knop kan altijd');
    }
  }

  /* ---------- tekenen ---------- */
  function steenEl(waarde, vast, rolt, klikbaar, opTik) {
    const s = document.createElement(klikbaar ? 'button' : 'div');
    if (klikbaar) { s.type = 'button'; s.addEventListener('click', opTik); }
    s.className = 'yz-steen' + (vast ? ' vast' : '') + (rolt ? ' rolt' : '') + (waarde ? '' : ' leeg');
    s.dataset.waarde = String(waarde || 0);
    s.setAttribute('aria-label', waarde ? `Steen ${waarde}${vast ? ', vast' : ''}` : 'Steen');
    for (let i = 0; i < 9; i++) s.append(document.createElement('i'));
    return s;
  }

  function melding(s, ik, NAMEN) {
    const l = s.laatste;
    if (!l) return '';
    const wie = l.wie === ik ? 'Jij' : NAMEN[l.wie];
    if (l.soort === 'yahtzee') return l.wie === 'wout' ? 'YAHTZEE! Ja ik weet het, ik ben goed 😁' : 'YAHTZEE! Eindelijk geluk 😂';
    if (l.soort === 'nul') return l.wie === 'wout' ? `Een 0 bij ${NAAM[l.vak]}. Bewust, natuurlijk 🥲` : `Een 0 bij ${NAAM[l.vak]}. Ik zeg niks 😁`;
    if (l.soort === 'vak' && l.vol) return l.wie === 'wout' ? 'Wouts kaart is vol. Nu maar hopen 😁' : 'Davinia\'s kaart is vol. Spannend 😂';
    if (l.soort === 'vak') return `${wie} schreef ${l.punten} bij ${NAAM[l.vak]}`;
    return '';
  }

  function teken(ctx) {
    huidigeCtx = ctx;
    const { ik, tegen, NAMEN, el, knop, wortel } = ctx;
    const s = normaalStand(JSON.parse(JSON.stringify(ctx.stand)), ctx);
    wortel.textContent = '';
    const scherm = el('div', 'os-scherm yz-scherm');
    const mijnBeurt = s.status === 'spel' && s.beurt === ik;
    const mijnTot = totalen(s.kaarten[ik], s.bonus[ik]).totaal;
    const zijnTot = totalen(s.kaarten[tegen], s.bonus[tegen]).totaal;
    scherm.append(ctx.bovenbalk(`${zijnTot} punten`));

    if (s.status === 'klaar') {
      const gewonnen = s.winnaar === ik;
      let titel, tekst;
      if (s.winnaar === 'gelijk') { titel = 'Gelijkspel'; tekst = 'Precies even veel. Dat gebeurt nooit 😂'; }
      else if (s.winnaar === 'wout') { titel = gewonnen ? 'Gewonnen!' : 'Wout wint'; tekst = gewonnen ? 'Zoals verwacht 😁' : 'Volgende keer beter 😘'; }
      else { titel = gewonnen ? 'Gewonnen!' : 'Davinia wint'; tekst = gewonnen ? 'Ja ja, gefeliciteerd. Geluk 😂' : 'Ik heb je laten winnen, echt 🥲'; }
      const eind = el('p', 'yz-eind', `Wout ${s.eind ? s.eind.wout : 0} · Davinia ${s.eind ? s.eind.davinia : 0}`);
      scherm.append(ctx.uitslag({ titel, tekst, extra: eind }));
      wortel.append(scherm);
      return;
    }

    // Wie is er aan de beurt
    const balk = el('div', 'uno-beurt yz-beurt' + (mijnBeurt ? ' mijn' : ''));
    balk.textContent = mijnBeurt ? (s.worpen ? `Jouw beurt · nog ${3 - s.worpen} ${3 - s.worpen === 1 ? 'worp' : 'worpen'}` : 'Jouw beurt · gooi!') : `${NAMEN[s.beurt]} is aan de beurt`;
    scherm.append(balk);
    const m = melding(s, ik, NAMEN);
    if (m) scherm.append(el('p', 'uno-gebeurtenis yz-melding', m));

    // Het dekentje aan de Maas, met de stenen en de beker
    const deken = el('div', 'yz-maas');
    const rolt = s.worpNr !== laatsteWorp && s.worpen > 0;
    laatsteWorp = s.worpNr;
    const stenen = el('div', 'yz-stenen');
    s.worp.forEach((w, i) => stenen.append(steenEl(w, s.vast[i], rolt && !s.vast[i], mijnBeurt && s.worpen > 0 && s.worpen < 3, () => houdVast(ctx, i))));
    const onderkant = el('div', 'yz-dekenrij');
    const beker = el('div', 'yz-beker' + (rolt ? ' schudt' : ''));
    beker.append(el('span', 'yz-beker-tekst', 'W♥D'));
    onderkant.append(beker);
    if (mijnBeurt) {
      const g = knop('knop yz-gooi', s.worpen >= 3 ? 'Kies een vak' : s.worpen ? 'Gooi opnieuw' : 'Gooi', () => gooi(ctx));
      g.disabled = s.worpen >= 3;
      onderkant.append(g);
    } else {
      onderkant.append(el('p', 'yz-kijk', `${NAMEN[s.beurt]} gooit…`));
    }
    deken.append(stenen, onderkant);
    if (mijnBeurt && s.worpen > 0 && s.worpen < 3) deken.append(el('p', 'yz-tip', 'Tik op een steen om hem vast te houden'));
    scherm.append(deken);
    if (mijnBeurt && !schudAan) {
      scherm.append(knop('uno-wissel yz-schud', 'Je kunt ook je telefoon schudden. Zet het aan', zetSchuddenAan));
    }

    // 22 ogen: een kleine verrassing
    if (s.geluk && s.geluk === s.worpNr && laatsteGeluk !== s.geluk) {
      laatsteGeluk = s.geluk;
      const v = el('div', 'yz-geluk');
      v.append(el('span', 'yz-geluk-getal', '22'), el('span', 'yz-geluk-tekst', 'Dat getal ken ik ergens van ❤️'));
      for (let i = 0; i < 12; i++) {
        const h = el('i', 'yz-hartje', '♥');
        h.style.setProperty('--x', `${Math.round(Math.random() * 240 - 120)}px`);
        h.style.setProperty('--d', `${(Math.random() * 0.4).toFixed(2)}s`);
        v.append(h);
      }
      document.body.append(v);
      setTimeout(() => v.remove(), 3200);
    }

    // De scorekaart van allebei
    const mog = mijnBeurt && s.worpen > 0 ? mogelijk(s.kaarten[ik], s.worp) : { vakken: [], joker: false };
    const kaart = el('table', 'yz-kaart');
    const kop = el('tr');
    kop.append(el('th', '', ''), el('th', 'yz-ik', ik === 'wout' ? 'Wout' : 'Davinia'), el('th', '', NAMEN[tegen]));
    kaart.append(kop);
    const rij = (vak, label) => {
      const r = el('tr');
      r.append(el('td', 'yz-label', label));
      const mijn = s.kaarten[ik][vak];
      const cel = el('td', 'yz-ik');
      if (mijn != null) cel.textContent = String(mijn);
      else if (mog.vakken.includes(vak)) {
        const b = knop('yz-kies', String(punten(vak, s.worp, mog.joker)), () => kies(ctx, vak));
        b.dataset.vak = vak;
        cel.append(b);
      }
      const zijn = s.kaarten[tegen][vak];
      r.append(cel, el('td', '', zijn != null ? String(zijn) : ''));
      return r;
    };
    BOVEN.forEach(([k, n]) => kaart.append(rij(k, n)));
    const tMijn = totalen(s.kaarten[ik], s.bonus[ik]), tZijn = totalen(s.kaarten[tegen], s.bonus[tegen]);
    const somRij = (label, a, b, klasse) => { const r = el('tr', klasse); r.append(el('td', 'yz-label', label), el('td', 'yz-ik', a), el('td', '', b)); return r; };
    kaart.append(somRij('Bonus (63+)', tMijn.bovenBonus ? '35' : `${tMijn.boven}/63`, tZijn.bovenBonus ? '35' : `${tZijn.boven}/63`, 'yz-sub'));
    ONDER.forEach(([k, n]) => kaart.append(rij(k, n)));
    if (tMijn.extra || tZijn.extra) kaart.append(somRij('Extra Yahtzee', String(tMijn.extra), String(tZijn.extra), 'yz-sub'));
    kaart.append(somRij('Totaal', String(mijnTot), String(zijnTot), 'yz-totaal'));
    scherm.append(kaart);
    wortel.append(scherm);
  }

  OnlineSpel.maak({
    id: 'yahtzee',
    naam: 'Yahtzee',
    modus: 'tegen',
    intro: 'Tegen elkaar, ieder op je eigen telefoon. Om de beurt drie keer gooien en een vak kiezen. Je speelt als {ik}.',
    nieuwPotje,
    teken,
    stop() { huidigeCtx = null; laatsteWorp = -1; },
  });

  // Voor tests: de regels los kunnen controleren, en een worp vastzetten
  self.__yahtzeeRegels = { punten, mogelijk, totalen, isYahtzee };
  self.__yahtzeeTest = { forceer: null };
})();
