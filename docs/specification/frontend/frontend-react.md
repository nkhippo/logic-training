# 仕様書（計画）：フロントエンド React 化（Phase 2-2〜2-4）

**最終更新**: 2026-05-26  
**ステータス**: 計画・未実装  
**関連**: Issue #45 完了後の次フェーズ

> Phase 2-1（Vanilla JS + Railway API）が完了してから実装に着手する。  
> 引き継ぎパック: `new_chat_handover_pack_phase2.md`（Naoya ローカル）

---

## 1. 目的

- Vanilla JS（2 HTML）を **React SPA** に移行
- ホスティングを **GitHub Pages → Vercel** に移行（予定）
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

## 3. 設計上の未決定事項（Phase 2-2 で確定）

1. **ビルド**: Vite vs Create React App（**Vite 推奨**）
2. **状態管理**: Context API のみ vs Redux
3. **スタイル**: 既存 `style.css` 流用 vs Tailwind 導入
4. **移行方式**: パターン A（一括リフレッシュ）推奨 vs 段階的
5. **API 層**: `useAPI` カスタムフック + `services/api-service.js`

---

## 4. 目標ディレクトリ（案）

```
thinkgrindai/
├── frontend/                 # 新規 React アプリ（案）
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── LogicTraining/
│   │   │   └── ThinkingTraining/
│   │   ├── hooks/
│   │   │   ├── useAPI.js
│   │   │   └── useUser.js
│   │   └── services/
│   │       └── api-service.js
│   ├── package.json
│   └── vite.config.js
├── js/                       # Phase 2-3 完了まで共存
└── backend/                  # 変更なし
```

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

## 6. 完了定義（Phase 2-3）

- [ ] 論理 4 タブ + 思考トレーニングが React で動作
- [ ] Railway BE 経由で生成・採点・complete
- [ ] GAS 過去問同期が動作
- [ ] Vercel プレビューで Naoya テスト完了

---

## 7. 参考

- `docs/specification/frontend/frontend-api-integration.md`
- `docs/architecture.md`（現行 Vanilla 構成）
