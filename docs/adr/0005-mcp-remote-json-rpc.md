# ADR-0005: MCP は Remote JSON-RPC 構成で提供

**日付**: 2026-05-28
**ステータス**: Accepted
**決定者**: Naoya

---

## コンテキスト

Claude 連携の MCP を安定運用するために、認可フロー・ツール公開・拡張方法を統一した実装形態が必要だった。

## 決定内容

MCP の提供方式を Remote MCP + JSON-RPC エンドポイント（`/mcp`）で統一し、OAuth とツール公開をバックエンドで管理する。

## 選択肢と却下理由

| 選択肢 | 却下理由 |
|---|---|
| ローカル専用 MCP 構成 | 運用共有と接続手順の標準化が難しい |
| Remote MCP JSON-RPC（採用） | 認可フローとツール公開を一元化しやすい |

## 結果・影響

MCP の接続・認可・ツール追加がバックエンド実装で管理されるようになり、外部連携時の運用フローが明確になった。

## 関連ドキュメント

- `docs/DESIGN_DECISION_HISTORY.md`
- `docs/INFRASTRUCTURE.md`
- `docs/CLAUDE_AI_MCP_SETUP.md`
