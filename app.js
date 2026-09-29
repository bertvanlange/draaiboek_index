// app.js - Frontend Logic & User Interaction
// Verantwoordelijk voor weergave, zoekfiltering, interactie en meervoudig opgeslagen draaiboeken.

const STORAGE_SAVED_KEY = 'draaiboek_saved_ids';
const OLD_STORAGE_MY_ID = 'draaiboek_my_id'; // Voor migratie van eerdere versie

let items = [];
let savedIds = new Set();

// Draaiboek openen in PDF viewer en toevoegen aan opgeslagen draaiboeken
function openDraaiboek(id) {
  const item = items.find(i => String(i.id) === String(id));
  if (!item || !item.url) return;

  // Automatisch bewaren bij openen
  saveDraaiboek(item.id);

  window.open(item.url, '_blank', 'noopener,noreferrer');
}

// Draaiboek toevoegen aan opgeslagen lijst
function saveDraaiboek(id) {
  const strId = String(id);
  if (!savedIds.has(strId)) {
    savedIds.add(strId);
    persistSaved();
    renderSaved();
    renderList();
  }
}

// Draaiboek verwijderen uit opgeslagen lijst
function removeDraaiboek(id, event) {
  if (event) event.stopPropagation();
  const strId = String(id);
  if (savedIds.has(strId)) {
    savedIds.delete(strId);
    persistSaved();
    renderSaved();
    renderList();
  }
}

// Sterretje in- of uitschakelen in de hoofdlijst
function toggleSave(id, event) {
  if (event) event.stopPropagation();
  const strId = String(id);
  if (savedIds.has(strId)) {
    removeDraaiboek(strId);
  } else {
    saveDraaiboek(strId);
  }
}

// Opgeslagen IDs wegschrijven naar localStorage
function persistSaved() {
  try {
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(Array.from(savedIds)));
  } catch (e) {
    console.warn('LocalStorage niet beschikbaar:', e);
  }
}

// Render het blok met opgeslagen draaiboeken bovenaan
function renderSaved() {
  const section = document.getElementById('savedSection');
  const listEl = document.getElementById('savedList');
  const counterEl = document.getElementById('savedCounter');

  if (savedIds.size === 0) {
    section.style.display = 'none';
    listEl.innerHTML = '';
    return;
  }

  // Zoek de objecten op bij de opgeslagen IDs
  const savedItems = Array.from(savedIds)
    .map(id => items.find(i => String(i.id) === String(id)))
    .filter(Boolean);

  if (savedItems.length === 0) {
    section.style.display = 'none';
    return;
  }

  // Sorteer op ID voor overzichtelijkheid
  savedItems.sort((a, b) => {
    const numA = parseInt(a.id, 10);
    const numB = parseInt(b.id, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return String(a.id).localeCompare(String(b.id));
  });

  counterEl.textContent = `${savedItems.length} bewaard`;
  section.style.display = 'flex';
  listEl.innerHTML = '';

  savedItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
      <div class="saved-left">
        <span class="badge">#${item.id}</span>
        <span class="saved-name">${escapeHtml(item.name)}</span>
      </div>
      <div class="saved-actions">
        <button class="btn-open-sm" title="Open PDF">📄 Open</button>
        <button class="btn-remove-saved" title="Verwijder uit bewaard">&times;</button>
      </div>
    `;

    // Klikken op hele rij of op Open knop opent het draaiboek
    card.onclick = () => window.open(item.url, '_blank', 'noopener,noreferrer');
    card.querySelector('.btn-open-sm').onclick = (e) => {
      e.stopPropagation();
      window.open(item.url, '_blank', 'noopener,noreferrer');
    };

    // Klikken op het kruisje verwijdert het uit de lijst
    card.querySelector('.btn-remove-saved').onclick = (e) => removeDraaiboek(item.id, e);

    listEl.appendChild(card);
  });
}

// Render de lijst van alle draaiboeken onder de zoekbalk
function renderList() {
  const query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  const listEl = document.getElementById('draaiboekList');
  const counterEl = document.getElementById('counter');
  const emptyEl = document.getElementById('emptyMsg');

  const filtered = items.filter(i => {
    if (!query) return true;
    return String(i.id).toLowerCase().includes(query) ||
           `#${i.id}`.toLowerCase().includes(query) ||
           String(i.name).toLowerCase().includes(query);
  });

  counterEl.textContent = `${filtered.length} gevonden`;

  if (filtered.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  listEl.style.display = 'flex';
  listEl.innerHTML = '';

  filtered.forEach(item => {
    const isSaved = savedIds.has(String(item.id));
    const row = document.createElement('div');
    row.className = 'row-card';
    row.innerHTML = `
      <div class="row-left">
        <span class="badge">#${item.id}</span>
        <span class="row-name">${escapeHtml(item.name)}</span>
      </div>
      <div class="row-actions">
        <button class="star-btn ${isSaved ? 'active' : ''}" title="${isSaved ? 'Verwijder uit bewaard' : 'Bewaar bovenaan'}">
          ${isSaved ? '★' : '☆'}
        </button>
        <span class="arrow-icon">↗</span>
      </div>
    `;

    row.querySelector('.star-btn').onclick = (e) => toggleSave(item.id, e);
    row.onclick = () => openDraaiboek(item.id);
    listEl.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Native dropdown vullen voor mobiel
function populateSelect() {
  const select = document.getElementById('quickSelect');
  select.innerHTML = '<option value="">▼ Of kies je naam uit de lijst...</option>';
  items.forEach(i => {
    const opt = document.createElement('option');
    opt.value = i.id;
    opt.textContent = `#${i.id} - ${i.name}`;
    select.appendChild(opt);
  });
}

// Initialisatie zodra de DOM geladen is
document.addEventListener('DOMContentLoaded', async () => {
  // Opgeslagen IDs ophalen uit localStorage
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_SAVED_KEY));
    if (Array.isArray(saved)) {
      savedIds = new Set(saved.map(String));
    }
    // Automatische migratie van oude enkele ID (indien aanwezig)
    const oldSingle = localStorage.getItem(OLD_STORAGE_MY_ID);
    if (oldSingle && !savedIds.has(String(oldSingle))) {
      savedIds.add(String(oldSingle));
      persistSaved();
    }
  } catch (e) {}

  // Zoekbalk interactie
  document.getElementById('searchInput').addEventListener('input', renderList);

  // Dropdown interactie
  document.getElementById('quickSelect').addEventListener('change', (e) => {
    if (e.target.value) {
      openDraaiboek(e.target.value);
      e.target.value = '';
    }
  });

  // Haal data op via Backend
  items = await Backend.getDraaiboeken();
  
  // UI laden
  document.getElementById('loadingMsg').style.display = 'none';
  populateSelect();
  renderSaved();
  renderList();
});
