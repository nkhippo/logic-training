# 仕様書：フロントエンド API 統合（Railway BE 連携）

**最終更新**: 2026-05-26  
**バージョン**: 1.1  
**関連 Issue**: #45（Phase 2-1）  
**前提**: Phase 1-4（Railway デプロイ）完了

---

## 1. 概要

### 目的

GitHub Pages 上の Vanilla JS フロントエンドから、Claude 呼び出し（問題生成・採点・フォローアップ・写真採点）を **Railway BE** 経由に統一する。API キーはブラウザに載せない。

### スコープ（Phase 2-1）

| 対象 | 内容 |
|---|---|
| Claude 呼び出し | 全経路を BE 経由（`USE_BACKEND_API: true`） |
| 設定 | `js/config.js` + `js/shared/07-api.js` + `app.js` |
| GAS | **過去問題の読み書きのみ**（生成・採点は BE） |
| GitHub Pages | `CLAUDE_API_KEY` 注入なし（`deploy-pages.yml`） |

### 対象外（Phase 2-2 以降）

- React 化・Vercel ホスト → `docs/specification/frontend/frontend-react.md`
- GAS 完全廃止

---

## 2. ファイル構成と責務

| ファイル | 責務 |
|---|---|
| `js/config.js` | `API_BASE_URL`・`USE_BACKEND_API`・`ENDPOINTS`・`checkApiHealth()` |
| `app.js` | `getUserId()` / `window.getCurrentUserId`（localStorage: `thinkgrindai_user_id`） |
| `js/shared/07-api.js` | `beFetchJson`・`callClaude`・`callClaudeMsg`・GAS 過去問 |
| `js/shared/01-config.js` | `GAS_URL`・`CLAUDE_API_KEY=''`（本番は空のまま） |
| `js/logic/08-fill.js` 等 | タブロジック（`callClaude(..., beOpts)` で BE 連携） |
| `js/thinking/app.js` | 思考トレーニング（同上） |

**読み込み順**（`logic.html` / `thinking.html`）:

```
js/config.js → app.js → js/shared/01-config.js → … → js/shared/07-api.js → タブ JS
```

---

## 3. BE エンドポイント

本番 URL: `https://thinkgrindai-production.up.railway.app`

| パス | 用途 |
|---|---|
| `GET /health` | ヘルスチェック |
| `POST /api/generate-problem` | 問題生成（カスタムプロンプト可） |
| `POST /api/score-answer` | 採点（カスタムプロンプト可） |
| `POST /api/complete` | 汎用完了（フォローアップ・最終問い・写真採点など） |

詳細なリクエスト形式は `docs/specification/backend/specification_railway_phase1_4.md` および BE 実装（`backend/src/api/`）を参照。

---

## 4. `js/config.js` 仕様

```javascript
const CONFIG = {
  API_BASE_URL: 'https://thinkgrindai-production.up.railway.app',
  USE_BACKEND_API: true,
  ENDPOINTS: {
    GENERATE_PROBLEM: '/api/generate-problem',
    SCORE_ANSWER: '/api/score-answer',
    COMPLETE: '/api/complete',
    HEALTH: '/health',
  },
};
window.CONFIG = CONFIG;
```

- **ローカル BE**: `API_BASE_URL` を `http://localhost:3000` に差し替え（`USE_BACKEND_API` は true のまま）
- **`checkApiHealth()`**: `GET ${API_BASE_URL}/health` → `status === 'ok'` なら true（デバッグ用・`window.checkApiHealth`）

---

## 5. `js/shared/07-api.js` 呼び出しフロー

### 5-1. `useBackendApi()`

`window.CONFIG.USE_BACKEND_API && window.CONFIG.API_BASE_URL` が真のとき BE 経由。

### 5-2. `callClaude(prompt, sys, maxTok, temperature, beOpts?)`

| 条件 | 動作 |
|---|---|
| `beOpts.mode === 'generate'` かつ BE 有効 | `POST /api/generate-problem`（`system_prompt` / `user_prompt`） |
| `beOpts.mode === 'score'` かつ BE 有効 | `POST /api/score-answer` |
| BE 有効・`beOpts` なし | `POST /api/complete`（テキスト） |
| BE 無効 | ブラウザから Anthropic API（要 `01-config.local.js`） |

### 5-3. `callClaudeMsg(sys, content, …)`

| 条件 | 動作 |
|---|---|
| BE 有効・`content` が配列 | `POST /api/complete`（`user_content`: 画像 + テキスト） |
| BE 有効・文字列 | `POST /api/complete`（`user_prompt`） |
| BE 無効 | ブラウザ直叩き |

### 5-4. `hasApiKey()`

`useBackendApi()` が真なら **キー未設定でも true**（UI ボタン無効化を防ぐ）。

---

## 6. ユーザー ID

- **生成・保存**: `app.js` の `getUserId()`
- **キー**: `localStorage` の `thinkgrindai_user_id`
- **BE 送信**: `07-api.js` の `backendUserId()` → `user_id` フィールド

---

## 7. API キー方針

| 環境 | Claude API キー |
|---|---|
| Git リポジトリ | コミットしない（`01-config.js` は空） |
| GitHub Pages 本番 | 不要（BE のみ） |
| Railway 本番 | Variables の `CLAUDE_API_KEY` |
| ローカル（BE 利用） | `backend/.env.local` |
| ローカル（BE オフ） | `js/shared/01-config.local.js`（gitignore） |

`scripts/inject-api-key.py` は **非推奨**（Pages デプロイから削除済み）。

---

## 8. GAS の役割（共存）

| 機能 | 経路 |
|---|---|
| 過去問題一覧・保存 | `GAS_URL`（`gasGet` / `gasPost`） |
| 問題生成・採点 | Railway BE |

---

## 9. テスト仕様

### 9-1. ローカル（BE）

```bash
cd backend && npm run dev
# js/config.js の API_BASE_URL を http://localhost:3000 に
```

ブラウザコンソール:

```javascript
await checkApiHealth(); // true
```

### 9-2. 機能確認チェックリスト

- [ ] 論理：穴埋め・要約・批判読み・空雨傘 — 生成・採点
- [ ] 要約：写真採点（手書き画像）
- [ ] 思考：生成・ステップ採点・フォローアップ・最終問い・振り返り
- [ ] 過去問：GAS 同期（読み込み・保存）
- [ ] 本番 Pages：`checkApiHealth()` が true（Railway 再デプロイ後）

---

## 10. 変更履歴

| 日付 | 版 | 内容 |
|---|---|---|
| 2026-05-26 | 1.0 | 初版（Downloads 仕様をベースに作成） |
| 2026-05-26 | 1.1 | 実装反映：`07-api.js`・`/api/complete`・キー注入廃止・実ファイルパス修正 |

---

## 11. 参考

- `docs/specification/backend/specification_railway_phase1_4.md`
- `docs/cursor-instructions/cursor_instruction_frontend_api_integration.md`
- `docs/specification/frontend/frontend-react.md`（Phase 2-2 以降）
