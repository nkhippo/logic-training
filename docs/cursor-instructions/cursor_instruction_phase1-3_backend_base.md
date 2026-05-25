# Cursor 実装指示書：BEサーバー基盤（Phase 1-3）

**作成日**: 2026-05-26  
**関連Issue**: #40  
**仕様書**: `docs/specification/specification_backend_base.md`

---

## 0. 作業前に必ず確認すること

- 仕様書 `specification_backend_base.md` を全文熟読すること
- 既存の `gas-script-v3.js` は **触らない**（並行存在させる）
- 新規ファイルはすべて `backend/` ディレクトリ以下に作成する
- `.env.local` は絶対に git commit しない

---

## 1. 作業概要

Node.js Express ベースのバックエンドサーバーを新規構築する。

### 実装範囲（この Issue の対象）
- `backend/` ディレクトリの新規作成
- `/health` エンドポイント
- `/api/generate-problem` エンドポイント（logic + thinking 両対応）
- `/api/score-answer` エンドポイント（logic + thinking 両対応）
- Google Sheets 連携（user_core 読み書き）
- エラーハンドリング共通ミドルウェア
- ユニットテスト・統合テスト
- Railway デプロイ設定

### 対象ファイル（すべて新規作成）

```
backend/
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
├── docker-compose.yml
├── src/
│   ├── index.js
│   ├── config/
│   │   ├── constants.js
│   │   └── claude-config.js
│   ├── api/
│   │   ├── generate-problem.js
│   │   └── score-answer.js
│   ├── services/
│   │   ├── claude-service.js
│   │   ├── validate-service.js
│   │   └── sheets-service.js
│   └── middleware/
│       └── error-handler.js
└── tests/
    ├── generate.test.js
    ├── score.test.js
    └── integration.test.js
```

---

## 2. package.json

```json
{
  "name": "thinkgrindai-backend",
  "version": "1.0.0",
  "description": "thinkgrindai backend server",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.0",
    "googleapis": "^140.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^7.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 3. .gitignore

```
node_modules/
.env.local
.env
*.log
coverage/
.DS_Store
```

---

## 4. .env.example

```
# サーバー
NODE_ENV=development
PORT=3000

# Claude API
CLAUDE_API_KEY=sk-ant-xxx...

# Google Sheets
# GOOGLE_SHEETS_CREDENTIALS はサービスアカウントのJSONをそのまま1行にした文字列
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"..."}
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# Railway (本番環境のみ自動設定)
# RAILWAY_ENVIRONMENT_NAME=production
```

---

## 5. src/index.js

```javascript
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const generateProblemRoute = require('./api/generate-problem');
const scoreAnswerRoute = require('./api/score-answer');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://thinkgrindai.vercel.app'
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    railway_app: 'thinkgrindai-be',
  });
});

// APIルート
app.use('/api/generate-problem', generateProblemRoute);
app.use('/api/score-answer', scoreAnswerRoute);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Endpoint not found', status: 404 });
});

// エラーハンドリング（最後に置く）
app.use(errorHandler);

// テスト時はサーバーを起動しない
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[thinkgrindai-be] Server running on port ${PORT}`);
  });
}

module.exports = app;
```

---

## 6. src/config/constants.js

