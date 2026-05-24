/**
 * Logic Training — Google Apps Script v3
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * 確認: WebアプリURLに ?ping=1 を付けると { "version": 3 } が返る
 *
 * Spreadsheet: bind this script to your spreadsheet (Extensions > Apps Script)
 * Sheets:
 *   fill     — id, theme, diff, date, text, answers, hints, feedback, userAnswers, lang
 *   summary  — id, theme, diff, date, text, questions, ratio, lang
 *   critique — id, theme, diff, date, text, questions, feedback, form, lang
 *   ame      — id, theme, diff, date, law, article, constraint, questions, feedback, form, lang
 *   kibari   — id, theme, diff, scene, date, industry, situation, readers, points, constraint, writeInstruction, rewriteInstruction, openingPhrase, closingPhrase, firstAnswer, feedback, lang
 *   thinking — id, core, diff, level, date, industry, situation, questions, user_core, theme, persona_snapshot, lang
 *
 * ※「要約」「穴埋め」タブは v3 では作りません。残っている場合は削除してください。
 */

const GAS_VERSION = 3;
const FILL_COLS = ['id', 'theme', 'diff', 'date', 'industry', 'text', 'answers', 'hints', 'feedback', 'userAnswers', 'lang'];
const SUMMARY_COLS = ['id', 'theme', 'diff', 'date', 'industry', 'text', 'questions', 'ratio', 'lang'];
const CRITIQUE_COLS = ['id', 'theme', 'diff', 'date', 'industry', 'text', 'questions', 'feedback', 'form', 'lang'];
const AME_COLS = ['id', 'theme', 'diff', 'date', 'industry', 'law', 'article', 'constraint', 'questions', 'feedback', 'form', 'lang'];
const KIBARI_COLS = ['id', 'theme', 'diff', 'scene', 'date', 'industry', 'situation', 'readers', 'points', 'constraint', 'writeInstruction', 'rewriteInstruction', 'openingPhrase', 'closingPhrase', 'firstAnswer', 'feedback', 'lang'];
const THINKING_COLS = ['id', 'core', 'diff', 'level', 'date', 'industry', 'situation', 'questions', 'user_core', 'theme', 'persona_snapshot', 'lang'];
/** 旧シート名（読み書きは fill / summary / critique / ame） */
const LEGACY_SHEET_NAMES = {
  fill: ['穴埋め'],
  summary: ['要約'],
  critique: ['批判読み'],
  ame: ['空雨傘', '雨空傘']
};

function getSs_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureHeaders_(sh, cols) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols);
    return;
  }
  const width = Math.max(sh.getLastColumn(), cols.length);
  let header = sh.getRange(1, 1, 1, width).getValues()[0].map(String);
  while (header.length && header[header.length - 1] === '') header.pop();
  if (!header.length || header[0] !== cols[0]) {
    sh.insertRowBefore(1);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    return;
  }
  if (header.length < cols.length) {
    const merged = cols.map((c, i) => (i < header.length && header[i] ? header[i] : c));
    sh.getRange(1, 1, 1, cols.length).setValues([merged]);
  }
}

function getSh_(name, cols) {
  const ss = getSs_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(cols);
    return sh;
  }
  ensureHeaders_(sh, cols);
  return sh;
}

function rowScore_(o, cols) {
  return cols.reduce((n, c) => n + (o[c] !== undefined && o[c] !== null && String(o[c]) !== '' ? 1 : 0), 0);
}

function colsForLogical_(logical) {
  if (logical === 'summary') return SUMMARY_COLS;
  if (logical === 'critique') return CRITIQUE_COLS;
  if (logical === 'ame') return AME_COLS;
  if (logical === 'kibari') return KIBARI_COLS;
  if (logical === 'thinking') return THINKING_COLS;
  return FILL_COLS;
}

function sheetNameForLogical_(logical) {
  if (logical === 'summary') return 'summary';
  if (logical === 'critique') return 'critique';
  if (logical === 'ame') return 'ame';
  if (logical === 'kibari') return 'kibari';
  if (logical === 'thinking') return 'thinking';
  return 'fill';
}

function readSheetRows_(sheetName, logical) {
  const cols = colsForLogical_(logical);
  const sh = getSs_().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  ensureHeaders_(sh, cols);
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  return values.slice(1)
    .filter((r) => r[0] !== '' && r[0] !== null && r[0] !== undefined)
    .map((r) => {
      let o = rowToObj_(headers, r);
      if (logical === 'summary') o = normalizeSummaryRow_(o);
      if (logical === 'critique') o = normalizeCritiqueRow_(o);
      return o;
    });
}

function readAllRows_(logical) {
  const cols = colsForLogical_(logical);
  const sheetName = sheetNameForLogical_(logical);
  const legacy = LEGACY_SHEET_NAMES[logical] || [];
  const names = [sheetName].concat(legacy);
  const rows = [];
  names.forEach((name) => {
    readSheetRows_(name, logical).forEach((row) => rows.push(row));
  });
  const byId = {};
  rows.forEach((o) => {
    const id = String(o.id);
    const score = logical === 'critique' ? critiqueRowScore_(o) : rowScore_(o, cols);
    const prev = byId[id];
    const prevScore = prev ? (logical === 'critique' ? critiqueRowScore_(prev) : rowScore_(prev, cols)) : -1;
    if (!prev || score > prevScore) {
      byId[id] = o;
    }
  });
  return Object.keys(byId)
    .map((id) => byId[id])
    .sort((a, b) => Number(b.id) - Number(a.id));
}

