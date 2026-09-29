# Draaiboek Index

A lightweight, serverless single-page web app hosted on **GitHub Pages** that dynamically loads, searches, and pins event scripts (*draaiboeken*) using a **Google Sheets** spreadsheet as its backend.

---

## Features

- **Live Google Sheets Integration:** Fetches entries automatically via public CSV export—no backend or redeployment needed when updating rows.
- **Instant Search:** Filter instantly by draaiboek ID, role, team, or personal name.
- **One-Click PDF Access:** Cleans and opens direct Google Drive PDF links in a new tab.
- **Quick Links (Pinning):** Pin frequently accessed draaiboeken as chips at the top of the interface.
- **Recent History:** Automatically saves the most recently opened script for fast one-click recovery.
- **Zero Build Tools:** Single file HTML/CSS/vanilla JavaScript using [Papa Parse](https://www.papaparse.com/) via CDN.

---

## Data Structure

The app reads a CSV formatted like `Tijdplanning - QR-codes.csv`:

| Column Index | Field Name | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `0` | Draaiboek ID | `10`, `9`, `53` | Numeric script ID |
| `1` | Name / Team | `Thema`, `Alexander Pizarro De La Iglesia` | Role, team, or person name |
| `2` | PDF URL | `https://drive.google.com/file/d/.../view?usp=drivesdk,DB010.pdf` | Direct Drive link (app automatically strips `,DBxxx.pdf`) |

---

## Project Structure

- **Front-end (Visuals & Mobile UI):**
  - `index.html`: Clean HTML skeleton.
  - `style.css`: Mobile-first styling, touch targets, and automatic dark mode.
  - `app.js`: User interaction, live search, native dropdown selection, and local storage for "Jouw Draaiboek".
- **Back-end (Data & Google Sheets Integration):**
  - `backend.js`: Fetches and parses the Google Sheets CSV, cleans Google Drive URLs, and provides the dataset.

---

## Setup & Deployment

### 1. Publish Your Google Sheet
1. Open your Google Sheet containing the draaiboek links.
2. Go to **File > Share > Publish to web** (*Bestand > Delen > Publiceren op internet*).
3. Select your sheet tab and choose **Comma-separated values (.csv)** as the format.
4. Click **Publish** and copy the generated link.

### 2. Configure `backend.js`
1. Clone or download this repository.
2. Open `backend.js` in an editor.
3. Replace `SHEET_CSV_URL` (line 10) with your published Google Sheet CSV link:
   ```javascript
   const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv";
   ```