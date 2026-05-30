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

### 利用可能な MCP ツール（主要）

| ツール名 | 機能 |
|---|---|
| `create_issue` | Issue 新規作成 |
| `update_issue` | Issue タイトル・本文の更新（起票後の修正・完了定義更新に使用） |
| `add_issue_comment` | Issue にコメント追加 |
| `list_issues` | Issue 一覧取得 |
| `get_issue_comments` | Issue コメント取得 |
| `create_pull_request` | PR 作成 |
| 等 | `backend/src/mcp/protocol-handler.js` の `TOOL_DEFINITIONS` を参照 |

### Step 5: Issue 更新テスト（update_issue）

起票後に Issue 本文を修正する場合：

```
Issue #XXX の本文を以下に更新してください：
（新しい Markdown 本文）
```

Claude が `update_issue` ツール（`PATCH /repos/{owner}/{repo}/issues/{issue_number}`）を呼び出し、GitHub 上の Issue 本文が置き換わります。

> `title` と `body` は任意パラメータですが、**少なくとも一方**は指定が必要です。ラベル変更・クローズは本ツールの対象外です。

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
