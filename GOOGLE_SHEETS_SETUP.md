# Google Sheets Sync — Setup Guide (Apps Script)

No Google Cloud project, no OAuth, no Client IDs.  
Just a Google Sheet + a 20-line script + one URL pasted in Settings.

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
4. Paste the entire script below:

```
var SHEET_NAME = 'Sheet1';
var HEADERS = ['id','date','item','price','km','category','comment','source'];

function doGet() {
  try {
    var sheet = getSheet();
    ensureHeader(sheet);
    var values = sheet.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      if (r[0]) {
        rows.push({
          id: String(r[0]),
          date: String(r[1]),
          item: String(r[2]),
          price: Number(r[3]),
          km: Number(r[4]),
          category: String(r[5]),
          comment: String(r[6] || ''),
          source: String(r[7] || 'sheets')
        });
      }
    }
    return response({ ok: true, data: rows });
  } catch(err) {
    return response({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    ensureHeader(sheet);

    if (body.action === 'append') {
      sheet.appendRow(toRow(body.entry));

    } else if (body.action === 'update') {
      var data = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.entry.id)) {
          sheet.getRange(i+1, 1, 1, 8).setValues([toRow(body.entry)]);
          found = true;
          break;
        }
      }
      if (!found) sheet.appendRow(toRow(body.entry));

    } else if (body.action === 'delete') {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return response({ ok: true });
  } catch(err) {
    return response({ ok: false, error: err.message });
  }
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function ensureHeader(sheet) {
  var first = sheet.getRange(1, 1, 1, 8).getValues()[0];
  if (first[0] !== 'id') {
    sheet.getRange(1, 1, 1, 8).setValues([HEADERS]);
  }
}

function toRow(e) {
  return [e.id, e.date, e.item, e.price || 0, e.km || 0, e.category, e.comment || '', e.source || 'manual'];
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
```

5. Click the 💾 **Save** icon (or Ctrl+S) — name the project `Car Maintenance Tracker`

---

## Step 3 — Deploy as Web App

1. Click the blue **Deploy** button (top right) → **New deployment**
2. Click the ⚙️ gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Description:** `v1`
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

That's it — all 123 records are pushed to your sheet automatically on first sync.

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

## Re-deploying after script changes

If you ever edit the script, you must create a **new deployment** (not update
the existing one) to get an updated URL — or use **Manage deployments** to
create a new version of the same deployment.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SyntaxError on line 1 | You accidentally copied the ` ``` ` fence from the markdown — delete everything in the editor and paste only the code between the fences |
| Badge stays Offline | Check internet connection |
| Badge shows Synced but sheet is empty | Wait 10 seconds and pull-to-refresh; first sync uploads all 123 records which takes a moment |
| "Apps Script URL" validation error | Make sure the URL starts with `https://script.google.com/macros/s/` |
| Authorization error during deploy | Make sure you chose **Anyone** (not "Anyone with Google account") in Step 3 |
| Duplicate rows in sheet | Delete duplicates manually; the app de-duplicates by `id` on next sync |