```javascript
// 論理トレーニング タブ設定
const LOGIC_TABS = ['fill', 'summary', 'critique', 'ame'];

const LOGIC_TAB_CONFIG = {
  fill: {
    max_tokens: 500,
    prompt_instruction: '論述の中から重要な語句を1〜3箇所選び、「___」に置き換えた穴埋め問題を1問作成してください。穴埋め問題の本文のみを出力し、解答は含めないでください。',
  },
  summary: {
    max_tokens: 800,
    prompt_instruction: '以下のテーマについて200〜300字程度の論述を作成し、末尾に「この文章を50字以内で要約してください。」という指示文を付けてください。',
  },
  critique: {
    max_tokens: 1000,
    prompt_instruction: '以下のテーマについて、主張とその根拠を含む150〜250字の論述を作成し、末尾に「この主張の根拠は十分ですか？問題点があれば指摘してください。」という問いを付けてください。',
  },
  ame: {
    max_tokens: 1200,
    prompt_instruction: '以下のテーマについて、具体的な状況・数値・背景を含む200〜300字の状況説明を作成し、末尾に「この状況から、どのようなアクションを取るべきですか？空・雨・傘の形式で答えてください。」という問いを付けてください。',
  },
};

// 思考トレーニング タイプ設定
const THINKING_TYPES = ['type1', 'type2', 'type3', 'type4', 'type5', 'type6'];

const THINKING_TYPE_NAMES = {
  type1: 'ロジカルシンキング（MECE・ピラミッド構造）',
  type2: 'クリティカルシンキング（根拠検証・論理矛盾指摘）',
  type3: 'システムシンキング（相互関係・因果関係）',
  type4: 'デザインシンキング（問題定義・創造性）',
  type5: 'シナリオプランニング（未来予測・戦略立案）',
  type6: 'メタ認知（思考プロセスの自己観察）',
};

// 思考トレーニング レベル設定
const THINKING_LEVELS = [1, 2, 3, 4];

const THINKING_LEVEL_CONFIG = {
  1: {
    max_tokens: 500,
    difficulty: '基礎（定義・型を学ぶ）',
    prompt_instruction: 'フレームワークの定義や基本概念を問う基礎的な問題を1問作成してください。',
  },
  2: {
    max_tokens: 800,
    difficulty: '応用（型を使う）',
    prompt_instruction: '具体的な事例を提示し、フレームワークを用いた分析を求める問題を1問作成してください。',
  },
  3: {
    max_tokens: 1200,
    difficulty: '発展（型を組み合わせる）',
    prompt_instruction: '複数のフレームワークを組み合わせた複合的な分析を求める問題を1問作成してください。',
  },
  4: {
    max_tokens: 2000,
    difficulty: '実践（ビジネスに応用）',
    prompt_instruction: '実際のビジネス課題を想定し、フレームワークを実務に適用した改善案の提示を求める問題を1問作成してください。',
  },
};

// Claude API 温度設定
const TEMPERATURE = {
  generation: 0.9,
  scoring: 0.3,
};

module.exports = {
  LOGIC_TABS,
  LOGIC_TAB_CONFIG,
  THINKING_TYPES,
  THINKING_TYPE_NAMES,
  THINKING_LEVELS,
  THINKING_LEVEL_CONFIG,
  TEMPERATURE,
};
```

---

## 7. src/config/claude-config.js

```javascript
const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClaudeClient() {
  if (!client) {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set');
    }
    client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return client;
}

const MODEL = 'claude-sonnet-4-20250514';

module.exports = { getClaudeClient, MODEL };
```

---

## 8. src/services/claude-service.js

```javascript
const { getClaudeClient, MODEL } = require('../config/claude-config');
const {
  LOGIC_TAB_CONFIG,
  THINKING_TYPE_NAMES,
  THINKING_LEVEL_CONFIG,
  TEMPERATURE,
} = require('../config/constants');

/**
 * 問題生成（論理トレーニング）
 */
async function generateLogicProblem({ tab, theme }) {
  const client = getClaudeClient();
  const tabConfig = LOGIC_TAB_CONFIG[tab];

  const systemPrompt = `あなたは論理トレーニングアプリの教育コンテンツ生成エージェントです。
ユーザーの学習に役立つ質の高い問題を作成してください。
問題文のみを出力してください。余計な説明・前置き・解説は不要です。`;

  const userPrompt = `テーマ: ${theme}
タスク: ${tabConfig.prompt_instruction}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: tabConfig.max_tokens,
    temperature: TEMPERATURE.generation,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].text;
}

/**
 * 問題生成（思考トレーニング）
 */
