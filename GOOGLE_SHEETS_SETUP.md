# Google Sheets Sync — Setup Guide (Apps Script)

No Google Cloud project, no OAuth, no Client IDs.  
Just a Google Sheet + a script + one URL pasted in Settings.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → click **+ Blank**
2. Rename it to `Car Maintenance Data` (click "Untitled spreadsheet" at the top)
3. Leave it open — you'll need it in the next step

---

## Step 2 — Open Apps Script

Inside your new sheet:

1. Click the menu **Extensions → Apps Script**
2. A new tab opens with a code editor showing an empty `function myFunction() {}`
3. **Select all** (Ctrl+A) and **delete** it
4. Open the raw script file at this URL — it contains nothing but the code:

   **[👉 Click here to open the raw script](https://raw.githubusercontent.com/ksherbiny/Car-Maintenance-Tracker/main/apps-script.gs)**

5. **Ctrl+A** to select all → **Ctrl+C** to copy
6. Go back to the Apps Script tab → **Ctrl+V** to paste
7. Click the 💾 **Save** icon (or Ctrl+S) → name the project `Car Maintenance Tracker`

> **Why use the raw file?**  
> Copying from a markdown page can accidentally include formatting characters
> that cause a SyntaxError on line 1. The raw file is plain text with nothing
> extra around it.

---

## Step 3 — Deploy as Web App

1. Click the blue **Deploy** button (top right) → **New deployment**
2. Click the ⚙️ gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Google may ask you to **Authorize access** — click through:
   - Choose your Google account
   - Click **Advanced** → **Go to Car Maintenance Tracker (unsafe)**
   - Click **Allow**
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 4 — Connect in the App

1. Open the app → tap **⚙️** (top right corner)
2. Paste the Web App URL into the **Apps Script URL** field
3. Tap **Connect Google Sheets**
4. The badge changes to **⬤ Synced**

All records are pushed to your sheet automatically on first sync.

---

## Updating the script later

If the script ever changes and you need to update it:

1. Go to Apps Script → open the project
2. Open the raw file link above → Ctrl+A → Ctrl+C
3. In Apps Script → Ctrl+A → Delete → Ctrl+V → Save
4. Click **Deploy → Manage deployments**
5. Click the ✏️ **pencil** icon → set Version to **New version** → **Deploy**
6. Same URL — no need to update Settings in the app

---

## How sync works

| Action | What happens |
|--------|-------------|
| Add entry | Saved locally + appended to sheet |
| Edit entry | Updated locally + row updated in sheet |
| Delete entry | Deleted locally + row deleted from sheet |
| Open app (online) | Auto-syncs in background |
| Pull-to-refresh on History | Forces an immediate sync |

---

## Sheet structure (auto-created on first sync)

Row 1 is the header, data starts at row 2:

| A  | B    | C    | D     | E  | F        | G       | H      |
|----|------|------|-------|----|----------|---------|--------|
| id | date | item | price | km | category | comment | source |

- **km** is stored in thousands (`65` = 65,000 km)
- **source** is `manual` (added in app) or `sheets` (imported from sheet)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SyntaxError on line 1 | You copied from the markdown file — use the raw file link in Step 2 instead |
| Badge stays Offline | Check internet connection |
| Sheet only shows a few records | Old script version — redo Steps 2–3 using the raw file link, then re-connect in Settings |
| "Apps Script URL" validation error | Make sure the URL starts with `https://script.google.com/macros/s/` |
| Authorization error during deploy | Make sure you chose **Anyone** (not "Anyone with Google account") in Step 3 |
| Duplicate rows in sheet | Delete duplicates manually in the sheet; the app de-duplicates by `id` on next sync |
