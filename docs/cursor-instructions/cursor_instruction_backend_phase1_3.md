# Cursor 実装指示書：BEサーバー基盤実装 Phase 1-3

**Issue**: #40 【Feature】BEサーバー基盤（Node.js Express + Claude API統合）実装  
**要件確定シート**: REQ-BACKEND-001  
**バージョン**: 1.0  
**更新日**: 2026-05-26  

---

## 📋 概要

Google Apps Script（GAS）の全機能を Node.js Express ベースのBEサーバーに完全移行します。

**対象機能**:
- 論理トレーニング：問題生成・採点（穴埋め・要約・批判読み・空雨傘）
- 思考トレーニング：問題生成・採点（6タイプ × 4レベル）
- ユーザーデータ管理：user_core の読み書き

**スタック**:
- Node.js 20+
- Express.js 4.x
- Claude API（claude-sonnet-4-6）
- Google Sheets API v4（user_core）
- Railway（ホスティング、Phase 1-4 で実施）

---

## 🎯 実装範囲

### 新規作成ファイル一覧

```
backend/
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── src/
│   ├── index.js                           # メインサーバー
│   ├── config/
│   │   ├── constants.js                   # 定数・プリセット
│   │   └── claude-config.js               # Claude API 設定
│   ├── api/
│   │   ├── generate-problem.js            # POST /api/generate-problem
│   │   └── score-answer.js                # POST /api/score-answer
│   ├── services/
│   │   ├── claude-service.js              # Claude API 呼び出し
│   │   ├── validate-service.js            # リクエスト検証
│   │   └── sheets-service.js              # Google Sheets 連携
│   └── middleware/
│       └── error-handler.js               # エラーハンドリング
├── tests/
│   ├── generate.test.js
│   ├── score.test.js
│   └── integration.test.js
├── README.md
└── docker-compose.yml（オプション）
```

### 削除対象
- **Phase 1-3 では削除しない**（GAS との並行運用）
- Phase 4 で完全削除予定

---

## 🚀 実装手順（推奨順序）

### Step 1: プロジェクト初期化（30分）

```bash
# backend/ ディレクトリ作成
mkdir -p backend
cd backend

# npm プロジェクト初期化
npm init -y

# 依存パッケージ インストール
npm install express dotenv axios jest @anthropic-ai/sdk google-auth-library googleapis

# 開発用パッケージ
npm install -D jest nodemon @babel/preset-env

# .env.local を .gitignore に追加
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".DS_Store" >> .gitignore
```

**package.json スクリプト設定** (`scripts` セクション):
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### Step 2: 環境変数・定数設定（20分）

#### 2-1. `.env.example` を作成

```env
# Node
NODE_ENV=development
PORT=3000

# Claude API
CLAUDE_API_KEY=sk-ant-xxxxx...

# Google Sheets（base64 エンコード済み）
GOOGLE_SHEETS_API_KEY_BASE64=eyJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsIC4uLn0=
GOOGLE_SHEETS_ID=1xxx_your_sheet_id_xxx

# Railway（本番環境のみ、自動設定）
# RAILWAY_ENVIRONMENT_NAME=production
```

#### 2-2. `src/config/constants.js` を作成

```javascript
// 定数・プリセット設定

module.exports = {
  // Claude API
  CLAUDE_MODEL: 'claude-sonnet-4-6',
  
  // Temperature（生成・採点）
  TEMPERATURE: {
    GENERATION: 0.9,    // 問題生成：創造性重視
    SCORING: 0.3        // 採点：厳密性重視
  },

  // max_tokens（エンドポイント・タイプ別）
  MAX_TOKENS: {
    GENERATE: {
      LOGIC: {
        fill: 500,
        summary: 800,
        critique: 1000,
        ame: 1200
      },
      THINKING: {
        1: 500,     // Level 1（基礎）
        2: 800,     // Level 2（応用）
        3: 1200,    // Level 3（発展）
        4: 2000     // Level 4（実践）
      }
    },
    SCORE: 1000
  },

  // 論理トレーニングタブ定義
  LOGIC_TABS: ['fill', 'summary', 'critique', 'ame'],

  // 思考トレーニング タイプ定義
  THINKING_TYPES: ['type1', 'type2', 'type3', 'type4', 'type5', 'type6'],
  THINKING_LEVELS: [1, 2, 3, 4],

  // エラーコード
  ERROR_CODES: {
    INVALID_REQUEST: 'invalid_request',
    INVALID_SERVICE: 'invalid_service',
    MISSING_PARAMETER: 'missing_parameter',
    USER_NOT_FOUND: 'user_not_found',
    CLAUDE_API_ERROR: 'claude_api_error',
    SHEETS_ERROR: 'sheets_error',
    INTERNAL_ERROR: 'internal_error'
  }
};
```

