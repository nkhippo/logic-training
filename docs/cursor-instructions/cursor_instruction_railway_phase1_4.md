# Cursor 実装指示書：Railway デプロイ・CI/CD・FE統合（Phase 1-4）

**Issue**: #XXX【Feature】Railway デプロイ・CI/CD・FE統合
**仕様書**: `docs/specification/backend/specification_railway_phase1_4.md`
**バージョン**: 1.0
**更新日**: 2026-05-26

---

## 📋 概要

Phase 1-3 で完成した BEサーバーを Railway にデプロイし、GitHub Pages（FE）と接続します。

**実施内容**:
1. Railway デプロイ設定
2. CORS 対応（FE → BE のリクエスト許可）
3. ユーザー自動登録ロジック（user_core への自動追加）
4. FE（GitHub Pages）への BE URL 組み込み
5. 本番環境ヘルスチェック・CI/CD 確認

---

## 🎯 変更ファイル一覧

### 修正（既存ファイル）
```
backend/src/index.js              # CORS 設定を本番対応に更新
backend/src/services/sheets-service.js    # createUserCore メソッド追加
backend/src/api/generate-problem.js       # ユーザー自動作成ロジック追加
backend/src/api/score-answer.js           # ユーザー自動作成ロジック追加
```

### 新規作成
```
backend/railway.json              # Railway 設定ファイル
js/config.js                      # FE: API URL 設定ファイル
```

### 修正（FE ファイル）
```
index.html                        # config.js の読み込みを追加
js/01-fill.js                     # API エンドポイントを Railway URL に変更
js/02-summary.js                  # 同上
js/03-critique.js                 # 同上
js/04-ame.js                      # 同上
js/17-thinking.js                 # 同上
app.js                            # getUserId() 関数追加
```

---

## 🚀 実装手順

### Step 1: Railway 設定ファイルを作成（10分）

#### 1-1. `backend/railway.json` を作成

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

### Step 2: CORS 設定を本番対応に更新（10分）

#### 2-1. `backend/src/index.js` の CORS 設定を修正

**変更前**:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});
```

**変更後**:
```javascript
// CORS 設定（本番環境対応）
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://nkhippo.github.io',  // GitHub Pages（本番）
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

### Step 3: ユーザー自動登録ロジックを追加（20分）

#### 3-1. `backend/src/services/sheets-service.js` に `createUserCore` メソッドを追加

既存の `updateUserScore` メソッドの**直後**に以下を追加：

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

    console.log(`[sheets-service] Created new user: ${userId}`);
    return {
      user_id: userId,
      name: 'Anonymous',
      logic_problems_solved: 0,
      logic_avg_score: 0,
      thinking_problems_solved: 0,
      thinking_avg_score: 0
    };
  } catch (error) {
    console.error('[sheets-service] createUserCore error:', error.message);
    error.code = 'sheets_error';
    error.status = 503;
    throw error;
  }
}
```

#### 3-2. `backend/src/api/generate-problem.js` のユーザー確認ロジックを修正

**変更前**:
```javascript
// ユーザー存在確認（Google Sheets）
await SheetsService.readUserCore(user_id);
```

**変更後**:
```javascript
// ユーザー存在確認（なければ自動作成）
try {
  await SheetsService.readUserCore(user_id);
} catch (error) {
  if (error.code === 'user_not_found') {
    await SheetsService.createUserCore(user_id);
  } else {
    throw error;
  }
}
```

#### 3-3. `backend/src/api/score-answer.js` も同様に修正

**変更前**:
```javascript
// ユーザー存在確認
await SheetsService.readUserCore(user_id);
```

**変更後**:
```javascript
// ユーザー存在確認（なければ自動作成）
try {
  await SheetsService.readUserCore(user_id);
} catch (error) {
  if (error.code === 'user_not_found') {
    await SheetsService.createUserCore(user_id);
  } else {
    throw error;
  }
}
```

---

### Step 4: FE 側の API 設定ファイルを作成（20分）

#### 4-1. `js/config.js` を新規作成

```javascript
/**
 * thinkgrindai フロントエンド設定
 * BE API URL を管理する
 */
const CONFIG = {
  // 本番環境（Railway）
  // デプロイ後に Railway から発行された URL に変更してください
  API_BASE_URL: 'https://thinkgrindai-be-production.up.railway.app',

  // ローカル開発環境（ローカルテスト時はこちらをコメントアウト解除）
  // API_BASE_URL: 'http://localhost:3000',
};

