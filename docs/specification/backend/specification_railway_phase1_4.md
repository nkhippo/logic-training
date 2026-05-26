# 仕様書：Railway デプロイ・CI/CD・FE統合（Phase 1-4）

**最終更新**: 2026-05-26
**バージョン**: 1.1
**関連Issue**: #43（Phase 1-4）・#45（Phase 2-1 FE API統合）・#46（/api/complete）

---

## 1. 概要

### 目的
Phase 1-3 で完成した Node.js Express BEサーバーを Railway にデプロイし、以下を実現する：

1. **Railway デプロイ**: BEサーバーを本番環境で稼働
2. **CI/CD**: GitHub main ブランチへの push で自動デプロイ
3. **本番環境監視**: ヘルスチェック・エラー率の把握
4. **FE統合**: GitHub Pages（FE）から Railway（BE）への API 呼び出しを実装

### スタック
- **ホスティング**: Railway（無料プラン）
- **CI/CD**: Railway の GitHub 連携（自動）
- **FE**: GitHub Pages（既存）
- **BE**: Node.js Express（Phase 1-3 で実装済み）

---

## 2. Railway 設定仕様

### 2-1. プロジェクト構成

```
Railway Project: thinkgrindai-be
└── Service: backend
    ├── Source: GitHub（nkhippo/thinkgrindai）
    ├── Root Directory: backend/
    ├── Build Command: npm install
    └── Start Command: npm start
```

### 2-2. 環境変数（Railway Variables）

| 変数名 | 値 | 備考 |
|---|---|---|
| `NODE_ENV` | `production` | 本番環境フラグ |
| `PORT` | （Railway が自動設定） | 明示不要 |
| `CLAUDE_API_KEY` | `sk-ant-xxxxx...` | Anthropic Console から取得 |
| `GOOGLE_SHEETS_API_KEY` | `{"type":"service_account",...}` | JSON 全文を 1 行で設定 |
| `GOOGLE_SHEETS_ID` | `1-qoDTOmzc3QOQV4Og5SZ6jIkMZZRaCMAHF23uEhMBZ8` | 既存のシート ID |

**重要**: Railway の環境変数は `.env.local` とは別管理。Railway ダッシュボードから設定する。

### 2-3. ヘルスチェック設定

Railway の「Health Check」設定:
- **Path**: `/health`
- **Timeout**: 30 秒
- **Interval**: 60 秒

デプロイ後、Railway が自動的に `/health` を定期的に叩いてサービスの稼働を確認する。

### 2-4. デプロイ URL

Railway が自動的に以下の形式の URL を発行:
```
https://thinkgrindai-be-production.up.railway.app
```

または任意のカスタムドメインを設定可能（今フェーズでは不要）。

---

## 3. CI/CD 仕様

### 3-1. 自動デプロイトリガー

| トリガー | 動作 |
|---|---|
| `main` ブランチへの push | Railway が自動デプロイ |
| PR マージ（main へ） | 同上 |
| その他ブランチへの push | デプロイしない |

### 3-2. デプロイフロー

```
GitHub: main ブランチへ push
    ↓
Railway: 変更を検知
    ↓
Railway: npm install（依存パッケージのインストール）
    ↓
Railway: npm start（サーバー起動）
    ↓
Railway: /health へのリクエストで起動確認
    ↓
デプロイ完了（旧バージョンを新バージョンに切り替え）
```

### 3-3. デプロイ失敗時の挙動

- ヘルスチェックが失敗した場合 → Railway が自動的にロールバック
- 直前の安定バージョンが維持される

---

## 4. FE（GitHub Pages）統合仕様

### 4-1. 概要

Claude 呼び出し（生成・採点・フォローアップ・写真採点）は Railway BE 経由。GAS は**過去問題同期のみ**。

本番 BE URL: `https://thinkgrindai-production.up.railway.app`  
Public Networking Port: **8080**（`PORT` と一致）

詳細仕様: `docs/specification/frontend/frontend-api-integration.md`

### 4-2. 変更対象ファイル（実装済み）

| ファイル | 変更内容 |
|---|---|
| `js/config.js` | `API_BASE_URL`・`USE_BACKEND_API`・`ENDPOINTS` |
| `app.js` | `getUserId()` |
| `js/shared/07-api.js` | `beFetchJson`・`callClaude`・`callClaudeMsg` |
| `js/logic/08-fill.js` 等 | `callClaude(..., beOpts)` |
| `js/thinking/app.js` | 同上 + `hasApiKey()` |
| `backend/src/api/complete.js` | 汎用 Claude 完了（PR #46） |
| `.github/workflows/deploy-pages.yml` | API キー注入ステップ削除 |

### 4-3. API URL の管理方法

各 JS ファイルに直接 URL をハードコードするのではなく、**共通設定ファイル**で管理する：

**新規作成**: `js/config.js`

```javascript
// API 設定
const CONFIG = {
  // 本番環境（Railway）
  API_BASE_URL: 'https://thinkgrindai-production.up.railway.app',

  // ローカル開発環境
  // API_BASE_URL: 'http://localhost:3000',
};

// グローバルに公開
window.CONFIG = CONFIG;
```

**index.html に追加**:
```html
<!-- config.js を他の JS より先に読み込む -->
<script src="js/config.js"></script>
```

### 4-4. 各タブ JS の変更パターン