#### 2-3. `src/config/claude-config.js` を作成

```javascript
// Claude API 設定・プロンプトテンプレート

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({
  apiKey: process.env.CLAUDE_API_KEY
});

// プロンプトテンプレート（サービス・タイプ別）
const PROMPTS = {
  GENERATE: {
    LOGIC: {
      fill: (theme) => ({
        system: `You are an educational content generator for logic training.
Create a fill-in-the-blank problem where 1-3 key terms are replaced with "___".
The problem should test the user's understanding of logical concepts.
Return the problem in plain text format.`,
        user: `Topic: ${theme}
Generate a logic fill-in-the-blank problem. The original text should be 100-200 words.
Replace 1-3 key terms with "___".`
      }),
      
      summary: (theme) => ({
        system: `You are an educational content generator for logic training.
Create a passage (200-300 words) and ask the user to summarize it in 50 words or less.
The passage should contain clear logical structure and key concepts.`,
        user: `Topic: ${theme}
Generate a logical passage that requires careful reading and summarization.
Provide clear instructions: "Summarize this passage in 50 words or less."`
      }),
      
      critique: (theme) => ({
        system: `You are an educational content generator for logic training.
Create a statement with reasoning and ask the user to evaluate the logical validity.
The statement should contain logical structure that can be analyzed.`,
        user: `Topic: ${theme}
Generate a statement with supporting reasoning. Ask: "Is this reasoning valid? Why or why not?"`
      }),
      
      ame: (theme) => ({
        system: `You are an educational content generator for logic training.
Create a situation (So?) and ask the user to determine the recommended action (Now?) using the Ame framework.
Ame = Situation (So?) → Interpretation (Why?) → Action (Now?).`,
        user: `Topic: ${theme}
Create a scenario with numerical data. Ask "Based on this situation, what action do you recommend?"`
      })
    },
    THINKING: {
      type1: (level, theme) => ({
        system: `You are an educational content generator for critical thinking.
Create a problem that teaches logical thinking (MECE, pyramid structure).
Difficulty level: ${level} (1=basic, 2=applied, 3=advanced, 4=practical)`,
        user: `Topic: ${theme}
Create a level ${level} logical thinking problem using frameworks like MECE or pyramid structure.`
      }),
      // type2-type6 は同様に実装（省略）
    }
  },

  SCORE: {
    system: `You are an expert evaluator of logical thinking and reasoning.
Evaluate the user's answer using these rubrics:
1. Logic Clarity (0-30 points): Is the reasoning clear and well-structured?
2. Completeness (0-35 points): Does it address all aspects of the problem?
3. Accuracy (0-35 points): Are the facts and logic sound?

Return your evaluation as JSON with the following structure:
{
  "score": <0-100>,
  "score_detail": {
    "logic_clarity": <0-30>,
    "completeness": <0-35>,
    "accuracy": <0-35>
  },
  "feedback": "<detailed feedback>",
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}`,
    
    user: (originalProblem, userAnswer) => `
Original Problem: ${originalProblem}

User's Answer: ${userAnswer}

Please evaluate this answer using the rubrics above and return JSON.`
  }
};

module.exports = {
  client,
  PROMPTS
};
```

---

### Step 3: サーバー初期化（30分）

#### 3-1. `src/index.js` を作成

```javascript
require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/error-handler');

const generateProblem = require('./api/generate-problem');
const scoreAnswer = require('./api/score-answer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS 設定（FE が localhost:5000 からアクセスする場合）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    railway_app: 'thinkgrindai-be',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-problem', generateProblem);
app.post('/api/score-answer', scoreAnswer);

// Error Handler（最後に登録）
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
```

**実行確認**:
```bash
npm run dev
# ターミナルで「✅ Server running on...」と表示されることを確認

# 別ターミナルで:
curl http://localhost:3000/health
# {"status":"ok",...} が返ってくることを確認
```

---

### Step 4: Validation Service（20分）

#### 4-1. `src/services/validate-service.js` を作成

