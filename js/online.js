/*
  online.js — verbinding met Firebase (Realtime Database + anoniem inloggen).
  Wordt pas geladen als je een online spel opent, zodat de rest van de app
  ook zonder internet gewoon werkt. Geen npm of build-stap: Firebase komt
  via script-tags van gstatic.com.

  Kamers: /kamers/{CODE} met spel, bijgewerkt, spelers {wout, davinia: uid},
  online {wout, davinia: true/false} en stand (de spelstand).
  Tellers (wie wint hoe vaak): /tellers/{spel}/{naam}.
  De beveiliging staat in database.rules.json (zelf in de Firebase-console plakken).
*/
(function () {
  'use strict';

  const CONFIG = {
    apiKey: 'AIzaSyAUFFtBs4-bwc7nx0kOjShE2kPQdQFWHMQ',
    authDomain: 'jubileumapp.firebaseapp.com',
    databaseURL: 'https://jubileumapp-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'jubileumapp',
    storageBucket: 'jubileumapp.firebasestorage.app',
    messagingSenderId: '198072750467',
    appId: '1:198072750467:web:402bdec83391ddd06666b6',
  };
  const VERSIE = '10.12.2';
  const SDK = ['app', 'auth', 'database'].map((d) => `https://www.gstatic.com/firebasejs/${VERSIE}/firebase-${d}-compat.js`);
  const WOORDEN = ['MAAS', 'HART', 'ZOEN', 'ROZE', 'LILA', 'ZOET', 'TULP', 'BOOT', 'KAAS', 'KLOK'];
  const OPRUIM_NA = 2 * 24 * 60 * 60 * 1000;   // eigen kamers ouder dan 2 dagen opruimen
  const ONTHOUD = 'jubileum.online';

  let verbinding = null;   // belofte: { db, uid }

  function laadScript(src) {
    return new Promise((ok, mis) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => mis(new Error('laden mislukt: ' + src));
      document.head.append(s);
    });
  }

  // Firebase laden en anoniem inloggen (één keer per sessie).
  function start() {
    if (verbinding) return verbinding;
    verbinding = (async () => {
      if (!self.firebase) {
        await laadScript(SDK[0]);
        await Promise.all([laadScript(SDK[1]), laadScript(SDK[2])]);
      }
      if (!firebase.apps.length) firebase.initializeApp(CONFIG);
      const auth = firebase.auth();
      const gebruiker = auth.currentUser || (await auth.signInAnonymously()).user;
      return { db: firebase.database(), uid: gebruiker.uid };
    })();
    verbinding.catch(() => { verbinding = null; });
    return verbinding;
  }

  const nu = () => firebase.database.ServerValue.TIMESTAMP;

  // "hart 22", "hart22" of "HART-22" -> "HART-22"
  function normaliseer(code) {
    const s = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const m = s.match(/^([A-Z]{4})([0-9]{2})$/);
    return m ? `${m[1]}-${m[2]}` : null;
  }

  function nieuweCode() {
    return WOORDEN[Math.floor(Math.random() * WOORDEN.length)] + '-' + (10 + Math.floor(Math.random() * 90));
  }

  // Onthouden welke kamer je speelt (om na wegvallen verder te kunnen)
  function onthouden(spel) {
    try { return (JSON.parse(localStorage.getItem(ONTHOUD)) || {})[spel] || null; } catch (e) { return null; }
  }
  function onthoud(spel, data) {
    try {
      const alles = JSON.parse(localStorage.getItem(ONTHOUD)) || {};
      if (data) alles[spel] = data; else delete alles[spel];
      localStorage.setItem(ONTHOUD, JSON.stringify(alles));
    } catch (e) { /* niets */ }
  }

  // Nieuwe kamer: zoek een vrije code en zet jezelf erin.
  async function maakKamer(spel, naam, beginStand) {
    const { db, uid } = await start();
    await ruimOp(spel);
    for (let poging = 0; poging < 15; poging++) {
      const code = nieuweCode();
      const spelers = await db.ref(`kamers/${code}/spelers`).once('value');
      if (spelers.exists()) continue;   // bezet: andere code
      try {
        await db.ref(`kamers/${code}`).set({ spel, bijgewerkt: nu(), spelers: { [naam]: uid }, stand: beginStand });
        onthoud(spel, { code, naam });
        return code;
      } catch (e) { /* net bezet of oud: volgende code */ }
    }
    throw new Error('geen vrije code gevonden');
  }

  // Meedoen met een bestaande kamer. Fouten: 'onbekend', 'bezet'.
  async function doeMee(spel, code, naam) {
    const { db, uid } = await start();
    const spelers = (await db.ref(`kamers/${code}/spelers`).once('value')).val();
    if (!spelers) throw new Error('onbekend');
    if (spelers[naam] && spelers[naam] !== uid) {
      // Mag alleen als die speler nu niet online is (bv. jij op een nieuw toestel).
      try { await db.ref(`kamers/${code}/spelers/${naam}`).set(uid); } catch (e) { throw new Error('bezet'); }
    } else if (!spelers[naam]) {
      await db.ref(`kamers/${code}/spelers/${naam}`).set(uid);
    }
    onthoud(spel, { code, naam });
    return code;
  }

  // Laten zien dat je online bent; bij wegvallen zet Firebase het zelf op false.
  async function aanwezig(code, naam) {
    const { db } = await start();
    const plek = db.ref(`kamers/${code}/online/${naam}`);
    const info = db.ref('.info/connected');
    const fn = (snap) => {
      if (snap.val() !== true) return;
      plek.onDisconnect().set(false).then(() => plek.set(true)).catch(() => {});
    };
    info.on('value', fn);
    return () => { info.off('value', fn); plek.set(false).catch(() => {}); };
  }

  // Eigen oude kamers opruimen (ouder dan OPRUIM_NA, en niet de laatst onthouden kamer).
  async function ruimOp(spel) {
    const { db } = await start();
    let lijst = [];
    try { lijst = JSON.parse(localStorage.getItem(ONTHOUD + '.oud')) || []; } catch (e) { /* niets */ }
    const laatste = onthouden(spel);
    if (laatste) lijst.push(laatste.code);
    const blijven = [];
    for (const code of [...new Set(lijst)]) {
      try {
        const b = (await db.ref(`kamers/${code}/bijgewerkt`).once('value')).val();
        if (b && Date.now() - b > OPRUIM_NA) await db.ref(`kamers/${code}`).remove();
        else if (b) blijven.push(code);
      } catch (e) { /* geen toegang meer: vergeten */ }
    }
    try { localStorage.setItem(ONTHOUD + '.oud', JSON.stringify(blijven)); } catch (e) { /* niets */ }
  }

  // Teller ophogen (wie wint hoe vaak)
  async function telOp(spel, naam) {
    const { db } = await start();
    await db.ref(`tellers/${spel}/${naam}`).transaction((n) => (n || 0) + 1);
  }

  self.Online = { start, normaliseer, maakKamer, doeMee, aanwezig, onthouden, onthoud, telOp, nu };
})();
