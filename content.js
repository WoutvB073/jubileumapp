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
      '6 dec 2025: uit eten met het gezin van Wout.',
      '22 dec 2025: kerstmarkt in Düsseldorf, Wouts verjaardagscadeau voor Davinia, samen met een kerstpyjama.',
      "24 dec 2025 (kerstavond): uit eten met Davinia's gezin en haar oma.",
      'Kerst 2025 samen gevierd.',
      '31 dec 2025: oud & nieuw met de vrienden van Wout.',
      '10 jan 2026: feest van Davinia.',
      '26 jan 2026: samen naar de Winter Efteling (foto met Jokie bij Carnaval Festival).',
      '14 feb 2026 (Valentijnsdag): concert van CHO in de Ziggo Dome.',
      '15 feb 2026: carnaval samen.',
      '16 apr 2026: dagje bollenvelden (Tulip Experience Amsterdam), samen in de gele klomp.',
      '24 t/m 26 apr 2026: Wout 3 dagen bij Davinia in Slagharen, waar ze optrad met de Angels.',
      '22 mei 2026: half jaar samen, dagje Utrecht.',
      '4 jul 2026: festival Vunzige Deuntjes, waar Davinia zelf moest dansen (Wout stond te kijken).',
      'Davinia heeft ook op Zwarte Cross gedanst; daar was Wout niet bij.',
      '25 jul 2026: BBQ bij vrienden van haar gezin, daarna de kermis in Tilburg.',
      '27 jul 2026: indoor skiën, het verjaardagscadeau van Davinia voor Wout.',
      '30 jul t/m 6 aug 2026: Malta (boottocht vanuit Mgarr op 3 aug; UNO was het kaartspel van de vakantie).',
      '12 sep 2026: feest van de oom en tante van Wout.',
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
    'foto-01': { plek: 'Restaurant, uit eten met mijn gezin', wanneer: '6 december 2025', verhaal: 'Samen uit eten met mijn gezin.', bijschrift: 'Uit eten met mijn gezin, en jij hoorde er gewoon bij. 🍽️' },
    'foto-02': { plek: 'Kerstmarkt Düsseldorf, in het reuzenrad', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf: mijn verjaardagscadeau voor jou, samen met een kerstpyjama.', bijschrift: 'Hoog in het reuzenrad, en het mooiste uitzicht zat gewoon naast me. 🎡' },
    'foto-03': { plek: 'Düsseldorf, aan het water', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Koude handen, rode wangen, warm hart. ❄️' },
    'foto-04': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Op het ijs, maar ik voelde alleen maar warmte. ⛸️' },
    'foto-05': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Jouw cadeau, maar ik kreeg er zelf ook een herinnering voor altijd bij. 💝' },
    'foto-06': { plek: 'Düsseldorf', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Een spiegel, jij en ik. Meer heeft een goede foto niet nodig. ✌️' },
    'foto-07': { plek: 'Bij Davinia thuis', wanneer: '24 december 2025 (kerstavond)', verhaal: 'Bij jou thuis, net voordat we op kerstavond uit eten gingen met jouw gezin en je oma.', bijschrift: 'Helemaal klaar voor kerstavond, en jij straalde nog meer dan de lichtjes. ✨' },
    'foto-08': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: 'De laatste kus van 2025, de eerste van heel veel in 2026. 🎆' },
    'foto-09': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: 'Het nieuwe jaar in, met jou. Een beter begin bestaat niet. 🥂' },
    'foto-10': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Jouw feest, en ik mocht naast de mooiste in goud staan. ✨' },
    'foto-11': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Dat moment waarop we alleen elkaar nog zagen. 💛' },
    'foto-12': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Midden op het feest, en toch even alleen wij. 💋' },
    // Let op: onderaan staat een strip met andere mensen; bijsnijden voordat we hem gebruiken.
    'foto-13': { plek: 'Winter Efteling, attractie Carnaval Festival', wanneer: '26 januari 2026', verhaal: 'Samen naar de Winter Efteling; attractiefoto bij Carnaval Festival.', bijschrift: 'Mutsen op, wangen rood, en Jokie lachte met ons mee. 🎪' },
    'foto-14': { plek: 'Winter Efteling', wanneer: '26 januari 2026', verhaal: 'Samen naar de Winter Efteling.', bijschrift: 'Koud buiten, maar met jou tegen me aan merkte ik daar niks van. ✌️' },
    'foto-15': { plek: 'Carnaval, verkleed', wanneer: '15 februari 2026', verhaal: 'Carnaval samen gevierd, een dag na CHO op Valentijnsdag.', bijschrift: 'Skibril op, sjaal om: het mooiste carnavalskoppel van het zuiden. 🎭' },
    'foto-16': { plek: 'Bollenvelden (Tulip Experience Amsterdam), in de gele klomp', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Duizenden tulpen, en toch keek ik alleen naar jou. 🌷' },
    'foto-17': { plek: 'Bollenvelden (Tulip Experience Amsterdam)', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Een lijstje om ons heen, en dat mag zo blijven. 🖼️' },
    'foto-18': { plek: 'Bollenvelden, langs de weg', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Duim omhoog, tong uit: zo goed was die dag. 🌷' },
    // Bijna dezelfde foto als foto-16 (met balken van een story): liever niet gebruiken.
    'foto-19': { plek: 'Bollenvelden (Tulip Experience Amsterdam), in de gele klomp', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Samen in één klomp: past precies. 👞' },
    'foto-20': { plek: 'Slagharen, op het podium na de show van de Angels', wanneer: '24 t/m 26 april 2026', verhaal: 'Drie dagen bij jou in Slagharen, waar je optrad met de Angels.', bijschrift: 'Vonken op het podium, maar jij straalde nog harder. 🎇' },
    'foto-21': { plek: 'Concert van CHO in de Ziggo Dome', wanneer: '14 februari 2026 (Valentijnsdag)', verhaal: 'Op Valentijnsdag samen naar CHO in de Ziggo Dome.', bijschrift: 'Valentijn tussen duizenden mensen, en toch voelde het alsof het alleen voor ons was. ❤️' },
    'foto-22': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Net van het podium af, en nog steeds de mooiste van het hele festival. 💃' },
    'foto-23': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Een kus voor de danseres. Verdiend. 💋' },
    'foto-24': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Die lach na het optreden: daar doe ik het voor. 😄' },
    'foto-25': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Zoals jij naar mij kijkt, zo kijk ik ook naar jou. 🥰' },
    'foto-26': { plek: 'Kermis in Tilburg', wanneer: '25 juli 2026', verhaal: 'Na de BBQ bij vrienden van jouw gezin samen naar de kermis in Tilburg.', bijschrift: 'Lichtjes, draaimolens en jij: mijn favoriete attractie. 🎡' },
    'foto-27': { plek: 'Kermis in Tilburg', wanneer: '25 juli 2026', verhaal: 'Na de BBQ bij vrienden van jouw gezin samen naar de kermis in Tilburg.', bijschrift: 'Een kus tussen alle kermislichtjes. ✨' },
    'foto-28': { plek: 'Indoor skibaan, in de stoeltjeslift', wanneer: '27 juli 2026', verhaal: 'Indoor skiën: jouw verjaardagscadeau voor mij.', bijschrift: 'Jouw cadeau voor mij, en het beste deel was naast jou in de lift. ⛷️' },
    'foto-29': { plek: 'Parkeergarage, op weg naar Malta', wanneer: '30 juli 2026', verhaal: 'Vertrek naar Malta: een week samen in Qawra.', bijschrift: 'Koffers in de auto, Malta here we come! ✈️' },
    'foto-30': { plek: 'Malta, boulevard van Qawra/Buġibba bij zonsondergang', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Een week Malta, hotel in Qawra.', bijschrift: 'De zon ging onder, maar mijn favoriete uitzicht stond naast me. 🌅' },
    // Let op: er zit een vlekje op de lens (op zijn knie); foto-32 is dezelfde dag en mooier.
    'foto-31': { plek: 'Malta, Mdina (de stille stad)', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Samen door de steegjes van Mdina.', bijschrift: 'Een stille stad, en wij er middenin. 🏰' },
    'foto-32': { plek: 'Malta, Mdina, voor een rode deur', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Samen door de steegjes van Mdina.', bijschrift: 'Achter elke deur in Mdina een verhaal; het mooiste liep naast mij. 🚪' },
    'foto-33': { plek: 'Malta, een dorpsfeest (festa) met banieren en lichtjes', wanneer: '30 juli t/m 6 augustus 2026', verhaal: "'s Avonds door een versierde straat tijdens een Maltees dorpsfeest.", bijschrift: 'De hele straat versierd, maar jij was het mooiste dat ik die avond zag. ✨' },
    'foto-34': { plek: 'Malta, boottocht vanuit Mgarr, op een supboard', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr; vanaf de boot het turquoise water in.', bijschrift: 'Water zo helder als ik me voel bij jou. 🌊' },
    'foto-35': { plek: 'Malta, boottocht vanuit Mgarr, bij de kliffen', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr, langs kliffen en grotten.', bijschrift: 'Zon, zout water en jij naast me: meer had ik niet nodig. ⛵' },
    'foto-36': { plek: 'Malta, boottocht vanuit Mgarr, suppen langs de kust', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr; samen suppen langs de rotsen.', bijschrift: 'Samen op één board: ik peddel, jij geniet. Prima taakverdeling. 🏄' },
    'foto-37': { plek: 'Malta, boottocht vanuit Mgarr, met kleimaskers op', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr; samen met een groen kleimasker op de boot.', bijschrift: 'Groen in het gezicht, maar nog nooit zo verliefd geweest. 💚' },
    'foto-38': { plek: 'Malta, dakterras met zwembad van ons hotel in Qawra', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Ons hotel in Qawra had een dakterras met zwembad.', bijschrift: 'Ons eigen plekje in de zon, bovenop Qawra. ☀️' },
    'foto-39': { plek: 'Feest van mijn oom en tante', wanneer: '12 september 2026', verhaal: 'Samen op het feest van mijn oom en tante.', bijschrift: 'Mijn familie vierde feest, en ik had de mooiste date van de avond. 🪩' },
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
  // 'fotoNa': een foto die pas ná het antwoord verschijnt (onder de reactie),
  // voor vragen waar de foto het antwoord zou verraden.
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
      foto: 'images/foto-30.jpg',
      opties: ['Qawra', 'Valletta', 'Sliema', 'Mdina'],
      goed: 0,
      reactie: 'Qawra. Een week lang dezelfde weg naar het strand, en toch elke dag anders. ☀️',
    },
    {
      vraag: 'Van wanneer tot wanneer waren we op Malta?',
      foto: 'images/foto-29.jpg',
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
      foto: 'images/foto-04.jpg',
      opties: ['Düsseldorf', 'Keulen', 'Aken', 'Maastricht'],
      goed: 0,
      reactie: 'Lichtjes, glühwein en jij met rode wangen van de kou. Mijn beste cadeau-idee ooit. 🎄',
    },
    {
      vraag: 'Wat kreeg je naast de kerstmarkt nog voor je verjaardag?',
      foto: 'images/foto-06.jpg',
      opties: ['Een kerstpyjama', 'Een kerstmuts', 'Een fotoboek', 'Een sieraad'],
      goed: 0,
      reactie: 'Een kerstpyjama. Officieel voor jou, stiekem ook een beetje voor mij. 🎁',
    },
    {
      vraag: 'Naar welk concert gingen we op Valentijnsdag?',
      foto: 'images/foto-21.jpg',
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
      foto: 'images/foto-20.jpg',
      opties: ['De Angels', 'De Stars', 'De Illusions', 'De Magics'],
      goed: 0,
      reactie: 'De Angels. Ik zat in het publiek en dacht alleen maar: die daar, dat is mijn vriendin. ✨',
    },
    {
      vraag: 'Op welk festival danste je terwijl ik stond te kijken?',
      foto: 'images/foto-24.jpg',
      opties: ['Vunzige Deuntjes', 'Pinkpop', 'Lowlands', 'Defqon'],
      goed: 0,
      reactie: 'Jij op het podium. Ik was de trotste persoon in het hele publiek. 💃',
    },
    {
      vraag: 'Waar gingen we heen na de BBQ bij vrienden van je gezin?',
      fotoNa: 'images/foto-27.jpg',
      opties: ['De kermis in Tilburg', 'Het strand', 'Naar huis', 'De kermis in Den Bosch'],
      goed: 0,
      reactie: 'Eerst lekker eten, daarna de kermis op. Zo’n avond waarop alles gewoon klopte. 🎡',
    },
    {
      vraag: 'Waar vertrok onze boottocht op Malta?',
      foto: 'images/foto-37.jpg',
      opties: ['Mgarr', 'Valletta', 'Sliema', 'Qawra'],
      goed: 0,
      reactie: 'Vanuit Mgarr de zee op. Zon, zout water en jij naast me: meer had ik niet nodig. ⛵',
    },
    {
      vraag: 'Met wie vierden we oud & nieuw?',
      foto: 'images/foto-08.jpg',
      opties: ['Met mijn vrienden', 'Met jouw familie', "Met z'n tweeën", 'Met mijn familie'],
      goed: 0,
      reactie: 'Het nieuwe jaar in met mijn vrienden, en met jou. Toen wist ik al: dit wordt een goed jaar. 🎆',
    },
    {
      vraag: 'Bij welke attractie in de Winter Efteling gingen we samen met Jokie op de foto?',
      foto: 'images/foto-14.jpg',
      opties: ['Carnaval Festival', 'Droomvlucht', 'Python', 'Joris en de Draak'],
      goed: 0,
      reactie: 'Mutsen op en lachen naar de camera. Jokie was er duidelijk ook blij mee. 🎪',
    },
    {
      vraag: 'Waar stonden we op 16 april samen in een gigantische gele klomp?',
      fotoNa: 'images/foto-18.jpg',
      opties: ['Bij de bollenvelden', 'In Volendam', 'In de Efteling', 'Op de kermis'],
      goed: 0,
      reactie: 'Tulpen zover je kon kijken, en wij samen in één klomp. Typisch Nederlands, typisch ons. 🌷',
    },
    {
      vraag: 'Wat gaf jij mij voor mijn verjaardag?',
      fotoNa: 'images/foto-28.jpg',
      opties: ['Samen indoor skiën', 'Concertkaartjes', 'Een weekendje weg', 'Een horloge'],
      goed: 0,
      reactie: 'Samen de piste op, midden in de zomer. Het beste cadeau, vooral door wie ernaast zat in de lift. ⛷️',
    },
    {
      vraag: 'Welk kaartspel speelden we het meest op Malta?',
      opties: ['UNO', 'Pesten', 'Klaverjassen', 'Poker'],
      goed: 0,
      reactie: 'UNO, avond na avond. Ik zeg niet wie er vaker won… maar jij weet het heus wel. 😏',
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
    // Memory: elke foto komt twee keer in het spel (8 foto's = 16 kaartjes).
    memory: [
      'images/foto-02.jpg',
      'images/foto-09.jpg',
      'images/foto-11.jpg',
      'images/foto-16.jpg',
      'images/foto-20.jpg',
      'images/foto-22.jpg',
      'images/foto-28.jpg',
      'images/foto-30.jpg',
    ],
    // Raad de plek of datum bij een foto. Het goede antwoord staat eerst; de app husselt.
    raadDePlek: [
      {
        foto: 'images/foto-03.jpg',
        vraag: "Wanneer is deze foto gemaakt?",
        opties: ["22 december 2025","24 december 2025","31 december 2025","26 januari 2026"],
        goed: 0,
        reactie: "De kerstmarkt in Düsseldorf, jouw verjaardagscadeau. Koude handen, warm hart. ❄️",
      },
      {
        foto: 'images/foto-07.jpg',
        vraag: "Welke avond was dit?",
        opties: ["Kerstavond 2025","Oud & nieuw","Jouw feest op 10 januari","Het feest van mijn oom en tante"],
        goed: 0,
        reactie: "Kerstavond, net voordat we met jouw gezin en je oma uit eten gingen. ✨",
      },
      {
        foto: 'images/foto-10.jpg',
        vraag: "Op welk feest is deze foto gemaakt?",
        opties: ["Jouw feest op 10 januari","Oud & nieuw","Het feest van mijn oom en tante","Kerstavond"],
        goed: 0,
        reactie: "Jouw feest, jij in goud. Ik kon mijn ogen niet van je afhouden. ✨",
      },
      {
        foto: 'images/foto-15.jpg',
        vraag: "Wanneer is deze foto gemaakt?",
        opties: ["15 februari 2026","14 februari 2026","26 januari 2026","10 januari 2026"],
        goed: 0,
        reactie: "Carnaval, één dag na CHO op Valentijnsdag. Wat een weekend. 🎭",
      },
      {
        foto: 'images/foto-17.jpg',
        vraag: "Wanneer stonden we in dit lijstje?",
        opties: ["16 april 2026","24 april 2026","22 mei 2026","4 juli 2026"],
        goed: 0,
        reactie: "Ons dagje bollenvelden. Duizenden tulpen, en toch keek ik alleen naar jou. 🌷",
      },
      {
        foto: 'images/foto-26.jpg',
        vraag: "Wanneer is deze foto gemaakt?",
        opties: ["25 juli 2026","4 juli 2026","27 juli 2026","22 mei 2026"],
        goed: 0,
        reactie: "Na de BBQ bij vrienden van jouw gezin, de kermis in Tilburg op. 🎡",
      },
      {
        foto: 'images/foto-32.jpg',
        vraag: "Waar is deze foto gemaakt?",
        opties: ["Mdina","Valletta","Qawra","Sliema"],
        goed: 0,
        reactie: "Mdina, de stille stad. Achter elke deur een verhaal. 🏰",
      },
      {
        foto: 'images/foto-39.jpg',
        vraag: "Op welk feest is deze foto gemaakt?",
        opties: ["Het feest van mijn oom en tante","Jouw feest op 10 januari","Oud & nieuw","Vunzige Deuntjes"],
        goed: 0,
        reactie: "Het feest van mijn oom en tante, 12 september. Ik had de mooiste date van de avond. 🪩",
      },
    ],
  },

  // ----------------------------------------------------------
  // 5. TIJDLIJN
  // ----------------------------------------------------------
  // De momenten staan hier in de JUISTE volgorde (oudste eerst).
  // vast: 'begin' en vast: 'eind' zijn het begin- en eindpunt van elke
  // ronde (22-11-2025 en 22-11-2026). Het spel kiest per ronde een paar
  // momenten daartussen en husselt ze door elkaar.
  // Momenten vóór het beginpunt (de eerste dates) zitten niet in de rondes,
  // maar staan wel in het overzicht van ons hele jaar aan het eind.
  // 'foto' mag je weglaten.
  tijdlijn: [
    { datum: "het begin", titel: "Een DM op Instagram", tekst: "Ik stuurde het eerste berichtje. Beste beslissing ooit." },
    { datum: "eerste date", titel: "Terras, arcade, ijsje", tekst: "En dat ijsje opgegeten bij de Maas." },
    { datum: "tweede date", titel: "Brownies bakken", tekst: "De keuken overleefde het net." },
    { datum: "derde date", titel: "Onze eerste kus", tekst: "'s Avonds buiten liggen bij de Maas." },
    { datum: "22 november 2025", titel: "Officieel samen", tekst: "In de auto bij de Maas, nadat we onze eerste date hadden nagedaan.", vast: 'begin' },
    { datum: "6 december 2025", titel: "Uit eten met mijn gezin", tekst: "En jij hoorde er gewoon bij.", foto: 'images/foto-01.jpg' },
    { datum: "22 december 2025", titel: "Kerstmarkt Düsseldorf", tekst: "Jouw verjaardagscadeau, met een kerstpyjama erbij.", foto: 'images/foto-05.jpg' },
    { datum: "24 december 2025", titel: "Kerstavond", tekst: "Uit eten met jouw gezin en je oma.", foto: 'images/foto-07.jpg' },
    { datum: "31 december 2025", titel: "Oud & nieuw", tekst: "Het nieuwe jaar in met mijn vrienden, en met jou.", foto: 'images/foto-09.jpg' },
    { datum: "10 januari 2026", titel: "Jouw feest", tekst: "Jij in een gouden jurk, ik kon mijn ogen niet van je afhouden.", foto: 'images/foto-12.jpg' },
    { datum: "26 januari 2026", titel: "Winter Efteling", tekst: "Mutsen op, en Jokie op de foto.", foto: 'images/foto-13.jpg' },
    { datum: "14 februari 2026", titel: "CHO op Valentijnsdag", tekst: "Samen in de Ziggo Dome.", foto: 'images/foto-21.jpg' },
    { datum: "15 februari 2026", titel: "Carnaval", tekst: "Een dag later meteen weer feest.", foto: 'images/foto-15.jpg' },
    { datum: "16 april 2026", titel: "Bollenvelden", tekst: "Tulpen zover je kon kijken, en wij in een gele klomp.", foto: 'images/foto-16.jpg' },
    { datum: "24 april 2026", titel: "Slagharen", tekst: "Drie dagen bij jou, en jij op het podium met de Angels.", foto: 'images/foto-20.jpg' },
    { datum: "22 mei 2026", titel: "Half jaar in Utrecht", tekst: "Een half jaar samen, een dagje Utrecht." },
    { datum: "4 juli 2026", titel: "Vunzige Deuntjes", tekst: "Jij moest dansen, ik stond trots te kijken.", foto: 'images/foto-23.jpg' },
    { datum: "25 juli 2026", titel: "BBQ en kermis", tekst: "BBQ bij vrienden van jouw gezin, daarna de kermis in Tilburg.", foto: 'images/foto-26.jpg' },
    { datum: "27 juli 2026", titel: "Indoor skiën", tekst: "Jouw verjaardagscadeau voor mij: samen de piste op.", foto: 'images/foto-28.jpg' },
    { datum: "30 juli 2026", titel: "Malta", tekst: "Qawra, de Blue Lagoon, sudoku's en cocktails.", foto: 'images/foto-30.jpg' },
    { datum: "12 september 2026", titel: "Feest oom en tante", tekst: "Mijn familie vierde feest, en ik had de mooiste date.", foto: 'images/foto-39.jpg' },
    { datum: "22 november 2026", titel: "Eén jaar samen", tekst: "En dit is pas het begin. 💗", vast: 'eind' },
  ],

  // ----------------------------------------------------------
  // 6. WOORDSPEL
  // ----------------------------------------------------------
  woordspel: {
    // Wordle: precies 5 letters, zonder spaties of accenten.
    // 'uitleg' (en 'foto', mag weg) verschijnt als het woord geraden is.
    // Let op: woorden met IJ (zoals IJSJE) laten we hier weg, want IJ
    // telt in het Nederlands soms als één letter en dat is verwarrend
    // in een lettergokspel. In galgje en de woordzoeker behandelen we
    // IJ gewoon als twee losse letters: I en J.
    wordle: [
      { woord: "MALTA", uitleg: "Onze eerste vakantie samen.", foto: 'images/foto-30.jpg' },
      { woord: "QAWRA", uitleg: "Waar ons hotel stond, met dat dakterras.", foto: 'images/foto-38.jpg' },
      { woord: "MDINA", uitleg: "De stille stad waar we door de steegjes liepen.", foto: 'images/foto-32.jpg' },
      { woord: "KERST", uitleg: "De kerstmarkt in Düsseldorf en onze eerste kerst samen.", foto: 'images/foto-02.jpg' },
      { woord: "SAMEN", uitleg: "Al een heel jaar, en nog lang niet klaar.", foto: 'images/foto-09.jpg' },
      { woord: "KUSJE", uitleg: "De eerste, bij de Maas." },
      { woord: "ZOMER", uitleg: "Zomer 2026: festivals, kermis en Malta.", foto: 'images/foto-22.jpg' },
      { woord: "FEEST", uitleg: "Jouw feest op 10 januari.", foto: 'images/foto-10.jpg' },
      { woord: "CHOCO", uitleg: "Hoort bij de aardbeien, altijd." },
      { woord: "KLOMP", uitleg: "Die gele reuzenklomp in de bollenvelden.", foto: 'images/foto-16.jpg' },
    ],
    // Galgje (met een smeltend ijsje): mag langer zijn, spaties mogen.
    // 'hint' staat erbij tijdens het raden, 'herinnering' (en 'foto') daarna.
    galgje: [
      { woord: "BROWNIES", hint: "Wat we bakten op onze tweede date", herinnering: "De keuken overleefde het net. De brownies ook, heel even. 🍫" },
      { woord: "VERKERING", hint: "Wat ik je vroeg in de auto bij de Maas", herinnering: "22 november, in de auto bij de Maas. Het mooiste ja dat ik ooit kreeg. 💗" },
      { woord: "BLUE LAGOON", hint: "Dat onwerkelijk blauwe water op Comino", herinnering: "Water zo blauw dat het nep leek. 🌊", foto: 'images/foto-34.jpg' },
      { woord: "AARDBEIEN", hint: "Met chocola, natuurlijk", herinnering: "Nooit genoeg aardbeien, altijd te veel chocola. 🍓" },
      { woord: "INSTAGRAM", hint: "Waar ons eerste berichtje stond", herinnering: "Vier keer herschreven voor ik op verzenden durfde te drukken. 📱" },
      { woord: "BOOTTOCHT", hint: "Een van onze leukste dagen op Malta", herinnering: "Vanuit Mgarr de zee op: suppen, kliffen en kleimaskers. ⛵", foto: 'images/foto-35.jpg' },
      { woord: "KERSTMARKT", hint: "Jouw verjaardagscadeau in Düsseldorf", herinnering: "Reuzenrad, ijsbaan en jij met rode wangen van de kou. 🎄", foto: 'images/foto-04.jpg' },
      { woord: "SLAGHAREN", hint: "Drie dagen bij jou, jij op het podium", herinnering: "Jij op het podium met de Angels, ik de trotste in het publiek. ✨", foto: 'images/foto-20.jpg' },
      { woord: "KERSTPYJAMA", hint: "Het cadeautje dat erbij hoorde", herinnering: "Officieel voor jou, stiekem ook een beetje voor mij. 🎁" },
      { woord: "CARNAVAL", hint: "Een dag na Valentijn alweer feest", herinnering: "Skibril op, sjaal om: het mooiste carnavalskoppel. 🎭", foto: 'images/foto-15.jpg' },
      { woord: "ARCADEHAL", hint: "Stond naast het terras van onze eerste date", herinnering: "Ik wist niet of ik je wilde imponeren of verslaan. 🕹️" },
      { woord: "BOLLENVELDEN", hint: "Waar we samen in een gele klomp stonden", herinnering: "Duizenden tulpen, en toch keek ik alleen naar jou. 🌷", foto: 'images/foto-16.jpg' },
      { woord: "ZIGGO DOME", hint: "Waar we op Valentijnsdag CHO zagen", herinnering: "Valentijn tussen duizenden mensen, en toch voelde het alsof het alleen voor ons was. ❤️", foto: 'images/foto-21.jpg' },
      { woord: "WINTER EFTELING", hint: "Mutsen op, en Jokie op de foto", herinnering: "Koud buiten, maar met jou tegen me aan merkte ik daar niks van. 🎪", foto: 'images/foto-13.jpg' },
      { woord: "KLEIMASKER", hint: "Groen in het gezicht, op de boot", herinnering: "Groen in het gezicht, maar nog nooit zo verliefd geweest. 💚", foto: 'images/foto-37.jpg' },
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
    // Verschijnt als de héle sudoku af is: de herinnering zonder foto.
    slotHerinnering: 'En het busongeluk? Toen helemaal niet grappig, nu het verhaal dat we nog jaren gaan vertellen. 🚌💗',
    maltaHerinneringen: [
      { foto: 'images/foto-29.jpg', bijschrift: "Koffers in de auto: op naar Malta! ✈️" },
      { foto: 'images/foto-38.jpg', bijschrift: "Ons dakterras met zwembad: bijkomen na een dag waterpark. ☀️" },
      { foto: 'images/foto-30.jpg', bijschrift: "Zonsondergang aan de boulevard van Qawra. 🌅" },
      { foto: 'images/foto-31.jpg', bijschrift: "Door de stille straatjes van Mdina. 🏰" },
      { foto: 'images/foto-33.jpg', bijschrift: "Een Maltees dorpsfeest vol lichtjes. ✨" },
      { foto: 'images/foto-34.jpg', bijschrift: "Water zo blauw als de Blue Lagoon. 🌊" },
      { foto: 'images/foto-35.jpg', bijschrift: "Kliffen, grotten en jij. ⛵" },
      { foto: 'images/foto-36.jpg', bijschrift: "Samen suppen langs de rotsen. 🏄" },
      { foto: 'images/foto-37.jpg', bijschrift: "Groene kleimaskers op de boot. 💚" },
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
      'DUSSELDORF', 'KERSTMARKT', 'PYJAMA', 'CARNAVAL', 'UTRECHT', 'SLAGHAREN', 'ANGELS', 'KERMIS', 'TULPEN', 'EFTELING',
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