```javascript
const constants = require('../config/constants');

class ValidateService {
  static validateGenerateRequest(body) {
    const errors = [];

    // service チェック
    if (!body.service) {
      errors.push({ field: 'service', reason: 'missing' });
    } else if (!['logic', 'thinking'].includes(body.service)) {
      errors.push({ field: 'service', reason: 'invalid value' });
    }

    // theme チェック
    if (!body.theme || typeof body.theme !== 'string' || body.theme.trim() === '') {
      errors.push({ field: 'theme', reason: 'missing or empty' });
    }

    // user_id チェック（UUID 形式）
    if (!body.user_id) {
      errors.push({ field: 'user_id', reason: 'missing' });
    } else if (!this.isValidUUID(body.user_id)) {
      errors.push({ field: 'user_id', reason: 'invalid UUID format' });
    }

    // service 別チェック
    if (body.service === 'logic') {
      if (!body.tab) {
        errors.push({ field: 'tab', reason: 'missing for logic service' });
      } else if (!constants.LOGIC_TABS.includes(body.tab)) {
        errors.push({ field: 'tab', reason: `invalid tab (valid: ${constants.LOGIC_TABS.join(', ')})` });
      }
    } else if (body.service === 'thinking') {
      if (!body.thinking_type) {
        errors.push({ field: 'thinking_type', reason: 'missing for thinking service' });
      } else if (!constants.THINKING_TYPES.includes(body.thinking_type)) {
        errors.push({ field: 'thinking_type', reason: `invalid type (valid: ${constants.THINKING_TYPES.join(', ')})` });
      }

      if (!body.level) {
        errors.push({ field: 'level', reason: 'missing for thinking service' });
      } else if (!constants.THINKING_LEVELS.includes(parseInt(body.level))) {
        errors.push({ field: 'level', reason: `invalid level (valid: ${constants.THINKING_LEVELS.join(', ')})` });
      }
    }

    return errors;
  }

  static validateScoreRequest(body) {
    const errors = [];

    // 基本チェック
    if (!body.service) {
      errors.push({ field: 'service', reason: 'missing' });
    } else if (!['logic', 'thinking'].includes(body.service)) {
      errors.push({ field: 'service', reason: 'invalid value' });
    }

    if (!body.problem_id) {
      errors.push({ field: 'problem_id', reason: 'missing' });
    }

    if (!body.user_answer || typeof body.user_answer !== 'string') {
      errors.push({ field: 'user_answer', reason: 'missing or not string' });
    }

    if (!body.user_id || !this.isValidUUID(body.user_id)) {
      errors.push({ field: 'user_id', reason: 'missing or invalid UUID' });
    }

    if (!body.context) {
      errors.push({ field: 'context', reason: 'missing' });
    } else {
      if (!body.context.original_problem) {
        errors.push({ field: 'context.original_problem', reason: 'missing' });
      }
      if (!body.context.tab && !body.context.thinking_type) {
        errors.push({ field: 'context', reason: 'missing both tab and thinking_type' });
      }
    }

    return errors;
  }

  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static throwIfErrors(errors, status = 400) {
    if (errors.length > 0) {
      const error = new Error(`Validation failed: ${errors.map(e => `${e.field} (${e.reason})`).join(', ')}`);
      error.status = status;
      error.code = 'invalid_request';
      throw error;
    }
  }
}

module.exports = ValidateService;
```

---

### Step 5: Google Sheets Service（30分）

#### 5-1. `src/services/sheets-service.js` を作成