async function generateThinkingProblem({ thinking_type, level, theme }) {
  const client = getClaudeClient();
  const levelConfig = THINKING_LEVEL_CONFIG[level];
  const typeName = THINKING_TYPE_NAMES[thinking_type];

  const systemPrompt = `あなたは思考トレーニングアプリの教育コンテンツ生成エージェントです。
指定された思考フレームワークと難易度レベルに合わせた問題を作成してください。
問題文のみを出力してください。余計な説明・前置き・解説は不要です。`;

  const userPrompt = `思考タイプ: ${typeName}
難易度: ${levelConfig.difficulty}
テーマ: ${theme}
タスク: ${levelConfig.prompt_instruction}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: levelConfig.max_tokens,
    temperature: TEMPERATURE.generation,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].text;
}

/**
 * 採点・評価（論理トレーニング）
 */
async function scoreLogicAnswer({ tab, original_problem, user_answer }) {
  const client = getClaudeClient();

  const systemPrompt = `あなたは論理トレーニングアプリの採点・フィードバック生成エージェントです。
ユーザーの回答を以下の3観点で評価してください。

評価観点:
- 論理的明確性（logic_clarity）: 主張が明確か、根拠は示されているか（0〜100）
- 完全性（completeness）: 問題の要求を満たしているか、漏れはないか（0〜100）
- 正確性（accuracy）: ファクトは正確か、論理矛盾はないか（0〜100）

必ず以下のJSON形式のみで出力してください（他のテキストは不要）:
{
  "score": <3観点の平均値（整数）>,
  "score_detail": {
    "logic_clarity": <数値>,
    "completeness": <数値>,
    "accuracy": <数値>
  },
  "feedback": "<総合的なフィードバックコメント>",
  "suggestions": ["<改善提案1>", "<改善提案2>"]
}`;

  const userPrompt = `問題: ${original_problem}

ユーザーの回答: ${user_answer}

上記の回答を評価してください。`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    temperature: TEMPERATURE.scoring,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();
  // JSON以外の前後テキストを除去して安全にパース
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude response is not valid JSON');
  return JSON.parse(jsonMatch[0]);
}

/**
 * 採点・評価（思考トレーニング）
 */
async function scoreThinkingAnswer({ thinking_type, level, original_problem, user_answer }) {
  const client = getClaudeClient();
  const typeName = THINKING_TYPE_NAMES[thinking_type];
  const levelConfig = THINKING_LEVEL_CONFIG[level];

  const systemPrompt = `あなたは思考トレーニングアプリの採点・フィードバック生成エージェントです。
ユーザーの回答を以下の4観点で評価してください。

評価観点:
- 論理的明確性（logic_clarity）: 主張が明確か、根拠は示されているか（0〜100）
- 完全性（completeness）: 問題の要求を満たしているか、漏れはないか（0〜100）
- 正確性（accuracy）: ファクトは正確か、論理矛盾はないか（0〜100）
- 創造性（creativity）: 新しい視点・工夫があるか（0〜100）

思考タイプ: ${typeName}
難易度: ${levelConfig.difficulty}

必ず以下のJSON形式のみで出力してください（他のテキストは不要）:
{
  "score": <4観点の平均値（整数）>,
  "score_detail": {
    "logic_clarity": <数値>,
    "completeness": <数値>,
    "accuracy": <数値>,
    "creativity": <数値>
  },
  "feedback": "<総合的なフィードバックコメント>",
  "suggestions": ["<改善提案1>", "<改善提案2>"]
}`;

  const userPrompt = `問題: ${original_problem}

ユーザーの回答: ${user_answer}

上記の回答を評価してください。`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    temperature: TEMPERATURE.scoring,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude response is not valid JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  generateLogicProblem,
  generateThinkingProblem,
  scoreLogicAnswer,
  scoreThinkingAnswer,
};
```

---

## 9. src/services/validate-service.js

```javascript
const { LOGIC_TABS, THINKING_TYPES, THINKING_LEVELS } = require('../config/constants');

/**
 * /api/generate-problem のリクエスト検証
 */
function validateGenerateRequest(body) {
  const errors = [];

  if (!body.service) errors.push('service is required');
  else if (!['logic', 'thinking'].includes(body.service)) errors.push('service must be "logic" or "thinking"');

  if (!body.theme || typeof body.theme !== 'string' || body.theme.trim() === '') {
    errors.push('theme is required');
  }

  if (body.service === 'logic') {
    if (!body.tab) errors.push('tab is required for logic service');
    else if (!LOGIC_TABS.includes(body.tab)) errors.push(`tab must be one of: ${LOGIC_TABS.join(', ')}`);
  }

  if (body.service === 'thinking') {
    if (!body.thinking_type) errors.push('thinking_type is required for thinking service');
    else if (!THINKING_TYPES.includes(body.thinking_type)) errors.push(`thinking_type must be one of: ${THINKING_TYPES.join(', ')}`);

    if (!body.level) errors.push('level is required for thinking service');
    else if (!THINKING_LEVELS.includes(Number(body.level))) errors.push(`level must be one of: ${THINKING_LEVELS.join(', ')}`);
  }

  return errors;
}

/**
 * /api/score-answer のリクエスト検証
 */
function validateScoreRequest(body) {
  const errors = [];

  if (!body.service) errors.push('service is required');
  else if (!['logic', 'thinking'].includes(body.service)) errors.push('service must be "logic" or "thinking"');

  if (!body.user_answer || typeof body.user_answer !== 'string' || body.user_answer.trim() === '') {
    errors.push('user_answer is required');
  }

  if (!body.context) {
    errors.push('context is required');
  } else {
    if (!body.context.original_problem) errors.push('context.original_problem is required');

    if (body.service === 'logic') {
      if (!body.context.tab) errors.push('context.tab is required for logic service');
      else if (!LOGIC_TABS.includes(body.context.tab)) errors.push(`context.tab must be one of: ${LOGIC_TABS.join(', ')}`);
    }

    if (body.service === 'thinking') {
      if (!body.context.thinking_type) errors.push('context.thinking_type is required');
      else if (!THINKING_TYPES.includes(body.context.thinking_type)) errors.push(`context.thinking_type must be one of: ${THINKING_TYPES.join(', ')}`);

      if (!body.context.level) errors.push('context.level is required');
      else if (!THINKING_LEVELS.includes(Number(body.context.level))) errors.push(`context.level must be one of: ${THINKING_LEVELS.join(', ')}`);
    }
  }

  return errors;
}

module.exports = { validateGenerateRequest, validateScoreRequest };
```

---

## 10. src/services/sheets-service.js

```javascript
const { google } = require('googleapis');

let sheetsClient = null;

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

// カラム定義（A列から順）
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
 * @returns {Object|null} ユーザーデータ or null
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
    // ヘッダー行をスキップ（1行目）
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
            try { return JSON.parse(rows[i][COLUMNS.preferences] || '{}'); }
            catch { return {}; }
          })(),
          _rowIndex: i + 1, // Sheets は1始まり
        };
      }
    }
    return null;
  } catch (err) {
    console.error('[sheets-service] getUserCore error:', err.message);
    throw { code: 'sheets_error', message: 'Failed to read user data from Google Sheets' };
  }
}

/**
 * 採点後にスコア・last_active を更新
 */
async function updateUserScore(user_id, service, new_score) {
  if (!user_id) return;
  try {
    const user = await getUserCore(user_id);
    if (!user) return; // ユーザーが存在しない場合はスキップ

    const sheets = getSheetsClient();
    const now = new Date().toISOString();

    let avg_score_col, problems_solved_col, avg_score_current, problems_solved_current;
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

    // 移動平均で更新
    const new_count = problems_solved_current + 1;
    const new_avg = Math.round(
      (avg_score_current * problems_solved_current + new_score) / new_count
    );

    // last_active と平均スコア・問題数を更新
    const rowNum = user._rowIndex;
    const updates = [
      {
        range: `${SHEET_NAME}!D${rowNum}`, // last_active
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
    // スコア更新失敗はサイレントに（採点結果は返す）
    console.error('[sheets-service] updateUserScore error:', err.message);
  }
}

// カラムインデックス → Sheets 列記号（A=0, B=1, ...）
function colLetter(index) {
  return String.fromCharCode(65 + index);
}

module.exports = { getUserCore, updateUserScore };
```

---

## 11. src/middleware/error-handler.js

```javascript
/**
 * Express エラーハンドリングミドルウェア
 * app.use() の最後に配置すること
 */
function errorHandler(err, req, res, next) {
  console.error('[error-handler]', err);

  // 既知のアプリケーションエラー（{ code, message, status } 形式）
  if (err.code) {
    return res.status(err.status || 503).json({
      error: err.code,
      message: err.message || 'An error occurred',
      status: err.status || 503,
      timestamp: new Date().toISOString(),
    });
  }

  // Claude API エラー
  if (err.name === 'AnthropicError' || err.constructor?.name?.includes('Anthropic')) {
    return res.status(503).json({
      error: 'claude_api_error',
      message: 'Claude API is temporarily unavailable. Please try again.',
      status: 503,
      timestamp: new Date().toISOString(),
    });
  }

  // 予期しないエラー
  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred.',
    status: 500,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
```

---

## 12. src/api/generate-problem.js

```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { validateGenerateRequest } = require('../services/validate-service');
const { generateLogicProblem, generateThinkingProblem } = require('../services/claude-service');
const { getUserCore } = require('../services/sheets-service');

router.post('/', async (req, res, next) => {
  try {
    // バリデーション
    const errors = validateGenerateRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'invalid_request',
        message: errors.join('; '),
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const { service, tab, thinking_type, level, theme, user_id } = req.body;

    // ユーザーデータ取得（任意。失敗しても問題生成は続ける）
    let userCore = null;
    if (user_id) {
      try {
        userCore = await getUserCore(user_id);
      } catch (e) {
        console.warn('[generate-problem] getUserCore failed, continuing without user data:', e.message);
      }
    }

    // 問題生成
    let content;
    const temperature_used = 0.9;
    let max_tokens_used;

    if (service === 'logic') {
      const { LOGIC_TAB_CONFIG } = require('../config/constants');
      max_tokens_used = LOGIC_TAB_CONFIG[tab].max_tokens;
      content = await generateLogicProblem({ tab, theme });
    } else {
      const { THINKING_LEVEL_CONFIG } = require('../config/constants');
      max_tokens_used = THINKING_LEVEL_CONFIG[Number(level)].max_tokens;
      content = await generateThinkingProblem({
        thinking_type,
        level: Number(level),
        theme,
      });
    }

    res.json({
      problem_id: uuidv4(),
      content,
      context: {
        theme,
        type: service === 'logic' ? tab : thinking_type,
        level: level ? Number(level) : null,
        instructions: null, // フロントエンド側で管理
      },
      metadata: {
        created_at: new Date().toISOString(),
        model: 'claude-sonnet-4-20250514',
        temperature: temperature_used,
        max_tokens: max_tokens_used,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

---

## 13. src/api/score-answer.js

```javascript
const express = require('express');
const router = express.Router();
const { validateScoreRequest } = require('../services/validate-service');
const { scoreLogicAnswer, scoreThinkingAnswer } = require('../services/claude-service');
const { updateUserScore } = require('../services/sheets-service');

router.post('/', async (req, res, next) => {
  try {
    // バリデーション
    const errors = validateScoreRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'invalid_request',
        message: errors.join('; '),
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const { service, user_answer, user_id, context } = req.body;
    const { original_problem, tab, thinking_type, level } = context;

    // 採点
    let scoreResult;
    if (service === 'logic') {
      scoreResult = await scoreLogicAnswer({ tab, original_problem, user_answer });
    } else {
      scoreResult = await scoreThinkingAnswer({
        thinking_type,
        level: Number(level),
        original_problem,
        user_answer,
      });
    }

    // Google Sheets 更新（非同期・失敗してもレスポンスに影響しない）
    if (user_id) {
      updateUserScore(user_id, service, scoreResult.score).catch((e) =>
        console.error('[score-answer] updateUserScore failed:', e.message)
      );
    }

    res.json({
      score: scoreResult.score,
      score_detail: scoreResult.score_detail,
      feedback: scoreResult.feedback,
      suggestions: scoreResult.suggestions,
      metadata: {
        evaluated_at: new Date().toISOString(),
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3,
        max_tokens: 1000,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

---

## 14. tests/generate.test.js

```javascript
const request = require('supertest');

// テスト用に Claude / Sheets をモック
jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn().mockResolvedValue('テスト用穴埋め問題文'),
  generateThinkingProblem: jest.fn().mockResolvedValue('テスト用思考問題文'),
  scoreLogicAnswer: jest.fn(),
  scoreThinkingAnswer: jest.fn(),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('POST /api/generate-problem', () => {
  it('should generate a logic fill problem', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'fill', theme: 'AI倫理' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('problem_id');
    expect(res.body).toHaveProperty('content', 'テスト用穴埋め問題文');
    expect(res.body.context.type).toBe('fill');
  });

  it('should generate a thinking problem', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'thinking', thinking_type: 'type1', level: 2, theme: 'DX戦略' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content', 'テスト用思考問題文');
    expect(res.body.context.type).toBe('type1');
  });

  it('should return 400 if service is missing', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ tab: 'fill', theme: 'AI倫理' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_request');
  });

  it('should return 400 if tab is invalid', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'invalid_tab', theme: 'AI倫理' });

    expect(res.status).toBe(400);
  });
});
```

---

## 15. tests/score.test.js

```javascript
const request = require('supertest');

jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn(),
  generateThinkingProblem: jest.fn(),
  scoreLogicAnswer: jest.fn().mockResolvedValue({
    score: 80,
    score_detail: { logic_clarity: 85, completeness: 75, accuracy: 80 },
    feedback: 'よくできています',
    suggestions: ['もう少し具体例を加えるとよい'],
  }),
  scoreThinkingAnswer: jest.fn().mockResolvedValue({
    score: 75,
    score_detail: { logic_clarity: 80, completeness: 70, accuracy: 75, creativity: 75 },
    feedback: '良い分析です',
    suggestions: ['別の視点も取り入れてみてください'],
  }),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('POST /api/score-answer', () => {
  it('should score a logic answer', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        user_answer: '回答テキスト',
        context: { original_problem: '問題文', tab: 'fill' },
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(80);
    expect(res.body).toHaveProperty('feedback');
    expect(res.body).toHaveProperty('suggestions');
    expect(res.body).toHaveProperty('metadata');
  });

  it('should score a thinking answer', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'thinking',
        user_answer: '回答テキスト',
        context: { original_problem: '問題文', thinking_type: 'type1', level: 2 },
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(75);
    expect(res.body.score_detail).toHaveProperty('creativity');
  });

  it('should return 400 if user_answer is missing', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        context: { original_problem: '問題文', tab: 'fill' },
      });

    expect(res.status).toBe(400);
  });
});
```

---

## 16. tests/integration.test.js

```javascript
const request = require('supertest');

jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn().mockResolvedValue('穴埋め問題：___はAIの倫理原則のひとつである。'),
  generateThinkingProblem: jest.fn().mockResolvedValue('思考問題：MECEを用いて分析せよ。'),
  scoreLogicAnswer: jest.fn().mockResolvedValue({
    score: 85,
    score_detail: { logic_clarity: 90, completeness: 80, accuracy: 85 },
    feedback: '正確な回答です',
    suggestions: [],
  }),
  scoreThinkingAnswer: jest.fn().mockResolvedValue({
    score: 78,
    score_detail: { logic_clarity: 80, completeness: 75, accuracy: 78, creativity: 79 },
    feedback: '丁寧な分析です',
    suggestions: ['もう一段深掘りすると良い'],
  }),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('Full flow: generate → score', () => {
  it('logic: fill problem generate → score', async () => {
    // Step 1: 問題生成
    const genRes = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'fill', theme: 'AI倫理' });
    expect(genRes.status).toBe(200);

    // Step 2: 採点
    const scoreRes = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        user_answer: '透明性',
        context: { original_problem: genRes.body.content, tab: 'fill' },
      });
    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.score).toBeGreaterThanOrEqual(0);
    expect(scoreRes.body.score).toBeLessThanOrEqual(100);
  });

  it('thinking: type1 level2 generate → score', async () => {
    const genRes = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'thinking', thinking_type: 'type1', level: 2, theme: 'DX戦略' });
    expect(genRes.status).toBe(200);

    const scoreRes = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'thinking',
        user_answer: 'MECEを用いると...',
        context: { original_problem: genRes.body.content, thinking_type: 'type1', level: 2 },
      });
    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body).toHaveProperty('score_detail');
    expect(scoreRes.body.score_detail).toHaveProperty('creativity');
  });
});

describe('Health check', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

---

## 17. README.md

```markdown
# thinkgrindai-backend

Node.js Express ベースのバックエンドサーバー。Claude API + Google Sheets 連携。

## セットアップ

```bash
cd backend
cp .env.example .env.local
# .env.local に CLAUDE_API_KEY / GOOGLE_SHEETS_CREDENTIALS / GOOGLE_SHEETS_ID を記入
npm install
npm run dev
```

## API

- `GET /health` — ヘルスチェック
- `POST /api/generate-problem` — 問題生成
- `POST /api/score-answer` — 採点・評価

詳細は `docs/specification/specification_backend_base.md` を参照。

## テスト

```bash
npm test
```

## デプロイ

Railway に接続済み。`main` への push で自動デプロイ。
```

---

## 18. 実装後の確認手順

### ローカル動作確認

```bash
cd backend
npm install
npm run dev
```

以下を curl または Postman で確認すること：

**1. ヘルスチェック**
```bash
curl http://localhost:3000/health
# → {"status":"ok","version":"1.0.0","railway_app":"thinkgrindai-be"}
```

**2. 問題生成（logic/fill）**
```bash
curl -X POST http://localhost:3000/api/generate-problem \
  -H "Content-Type: application/json" \
  -d '{"service":"logic","tab":"fill","theme":"AI倫理"}'
# → {"problem_id":"...", "content":"...", ...}
```

**3. 採点（logic/fill）**
```bash
curl -X POST http://localhost:3000/api/score-answer \
  -H "Content-Type: application/json" \
  -d '{"service":"logic","user_answer":"透明性","context":{"original_problem":"___はAIの原則のひとつ","tab":"fill"}}'
# → {"score":80, "feedback":"...", ...}
```

**4. テスト実行**
```bash
npm test
# 全テスト PASS を確認
```

### Railway デプロイ確認

1. `backend/` を git push
2. Railway ダッシュボードでデプロイログを確認
3. `https://<your-app>.up.railway.app/health` にアクセスして `{"status":"ok"}` を確認

---

## 19. PR 作成時の記載事項

- 実装ファイル一覧
- `npm test` の結果スクリーンショットまたはログ
- ローカルでの `/health` / `/api/generate-problem` / `/api/score-answer` の動作確認結果
- Railway デプロイ URL（設定済みの場合）
- 既知の問題・TODO（あれば）

**Fixes #40**

---

## 注意事項

- `gas-script-v3.js` は一切変更しない
- `.env.local` は絶対に commit しない（`.gitignore` に含まれていることを必ず確認）
- `GOOGLE_SHEETS_CREDENTIALS` は JSON を1行の文字列にして環境変数に設定する
  （例: `export GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'`）
- Claude API のモデル名は `claude-sonnet-4-20250514` を使用（`claude-sonnet-4-6` は旧識別子）
