# claude.ai MCP 連携セットアップガイド

## 概要

このドキュメントは、claude.ai カスタムコネクタで GitHub OAuth 認証を設定し、
Claude から直接 GitHub Issue を作成できる状態にするための手順書です。

## 前提条件

- GitHub OAuth App が作成されていること
- BEサーバーが OAuth フロー実装済みで、Railway にデプロイされていること
- Railway に以下の環境変数が設定されていること：
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_OWNER`
  - `GITHUB_REPO`
  - `MCP_API_BASE_URL`

## claude.ai での設定手順

### Step 1: カスタムコネクタを削除（既存のものが無認証の場合）

Settings → Connectors → 「thinkgrindai GitHub」の ... メニュー → 削除

### Step 2: 新規カスタムコネクタを追加

Settings → Connectors → **Add connector**

- **Name**: `thinkgrindai GitHub`
- **URL**: `https://thinkgrindai-production.up.railway.app/mcp`
- **Authentication**: OAuth 2.0
  - **Client ID**: （GitHub OAuth App の Client ID）
  - **Client Secret**: （GitHub OAuth App の Client Secret）

### Step 3: 認証フローの確認

「Add」をクリック → 初回使用時に GitHub ログイン画面が出現

→ ログイン → 「Authorize」 → OAuth トークン取得完了

### Step 4: Issue 作成テスト

このChat（claude.ai）で以下を伝えてください：

```
カスタムコネクタの設定が完了しました。
テストとして以下の Issue を作成してください：

タイトル: 【Test】MCP OAuth 連携テスト
本文: GitHub OAuth を使用した Issue 作成の動作確認
ラベル: ready-for-cursor
```

Claude が直接 GitHub に Issue を作成します。

## トラブルシューティング

### 「Could not register with connector's sign-in service」エラー

**原因**: Client ID / Client Secret が間違っているか、OAuth App の設定が不完全

**対策**:
1. GitHub OAuth App の設定を再確認
2. Client ID / Client Secret を正確に入力（コピペ推奨）
3. Authorization callback URL が正確か確認：
   `https://thinkgrindai-production.up.railway.app/mcp/callback`

### Issue が作成されない

**原因**: access_token が無効、または GitHub 権限不足

**対策**:
1. Claude から GitHub 再ログイン（Connectors で再認証）
2. GitHub OAuth App の権限スコープが `repo` になっているか確認

## 関連ドキュメント

- `backend/src/api/mcp.js` - OAuth フロー実装
- `docs/cursor-instructions/block-a-b-c.md` - Block A-C 実装指示書
