# トラブルシューティング集

**最終更新**: 2026-05-28

開発・運用中に頻発する問題と対処方法を記録する。
新しい問題が発生したら必ずこのファイルに追記すること。

---

## 目次
1. [Railway 関連](#1-railway-関連)
2. [Vercel 関連](#2-vercel-関連)
3. [MCP / claude.ai 連携](#3-mcp--claudeai-連携)
4. [GitHub Actions 関連](#4-github-actions-関連)
5. [ローカル開発](#5-ローカル開発)
6. [Cursor 自動実装](#6-cursor-自動実装)

---

## 1. Railway 関連

### 1-1. デプロイされない / 古いコードが動く

**症状**: コードを push したが Railway 上で古い挙動が残っている

**対処**: ダッシュボードで「Deploy Latest Commit」を使用（Redeploy は同一コミットを再実行するため不可）

### 1-2. `/health` が 503 を返す

**原因と対処**:
1. 環境変数の不足 → Railway Variables で必須変数を確認
2. Claude API キーが無効 → Anthropic Console で再確認
3. Google Sheets 認証エラー → Sheets API 有効化を確認

### 1-3. Staging と Production が同じ Sheets を使っている

**現状**: 開発段階のため同一Sheet運用（明示的に許容）  
**将来対応**: 本運用開始時に別Sheet分離を検討

---

## 2. Vercel 関連

### 2-1. ビルドエラー：`VITE_API_BASE_URL is not defined`

**対処**:
1. Vercel ダッシュボード → Settings → Environment Variables
2. Production と Preview の両方に `VITE_API_BASE_URL` を設定

### 2-2. develop マージしたのに Preview が更新されない

**対処**:
1. Vercel ダッシュボードで develop ブランチが連携されているか確認
2. 「Ignored Build Step」設定で develop が除外されていないか確認

---

## 3. MCP / claude.ai 連携

### 3-1. 「Could not register with connector's sign-in service」

**対処**: `docs/CLAUDE_AI_MCP_SETUP.md` のトラブルシューティングを参照

### 3-2. claude.ai で `POST /mcp` が 404

**対処**:
1. Remote MCP（JSON-RPC）実装に切り替え済みか確認
2. `backend/src/api/mcp-remote.js` の存在を確認
3. `curl` で `/.well-known/oauth-protected-resource/mcp` が 200 を返すか確認

### 3-3. Issue は作成できるが ready-for-cursor ラベルが付かない

**対処**: `backend/src/api/mcp.js` または `backend/src/mcp/protocol-handler.js` で label パラメータを確認

---

## 4. GitHub Actions 関連

### 4-1. approval.yml が動かない

**確認事項**:
1. コメント投稿者が `nkhippo` か
2. PR Comments（Issue Comments ではない）か
3. 承認トリガーワードが含まれているか（`approve` / `OK` / `lgtm` / `👍` / `✅`）

### 4-2. PR の自動マージが失敗

**原因と対処**:
- CI が失敗している → CI ログを確認
- ブランチ保護の必須チェックが満たされていない → CI 通過を待つ
- マージコンフリクト → develop を pull して解消

### 4-3. develop → main の自動 PR が作成されない

**確認事項**:
1. `auto-pr-to-main.yml` が `.github/workflows/` に存在するか
2. develop ブランチへのマージが完了しているか（push イベントが発火しているか）

### 4-4. sync-wiki.yml が動かない

**確認事項**:
1. `.github/wiki/` 配下のファイルが変更されているか
2. GitHub Wiki が有効になっているか（Repository Settings → Features）

---

## 5. ローカル開発

### 5-1. `npm run dev` 起動エラー

**対処**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 5-2. CORS エラー（FE から BE への通信失敗）

**対処**:
- `.env.local` の `VITE_API_BASE_URL` を確認
- `backend/src/index.js` の cors 設定で `localhost:5173` を許可しているか確認

---

## 6. Cursor 自動実装

### 6-1. Cursor が Issue を検知しない

**確認事項**:
1. Mac が起動・Cursor が起動しているか
2. Cursor の Background Agent が有効か
3. Issue に `ready-for-cursor` ラベルが付与されているか
4. ポーリング間隔が経過しているか（最大5分）

### 6-2. Cursor が誤った実装をする

**対処**: PR Comments に「修正依頼: 〜〜してください」と書く  
→ Cursor が検知して同 PR に追加コミット

### 6-3. Cursor が PR Comments の質問に返答しない

**確認事項**:
1. `.cursor/rules/dev-flow.mdc` に「PR Comments 監視・返答」ルールが記載されているか
2. Cursor の Background Agent が PR Comments も監視対象にしているか

---

## 新規問題の記録ルール

```markdown
### X-Y. （症状）

**原因**: （根本原因）

**対処**:
1. （手順1）

**関連Issue**: #XXX  
**発見日**: YYYY-MM-DD
```