function rowToObj_(headers, row) {
  const o = {};
  headers.forEach((h, i) => {
    o[h] = row[i] !== undefined && row[i] !== null ? row[i] : '';
  });
  return o;
}

/** 旧7列・ヘッダー typo などでずれた summary 行を補正 */
function normalizeSummaryRow_(o) {
  if (o.rang && !o.lang) o.lang = o.rang;
  const q = String(o.questions || '').trim();
  const looksLikeRatio = q && /^0?\.\d+$/.test(q) && !q.startsWith('[') && !q.startsWith('{');
  if (looksLikeRatio && !o.ratio) {
    o.ratio = q;
    o.questions = '';
  }
  return o;
}

/** 列ずれ・旧データで questions / text が入れ替わった critique 行を補正 */
function normalizeCritiqueRow_(o) {
  if (o.rang && !o.lang) o.lang = o.rang;
  let text = String(o.text || '').trim();
  let questions = String(o.questions || '').trim();
  const looksLikeJsonArray = (s) => s && (s.startsWith('[') || s.startsWith('{'));
  if (looksLikeJsonArray(text) && !looksLikeJsonArray(questions)) {
    questions = text;
    text = '';
  }
  if (!text && questions && !looksLikeJsonArray(questions) && questions.length > 120) {
    text = questions;
    questions = '';
  }
  o.text = text;
  o.questions = questions;
  return o;
}

function critiqueRowScore_(o) {
  let n = rowScore_(o, CRITIQUE_COLS);
  const q = String(o.questions || '').trim();
  if (q.startsWith('[') || q.startsWith('{')) n += 20;
  if (String(o.feedback || '').trim()) n += 10;
  return n;
}

function doGet(e) {
  if (String(e.parameter.ping || '') === '1') {
    return jsonOut_({
      version: GAS_VERSION,
      fillCols: FILL_COLS,
      summaryCols: SUMMARY_COLS,
      critiqueCols: CRITIQUE_COLS,
      ameCols: AME_COLS,
      kibariCols: KIBARI_COLS,
      thinkingCols: THINKING_COLS
    });
  }
  const sheetName = String(e.parameter.sheet || 'fill').toLowerCase();
  if (sheetName === 'summary') return jsonOut_(readAllRows_('summary'));
  if (sheetName === 'critique') return jsonOut_(readAllRows_('critique'));
  if (sheetName === 'ame') return jsonOut_(readAllRows_('ame'));
  if (sheetName === 'kibari') return jsonOut_(readAllRows_('kibari'));
  if (sheetName === 'thinking') return jsonOut_(readAllRows_('thinking'));
  return jsonOut_(readAllRows_('fill'));
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
  } else if (sheet === 'critique') {
    writeCritique_(data);
  } else if (sheet === 'ame') {
    writeAme_(data);
  } else if (sheet === 'kibari') {
    writeKibari_(data);
  } else if (sheet === 'thinking') {
    writeThinking_(data);
  } else {
    writeFill_(data);
  }
  return jsonOut_({ ok: true, id: data.id, version: GAS_VERSION });
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
  const text = String(data.text || '').trim();
  const questions = data.questions;
  const hasQ = Array.isArray(questions)
    ? questions.length > 0
    : (typeof questions === 'string' && questions.trim().length > 2);
  if (!text || !hasQ) {
    throw new Error('summary requires non-empty text and questions (v3 schema)');
  }
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

function writeCritique_(data) {
  const questions = data.questions;
  const hasQ = Array.isArray(questions)
    ? questions.length > 0
    : (typeof questions === 'string' && questions.trim().length > 2);
  if (!hasQ) {
    throw new Error('critique requires non-empty questions (v3 schema)');
  }
  const sh = getSh_('critique', CRITIQUE_COLS);
  const row = CRITIQUE_COLS.map(c => {
    if (c === 'questions') {
      return typeof data.questions === 'string'
        ? data.questions
        : JSON.stringify(data.questions || []);
    }
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}

function writeAme_(data) {
  const questions = data.questions;
  const hasQ = Array.isArray(questions)
    ? questions.length > 0
    : (typeof questions === 'string' && questions.trim().length > 2);
  if (!hasQ) {
    throw new Error('ame requires non-empty questions (v3 schema)');
  }
  const sh = getSh_('ame', AME_COLS);
  const row = AME_COLS.map(c => {
    if (c === 'questions') {
      return typeof data.questions === 'string'
        ? data.questions
        : JSON.stringify(data.questions || []);
    }
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}

function writeKibari_(data) {
  const sh = getSh_('kibari', KIBARI_COLS);
  const row = KIBARI_COLS.map(c => {
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}

function writeThinking_(data) {
  const sh = getSh_('thinking', THINKING_COLS);
  const row = THINKING_COLS.map(c => {
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}

function deleteById_(sheetName, id) {
  const s = String(sheetName).toLowerCase();
  let logical = 'fill';
  if (s === 'summary') logical = 'summary';
  else if (s === 'critique') logical = 'critique';
  else if (s === 'ame') logical = 'ame';
  else if (s === 'kibari') logical = 'kibari';
  else if (s === 'thinking') logical = 'thinking';
  const names = [sheetNameForLogical_(logical)].concat(LEGACY_SHEET_NAMES[logical] || []);
  const ss = getSs_();
  names.forEach((name) => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;
    const values = sh.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (String(values[i][0]) === String(id)) {
        sh.deleteRow(i + 1);
      }
    }
  });
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