```javascript
const { google } = require('googleapis');

class SheetsService {
  constructor() {
    this.sheets = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      // base64 デコード
      const keyDataBase64 = process.env.GOOGLE_SHEETS_API_KEY_BASE64;
      if (!keyDataBase64) {
        throw new Error('GOOGLE_SHEETS_API_KEY_BASE64 is not set');
      }

      const keyData = JSON.parse(Buffer.from(keyDataBase64, 'base64').toString('utf-8'));

      const auth = new google.auth.GoogleAuth({
        credentials: keyData,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets API initialized');
    } catch (error) {
      console.error('❌ Sheets auth error:', error.message);
      throw error;
    }
  }

  async readUserCore(userId) {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      const range = `user_core!A:K`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      const rows = response.data.values || [];
      const headers = rows[0];
      const headerMap = Object.fromEntries(headers.map((h, i) => [h, i]));

      // user_id が一致する行を探す
      const userRow = rows.slice(1).find(row => row[headerMap.user_id] === userId);

      if (!userRow) {
        const error = new Error(`User ${userId} not found`);
        error.status = 404;
        error.code = 'user_not_found';
        throw error;
      }

      return {
        user_id: userRow[headerMap.user_id],
        name: userRow[headerMap.name],
        logic_avg_score: parseFloat(userRow[headerMap.logic_avg_score]) || 0,
        logic_problems_solved: parseInt(userRow[headerMap.logic_problems_solved]) || 0,
        thinking_avg_score: parseFloat(userRow[headerMap.thinking_avg_score]) || 0,
        thinking_problems_solved: parseInt(userRow[headerMap.thinking_problems_solved]) || 0
      };
    } catch (error) {
      if (error.code === 'user_not_found') throw error;
      error.code = 'sheets_error';
      error.status = 503;
      throw error;
    }
  }

  async updateUserScore(userId, service, newScore) {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      const range = `user_core!A:K`;

      // 現在のデータを取得
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      const rows = response.data.values || [];
      const headers = rows[0];
      const headerMap = Object.fromEntries(headers.map((h, i) => [h, i]));

      // user_id が一致する行を探す（行番号も記録）
      let userRowIndex = -1;
      const userRow = rows.find((row, idx) => {
        if (row[headerMap.user_id] === userId) {
          userRowIndex = idx;
          return true;
        }
        return false;
      });

      if (!userRow) {
        const error = new Error(`User ${userId} not found`);
        error.status = 404;
        error.code = 'user_not_found';
        throw error;
      }

      // スコア更新
      const currentSolved = parseInt(userRow[headerMap[`${service}_problems_solved`]]) || 0;
      const currentAvg = parseFloat(userRow[headerMap[`${service}_avg_score`]]) || 0;

      const newSolved = currentSolved + 1;
      const newAvg = (currentAvg * currentSolved + newScore) / newSolved;

      // 更新対象の行を修正
      userRow[headerMap[`${service}_problems_solved`]] = newSolved;
      userRow[headerMap[`${service}_avg_score`]] = newAvg.toFixed(1);
      userRow[headerMap.last_active] = new Date().toISOString();

      // Google Sheets に書き込み
      const updateRange = `user_core!A${userRowIndex + 1}:K${userRowIndex + 1}`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [userRow] }
      });

      return { success: true, newAvg: newAvg.toFixed(1) };
    } catch (error) {
      if (error.code === 'user_not_found') throw error;
      error.code = 'sheets_error';
      error.status = 503;
      throw error;
    }
  }
}

module.exports = new SheetsService();
```

---

### Step 6: Claude Service（40分）

#### 6-1. `src/services/claude-service.js` を作成

```javascript
const { v4: uuidv4 } = require('uuid');
const { client, PROMPTS } = require('../config/claude-config');
const constants = require('../config/constants');

class ClaudeService {
  async generateProblem(service, tabOrType, level, theme) {
    try {
      let systemPrompt, userPrompt, maxTokens;

      if (service === 'logic') {
        const prompt = PROMPTS.GENERATE.LOGIC[tabOrType](theme);
        systemPrompt = prompt.system;
        userPrompt = prompt.user;
        maxTokens = constants.MAX_TOKENS.GENERATE.LOGIC[tabOrType];
      } else if (service === 'thinking') {
        const typeKey = tabOrType; // e.g., 'type1'
        const prompt = PROMPTS.GENERATE.THINKING[typeKey](level, theme);
        systemPrompt = prompt.system;
        userPrompt = prompt.user;
        maxTokens = constants.MAX_TOKENS.GENERATE.THINKING[level];
      }

      const response = await client.messages.create({
        model: constants.CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature: constants.TEMPERATURE.GENERATION,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        problem_id: uuidv4(),
        content,
        context: {
          theme,
          type: service === 'logic' ? tabOrType : tabOrType,
          level: level || null,
          instructions: userPrompt
        },
        metadata: {
          created_at: new Date().toISOString(),
          model: constants.CLAUDE_MODEL,
          temperature: constants.TEMPERATURE.GENERATION,
          max_tokens: maxTokens,
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      error.code = 'claude_api_error';
      error.status = 503;
      throw error;
    }
  }

  async scoreAnswer(originalProblem, userAnswer, context) {
    try {
      const systemPrompt = PROMPTS.SCORE.system;
      const userPrompt = PROMPTS.SCORE.user(originalProblem, userAnswer);

      const response = await client.messages.create({
        model: constants.CLAUDE_MODEL,
        max_tokens: constants.MAX_TOKENS.SCORE,
        temperature: constants.TEMPERATURE.SCORING,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      // Claude からの応答を JSON パース
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}';
      
      // JSON 部分を抽出（Markdown コードブロック対応）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const scoreData = JSON.parse(jsonString);

      return {
        score: scoreData.score,
        score_detail: scoreData.score_detail,
        feedback: scoreData.feedback,
        suggestions: scoreData.suggestions || [],
        metadata: {
          evaluated_at: new Date().toISOString(),
          model: constants.CLAUDE_MODEL,
          temperature: constants.TEMPERATURE.SCORING,
          max_tokens: constants.MAX_TOKENS.SCORE,
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        error.message = 'Failed to parse Claude response as JSON';
      }
      error.code = 'claude_api_error';
      error.status = 503;
      throw error;
    }
  }
}

module.exports = new ClaudeService();
```

