const CACHE_NAME = 'car-tracker-v2';
const SYNC_QUEUE_KEY = 'sheets-sync-queue';

// Will be fully populated in Step 6 — listed here as skeleton
const STATIC_ASSETS = [
  '/car-maintenance-tracker/',
  '/car-maintenance-tracker/index.html',
  '/car-maintenance-tracker/manifest.json',
  '/car-maintenance-tracker/css/styles.css',
  '/car-maintenance-tracker/js/app.js',
  '/car-maintenance-tracker/js/data.js',
  '/car-maintenance-tracker/js/charts.js',
  '/car-maintenance-tracker/js/google-sheets.js',
  '/car-maintenance-tracker/js/seed-data.js',
  '/car-maintenance-tracker/pages/home.html',
  '/car-maintenance-tracker/pages/add.html',
  '/car-maintenance-tracker/pages/history.html',
  '/car-maintenance-tracker/pages/analysis.html',
  '/car-maintenance-tracker/icons/icon-192.png',
  '/car-maintenance-tracker/icons/icon-512.png',
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
          return caches.match('/car-maintenance-tracker/index.html');
        }
      });
    })
  );
});

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
