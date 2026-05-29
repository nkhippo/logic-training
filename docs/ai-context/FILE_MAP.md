# FILE_MAP: 何を知りたいか → どのファイルを読むか

**最終更新**: 2026-05-29

## リポジトリ基本情報
→ `docs/ai-context/REPO.md`

## 開発ルール・行動規範
→ `/CLAUDE.md`
→ `.cursor/rules/dev-flow.mdc`
→ `docs/DEVELOPMENT_POLICY.md`
→ `docs/dev-flow.md`

## サービス全体のビジョン・背景
→ `docs/PROJECT_CONTEXT.md`

## ドキュメント記載基準
→ `docs/DOCUMENT_GUIDELINES.md`
→ `docs/TERMS.md`

## リポジトリ構成・索引
→ `docs/FILE_STRUCTURE.md`
→ `docs/README.md`

## 要件定義
→ `docs/requirements/<機能名>.md`
- 共通要件: `docs/requirements/common.md`
- 論理トレーニング共通: `docs/requirements/logic/overview.md`
- 穴埋めタブ: `docs/requirements/logic/fill.md`
- 要約タブ: `docs/requirements/logic/summary.md`
- 批判読みタブ: `docs/requirements/logic/critique.md`
- 空雨傘タブ: `docs/requirements/logic/ame.md`
- 思考トレーニング共通: `docs/requirements/thinking/overview.md`
- 思考トレーニング採点・振り返り: `docs/requirements/thinking/scoring.md`

## 仕様書（実装詳細）
→ `docs/specification/<機能名>.md`
- 共通仕様: `docs/specification/common.md`
- 論理トレーニングUI共通: `docs/specification/logic/ui-shared.md`
- 穴埋めタブ: `docs/specification/logic/fill.md`
- 要約タブ: `docs/specification/logic/summary.md`
- 批判読みタブ: `docs/specification/logic/critique.md`
- 空雨傘タブ: `docs/specification/logic/ame.md`
- 思考トレーニング共通: `docs/specification/thinking/overview.md`
- 思考トレーニングステップ: `docs/specification/thinking/steps.md`
- 思考トレーニングAPI: `docs/specification/thinking/api.md`
- 思考トレーニングデータ: `docs/specification/thinking/data.md`
- Backend / Railway: `docs/specification/backend/specification_railway_phase1_4.md`
- Frontend API統合: `docs/specification/frontend/frontend-api-integration.md`
- Frontend React化: `docs/specification/frontend/frontend-react.md`

## Cursor 実装指示（タイプCのみ）
→ `docs/cursor-instructions/`
- 一覧: `docs/cursor-instructions/README.md`
- Backend Phase 1-3: `docs/cursor-instructions/cursor_instruction_backend_phase1_3.md`
- Backend base: `docs/cursor-instructions/cursor_instruction_phase1-3_backend_base.md`
- Railway Phase 1-4: `docs/cursor-instructions/cursor_instruction_railway_phase1_4.md`
- Frontend API integration: `docs/cursor-instructions/cursor_instruction_frontend_api_integration.md`
- ドキュメント再構成: `docs/cursor-instructions/cursor_instruction_doc_restructure.md`
- ドキュメント整合性修正: `docs/cursor-instructions/cursor_instruction_doc_integrity_fix.md`
- 旧ドキュメント索引作成: `docs/cursor-instructions/cursor_instruction_doc_index.md`
- 環境分離: `docs/cursor-instructions/cursor_instruction_block_a_environments.md`
- 自動化基盤: `docs/cursor-instructions/cursor_instruction_block_b_automation.md`
- OAuth MCP: `docs/cursor-instructions/cursor_instruction_block_c_oauth_mcp.md`

## セットアップ・運用
- 総合セットアップ: `docs/setup/COMPREHENSIVE_SETUP_GUIDE.md`
- GitHub Projects: `docs/setup/GITHUB_PROJECTS_SETUP.md`
- Google Sheets: `docs/setup/GOOGLE_SHEETS_SETUP.md`
- Obsidian: `docs/setup/OBSIDIAN_SETUP.md`
- セットアップ完了サマリー: `docs/setup/2025-01-24_setup-summary.md`
- Claude.ai MCP OAuth: `docs/CLAUDE_AI_MCP_SETUP.md`
- Projects Knowledge更新: `docs/PROJECTS_KNOWLEDGE_UPDATE_GUIDE.md`
- タスクトラッカーURL: `docs/TASK_TRACKER_URL.md`
- インフラ構成: `docs/INFRASTRUCTURE.md`
- 障害対応: `docs/TROUBLESHOOTING.md`

## 補助・移行ドキュメント
- 要件定義（旧形式）: `docs/requirements.md`
- 思考トレーニング要件（旧形式）: `docs/requirements-thinking.md`
- 仕様書（旧形式）: `docs/specification.md`
- 思考トレーニング仕様（旧形式）: `docs/specification-thinking.md`
- React state / API URL引き継ぎ: `docs/cursor-handoff-react-state-api-url-check.md`
- バグ知見: `docs/bug-knowledge.md`
- GASカラム定義: `docs/gas-column-headers.md`
- 設計判断履歴: `docs/DESIGN_DECISION_HISTORY.md`

## ADR
- ADR一覧: `docs/adr/README.md`
- Hosting移行: `docs/adr/0001-hosting-github-pages-to-vercel.md`
- Backend移行: `docs/adr/0002-backend-gas-to-railway.md`
- Frontend移行: `docs/adr/0003-frontend-vanilla-to-react.md`
- AIモデル: `docs/adr/0004-ai-model-claude-sonnet.md`
- MCP JSON-RPC: `docs/adr/0005-mcp-remote-json-rpc.md`
