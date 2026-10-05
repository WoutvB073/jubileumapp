# JubileumApp — plan en werkafspraken voor Claude

Lees dit bestand aan het begin van elke sessie. Communiceer in het **Nederlands**; de gebruiker (Wout) is beginner, dus werk stap voor stap en leg kort uit wat je doet.

## Doel
Een webapp (PWA) als cadeau voor het eenjarig jubileum van Wout en zijn vriendin **Davinia**, half november 2026. Een verzameling kleine spelletjes en quizzes over hen tweeën. Davinia krijgt alles in één keer op de dag zelf.

## Techniek en hosting
- Projectmap: `C:\dev\JubileumApp`. Eigen GitHub-repository, gehost via **GitHub Pages** (branch `main`, map `/` — geen Actions nodig).
- Alleen **HTML, CSS en vanilla JavaScript**: geen build-stap, geen frameworks, geen backend, geen account.
- Ontworpen voor **iPhone (Safari)**, alleen mobiel, **portretmodus** (liggend → melding "draai je telefoon").
- Installeerbaar als PWA: `manifest.webmanifest`, `apple-touch-icon`, standalone-weergave, offline via service worker (`sw.js`).
- Wordt de link gewoon in Safari geopend, dan toont de app alleen een lief instructiescherm "Zet mij op je beginscherm" (Deel-knop → Zet op beginscherm). De app zelf start alleen vanaf het beginscherm-icoon (standalone-detectie).
- Voortgang en scores in **localStorage** (sleutel `jubileum.v1`).
- Elk spel in een **eigen JS-bestand** (`js/spellen/<id>.js`), zodat een fout in één spel de rest niet breekt.
- Alle paden **relatief** (de site draait onder `https://<gebruiker>.github.io/<repo>/`).

## Sfeer en ontwerp
- Romantisch en zacht: pastelkleuren (roze, lila, crème), hartjes, ronde vormen, zachte animaties.
- Grote knoppen die makkelijk met de duim te raken zijn, vriendelijke typografie (iOS: `ui-rounded` voor tekst, `Snell Roundhand` voor sierletters — geen webfonts nodig).
- Alle teksten in het Nederlands.
- Alleen licht thema (`color-scheme: only light`), statusbalk `default`.

## Toon (geldt voor de hele app) — vervangen op 4 okt 2026
- **Niet zoetsappig.** Schrijf zoals Wout praat: **plagerig naar haar en met zelfspot over zichzelf**. Voorbeelden van de goede toon: "Alsof jij om 7 uur op wil staan" en "Ja ik weet het, ik ben lui".
- Netjes geschreven, maar niet formeel.
- **Emoji's alleen deze soort:** 😂 😅 😏 voor lachen en plagen, en heel spaarzaam ❤️ of 😘. Geen andere emoji's in teksten.
- Lengte mag verschillen: meestal één korte zin, soms twee.
- **Verzin GEEN nieuwe feiten, gebeurtenissen of verhaaltjes.** Gebruik alleen wat in content.js staat (feiten, momenten, foto-uitleg, de antwoorden van Wout). Wil je een langere tekst met een verhaaltje: eerst Wout om input vragen.
- Werkwijze bij tekstwijzigingen: eerst in `teksten-overzicht.md` (lokaal, niet in git) met nummers per spel, Wout stuurt correcties ("Q12: nieuwe tekst"), pas daarna in de app.

