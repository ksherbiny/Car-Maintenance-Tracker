// js/google-sheets.js — Apps Script backend (no OAuth required)
// All data flows through a single deployed Apps Script web-app URL.
// GET  → read all rows from the sheet
// POST → write operations (append / update / delete / syncAll)

let _scriptUrl = '';

export function setScriptUrl(url) {
  _scriptUrl = url;
}

export function isConnected() {
  return !!_scriptUrl;
}

// ── Read ─────────────────────────────────────────────────────────────────────
export async function readSheet() {
  const resp = await fetch(_scriptUrl, { redirect: 'follow' });
  const json = await resp.json();
  if (!json.ok) throw new Error(json.error || 'Read failed');
  return json.data;
}

// ── Write (fire-and-forget, no-cors) ─────────────────────────────────────────
// Apps Script POST works with text/plain + no-cors — response is opaque but
// the request is received and processed by the script.
function scriptPost(body) {
  return fetch(_scriptUrl, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify(body)
  }).catch(() => {}); // local IndexedDB is source-of-truth; retried on next sync
}

export function appendRow(entry) {
  return scriptPost({ action: 'append', entry });
}

export function updateRow(entry) {
  return scriptPost({ action: 'update', entry });
}

export function deleteRow(id) {
  return scriptPost({ action: 'delete', id });
}

// ── Sync ─────────────────────────────────────────────────────────────────────
// 1. Pull sheet data via GET
// 2. Compute which local entries are missing from the sheet
// 3. Send ALL missing entries in ONE batch POST (avoids rate-limiting)
// 4. Return merged list (local wins on conflict)
export async function syncAll(localData) {
  const sheetData = await readSheet();

  const sheetById = Object.fromEntries(sheetData.map(e => [e.id, e]));
  const localById = Object.fromEntries(localData.map(e => [e.id, e]));

  const toAppend = localData.filter(e => !sheetById[e.id]);

  // Send all missing entries in a single batch request
  if (toAppend.length > 0) {
    scriptPost({ action: 'batchAppend', entries: toAppend });
  }

  // Merge: local wins on conflicts; sheet-only entries are pulled in
  const merged = [
    ...sheetData.map(s => localById[s.id] || s),
    ...toAppend
  ];

  return merged.sort((a, b) => b.date.localeCompare(a.date));
}
