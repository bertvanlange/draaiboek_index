// backend.js - Data Provider & Google Sheets Integration
// Verantwoordelijk voor het ophalen, parsen en opschonen van draaiboek URLs en namen.

// =============================================================================
// CONFIGURATIE: Google Sheets CSV URL
// =============================================================================
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRoM4o8uiwSW_3NQyaeCGA-_fS9BfiWK4_ff9nYDiLjbRo4yHYCBM9V6rlMpmi7CnsVJ_ZLOioHQ_ri/pub?gid=0&single=true&output=csv";

// Ingebouwde voorbeelddata voor als netwerk offline is
const SAMPLE_DATA = [
  { id: "10", name: "Thema", url: "https://drive.google.com/file/d/1E7xH0VkklFNSA11ULcn8mf_H_FH62sJ7/view?usp=drivesdk" },
  { id: "9", name: "Programma", url: "https://drive.google.com/file/d/15aNbPGXMhEh-zPcLptqkhB3pHf3OXm3h/view?usp=drivesdk" },
  { id: "8", name: "Logistiek", url: "https://drive.google.com/file/d/1W-cHS6li9AmJgnetVFro7EwEZF66HDQk/view?usp=drivesdk" },
  { id: "5", name: "Secretaris", url: "https://drive.google.com/file/d/13HWqcvX23sb0EMsLsyOhnleyCZOG9M94/view?usp=drivesdk" },
  { id: "7", name: "Fourage", url: "https://drive.google.com/file/d/13kaYGpcRIhzBEPeS3E791dOHW6ojVyOz/view?usp=drivesdk" },
  { id: "11", name: "Alexander Pizarro De La Iglesia", url: "https://drive.google.com/file/d/1-LawH-hOxtgAXP17UD-9YmK_cx-hlCoE/view?usp=drivesdk" },
  { id: "15", name: "Bert van Lange", url: "https://drive.google.com/file/d/1jPSdN-Gm_7FWZ0JfFjGJhJNgowunF5r3/view?usp=drivesdk" },
  { id: "53", name: "Naomi Van Groeningen", url: "https://drive.google.com/file/d/13UAwIUY0G-EVYS_yPCQLll6fkgsedXT-/view?usp=drivesdk" }
];

const Backend = {
  /**
   * Extraheert het numerieke ID uit een Google Drive URL die eindigt op ,DBxxx.pdf
   * bijv. ",DB010.pdf" -> "10", ",DB009.pdf" -> "9"
   */
  extractId(rawUrl) {
    if (!rawUrl) return '';
    const match = String(rawUrl).match(/,DB([0-9a-zA-Z_-]+)(?:\.pdf)?$/i);
    if (match) {
      const code = match[1];
      if (/^\d+$/.test(code)) {
        return String(parseInt(code, 10));
      }
      return code;
    }
    return '';
  },

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
   * Parseert een enkele CSV regel met ondersteuning voor aanhalingstekens
   */
  splitCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']+|["']+$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']+|["']+$/g, ''));
    return result;
  },

  /**
   * Converteert ruwe CSV rijen naar een gestructureerde lijst van draaiboeken:
   * Ondersteunt zowel:
   * - 2 kolommen: [Naam / Rol, URL_met_DBxxx.pdf] (zoals in de Google Sheet)
   * - 3 kolommen: [Draaiboek ID, Naam, URL]
   */
  parseCsv(rows) {
    if (!rows || rows.length === 0) return [];
    
    let startIndex = 0;
    // Automatische header detectie: sla rij 0 over als het echt kolomtitels bevat
    if (rows.length > 1) {
      const col0 = String(rows[0][0] || '').toLowerCase().trim();
      const col1 = String(rows[0][1] || '').toLowerCase().trim();
      const isHeader = col0 === 'draaiboek' || col0 === 'naam' || col0 === 'name' || col0 === 'team' ||
                       col1 === 'url' || col1 === 'pdf url' || col1 === 'link' || col1 === 'pdf link' ||
                       col0.startsWith('tijdplanning');
      if (isHeader) {
        startIndex = 1;
      }
    }

    const draaiboeken = [];
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      let id = '';
      let name = '';
      let rawUrl = '';

      if (row.length === 1) {
        continue;
      } else if (row.length === 2) {
        // Formaat uit de live spreadsheet: [Naam/Team, URL_met_DBxxx.pdf]
        name = String(row[0] || '').trim();
        rawUrl = String(row[1] || '').trim();
        id = this.extractId(rawUrl) || `${draaiboeken.length + 1}`;
      } else {
        // 3 of meer kolommen
        const c0 = String(row[0] || '').trim();
        const c1 = String(row[1] || '').trim();
        const c2 = String(row[2] || '').trim();

        if (c2.startsWith('http')) {
          id = c0;
          name = c1;
          rawUrl = c2;
        } else if (c1.startsWith('http')) {
          name = c0;
          rawUrl = c2.toLowerCase().includes('.pdf') ? `${c1},${c2}` : c1;
          id = this.extractId(rawUrl) || c2 || `${draaiboeken.length + 1}`;
        }
      }

      // Filter ongeldige rijen (#N/A of lege rijen)
      if (!name || name === '#N/A' || !rawUrl) continue;

      draaiboeken.push({
        id: id || `${draaiboeken.length + 1}`,
        name: name,
        url: this.cleanUrl(rawUrl)
      });
    }

    return draaiboeken;
  },

  /**
   * Haalt de lijst van draaiboeken op via de Google Sheets CSV export.
   * Valt automatisch terug op voorbeelddata als er een netwerkprobleem is.
   * @returns {Promise<Array<{id: string, name: string, url: string}>>}
   */
  async getDraaiboeken() {
    const isPlaceholder = !SHEET_CSV_URL || 
                          SHEET_CSV_URL.includes('example.com') ||
                          SHEET_CSV_URL === '';

    if (isPlaceholder) {
      return SAMPLE_DATA.map(item => ({
        ...item,
        url: this.cleanUrl(item.url)
      }));
    }

    // Probeer eerst via PapaParse (CDN in browser)
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
      const rows = text.split(/\r?\n/).map(line => this.splitCsvLine(line));
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