## Inhoud apart van de code
- Alle persoonlijke inhoud (quizvragen, woorden, foto's met bijschriften, tijdlijnmomenten, berichtjes, liefdesbriefjes, Wouts antwoorden) staat in **één bestand: `content.js`**, met voorbeelden en TODO's zodat Wout het zelf invult. Tot die tijd nette placeholder-inhoud.
- Foto's in `/images`, verkleind tot max **1200px breed als JPG**. Hulpscript: zet originelen in `foto-origineel/` (niet in git) en dubbelklik `tools/verklein-fotos.cmd`.
- `content.js` zet `self.CONTENT`; de service worker leest het ook in om alle foto's vooraf offline op te slaan. Dus: geen DOM-code in `content.js`.
- Help Wout met ideeën voor vragen en berichtjes; de echte details vult hij zelf in.

## Structuur
- Hoofdmenu met alle spellen als tegels, vrij te kiezen, per spel een hartjesscore (0–3) of vinkje als het gespeeld is. Brievenbus als aparte knop in het menu.
- Routing via de hash: `#menu`, `#spel/<id>` (zo werkt terug-vegen ook).
- Bestanden:
  - `index.html` — schermen (installatie-instructie, menu, spel), laadt de scripts met `defer`.
  - `css/style.css` — kleuren (variabelen op `:root`), layout, animaties.
  - `content.js` — alle persoonlijke inhoud.
  - `js/app.js` — opslag, spellenlijst (`SPELLEN`), register, menu, router, installatiescherm, toast.
  - `js/spellen/<id>.js` — één spel per bestand. Registreert zich met:
    ```js
    Spellen.registreer({
      id: 'quiz',
      start(el, api) { /* bouw het spel in el */ },  // api.content, api.klaar({ hartjes: 0-3 }), api.terug(), api.toast(tekst), api.opslag
      stop() { /* optioneel: timers opruimen */ }
    });
    ```
    Nieuw spel toevoegen = bestand maken + `<script defer>` in `index.html` + pad in `KERN` in `sw.js` + `VERSIE` in `sw.js` ophogen.
  - `sw.js` — service worker (netwerk eerst met cache als terugval; foto's cache eerst).
  - `manifest.webmanifest`, `icons/` (gemaakt uit `icons/icoon.svg`), `icons/splash/` (iPhone-opstartschermen).
  - `tools/verklein-fotos.ps1` + `.cmd` — foto's verkleinen (Windows, zonder installatie).
- In een gewone browser de app zelf bekijken: `…/?dev=1` (blijft actief in dat tabblad).
- Lokaal bekijken: launch-config `jubileumapp` (poort 8781) in `C:\Users\woutv\OneDrive\Documenten\Claude AI\Websites\.claude\launch.json`.

## Spellen (in deze volgorde, één per stap)
1. **Basis**: beginscherm-instructie, PWA-instellingen, hoofdmenu met tegels voor alle spellen (nog niet werkend: "binnenkort"), `content.js` met placeholder-structuur, map `/images`.
2. **Quiz over ons**: meerkeuzevragen, eventueel met foto, met een uitleg of grappige reactie na elk antwoord.
3. **Wie van ons twee?**: stellingen, kies Wout of Davinia.
4. **Fotospellen**: memory met hun foto's, en "Raad de plek/datum" bij een foto.
5. **Tijdlijn**: momenten (met foto) in de goede volgorde slepen.
6. **Woordspel**: Wordle-achtig spel én galgje met woorden die voor hen iets betekenen.
7. **Hartjesblokken** (blokpuzzel à la Block Blast, eigen naam en ontwerp): blokvormen op een 8x8-raster slepen; volle rijen/kolommen vallen weg. Blokjes zijn pastel hartjes. Een vervaagde foto van hen op de achtergrond wordt per weggespeelde rij scherper. Bij elke weggespeelde rij verschijnt kort een lief berichtje uit `content.js`.
8. **Sudoku**: echte 9x9-Sudoku met geldige, oplosbare puzzels (een paar niveaus). Malta-sfeer in het ontwerp (veel sudoku's gedaan op reis in Malta), de startcijfers verwerken hun datum waar mogelijk, en elk opgelost 3x3-vak speelt een Malta-herinnering vrij (foto + bijschrift).
9. **Woordzoeker** met hun woorden, en eventueel een kleine kruiswoordpuzzel met hints over hen.
10. **Dit of dat**: Davinia raadt wat Wout zou kiezen; zijn antwoorden staan in `content.js`.
11. **Brievenbus**: bij het voltooien van spellen worden korte liefdesbriefjes vrijgespeeld, terug te lezen via het hoofdmenu.
12. **Kleuren op nummer**: een foto wordt in de browser (canvas, kleurkwantisatie) omgezet in een raster van vakjes (bijv. 30x40, instelbaar per foto in `content.js`) met 8–12 kleuren. Elk vakje toont een cijfer; onderaan het genummerde palet. Kies een kleur en tik of veeg over vakjes; vakjes van de gekozen kleur lichten op. Inzoomen en schuiven met twee vingers. Voortgang bewaard. Als alles klaar is: uitzoomen naar de pixelversie, daarna de echte foto met een lief bijschrift. Meerdere foto's mogelijk. **Bij deze stap eerst Wout een eigen foto laten testen** om rastergrootte en aantal kleuren te kiezen.
13. **Kloklezen — gebouwd 5 okt als "Hoe laat is het?"** (na kleuren op nummer, vóór UNO): een korte, serieuze quiz met een analoge klok: "Hoe laat is het?" met meerkeuze. Knipoog naar haar te laat komen, maar het spel zelf is gewoon serieus; alleen de intro of uitslag mag er een grapje over maken.
14. **Allerlaatste stap, na alle solospellen — NOG NIET BOUWEN: online UNO-variant** in het thema van de app, die Wout en Davinia allebei op hun eigen telefoon tegen elkaar kunnen spelen (UNO was hét kaartspel op Malta). Let op: dit botst met "geen backend" — er moet iets zijn dat de twee telefoons verbindt. Bij deze stap eerst met Wout de opties bespreken (bijv. een gratis realtime-dienst, of telefoons direct koppelen via WebRTC met een code), voordat er iets gebouwd wordt.

## Werkwijze
- Na elke stap: **stop**, vertel welke bestanden gemaakt of gewijzigd zijn, werk "Voortgang" hieronder bij, en leg uit hoe Wout commit, naar GitHub pusht en het op zijn iPhone test.
- **Wacht op bevestiging** voordat je aan de volgende stap begint.
- Houd de code simpel en leesbaar.
- Keuzes die gebruik of uitstraling raken en niet in dit plan staan: eerst vragen.
- Visuele wijzigingen: eerst zelf screenshots maken en laten zien (puppeteer-core + lokale Chrome, scripts in de scratchpad; de browser-pane maakt slechte uitsneden bij scrollen).
- Commits eindigen met `Co-Authored-By: Claude …`; git-identiteit lokaal: `WoutvB073` / GitHub-noreply-adres.

## Valkuilen
- Na elke wijziging die online moet: `VERSIE` in `sw.js` ophogen (anders kan een oude versie uit de cache blijven hangen als er geen netwerk is).
- GitHub Pages (gratis) vereist een **openbare** repository: alles in de repo (ook foto's en briefjes) is in principe vindbaar.
- iPhone-foto's zijn vaak HEIC: eerst als JPG exporteren (of Camera → Formaten → "Meest compatibel").
- De geïnstalleerde app heeft eigen opslag, los van Safari.
- iOS 26: Deel-knop zit soms achter de `•••`-knop; bij "Zet op beginscherm" moet "Open als webapp" aan staan.

## Voortgang
- [x] **Stap 1 – Basis** (2 okt 2026, goedgekeurd): installatiescherm, PWA (manifest, iconen, opstartschermen, service worker), hoofdmenu met 10 speltegels + brievenbus ("binnenkort"), `content.js` met placeholder-inhoud en ideeën, placeholder-foto's, fotoverkleinscript. Repo `WoutvB073/jubileumapp` (openbaar), Pages vanaf `main` / root: https://woutvb073.github.io/jubileumapp/
  - Wouts eigen foto's: 39 JPG's (uit een WhatsApp-zip, geen HEIC, geen GPS) verkleind naar `images/foto-01.jpg` t/m `foto-39.jpg`. Staan **voorlopig in `.gitignore`** (niet online) tot Wout akkoord geeft om ze in de openbare repo te zetten. Originelen in `foto-origineel/` (nooit in git).
  - **Eigen foto's online zetten:** `images/foto-*.jpg` blijft in `.gitignore`; alleen foto's die echt in `content.js` gebruikt worden gaan online met `git add -f images/foto-XX.jpg`. Overzicht met nummers: `foto-overzicht.jpg` (lokaal, niet in git).
- [x] **Stap 2 – Quiz over ons** (2 okt 2026, online; per ongeluk gebouwd in de IntervalFit-sessie, die het daarna deels terugdraaide — hersteld en gecommit in deze sessie): 15 meerkeuzevragen uit `content.js`, opties worden per spelletje gehusseld, per vraag een reactie van Wout, hartjesscore 0-3 aan het eind (3 vanaf 80% goed, 2 vanaf 50%). `content.js` is gevuld met alle echte inhoud: feiten, 15 quizvragen, 6 'wie van ons twee', de tijdlijn, de woorden voor wordle/galgje/woordzoeker/kruiswoord. Foto's bij de quizvragen volgen nog (Wout kiest ze uit images/foto-01 t/m 39).
  - Aangevuld (2 okt): quizvragen 16-25 (nu 25), momenten in `feiten.momenten`, tijdlijn uitgebreid naar 15 momenten, 12 extra woorden (woordzoeker; MGARR ook in wordle; 4 extra galgjewoorden), briefjes-placeholders voor alle 10 spellen. Foto's per quizvraag: Wout kiest nog (overzicht in `foto-overzicht.jpg`).
  - Voor later: sudoku-startcijfers met 22 en/of 22-11; brieven schrijft Wout zelf.
- [x] **Stap 3 – Wie van ons twee?** (2 okt 2026): `js/spellen/wie.js`. Stellingen gehusseld; kiezen tussen twee ronde knoppen (W/D in sierletters) of "Allebei"; goed antwoord springt op, fout wiebelt; reactie van Wout; hartjesscore zoals de quiz (hergebruikt de quiz-opmaak voor voortgang/reactie/uitslag). Quiz en Wie scrollen na het antwoorden het antwoordvak in beeld (kleine schermen). Nu 6 stellingen: meer is welkom. Goedgekeurd; nu 11 stellingen.
  - Correcties (2 okt): Zwarte Cross bij feiten, BBQ 25 juli zonder karaoke, vraag 22/23/25 aangepast, MGARR/TILBURG/GOZO/KARAOKE uit alle woordspellen (Wordle aangevuld met KERST, SAMEN, KUSJE, ZOMER, FEEST, CHOCO: nu 9 woorden).
- [x] **Foto-uitleg (vóór stap 4)**: Wout geeft per foto uitleg, in groepjes (`foto-groepjes/groepje-XX-YY.jpg`, lokaal, niet in git: 01-05, 06-09, 10-13, 14-17, 18-21, 22-25, 26-29, 30-33, 34-36, 37-39). Claude toont een groepje met per foto een gok; Wout antwoordt kort ("12: klopt" / "12: overslaan" / eigen uitleg). Antwoorden gaan naar `fotoUitleg` in `content.js` (plek, wanneer, verhaal, bijschrift in Wouts stem). Daarna voorstel: welke foto bij quiz, memory en Raad de plek. Stap 4 pas na akkoord op de foto's.
  - Stand: 01-36 klaar (01 + 07 kerstavond, 02-06 kerstmarkt Düsseldorf, 08-09 oud & nieuw, 10-12 feest Davinia, 13 Winter Efteling: mag ook elders in de app; onderste strip met andere mensen bijsnijden). 14 Winter Efteling, 15 carnaval, 16-19 bollenvelden 16 apr 2026 (19 = bijna kopie van 16), 20 Slagharen, 21 CHO. Winter Efteling = 26 jan 2026. Overal verwerkt (momenten, tijdlijn, quiz 26-27, KLOMP/TULPEN/EFTELING). 22-25 Vunzige Deuntjes na het dansen (4 bijna gelijke foto's). 26-27 kermis Tilburg, 28 indoor skiën 27 jul 2026 (haar verjaardagscadeau voor Wout; moment, tijdlijn en quiz 28 toegevoegd), 29 vertrek Malta. 30 Qawra zonsondergang, 31-32 Mdina (31 heeft vlekje op lens), 33 festa. 34-36 boottocht Mgarr 3 aug (badkleding, openbare repo: bij het voorstel expliciet laten bevestigen). 37 boottocht, 38 dakterras hotel Qawra, 39 feest oom en tante (datum onbekend). **Alle 39 klaar.**
  - **Fotokeuze (goedgekeurd 2 okt; badkleding 34-38 mag ook online):**
    - Quiz (foto bij de vraag): 10→30, 11→29, 16→04, 17→06, 18→21, 21→20, 22→24, 24→37, 25→08, 26→14. Idee "foto na het antwoord" (onthult anders het antwoord): 23→27, 27→18, 28→28.
    - Memory (8 paren): 02, 09, 11, 16, 20, 22, 28, 30.
    - Raad de plek/datum: 03 (datum), 07 (welke avond), 10 (welk feest), 15 (datum), 17 (datum), 26 (datum), 32 (plek), 39 (welk feest).
    - Malta-herinneringen (sudoku): 29, 38, 30, 31, 33, 34, 35, 36, 37.
    - Online staan alleen foto's die in content.js gebruikt worden (`git add -f`). Nog niet gebruikt: 01, 05, 12, 13 (bijsnijden), 19, 23, 25.
    - Correcties: foto-01 = 6 dec 2025 uit eten met Wouts gezin; kerstavond 24 dec = uit eten met Davinia's gezin en oma (moment + tijdlijn); foto-39 = feest oom en tante 12 sep 2026 (tijdlijn). Quizvraag 29 (UNO). Quiz kent nu `fotoNa` (foto pas na het antwoord).
- [x] **Stap 4 – Fotospellen** (2 okt 2026, goedgekeurd): `js/spellen/fotos.js`. Keuzescherm met twee spelletjes, elk een eigen score (`opslag: memory, raad`); tegel = gemiddelde zodra beide gespeeld. Memory: 4x4, 3D-flip (met -webkit-backface-visibility voor Safari), 3 hartjes bij ≤14 zetten, 2 bij ≤20; daarna album met de 8 foto's + bijschrift uit `fotoUitleg`. Raad de plek/datum: 8 foto-vragen, zelfde opmaak en score als de quiz.
- [x] **Stap 5 – Tijdlijn** (2 okt 2026, goedgekeurd): `js/spellen/tijdlijn.js`. Momenten met `vast: 'begin'` (22-11-2025) en `vast: 'eind'` (22-11-2026) staan in elke ronde vast; de 16 momenten daartussen worden eerlijk verdeeld over rondes van max 6 (nu 6/5/5). Slepen met pointer-events (touch-action: none, meescrollen bij de rand), Controleer kleurt goed/fout; score per ronde 3/2/1 (pogingen), tegel = gemiddelde. Na elke ronde het verhaal (datum, tekst, foto), aan het eind 'Ons hele jaar' (alle 22 momenten, ook de eerste dates). Nieuwe momenten in de tijdlijn: 6 dec 2025 (foto-01) en 10 jan 2026 (foto-12). foto-13 bijgesneden (strip met vreemden weg). Malta: Blue Lagoon in bijschrift foto-34, waterpark bij foto-38, busongeluk als `slotHerinnering` (na de hele sudoku).
- [x] **Stap 6 – Woordspellen** (2 okt 2026, goedgekeurd): `js/spellen/woordspel.js`, tegel heet nu 'Woordspellen'. Keuzescherm (zoals fotospellen) met Wordle (10 woorden, 6 pogingen, mint/geel/grijs, eigen QWERTY met ⌫/ENTER, elke 5 letters geldig, na het woord uitleg + foto) en galgje met smeltend ijsje (aardbei + chocola, 6 fouten = gesmolten; 15 woorden met hint, herinnering en soms foto). Woorden één voor één in willekeurige volgorde; voortgang na elke letter bewaard (`opslag: wordle/galgje {volgorde, resultaten, huidig}`). Punten per woord 3/2/1/0, spelletje = gemiddelde (min 1), tegel = gemiddelde van beide (`wordleScore`, `galgjeScore`). Wordle-vakjes schalen met de schermhoogte zodat het toetsenbord altijd past.
- [x] **Stap 7 – Hartjesblokken** (2 okt 2026, goedgekeurd): `js/spellen/hartjesblokken.js`. 8x8, steeds 3 vormen (36 vormen met gewichten, 6 pastelkleuren), hartjes via CSS-masker. Slepen met pointer-events: vorm zweeft boven de vinger (max(56px, 1,6 vak)), schaduw waar hij landt, rijen/kolommen die vol raken lichten op. Punten: 1 per hartje, lijnen 10 × n² (dubbel/driedubbel). Foto (`hartjesblokken.fotos`, elk potje de volgende) wordt per lijn scherper; na `rijenTotScherp` (10) bijschrift uit fotoUitleg. Einde als niets meer past; foto wordt dan alsnog scherp. Tegel: 10+ lijnen = 3, 5+ = 2, anders 1; beste score bewaard. Wout's bericht was afgekapt na 'vul aan met 4': Claude koos zelf 16, 20, 02, 26.
- [x] **Stap 8 – Malta-sudoku** (2 okt 2026, goedgekeurd na correctie): `js/spellen/sudoku.js`. 9 puzzels (3 per niveau, namen van plekken op Malta + 'Nr. 22'), gemaakt met een generator (scratchpad `sudoku-gen.cjs`) en onafhankelijk gecontroleerd: precies één oplossing, op te lossen zonder gokken (makkelijk 38 startcijfers/alleen naked singles, gemiddeld 30/hidden singles, moeilijk precies 22/locked candidates + paren). 22-11: in elke puzzel r1k1 = 1 en r2k2 = 2. Tik vakje + cijferbalk, gum, terug, potlood (notities; geplaatst cijfer wist notities bij buren). Markering rij/kolom/blok + zelfde cijfer. **3 levens** (bovenin als hartjes, bewaard in `opslag.puzzels[id].levens`): een cijfer dat niet klopt met de oplossing kost meteen een leven, wordt even rood + wiebelt en verdwijnt (potlood telt niet). 0 levens = nuchter berichtje + 'Opnieuw' (puzzel leeg, 3 levens; album blijft). Eigen cijfers lila. Voortgang per puzzel bewaard (`opslag.puzzels[id]`). Blok goed = herinnering blok n (meteen, als kaart) + Malta-album (`opslag.album`); hele sudoku = slotherinnering (busongeluk). Hartjes = levens over bij oplossen.
- [x] **Stap 9 – Woordpuzzels** (2 okt 2026, goedgekeurd): `js/spellen/woordzoeker.js`, tegel heet 'Woordpuzzels'. Keuzescherm met 3 woordzoekers (Malta 9x9, Thuis 9x9, Onderweg 10x10; `woordzoeker.puzzels` met titel/grootte/woorden/zin) en een kruiswoordpuzzel (`woordzoeker.kruiswoord`, 9 woorden incl. UNO, oplossingswoord `kruiswoordOplossing` = SAMEN). Woordzoeker: raster wordt in de browser gemaakt met een vaste toevalsreeks per titel (altijd hetzelfde), woorden →/↓/↘/↗, overgebleven letters vormen precies de zin (alle 3 sluitend; anders vult hij aan met willekeurige letters). Vegen met pointer-events (recht getrokken naar 8 richtingen, ook van achter naar voren), gekleurde streep + doorgestreept in de lijst, Tip-knop. Kruiswoord: compact opgebouwd in de browser (10x9), tik = vakje, nogmaals tikken = andere richting, hint erboven, schermtoetsenbord met ⌫, Controleer (in de balk) laat foute letters oplichten, vakjes krimpen automatisch zodat het toetsenbord past. Hartjes: woordzoeker 0 tips = 3, 1-2 = 2, meer = 1; kruiswoord 0-2 foute letters = 3, 3-6 = 2, meer = 1; tegel = gemiddelde zodra kruiswoord + minstens één woordzoeker af. Voortgang bewaard (`opslag.zoekers`, `opslag.kruis`).
  - Correctie (4 okt): boottocht 3 aug ging naar Comino/Blue Lagoon (zelfde dag); feiten, foto-uitleg 34-37, quiz-reactie, galgje en Malta-herinnering aangepast.
- [x] **Stap 10 – Dit of dat** (4 okt 2026, goedgekeurd): `js/spellen/ditofdat.js`. 19 keuzes van Wout (`ditOfDat`: optionele vraag, a, b, mijnKeuze, reactie). Willekeurige volgorde, links/rechts soms omgedraaid. Twee grote kaarten met 'of' ertussen; na kiezen: gekozen kaart groen/roze, Wouts keuze altijd groene rand + label, 'Wout koos: …' en reactie. Hartjes: ≥80% = 3, ≥55% = 2, anders 1 (19 keuzes: 16+ / 11+).
- [x] **Teksten herschrijven (nieuwe toonregel, 4 okt)**: alle teksten uit `teksten-overzicht.md` staan in de app (content.js + vaste teksten in de JS), "Cola of water" eruit (18 keuzes). Nieuwe feiten bij `feiten` (Thailand/eerste DM, lava cakejes, eerste zoen, Oeteldonk, Utrecht, Limburg, Winter Efteling koud, Slagharen huisje, bus tegen auto, typisch Davinia, warm/koud, telefoongeluidje, te laat, waardering, jaar twee). Quiz nu 39 vragen (Q30–Q39), Wie nu 16 stellingen (W12–W16); die staan onderaan het overzicht om na te kijken.
- [ ] Stap 11 – Brievenbus (**later**, als Wout zijn briefjes heeft geschreven)
- [x] **Stap 12 – Kleuren op nummer** (4 okt 2026, live gecontroleerd 5 okt): `js/spellen/kleuren.js`, canvas. 6 foto's (`kleurplaten`: 18, 21, 01, 37, 13, 28). Niveaus (staand; liggend omgedraaid): makkelijk 27x36/8 kleuren = 1 hartje, gemiddeld 33x44/10 = 2, moeilijk 42x56/12 = 3. Omzetting: verkleinen + k-means in Lab (vaste startwaarde), palet licht→donker; raster wordt bij de start in `opslag.platen[foto|niveau]` bewaard. Eén vinger kleurt (70 ms wachten op een tweede vinger), twee vingers zoomen/schuiven; fout vakje overschrijfbaar; knoppen Zoek/Alles; palet toont aantal over. Klaar: uitzoomen naar pixelversie, echte foto vervaagt erover op het canvas, bijschrift uit fotoUitleg. Getest met CDP multi-touch op 14 en SE. *Wacht op akkoord.* Teksten KL1-KL8 in het overzicht.
- [x] **Stap 13 – Hoe laat is het? (klokkijken)** (5 okt 2026): `js/spellen/klok.js`, tegel 'Hoe laat is het?' (11e tegel, extra briefje `vrijBij: 'klok'`). SVG-klok (roze uurwijzer, lila minutenwijzer), 10 vragen: 1-3 hele/halve uren, 4-6 kwartieren (soms heel/half), 7-10 per 5 minuten. Kloktaal ("vijf voor half acht"), foute antwoorden: voor/over gespiegeld (altijd mee als die bestaat), uur ernaast (half-fout), wijzers verwisseld, 5 min ernaast. Reactie alleen na vraag 3, 6, 9 (`content.klok.goed/fout`). Hartjes 9-10 = 3, 7-8 = 2, anders 1. Teksten KK1-KK15 in het overzicht. *Wacht op akkoord.*
- [ ] Stap 14 – Online UNO samen (nog niet bouwen; eerst opties bespreken)
