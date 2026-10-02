/*
  ============================================================
  CONTENT.JS — alle persoonlijke inhoud van de app
  ============================================================
  Hier staat alles wat over jullie tweeën gaat. De code van de
  spelletjes hoef je niet aan te raken.

  Spelregels voor dit bestand:
  - Tekst staat altijd tussen aanhalingstekens: 'zo' of "zo".
    Wil je een ' in je tekst? Gebruik dan "dubbele" aanhalingstekens
    eromheen: "Davinia's lievelingseten".
  - Na elk item in een lijst komt een komma.
  - Foto's: zet ze in de map images/ (verkleind, zie README in die map)
    en schrijf hier het pad, bijvoorbeeld 'images/foto-07.jpg'.
  - Zoek op "TODO" om te zien wat je nog moet invullen.
  - Opgeslagen en de app doet raar? Waarschijnlijk een komma of
    aanhalingsteken vergeten. Vraag Claude om te helpen zoeken.

  De reacties na een antwoord ('reactie') zijn een voorzet van Claude.
  Pas ze vooral aan naar je eigen woorden.
*/

self.CONTENT = {

  // ----------------------------------------------------------
  // ALGEMEEN
  // ----------------------------------------------------------
  algemeen: {
    naamZij: 'Davinia',
    naamIk: 'Wout',
    // De dag dat jullie officieel samen zijn: 22 november 2025.
    samenSinds: '2025-11-22',
    // Terugkerende thema's in de hele app.
    onsGetal: 22,
    onsPlekje: 'de Maas',
    // Korte tekst bovenaan het hoofdmenu.
    welkom: 'Een jaar vol ons. Speel alles in je eigen tempo, er is geen haast. 💕',
  },

  // ----------------------------------------------------------
  // FEITEN OVER ONS
  // ----------------------------------------------------------
  // Niet voor één spel, maar als bron voor alle spellen (en voor Claude,
  // als er later nieuwe vragen of hints bij moeten komen).
  feiten: {
    begin: 'We kenden elkaar via school. Het echte contact begon toen Wout haar een DM stuurde op Instagram.',
    eersteDate: "Een terras met een arcadehal erbij, daarna een ijsje bij de McDonald's en opgegeten bij de Maas.",
    tweedeDate: 'Samen brownies gebakken.',
    derdeDate: "De eerste kus, 's avonds buiten liggend bij de Maas.",
    officieel: '22 november: Wout vroeg haar verkering in de auto bij de Maas. Die dag hadden ze hun eerste date nagedaan.',
    onsGetal: '22 is ons getal, de Maas is ons plekje.',
    etenSamen: "Af en toe McDonald's, en aardbeien met chocola.",
    malta: "Malta, 30 juli t/m 6 augustus, hotel in Qawra. Comino en de Blue Lagoon, Valletta, Mdina, een waterpark, een boottocht (3 augustus, vanuit Mgarr), een busongeluk (nu een grappig verhaal), 's avonds cocktails met vragenspellen en veel sudoku's.",
    optreden: 'Davinia treedt op (o.a. met de Angels, een illusionistengroep); Wout gaat soms kijken.',
    // Momenten door het jaar heen, in volgorde.
    momenten: [
      '22 dec 2025: kerstmarkt in Düsseldorf, Wouts verjaardagscadeau voor Davinia, samen met een kerstpyjama.',
      'Kerst 2025 samen gevierd.',
      '31 dec 2025: oud & nieuw met de vrienden van Wout.',
      '10 jan 2026: feest van Davinia.',
      '14 feb 2026 (Valentijnsdag): concert van CHO in de Ziggo Dome.',
      '15 feb 2026: carnaval samen.',
      '24 t/m 26 apr 2026: Wout 3 dagen bij Davinia in Slagharen, waar ze optrad met de Angels.',
      '22 mei 2026: half jaar samen, dagje Utrecht.',
      '4 jul 2026: festival Vunzige Deuntjes, waar Davinia zelf moest dansen (Wout stond te kijken).',
      'Davinia heeft ook op Zwarte Cross gedanst; daar was Wout niet bij.',
      '25 jul 2026: BBQ bij vrienden van haar gezin, daarna de kermis in Tilburg.',
      '30 jul t/m 6 aug 2026: Malta (boottocht vanuit Mgarr op 3 aug).',
    ],
  },

  // ----------------------------------------------------------
  // UITLEG BIJ DE FOTO'S
  // ----------------------------------------------------------
  // Per foto uit images/: waar, wanneer, het verhaal erachter en een
  // bijschrift (voorstel van Claude in jouw stem; pas gerust aan).
  // Hiermee kiezen we welke foto bij welk spel past. Foto's met
  // overslaan: true gebruiken we nergens.
  fotoUitleg: {
    'foto-01': { plek: 'Restaurant, uit eten met mijn gezin', wanneer: '24 december 2025 (kerstavond)', verhaal: 'Kerstavond uit eten met mijn familie, samen met Davinia.', bijschrift: 'Kerstavond met mijn familie, en jij aan mijn zij. 🎄' },
    'foto-02': { plek: 'Kerstmarkt Düsseldorf, in het reuzenrad', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf: mijn verjaardagscadeau voor jou, samen met een kerstpyjama.', bijschrift: 'Hoog in het reuzenrad, en het mooiste uitzicht zat gewoon naast me. 🎡' },
    'foto-03': { plek: 'Düsseldorf, aan het water', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Koude handen, rode wangen, warm hart. ❄️' },
    'foto-04': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Op het ijs, maar ik voelde alleen maar warmte. ⛸️' },
    'foto-05': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Jouw cadeau, maar ik kreeg er zelf ook een herinnering voor altijd bij. 💝' },
    'foto-06': { plek: 'Düsseldorf', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Een spiegel, jij en ik. Meer heeft een goede foto niet nodig. ✌️' },
    'foto-07': { plek: 'Bij Davinia thuis', wanneer: '24 december 2025 (kerstavond)', verhaal: 'Bij jou thuis, net voordat we met mijn gezin uit eten gingen op kerstavond.', bijschrift: 'Helemaal klaar voor kerstavond, en jij straalde nog meer dan de lichtjes. ✨' },
    'foto-08': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: 'De laatste kus van 2025, de eerste van heel veel in 2026. 🎆' },
    'foto-09': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: 'Het nieuwe jaar in, met jou. Een beter begin bestaat niet. 🥂' },
  },

  // ----------------------------------------------------------
  // 2. QUIZ OVER ONS
  // ----------------------------------------------------------
  // Meerkeuzevragen. 'goed' is het nummer van het goede antwoord,
  // beginnend bij 0 (0 = eerste optie, 1 = tweede, enz.).
  // Hieronder staat het goede antwoord overal als eerste; de app
  // husselt de opties bij elk spelletje zelf door elkaar.
  //
  // 'foto' mag je weglaten. 'reactie' verschijnt na het antwoorden.
  quiz: [
    {
      vraag: 'Hoe begon ons echte contact?',
      opties: ['Wout stuurde een DM op Instagram', 'Davinia stuurde een Snapchat', 'We spraken af na school', 'Via een vriendin'],
      goed: 0,
      reactie: 'Ik heb dat berichtje echt vier keer herschreven voor ik op verzenden durfde te drukken. 📱',
    },
    {
      vraag: 'Waar zaten we op onze eerste date?',
      opties: ['Op een terras met een arcadehal', 'In de bioscoop', 'Bij het bowlen', 'In een restaurant'],
      goed: 0,
      reactie: 'Een terrasje én een arcadehal. Ik wist niet of ik je wilde imponeren of verslaan. 🕹️',
    },
    {
      vraag: 'Waar aten we ons eerste ijsje op?',
      opties: ['Bij de Maas', 'In het park', 'In de auto', 'Op het terras'],
      goed: 0,
      reactie: 'Het begin van ons plekje. Hoe vaak zijn we daar nu al geweest?',
    },
    {
      vraag: 'Wat deden we op onze tweede date?',
      opties: ['Brownies bakken', 'Pizza bestellen', 'Film kijken', 'Shoppen'],
      goed: 0,
      reactie: 'Brownies bakken. Nog steeds de beste smoes om een hele avond in de keuken te blijven hangen. 🍫',
    },
    {
      vraag: 'Waar was onze eerste kus?',
      opties: ["Bij de Maas, 's avonds buiten", 'In de auto', 'Bij het afscheid op de eerste date', 'Bij jou thuis'],
      goed: 0,
      reactie: 'Buiten liggen bij de Maas, en toen durfde ik eindelijk. 💗',
    },
    {
      vraag: 'Op welke date was onze eerste kus?',
      opties: ['De derde', 'De eerste', 'De tweede', 'De vijfde'],
      goed: 0,
      reactie: 'Derde keer goed. Ik hield het gewoon even spannend.',
    },
    {
      vraag: 'Wanneer werden we officieel?',
      opties: ['22 november', '22 oktober', '12 november', '2 december'],
      goed: 0,
      reactie: '22 november. Sindsdien ons getal. 💫',
    },
    {
      vraag: 'Wat deden we op de dag dat ik je verkering vroeg?',
      opties: ['Onze eerste date naspelen', 'Uit eten', 'Naar de film', 'Een dagje weg'],
      goed: 0,
      reactie: 'Alles nog een keer precies hetzelfde, zodat het einde anders kon zijn.',
    },
    {
      vraag: 'Waar vroeg ik je verkering?',
      opties: ['In de auto bij de Maas', 'Op het terras', 'Bij jou thuis', 'Op een bankje in de stad'],
      goed: 0,
      reactie: 'In de auto bij de Maas. Mijn handen trilden meer dan ik toegaf. 🚗',
    },
    {
      vraag: 'In welke plaats op Malta zat ons hotel?',
      opties: ['Qawra', 'Valletta', 'Sliema', 'Mdina'],
      goed: 0,
      reactie: 'Qawra. Een week lang dezelfde weg naar het strand, en toch elke dag anders. ☀️',
    },
    {
      vraag: 'Van wanneer tot wanneer waren we op Malta?',
      opties: ['30 juli t/m 6 augustus', '22 t/m 29 juli', '1 t/m 8 augustus', '6 t/m 13 augustus'],
      goed: 0,
      reactie: 'Acht dagen die veel te snel voorbij waren.',
    },
    {
      vraag: 'Welke lekkernij eten we graag samen?',
      opties: ['Aardbeien met chocola', 'Pannenkoeken', 'Sushi', 'Popcorn'],
      goed: 0,
      reactie: 'Aardbeien met chocola. Nooit genoeg aardbeien, altijd te veel chocola. 🍓',
    },
    {
      vraag: "Wat deden we 's avonds op Malta bij de cocktails?",
      opties: ['Vragenspellen', 'Karaoke', 'Kaarten', 'Dansen'],
      goed: 0,
      reactie: 'Vragenspellen. Ik dacht dat ik je al kende, en toch leerde ik die avonden nieuwe dingen. 🍹',
    },
    {
      vraag: 'Wat ging er mis op Malta?',
      opties: ['We hadden een busongeluk', 'We misten ons vliegtuig', 'We raakten de hotelsleutel kwijt', 'Alles regende weg'],
      goed: 0,
      reactie: 'Toen helemaal niet grappig. Nu een verhaal dat we blijven vertellen. 🚌',
    },
    {
      vraag: 'Wat is ons getal?',
      opties: ['22', '7', '11', '14'],
      goed: 0,
      reactie: '22. Ik zie het nu overal, en ik denk elke keer aan jou.',
    },
    {
      vraag: 'Naar welke stad gingen we voor de kerstmarkt?',
      opties: ['Düsseldorf', 'Keulen', 'Aken', 'Maastricht'],
      goed: 0,
      reactie: 'Lichtjes, glühwein en jij met rode wangen van de kou. Mijn beste cadeau-idee ooit. 🎄',
    },
    {
      vraag: 'Wat kreeg je naast de kerstmarkt nog voor je verjaardag?',
      opties: ['Een kerstpyjama', 'Een kerstmuts', 'Een fotoboek', 'Een sieraad'],
      goed: 0,
      reactie: 'Een kerstpyjama. Officieel voor jou, stiekem ook een beetje voor mij. 🎁',
    },
    {
      vraag: 'Naar welk concert gingen we op Valentijnsdag?',
      opties: ['CHO in de Ziggo Dome', 'Snelle in de Ziggo Dome', 'CHO in AFAS Live', 'Kris Kross Amsterdam in de Ziggo Dome'],
      goed: 0,
      reactie: 'Valentijnsdag in de Ziggo Dome. Ik keek volgens mij vaker naar jou dan naar het podium. 🎤',
    },
    {
      vraag: 'Waar gingen we heen toen we een half jaar samen waren?',
      opties: ['Utrecht', 'Amsterdam', 'Rotterdam', 'Den Bosch'],
      goed: 0,
      reactie: 'Een half jaar, en ik wist toen al niet meer hoe het was zonder jou.',
    },
    {
      vraag: 'Hoeveel dagen was ik bij je in Slagharen?',
      opties: ['3', '1', '2', '5'],
      goed: 0,
      reactie: 'Drie dagen. Ik had er zo nog drie aan vastgeplakt.',
    },
    {
      vraag: 'Met welke groep trad je op in Slagharen?',
      opties: ['De Angels', 'De Stars', 'De Illusions', 'De Magics'],
      goed: 0,
      reactie: 'De Angels. Ik zat in het publiek en dacht alleen maar: die daar, dat is mijn vriendin. ✨',
    },
    {
      vraag: 'Op welk festival danste je terwijl ik stond te kijken?',
      opties: ['Vunzige Deuntjes', 'Pinkpop', 'Lowlands', 'Defqon'],
      goed: 0,
      reactie: 'Jij op het podium. Ik was de trotste persoon in het hele publiek. 💃',
    },
    {
      vraag: 'Waar gingen we heen na de BBQ bij vrienden van je gezin?',
      opties: ['De kermis in Tilburg', 'Het strand', 'Naar huis', 'De kermis in Den Bosch'],
      goed: 0,
      reactie: 'Eerst lekker eten, daarna de kermis op. Zo’n avond waarop alles gewoon klopte. 🎡',
    },
    {
      vraag: 'Waar vertrok onze boottocht op Malta?',
      opties: ['Mgarr', 'Valletta', 'Sliema', 'Qawra'],
      goed: 0,
      reactie: 'Vanuit Mgarr de zee op. Zon, zout water en jij naast me: meer had ik niet nodig. ⛵',
    },
    {
      vraag: 'Met wie vierden we oud & nieuw?',
      opties: ['Met mijn vrienden', 'Met jouw familie', "Met z'n tweeën", 'Met mijn familie'],
      goed: 0,
      reactie: 'Het nieuwe jaar in met mijn vrienden, en met jou. Toen wist ik al: dit wordt een goed jaar. 🎆',
    },
  ],

  // ----------------------------------------------------------
  // 3. WIE VAN ONS TWEE?
  // ----------------------------------------------------------
  // 'antwoord' is 'Wout', 'Davinia' of 'Allebei'.
  wieVanOns: [
    { stelling: 'Wie is meestal te laat?',                            antwoord: 'Davinia', reactie: 'Ik reken er inmiddels gewoon tien minuten bij. 🕐' },
    { stelling: 'Wie valt als eerste in slaap bij een film?',         antwoord: 'Davinia', reactie: 'Halverwege, elke keer. En dan nog volhouden dat je wakker was. 😴' },
    { stelling: 'Wie heeft het langst nodig om zich klaar te maken?', antwoord: 'Davinia', reactie: 'Het resultaat is het wachten altijd waard. 💄' },
    { stelling: 'Wie zei als eerste "ik hou van jou"?',               antwoord: 'Wout',    reactie: 'Ik hield het niet meer binnen. En ik meende het meteen. 💗' },
    { stelling: 'Wie kan nooit kiezen wat we gaan eten?',             antwoord: 'Allebei', reactie: '"Maakt mij niet uit." "Mij ook niet." En een uur later nog niets besloten. 🍕' },
    { stelling: 'Wie is het meest competitief?',                      antwoord: 'Allebei', reactie: 'Allebei even erg… maar Wout wint altijd 😉' },
    { stelling: 'Wie kan beter koken?',                               antwoord: 'Davinia', reactie: 'Jij kookt, ik doe de afwas. Eerlijke verdeling, toch? 🍳' },
    { stelling: "Wie maakt de meeste foto's?",                        antwoord: 'Davinia', reactie: 'Zonder jou had ik van ons hele jaar ongeveer drie foto’s gehad. 📸' },
    { stelling: 'Wie is het eerst moe op een festival of feest?',     antwoord: 'Allebei', reactie: 'Eerst de hele avond los, en dan allebei tegelijk op zoek naar een plekje om te zitten. 😅' },
    { stelling: 'Wie zou het eerst verdwalen in Mdina?',              antwoord: 'Davinia', reactie: 'Al die steegjes lijken op elkaar. Gelukkig liep ik naast je. 🧭' },
    { stelling: 'Wie stuurt de meeste berichtjes overdag?',           antwoord: 'Wout',    reactie: 'Dat ben ik… maar dat komt ook doordat jij vaak aan het dansen bent 💃' },
  ],

  // ----------------------------------------------------------
  // 4. FOTOSPELLEN
  // ----------------------------------------------------------
  fotos: {
    // Memory: elke foto komt twee keer in het spel. 6 tot 8 foto's is fijn.
    // TODO (stap 4): kies hier foto's uit images/foto-01.jpg t/m foto-39.jpg.
    memory: [
      'images/voorbeeld-1.jpg',
      'images/voorbeeld-2.jpg',
      'images/voorbeeld-3.jpg',
      'images/voorbeeld-4.jpg',
      'images/voorbeeld-5.jpg',
      'images/voorbeeld-6.jpg',
    ],
    // Raad de plek of datum bij een foto.
    // TODO (stap 4): vervangen door echte foto's met echte vragen.
    raadDePlek: [
      {
        foto: 'images/voorbeeld-7.jpg',
        vraag: 'Waar is deze foto gemaakt?',
        opties: ['Comino', 'Mdina', 'Valletta', 'Qawra'],
        goed: 0,
        reactie: 'De Blue Lagoon. Dat water leek nep.',
      },
      {
        foto: 'images/voorbeeld-8.jpg',
        vraag: 'Wanneer was dit?',
        opties: ['Augustus', 'Maart', 'Juni', 'September'],
        goed: 0,
        reactie: 'Onze laatste dagen op Malta.',
      },
    ],
  },

  // ----------------------------------------------------------
  // 5. TIJDLIJN
  // ----------------------------------------------------------
  // De momenten staan hier in de JUISTE volgorde (oudste eerst).
  // Het spel husselt ze zelf door elkaar.
  // TODO (stap 5): bij elk moment een foto kiezen uit images/.
  tijdlijn: [
    { datum: 'het begin',        titel: 'Een DM op Instagram',   tekst: 'Ik stuurde het eerste berichtje. Beste beslissing ooit.' },
    { datum: 'eerste date',      titel: 'Terras, arcade, ijsje', tekst: 'En dat ijsje opgegeten bij de Maas.' },
    { datum: 'tweede date',      titel: 'Brownies bakken',       tekst: 'De keuken overleefde het net.' },
    { datum: 'derde date',       titel: 'Onze eerste kus',       tekst: "'s Avonds buiten liggen bij de Maas." },
    { datum: '22 november 2025', titel: 'Officieel samen',       tekst: 'In de auto bij de Maas, nadat we onze eerste date hadden nagedaan.' },
    { datum: '22 december 2025', titel: 'Kerstmarkt Düsseldorf', tekst: 'Jouw verjaardagscadeau, met een kerstpyjama erbij.' },
    { datum: '31 december 2025', titel: 'Oud & nieuw',           tekst: 'Het nieuwe jaar in met mijn vrienden, en met jou.' },
    { datum: '14 februari 2026', titel: 'CHO op Valentijnsdag',  tekst: 'Samen in de Ziggo Dome.' },
    { datum: '15 februari 2026', titel: 'Carnaval',              tekst: 'Een dag later meteen weer feest.' },
    { datum: '24 april 2026',    titel: 'Slagharen',             tekst: 'Drie dagen bij jou, en jij op het podium met de Angels.' },
    { datum: '22 mei 2026',      titel: 'Half jaar in Utrecht',  tekst: 'Een half jaar samen, een dagje Utrecht.' },
    { datum: '4 juli 2026',      titel: 'Vunzige Deuntjes',      tekst: 'Jij moest dansen, ik stond trots te kijken.' },
    { datum: '25 juli 2026',     titel: 'BBQ en kermis',         tekst: 'BBQ bij vrienden van jouw gezin, daarna de kermis in Tilburg.' },
    { datum: '30 juli 2026',     titel: 'Malta',                 tekst: "Qawra, de Blue Lagoon, sudoku's en cocktails." },
    { datum: '22 november 2026', titel: 'Eén jaar samen',        tekst: 'En dit is pas het begin. 💗' },
  ],

  // ----------------------------------------------------------
  // 6. WOORDSPEL
  // ----------------------------------------------------------
  woordspel: {
    // Wordle: precies 5 letters, zonder spaties of accenten.
    // Let op: woorden met IJ (zoals IJSJE) laten we hier weg, want IJ
    // telt in het Nederlands soms als één letter en dat is verwarrend
    // in een lettergokspel. In galgje en de woordzoeker behandelen we
    // IJ gewoon als twee losse letters: I en J.
    wordle: [
      { woord: 'MALTA', uitleg: 'Onze eerste vakantie samen.' },
      { woord: 'QAWRA', uitleg: 'Waar ons hotel stond.' },
      { woord: 'MDINA', uitleg: 'De stille stad waar we door de steegjes liepen.' },
      { woord: 'KERST', uitleg: 'De kerstmarkt in Düsseldorf en onze eerste kerst samen.' },
      { woord: 'SAMEN', uitleg: 'Al een heel jaar, en nog lang niet klaar.' },
      { woord: 'KUSJE', uitleg: 'De eerste, bij de Maas.' },
      { woord: 'ZOMER', uitleg: 'Zomer 2026: festivals, kermis en Malta.' },
      { woord: 'FEEST', uitleg: 'Jouw feest op 10 januari.' },
      { woord: 'CHOCO', uitleg: 'Hoort bij de aardbeien, altijd.' },
    ],
    // Galgje: mag langer zijn, spaties mogen (bv. 'EERSTE DATE').
    galgje: [
      { woord: 'BROWNIES',    hint: 'Wat we bakten op onze tweede date' },
      { woord: 'VERKERING',   hint: 'Wat ik je vroeg in de auto bij de Maas' },
      { woord: 'BLUE LAGOON', hint: 'Dat onwerkelijk blauwe water op Comino' },
      { woord: 'AARDBEIEN',   hint: 'Met chocola, natuurlijk' },
      { woord: 'INSTAGRAM',   hint: 'Waar ons eerste berichtje stond' },
      { woord: 'BOOTTOCHT',   hint: 'Een van onze leukste dagen op Malta' },
      { woord: 'KERSTMARKT',  hint: 'Jouw verjaardagscadeau in Düsseldorf' },
      { woord: 'SLAGHAREN',   hint: 'Drie dagen bij jou, jij op het podium' },
      { woord: 'KERSTPYJAMA', hint: 'Het cadeautje dat erbij hoorde' },
      { woord: 'CARNAVAL',    hint: 'Een dag na Valentijn alweer feest' },
    ],
  },

  // ----------------------------------------------------------
  // 7. HARTJESBLOKKEN
  // ----------------------------------------------------------
  hartjesblokken: {
    // Deze foto staat vervaagd op de achtergrond en wordt steeds scherper.
    achtergrondFoto: 'images/voorbeeld-5.jpg',   // TODO (stap 7)
    // Bij elke weggespeelde rij verschijnt kort één van deze berichtjes.
    berichtjes: [
      'Jij maakt elke dag beter 💗',
      'Ik ben zo trots op jou',
      'Jouw lach is mijn favoriet',
      'Nog heel veel jaren, graag',
      'Jij bent mijn thuis',
      '22 blijft ons getal',
      'Tot bij de Maas 🌙',
      'Beste beslissing ooit: dat ene berichtje',
    ],
  },

  // ----------------------------------------------------------
  // 8. SUDOKU (Malta)
  // ----------------------------------------------------------
  sudoku: {
    // De startcijfers verwerken 22 en/of 22-11 (onze datum); dat regelt het spel zelf.
    // Elk opgelost 3x3-vak speelt één herinnering vrij: precies 9 stuks.
    // TODO (stap 8): bij elke herinnering een echte foto kiezen.
    maltaHerinneringen: [
      { foto: 'images/voorbeeld-1.jpg', bijschrift: 'Aankomst in Qawra' },
      { foto: 'images/voorbeeld-2.jpg', bijschrift: 'De Blue Lagoon op Comino' },
      { foto: 'images/voorbeeld-3.jpg', bijschrift: 'Door de straatjes van Valletta' },
      { foto: 'images/voorbeeld-4.jpg', bijschrift: 'Mdina, de stille stad' },
      { foto: 'images/voorbeeld-5.jpg', bijschrift: 'Een dag in het waterpark' },
      { foto: 'images/voorbeeld-6.jpg', bijschrift: 'Onze boottocht' },
      { foto: 'images/voorbeeld-7.jpg', bijschrift: 'Cocktails en vragenspellen' },
      { foto: 'images/voorbeeld-8.jpg', bijschrift: "Sudoku's, altijd sudoku's" },
      { foto: 'images/voorbeeld-1.jpg', bijschrift: 'Het busongeluk, nu een grappig verhaal' },
    ],
  },

  // ----------------------------------------------------------
  // 9. WOORDZOEKER EN KRUISWOORD
  // ----------------------------------------------------------
  woordzoeker: {
    // Woorden zonder spaties, max 10 letters.
    // Het spel kiest per keer een deel van deze lijst (wordt in stap 9 bepaald).
    woorden: [
      'MAAS', 'MALTA', 'QAWRA', 'MDINA', 'VALLETTA', 'COMINO', 'BROWNIES', 'AARDBEI', 'CHOCOLA', 'TERRAS', 'ARCADE', 'SUDOKU',
      'DUSSELDORF', 'KERSTMARKT', 'PYJAMA', 'CARNAVAL', 'UTRECHT', 'SLAGHAREN', 'ANGELS', 'KERMIS',
    ],
    // Kleine kruiswoordpuzzel: woord + hint.
    kruiswoord: [
      { woord: 'MAAS',      hint: 'Ons plekje' },
      { woord: 'MALTA',     hint: 'Onze eerste vakantie samen' },
      { woord: 'QAWRA',     hint: 'Waar ons hotel stond' },
      { woord: 'BROWNIES',  hint: 'Tweede date in de keuken' },
      { woord: 'ARCADE',    hint: 'Stond naast ons eerste terras' },
      { woord: 'INSTAGRAM', hint: 'Waar ik je als eerste een berichtje stuurde' },
      { woord: 'COCKTAIL',  hint: 'Met een vragenspel erbij, op Malta' },
      { woord: 'SUDOKU',    hint: 'Onze vakantieverslaving' },
    ],
  },

  // ----------------------------------------------------------
  // 10. DIT OF DAT
  // ----------------------------------------------------------
  // Davinia raadt wat JIJ zou kiezen. 'mijnKeuze' is 'a' of 'b'.
  // TODO (stap 10): vul hier je eigen keuzes in.
  ditOfDat: [
    { a: 'Aardbeien met chocola',  b: "McDonald's",            mijnKeuze: 'a', reactie: 'Al is het een moeilijke keuze.' },
    { a: 'Een avond bij de Maas',  b: 'Een avond op de bank',  mijnKeuze: 'a', reactie: 'Zolang jij erbij bent, maakt het eigenlijk niet uit.' },
    { a: 'Strand op Malta',        b: 'Waterpark',             mijnKeuze: 'b', reactie: 'Ik wilde die glijbanen gewoon nog een keer.' },
  ],

  // ----------------------------------------------------------
  // 11. BRIEVENBUS
  // ----------------------------------------------------------
  // Liefdesbriefjes die vrijkomen als een spel klaar is.
  // 'vrijBij' is de naam van het spel:
  //   quiz, wie, fotos, tijdlijn, woordspel, hartjesblokken,
  //   sudoku, woordzoeker, ditofdat, kleuren
  // TODO: deze schrijf je zelf. Kort en echt is mooier dan lang.
  // Titels mag je ook aanpassen. \n is een nieuwe regel, \n\n een witregel.
  brieven: [
    { vrijBij: 'quiz',           titel: 'Over dat eerste berichtje', tekst: 'Lieve Davinia,\n\nTODO: schrijf hier je briefje.\n\nXxx Wout' },
    { vrijBij: 'wie',            titel: 'Wat ik aan je zie',         tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'fotos',          titel: 'Mijn favoriete foto',       tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'tijdlijn',       titel: 'Ons jaar',                  tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'woordspel',      titel: 'Woorden die ik niet zeg',   tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'hartjesblokken', titel: 'Stukje voor stukje',        tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'sudoku',         titel: 'Terug naar Malta',          tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'woordzoeker',    titel: 'Wat ik in jou vond',        tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'ditofdat',       titel: 'Mijn keuze',                tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'kleuren',        titel: 'Voor altijd',               tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
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
