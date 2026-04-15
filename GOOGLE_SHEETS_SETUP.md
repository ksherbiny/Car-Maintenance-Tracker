# Google Sheets Sync — Setup Guide

Connect your Car Maintenance Tracker to Google Sheets so every entry is saved
to the cloud and stays in sync across devices.

---

## What you need

| Item | Where to get it |
|------|----------------|
| Google account | Any Gmail account |
| Google Cloud project | console.cloud.google.com (free) |
| OAuth 2.0 Client ID | Created inside the Cloud project |
| Google Sheet ID | From the sheet's URL |

---

## Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it anything (e.g. `Car Maintenance Tracker`) → **Create**
4. Make sure the new project is selected in the dropdown

---

## Step 2 — Enable the Google Sheets API

1. In the left sidebar go to **APIs & Services → Library**
2. Search for **Google Sheets API**
3. Click it → **Enable**

---

## Step 3 — Create an OAuth 2.0 Client ID

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If prompted to configure the consent screen first:
   - Choose **External** → **Create**
   - Fill in **App name** (e.g. `Car Maintenance Tracker`) and your email
   - Skip the scopes screen (just click Save and Continue through to the end)
   - Go back to **Credentials → + Create Credentials → OAuth client ID**
4. Set **Application type** → **Web application**
5. Name it anything (e.g. `Car Tracker Web`)
6. Under **Authorised JavaScript origins** add:
   ```
   https://ksherbiny.github.io
   ```
7. Under **Authorised redirect URIs** add:
   ```
   https://ksherbiny.github.io/Car-Maintenance-Tracker/
   ```
8. Click **Create**
9. A dialog shows your **Client ID** — copy it and save it somewhere safe
   (looks like `123456789-abc.apps.googleusercontent.com`)

> **Local testing only?**  
> Also add `http://localhost:3000` to Authorised JavaScript origins and
> `http://localhost:3000/` to Authorised redirect URIs.

---

## Step 4 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **+ Blank**
2. Name the sheet anything (e.g. `Car Maintenance Data`)
3. The app will automatically write the header row on first sync —
   you do **not** need to add any columns manually
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  <<<SHEET_ID_IS_HERE>>>  /edit
   ```
   It is the long string between `/d/` and `/edit`

---

## Step 5 — Connect inside the App

1. Open the app → tap the **⚙️ Settings** icon (top right)
2. Paste your **Client ID** into the Client ID field
3. Paste your **Sheet ID** into the Sheet ID field
4. Tap **Connect Google Sheets**
5. A Google sign-in popup appears — sign in and allow access
6. The badge in the top of the Home page will change to **⬤ Synced**

> The first sync pushes all 123 local records up to the sheet.  
> From that point on every Add / Edit / Delete is mirrored automatically.

---

## Sheet structure (auto-created)

The app writes to **Sheet1**, row 1 is the header:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | date | item | price | km | category | comment | source |

- **id** — unique identifier (e.g. `seed_001`, `local_1713000000000`)
- **date** — ISO format `YYYY-MM-DD`
- **km** — stored in thousands (`61` = 61,000 km)
- **source** — `manual` (entered in app) or `sheets` (imported from sheet)

---

## How sync works

| Situation | Result |
|-----------|--------|
| Entry exists locally, not in sheet | Pushed up to sheet |
| Entry exists in sheet, not locally | Pulled into local storage |
| Entry exists in both | Local copy wins |
| You add an entry in the app | Immediately appended to sheet |
| You edit an entry in the app | Row updated in sheet |
| You delete an entry in the app | Row deleted from sheet |

Sync runs automatically in the background whenever the app is online.  
You can also trigger it manually by pull-to-refresh on the History page.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Popup blocked | Allow popups for `ksherbiny.github.io` in browser settings |
| "Access blocked: app not verified" | On the consent screen click **Advanced → Go to app (unsafe)** — this is normal for personal projects not submitted for Google review |
| Connection failed | Double-check the Client ID has no extra spaces; make sure the GitHub Pages URL is listed exactly in Authorised origins |
| Sync not running | Check the ⬤ badge — if it shows Offline you have no internet connection |
| Entries duplicated in sheet | This can happen if sync ran twice before completion — delete duplicate rows manually in the sheet; the app de-duplicates by `id` |

---

## Re-using on another device

Just enter the same **Client ID** and **Sheet ID** in Settings on the other
device and tap Connect. The first sync will pull all sheet data into that
device's local storage automatically.