window.CONFIG = CONFIG;
```

**重要**: `API_BASE_URL` の値は、Railway デプロイ後に発行された実際の URL に変更してください。

#### 4-2. `index.html` に `config.js` の読み込みを追加

`index.html` 内の `<script>` タグ群の**最初**に追加してください：

```html
<!-- API 設定（他の JS より先に読み込む） -->
<script src="js/config.js"></script>
```

---

### Step 5: FE の API エンドポイントを Railway URL に変更（60分）

各 JS ファイルで GAS エンドポイントを Railway BE に切り替えます。

#### 5-1. `app.js` に `getUserId()` 関数を追加

`app.js` の先頭付近に以下を追加：

```javascript
/**
 * ユーザー ID を取得（なければ自動生成して localStorage に保存）
 */
function getUserId() {
  let userId = localStorage.getItem('thinkgrindai_user_id');
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('thinkgrindai_user_id', userId);
    console.log('[app] New user_id generated:', userId);
  }
  return userId;
}

// グローバルに公開
window.getCurrentUserId = getUserId;
```

#### 5-2. 各タブ JS ファイルの API 呼び出しを変更

各ファイルで GAS の URL を使っている箇所を探し、以下のパターンで置き換えてください。

**探すパターン**（GAS URL の例）:
```javascript
'https://script.google.com/macros/s/xxxxx/exec'
```

**穴埋め（fill）タブ (`js/01-fill.js`)**:

問題生成の fetch:
```javascript
const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/generate-problem`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'logic',
    tab: 'fill',
    theme: theme,               // テーマ入力値
    user_id: window.getCurrentUserId()
  })
});
const data = await response.json();
// data.problem_id, data.content を使う
```

採点の fetch:
```javascript
const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/score-answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'logic',
    problem_id: currentProblemId,   // 問題生成時に保存した ID
    user_answer: userAnswer,
    user_id: window.getCurrentUserId(),
    context: {
      original_problem: currentProblem,
      tab: 'fill'
    }
  })
});
const data = await response.json();
// data.score, data.feedback, data.suggestions を使う
```

**要約（summary）タブ (`js/02-summary.js`)**: `tab: 'summary'` に変更
**批判読み（critique）タブ (`js/03-critique.js`)**: `tab: 'critique'` に変更
**空雨傘（ame）タブ (`js/04-ame.js`)**: `tab: 'ame'` に変更

**思考トレーニング (`js/17-thinking.js`)**:
```javascript
// 問題生成
const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/generate-problem`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'thinking',
    thinking_type: selectedType,    // 例: 'type1'
    level: selectedLevel,           // 例: 1
    theme: theme,
    user_id: window.getCurrentUserId()
  })
});
```

**注意**: 各タブの既存コードをよく読んでから変更してください。変数名・関数名はそれぞれ異なります。既存の GAS 呼び出しを探して、上記パターンで置き換えることが基本方針です。

---

### Step 6: Railway デプロイ（Naoya が実施）

**⚠️ このステップは Naoya が直接実施します（Cursor は省略）**

以下の手順を Naoya に伝えてください：

```
1. https://railway.app にアクセスしてアカウントを作成
2. "New Project" → "Deploy from GitHub" を選択
3. nkhippo/thinkgrindai リポジトリを選択
4. "Add Service" → "GitHub Repo" を選択
5. Root Directory を "backend" に設定
6. 環境変数を設定（Railway ダッシュボード → Variables）:
   - NODE_ENV=production
   - CLAUDE_API_KEY=（Anthropic Console の API Key）
   - GOOGLE_SHEETS_API_KEY=（service-account の JSON 全文 1 行）
   - GOOGLE_SHEETS_ID=1-qoDTOmzc3QOQV4Og5SZ6jIkMZZRaCMAHF23uEhMBZ8
7. デプロイ実行 → URL を確認
8. curl https://<railway-url>/health で動作確認
```

デプロイ後、Railway が発行した URL を `js/config.js` の `API_BASE_URL` に設定してください。

---

### Step 7: 本番 URL を config.js に反映（5分）

Railway デプロイ完了後、`js/config.js` を更新：

```javascript
const CONFIG = {
  // Railway から発行された実際の URL に変更
  API_BASE_URL: 'https://（Railway が発行した実際の URL）',
};

window.CONFIG = CONFIG;
```

---

### Step 8: テスト実施（30分）

#### 8-1. ローカルテスト（BE ローカル起動 + FE ブラウザ確認）

```bash
# BE 起動（ターミナル1）
cd backend
npm run dev

