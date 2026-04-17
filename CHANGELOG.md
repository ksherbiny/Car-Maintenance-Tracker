# Car Maintenance Tracker — Project Log

A PWA (Progressive Web App) for tracking car maintenance history, costs, and service reminders. Installed on mobile as a home screen app, syncs to Google Sheets.

---

## Stack

- **Frontend:** Vanilla JS (ES modules), CSS, HTML — no framework
- **Storage:** IndexedDB via localForage
- **Sync:** Google Apps Script (no OAuth, no login required)
- **Notifications:** Web Push API + Periodic Background Sync (Android Chrome PWA)
- **Hosting:** GitHub Pages

---

## What Was Built

### Initial Build
- Full PWA with 4 pages: Home, Add Entry, History, Analysis
- IndexedDB storage for all maintenance entries (date, km, category, cost, notes)
- Home page: current km, last oil change, total spent, yearly chart, recent entries
- History page: filterable/searchable list of all entries
- Analysis page: category breakdown, yearly totals chart
- Add page: form with category picker, km, price, date, notes
- Manifest + service worker for installable PWA

### Google Sheets Sync
- Sync via Google Apps Script (no OAuth, no Google login required)
- User pastes a Web App URL in Settings — all entries POST to their own sheet
- Apps Script receives batch POST, writes all rows, avoids duplicates
- Handles date normalization: accepts `YYYY-MM-DD`, `dd/mm/yyyy`, and full JS date strings
- Records sorted by date (oldest first) before syncing

### UI & Layout
- Switched layout from RTL to LTR
- Car illustration hero card on home page
- Stat cards: total all-time spend, yearly, monthly
- Date format: `dd-mmm-yyyy` (e.g. `12-Apr-2026`)
- Reminder cards on home page with color-coded status (OK / Soon / Overdue)

---

## Fixes & Improvements (Chronological)

### PWA / Mobile Install
- **Black splash screen on install** — fixed manifest background color and theme color
- **404 on mobile PWA launch** — fixed service worker scope and start URL in manifest
- **SW updates not reaching mobile** — added `updateViaCache: 'none'` to SW registration and bumped cache version to force update on all installed devices

### Google Sheets Sync
- **123 separate POST requests on sync** — rewrote to send all records in one batch POST
- **Apps Script syntax errors** — rewrote to use `var` (no ES6), removed markdown fences from embedded code
- **Date parsing failures** — Apps Script now normalizes all date formats to `YYYY-MM-DD` before writing
- **Excel date serial numbers** — removed reliance on Excel formatting; script parses dates directly
- **Full JS date strings from Sheets** (`Sat Mar 07 2026 00:00:00...`) — added parser in app to handle these on import
- **Setup guide** — rewrote twice for clarity; moved script to standalone `apps-script.gs` file; added inline guide in Settings page

### Data & Entries
- **Seed/fake placeholder data** — removed auto-seeding entirely; app starts empty
- **Search clear button not working on mobile** — fixed touch event handling

### Notifications & Reminders
- Added oil change and tire change reminder cards on home page
- Added background push notifications via Periodic Background Sync (fires every 12 hours)
- **Wrong icon in tire notification** (`🔧` → `🛞`) — fixed in both reminder card and push notification
- **Backup buttons layout broken** — fixed flex layout for export/import buttons

### Days Countdown Bug (April 2026)
**Problem:** The "~5 days left" countdown on the home page was frozen — it never counted down unless the user manually logged a new odometer entry.

**Root cause:** `daysLeft` was calculated as `(nextServiceKm - lastLoggedKm) / dailyKm`. Since `lastLoggedKm` never changed between entries, the countdown was stuck.

**Fix:** Project the current km forward from the last log date:
```js
const daysSinceLog = Math.floor((Date.now() - new Date(lastKmDate)) / 86400000);
const estimatedCurrentKm = lastLoggedKm + daysSinceLog * dailyKm;
const daysLeft = Math.round((nextServiceKm - estimatedCurrentKm) / dailyKm);
```

Applied in three places:
- `js/data.js` — `getStats()` now returns `lastKmDate` (date of highest-km entry)
- `js/app.js` — `renderReminders()` uses projected km for display
- `js/app.js` — `updateReminderState()` saves `lastKmDate` into SW snapshot
- `service-worker.js` — `checkMaintenanceAndNotify()` uses same projection before firing notifications

---

## How Reminders Work

1. User sets **oil interval** (km), **tire interval** (km), and **daily km** in Settings
2. App finds the most recent odometer reading logged (highest km entry) and its date
3. Estimates today's km: `lastLoggedKm + (daysSinceLastLog × dailyKm)`
4. Calculates km remaining to next service and converts to days using `dailyKm`
5. Home page shows colored reminder cards (green = OK, orange = Soon ≤30 days, red = Overdue)
6. Service worker fires a push notification when either reminder drops to ≤14 days

---

## File Structure

```
/
├── index.html              # App shell, SW registration
├── manifest.json           # PWA manifest
├── service-worker.js       # Cache, periodic sync, push notifications
├── apps-script.gs          # Google Apps Script (paste into Google Sheets)
├── GOOGLE_SHEETS_SETUP.md  # Setup guide for Sheets sync
├── js/
│   ├── app.js              # All page logic, reminders, settings
│   ├── data.js             # IndexedDB helpers, getStats()
│   └── db.js               # localForage wrappers
├── css/
│   └── style.css
├── pages/
│   ├── home.html
│   ├── add.html
│   ├── history.html
│   └── analysis.html
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
