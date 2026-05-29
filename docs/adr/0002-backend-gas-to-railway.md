# ADR-0002: Backend を GAS から Node.js + Railway に移行

**日付**: 2026-05-25
**ステータス**: Accepted
**決定者**: Naoya

---

## コンテキスト

初期構成では Google Apps Script をバックエンドとして利用していたが、API ルーティング拡張・運用監視・OAuth/MCP 対応を進めるうえで構造的制約があった。

## 決定内容

バックエンド基盤を GAS から Node.js Express + Railway に移行する。

## 選択肢と却下理由

| 選択肢 | 却下理由 |
|---|---|
| GAS を継続 | API 拡張性と運用性が不足し、将来機能に追従しづらい |
| Node.js Express + Railway（採用） | API 構造の明確化、CI/CD、MCP/OAuth 連携に適合 |

## 結果・影響

`backend/` 配下で API を明示的に管理できるようになり、MCP 機能や CI ワークフローの拡張がしやすくなった。

## 関連ドキュメント

- `docs/DESIGN_DECISION_HISTORY.md`
- `docs/specification/backend/specification_railway_phase1_4.md`
- `docs/INFRASTRUCTURE.md`
