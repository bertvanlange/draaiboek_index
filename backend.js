// backend.js - Data Provider & Google Sheets Integration
// Verantwoordelijk voor het ophalen, parsen en opschonen van draaiboek URLs en namen.

// =============================================================================
// CONFIGURATIE: Google Sheets CSV URL
// 1. Publiceer je sheet via: Bestand > Delen > Publiceren op internet
// 2. Kies tabblad en format: Kommagescheiden waarden (.csv)
// 3. Plak hieronder jouw gegenereerde link:
// =============================================================================
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv";

// Ingebouwde voorbeelddata (wordt gebruikt als SHEET_CSV_URL nog niet is ingesteld)
const SAMPLE_DATA = [
  { id: "1", name: "Hoofdleiding & Algemene Coördinatie", url: "https://drive.google.com/file/d/1sampleDocID01/view?usp=drivesdk,DB001.pdf" },
  { id: "2", name: "EHBO, Veiligheid & Calamiteiten", url: "https://drive.google.com/file/d/1sampleDocID02/view?usp=drivesdk,DB002.pdf" },
  { id: "9", name: "Logistiek, Materiaal & Terrein", url: "https://drive.google.com/file/d/1sampleDocID09/view?usp=drivesdk,DB009.pdf" },
  { id: "10", name: "Thema", url: "https://drive.google.com/file/d/1sampleDocID10/view?usp=drivesdk,DB010.pdf" },
  { id: "15", name: "Keuken & Catering", url: "https://drive.google.com/file/d/1sampleDocID15/view?usp=drivesdk,DB015.pdf" },
  { id: "21", name: "Post 1 - Bosrand", url: "https://drive.google.com/file/d/1sampleDocID21/view?usp=drivesdk,DB021.pdf" },
  { id: "22", name: "Post 2 - Heide", url: "https://drive.google.com/file/d/1sampleDocID22/view?usp=drivesdk,DB022.pdf" },
  { id: "53", name: "Alexander Pizarro De La Iglesia", url: "https://drive.google.com/file/d/1sampleDocID53/view?usp=drivesdk,DB053.pdf" }
];

const Backend = {
  /**
   * Verwijdert trailing ',DBxxx.pdf', bestandsnamen of komma's van Google Drive links
   * zodat de link direct goed opent in de browser.
   */
  cleanUrl(rawUrl) {
    if (!rawUrl) return '';
    let url = String(rawUrl).trim().replace(/^["']+|["']+$/g, '');
    url = url.replace(/,\s*DB[0-9a-zA-Z_-]*(\.pdf)?$/i, '');
    url = url.replace(/,\s*[^,/?#]+\.pdf$/i, '');
    url = url.replace(/,\s*DB[0-9a-zA-Z_-]*$/i, '');
    return url.replace(/,+$/, '').trim();
  },

  /**
   * Converteert ruwe CSV rijen naar een gestructureerde lijst van draaiboeken:
   * Kolom 0: Draaiboek ID
   * Kolom 1: Naam / Team / Rol
   * Kolom 2: PDF URL
   */
  parseCsv(rows) {
    if (!rows || rows.length === 0) return [];
    
    let startIndex = 0;
    // Automatische header detectie: sla rij 0 over als het kolomtitels bevat
    if (rows.length > 1) {
      const col0 = String(rows[0][0] || '').toLowerCase().trim();
      const col1 = String(rows[0][1] || '').toLowerCase().trim();
      if (col0.includes('id') || col0.includes('draaiboek') || 
          col1.includes('naam') || col1.includes('team') || 
          col1.includes('name') || isNaN(parseInt(col0, 10))) {
        startIndex = 1;
      }
    }

    const draaiboeken = [];
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const id = String(row[0] || '').trim();
      const name = String(row[1] || '').trim();
      const rawUrl = String(row[2] || '').trim();

      if (!id && !name) continue;

      draaiboeken.push({
        id: id || `${i}`,
        name: name || `Draaiboek ${id}`,
        url: this.cleanUrl(rawUrl)
      });
    }
    return draaiboeken;
  },

  /**
   * Haalt de lijst van draaiboeken op via de Google Sheets CSV export.
   * Valt automatisch terug op voorbeelddata als er geen URL is ingesteld.
   * @returns {Promise<Array<{id: string, name: string, url: string}>>}
   */
  async getDraaiboeken() {
    const isPlaceholder = !SHEET_CSV_URL || 
                          SHEET_CSV_URL.includes('2PACX-1v...') || 
                          SHEET_CSV_URL.includes('example.com');

    if (isPlaceholder) {
      return SAMPLE_DATA.map(item => ({
        ...item,
        url: this.cleanUrl(item.url)
      }));
    }

    // Probeer eerst via PapaParse (CDN)
    if (typeof Papa !== 'undefined') {
      return new Promise((resolve) => {
        Papa.parse(SHEET_CSV_URL, {
          download: true,
          skipEmptyLines: true,
          complete: (results) => {
            const list = this.parseCsv(results.data);
            resolve(list.length > 0 ? list : this.getFallbackData());
          },
          error: (err) => {
            console.warn('Backend: PapaParse fout, fallback wordt gebruikt:', err);
            resolve(this.getFallbackData());
          }
        });
      });
    }

    // Fallback via standaard fetch
    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const rows = text.split(/\r?\n/).map(line => line.split(','));
      const list = this.parseCsv(rows);
      return list.length > 0 ? list : this.getFallbackData();
    } catch (error) {
      console.warn('Backend: Fetch fout, fallback wordt gebruikt:', error);
      return this.getFallbackData();
    }
  },

  getFallbackData() {
    return SAMPLE_DATA.map(item => ({
      ...item,
      url: this.cleanUrl(item.url)
    }));
  }
};

// Beschikbaar stellen voor app.js
window.Backend = Backend;
