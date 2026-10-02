/*
  ============================================================
  CONTENT.JS — alle persoonlijke inhoud van de app
  ============================================================
  Hier vul jij (Wout) alles zelf in. De code van de spelletjes
  hoef je niet aan te raken.

  Spelregels voor dit bestand:
  - Tekst staat altijd tussen aanhalingstekens: 'zo' of "zo".
    Wil je een ' in je tekst? Gebruik dan "dubbele" aanhalingstekens
    eromheen: "Davinia's lievelingseten".
  - Na elk item in een lijst komt een komma.
  - Foto's: zet ze in de map images/ (verkleind, zie README in die map)
    en schrijf hier het pad, bijvoorbeeld 'images/eerste-date.jpg'.
  - Zoek op "TODO" om te zien wat je nog moet invullen.
  - Opgeslagen en de app doet raar? Waarschijnlijk een komma of
    aanhalingsteken vergeten. Vraag Claude om te helpen zoeken.

  Nu staan er overal voorbeeld-foto's (images/voorbeeld-1.jpg t/m 8)
  en voorbeeldteksten in, zodat alles al werkt.
*/

self.CONTENT = {

  // ----------------------------------------------------------
  // ALGEMEEN
  // ----------------------------------------------------------
  algemeen: {
    naamZij: 'Davinia',
    naamIk: 'Wout',
    // TODO: de echte datum waarop jullie samen zijn (jaar-maand-dag).
    samenSinds: '2025-11-15',
    // Korte tekst bovenaan het hoofdmenu.
    // TODO: maak hem persoonlijk.
    welkom: 'Een jaar vol ons. Speel alles in je eigen tempo, er is geen haast. 💕',
  },

  // ----------------------------------------------------------
  // 2. QUIZ OVER ONS
  // ----------------------------------------------------------
  // Meerkeuzevragen. 'goed' is het nummer van het goede antwoord,
  // beginnend bij 0 (0 = eerste optie, 1 = tweede, enz.).
  // 'foto' mag je weglaten. 'reactie' verschijnt na het antwoorden.
  //
  // Ideeën voor vragen:
  // - Waar hadden we onze eerste date? / Wat aten we toen?
  // - Wie zei het eerst "ik hou van je"? En waar?
  // - Wat is mijn lievelingsbijnaam voor jou?
  // - Welk liedje doet ons altijd aan elkaar denken?
  // - Wat bestel ik altijd bij de afhaal?
  // - Welk cijfer gaf ik onze eerste vakantie?
  // - Wat was het eerste cadeautje dat ik je gaf?
  // - Welke film hebben we het vaakst samen gekeken?
  quiz: [
    {
      vraag: 'Waar hadden we onze allereerste date?',            // TODO
      foto: 'images/voorbeeld-1.jpg',                           // TODO (of weglaten)
      opties: ['In de bioscoop', 'Op een terrasje', 'Bij het strand', 'In een museum'],
      goed: 1,
      reactie: 'Ik was zó zenuwachtig dat ik mijn koffie bijna omgooide. ☕',
    },
    {
      vraag: 'Wie zei als eerste "ik hou van jou"?',             // TODO
      opties: ['Wout', 'Davinia', 'Tegelijk', 'Nog steeds niemand 😉'],
      goed: 0,
      reactie: 'En ik meende het meteen. 💗',
    },
    {
      vraag: 'Wat bestel ik altijd bij de afhaal?',              // TODO
      opties: ['Pizza', 'Sushi', 'Shoarma', 'Iets anders, maar wel het lekkerste'],
      goed: 1,
      reactie: 'Voorspelbaar? Misschien. Lekker? Zeker.',
    },
  ],

  // ----------------------------------------------------------
  // 3. WIE VAN ONS TWEE?
  // ----------------------------------------------------------
  // 'antwoord' is 'Wout', 'Davinia' of 'Allebei'.
  //
  // Ideeën:
  // - Wie is het vaakst te laat? / Wie kan het slechtst tegen kou?
  // - Wie valt als eerste in slaap bij een film?
  // - Wie pikt altijd de dekens? / Wie zingt het hardst in de auto?
  // - Wie zei als eerste sorry na onze eerste ruzie?
  // - Wie kan beter koken? / Wie is de beste planner?
  wieVanOns: [
    { stelling: 'Wie valt als eerste in slaap tijdens een film?', antwoord: 'Davinia', reactie: 'Halverwege de film, elke keer. Schattig. 😴' },  // TODO
    { stelling: 'Wie pikt \'s nachts altijd de dekens?',          antwoord: 'Wout',    reactie: 'Ik ontken alles.' },                               // TODO
    { stelling: 'Wie zingt het hardst mee in de auto?',           antwoord: 'Allebei', reactie: 'De buren weten ervan. 🎤' },                       // TODO
  ],

  // ----------------------------------------------------------
  // 4. FOTOSPELLEN
  // ----------------------------------------------------------
  fotos: {
    // Memory: elke foto komt twee keer in het spel. 6 tot 8 foto's is fijn.
    // Tip: vierkante-achtige foto's met één duidelijk onderwerp werken het best.
    memory: [
      'images/voorbeeld-1.jpg',   // TODO
      'images/voorbeeld-2.jpg',
      'images/voorbeeld-3.jpg',
      'images/voorbeeld-4.jpg',
      'images/voorbeeld-5.jpg',
      'images/voorbeeld-6.jpg',
    ],
    // Raad de plek of datum bij een foto.
    raadDePlek: [
      {
        foto: 'images/voorbeeld-7.jpg',                                   // TODO
        vraag: 'Waar is deze foto gemaakt?',
        opties: ['Valletta', 'Mdina', 'Gozo', 'Sliema'],
        goed: 2,
        reactie: 'Die dag met de boot naar Gozo. Wat een uitzicht. ⛵',
      },
      {
        foto: 'images/voorbeeld-8.jpg',                                   // TODO
        vraag: 'Wanneer was dit?',
        opties: ['Januari', 'Maart', 'Juni', 'September'],
        goed: 2,
        reactie: 'De langste dag van het jaar, en hij was nog te kort.',
      },
    ],
  },

  // ----------------------------------------------------------
  // 5. TIJDLIJN
  // ----------------------------------------------------------
  // Zet de momenten hier in de JUISTE volgorde (oudste eerst).
  // Het spel husselt ze zelf door elkaar.
  //
  // Ideeën: eerste ontmoeting, eerste date, eerste kus, officieel samen,
  // eerste vakantie (Malta!), elkaars familie ontmoeten, eerste
  // feestdag samen, iets geks dat jullie samen deden.
  tijdlijn: [
    { datum: 'november 2025', titel: 'Onze eerste date', foto: 'images/voorbeeld-1.jpg', tekst: 'Het begin van alles.' },          // TODO
    { datum: 'december 2025', titel: 'Kerst samen',      foto: 'images/voorbeeld-2.jpg', tekst: 'Te veel gegeten, nul spijt.' },   // TODO
    { datum: 'voorjaar 2026', titel: 'Malta',            foto: 'images/voorbeeld-3.jpg', tekst: 'Zon, zee en sudoku’s.' },          // TODO
    { datum: 'zomer 2026',    titel: 'Festival',         foto: 'images/voorbeeld-4.jpg', tekst: 'Tot de laatste plaat.' },          // TODO
  ],

  // ----------------------------------------------------------
  // 6. WOORDSPEL
  // ----------------------------------------------------------
  woordspel: {
    // Wordle: precies 5 letters, zonder spaties of accenten.
    // 'uitleg' verschijnt als het woord geraden is.
    wordle: [
      { woord: 'MALTA', uitleg: 'Onze reis vol zon en sudoku’s.' },        // TODO
      { woord: 'KUSJE', uitleg: 'Daar krijg ik er nooit genoeg van.' },     // TODO
      { woord: 'PIZZA', uitleg: 'Vrijdagavond = pizza-avond.' },            // TODO
    ],
    // Galgje: mag langer zijn, spaties mogen (bv. 'EERSTE DATE').
    galgje: [
      { woord: 'ZONSONDERGANG', hint: 'Mooiste moment van de dag in Malta' }, // TODO
      { woord: 'EERSTE DATE',   hint: 'Waar het allemaal begon' },          // TODO
      { woord: 'KNUFFELBEER',   hint: 'Hoe ik je soms noem' },              // TODO
    ],
  },

  // ----------------------------------------------------------
  // 7. HARTJESBLOKKEN
  // ----------------------------------------------------------
  hartjesblokken: {
    // Deze foto staat vervaagd op de achtergrond en wordt steeds scherper.
    achtergrondFoto: 'images/voorbeeld-5.jpg',   // TODO
    // Bij elke weggespeelde rij verschijnt kort één van deze berichtjes.
    // Kort houden (max ± 8 woorden), het verschijnt maar even.
    berichtjes: [
      'Jij maakt elke dag beter 💗',   // TODO: maak ze persoonlijk
      'Ik ben zo trots op jou',
      'Jouw lach is mijn favoriet',
      'Nog heel veel jaren, graag',
      'Jij bent mijn thuis',
      'Ik denk de hele dag aan je',
      'Beste beslissing ooit: jij',
      'Mijn hart zegt: Davinia',
    ],
  },

  // ----------------------------------------------------------
  // 8. SUDOKU (Malta)
  // ----------------------------------------------------------
  sudoku: {
    // Elk opgelost 3x3-vak speelt één herinnering vrij: precies 9 stuks.
    maltaHerinneringen: [
      { foto: 'images/voorbeeld-1.jpg', bijschrift: 'Eerste avond in Valletta' },   // TODO
      { foto: 'images/voorbeeld-2.jpg', bijschrift: 'Pastizzi als ontbijt' },       // TODO
      { foto: 'images/voorbeeld-3.jpg', bijschrift: 'De Blue Lagoon' },             // TODO
      { foto: 'images/voorbeeld-4.jpg', bijschrift: 'Sudoku op het terras' },       // TODO
      { foto: 'images/voorbeeld-5.jpg', bijschrift: 'Verdwaald in Mdina' },         // TODO
      { foto: 'images/voorbeeld-6.jpg', bijschrift: 'Zonsondergang bij de kust' },  // TODO
      { foto: 'images/voorbeeld-7.jpg', bijschrift: 'Met de boot naar Gozo' },      // TODO
      { foto: 'images/voorbeeld-8.jpg', bijschrift: 'Ijsje nummer drie die dag' },  // TODO
      { foto: 'images/voorbeeld-1.jpg', bijschrift: 'Laatste avond, nog niet naar huis' }, // TODO
    ],
  },

  // ----------------------------------------------------------
  // 9. WOORDZOEKER EN KRUISWOORD
  // ----------------------------------------------------------
  woordzoeker: {
    // Woorden zonder spaties, max 10 letters. 8 tot 12 woorden is fijn.
    woorden: ['MALTA', 'KUSJE', 'SUDOKU', 'PIZZA', 'ZEE', 'KNUFFEL', 'DATE', 'LIEFDE', 'SAMEN', 'HARTJE'], // TODO
    // Kleine kruiswoordpuzzel: woord + hint (optioneel, 5 tot 8 stuks).
    kruiswoord: [
      { woord: 'MALTA',  hint: 'Ons sudoku-eiland' },             // TODO
      { woord: 'KOFFIE', hint: 'Wat we dronken op onze eerste date' }, // TODO
      { woord: 'NOVEMBER', hint: 'De maand waarin het begon' },   // TODO
      { woord: 'KNUFFEL', hint: 'Altijd goed, nooit genoeg' },    // TODO
    ],
  },

  // ----------------------------------------------------------
  // 10. DIT OF DAT
  // ----------------------------------------------------------
  // Davinia raadt wat JIJ zou kiezen. 'mijnKeuze' is 'a' of 'b'.
  //
  // Ideeën: strand of bergen, zoet of hartig, ochtend of avond,
  // film of serie, pizza of pasta, katten of honden, thee of koffie,
  // vroeg op vakantie of uitslapen, bellen of appen, zomer of winter.
  ditOfDat: [
    { a: 'Strand', b: 'Bergen', mijnKeuze: 'a', reactie: 'Zolang jij erbij bent, maakt het eigenlijk niet uit.' }, // TODO
    { a: 'Pizza',  b: 'Pasta',  mijnKeuze: 'a', reactie: 'Was dit echt een vraag?' },                             // TODO
    { a: 'Film',   b: 'Serie',  mijnKeuze: 'b', reactie: 'Nog één aflevering… 📺' },                              // TODO
  ],

  // ----------------------------------------------------------
  // 11. BRIEVENBUS
  // ----------------------------------------------------------
  // Liefdesbriefjes die vrijkomen als een spel klaar is.
  // 'vrijBij' is de naam van het spel:
  //   quiz, wie, fotos, tijdlijn, woordspel, hartjesblokken,
  //   sudoku, woordzoeker, ditofdat, kleuren
  // Tip: schrijf ze op een rustig moment, kort en echt. Bijvoorbeeld:
  // iets wat je nog nooit hebt gezegd, een herinnering waar je vaak aan
  // denkt, waarom je verliefd werd, waar je naar uitkijkt.
  brieven: [
    { vrijBij: 'quiz',     titel: 'Over die eerste date', tekst: 'Lieve Davinia,\n\nTODO: schrijf hier je eerste briefje.\n\nXxx Wout' },
    { vrijBij: 'wie',      titel: 'Wat ik aan je zie',    tekst: 'TODO' },
    { vrijBij: 'fotos',    titel: 'Mijn favoriete foto',  tekst: 'TODO' },
    { vrijBij: 'tijdlijn', titel: 'Ons jaar',             tekst: 'TODO' },
  ],

  // ----------------------------------------------------------
  // 12. KLEUREN OP NUMMER
  // ----------------------------------------------------------
  // Rastergrootte en aantal kleuren kiezen we samen bij stap 12,
  // nadat je een eigen foto hebt getest.
  kleurplaten: [
    { foto: 'images/voorbeeld-6.jpg', kolommen: 30, rijen: 40, kleuren: 10, bijschrift: 'TODO: een lief bijschrift' },
  ],
};
