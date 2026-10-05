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
  - [index.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/index.html): Mobile-first layout with Arcade logo and saved chips.
  - [ben_jij_in_de_KVK_geweest.html](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/ben_jij_in_de_KVK_geweest.html): GPS Geolocation check (*Ben jij al in de kampvuurkuil geweest??*) with radar proximity tracking and target redirection.
  - [style.css](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/style.css): Explore 2026 Arcade retro theme (neon cyan/magenta/yellow).
  - [app.js](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/app.js): Search filter, dropdown selection, and multi-save management.
- **Back-end (Data & Google Sheets Integration):**
  - [backend.js](file:///run/media/bertvanlange/Shared/Git_projects/draaiboek_index/backend.js): Reads `?sheet=` URL parameter, parses CSV, extracts script IDs, and dynamically generates randomized fake test data if no sheet is provided.

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

### 3. Kampvuurkuil GPS Check (`ben_jij_in_de_KVK_geweest.html`)
Checks if a participant is physically in or near the campfire pit (*kampvuurkuil*) using HTML5 Geolocation. If within range, celebratory confetti triggers and the user is redirected to the destination URL.

- **Direct link (uses default Het Naaldenveld coordinates or saved location):**
  ```text
  https://<username>.github.io/draaiboek_index/ben_jij_in_de_KVK_geweest.html
  ```
- **Custom coordinates via URL parameters:**
  ```text
  https://<username>.github.io/draaiboek_index/ben_jij_in_de_KVK_geweest.html?lat=52.363000&lng=4.580000&radius=35&url=index.html
  ```
- **Features:**
  - Real-time distance calculation & "warm/koud" proximity thermometer.
  - Built-in test simulator (*"Simuleer in Kuil"*) to test without travelling.
  - Organizer tool (*"Sla Huidige Plek Op"*) to set coordinates on-site with 1 click.
  - Generates shareable QR/URL links directly from the settings panel.