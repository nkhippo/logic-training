# Issue Bridge Snapshot

- Issue: #158
- Title: MCPサーバー機能拡張：Issue編集・コメント・画像アップロード対応
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/158
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-28T15:24:39Z

## Body

# 概要

現在のMCPサーバーは `create_issue` と `list_issues` のみ対応。
ClaudeからIssueの訂正・補足・画像添付ができるよう、以下4ツールを追加実装する。

---

## 追加するツール

### 1. `get_issue`
起票済みIssueの詳細を取得する（編集・確認の前処理として使用）。

**パラメータ**
- `issue_number` (number, required): Issue番号

**返却値**: タイトル・本文・状態・ラベル・作成日時

---

### 2. `update_issue`
起票済みIssueのタイトル・本文・状態を更新する。

**パラメータ**
- `issue_number` (number, required): Issue番号
- `title` (string, optional): 新しいタイトル
- `body` (string, optional): 新しい本文（Markdown）
- `state` (string, optional): `open` または `closed`
- `labels` (array, optional): 新しいラベル配列

---

### 3. `add_comment`
Issue にコメントを追加する。

**パラメータ**
- `issue_number` (number, required): Issue番号
- `body` (string, required): コメント本文（Markdown）

---

### 4. `upload_image`
画像をGitHub Releases assetsにアップロードし、Markdownで使えるURLを返す。

**パラメータ**
- `filename` (string, required): ファイル名（例: `screenshot.png`）
- `content_base64` (string, required): base64エンコードされた画像データ
- `mime_type` (string, optional): MIMEタイプ（デフォルト: `image/png`）

**返却値**: アップロード先のURL（`![](url)` 形式でIssue本文・コメントに埋め込み可能）

**実装方針**
- GitHub Releases assets APIを使用: `POST /repos/{owner}/{repo}/releases/{release_id}/assets`
- 画像アップロード専用のdraftリリース（例: `image-assets`）を1つ用意し、そこに集約する

---

## 想定ユースケース

1. Claudeが `create_issue` で起票 → 内容に誤りがあった場合 `update_issue` で修正
2. スクリーンショットをClaudeに渡す → `upload_image` でURL取得 → `add_comment` or `update_issue` の本文に埋め込み
3. 実装完了後に `update_issue` で `state: closed` にクローズ

---

## 備考

- GitHub Releases assets APIはpublic repoであれば認証なしで画像URLを参照可能
- base64受け渡しはClaude（MCP client）側で画像をbase64変換して渡す想定
- `upload_image` の実装が複雑な場合、まず `get_issue` / `update_issue` / `add_comment` の3ツールを先行リリースしても可
