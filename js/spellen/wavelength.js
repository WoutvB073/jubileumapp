/*
  SPEL: WAVELENGTH (online, samen)
  ------------------------------------------------------------
  Elke ronde een schaal tussen twee uitersten (CONTENT.wavelength,
  "links | rechts"). De hintgever ziet een geheime plek op de schaal en
  typt een hint; de ander schuift de wijzer naar waar de plek volgens hem
  of haar is. De hintgever ziet de wijzer live meebewegen.
  Punten: binnen 4 = 4, binnen 12 = 3, binnen 20 = 2 (op een schaal 0-100).
  Een potje = 6 rondes (ieder geeft 3 hints), max 24 punten, samen-record.
*/
(function () {
  'use strict';

  const RONDES = 6;
  const ZONES = [[4, 4], [12, 3], [20, 2]];   // [afstand, punten]
  const { ander } = OnlineSpel;

  let content = null;
  let wijzerLokaal = null;     // waar ik de wijzer heb (tijdens raden)
  let wijzerVoor = null;       // potje:ronde
  let hintConcept = '';
  let sleep = false;
  let typt = false;
  let deelTimer = null;
  let laatsteCtx = null;

  const schaal = (i) => String(content.wavelength[i]).split('|').map((x) => x.trim());
  const geeftHint = (s) => (s.ronde % 2 === 0 ? s.begint : ander(s.begint));
  const puntenVoor = (wijzer, doel) => {
    const d = Math.abs(wijzer - doel);
    const z = ZONES.find(([max]) => d <= max);
    return z ? z[1] : 0;
  };

  function nieuwPotje(begint, opties, vorige, ctx) {
    content = ctx.api.content;
    return {
      status: 'spel',
      potje: Math.random().toString(36).slice(2, 8),
      begint,
      ronde: 0,
      schalen: OnlineSpel.trek('wavelength', content.wavelength.length, RONDES),
      doelen: Array.from({ length: RONDES }, () => 6 + Math.floor(Math.random() * 89)),
      fase: 'hint',
      hint: null,
      wijzer: 50,
      score: 0,
      punten: [],
    };
  }

  /* ---------- de wijzer (SVG halve cirkel) ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const R = 92, CX = 100, CY = 100;
  function punt(v, r) {
    const a = Math.PI * (1 - v / 100);   // 0 = links, 100 = rechts
    return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  }
  function wig(van, tot, klasse) {
    van = Math.max(0, van); tot = Math.min(100, tot);
    const [x1, y1] = punt(van, R), [x2, y2] = punt(tot, R);
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${CX} ${CY} L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`);
    p.setAttribute('class', klasse);
    return p;
  }
  function maakSchijf({ doel, toonDoel, wijzer, bedienbaar, opWijzer }) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 108');
    svg.setAttribute('class', 'wl-schijf' + (bedienbaar ? ' bedienbaar' : ''));
    const rand = document.createElementNS(NS, 'path');
    rand.setAttribute('d', `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY} Z`);
    rand.setAttribute('class', 'wl-vlak');
    svg.append(rand);
    if (toonDoel) {
      // Zones zoals in het echte spel: buiten 2, dan 3, midden 4
      [[20, 'wl-z2'], [12, 'wl-z3'], [4, 'wl-z4']].forEach(([b, k]) => svg.append(wig(doel - b, doel + b, k)));
    }
    const naald = document.createElementNS(NS, 'g');
    naald.setAttribute('class', 'wl-naald');
    const lijn = document.createElementNS(NS, 'line');
    lijn.setAttribute('x1', CX); lijn.setAttribute('y1', CY); lijn.setAttribute('x2', CX); lijn.setAttribute('y2', CY - R + 6);
    const knop = document.createElementNS(NS, 'circle');
    knop.setAttribute('cx', CX); knop.setAttribute('cy', CY - R + 14); knop.setAttribute('r', 9);
    const as = document.createElementNS(NS, 'circle');
    as.setAttribute('cx', CX); as.setAttribute('cy', CY); as.setAttribute('r', 8); as.setAttribute('class', 'wl-as');
    naald.append(lijn, knop);
    svg.append(naald, as);
    const zet = (v) => { naald.setAttribute('transform', `rotate(${(v - 50) * 1.8} ${CX} ${CY})`); };
    zet(wijzer);
    if (bedienbaar) {
      const waarde = (e) => {
        const r = svg.getBoundingClientRect();
        const sx = 200 / r.width;
        const x = (e.clientX - r.left) * sx - CX, y = CY - (e.clientY - r.top) * sx;
        const a = Math.atan2(Math.max(y, 0), x);   // 0..π
        return Math.round(Math.max(0, Math.min(100, 100 * (1 - a / Math.PI))));
      };
      svg.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        sleep = true;
        try { svg.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
        const v = waarde(e); zet(v); opWijzer(v, false);
      });
      svg.addEventListener('pointermove', (e) => { if (!sleep) return; const v = waarde(e); zet(v); opWijzer(v, false); });
      const los = (e) => { if (!sleep) return; sleep = false; const v = waarde(e); zet(v); opWijzer(v, true); };
      svg.addEventListener('pointerup', los);
      svg.addEventListener('pointercancel', () => { sleep = false; opWijzer(wijzerLokaal, true); });
    }
    return svg;
  }

  /* ---------- zetten ---------- */
  function stuurHint(ctx, tekst) {
    const { ronde, potje } = ctx.stand;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'hint') return undefined;
      s.hint = tekst;
      s.fase = 'raden';
      s.wijzer = 50;
      return s;
    });
  }
  // De wijzer live delen (de hintgever kijkt mee)
  function deelWijzer(ctx, v) {
    clearTimeout(deelTimer);
    deelTimer = setTimeout(() => { if (ctx.kamerRef) ctx.kamerRef.child('stand/wijzer').set(v).catch(() => {}); }, 120);
  }
  function kies(ctx, v) {
    const { ronde, potje } = ctx.stand;
    clearTimeout(deelTimer);
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'raden') return undefined;
      const p = puntenVoor(v, ctx.lijst(s.doelen)[s.ronde]);
      s.wijzer = v;
      s.score = (s.score || 0) + p;
      s.punten = ctx.lijst(s.punten).concat(p);
      s.fase = 'uitkomst';
      return s;
    });
  }
  function volgende(ctx) {
    const { ronde, potje } = ctx.stand;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'uitkomst') return undefined;
      if (s.ronde + 1 >= RONDES) { s.status = 'klaar'; return s; }
      s.ronde += 1;
      s.fase = 'hint';
      s.hint = null;
      s.wijzer = 50;
      return s;
    });
  }

  /* ---------- tekenen ---------- */
  function teken(ctx) {
    laatsteCtx = ctx;
    const { stand: s, ik, NAMEN, el, knop, wortel } = ctx;
    content = ctx.api.content;
    if (s.schalen) OnlineSpel.markeer('wavelength', ctx.lijst(s.schalen), content.wavelength.length);
    wortel.textContent = '';
    const scherm = el('div', 'os-scherm wl-scherm');

    if (s.status === 'klaar') {
      const score = s.score || 0;
      ctx.zetRecord(score);
      const tekst = score >= 18 ? 'Zelfde golflengte. Wie had dat gedacht 😁' : score >= 10 ? 'Prima afgestemd 👍' : 'Andere zender 😂';
      scherm.append(ctx.bovenbalk(), ctx.uitslag({ titel: `Samen ${score} punten`, tekst, score, max: RONDES * 4 }));
      wortel.append(scherm);
      return;
    }

    const [links, rechts] = schaal(ctx.lijst(s.schalen)[s.ronde]);
    const doel = ctx.lijst(s.doelen)[s.ronde];
    const gever = geeftHint(s);
    const ikGeef = gever === ik;
    const sleutel = `${s.potje}:${s.ronde}`;
    if (wijzerVoor !== sleutel) { wijzerVoor = sleutel; wijzerLokaal = 50; hintConcept = ''; }
    scherm.append(ctx.bovenbalk(`Ronde ${s.ronde + 1}/${RONDES} · ${s.score || 0} punten`));

    const kaart = el('div', 'wl-kaart');
    kaart.append(el('p', 'rkg-wie', ikGeef ? 'Jij geeft de hint' : `${NAMEN[gever]} geeft de hint, jij raadt`));
    const uitersten = el('div', 'wl-uitersten');
    uitersten.append(el('span', 'wl-links', `← ${links}`), el('span', 'wl-rechts', `${rechts} →`));

    if (s.fase === 'hint') {
      if (ikGeef) {
        kaart.append(maakSchijf({ doel, toonDoel: true, wijzer: doel }), uitersten);
        kaart.append(el('p', 'wl-uitleg', 'Alleen jij ziet de roze plek. Typ een hint die daar precies past.'));
        const invoer = el('input', 'wl-hint-invoer');
        invoer.placeholder = 'Jouw hint';
        invoer.maxLength = 40;
        invoer.value = hintConcept;
        invoer.addEventListener('input', () => { hintConcept = invoer.value; });
        invoer.addEventListener('focus', () => { typt = true; });
        invoer.addEventListener('blur', () => { typt = false; setTimeout(() => ctx.naGebaar(), 50); });
        const verstuur = () => { const t = invoer.value.trim(); if (!t) { ctx.api.toast('Typ eerst een hint'); return; } typt = false; stuurHint(ctx, t); };
        invoer.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); verstuur(); } });
        kaart.append(invoer, knop('knop', 'Verstuur hint', verstuur));
      } else {
        kaart.append(maakSchijf({ doel, toonDoel: false, wijzer: 50 }), uitersten, el('p', 'wl-uitleg', `${NAMEN[gever]} bedenkt een hint…`), el('p', 'uno-laden', '♥'));
      }
    } else if (s.fase === 'raden') {
      kaart.append(el('p', 'wl-hint', `“${s.hint}”`));
      if (ikGeef) {
        kaart.append(maakSchijf({ doel, toonDoel: true, wijzer: typeof s.wijzer === 'number' ? s.wijzer : 50 }), uitersten, el('p', 'wl-uitleg', `${NAMEN[ander(ik)]} schuift de wijzer…`));
      } else {
        kaart.append(maakSchijf({
          doel, toonDoel: false, wijzer: wijzerLokaal, bedienbaar: true,
          opWijzer: (v, klaar) => { wijzerLokaal = v; deelWijzer(ctx, v); if (klaar) ctx.naGebaar(); },
        }), uitersten);
        kaart.append(el('p', 'wl-uitleg', 'Sleep de wijzer naar waar jij denkt dat de plek is.'), knop('knop', 'Hier!', () => kies(ctx, wijzerLokaal)));
      }
    } else {
      const p = ctx.lijst(s.punten)[s.ronde] || 0;
      kaart.append(el('p', 'wl-hint', `“${s.hint}”`), maakSchijf({ doel, toonDoel: true, wijzer: s.wijzer }), uitersten);
      kaart.append(el('p', 'rkg-punten', p === 4 ? '4 punten. Precies raak 🎉' : p ? `${p} punten` : 'Mis. 0 punten 🥲'));
      kaart.append(knop('knop', s.ronde + 1 >= RONDES ? 'Naar de uitslag' : 'Volgende ronde', () => volgende(ctx)));
    }
    scherm.append(kaart);
    wortel.append(scherm);
  }

  OnlineSpel.maak({
    id: 'wavelength',
    naam: 'Wavelength',
    modus: 'samen',
    intro: 'Samen spelen, ieder op je eigen telefoon. De een geeft een hint, de ander zoekt de plek op de schaal. Je speelt als {ik}.',
    nieuwPotje,
    teken,
    bezigMetGebaar: () => sleep || typt,
    stop() { sleep = false; typt = false; clearTimeout(deelTimer); wijzerVoor = null; laatsteCtx = null; },
  });
})();
