# Draaiboek Index

A lightweight, mobile-first web app hosted on **GitHub Pages** that dynamically loads, searches, and pins event scripts (*draaiboeken*) using a **Google Sheets** spreadsheet as its backend.

---

## Features

- **No Hardcoded Data / URLs:** The app does not embed any private URLs. All live sheet links are passed dynamically via the shareable URL parameter (`?sheet=...`).
- **Dynamic Fake Test Set:** When opened without a sheet parameter (or in test mode), the app generates a randomized fake test dataset with fake names (e.g. *Robin Demo*, *Jesse Test*, *Keuken Crew*) and fake URLs (`https://example.com/fake-draaiboeken/test-db015.pdf`).
- **Instant Search & Native Mobile Dropdown:** Fast filtering by name, role, or draaiboek number.
- **Multiple Saved Draaiboeken:** Pin multiple draaiboeken at the top of the screen (stored in `localStorage`).
- **Explore 2026 Arcade Retro Theme:** High-contrast neon aesthetics tailored for phone screens.
- **Zero Build Tools:** Pure vanilla JavaScript, HTML5, CSS3, and Papa Parse via CDN.

---

## Project Structure

- **Front-end (Visuals & Mobile UI):**
  - [index.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/index.html): Mobile-first layout with Arcade logo, search, and saved chips.
  - [style.css](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/style.css): Explore 2026 Arcade retro theme (neon cyan/magenta/yellow).
  - [app.js](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/app.js): Search filter, dropdown selection, and multi-save management.
- **Back-end (Data & Google Sheets Integration):**
  - [backend.js](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/backend.js): Reads `?sheet=` URL parameter, parses CSV, extracts script IDs, and dynamically generates randomized fake test data if no sheet is provided.
- **Quest Hunt Speurtocht (`quest_hunt/`):**
  - [quest_hunt/quest_hunt_menu.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/quest_hunt/quest_hunt_menu.html): Centrale missie-hub met links naar alle uitdagingen.
  - [quest_hunt/ben_jij_in_de_KVK_geweest.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/quest_hunt/ben_jij_in_de_KVK_geweest.html): GPS Geolocation check (*Ben jij al in de kampvuurkuil geweest??*) met radar-nabijheidsdetector en automatische doorverwijzing.
  - [quest_hunt/heb_jij_de_morse_code_all.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/quest_hunt/heb_jij_de_morse_code_all.html): Morse Code Audio Cipher (*Heb jij de morse code al??*) met ingebouwde veldontvanger speler, codewoord-invoer, morse alfabet spiekbrief en feestelijke confetti.
  - [quest_hunt/puzzel_2_sudoku.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/quest_hunt/puzzel_2_sudoku.html): Kraak het Sudoku Slot (*Puzzel 2*) met interactief 9x9 rooster, 4 gemarkeerde slot-vakjes, on-screen toetsenbord en cijferslot-mechaniek.
  - [quest_hunt/puzzel_3_rebus.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/quest_hunt/puzzel_3_rebus.html): De Grote Arcade Rebus (*Missie 4 Finale*) met retro vector-illustraties, letterformules, hintssysteem en feestelijke eindontgrendeling.

---

## Usage & Sharing

### 1. Shareable Link with Live Google Sheet
To share the app with participants, append your published Google Sheet CSV URL via `?sheet=`:

```text
https://<username>.github.io/draaiboek_index/?sheet=https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=0&single=true&output=csv
```

The app also accepts `?sheet_csv_url=`, `?csv=`, or `?url=`.

### 2. Testing with Randomized Fake Data
Simply open the app without any parameters (or with `?demo`):

```text
http://127.0.0.1:5500/index.html
```

The app will dynamically generate a randomized set of fake names, test roles, unique IDs, and dummy URLs. Every reload generates a fresh random combination using the Fisher-Yates shuffle algorithm.

---

### 3. Quest Hunt Speurtocht (`quest_hunt/`)

#### A. Quest Hunt Menu (`quest_hunt/quest_hunt_menu.html`)
Overzichtspagina met alle missies van Explore 2026.

- **Direct link:**
  ```text
  https://<username>.github.io/draaiboek_index/quest_hunt/
  ```

#### B. Kampvuurkuil GPS Check (`quest_hunt/ben_jij_in_de_KVK_geweest.html`)
Controleert of een deelnemer fysiek in de kampvuurkuil staat met behulp van HTML5 Geolocation.

- **Direct link:**
  ```text
  https://<username>.github.io/draaiboek_index/quest_hunt/ben_jij_in_de_KVK_geweest.html
  ```
- **Aanpasbare coördinaten:**
  `?lat=52.353681&lng=4.570565&radius=35&url=https://...`
- **Features:** Real-time warm/koud thermometer, testsimulator (*"Simuleer in Kuil"*), beheerpaneel en automatische doorsturing.

#### C. Morse Code Mysterie (`quest_hunt/heb_jij_de_morse_code_all.html`)
Laat deelnemers luisteren naar het audiobestand `morsecode_0fcoa9ena53sfomg6ibikmvutj.wav` en het geheime codewoord ontcijferen (*MARIOKART*).

- **Direct link:**
  ```text
  https://<username>.github.io/draaiboek_index/quest_hunt/heb_jij_de_morse_code_all.html
  ```
- **Aanpasbaar codewoord & URL:**
  `?code=MARIOKART&url=https://...`
- **Features:** Audio visualizer met equalizer bars, afspeelsnelheid schakelaar (1.0x / 0.75x), morse-alfabet spiekbrief, confetti animatie en instellingenpaneel.

#### D. Sudoku Cijferslot (`quest_hunt/puzzel_2_sudoku.html`)
Laat deelnemers een deels ingevulde 9x9 Sudoku oplossen om de getallen in de 4 gemarkeerde gouden slot-vakjes (①, ②, ③, ④) te vinden. Deze 4 cijfers vormen de combinatie van het cijferslot (*4529*).

- **Direct link:**
  ```text
  https://<username>.github.io/draaiboek_index/quest_hunt/puzzel_2_sudoku.html
  ```
- **Aanpasbare cijfercode & URL:**
  `?code=4529&url=https://...`
- **Features:** Touch keypad (1-9 & wissen), automatische synchronisatie tussen Sudoku-rooster en slot-dials, ontgrendel-animatie, confetti en instellingenpaneel.

#### E. De Grote Arcade Rebus (`quest_hunt/puzzel_3_rebus.html`)
Het sluitstuk van de Explore 2026 Quest Hunt! Deelnemers ontcijferen een duidelijke, 5-woorden tellende retro arcade beeldpuzzel om de geheime finale-zin (*KRAAK DE KLUIS EN WIN*) te vinden:
1. **Woord 1:** 🚰 KRAAN (`N ➔ K`) = **KRAAK**
2. **Woord 2:** 🚪 DEUR (`- UR`) = **DE**
3. **Woord 3:** 🏠 HUIS (`H ➔ KL`) = **KLUIS**
4. **Woord 4:** 🦆 EEND (`- D`) = **EN**
5. **Woord 5:** 🌬️ WIND (`- D`) = **WIN**

- **Direct link:**
  ```text
  https://<username>.github.io/draaiboek_index/quest_hunt/puzzel_3_rebus.html
  ```
- **Aanpasbaar codewoord & URL:**
  `?code=KRAAK+DE+KLUIS+EN+WIN&url=https://...`
- **Features:** 5 overzichtelijke woordvakjes met heldere vector-illustraties, letterformules, interactieve hint-knop, confetti-animatie en spelleiders-beheerpaneel.