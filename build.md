# 🚗 Car Maintenance Tracker — Build Guide

> **PWA · GitHub Pages · Google Sheets Sync**  
> Historical data: 123 records | 2010–2026 | 214,734 EGP total

---

## 📁 Project Structure

```
car-maintenance-tracker/
│
├── index.html                  ← App shell + bottom nav + page router
├── manifest.json               ← PWA manifest (name, icons, theme color)
├── service-worker.js           ← Offline caching + background sync queue
│
├── css/
│   └── styles.css              ← Full mobile-first stylesheet
│
├── js/
│   ├── app.js                  ← Router, init, state, nav controller
│   ├── data.js                 ← IndexedDB layer via localForage
│   ├── google-sheets.js        ← Google Sheets API v4 read/write/sync
│   ├── charts.js               ← Chart.js chart builders
│   └── seed-data.js            ← 123 pre-loaded records from Excel
│
├── pages/
│   ├── home.html               ← Dashboard + summary cards
│   ├── add.html                ← Add / Edit entry form
│   ├── history.html            ← Full history list + search + filters
│   └── analysis.html          ← Analytics charts + stats
│
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── favicon.ico
```

---

## 🎨 Design Tokens

```css
/* === COLORS === */
--primary:         #0070C0;   /* Main blue — buttons, active nav, badges */
--primary-dark:    #005a9e;   /* Hover / pressed state */
--primary-light:   #e6f2fb;   /* Card highlights, tag backgrounds */
--accent:          #f5a623;   /* Warning / attention (e.g. overdue oil) */
--success:         #27ae60;   /* Positive values, saved confirmation */
--danger:          #e74c3c;   /* Delete, error states */
--bg:              #f4f6f9;   /* App background */
--surface:         #ffffff;   /* Cards, modals, panels */
--text-primary:    #1a1a2e;   /* Main body text */
--text-secondary:  #6b7280;   /* Labels, subtitles */
--border:          #e2e8f0;   /* Dividers, input borders */
--nav-bg:          #ffffff;   /* Bottom navigation bar */
--nav-active:      #0070C0;   /* Active nav icon + label */
--nav-inactive:    #9ca3af;   /* Inactive nav icon + label */

/* === TYPOGRAPHY === */
--font-main:   'Candara', 'Calibri', 'Trebuchet MS', sans-serif;
--font-arabic: 'Cairo', 'Candara', sans-serif;  /* Fallback for Arabic text */

/* === SPACING & RADIUS === */
--radius-sm:   8px;
--radius-md:   14px;
--radius-lg:   20px;
--card-shadow: 0 2px 12px rgba(0, 112, 192, 0.08);
```

> **Font note:** Candara is a Windows system font. For cross-platform support (Android, iOS), load **Cairo** from Google Fonts as the primary webfont since it covers both Latin and Arabic glyphs, with Candara as the desktop fallback.

```html
<!-- Add to <head> in index.html -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 🗂️ Seed Data Format

`js/seed-data.js` exports a single array. Every record from the Excel sheet is pre-categorized. Category is auto-assigned by keyword matching at seed time.

```js
// js/seed-data.js
const SEED_DATA = [
  {
    id: "seed_001",
    date: "2010-09-25",
    item: "مساعدين",
    price: 2000,
    km: 61,
    category: "Suspension",
    comment: "",
    source: "imported"
  },
  // ... 122 more records
];

