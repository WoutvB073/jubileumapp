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
- [x] **Stap 1 – Basis** (2 okt 2026): installatiescherm, PWA (manifest, iconen, opstartschermen, service worker), hoofdmenu met 10 speltegels + brievenbus ("binnenkort"), `content.js` met placeholder-inhoud en ideeën, placeholder-foto's, fotoverkleinscript. Git lokaal opgezet. *Wacht op akkoord + GitHub-URL.*
- [ ] Stap 2 – Quiz over ons
- [ ] Stap 3 – Wie van ons twee?
- [ ] Stap 4 – Fotospellen
- [ ] Stap 5 – Tijdlijn
- [ ] Stap 6 – Woordspel
- [ ] Stap 7 – Hartjesblokken
- [ ] Stap 8 – Sudoku
- [ ] Stap 9 – Woordzoeker
- [ ] Stap 10 – Dit of dat
- [ ] Stap 11 – Brievenbus
- [ ] Stap 12 – Kleuren op nummer