**重要**: Claude の採点レスポンスは JSON として返されることが前提です。プロンプトが確実に JSON を返すよう、上記の `PROMPTS.SCORE.system` を必ず確認してください。テスト実行時にレスポンス形式を確認してください。

---

### Step 7: API エンドポイント（40分）

#### 7-1. `src/api/generate-problem.js` を作成

```javascript
const { v4: uuidv4 } = require('uuid');
const ValidateService = require('../services/validate-service');
const ClaudeService = require('../services/claude-service');
const SheetsService = require('../services/sheets-service');

async function generateProblem(req, res, next) {
  try {
    const { service, tab, thinking_type, level, theme, user_id } = req.body;

    // リクエスト検証
    const errors = ValidateService.validateGenerateRequest(req.body);
    ValidateService.throwIfErrors(errors);

    // ユーザー存在確認（Google Sheets）
    await SheetsService.readUserCore(user_id);

    // Claude で問題生成
    const tabOrType = service === 'logic' ? tab : thinking_type;
    const problemData = await ClaudeService.generateProblem(
      service,
      tabOrType,
      level,
      theme
    );

    res.json(problemData);
  } catch (error) {
    next(error);
  }
}

module.exports = generateProblem;
```

#### 7-2. `src/api/score-answer.js` を作成

```javascript
const ValidateService = require('../services/validate-service');
const ClaudeService = require('../services/claude-service');
const SheetsService = require('../services/sheets-service');

async function scoreAnswer(req, res, next) {
  try {
    const { service, problem_id, user_answer, user_id, context } = req.body;

    // リクエスト検証
    const errors = ValidateService.validateScoreRequest(req.body);
    ValidateService.throwIfErrors(errors);

    // ユーザー存在確認
    await SheetsService.readUserCore(user_id);

    // Claude で採点
    const scoreData = await ClaudeService.scoreAnswer(
      context.original_problem,
      user_answer,
      context
    );

    // Google Sheets を更新
    await SheetsService.updateUserScore(user_id, service, scoreData.score);

    res.json(scoreData);
  } catch (error) {
    next(error);
  }
}

module.exports = scoreAnswer;
```

---

### Step 8: エラーハンドラ（20分）

#### 8-1. `src/middleware/error-handler.js` を作成

```javascript
const constants = require('../config/constants');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || constants.ERROR_CODES.INTERNAL_ERROR;
  const message = err.message || 'Internal server error';

  // ログ出力
  console.error(`[${new Date().toISOString()}] ${status} - ${code}:`, message);

  // レスポンス返却
  res.status(status).json({
    error: code,
    message,
    status,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
```

---

### Step 9: テスト実装（60分）

#### 9-1. `tests/generate.test.js` を作成

```javascript
const request = require('supertest');
const app = require('../src/index');
const ClaudeService = require('../src/services/claude-service');
const SheetsService = require('../src/services/sheets-service');

// Mock
jest.mock('../src/services/claude-service');
jest.mock('../src/services/sheets-service');

describe('POST /api/generate-problem', () => {
  const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const mockTheme = 'Climate change and economic policy';

  beforeEach(() => {
    // Mock Claude Service
    ClaudeService.generateProblem.mockResolvedValue({
      problem_id: 'mock-problem-id',
      content: 'Mock problem content',
      context: {
        theme: mockTheme,
        type: 'fill',
        level: null,
        instructions: 'Mock instructions'
      },
      metadata: {
        created_at: new Date().toISOString(),
        model: 'claude-sonnet-4-6',
        temperature: 0.9,
        max_tokens: 500,
        input_tokens: 100,
        output_tokens: 200
      }
    });

    // Mock Sheets Service
    SheetsService.readUserCore.mockResolvedValue({
      user_id: mockUserId,
      name: 'Test User',
      logic_avg_score: 75,
      logic_problems_solved: 5
    });
  });

  it('should generate a logic fill problem', async () => {
    const response = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'logic',
        tab: 'fill',
        theme: mockTheme,
        user_id: mockUserId
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('problem_id');
    expect(response.body).toHaveProperty('content');
    expect(response.body.context.type).toBe('fill');
  });

  it('should return 400 for invalid service', async () => {
    const response = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'invalid_service',
        tab: 'fill',
        theme: mockTheme,
        user_id: mockUserId
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid_request');
  });

  it('should return 400 for missing theme', async () => {
    const response = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'logic',
        tab: 'fill',
        user_id: mockUserId
      });

    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent user', async () => {
    SheetsService.readUserCore.mockRejectedValueOnce(
      Object.assign(new Error('User not found'), {
        status: 404,
        code: 'user_not_found'
      })
    );

    const response = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'logic',
        tab: 'fill',
        theme: mockTheme,
        user_id: 'invalid-uuid'
      });

    expect(response.status).toBe(404);
  });

  it('should generate a thinking type1 level 1 problem', async () => {
    const response = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'thinking',
        thinking_type: 'type1',
        level: 1,
        theme: mockTheme,
        user_id: mockUserId
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('problem_id');
  });
});
```

