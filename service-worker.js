const CACHE_NAME = 'car-tracker-v1.01';
const SYNC_QUEUE_KEY = 'sheets-sync-queue';

// Will be fully populated in Step 6 — listed here as skeleton
const STATIC_ASSETS = [
  '/Car-Maintenance-Tracker/',
  '/Car-Maintenance-Tracker/index.html',
  '/Car-Maintenance-Tracker/manifest.json',
  '/Car-Maintenance-Tracker/css/styles.css',
  '/Car-Maintenance-Tracker/js/app.js',
  '/Car-Maintenance-Tracker/js/data.js',
  '/Car-Maintenance-Tracker/js/charts.js',
  '/Car-Maintenance-Tracker/js/google-sheets.js',
  '/Car-Maintenance-Tracker/pages/home.html',
  '/Car-Maintenance-Tracker/pages/add.html',
  '/Car-Maintenance-Tracker/pages/history.html',
  '/Car-Maintenance-Tracker/pages/analysis.html',
  '/Car-Maintenance-Tracker/icons/icon-192.png',
  '/Car-Maintenance-Tracker/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Don't intercept Google API calls — let them fail naturally when offline
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('apis.google.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/Car-Maintenance-Tracker/index.html');
        }
      });
    })
  );
});

// ── Periodic Background Sync — maintenance reminders ─────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'maintenance-reminder') {
    event.waitUntil(checkMaintenanceAndNotify());
  }
});

async function checkMaintenanceAndNotify() {
  try {
    var meta = await readIDB('CarTracker', 'entries', 'car_meta');
    if (!meta || !meta.reminderState) return;
    var rs = meta.reminderState;
    if (!rs.dailyKm) return;

    var toNotify = [];

    if (rs.oilInterval && rs.lastOilKm) {
      var oilLeft = (rs.lastOilKm + rs.oilInterval) - rs.currentKm;
      var oilDays = Math.round(oilLeft / rs.dailyKm);
      if (oilDays <= 14) {
        toNotify.push({
          tag:   'oil-reminder',
          title: oilDays <= 0 ? '⚠️ Oil Change Overdue!' : '🛢 Oil Change Due Soon',
          body:  oilDays <= 0
            ? 'Overdue by ' + Math.abs(oilLeft).toLocaleString() + ' km — service needed'
            : 'Due in ~' + oilDays + ' days (' + oilLeft.toLocaleString() + ' km remaining)'
        });
      }
    }

    if (rs.tireInterval && rs.lastTireKm) {
      var tireLeft = (rs.lastTireKm + rs.tireInterval) - rs.currentKm;
      var tireDays = Math.round(tireLeft / rs.dailyKm);
      if (tireDays <= 14) {
        toNotify.push({
          tag:   'tire-reminder',
          title: tireDays <= 0 ? '⚠️ Tire Change Overdue!' : '🛞 Tire Change Due Soon',
          body:  tireDays <= 0
            ? 'Overdue by ' + Math.abs(tireLeft).toLocaleString() + ' km — replacement needed'
            : 'Due in ~' + tireDays + ' days (' + tireLeft.toLocaleString() + ' km remaining)'
        });
      }
    }

    for (var i = 0; i < toNotify.length; i++) {
      await self.registration.showNotification(toNotify[i].title, {
        body:             toNotify[i].body,
        tag:              toNotify[i].tag,
        icon:             '/Car-Maintenance-Tracker/icons/icon-192.png',
        badge:            '/Car-Maintenance-Tracker/icons/icon-192.png',
        requireInteraction: true
      });
    }
  } catch (e) {}
}

// Read a single key from localForage's IndexedDB store
function readIDB(dbName, storeName, key) {
  return new Promise(function(resolve) {
    try {
      var req = indexedDB.open(dbName);
      req.onsuccess = function(e) {
        try {
          var db = e.target.result;
          var tx = db.transaction(storeName, 'readonly');
          var store = tx.objectStore(storeName);
          var get = store.get(key);
          get.onsuccess = function() { resolve(get.result || null); };
          get.onerror   = function() { resolve(null); };
        } catch(_) { resolve(null); }
      };
      req.onerror = function() { resolve(null); };
    } catch(_) { resolve(null); }
  });
}

// Background sync: retry queued Sheets API calls when back online
self.addEventListener('sync', event => {
  if (event.tag === 'sheets-sync') {
    event.waitUntil(processQueue());
  }
});

self.addEventListener('online', () => processQueue());

async function processQueue() {
  const db = await getQueueDB();
  const queue = db || [];
  if (!queue.length) return;
  const remaining = [];
  for (const task of queue) {
    try {
      const resp = await fetch(task.url, { method: task.method, headers: task.headers, body: task.body });
      if (!resp.ok) remaining.push(task);
    } catch {
      remaining.push(task);
    }
  }
  await setQueueDB(remaining);
}

async function getQueueDB() {
  try {
    const clients = await self.clients.matchAll();
    return [];
  } catch { return []; }
}

async function setQueueDB() {}
