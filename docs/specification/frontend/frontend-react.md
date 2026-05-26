# 仕様書（計画）：フロントエンド React 化（Phase 2-2〜2-4）

**最終更新**: 2026-05-27  
**ステータス**: 実装済み（Phase 2-2 完了、2026-05-26）  
**関連**: Issue #45 完了後の次フェーズ

> Phase 2-1（Vanilla JS + Railway API）が完了してから実装に着手する。  
> 引き継ぎパック: `new_chat_handover_pack_phase2.md`（Naoya ローカル）

---

## 1. 目的

- Vanilla JS（2 HTML）を **React SPA** に移行
- ホスティングを **GitHub Pages → Vercel** に移行（完了）
- BE（Railway）は現行 API をそのまま利用

---

## 2. フェーズ

| フェーズ | 内容 | 担当 |
|---|---|---|
| 2-1 | FE API 統合（Vanilla） | Cursor ✅ 仕様: `frontend-api-integration.md` |
| 2-2 | React 設計確定・本仕様の詳細化 | Claude |
| 2-3 | React 実装・PR | Cursor |
| 2-4 | Vercel デプロイ・本番確認 | Naoya |

---

## 3. 確定した設計事項（Phase 2-2 実装済み）

| 項目 | 決定内容 |
|---|---|
| ビルド | Vite 6 |
| 状態管理 | Context API + useReducer（Redux 不使用） |
| スタイル | 旧 `style.css` を `src/styles/App.css` にコピー |
| 移行方式 | パターンA（一括書き換え） |
| API 層 | `src/services/api.js` + `src/hooks/useAPI.js` |
| ディレクトリ | `src/` をプロジェクトルート直下に配置（`frontend/` サブディレクトリではない） |
| ホスティング | Vercel（`vercel.json` で SPA ルーティング設定済み） |

---

## 4. 実装済みディレクトリ構成

詳細は `docs/architecture.md` を参照。

---

## 5. API 統合（React 時）

Vanilla の `07-api.js` 相当を `api-service.js` に集約:

```javascript
// 例: 問題生成
export async function generateProblem(payload) {
  const res = await fetch(`${API_BASE_URL}/api/generate-problem`, { ... });
  ...
}
```

エンドポイント定数は Phase 2-1 の `CONFIG.ENDPOINTS` と同一。

---

## 6. 完了定義（Phase 2-2 時点）

- [x] 論理 4 タブが React で動作
- [x] Railway BE 経由で生成・採点・complete が動作
- [x] Vercel デプロイ確認
- [ ] 思考トレーニングのステップ制採点（役割A〜D3）→ Phase 2-3 で対応
- [ ] 過去問フィルタ UI（難易度別） → Phase 2-3 または別 Issue で対応

---

## 7. 参考

- `docs/specification/frontend/frontend-api-integration.md`
- `docs/architecture.md`（React SPA 構成）