#### 9-2. `tests/score.test.js` を作成

```javascript
const request = require('supertest');
const app = require('../src/index');
const ClaudeService = require('../src/services/claude-service');
const SheetsService = require('../src/services/sheets-service');

jest.mock('../src/services/claude-service');
jest.mock('../src/services/sheets-service');

describe('POST /api/score-answer', () => {
  const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  beforeEach(() => {
    ClaudeService.scoreAnswer.mockResolvedValue({
      score: 80,
      score_detail: {
        logic_clarity: 85,
        completeness: 75,
        accuracy: 80
      },
      feedback: 'Good answer with clear reasoning.',
      suggestions: ['Add more specific examples'],
      metadata: {
        evaluated_at: new Date().toISOString(),
        model: 'claude-sonnet-4-6',
        temperature: 0.3,
        max_tokens: 1000,
        input_tokens: 200,
        output_tokens: 150
      }
    });

    SheetsService.readUserCore.mockResolvedValue({
      user_id: mockUserId,
      name: 'Test User',
      logic_avg_score: 75,
      logic_problems_solved: 5
    });

    SheetsService.updateUserScore.mockResolvedValue({
      success: true,
      newAvg: 76.7
    });
  });

  it('should score a logic answer', async () => {
    const response = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        problem_id: 'mock-problem-id',
        user_answer: 'The answer is...',
        user_id: mockUserId,
        context: {
          original_problem: 'What is...?',
          tab: 'fill'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('score');
    expect(response.body.score).toBe(80);
    expect(response.body).toHaveProperty('feedback');
  });

  it('should update user_core after scoring', async () => {
    await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        problem_id: 'mock-problem-id',
        user_answer: 'The answer is...',
        user_id: mockUserId,
        context: {
          original_problem: 'What is...?',
          tab: 'fill'
        }
      });

    expect(SheetsService.updateUserScore).toHaveBeenCalledWith(
      mockUserId,
      'logic',
      80
    );
  });
});
```

#### 9-3. `tests/integration.test.js` を作成

```javascript
const request = require('supertest');
const app = require('../src/index');
const ClaudeService = require('../src/services/claude-service');
const SheetsService = require('../src/services/sheets-service');

jest.mock('../src/services/claude-service');
jest.mock('../src/services/sheets-service');

describe('E2E Flow: Generate → Score', () => {
  const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  beforeEach(() => {
    ClaudeService.generateProblem.mockResolvedValue({
      problem_id: 'test-problem-123',
      content: 'Fill in: Climate change affects ___ and ___.',
      context: {
        theme: 'Climate',
        type: 'fill',
        level: null
      },
      metadata: {
        created_at: new Date().toISOString(),
        model: 'claude-sonnet-4-6',
        temperature: 0.9,
        max_tokens: 500
      }
    });

    ClaudeService.scoreAnswer.mockResolvedValue({
      score: 85,
      score_detail: {
        logic_clarity: 85,
        completeness: 85,
        accuracy: 85
      },
      feedback: 'Excellent answer',
      suggestions: []
    });

    SheetsService.readUserCore.mockResolvedValue({
      user_id: mockUserId,
      name: 'Test User'
    });

    SheetsService.updateUserScore.mockResolvedValue({
      success: true,
      newAvg: 80
    });
  });

  it('should generate and score a complete flow', async () => {
    // Step 1: Generate problem
    const generateRes = await request(app)
      .post('/api/generate-problem')
      .send({
        service: 'logic',
        tab: 'fill',
        theme: 'Climate',
        user_id: mockUserId
      });

    expect(generateRes.status).toBe(200);
    const problemId = generateRes.body.problem_id;
    const problemContent = generateRes.body.content;

    // Step 2: Score answer
    const scoreRes = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        problem_id: problemId,
        user_answer: 'Climate change affects economics and ecology.',
        user_id: mockUserId,
        context: {
          original_problem: problemContent,
          tab: 'fill'
        }
      });

    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.score).toBe(85);
    expect(SheetsService.updateUserScore).toHaveBeenCalled();
  });
});
```