export default SEED_DATA;
```

### Category Keyword Map (used in seed + add form)

| Category         | Arabic Keywords                         | English Keywords              |
|------------------|-----------------------------------------|-------------------------------|
| Oil Change       | زيت، فلتر                               | oil, filter                   |
| Tires            | عجل، تيل، تيش، بطاحات، زوايا           | tire, wheel, alignment        |
| Engine           | موتور، بوجيهات، فلتر بنزين، سير، كرنك  | engine, spark, timing, belt   |
| Suspension       | مساعدين، كوبلن، بارات، طنابير، عفشة    | suspension, shock, control    |
| AC               | تكيف، تكييف، كمبريسور                  | ac, air, compressor           |
| Electrical       | بطارية، كهرباء، حساس، كنترول           | battery, sensor, electric     |
| Cooling          | ريدياتير، مياه، طرمبة مياه، قربة       | radiator, coolant, water pump |
| Body & Glass     | سمكرة، زجاج، باب، دوكو                 | body, glass, door, paint      |
| Brakes           | فرامل، تيل فرامل                        | brake, brakes                 |
| Gearbox          | فتيس، دريكسيون، باور                   | gearbox, transmission, power  |
| General Service  | صيانة                                   | service, maintenance          |
| Other            | *(fallback)*                            | *(fallback)*                  |

---

## 🏠 Home Page — Summary Cards

Cards rendered dynamically from IndexedDB data:

```
┌─────────────────────────────────┐
│  💰  Total Spent (All Time)     │
│      214,734 EGP                │
└─────────────────────────────────┘
┌──────────────┐  ┌──────────────┐
│ 📅 This Year │  │ 🗓 This Month │
│  XX,XXX EGP  │  │   X,XXX EGP  │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ 🛢 Last Oil  │  │ 🚗 Current KM│
│  DD/MM/YYYY  │  │    419,000   │
│   @ XXX km   │  │              │
└──────────────┘  └──────────────┘
```

Below cards: a mini bar chart (last 5 years) + last 5 entries list.

---

## ➕ Add Entry Page — Form Fields

```
Date         [date picker — defaults to today]
Category     [dropdown — 12 options from table above]
Item / Title [text input — Arabic/English, RTL auto-detect]
Price        [number input — EGP, no decimals]
Odometer KM  [number input — in thousands e.g. 419]
Notes        [textarea — optional]

[  💾 Save Entry  ]   [  ✕ Cancel  ]
```

- On Save: write to IndexedDB → trigger Google Sheets sync
- If editing existing entry: pre-fill all fields, update both storages
- RTL detection: if first char is Arabic, set `dir="rtl"` on item field

---

## 📋 History Page — List + Search

**Search bar** (sticky at top):
- Searches across: item, comment, date (year/month), category

**Filter chips** (scrollable row below search):
`All` · `2026` · `2025` · `2024` · ... · `Oil Change` · `Engine` · `Tires` · ...

**Entry card layout:**
```
┌────────────────────────────────────────┐
│ [Category Icon]  Item Name          🔵 │
│                  DD MMM YYYY  ·  KM   │
│                           1,050 EGP   │
│ ▸ Tap to expand comment               │
│   [✏️ Edit]  [🗑 Delete]              │
└────────────────────────────────────────┘
```

- Sorted newest first by default
- Pagination: load 20 at a time, infinite scroll
- Pull-to-refresh triggers Google Sheets re-sync

---

## 📈 Analysis Page — Charts

All charts use **Chart.js**. Color palette based on `--primary` (#0070C0) tints.

| # | Chart | Type | Data |
|---|-------|------|------|
| 1 | Yearly Spending | Vertical Bar | Total EGP per year, 2010–present |
| 2 | Category Breakdown | Doughnut | % share per category |
| 3 | Cost vs Odometer | Line | Price plotted against KM milestones |
| 4 | Monthly (Current Year) | Bar | Month-by-month current year |
| 5 | Top 5 Expenses | Horizontal Bar | Biggest single-record costs |

**Stat tiles above charts:**
- Avg annual spend
- Avg cost per 1,000 km
- Most expensive category
- Most frequent category

---

## ☁️ Google Sheets Integration

### One-time user setup (documented in app Settings screen):

1. Create a Google Sheet with this header row:

   ```
   A: id | B: date | C: item | D: price | E: km | F: category | G: comment | H: source
   ```

2. Go to **Google Cloud Console** → New Project → Enable **Google Sheets API**
3. Create **OAuth 2.0 Web Client ID** (for GitHub Pages domain)
4. Paste `Client ID` + `Sheet ID` into app **Settings**

### `google-sheets.js` — four public functions:

```js
initGoogleAuth(clientId)           // Load gapi, authenticate user
readSheet(sheetId)                 // GET all rows → returns array of objects
appendRow(sheetId, entry)          // POST one new row
updateRow(sheetId, rowIndex, entry)// PUT edited row by index
deleteRow(sheetId, rowIndex)       // DELETE row (shift rows up)
syncAll(sheetId, localData)        // Full reconcile: local ↔ sheet
```

### Sync logic (in `app.js`):

```
On app start:
  1. Load from IndexedDB (instant, offline-safe)
  2. If online → call readSheet() → merge by `id` field
     - New in sheet but not local → add to IndexedDB
     - New in local but not sheet → appendRow()
  3. Render UI from merged result

