# thinkgrindai-backend

Node.js Express ベースのバックエンドサーバー。Claude API + Google Sheets 連携。

## セットアップ

```bash
cd backend
cp .env.example .env.local
# .env.local に CLAUDE_API_KEY / GOOGLE_SHEETS_CREDENTIALS / GOOGLE_SHEETS_ID を記入
npm install
npm run dev
```

## API

- `GET /health` — ヘルスチェック
- `POST /api/generate-problem` — 問題生成
- `POST /api/score-answer` — 採点・評価

詳細は Issue #40 および `docs/cursor-instructions/cursor_instruction_phase1-3_backend_base.md` を参照。

## テスト

```bash
npm test
npm run test:coverage
```

## デプロイ

Railway へのデプロイは Phase 1-4 で実施予定。
