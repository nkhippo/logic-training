const { google } = require('googleapis');

let sheetsClient = null;

/**
 * Google Sheets API クライアントを取得する
 * @returns {import('googleapis').sheets_v4.Sheets}
 */
function getSheetsClient() {
  if (!sheetsClient) {
    const credentialsRaw = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentialsRaw) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS is not set');
    }
    const credentials = JSON.parse(credentialsRaw);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

const SHEET_NAME = 'user_core';
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

const COLUMNS = {
  user_id: 0,
  name: 1,
  created_at: 2,
  last_active: 3,
  logic_problems_solved: 4,
  logic_avg_score: 5,
  thinking_problems_solved: 6,
  thinking_avg_score: 7,
  current_level: 8,
  preferences: 9,
};

/**
 * user_id で user_core を取得
 * @param {string} user_id
 * @returns {Promise<object|null>}
 */
async function getUserCore(user_id) {
  if (!user_id) return null;
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
    });
    const rows = res.data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][COLUMNS.user_id] === user_id) {
        return {
          user_id: rows[i][COLUMNS.user_id],
          name: rows[i][COLUMNS.name],
          created_at: rows[i][COLUMNS.created_at],
          last_active: rows[i][COLUMNS.last_active],
          logic_problems_solved: Number(rows[i][COLUMNS.logic_problems_solved]) || 0,
          logic_avg_score: Number(rows[i][COLUMNS.logic_avg_score]) || 0,
          thinking_problems_solved: Number(rows[i][COLUMNS.thinking_problems_solved]) || 0,
          thinking_avg_score: Number(rows[i][COLUMNS.thinking_avg_score]) || 0,
          current_level: Number(rows[i][COLUMNS.current_level]) || 1,
          preferences: (() => {
            try {
              return JSON.parse(rows[i][COLUMNS.preferences] || '{}');
            } catch {
              return {};
            }
          })(),
          _rowIndex: i + 1,
        };
      }
    }
    return null;
  } catch (err) {
    // eslint-disable-next-line no-console -- sheets error log
    console.error('[sheets-service] getUserCore error:', err.message);
    throw { code: 'sheets_error', message: 'Failed to read user data from Google Sheets', status: 503 };
  }
}

/**
 * カラムインデックスを Sheets 列記号に変換（A=0）
 * @param {number} index
 * @returns {string}
 */
function colLetter(index) {
  return String.fromCharCode(65 + index);
}

/**
 * 採点後にスコア・last_active を更新
 * @param {string} user_id
 * @param {'logic'|'thinking'} service
 * @param {number} new_score
 */
async function updateUserScore(user_id, service, new_score) {
  if (!user_id) return;
  try {
    const user = await getUserCore(user_id);
    if (!user) return;

    const sheets = getSheetsClient();
    const now = new Date().toISOString();

    let avg_score_col;
    let problems_solved_col;
    let avg_score_current;
    let problems_solved_current;

    if (service === 'logic') {
      avg_score_col = COLUMNS.logic_avg_score;
      problems_solved_col = COLUMNS.logic_problems_solved;
      avg_score_current = user.logic_avg_score;
      problems_solved_current = user.logic_problems_solved;
    } else {
      avg_score_col = COLUMNS.thinking_avg_score;
      problems_solved_col = COLUMNS.thinking_problems_solved;
      avg_score_current = user.thinking_avg_score;
      problems_solved_current = user.thinking_problems_solved;
    }

    const new_count = problems_solved_current + 1;
    const new_avg = Math.round(
      (avg_score_current * problems_solved_current + new_score) / new_count
    );

    const rowNum = user._rowIndex;
    const updates = [
      {
        range: `${SHEET_NAME}!D${rowNum}`,
        values: [[now]],
      },
      {
        range: `${SHEET_NAME}!${colLetter(avg_score_col)}${rowNum}`,
        values: [[new_avg]],
      },
      {
        range: `${SHEET_NAME}!${colLetter(problems_solved_col)}${rowNum}`,
        values: [[new_count]],
      },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console -- sheets error log
    console.error('[sheets-service] updateUserScore error:', err.message);
  }
}

module.exports = { getUserCore, updateUserScore };