# FE は Live Server で起動（VS Code の Live Server プラグイン）
# または: cd thinkgrindai && python3 -m http.server 5500
```

**テスト内容**:
1. ブラウザで `http://localhost:5500` を開く
2. 穴埋めタブ → テーマ入力 → 問題生成 → 回答 → 採点 → スコアが表示されるか確認
3. 要約・批判読み・空雨傘タブも同様に確認
4. 思考トレーニングタブも確認

#### 8-2. 本番テスト（Railway デプロイ後）

```bash
# ヘルスチェック
curl https://<railway-url>/health

# 問題生成テスト
curl -X POST https://<railway-url>/api/generate-problem \
  -H "Content-Type: application/json" \
  -d '{
    "service": "logic",
    "tab": "fill",
    "theme": "AI と社会",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }'
```

#### 8-3. FE 本番テスト（GitHub Pages + Railway）

1. GitHub に push → GitHub Pages に自動デプロイ
2. `https://nkhippo.github.io/thinkgrindai/` を開く
3. 穴埋めタブで問題生成 → 採点まで動作確認
4. Google Sheets user_core にデータが追加されているか確認

---

### Step 9: PR 作成

以下を含む PR を作成してください：

```markdown
## Phase 1-4: Railway デプロイ・CI/CD・FE統合

### 実装内容
- Railway デプロイ設定（railway.json）
- CORS 設定を本番環境対応に更新
- ユーザー自動登録ロジック（createUserCore）追加
- FE: js/config.js 新規作成（API URL 管理）
- FE: 各タブ JS の API エンドポイントを Railway URL に変更
- FE: getUserId() 関数追加（localStorage で UUID 管理）

### テスト方法
1. ローカル: npm run dev でサーバー起動 → ブラウザで FE を開いて動作確認
2. 本番: Railway URL で /health → 問題生成 → 採点 を確認

### 確認済み
- [ ] ローカル環境で FE → BE の接続確認
- [ ] 本番環境（Railway）でヘルスチェック確認
- [ ] 本番環境で問題生成・採点確認
- [ ] CI/CD（main push で自動デプロイ）確認
- [ ] Google Sheets user_core に新規ユーザーが自動登録されることを確認

Fixes #XXX
```

---

## ⚠️ 実装時の注意点

### 1. 既存の GAS 呼び出しの特定

各タブ JS ファイルで GAS URL を使っている箇所は、以下のパターンで検索してください：

```bash
grep -r "script.google.com" js/
grep -r "gas" js/ --include="*.js" -i
grep -r "exec" js/ --include="*.js"
```

### 2. レスポンス形式の変更

GAS と Railway BE ではレスポンスの JSON 形式が異なる可能性があります。各タブで `data.XXX` の参照先を確認して修正してください。

BE のレスポンス形式（仕様書参照）:
- 問題生成: `{ problem_id, content, context, metadata }`
- 採点: `{ score, score_detail, feedback, suggestions, metadata }`

### 3. エラーハンドリング

BE からエラーが返った場合（400, 404, 503 など）の FE 側の表示処理を追加することを推奨します：

```javascript
if (!response.ok) {
  const errorData = await response.json();
  console.error('API Error:', errorData);
  // ユーザーへのエラー表示
  showErrorMessage('問題の生成に失敗しました。再度お試しください。');
  return;
}
```

### 4. problem_id の保持

採点時に `problem_id` が必要なので、問題生成時に保存してください：

```javascript
// 問題生成後
const data = await response.json();
window.currentProblemId = data.problem_id;    // グローバルに保存
window.currentProblemContent = data.content;  // 問題文も保存
```

---

## ✅ 完了チェックリスト

以下をすべて確認してから PR を作成してください：

```
Backend
- [ ] backend/railway.json が作成されている
- [ ] CORS 設定が本番対応に更新されている
- [ ] createUserCore メソッドが追加されている
- [ ] generate-problem.js のユーザー自動作成ロジックが追加されている
- [ ] score-answer.js のユーザー自動作成ロジックが追加されている

Frontend
- [ ] js/config.js が作成されている
- [ ] index.html に config.js の読み込みが追加されている
- [ ] app.js に getUserId() が追加されている
- [ ] js/01-fill.js の API エンドポイントが更新されている
- [ ] js/02-summary.js の API エンドポイントが更新されている
- [ ] js/03-critique.js の API エンドポイントが更新されている
- [ ] js/04-ame.js の API エンドポイントが更新されている
- [ ] js/17-thinking.js の API エンドポイントが更新されている

テスト
- [ ] ローカルで FE → BE 接続確認（問題生成・採点）
- [ ] エラーハンドリングが動作することを確認
```
