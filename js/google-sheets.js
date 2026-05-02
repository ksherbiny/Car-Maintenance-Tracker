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

// ── Confirmed-IDs helpers ─────────────────────────────────────────────────────
// Tracks IDs we've ever seen in the sheet. Used to distinguish:
//   "new local entry that needs uploading" vs "was in sheet, now deleted from sheet".
const CONFIRMED_KEY = 'sheets_confirmed_ids';

function getConfirmedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(CONFIRMED_KEY) || '[]')); } catch { return new Set(); }
}
function saveConfirmedIds(set) {
  try { localStorage.setItem(CONFIRMED_KEY, JSON.stringify([...set])); } catch {}
}

// ── Sync ─────────────────────────────────────────────────────────────────────
// 1. Pull sheet data via GET, deduplicate by ID
// 2. Update confirmed-IDs set (IDs we've seen in the sheet)
// 3. Send local entries that are genuinely new (never been in sheet)
// 4. Return merged list: sheet entries (local wins on conflict) + new local
//    — entries confirmed before but now gone from sheet are treated as deleted
export async function syncAll(localData) {
  const rawSheet = await readSheet();

  // Deduplicate sheet rows by ID — keeps first occurrence, drops duplicates
  const seen = new Set();
  const sheetData = rawSheet.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const sheetById = Object.fromEntries(sheetData.map(e => [e.id, e]));
  const localById = Object.fromEntries(localData.map(e => [e.id, e]));

  // Update the set of IDs confirmed to have been in the sheet
  const confirmedIds = getConfirmedIds();
  for (const e of sheetData) confirmedIds.add(e.id);
  saveConfirmedIds(confirmedIds);

  // Remove confirmed/expired entries from the sent queue
  const sentQueue = pruneSentQueue(sheetById);

  // Only upload entries that:
  //   - are not already in the sheet
  //   - are not recently sent (still in-flight)
  //   - have NEVER been confirmed in the sheet (otherwise they were deleted there on purpose)
  const toAppend = localData
    .filter(e => !sheetById[e.id] && !sentQueue[e.id] && !confirmedIds.has(e.id))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (toAppend.length > 0) {
    markSent(toAppend.map(e => e.id));
    scriptPost({ action: 'batchAppend', entries: toAppend });
  }

  // Final merged list: deduplicated sheet (local version wins) + new local entries
  const merged = [
    ...sheetData.map(s => localById[s.id] || s),
    ...toAppend
  ];

  return merged.sort((a, b) => b.date.localeCompare(a.date));
}
