# ADR-0003: Frontend を Vanilla JS から React + Vite に移行

**日付**: 2026-05-26
**ステータス**: Accepted
**決定者**: Naoya

---

## コンテキスト

`legacy/` の Vanilla JS 構成は機能追加と状態管理の複雑化に伴い、変更耐性と保守性の課題が顕在化していた。

## 決定内容

フロントエンド実装を React 18 + Vite ベースへ段階移行し、旧実装は `legacy/` に参照用アーカイブとして残す。

## 選択肢と却下理由

| 選択肢 | 却下理由 |
|---|---|
| Vanilla JS を継続 | 状態管理と機能拡張時の保守コストが高い |
| React + Vite に移行（採用） | コンポーネント分割と状態管理の明確化が可能 |

## 結果・影響

`src/` 配下で機能ごとの責務分割が進み、ロジック・UI・API 連携の変更が段階的に実施しやすくなった。

## 関連ドキュメント

- `docs/DESIGN_DECISION_HISTORY.md`
- `docs/specification/frontend/frontend-react.md`
- `docs/architecture.md`
