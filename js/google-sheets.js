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

// ── Date normalizer ───────────────────────────────────────────────────────────
// Converts any date format to YYYY-MM-DD before storing locally
function normalizeDate(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str; // already YYYY-MM-DD
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {     // dd/mm/yyyy
    const p = str.split('/');
    return p[2] + '-' + String(Number(p[1])).padStart(2, '0') + '-' + String(Number(p[0])).padStart(2, '0');
  }
  // Fallback: parse anything JS can understand (e.g. "Sat Mar 07 2026 00:00:00 GMT+0200")
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  return str;
}

// ── Read ─────────────────────────────────────────────────────────────────────
export async function readSheet() {
  const resp = await fetch(_scriptUrl, { redirect: 'follow' });
  const json = await resp.json();
  if (!json.ok) throw new Error(json.error || 'Read failed');
  return json.data.map(e => ({ ...e, date: normalizeDate(e.date) }));
}

// ── Sent-queue helpers ────────────────────────────────────────────────────────
// Tracks IDs we've already POSTed so syncAll() doesn't re-send them before
// Apps Script has had time to process the write (fire-and-forget latency).
const SENT_QUEUE_KEY = 'sheets_sent_queue';
const SENT_QUEUE_TTL = 10 * 60 * 1000; // 10 min — retry if still not in sheet

function getSentQueue() {
  try { return JSON.parse(localStorage.getItem(SENT_QUEUE_KEY) || '{}'); } catch { return {}; }
}
function setSentQueue(q) {
  try { localStorage.setItem(SENT_QUEUE_KEY, JSON.stringify(q)); } catch {}
}
function markSent(ids) {
  const q = getSentQueue();
  const now = Date.now();
  for (const id of ids) q[id] = now;
  setSentQueue(q);
}
function pruneSentQueue(sheetById) {
  const q = getSentQueue();
  const now = Date.now();
  for (const id of Object.keys(q)) {
    if (sheetById[id] || (now - q[id]) > SENT_QUEUE_TTL) delete q[id];
  }
  setSentQueue(q);
  return q;
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
  markSent([entry.id]);
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

  // Remove confirmed/expired entries from the sent queue
  const sentQueue = pruneSentQueue(sheetById);

  // Sort oldest → newest so the sheet rows are in chronological order
  // Skip entries already in the sent queue — they were sent recently and the
  // Apps Script write may not have appeared in the GET response yet.
  const toAppend = localData
    .filter(e => !sheetById[e.id] && !sentQueue[e.id])
    .sort((a, b) => a.date.localeCompare(b.date));

  // Send all missing entries in a single batch request
  if (toAppend.length > 0) {
    markSent(toAppend.map(e => e.id));
    scriptPost({ action: 'batchAppend', entries: toAppend });
  }

  // Merge: local wins on conflicts; sheet-only entries are pulled in
  const merged = [
    ...sheetData.map(s => localById[s.id] || s),
    ...toAppend
  ];

  return merged.sort((a, b) => b.date.localeCompare(a.date));
}
