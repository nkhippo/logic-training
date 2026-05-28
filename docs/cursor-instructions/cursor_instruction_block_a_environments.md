# Cursor 指示書（記録）：Block A 環境構成整備

**区分**: 完了済み記録  
**関連Issue**: 不明

## 実装概要
- Vite + React + Railway 構成への移行に伴い、環境差分（ローカル/検証/本番）を整理。
- Remote MCP の OAuth 設定値と運用手順を文書化。

## 主な変更ファイル
- `docs/dev-flow.md`
- `docs/architecture.md`
- `docs/CLAUDE_AI_MCP_SETUP.md`
- `.env.example`
- `backend/.env.example`

## 完了確認方法
1. `docs/dev-flow.md` に環境別運用（main/develop/local）の記述があること。
2. `docs/CLAUDE_AI_MCP_SETUP.md` に OAuth callback と `/mcp` の疎通確認手順があること。
3. `.env.example` / `backend/.env.example` に必要な環境変数例が揃っていること。
