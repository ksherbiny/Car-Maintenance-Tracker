// js/google-sheets.js — Google Sheets API v4 read/write/sync

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SHEET_TAB = 'Sheet1';
const HEADER_ROW = ['id','date','item','price','km','category','comment','source'];

let _tokenClient = null;
let _gapiInited   = false;
let _gisInited    = false;

// ── Init ─────────────────────────────────────────────────────────────────────

export async function initGoogleAuth(clientId) {
  if (!clientId) throw new Error('Client ID missing');

  await _loadGapi();
  await _loadGis(clientId);
}

function _loadGapi() {
  return new Promise((resolve, reject) => {
    if (typeof gapi !== 'undefined' && _gapiInited) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', async () => {
        await gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] });
        _gapiInited = true;
        resolve();
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function _loadGis(clientId) {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && _gisInited) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: () => {}
      });
      _gisInited = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function requestAuth() {
  return new Promise((resolve, reject) => {
    if (!_tokenClient) { reject(new Error('GIS not initialised')); return; }
    _tokenClient.callback = resp => {
      if (resp.error) reject(resp);
      else resolve(resp);
    };
    if (gapi.client.getToken() === null) {
      _tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      _tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

export function isSignedIn() {
  return _gapiInited && gapi.client.getToken() !== null;
}

export function signOut() {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
}

// ── Sheet helpers ────────────────────────────────────────────────────────────

function _rowToEntry(row) {
  if (!row || !row[0]) return null;
  return {
    id:       row[0] || '',
    date:     row[1] || '',
    item:     row[2] || '',
    price:    Number(row[3]) || 0,
    km:       Number(row[4]) || 0,
    category: row[5] || 'Other',
    comment:  row[6] || '',
    source:   row[7] || 'sheets'
  };
}

function _entryToRow(e) {
  return [e.id, e.date, e.item, e.price, e.km, e.category, e.comment || '', e.source || 'manual'];
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function readSheet(sheetId) {
  const resp = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_TAB}!A2:H`
  });
  const rows = resp.result.values || [];
  return rows.map(_rowToEntry).filter(Boolean);
}

export async function appendRow(sheetId, entry) {
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_TAB}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [_entryToRow(entry)] }
  });
}

export async function updateRow(sheetId, rowIndex, entry) {
  // rowIndex is 1-based (data starts at row 2)
  const row = rowIndex + 1;
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${SHEET_TAB}!A${row}:H${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [_entryToRow(entry)] }
  });
}

export async function deleteRow(sheetId, rowIndex) {
  // Get spreadsheet metadata to find sheetId (numeric)
  const meta = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheet = meta.result.sheets.find(s => s.properties.title === SHEET_TAB);
  if (!sheet) throw new Error('Sheet tab not found');

  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex, // 0-based; row 2 = index 1
            endIndex: rowIndex + 1
          }
        }
      }]
    }
  });
}

export async function ensureHeader(sheetId) {
  const resp = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_TAB}!A1:H1`
  });
  const existing = (resp.result.values || [])[0] || [];
  if (existing[0] !== 'id') {
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_TAB}!A1:H1`,
      valueInputOption: 'RAW',
      resource: { values: [HEADER_ROW] }
    });
  }
}

// ── Sync: local ↔ sheet ──────────────────────────────────────────────────────

export async function syncAll(sheetId, localData) {
  await ensureHeader(sheetId);
  const sheetData = await readSheet(sheetId);

  const sheetById = Object.fromEntries(sheetData.map(e => [e.id, e]));
  const localById = Object.fromEntries(localData.map(e => [e.id, e]));

  const toAppend  = [];
  const merged    = [];

  // Entries in sheet not in local → add to local list
  for (const e of sheetData) {
    if (!localById[e.id]) merged.push(e);
    else merged.push(localById[e.id]); // local wins
  }

  // Entries in local not in sheet → append to sheet
  for (const e of localData) {
    if (!sheetById[e.id]) toAppend.push(e);
  }

  for (const e of toAppend) {
    await appendRow(sheetId, e);
  }

  return merged.concat(toAppend);
}