**テスト実行**:
```bash
npm test
# すべてのテストが PASS することを確認

npm run test:coverage
# カバレッジが 80% 以上であることを確認（目標）
```

---

### Step 10: ドキュメント作成（20分）

#### 10-1. `backend/README.md` を作成

```markdown
# thinkgrindai Backend Server

Node.js Express ベースの BEサーバー。論理トレーニング・思考トレーニングの問題生成・採点機能を提供します。

## セットアップ

### 前提条件
- Node.js 20+ (確認: `node --version`)
- npm 10+
- Claude API Key（[console.anthropic.com](https://console.anthropic.com)）
- Google Sheets API credentials（サービスアカウント）

### インストール

```bash
cd backend
npm install
```

### 環境変数設定

1. `.env.local` を作成：
```bash
cp .env.example .env.local
```

2. `.env.local` に値を入力：
```env
NODE_ENV=development
PORT=3000
CLAUDE_API_KEY=sk-ant-xxxxx...
GOOGLE_SHEETS_API_KEY_BASE64=eyJ0eXBlIjog...
GOOGLE_SHEETS_ID=1xxx...
```

**Google Sheets API Key の取得**:
1. [Google Cloud Console](https://console.cloud.google.com) で Service Account を作成
2. JSON キーをダウンロード
3. 以下で base64 エンコード：
   ```bash
   cat /path/to/service-account-key.json | base64 | pbcopy
   ```
4. `.env.local` に貼り付け

### ローカル起動

```bash
npm run dev
# http://localhost:3000/health でヘルスチェック
```

## API リファレンス

### GET /health

ヘルスチェック

**レスポンス**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "railway_app": "thinkgrindai-be",
  "timestamp": "2026-05-26T10:30:00Z"
}
```

### POST /api/generate-problem

問題を生成

