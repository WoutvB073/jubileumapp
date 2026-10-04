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
    welkom: 'Een jaar samen in een paar spelletjes. Spieken mag niet 😏',
  },

  // ----------------------------------------------------------
  // FEITEN OVER ONS
  // ----------------------------------------------------------
  // Niet voor één spel, maar als bron voor alle spellen (en voor Claude,
  // als er later nieuwe vragen of hints bij moeten komen).
  feiten: {
    begin: 'We kenden elkaar via school. Het echte contact begon toen Wout haar een DM stuurde op Instagram (zie thailand).',
    thailand: 'Zomer 2025 waren we allebei in Thailand: Wout in Phuket, Davinia trok rond. Wout zag haar story uit Thailand en vroeg waar ze ergens zat; dat was zijn eerste DM. Daarna veel online gepraat; ongeveer een maand na die DM de eerste date in Nederland.',
    lavaCake: 'Allebei fan van de lava cakejes van de 7-Eleven in Thailand.',
    eersteZoen: 'Bij de eerste zoen had Wout haar polsen vast, en Davinia zei "wow flashbacks". Super domme opmerking.',
    carnaval: 'Carnaval: allebei een Oeteldonk-jasje aan, Davinia ook met een skibril en iets op haar hoofd.',
    utrecht: 'Half jaar in Utrecht: eten en shoppen, avondeten bij een Italiaan aan de gracht, en dat eten was heel vies.',
    skien: 'Skiën in juli: indoor, ergens in Limburg (Davinia haar cadeau voor Wout).',
    winterEfteling: 'Winter Efteling: leuke dag met achtbanen en overal lekker eten, maar Wout had het heel koud.',
    slagharen: 'Slagharen: Wout sliep in haar huisje dat ze van het bedrijf had gekregen, keek alle shows en hing daarna zelf rond in het park.',
    busongeluk: 'Het busongeluk op Malta: de bus botste tegen een auto.',
    typischDavinia: 'Maakt veel foto\'s, is altijd super positief, vindt zichzelf erg grappig en lacht om haar eigen grappen voordat ze af zijn. Doet Wout na als hij "godverdomme" zegt. Probeert internettermen als "romig" te gebruiken, maar is daar heel slecht in.',
    warmKoud: 'Wout heeft het snel heet, Davinia snel koud.',
    telefoon: 'Als Wout even op zijn telefoon zit, speelt Davinia een geluidje af dat begint met "when your partner spends more time on his phone".',
    teLaat: 'Davinia is vaak te laat (tijd vergeten, iets vergeten en terug moeten, nog omkleden of opmaken). Wout wacht netjes, maar benoemt het wel vaak.',
    // Hooguit in 1 of 2 korte, nuchtere zinnen gebruiken:
    waardering: 'Wat Wout aan haar waardeert: haar positiviteit en hoe hard ze voor alles werkt.',
    jaarTwee: 'Jaar twee: in ieder geval weer op vakantie.',
    eersteDate: "Een terras met een arcadehal erbij, daarna een ijsje bij de McDonald's en opgegeten bij de Maas.",
    tweedeDate: 'Samen brownies gebakken.',
    derdeDate: "De eerste kus, 's avonds buiten liggend bij de Maas.",
    officieel: '22 november: Wout vroeg haar verkering in de auto bij de Maas. Die dag hadden ze hun eerste date nagedaan.',
    onsGetal: '22 is ons getal, de Maas is ons plekje.',
    etenSamen: "Af en toe McDonald's, en aardbeien met chocola.",
    malta: "Malta, 30 juli t/m 6 augustus, hotel in Qawra. Valletta, Mdina, een waterpark, op 3 augustus een boottocht vanuit Mgarr naar Comino en de Blue Lagoon, een busongeluk (nu een grappig verhaal), 's avonds cocktails met vragenspellen en veel sudoku's.",
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
      '30 jul t/m 6 aug 2026: Malta (3 aug: boottocht vanuit Mgarr naar Comino en de Blue Lagoon; UNO was het kaartspel van de vakantie).',
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
    'foto-01': { plek: 'Restaurant, uit eten met mijn gezin', wanneer: '6 december 2025', verhaal: 'Samen uit eten met mijn gezin.', bijschrift: 'Etentje met mijn gezin. Je kwam terug, dus dat ging goed 😂' },
    'foto-02': { plek: 'Kerstmarkt Düsseldorf, in het reuzenrad', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf: mijn verjaardagscadeau voor jou, samen met een kerstpyjama.', bijschrift: 'In het reuzenrad in Düsseldorf, jouw verjaardagscadeau.' },
    'foto-03': { plek: 'Düsseldorf, aan het water', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Düsseldorf, jouw verjaardag. Dikke jassen, goede dag.' },
    'foto-04': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Op de schaatsbaan, en allebei nog overeind 😂' },
    'foto-05': { plek: 'Düsseldorf, op de ijsbaan', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Jouw verjaardagscadeau, maar ik vond het zelf ook top 😏' },
    'foto-06': { plek: 'Düsseldorf', wanneer: '22 december 2025', verhaal: 'Kerstmarkt in Düsseldorf, jouw verjaardagscadeau.', bijschrift: 'Spiegelselfie in Düsseldorf, verplicht nummer 😏' },
    'foto-07': { plek: 'Bij Davinia thuis', wanneer: '24 december 2025 (kerstavond)', verhaal: 'Bij jou thuis, net voordat we op kerstavond uit eten gingen met jouw gezin en je oma.', bijschrift: 'Kerstavond, klaar voor het eten met jouw gezin en je oma.' },
    'foto-08': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: 'Laatste kus van 2025 😘' },
    'foto-09': { plek: 'Oud & nieuw met mijn vrienden', wanneer: '31 december 2025', verhaal: 'Oud & nieuw gevierd met mijn vrienden.', bijschrift: '2026 in, met jou en mijn vrienden.' },
    'foto-10': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Jouw feest, jij in goud. Ik viel er gewoon naast weg 😅' },
    'foto-11': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Jouw feest, en ik mocht ook mee 😏' },
    'foto-12': { plek: 'Feest van Davinia', wanneer: '10 januari 2026', verhaal: 'Jouw feest, jij in een gouden jurk.', bijschrift: 'Even een kus tussendoor 😘' },
    // Let op: onderaan staat een strip met andere mensen; bijsnijden voordat we hem gebruiken.
    'foto-13': { plek: 'Winter Efteling, attractie Carnaval Festival', wanneer: '26 januari 2026', verhaal: 'Samen naar de Winter Efteling; attractiefoto bij Carnaval Festival.', bijschrift: 'Winter Efteling, en Jokie wilde ook op de foto 😂' },
    'foto-14': { plek: 'Winter Efteling', wanneer: '26 januari 2026', verhaal: 'Samen naar de Winter Efteling.', bijschrift: 'Winter Efteling, mutsen op.' },
    'foto-15': { plek: 'Carnaval, verkleed', wanneer: '15 februari 2026', verhaal: 'Carnaval samen gevierd, een dag na CHO op Valentijnsdag.', bijschrift: 'Carnaval, en die skibril stond je echt 😂' },
    'foto-16': { plek: 'Bollenvelden (Tulip Experience Amsterdam), in de gele klomp', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Samen in één gele klomp. Paste precies 😂' },
    'foto-17': { plek: 'Bollenvelden (Tulip Experience Amsterdam)', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Ingelijst tussen de tulpen. Kan zo aan de muur 😏' },
    'foto-18': { plek: 'Bollenvelden, langs de weg', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Duim omhoog, tong uit. Jij dan 😂' },
    // Bijna dezelfde foto als foto-16 (met balken van een story): liever niet gebruiken.
    'foto-19': { plek: 'Bollenvelden (Tulip Experience Amsterdam), in de gele klomp', wanneer: '16 april 2026', verhaal: 'Dagje bollenvelden bij Tulip Experience Amsterdam.', bijschrift: 'Nog een keer de klomp, voor de zekerheid 😅' },
    'foto-20': { plek: 'Slagharen, op het podium na de show van de Angels', wanneer: '24 t/m 26 april 2026', verhaal: 'Drie dagen bij jou in Slagharen, waar je optrad met de Angels.', bijschrift: 'Slagharen: jij in de show, ik in een oranje trui 😅' },
    'foto-21': { plek: 'Concert van CHO in de Ziggo Dome', wanneer: '14 februari 2026 (Valentijnsdag)', verhaal: 'Op Valentijnsdag samen naar CHO in de Ziggo Dome.', bijschrift: 'CHO op Valentijnsdag ❤️' },
    'foto-22': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Net klaar met dansen en nog steeds energie over 😅' },
    'foto-23': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Een kus voor de danseres 😘' },
    'foto-24': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Optreden zit erop, nu het festival nog.' },
    'foto-25': { plek: 'Festival Vunzige Deuntjes, na het dansen', wanneer: '4 juli 2026', verhaal: 'Jij moest dansen op Vunzige Deuntjes; daarna samen over het festival.', bijschrift: 'Na het dansen even samen.' },
    'foto-26': { plek: 'Kermis in Tilburg', wanneer: '25 juli 2026', verhaal: 'Na de BBQ bij vrienden van jouw gezin samen naar de kermis in Tilburg.', bijschrift: 'Kermis Tilburg, na de BBQ.' },
    'foto-27': { plek: 'Kermis in Tilburg', wanneer: '25 juli 2026', verhaal: 'Na de BBQ bij vrienden van jouw gezin samen naar de kermis in Tilburg.', bijschrift: 'Even pauze tussen de attracties door 😘' },
    'foto-28': { plek: 'Indoor skibaan, in de stoeltjeslift', wanneer: '27 juli 2026', verhaal: 'Indoor skiën: jouw verjaardagscadeau voor mij.', bijschrift: 'Skiën in juli, jouw cadeau. Ik sta er nog 😂' },
    'foto-29': { plek: 'Parkeergarage, op weg naar Malta', wanneer: '30 juli 2026', verhaal: 'Vertrek naar Malta: een week samen in Qawra.', bijschrift: 'Koffers in de auto, op naar Malta.' },
    'foto-30': { plek: 'Malta, boulevard van Qawra/Buġibba bij zonsondergang', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Een week Malta, hotel in Qawra.', bijschrift: 'Zonsondergang in Qawra. Prima uitzicht 😏' },
    // Let op: er zit een vlekje op de lens (op zijn knie); foto-32 is dezelfde dag en mooier.
    'foto-31': { plek: 'Malta, Mdina (de stille stad)', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Samen door de steegjes van Mdina.', bijschrift: 'Mdina. Jij wist vast de weg 😂' },
    'foto-32': { plek: 'Malta, Mdina, voor een rode deur', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Samen door de steegjes van Mdina.', bijschrift: 'Mdina, en nog steeds niet verdwaald 😏' },
    'foto-33': { plek: 'Malta, een dorpsfeest (festa) met banieren en lichtjes', wanneer: '30 juli t/m 6 augustus 2026', verhaal: "'s Avonds door een versierde straat tijdens een Maltees dorpsfeest.", bijschrift: 'Dorpsfeest op Malta, de hele straat versierd.' },
    'foto-34': { plek: 'Malta, boottocht naar Comino, op een supboard in de Blue Lagoon', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr naar Comino; vanaf de boot de Blue Lagoon in.', bijschrift: 'De Blue Lagoon, zo blauw dat het nep leek.' },
    'foto-35': { plek: 'Malta, boottocht naar Comino, bij de kliffen', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr naar Comino, langs kliffen en grotten.', bijschrift: 'Kliffen en grotten bij Comino.' },
    'foto-36': { plek: 'Malta, boottocht naar Comino, suppen langs de kust', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr naar Comino; samen suppen langs de rotsen.', bijschrift: 'Samen op één board: ik peddel, jij kijkt 😏' },
    'foto-37': { plek: 'Malta, boottocht naar Comino, met kleimaskers op', wanneer: '3 augustus 2026', verhaal: 'Boottocht vanuit Mgarr naar Comino; samen met een groen kleimasker op de boot.', bijschrift: 'Groen in het gezicht en nog steeds knap. Allebei 😂' },
    'foto-38': { plek: 'Malta, dakterras met zwembad van ons hotel in Qawra', wanneer: '30 juli t/m 6 augustus 2026', verhaal: 'Ons hotel in Qawra had een dakterras met zwembad.', bijschrift: 'Dakterras met zwembad van ons hotel in Qawra.' },
    'foto-39': { plek: 'Feest van mijn oom en tante', wanneer: '12 september 2026', verhaal: 'Samen op het feest van mijn oom en tante.', bijschrift: 'Feest bij mijn oom en tante. Ik had de beste date mee ❤️' },
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
      reactie: 'Ik durfde je gewoon een DM te sturen. Graag gedaan 😏',
    },
    {
      vraag: 'Waar zaten we op onze eerste date?',
      opties: ['Op een terras met een arcadehal', 'In de bioscoop', 'Bij het bowlen', 'In een restaurant'],
      goed: 0,
      reactie: 'Terras én arcadehal, ik pakte meteen goed uit 😏',
    },
    {
      vraag: 'Waar aten we ons eerste ijsje op?',
      opties: ['Bij de Maas', 'In het park', 'In de auto', 'Op het terras'],
      goed: 0,
      reactie: 'Bij de Maas, en sindsdien is dat ons plekje.',
    },
    {
      vraag: 'Wat deden we op onze tweede date?',
      opties: ['Brownies bakken', 'Pizza bestellen', 'Film kijken', 'Shoppen'],
      goed: 0,
      reactie: 'Brownies bakken, en jij wilde daarna nog steeds een derde date 😅',
    },
    {
      vraag: 'Waar was onze eerste kus?',
      opties: ["Bij de Maas, 's avonds buiten", 'In de auto', 'Bij het afscheid op de eerste date', 'Bij jou thuis'],
      goed: 0,
      reactie: 'Bij de Maas, \'s avonds. Waar anders ❤️',
    },
    {
      vraag: 'Op welke date was onze eerste kus?',
      opties: ['De derde', 'De eerste', 'De tweede', 'De vijfde'],
      goed: 0,
      reactie: 'Pas op de derde date, ik nam mijn tijd 😅',
    },
    {
      vraag: 'Wanneer werden we officieel?',
      opties: ['22 november', '22 oktober', '12 november', '2 december'],
      goed: 0,
      reactie: '22 november, dus ook ons getal.',
    },
    {
      vraag: 'Wat deden we op de dag dat ik je verkering vroeg?',
      opties: ['Onze eerste date naspelen', 'Uit eten', 'Naar de film', 'Een dagje weg'],
      goed: 0,
      reactie: 'Zelfde date als de eerste keer, alleen met een beter einde 😏',
    },
    {
      vraag: 'Waar vroeg ik je verkering?',
      opties: ['In de auto bij de Maas', 'Op het terras', 'Bij jou thuis', 'Op een bankje in de stad'],
      goed: 0,
      reactie: 'In de auto bij de Maas. Romantischer kon ik het niet maken 😂',
    },
    {
      vraag: 'In welke plaats op Malta zat ons hotel?',
      foto: 'images/foto-30.jpg',
      opties: ['Qawra', 'Valletta', 'Sliema', 'Mdina'],
      goed: 0,
      reactie: 'Qawra. Knap dat jij dat nog weet 😏',
    },
    {
      vraag: 'Van wanneer tot wanneer waren we op Malta?',
      foto: 'images/foto-29.jpg',
      opties: ['30 juli t/m 6 augustus', '22 t/m 29 juli', '1 t/m 8 augustus', '6 t/m 13 augustus'],
      goed: 0,
      reactie: 'Een week Malta, en toen moesten we gewoon weer naar huis.',
    },
    {
      vraag: 'Welke lekkernij eten we graag samen?',
      opties: ['Aardbeien met chocola', 'Pannenkoeken', 'Sushi', 'Popcorn'],
      goed: 0,
      reactie: 'Aardbeien met chocola. Wie de meeste opeet, zeg ik niet 😏',
    },
    {
      vraag: "Wat deden we 's avonds op Malta bij de cocktails?",
      opties: ['Vragenspellen', 'Karaoke', 'Kaarten', 'Dansen'],
      goed: 0,
      reactie: 'Cocktails en vragenspellen, en ik dacht dat ik alles al van je wist 😅',
    },
    {
      vraag: 'Wat ging er mis op Malta?',
      opties: ['We hadden een busongeluk', 'We misten ons vliegtuig', 'We raakten de hotelsleutel kwijt', 'Alles regende weg'],
      goed: 0,
      reactie: 'Toen niet grappig, nu wel 😂',
    },
    {
      vraag: 'Wat is ons getal?',
      opties: ['22', '7', '11', '14'],
      goed: 0,
      reactie: '22. Makkelijkste vraag van de quiz 😏',
    },
    {
      vraag: 'Naar welke stad gingen we voor de kerstmarkt?',
      foto: 'images/foto-04.jpg',
      opties: ['Düsseldorf', 'Keulen', 'Aken', 'Maastricht'],
      goed: 0,
      reactie: 'Düsseldorf, jouw verjaardagscadeau. Goed gedaan van mezelf 😏',
    },
    {
      vraag: 'Wat kreeg je naast de kerstmarkt nog voor je verjaardag?',
      foto: 'images/foto-06.jpg',
      opties: ['Een kerstpyjama', 'Een kerstmuts', 'Een fotoboek', 'Een sieraad'],
      goed: 0,
      reactie: 'Een kerstpyjama erbij, ik doe niet half werk 😏',
    },
    {
      vraag: 'Naar welk concert gingen we op Valentijnsdag?',
      foto: 'images/foto-21.jpg',
      opties: ['CHO in de Ziggo Dome', 'Snelle in de Ziggo Dome', 'CHO in AFAS Live', 'Kris Kross Amsterdam in de Ziggo Dome'],
      goed: 0,
      reactie: 'CHO op Valentijnsdag. Punten voor mij 😏',
    },
    {
      vraag: 'Waar gingen we heen toen we een half jaar samen waren?',
      opties: ['Utrecht', 'Amsterdam', 'Rotterdam', 'Den Bosch'],
      goed: 0,
      reactie: 'Een half jaar samen, dus een dagje Utrecht.',
    },
    {
      vraag: 'Hoeveel dagen was ik bij je in Slagharen?',
      opties: ['3', '1', '2', '5'],
      goed: 0,
      reactie: 'Drie dagen Slagharen, en ik heb het overleefd 😂',
    },
    {
      vraag: 'Met welke groep trad je op in Slagharen?',
      foto: 'images/foto-20.jpg',
      opties: ['De Angels', 'De Stars', 'De Illusions', 'De Magics'],
      goed: 0,
      reactie: 'De Angels. Jij deed het zware werk, ik zat in het publiek 😅',
    },
    {
      vraag: 'Op welk festival danste je terwijl ik stond te kijken?',
      foto: 'images/foto-24.jpg',
      opties: ['Vunzige Deuntjes', 'Pinkpop', 'Lowlands', 'Defqon'],
      goed: 0,
      reactie: 'Jij moest dansen, ik hoefde alleen maar te kijken 😏',
    },
    {
      vraag: 'Waar gingen we heen na de BBQ bij vrienden van je gezin?',
      fotoNa: 'images/foto-27.jpg',
      opties: ['De kermis in Tilburg', 'Het strand', 'Naar huis', 'De kermis in Den Bosch'],
      goed: 0,
      reactie: 'Na de BBQ de kermis op, prima volgorde.',
    },
    {
      vraag: 'Waar vertrok onze boottocht op Malta?',
      foto: 'images/foto-37.jpg',
      opties: ['Mgarr', 'Valletta', 'Sliema', 'Qawra'],
      goed: 0,
      reactie: 'Vanuit Mgarr naar Comino. Die dag zagen we er allebei groen uit 😂',
    },
    {
      vraag: 'Met wie vierden we oud & nieuw?',
      foto: 'images/foto-08.jpg',
      opties: ['Met mijn vrienden', 'Met jouw familie', "Met z'n tweeën", 'Met mijn familie'],
      goed: 0,
      reactie: 'Met mijn vrienden. Dapper van je 😂',
    },
    {
      vraag: 'Bij welke attractie in de Winter Efteling gingen we samen met Jokie op de foto?',
      foto: 'images/foto-14.jpg',
      opties: ['Carnaval Festival', 'Droomvlucht', 'Python', 'Joris en de Draak'],
      goed: 0,
      reactie: 'Carnaval Festival, en Jokie wilde ook op de foto 😂',
    },
    {
      vraag: 'Waar stonden we op 16 april samen in een gigantische gele klomp?',
      fotoNa: 'images/foto-18.jpg',
      opties: ['Bij de bollenvelden', 'In Volendam', 'In de Efteling', 'Op de kermis'],
      goed: 0,
      reactie: 'In één gele klomp. Paste precies 😂',
    },
    {
      vraag: 'Wat gaf jij mij voor mijn verjaardag?',
      fotoNa: 'images/foto-28.jpg',
      opties: ['Samen indoor skiën', 'Concertkaartjes', 'Een weekendje weg', 'Een horloge'],
      goed: 0,
      reactie: 'Skiën in juli. Beste cadeau ooit ❤️',
    },
    {
      vraag: 'Welk kaartspel speelden we het meest op Malta?',
      opties: ['UNO', 'Pesten', 'Klaverjassen', 'Poker'],
      goed: 0,
      reactie: 'UNO. Wie er won, laat ik maar in het midden 😏',
    },
    {
      vraag: "Waar was jij toen ik je mijn eerste berichtje stuurde?",
      opties: ["In Thailand","Op Malta","Thuis","In Spanje"],
      goed: 0,
      reactie: "In Thailand, en ik zat er toevallig ook 😏",
    },
    {
      vraag: "Waar zat ik toen in Thailand?",
      opties: ["Phuket","Bangkok","Koh Samui","Chiang Mai"],
      goed: 0,
      reactie: "Phuket. Jij trok rond, ik zat gewoon in Phuket 😅",
    },
    {
      vraag: "Waar reageerde ik op in mijn eerste DM?",
      opties: ["Je story uit Thailand","Een foto van je","Een post over dansen","Niks, ik stuurde gewoon \"hey\""],
      goed: 0,
      reactie: "Je story uit Thailand. Ik vroeg gewoon waar je zat, smooth hè 😏",
    },
    {
      vraag: "Hoelang na mijn eerste DM was onze eerste date?",
      opties: ["Ongeveer een maand","Een week","Drie maanden","Een half jaar"],
      goed: 0,
      reactie: "Eerst een maand online kletsen, daarna pas een date 😅",
    },
    {
      vraag: "Wat zei jij bij onze eerste zoen?",
      opties: ["\"Wow flashbacks\"","\"Eindelijk\"","\"Wauw\"","Niks, je was sprakeloos"],
      goed: 0,
      reactie: "Wow flashbacks. Nog steeds de domste opmerking ooit 😂",
    },
    {
      vraag: "Wat was er mis met de Italiaan in Utrecht?",
      opties: ["Het eten was vies","Hij was dicht","We moesten een uur wachten","Ze hadden geen pizza"],
      goed: 0,
      reactie: "Mooi plekje aan de gracht, vies eten 😂",
    },
    {
      vraag: "Wat hadden we allebei aan met carnaval?",
      opties: ["Een Oeteldonk-jasje","Een kikkerpak","Een cowboyhoed","Een pyjama"],
      goed: 0,
      reactie: "Allebei een Oeteldonk-jasje, jij nog met een skibril erbij 😂",
    },
    {
      vraag: "Waar botste de bus op Malta tegen?",
      opties: ["Een auto","Een muur","Een andere bus","Een scooter"],
      goed: 0,
      reactie: "Tegen een auto. Vakantie met een verhaal erbij 😂",
    },
    {
      vraag: "Welke snack uit Thailand vonden we allebei geweldig?",
      opties: ["De lava cakejes van de 7-Eleven","Mango sticky rice","Pad thai","Kokosijs"],
      goed: 0,
      reactie: "Lava cakejes van de 7-Eleven. We hadden al iets gemeen voordat we elkaar spraken 😏",
    },
    {
      vraag: "Waar sliep ik in Slagharen?",
      opties: ["In jouw huisje van het bedrijf","In een hotel","In de auto","Bij vrienden in de buurt"],
      goed: 0,
      reactie: "In jouw huisje van het bedrijf. Jij werkte, ik keek alle shows 😏",
    },
  ],

  // ----------------------------------------------------------
  // 3. WIE VAN ONS TWEE?
  // ----------------------------------------------------------
  // 'antwoord' is 'Wout', 'Davinia' of 'Allebei'.
  wieVanOns: [
    { stelling: 'Wie is meestal te laat?',                            antwoord: 'Davinia', reactie: 'Ik reken er gewoon tien minuten bij 😏' },
    { stelling: 'Wie valt als eerste in slaap bij een film?',         antwoord: 'Davinia', reactie: 'Halverwege de film ben jij al weg 😂' },
    { stelling: 'Wie heeft het langst nodig om zich klaar te maken?', antwoord: 'Davinia', reactie: 'Ik zit al klaar, jij nog lang niet 😏' },
    { stelling: 'Wie zei als eerste "ik hou van jou"?',               antwoord: 'Wout',    reactie: 'Ik zei het eerst, dus ik win 😏' },
    { stelling: 'Wie kan nooit kiezen wat we gaan eten?',             antwoord: 'Allebei', reactie: '"Maakt mij niet uit." "Mij ook niet." En dan maar naar de McDonald\'s 😂' },
    { stelling: 'Wie is het meest competitief?',                      antwoord: 'Allebei', reactie: 'Allebei, maar ik win vaker 😏' },
    { stelling: 'Wie kan beter koken?',                               antwoord: 'Davinia', reactie: 'Jij kookt, ik zeg dat het lekker is 😏' },
    { stelling: "Wie maakt de meeste foto's?",                        antwoord: 'Davinia', reactie: 'Zonder jou had dit spel geen foto\'s gehad 😂' },
    { stelling: 'Wie is het eerst moe op een festival of feest?',     antwoord: 'Allebei', reactie: 'Allebei, alleen geeft niemand het als eerste toe 😅' },
    { stelling: 'Wie zou het eerst verdwalen in Mdina?',              antwoord: 'Davinia', reactie: 'Gelukkig liep ik mee 😏' },
    { stelling: 'Wie stuurt de meeste berichtjes overdag?',           antwoord: 'Wout',    reactie: 'Ik, maar jij bent ook vaak aan het dansen 😏' },
    { stelling: "Wie had het koud in de Winter Efteling?", antwoord: 'Wout', reactie: "Ik, en ik heb het normaal juist snel heet 😅" },
    { stelling: "Wie heeft het altijd snel koud?", antwoord: 'Davinia', reactie: "Jij. Ik heb het juist snel heet, dus samen komen we precies goed uit 😏" },
    { stelling: "Wie lacht om z'n eigen grappen voordat ze af zijn?", antwoord: 'Davinia', reactie: "Jij, nog voordat de grap af is 😂" },
    { stelling: "Wie zit volgens de ander te veel op z'n telefoon?", antwoord: 'Wout', reactie: "Ik, volgens jou. Dat geluidje ken ik inmiddels uit mijn hoofd 😅" },
    { stelling: "Wie is het positiefst?", antwoord: 'Davinia', reactie: "Jij, altijd. Dat vind ik echt knap ❤️" },
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
        reactie: "Kerstmarkt Düsseldorf, jouw verjaardag. Dat cadeau blijft goed 😏",
      },
      {
        foto: 'images/foto-07.jpg',
        vraag: "Welke avond was dit?",
        opties: ["Kerstavond 2025","Oud & nieuw","Jouw feest op 10 januari","Het feest van mijn oom en tante"],
        goed: 0,
        reactie: "Kerstavond, vlak voor het eten met jouw gezin en je oma.",
      },
      {
        foto: 'images/foto-10.jpg',
        vraag: "Op welk feest is deze foto gemaakt?",
        opties: ["Jouw feest op 10 januari","Oud & nieuw","Het feest van mijn oom en tante","Kerstavond"],
        goed: 0,
        reactie: "Jouw feest, jij in goud. Niet moeilijk te raden 😏",
      },
      {
        foto: 'images/foto-15.jpg',
        vraag: "Wanneer is deze foto gemaakt?",
        opties: ["15 februari 2026","14 februari 2026","26 januari 2026","10 januari 2026"],
        goed: 0,
        reactie: "Carnaval, een dag na CHO. Wij doen niet aan rustdagen 😂",
      },
      {
        foto: 'images/foto-17.jpg',
        vraag: "Wanneer stonden we in dit lijstje?",
        opties: ["16 april 2026","24 april 2026","22 mei 2026","4 juli 2026"],
        goed: 0,
        reactie: "Bollenvelden, 16 april. In dat lijstje zien we er best goed uit 😏",
      },
      {
        foto: 'images/foto-26.jpg',
        vraag: "Wanneer is deze foto gemaakt?",
        opties: ["25 juli 2026","4 juli 2026","27 juli 2026","22 mei 2026"],
        goed: 0,
        reactie: "Kermis Tilburg, na de BBQ.",
      },
      {
        foto: 'images/foto-32.jpg',
        vraag: "Waar is deze foto gemaakt?",
        opties: ["Mdina","Valletta","Qawra","Sliema"],
        goed: 0,
        reactie: "Mdina. Hier zou jij als eerste verdwalen 😏",
      },
      {
        foto: 'images/foto-39.jpg',
        vraag: "Op welk feest is deze foto gemaakt?",
        opties: ["Het feest van mijn oom en tante","Jouw feest op 10 januari","Oud & nieuw","Vunzige Deuntjes"],
        goed: 0,
        reactie: "Het feest van mijn oom en tante, met jou als date ❤️",
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
    { datum: "het begin", titel: "Een DM op Instagram", tekst: "Ik stuurde het eerste berichtje. Je mag me nog steeds bedanken 😏" },
    { datum: "eerste date", titel: "Terras, arcade, ijsje", tekst: "Terras, arcadehal en een ijsje bij de Maas." },
    { datum: "tweede date", titel: "Brownies bakken", tekst: "Samen brownies gebakken." },
    { datum: "derde date", titel: "Onze eerste kus", tekst: "'s Avonds buiten bij de Maas ❤️" },
    { datum: "22 november 2025", titel: "Officieel samen", tekst: "In de auto bij de Maas, na het naspelen van onze eerste date.", vast: 'begin' },
    { datum: "6 december 2025", titel: "Uit eten met mijn gezin", tekst: "Uit eten met mijn gezin. Je kwam gewoon terug 😂", foto: 'images/foto-01.jpg' },
    { datum: "22 december 2025", titel: "Kerstmarkt Düsseldorf", tekst: "Jouw verjaardagscadeau, met een kerstpyjama erbij.", foto: 'images/foto-05.jpg' },
    { datum: "24 december 2025", titel: "Kerstavond", tekst: "Uit eten met jouw gezin en je oma.", foto: 'images/foto-07.jpg' },
    { datum: "31 december 2025", titel: "Oud & nieuw", tekst: "Het nieuwe jaar in met mijn vrienden en jou.", foto: 'images/foto-09.jpg' },
    { datum: "10 januari 2026", titel: "Jouw feest", tekst: "Jij in een gouden jurk, ik er netjes naast 😏", foto: 'images/foto-12.jpg' },
    { datum: "26 januari 2026", titel: "Winter Efteling", tekst: "Mutsen op, en Jokie op de foto.", foto: 'images/foto-13.jpg' },
    { datum: "14 februari 2026", titel: "CHO op Valentijnsdag", tekst: "CHO in de Ziggo Dome op Valentijnsdag.", foto: 'images/foto-21.jpg' },
    { datum: "15 februari 2026", titel: "Carnaval", tekst: "Een dag na CHO meteen weer feest 😅", foto: 'images/foto-15.jpg' },
    { datum: "16 april 2026", titel: "Bollenvelden", tekst: "Samen in een gele klomp 😂", foto: 'images/foto-16.jpg' },
    { datum: "24 april 2026", titel: "Slagharen", tekst: "Drie dagen bij jou, en jij op het podium met de Angels.", foto: 'images/foto-20.jpg' },
    { datum: "22 mei 2026", titel: "Half jaar in Utrecht", tekst: "Een half jaar samen, dagje Utrecht." },
    { datum: "4 juli 2026", titel: "Vunzige Deuntjes", tekst: "Jij moest dansen, ik keek toe 😏", foto: 'images/foto-23.jpg' },
    { datum: "25 juli 2026", titel: "BBQ en kermis", tekst: "BBQ bij vrienden van jouw gezin, daarna de kermis in Tilburg.", foto: 'images/foto-26.jpg' },
    { datum: "27 juli 2026", titel: "Indoor skiën", tekst: "Jouw verjaardagscadeau voor mij: samen de piste op.", foto: 'images/foto-28.jpg' },
    { datum: "30 juli 2026", titel: "Malta", tekst: "Qawra, Comino, sudoku's en cocktails.", foto: 'images/foto-30.jpg' },
    { datum: "12 september 2026", titel: "Feest oom en tante", tekst: "Feest bij mijn oom en tante.", foto: 'images/foto-39.jpg' },
    { datum: "22 november 2026", titel: "Eén jaar samen", tekst: "Jaar één zit erop ❤️", vast: 'eind' },
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
      { woord: "QAWRA", uitleg: "Daar stond ons hotel, met dakterras.", foto: 'images/foto-38.jpg' },
      { woord: "MDINA", uitleg: "De stille stad, waar jij als eerste zou verdwalen 😏", foto: 'images/foto-32.jpg' },
      { woord: "KERST", uitleg: "Kerstmarkt in Düsseldorf en kerst samen.", foto: 'images/foto-02.jpg' },
      { woord: "SAMEN", uitleg: "Al een jaar, en je bent nog niet van me af 😂", foto: 'images/foto-09.jpg' },
      { woord: "KUSJE", uitleg: "De eerste was bij de Maas 😘" },
      { woord: "ZOMER", uitleg: "Festivals, kermis en Malta.", foto: 'images/foto-22.jpg' },
      { woord: "FEEST", uitleg: "Jouw feest op 10 januari.", foto: 'images/foto-10.jpg' },
      { woord: "CHOCO", uitleg: "Hoort bij de aardbeien." },
      { woord: "KLOMP", uitleg: "Die gele klomp bij de bollenvelden 😂", foto: 'images/foto-16.jpg' },
    ],
    // Galgje (met een smeltend ijsje): mag langer zijn, spaties mogen.
    // 'hint' staat erbij tijdens het raden, 'herinnering' (en 'foto') daarna.
    galgje: [
      { woord: "BROWNIES", hint: "Wat we bakten op onze tweede date", herinnering: "Tweede date. Je wilde daarna nog een derde, dus zo slecht waren ze niet 😂" },
      { woord: "VERKERING", hint: "Wat ik je vroeg in de auto bij de Maas", herinnering: "22 november in de auto bij de Maas. Je zei ja, slimme keuze 😏" },
      { woord: "BLUE LAGOON", hint: "Dat blauwe water bij Comino", herinnering: "Met de boot naar Comino, water zo blauw dat het nep leek.", foto: 'images/foto-34.jpg' },
      { woord: "AARDBEIEN", hint: "Met chocola, natuurlijk", herinnering: "Met chocola, anders telt het niet." },
      { woord: "INSTAGRAM", hint: "Waar ons eerste berichtje stond", herinnering: "Daar begon het, met mijn DM 😏" },
      { woord: "BOOTTOCHT", hint: "Een van onze leukste dagen op Malta", herinnering: "Vanuit Mgarr naar Comino, met kleimaskers en suppen.", foto: 'images/foto-35.jpg' },
      { woord: "KERSTMARKT", hint: "Jouw verjaardagscadeau in Düsseldorf", herinnering: "Düsseldorf, jouw verjaardagscadeau. Met reuzenrad en schaatsbaan erbij.", foto: 'images/foto-04.jpg' },
      { woord: "SLAGHAREN", hint: "Drie dagen bij jou, jij op het podium", herinnering: "Drie dagen bij jou, jij op het podium met de Angels.", foto: 'images/foto-20.jpg' },
      { woord: "KERSTPYJAMA", hint: "Het cadeautje dat erbij hoorde", herinnering: "Het cadeautje bij de kerstmarkt. Ik denk overal aan 😏" },
      { woord: "CARNAVAL", hint: "Een dag na Valentijn alweer feest", herinnering: "Een dag na CHO meteen carnaval 😅", foto: 'images/foto-15.jpg' },
      { woord: "ARCADEHAL", hint: "Stond naast het terras van onze eerste date", herinnering: "Naast het terras van onze eerste date. Ik pakte meteen goed uit 😏" },
      { woord: "BOLLENVELDEN", hint: "Waar we samen in een gele klomp stonden", herinnering: "16 april, samen in de gele klomp 😂", foto: 'images/foto-16.jpg' },
      { woord: "ZIGGO DOME", hint: "Waar we op Valentijnsdag CHO zagen", herinnering: "CHO op Valentijnsdag ❤️", foto: 'images/foto-21.jpg' },
      { woord: "WINTER EFTELING", hint: "Mutsen op, en Jokie op de foto", herinnering: "Mutsen op, en Jokie wilde mee op de foto 😂", foto: 'images/foto-13.jpg' },
      { woord: "KLEIMASKER", hint: "Groen in het gezicht, op de boot", herinnering: "Groen in het gezicht en nog steeds knap. Allebei 😂", foto: 'images/foto-37.jpg' },
    ],
  },

  // ----------------------------------------------------------
  // 7. HARTJESBLOKKEN
  // ----------------------------------------------------------
  hartjesblokken: {
    // Elk potje een andere foto (in deze volgorde, daarna weer van voren af aan).
    // Hij begint vaag en wordt bij elke weggespeelde rij of kolom scherper.
    // Het bijschrift (uit fotoUitleg) verschijnt als hij helemaal scherp is.
    fotos: [
      'images/foto-30.jpg',   // zonsondergang Qawra
      'images/foto-33.jpg',   // dorpsfeest Malta
      'images/foto-16.jpg',   // gele klomp, bollenvelden
      'images/foto-20.jpg',   // Slagharen, vonken
      'images/foto-02.jpg',   // reuzenrad Düsseldorf
      'images/foto-26.jpg',   // kermis Tilburg
    ],
    // Na zoveel weggespeelde rijen/kolommen is de foto helemaal scherp.
    rijenTotScherp: 10,
    // Bij een weggespeelde rij verschijnt kort één van deze berichtjes. Kort houden.
    berichtjes: [
      "Lekker bezig",
      "Hup, weg ermee",
      "Opgeruimd staat netjes",
      "Dat ging snel 😏",
      "Sudoku-kampioen, en nu dit ook al?",
      "22 blijft ons getal",
      "Nog een rij, dan aardbeien met chocola",
      "Jij bent hier beter in dan ik 😅",
      "Netjes!",
      "Oké, je mag even opscheppen 😏",
    ],
  },

  // ----------------------------------------------------------
  // 8. SUDOKU (Malta)
  // ----------------------------------------------------------
  sudoku: {
    // De startcijfers verwerken 22 en/of 22-11 (onze datum); dat regelt het spel zelf.
    // Elk opgelost 3x3-vak speelt één herinnering vrij: precies 9 stuks.
    // Verschijnt als de héle sudoku af is: de herinnering zonder foto.
    slotHerinnering: 'En het busongeluk? Toen niet grappig, nu wel 😂',
    maltaHerinneringen: [
      { foto: 'images/foto-29.jpg', bijschrift: "Koffers in de auto, op naar Malta." },
      { foto: 'images/foto-38.jpg', bijschrift: "Ons dakterras met zwembad in Qawra." },
      { foto: 'images/foto-30.jpg', bijschrift: "Zonsondergang in Qawra." },
      { foto: 'images/foto-31.jpg', bijschrift: "Mdina, waar jij als eerste zou verdwalen 😏" },
      { foto: 'images/foto-33.jpg', bijschrift: "Een dorpsfeest vol lichtjes." },
      { foto: 'images/foto-34.jpg', bijschrift: "De Blue Lagoon bij Comino, zo blauw dat het nep leek." },
      { foto: 'images/foto-35.jpg', bijschrift: "Met de boot vanuit Mgarr naar Comino." },
      { foto: 'images/foto-36.jpg', bijschrift: "Samen suppen: ik peddel, jij kijkt 😏" },
      { foto: 'images/foto-37.jpg', bijschrift: "Groene kleimaskers op de boot 😂" },
    ],
  },

  // ----------------------------------------------------------
  // 9. WOORDZOEKER EN KRUISWOORD
  // ----------------------------------------------------------
  woordzoeker: {
    // Woordzoekers: woorden staan horizontaal, verticaal of schuin (nooit achterstevoren).
    // De letters die overblijven vormen samen de 'zin' (spaties en leestekens tellen niet).
    // Past de zin niet precies (bijv. na het wijzigen van woorden), dan vult het spel
    // de rest op met willekeurige letters. Vraag Claude dan om de zin aan te passen.
    puzzels: [
      { titel: 'Malta', grootte: 9, woorden: ['MALTA', 'QAWRA', 'MDINA', 'VALLETTA', 'COMINO', 'SUDOKU', 'TERRAS'], zin: 'Eén puzzel per cocktail was echt een eerlijke ruil' },
      { titel: 'Thuis', grootte: 9, woorden: ['MAAS', 'BROWNIES', 'AARDBEI', 'CHOCOLA', 'PYJAMA', 'TULPEN', 'ARCADE'], zin: 'Samen bakken telt in mijn boek echt als een date' },
      { titel: 'Onderweg', grootte: 10, woorden: ['DUSSELDORF', 'KERSTMARKT', 'CARNAVAL', 'SLAGHAREN', 'EFTELING', 'UTRECHT', 'KERMIS', 'ANGELS'], zin: 'Volgend jaar weer zoveel uitjes, jij mag plannen' },
    ],
    // Kruiswoordpuzzel: woord + hint. De gemarkeerde vakjes vormen samen het oplossingswoord.
    kruiswoord: [
      { woord: 'MAAS',      hint: 'Ons plekje' },
      { woord: 'MALTA',     hint: 'Onze eerste vakantie samen' },
      { woord: 'QAWRA',     hint: 'Waar ons hotel stond' },
      { woord: 'BROWNIES',  hint: 'Tweede date in de keuken' },
      { woord: 'ARCADE',    hint: 'Stond naast ons eerste terras' },
      { woord: 'INSTAGRAM', hint: 'Waar ik je als eerste een berichtje stuurde' },
      { woord: 'COCKTAIL',  hint: 'Met een vragenspel erbij, op Malta' },
      { woord: 'SUDOKU',    hint: 'Onze vakantieverslaving' },
      { woord: 'UNO',       hint: 'Hét kaartspel van Malta. Wie er won, laat ik in het midden 😏' },
    ],
    kruiswoordOplossing: 'SAMEN',
  },

  // ----------------------------------------------------------
  // 10. DIT OF DAT
  // ----------------------------------------------------------
  // Davinia raadt wat JIJ zou kiezen. 'mijnKeuze' is 'a' of 'b'.
  // 'vraag' is optioneel (anders: "Wat kiest Wout?"). Het spel husselt de
  // volgorde en zet a en b soms andersom neer.
  ditOfDat: [
    { a: "Kerstmarkt", b: "Kermis", mijnKeuze: 'a', reactie: "Kerstmarkt. Die van Düsseldorf legde de lat hoog 😏" },
    { a: "IJsje", b: "Brownie", mijnKeuze: 'a', reactie: "Een ijsje, daar begon het bij de Maas mee." },
    { a: "Zomer", b: "Winter", mijnKeuze: 'a', reactie: "Zomer. Malta, festivals en kermis, makkelijke keuze." },
    { a: "Vroeg opstaan", b: "Uitslapen", mijnKeuze: 'b', reactie: "Ja ik weet het, ik ben lui 😂" },
    { a: "Festival", b: "Concert", mijnKeuze: 'a', reactie: "Festival, het liefst eentje waar jij danst 😏" },
    { a: "Film", b: "Serie", mijnKeuze: 'b', reactie: "Serie, want na één aflevering lig jij toch al te slapen 😂" },
    { a: "Zoet", b: "Zout", mijnKeuze: 'a', reactie: "Zoet. Aardbeien met chocola, dus." },
    { a: "Auto", b: "Fiets", mijnKeuze: 'a', reactie: "Auto, daar vroeg ik je verkering in 😏" },
    { a: "Bellen", b: "Appen", mijnKeuze: 'b', reactie: "Appen, zo begon het ook." },
    { vraag: "Eén uitje overdoen", a: "Malta", b: "De kerstmarkt in Düsseldorf", mijnKeuze: 'a', reactie: "Malta. Een week tegen één dag, sorry Düsseldorf 😅" },
    { vraag: "Nog een keer", a: "CHO in de Ziggo Dome", b: "Vunzige Deuntjes", mijnKeuze: 'a', reactie: "CHO, want bij Vunzige Deuntjes moest jij werken 😏" },
    { vraag: "Perfecte avond", a: "IJsje halen en naar de Maas", b: "Samen brownies bakken", mijnKeuze: 'a', reactie: "IJsje en de Maas, dat blijft ons plekje ❤️" },
    { vraag: "Bij de McDonald’s", a: "Big Mac", b: "McChicken", mijnKeuze: 'b', reactie: "McChicken. Ik verander niet zo snel 😅" },
    { vraag: "Avondje bank", a: "Netflix", b: "YouTube", mijnKeuze: 'a', reactie: "Netflix, en jij die halverwege in slaap valt 😂" },
    { a: "Waterpark", b: "Kermis", mijnKeuze: 'a', reactie: "Waterpark. Malta heeft de lat gelegd." },
    { vraag: "Op de kerstmarkt in Düsseldorf", a: "Reuzenrad", b: "Schaatsbaan", mijnKeuze: 'b', reactie: "Schaatsbaan, en we stonden allebei nog 😂" },
    { a: "Mdina", b: "Valletta", mijnKeuze: 'b', reactie: "Valletta, want in Mdina zou jij toch verdwalen 😏" },
    { vraag: "Op een terrasje", a: "Cocktail", b: "Biertje", mijnKeuze: 'a', reactie: "Cocktail, met een vragenspel erbij." },
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
    { vrijBij: 'woordspel',      titel: 'Even in woorden',           tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'hartjesblokken', titel: 'Stukje voor stukje',        tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'sudoku',         titel: 'Terug naar Malta',          tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'woordzoeker',    titel: 'Gevonden!',                 tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'ditofdat',       titel: 'Mijn keuze',                tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
    { vrijBij: 'kleuren',        titel: 'Kleur bekennen',            tekst: 'Lieve Davinia,\n\nTODO\n\nXxx Wout' },
  ],

  // ----------------------------------------------------------
  // 12. KLEUREN OP NUMMER
  // ----------------------------------------------------------
  // Foto's om in te kleuren. Het spel maakt er zelf een raster van,
  // in drie niveaus (makkelijk, gemiddeld, moeilijk). Close-ups met grote
  // gezichten en duidelijke kleuren werken het best.
  // Het bijschrift aan het eind komt uit fotoUitleg; met 'bijschrift' hier
  // kun je dat per foto overschrijven.
  kleurplaten: [
    { foto: 'images/foto-18.jpg' },   // bollenvelden: tulpen + lucht
    { foto: 'images/foto-21.jpg' },   // CHO: dichtbij, rood licht
    { foto: 'images/foto-01.jpg' },   // restaurant: gezichten goed herkenbaar
    { foto: 'images/foto-37.jpg' },   // kleimaskers op de boot
    { foto: 'images/foto-13.jpg' },   // Winter Efteling met Jokie
    { foto: 'images/foto-28.jpg' },   // skilift, roze jas
  ],
};
