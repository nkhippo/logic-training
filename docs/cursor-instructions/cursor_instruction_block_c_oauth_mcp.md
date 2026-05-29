# Cursor 指示書（記録）：Block C OAuth MCP 対応

**区分**: 完了済み記録  
**関連Issue**: #85

## 実装概要
- claude.ai カスタムコネクタ向けに Remote MCP（JSON-RPC over HTTP）を導入。
- OAuth discovery (`/.well-known/*`) と token/authorize フローを整備。

## 主な変更ファイル
- `backend/src/api/mcp-remote.js`
- `backend/src/api/mcp.js`
- `backend/src/mcp/protocol-handler.js`
- `docs/CLAUDE_AI_MCP_SETUP.md`
- `docs/architecture.md`

## 完了確認方法
1. `GET /.well-known/oauth-protected-resource/mcp` が 200 を返すこと。
2. `POST /mcp` の `initialize` が成功すること。
3. claude.ai でコネクタ登録後に `create_issue` / `list_issues` が利用可能であること。
