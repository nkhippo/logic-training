# Cursor 実装指示書：フロントエンド API 統合（Phase 2-1）

**Issue**: #45  
**仕様書**: `docs/specification/frontend/frontend-api-integration.md`  
**関連 PR**: #46（BE `/api/complete` + Pages キー注入廃止）

---

## 実装前に読むもの

1. `docs/TERMS.md`
2. `docs/DOCUMENT_GUIDELINES.md`
3. `docs/specification/frontend/frontend-api-integration.md`
4. `docs/specification/backend/specification_railway_phase1_4.md`（§4 FE 統合）

---

## 完了定義（Issue #45）

- [x] `js/config.js` に Railway URL・`USE_BACKEND_API`・`ENDPOINTS`
- [x] `app.js` に `getUserId()`（`thinkgrindai_user_id`）
- [x] `js/shared/07-api.js` で生成・採点・汎用呼び出しを BE 経由
- [x] 思考タブのフォローアップ等も BE（`/api/complete`）
- [x] GitHub Pages から API キー注入を削除
- [ ] Naoya: 本番で全タブ動作確認（マージ + Railway 再デプロイ後）

---

## 実装済みファイル（触らない unless バグ）

| ファイル | 備考 |
|---|---|
| `js/config.js` | CONFIG のみ |
| `app.js` | getUserId のみ（logic/thinking 両方で読込） |
| `js/shared/07-api.js` | API 中核。既存 js/01〜05 の**関数変更禁止**ルールは logic 配下が `08-fill.js` 等に移行済みのため、**logic/08-*.js は beOpts 付きで既に対応済み** |
| `js/logic/08-fill.js` 等 | `callClaude(..., { mode, service, tab, ... })` |
| `js/thinking/app.js` | `hasApiKey()` 使用 |

---

## テスト項目

### ローカル

1. `cd backend && npm run dev`
2. `js/config.js` の `API_BASE_URL` を `http://localhost:3000`
3. `logic.html` — 各タブで生成・採点 × 2 回以上
4. 要約 — 写真採点
5. `thinking.html` — 生成 → ステップ → フォローアップ → 最終問い

### 本番

1. Railway 再デプロイ（`/api/complete` 含む）
2. `main` マージ後 Pages デプロイ
3. コンソール: `await checkApiHealth()`
4. 上記と同様のタブ確認

---

## PR

- タイトル例: `feat: 全 Claude 呼び出しを BE 経由に統一（#45）`
- Body に `Fixes #45`

---

## Obsidian（Naoya）

`confirmed-decision/2026-05-26-railway-phase1-4.md` に API キー方針を追記済み。  
Phase 2-1 完了ログは `decisions/2026-05-26-frontend-api-integration.md`（マージ後に Naoya が確認）。

---

## GAS 再デプロイ

**不要**（BE のみ変更）。Railway の再デプロイが必要。
