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
- [ ] **Foto-uitleg (vóór stap 4)**: Wout geeft per foto uitleg, in groepjes (`foto-groepjes/groepje-XX-YY.jpg`, lokaal, niet in git: 01-05, 06-09, 10-13, 14-17, 18-21, 22-25, 26-29, 30-33, 34-36, 37-39). Claude toont een groepje met per foto een gok; Wout antwoordt kort ("12: klopt" / "12: overslaan" / eigen uitleg). Antwoorden gaan naar `fotoUitleg` in `content.js` (plek, wanneer, verhaal, bijschrift in Wouts stem). Daarna voorstel: welke foto bij quiz, memory en Raad de plek. Stap 4 pas na akkoord op de foto's.
  - Stand: 01-36 klaar (01 + 07 kerstavond, 02-06 kerstmarkt Düsseldorf, 08-09 oud & nieuw, 10-12 feest Davinia, 13 Winter Efteling: mag ook elders in de app; onderste strip met andere mensen bijsnijden). 14 Winter Efteling, 15 carnaval, 16-19 bollenvelden 16 apr 2026 (19 = bijna kopie van 16), 20 Slagharen, 21 CHO. Winter Efteling = 26 jan 2026. Overal verwerkt (momenten, tijdlijn, quiz 26-27, KLOMP/TULPEN/EFTELING). 22-25 Vunzige Deuntjes na het dansen (4 bijna gelijke foto's). 26-27 kermis Tilburg, 28 indoor skiën 27 jul 2026 (haar verjaardagscadeau voor Wout; moment, tijdlijn en quiz 28 toegevoegd), 29 vertrek Malta. 30 Qawra zonsondergang, 31-32 Mdina (31 heeft vlekje op lens), 33 festa. 34-36 boottocht Mgarr 3 aug (badkleding, openbare repo: bij het voorstel expliciet laten bevestigen). Groepje 37-39 getoond, wacht op antwoord.
- [ ] Stap 4 – Fotospellen
- [ ] Stap 5 – Tijdlijn
- [ ] Stap 6 – Woordspel
- [ ] Stap 7 – Hartjesblokken
- [ ] Stap 8 – Sudoku
- [ ] Stap 9 – Woordzoeker
- [ ] Stap 10 – Dit of dat
- [ ] Stap 11 – Brievenbus
- [ ] Stap 12 – Kleuren op nummer
