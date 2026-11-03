/*
  SPEL: RANKINGSPEL (online, samen)
  ------------------------------------------------------------
  Elke ronde een vraag met 5 antwoorden (CONTENT.ranking). Om de beurt rankt
  de een ze zoals hij of zij het zelf vindt, en de ander raadt die ranking.
  Allebei tegelijk slepen; als allebei klaar zijn zie je ze naast elkaar.
  1 punt per antwoord op precies de goede plek (max 5 per ronde).
  Een potje = 10 rondes (ieder rankt 5 keer), max 50 punten, samen.
  Het beste totaal ooit is het record (records/ranking).
*/
(function () {
  'use strict';

  const RONDES = 10;
  const { ander } = OnlineSpel;

  let content = null;
  // Lokaal: de volgorde die ik aan het slepen ben (per ronde)
  let mijnOrde = null;
  let ordeVoor = null;     // potje:ronde waar mijnOrde bij hoort
  let sleep = null;

  function vraag(i) {
    const [titel, boven, onder, items] = String(content.ranking[i]).split('|').map((x) => x.trim());
    return { titel, boven, onder, items: items.split(';').map((x) => x.trim()) };
  }

  const wieRankt = (s) => (s.ronde % 2 === 0 ? s.begint : ander(s.begint));

  function nieuwPotje(begint, opties, vorige, ctx) {
    content = ctx.api.content;
    const vragen = OnlineSpel.trek('ranking', content.ranking.length, RONDES);
    return {
      status: 'spel',
      potje: Math.random().toString(36).slice(2, 8),
      begint,
      ronde: 0,
      vragen,
      fase: 'kiezen',
      antwoord: null,
      score: 0,
      punten: [],
    };
  }

  // Ingevuld: opslaan; als de ander ook klaar is, tellen
  function stuurIn(ctx, orde) {
    const { ik } = ctx;
    const ronde = ctx.stand.ronde;
    const potje = ctx.stand.potje;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'kiezen') return undefined;
      s.antwoord = s.antwoord || {};
      s.antwoord[ik] = orde;
      if (s.antwoord.wout && s.antwoord.davinia) {
        const rankt = wieRankt(s);
        const echt = s.antwoord[rankt], gok = s.antwoord[ander(rankt)];
        const p = echt.filter((x, i) => x === gok[i]).length;
        s.score = (s.score || 0) + p;
        s.punten = (s.punten || []).concat(p);
        s.fase = 'uitkomst';
      }
      return s;
    });
  }

  function volgende(ctx) {
    const ronde = ctx.stand.ronde;
    const potje = ctx.stand.potje;
    return ctx.zet((s) => {
      if (s.status !== 'spel' || s.potje !== potje || s.ronde !== ronde || s.fase !== 'uitkomst') return undefined;
      if (s.ronde + 1 >= RONDES) { s.status = 'klaar'; return s; }
      s.ronde += 1;
      s.fase = 'kiezen';
      s.antwoord = null;
      return s;
    });
  }

  /* ---------- slepen om de volgorde te veranderen ---------- */
  function koppelSlepen(lijstEl, opnieuw) {
    lijstEl.querySelectorAll('.rkg-item').forEach((item) => {
      item.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const items = [...lijstEl.querySelectorAll('.rkg-item')];
        const r = item.getBoundingClientRect();
        const stap = items.length > 1 ? items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().top : r.height + 8;
        sleep = { item, items, van: items.indexOf(item), naar: items.indexOf(item), y0: e.clientY, stap, pid: e.pointerId };
        try { item.setPointerCapture(e.pointerId); } catch (f) { /* niets */ }
        item.classList.add('sleept');
      });
      item.addEventListener('pointermove', (e) => {
        if (!sleep || e.pointerId !== sleep.pid) return;
        const dy = e.clientY - sleep.y0;
        sleep.item.style.transform = `translateY(${dy}px) scale(1.03)`;
        const naar = Math.max(0, Math.min(sleep.items.length - 1, Math.round(sleep.van + dy / sleep.stap)));
        sleep.naar = naar;
        sleep.items.forEach((it, i) => {
          if (it === sleep.item) return;
          let schuif = 0;
          if (sleep.van < naar && i > sleep.van && i <= naar) schuif = -sleep.stap;
          if (sleep.van > naar && i < sleep.van && i >= naar) schuif = sleep.stap;
          it.style.transform = schuif ? `translateY(${schuif}px)` : '';
        });
      });
      const los = (e) => {
        if (!sleep || e.pointerId !== sleep.pid) return;
        const { van, naar } = sleep;
        sleep = null;
        const [weg] = mijnOrde.splice(van, 1);
        mijnOrde.splice(naar, 0, weg);
        opnieuw();
      };
      item.addEventListener('pointerup', los);
      item.addEventListener('pointercancel', los);
    });
  }

  /* ---------- tekenen ---------- */
  function teken(ctx) {
    const { stand: s, ik, tegen, NAMEN, el, knop, wortel } = ctx;
    content = ctx.api.content;
    if (s.vragen) OnlineSpel.markeer('ranking', ctx.lijst(s.vragen), content.ranking.length);
    wortel.textContent = '';
    const scherm = el('div', 'os-scherm rkg-scherm');

    if (s.status === 'klaar') {
      const score = s.score || 0;
      ctx.zetRecord(score);
      const tekst = score >= 40 ? 'Bijna gedachtenlezers. Eng 💀' : score >= 25 ? 'Niet slecht. We kennen elkaar best goed 👍' : 'Hmm. We moeten wat vaker praten 😂';
      scherm.append(ctx.bovenbalk(), ctx.uitslag({ titel: `Samen ${score} punten`, tekst, score, max: RONDES * 5 }));
      wortel.append(scherm);
      return;
    }

    const v = vraag(ctx.lijst(s.vragen)[s.ronde]);
    const rankt = wieRankt(s);
    const ikRank = rankt === ik;
    scherm.append(ctx.bovenbalk(`Ronde ${s.ronde + 1}/${RONDES} · ${s.score || 0} punten`));

    const kaart = el('div', 'rkg-kaart');
    kaart.append(el('p', 'rkg-wie', ikRank ? 'Jij rankt' : `${NAMEN[rankt]} rankt, jij raadt`), el('h3', 'rkg-titel', v.titel));
    scherm.append(kaart);

    const antwoord = s.antwoord || {};
    if (s.fase === 'kiezen') {
      const sleutel = `${s.potje}:${s.ronde}`;
      if (ordeVoor !== sleutel) { ordeVoor = sleutel; mijnOrde = [0, 1, 2, 3, 4]; }
      const ingevuld = antwoord[ik];
      kaart.append(el('p', 'rkg-uitleg', ingevuld
        ? `Wachten op ${NAMEN[tegen]}…`
        : ikRank ? 'Sleep ze op volgorde zoals jij het vindt.' : `Sleep ze op volgorde zoals jij denkt dat ${NAMEN[rankt]} het vindt.`));
      const orde = ingevuld ? ctx.lijst(ingevuld) : mijnOrde;
      const lijstEl = el('div', 'rkg-lijst' + (ingevuld ? ' vast' : ''));
      lijstEl.append(el('p', 'rkg-pool boven', v.boven));
      orde.forEach((nr, plek) => {
        const item = el('div', 'rkg-item');
        item.append(el('span', 'rkg-nr', String(plek + 1)), el('span', 'rkg-tekst', v.items[nr]));
        if (!ingevuld) item.append(el('span', 'rkg-greep', '⠿'));
        lijstEl.append(item);
      });
      lijstEl.append(el('p', 'rkg-pool onder', v.onder));
      scherm.append(lijstEl);
      if (!ingevuld) {
        koppelSlepen(lijstEl, () => ctx.opnieuw());
        scherm.append(knop('knop', 'Klaar', () => stuurIn(ctx, mijnOrde.slice())));
      } else if (!antwoord[tegen]) {
        scherm.append(el('p', 'uno-laden', '♥'));
      }
    } else {
      // Uitkomst: beide rankings naast elkaar
      const echt = ctx.lijst(antwoord[rankt]), gok = ctx.lijst(antwoord[ander(rankt)]);
      const p = echt.filter((x, i) => x === gok[i]).length;
      const naast = el('div', 'rkg-naast');
      const kolom = (kop, orde, vergelijk) => {
        const k = el('div', 'rkg-kolom');
        k.append(el('p', 'rkg-kolomkop', kop));
        orde.forEach((nr, i) => {
          const goed = vergelijk && nr === vergelijk[i];
          const r = el('div', 'rkg-rij' + (vergelijk ? (goed ? ' goed' : ' fout') : ''));
          r.append(el('span', 'rkg-nr', String(i + 1)), el('span', 'rkg-tekst', v.items[nr]));
          k.append(r);
        });
        return k;
      };
      naast.append(kolom(rankt === ik ? 'Jij' : NAMEN[rankt], echt, null), kolom(ander(rankt) === ik ? 'Jij raadde' : `${NAMEN[ander(rankt)]} raadde`, gok, echt));
      scherm.append(naast);
      scherm.append(el('p', 'rkg-punten', p === 5 ? '5 van 5. Alles goed 🎉' : `${p} van 5 goed`));
      scherm.append(knop('knop', s.ronde + 1 >= RONDES ? 'Naar de uitslag' : 'Volgende ronde', () => volgende(ctx)));
    }
    wortel.append(scherm);
    ctx.naGebaar();
  }

  OnlineSpel.maak({
    id: 'ranking',
    naam: 'Rankingspel',
    modus: 'samen',
    intro: 'Samen spelen, ieder op je eigen telefoon. De een rankt, de ander raadt. Samen punten halen. Je speelt als {ik}.',
    nieuwPotje,
    teken,
    bezigMetGebaar: () => Boolean(sleep),
    stop() { sleep = null; mijnOrde = null; ordeVoor = null; },
  });
})();