**変更前（GAS エンドポイントを直接呼び出している箇所）**:
```javascript
// GAS エンドポイント（削除）
const GAS_URL = 'https://script.google.com/macros/s/xxxxx/exec';

// または fetch 呼び出し
const response = await fetch('https://script.google.com/macros/s/xxxxx/exec', {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

**変更後（Railway BE を呼び出す）**:
```javascript
// 問題生成
const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/generate-problem`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'logic',
    tab: 'fill',           // タブ名に応じて変更
    theme: userInputTheme,
    user_id: currentUserId
  })
});

// 採点
const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/score-answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'logic',
    problem_id: currentProblemId,
    user_answer: userAnswer,
    user_id: currentUserId,
    context: {
      original_problem: currentProblem,
      tab: 'fill'          // タブ名に応じて変更
    }
  })
});
```

### 4-5. user_id の取得方法

現在の FE に user_id の概念がない場合、以下のいずれかを採用：

**A) localStorage に固定 UUID を保存（Phase 1-4 推奨）**:
```javascript
// app.js に追加
function getUserId() {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('user_id', userId);
  }
  return userId;
}

const currentUserId = getUserId();
```

**B) ハードコードのテスト用 UUID（Phase 1-4 暫定）**:
```javascript
const currentUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // テスト用
```

**Phase 1-4 では A を採用する**（ユーザーごとに固有の ID が自動生成される）。

### 4-6. CORS 設定

Railway の BE から GitHub Pages への CORS 設定：

`backend/src/index.js` の CORS 設定を更新：

```javascript
// CORS 設定（本番環境対応）
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://nkhippo.github.io',  // GitHub Pages
    'http://localhost:5500',       // ローカル開発（Live Server）
    'http://localhost:3000',       // ローカル開発
    'http://127.0.0.1:5500'        // ローカル開発（Live Server）
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

---

## 5. Google Sheets：テストユーザー追加

現在 user_core に存在するのはテスト用の 1 ユーザーのみ。

**Phase 1-4 での対応**:
- FE 統合後、`getUserId()` で自動生成される user_id でも動作するよう、**user 登録 API は Phase 5 まで保留**
- Phase 1-4 では、初回アクセス時に自動で user_core に行を追加するロジックを BE に追加する

**sheets-service.js に追加**:
```javascript
async createUserCore(userId) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const newRow = [
      userId,
      'Anonymous',
      new Date().toISOString(),
      new Date().toISOString(),
      0, 0, 0, 0, 1, '{}'
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'user_core!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [newRow] }
    });

    return { user_id: userId, name: 'Anonymous' };
  } catch (error) {
    error.code = 'sheets_error';
    error.status = 503;
    throw error;
  }
}
```

**generate-problem.js・score-answer.js を修正**:
404 エラー時に自動でユーザーを作成するよう変更：

```javascript
// ユーザー存在確認（なければ自動作成）
let userCore;
try {
  userCore = await SheetsService.readUserCore(user_id);
} catch (error) {
  if (error.code === 'user_not_found') {
    userCore = await SheetsService.createUserCore(user_id);
  } else {
    throw error;
  }
}
```

---

## 6. 監視・ヘルスチェック仕様

### 6-1. Railway ダッシュボードでの確認項目

| 項目 | 確認方法 | 目標値 |
|---|---|---|
| デプロイ状態 | Railway ダッシュボード → Deployments | ✅ Active |
| CPU 使用率 | Railway ダッシュボード → Metrics | < 80% |
| メモリ使用量 | Railway ダッシュボード → Metrics | < 512MB |
| エラー率 | Railway ダッシュボード → Logs | < 1% |

### 6-2. ヘルスチェック確認

デプロイ後に以下のコマンドで確認：

```bash
curl https://thinkgrindai-production.up.railway.app/health
```

期待される レスポンス:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "railway_app": "thinkgrindai-be",
  "timestamp": "2026-05-26T..."
}
```

---

## 7. パフォーマンス目標

| エンドポイント | 目標レイテンシ |
|---|---|
| `GET /health` | < 500ms |
| `POST /api/generate-problem` | < 40秒（Claude API 待ち含む） |
| `POST /api/score-answer` | < 40秒（Claude API 待ち含む） |
| `POST /api/complete` | < 40秒（フォローアップ・マルチモーダル採点） |

### 7-1. `POST /api/complete`（Phase 2-1 / PR #46）

汎用 Claude 完了。リクエスト例:

```json
{
  "system_prompt": "...",
  "user_prompt": "テキストのみの場合",
  "user_content": [{ "type": "image", "source": { "type": "base64", "media_type": "image/jpeg", "data": "..." } }],
  "max_tokens": 2500,
  "temperature": 0.3,
  "user_id": "uuid"
}
```

`user_prompt` と `user_content` は排他。レスポンス: `{ "content": "...", "metadata": { ... } }`

---

## 8. 完了定義

以下をすべて満たしたら Phase 1-4 完了：

- [ ] Railway アカウント作成完了
- [ ] Railway プロジェクト作成・デプロイ完了
- [ ] 本番 URL で `/health` が正常応答
- [ ] CI/CD：main ブランチ push で自動デプロイ確認
- [ ] 本番環境で `/api/generate-problem` が正常動作
- [ ] 本番環境で `/api/score-answer` が正常動作
- [ ] 本番環境で `/api/complete` が正常動作
- [ ] FE（GitHub Pages）から BE（Railway）を呼び出し確認（API キー注入なし）
- [ ] user_id 自動生成・自動登録が動作
- [ ] Railway ダッシュボードでメトリクス確認

---

## 9. 今後の拡張（Phase 3 以降）

- `/mcp` エンドポイント（GitHub MCP Server）← Phase 3
- 認証・ユーザー管理 ← Phase 5
- カスタムドメイン対応 ← Phase 5+
