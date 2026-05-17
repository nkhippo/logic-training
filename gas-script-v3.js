/**
 * Logic Training — Google Apps Script v3
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Spreadsheet: bind this script to your spreadsheet (Extensions > Apps Script)
 * Sheets (auto-created if missing):
 *   fill    — id, theme, diff, date, text, answers, hints, feedback, userAnswers, lang
 *   summary — id, theme, diff, date, text, questions, ratio
 */

const FILL_COLS = ['id', 'theme', 'diff', 'date', 'text', 'answers', 'hints', 'feedback', 'userAnswers', 'lang'];
const SUMMARY_COLS = ['id', 'theme', 'diff', 'date', 'text', 'questions', 'ratio'];

function getSs_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSh_(name, cols) {
  const ss = getSs_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(cols);
    return sh;
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols);
    return sh;
  }
  const header = sh.getRange(1, 1, 1, cols.length).getValues()[0].map(String);
  if (header[0] !== cols[0]) {
    sh.insertRowBefore(1, cols);
  }
  return sh;
}

function rowToObj_(headers, row) {
  const o = {};
  headers.forEach((h, i) => {
    o[h] = row[i] !== undefined && row[i] !== null ? row[i] : '';
  });
  return o;
}

function doGet(e) {
  const sheetName = String(e.parameter.sheet || 'fill').toLowerCase();
  const isSummary = sheetName === 'summary';
  const cols = isSummary ? SUMMARY_COLS : FILL_COLS;
  const sh = getSh_(isSummary ? 'summary' : 'fill', cols);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) {
    return jsonOut_([]);
  }
  const headers = values[0].map(String);
  const rows = values.slice(1)
    .filter(r => r[0] !== '' && r[0] !== null && r[0] !== undefined)
    .map(r => rowToObj_(headers, r))
    .reverse();
  return jsonOut_(rows);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === 'delete') {
    deleteById_(data.sheet, data.id);
    return jsonOut_({ ok: true });
  }
  const sheet = String(data.sheet || 'fill').toLowerCase();
  if (sheet === 'summary') {
    writeSummary_(data);
  } else {
    writeFill_(data);
  }
  return jsonOut_({ ok: true, id: data.id });
}

function writeFill_(data) {
  const sh = getSh_('fill', FILL_COLS);
  const row = FILL_COLS.map(c => {
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}

function writeSummary_(data) {
  const sh = getSh_('summary', SUMMARY_COLS);
  const row = SUMMARY_COLS.map(c => {
    if (c === 'questions') {
      return typeof data.questions === 'string'
        ? data.questions
        : JSON.stringify(data.questions || []);
    }
    const v = data[c];
    return v === undefined || v === null ? '' : v;
  });
  sh.appendRow(row);
}

function deleteById_(sheetName, id) {
  const isSummary = String(sheetName).toLowerCase() === 'summary';
  const cols = isSummary ? SUMMARY_COLS : FILL_COLS;
  const sh = getSh_(isSummary ? 'summary' : 'fill', cols);
  const values = sh.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
    }
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
