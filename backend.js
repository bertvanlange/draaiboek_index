// backend.js - Data Provider & Google Sheets Integration
// Verantwoordelijk voor het ophalen, parsen en opschonen van draaiboek URLs en namen.
// Er is geen hardcoded Google Sheet URL; de actieve URL wordt uitsluitend via URL parameters meegegeven (?sheet=...).
// Zonder URL parameter wordt een dynamisch gerandomiseerde testset met nepnamen en nep-URLs gegenereerd.

const Backend = {
  /**
   * Fisher-Yates (Knuth) shuffle algoritme voor echte, willekeurige verdeling.
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Genereert een dynamische, willekeurige testset met nepnamen en nep-URLs.
   * Iedere keer dat deze functie wordt aangeroepen (bijv. bij een refresh zonder ?sheet=),
   * ontstaat een frisse mix van testrollen, fictieve personen, willekeurige IDs en demo-URLs.
   */
  generateFakeSampleData(count = 25) {
    const fakeFirstNames = [
      "Alex", "Robin", "Sam", "Jamie", "Kim", "Jesse", "Bo", "Chris",
      "Luka", "Dani", "Max", "Noa", "Rene", "Mika", "Sascha", "Pascal",
      "Sander", "Fleur", "Bram", "Lieke", "Milan", "Emma", "Thijs", "Sophie",
      "Lars", "Tess", "Daan", "Sanne", "Sem", "Julia", "Luuk", "Lisa"
    ];

    const fakeLastNames = [
      "Test", "Voorbeeld", "Fictief", "Dummy", "Proef", "Demo",
      "Simulatie", "Sample", "Testman", "van Mock", "de Tester",
      "Proefpersoon", "Dummy-Jansen", "van Testen", "de Fake"
    ];

    const fakeRoles = [
      "Logistiek (Demo)", "Keuken Crew (Test)", "EHBO Post (Mock)",
      "Spelleiding (Fictief)", "Bar & Horeca (Demo)", "Techniek & Geluid (Test)",
      "Beveiliging Team (Mock)", "Kassa & Entree (Demo)", "Coördinator (Test)",
      "Terreinbeheer (Fictief)", "Programma & Tijden (Demo)", "Communicatie (Test)",
      "Fourage Post (Mock)", "Decoratie & Bouw (Fictief)", "Muziek & DJ (Demo)"
    ];

    // Willekeurig aantal unieke IDs tussen 1 en 99 kiezen
    const possibleIds = Array.from({ length: 99 }, (_, i) => String(i + 1));
    const shuffledIds = this.shuffle(possibleIds);

    const generatedNames = new Set();
    const result = [];

    // Voeg eerst een willekeurige selectie van testrollen toe
    const shuffledRoles = this.shuffle(fakeRoles);
    const roleCount = Math.min(6, shuffledRoles.length);
    for (let i = 0; i < roleCount; i++) {
      const id = shuffledIds[result.length];
      const name = shuffledRoles[i];
      generatedNames.add(name);
      result.push({
        id: id,
        name: name,
        url: `https://example.com/fake-draaiboeken/test-db${id.padStart(3, '0')}.pdf`
      });
    }

    // Vul aan met willekeurig gegenereerde nepnamen (voornaam + fictieve achternaam)
    const shuffledFirst = this.shuffle(fakeFirstNames);
    const shuffledLast = this.shuffle(fakeLastNames);

    let firstIdx = 0;
    let lastIdx = 0;

    while (result.length < count) {
      const first = shuffledFirst[firstIdx % shuffledFirst.length];
      const last = shuffledLast[lastIdx % shuffledLast.length];
      firstIdx++;
      lastIdx++;

      const name = `${first} ${last}`;
      if (!generatedNames.has(name)) {
        generatedNames.add(name);
        const id = shuffledIds[result.length];
        result.push({
          id: id,
          name: name,
          url: `https://example.com/fake-draaiboeken/test-db${id.padStart(3, '0')}.pdf`
        });
      }
    }

    // Mix personen en rollen willekeurig door elkaar
    return this.shuffle(result);
  },

  /**
   * Fallback testdata provider (roept generateFakeSampleData aan).
   */
  getFallbackData(count) {
    return this.generateFakeSampleData(count);
  },

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
   * Bepaalt de actieve CSV URL.
   * Controleert uitsluitend URL query parameters (?sheet_csv_url=, ?sheet=, ?csv= of ?url=).
   * Als er geen parameter is meegegeven, geeft deze methode null terug (geen hardcoded URL).
   */
  getActiveSheetUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const href = window.location.href;
      
      // Expliciete test / demo vlag (bijv. ?demo of ?demo=30)
      if (href.match(/[?&](?:demo|test|sample)(?:[=&]|$)/i)) {
        return null;
      }

      // Zoek naar query parameter (begint met ? of &) voor sheet URL
      // Ondersteunt unencoded geneste query parameters zoals &single=true&output=csv
      const fullMatch = href.match(/[?&](?:sheet_csv_url|sheet|csv|url)=(https?:\/\/[^\s#]+)/i);
      if (fullMatch) {
        return decodeURIComponent(fullMatch[1]);
      }

      // Ondersteuning voor Google Sheet publicatie-ID (2PACX-...) of overige parameters
      const match = href.match(/[?&](?:sheet_csv_url|sheet|csv|url)=([^&#\s]+)/i);
      if (match) {
        const raw = decodeURIComponent(match[1].trim());
        if (raw.startsWith('http://') || raw.startsWith('https://')) {
          return raw;
        }
        if (raw.startsWith('2PACX-')) {
          return `https://docs.google.com/spreadsheets/d/e/${raw}/pub?output=csv`;
        }
        return raw;
      }
    }
    return null;
  },

  /**
   * Haalt de lijst van draaiboeken op via de meegegeven Google Sheets CSV URL.
   * Als er geen parameter is meegegeven in de URL, of als er een laadfout optreedt,
   * wordt automatisch de willekeurige fake testset getoond.
   * @returns {Promise<Array<{id: string, name: string, url: string}>>}
   */
  async getDraaiboeken() {
    const activeUrl = this.getActiveSheetUrl();

    // Geen Google Sheet URL meegegeven? Toon direct de dynamische fake testset!
    if (!activeUrl) {
      return this.generateFakeSampleData();
    }

    // Probeer eerst via PapaParse (CDN in browser)
    if (typeof Papa !== 'undefined') {
      return new Promise((resolve) => {
        Papa.parse(activeUrl, {
          download: true,
          skipEmptyLines: true,
          complete: (results) => {
            const list = this.parseCsv(results.data);
            resolve(list.length > 0 ? list : this.generateFakeSampleData());
          },
          error: (err) => {
            console.warn('Backend: PapaParse fout, fake testset wordt geladen:', err);
            resolve(this.generateFakeSampleData());
          }
        });
      });
    }

    // Fallback via standaard fetch
    try {
      const response = await fetch(activeUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const rows = text.split(/\r?\n/).map(line => this.splitCsvLine(line));
      const list = this.parseCsv(rows);
      return list.length > 0 ? list : this.generateFakeSampleData();
    } catch (error) {
      console.warn('Backend: Fetch fout, fake testset wordt geladen:', error);
      return this.generateFakeSampleData();
    }
  }
};

// Beschikbaar stellen voor app.js in de browser en export voor tests
if (typeof window !== 'undefined') {
  window.Backend = Backend;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Backend;
}