On add/edit/delete:
  1. Update IndexedDB immediately (UI stays responsive)
  2. If online → call appropriate Sheets function
  3. If offline → push to sync queue in Service Worker
     → Service Worker retries on next `online` event
```

---

## 📲 PWA Configuration

### `manifest.json`
```json
{
  "name": "Car Maintenance Tracker",
  "short_name": "CarTracker",
  "start_url": "/car-maintenance-tracker/",
  "display": "standalone",
  "background_color": "#f4f6f9",
  "theme_color": "#0070C0",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### `service-worker.js` — caches:
- All local assets (HTML, CSS, JS, icons) on install
- Google Fonts stylesheet
- Chart.js CDN
- Queues failed Sheets API calls for retry when back online

---

## 🚀 GitHub Pages Deployment

```bash
# 1. Create repo on GitHub named: car-maintenance-tracker

# 2. Clone and add files
git clone https://github.com/YOUR_USERNAME/car-maintenance-tracker.git
cd car-maintenance-tracker
# ... add all project files ...

# 3. Push
git add .
git commit -m "Initial build"
git push origin main

# 4. Enable Pages
# GitHub → Repo Settings → Pages → Source: main branch / root

# 5. App will be live at:
# https://YOUR_USERNAME.github.io/car-maintenance-tracker/
```

> **Important:** Update `start_url` in `manifest.json` and the Service Worker cache path to match your GitHub Pages subdirectory (e.g. `/car-maintenance-tracker/`).

---

## 🔨 Build Order for Claude Code

Follow this exact sequence to avoid dependency issues:

```
Step 1 — Scaffolding
  ├── Create all folders: css/, js/, pages/, icons/
  ├── manifest.json
  └── service-worker.js (skeleton, fill cache list last)

Step 2 — Data Layer
  ├── js/seed-data.js       ← All 123 records as JS array
  └── js/data.js            ← IndexedDB CRUD via localForage

Step 3 — Shell & Styles
  ├── index.html            ← App shell, nav, page loader, CDN links
  └── css/styles.css        ← Full stylesheet with design tokens above

Step 4 — Pages (one at a time, test each)
  ├── pages/home.html       ← Cards + mini chart + recent list
  ├── pages/add.html        ← Form with validation
  ├── pages/history.html    ← List + search + filters
  └── pages/analysis.html  ← 5 charts + stat tiles

Step 5 — JavaScript Logic
  ├── js/charts.js          ← Chart.js builders (called from analysis.html)
  ├── js/google-sheets.js   ← Sheets API functions
  └── js/app.js             ← Router, init, nav, sync orchestration

Step 6 — Polish & PWA
  ├── Update service-worker.js cache list with all actual file paths
  ├── Generate icons/ (192px and 512px PNG — car/wrench icon)
  ├── Test offline mode (Chrome DevTools → Network → Offline)
  └── Test "Add to Home Screen" on Android + iOS

Step 7 — Deploy
  └── Push to GitHub → enable Pages → verify live URL
```

---

## ⚠️ Known Gotchas

| Issue | Solution |
|-------|----------|
| Candara not available on Android/iOS | Google Fonts `Cairo` loads as primary webfont; Candara is CSS fallback for Windows |
| Arabic text alignment in inputs | Add `dir="auto"` attribute on item/comment fields |
| GitHub Pages subpath breaks SW scope | Set `scope: "/car-maintenance-tracker/"` in SW registration |
| Google OAuth redirect URI | Must add exact GitHub Pages URL to OAuth 2.0 allowed redirect URIs in Cloud Console |
| localForage first-load delay | Show loading skeleton cards while IndexedDB initializes |
| KM stored as thousands in sheet | Normalize on seed import: raw value `419` = `419,000 km` — display with suffix |

---

## 📦 CDN Dependencies (no npm needed)

```html
<!-- In index.html <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://apis.google.com/js/api.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

*Data source: Optra Tracking sheet · 123 records · 61,000 km → 419,000 km · 2010–2026*
