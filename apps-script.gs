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
          id:       String(r[0]),
          date:     formatDate(r[1]),
          item:     String(r[2]),
          price:    Number(r[3]),
          km:       Number(r[4]),
          category: String(r[5]),
          comment:  String(r[6] || ''),
          source:   String(r[7] || 'sheets')
        });
      }
    }
    return response({ ok: true, data: rows });
  } catch(err) {
    return response({ ok: false, error: err.message });
  }
}

// Normalize any date value to YYYY-MM-DD string
// Handles both JS Date objects (from Google Sheets) and plain strings
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    ensureHeader(sheet);

    if (body.action === 'append') {
      sheet.appendRow(toRow(body.entry));

    } else if (body.action === 'batchAppend') {
      var entries = body.entries;
      var rows = [];
      for (var j = 0; j < entries.length; j++) {
        rows.push(toRow(entries[j]));
      }
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
      }

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