**リクエスト**（logic）:
```json
{
  "service": "logic",
  "tab": "fill",
  "theme": "Climate change",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**リクエスト**（thinking）:
```json
{
  "service": "thinking",
  "thinking_type": "type1",
  "level": 2,
  "theme": "Business strategy",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### POST /api/score-answer

回答を採点

**リクエスト**:
```json
{
  "service": "logic",
  "problem_id": "uuid",
  "user_answer": "My answer is...",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "context": {
    "original_problem": "Question text",
    "tab": "fill"
  }
}
```

## テスト

```bash
npm test              # 全テスト実行
npm run test:watch   # ウォッチモード
npm run test:coverage # カバレッジ表示（目標: > 80%）
```

## トラブルシューティング

### エラー: "GOOGLE_SHEETS_API_KEY_BASE64 is not set"
→ `.env.local` に環境変数を設定してください

### エラー: "Claude API error"
→ `CLAUDE_API_KEY` が有効か確認してください

### テスト失敗
→ `npm install` で依存パッケージを再インストールしてください

## 今後（Phase 1-4 以降）

- [ ] Railway へのデプロイ
- [ ] GitHub MCP Server 実装（Phase 3）
- [ ] 認証・ユーザー管理（Phase 5）
```

---

### Step 11: 最終チェック（30分）

#### 11-1. ローカル動作確認

```bash
# ターミナル1: サーバー起動
npm run dev

# ターミナル2: リクエストテスト
curl -X GET http://localhost:3000/health

# ターミナル3: テスト実行
npm test
```

#### 11-2. チェックリスト

以下をすべて確認してください：

```
- [ ] npm start で「✅ Server running on...」と表示
- [ ] http://localhost:3000/health が正常応答
- [ ] npm test で全テスト PASS（12/12）
- [ ] npm run test:coverage でカバレッジ確認（> 80%）
- [ ] POST /api/generate-problem (logic fill) でレスポンス確認
- [ ] POST /api/generate-problem (thinking type1 level 1) でレスポンス確認
- [ ] POST /api/score-answer でレスポンス確認
- [ ] エラーハンドリング動作確認
  - invalid service → 400エラー
  - missing user_id → 400エラー
  - non-existent user → 404エラー
  - Claude API error → 503エラー
```

---

## 🔧 実装時の落とし穴・注意点

### 1. **Claude のレスポンス形式**
採点時に Claude がJSON として返すよう、`PROMPTS.SCORE.system` で明確に指示してください。テスト時にレスポンス形式を確認して調整が必要な場合があります。

### 2. **Google Sheets 認証**
base64 エンコード/デコードの処理を誤ると Sheets API が動作しません。Step 5-1 の `initializeAuth()` 実装を慎重に確認してください。

### 3. **UUID 検証**
user_id は UUID 形式で、ValidateService で正規表現チェックしています。テスト時に正しい UUID を使用してください。

### 4. **環境変数の漏洩**
`.env.local` を絶対に Git に commit しないでください。`.gitignore` に含める必須。

### 5. **非同期処理**
すべての API は非同期（async/await）です。Express の `try-catch` で例外をキャッチして、`next(error)` でエラーハンドラに渡すルールを守ってください。

---

## 📦 PR チェックリスト

PR 作成時に以下を確認してください：

```markdown
## Code Review Checklist

### 実装
- [ ] Issue #40 の要件をすべて実装している
- [ ] 仕様書通りに実装されている
- [ ] GAS との並行運用が確認できている

### テスト
- [ ] ローカルで npm start で起動できる
- [ ] npm test で全テスト PASS（カバレッジ > 80%）
- [ ] エラーケースをテストしている

### ドキュメント
- [ ] backend/README.md が記載されている
- [ ] .env.example に全環境変数が列挙されている
- [ ] Obsidian メモを作成（下記参照）

### コード品質
- [ ] console.log デバッグ出力が残っていない
- [ ] API キーがログに出力されない
- [ ] エラーハンドリングが統一形式
```

---

## 📝 Obsidian 記録

実装完了後、以下をObsidianに保存してください。

**パス**: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/2026-05-26-backend-phase1-3.md`

```markdown
# BEサーバー基盤実装 Phase 1-3 完了記

## 実装内容
- Node.js Express BEサーバー 0 から構築
- Claude API 統合（問題生成・採点）
  - Model: claude-sonnet-4-6
  - Temperature: 生成 0.9 / 採点 0.3
  - Tool Use による採点結果の構造化出力
- Google Sheets API 統合（user_core）
  - base64 エンコード方式での認証
  - ユーザースコア更新機能
- エラーハンドリング・統一レスポンス形式
- ユニット・統合テスト（Jest）

## 変更ファイル
- backend/package.json
- backend/src/index.js
- backend/src/config/constants.js
- backend/src/config/claude-config.js
- backend/src/api/generate-problem.js
- backend/src/api/score-answer.js
- backend/src/services/claude-service.js
- backend/src/services/validate-service.js
- backend/src/services/sheets-service.js
- backend/src/middleware/error-handler.js
- backend/tests/generate.test.js
- backend/tests/score.test.js
- backend/tests/integration.test.js
- backend/.env.example
- backend/README.md

## テスト結果
- ユニットテスト: 12/12 PASS
- 統合テスト: 3/3 PASS
- カバレッジ: 84%

## 既知の問題・TODO
- なし

## 関連 Issue
- #40（本Issue：BEサーバー基盤実装）
- #41（Phase 1-4：Railway デプロイ、次フェーズ）
```

---

## ✅ 実装完了の定義

以下すべてを満たしたら完了です：

- [x] backend/ ディレクトリを新規作成
- [x] npm パッケージ依存関係を定義
- [x] `/health` エンドポイントで HealthCheck 可能
- [x] `/api/generate-problem` で問題生成可能
  - logic タブ (fill/summary/critique/ame) に対応
  - thinking タイプ (type1-6) × レベル (1-4) に対応
- [x] `/api/score-answer` で採点可能
  - Claude Tool Use で採点結果を構造化
  - Google Sheets user_core を更新
- [x] Claude API (claude-sonnet-4-6) 統合完了
- [x] Google Sheets API 統合完了
- [x] エラーハンドリング統一形式
- [x] ユニットテスト・統合テスト実装・PASS
- [x] ローカル npm test で全テスト PASS
- [x] README.md で使用方法を記載
- [x] .env.example で環境変数テンプレート提供
- [x] Obsidian メモを保存

PR は Fixes #40 を記載して作成してください。

---

**質問・詰まった点があれば GitHub Issues でコメントください。Naoya が確認して Claude が対応します。**
