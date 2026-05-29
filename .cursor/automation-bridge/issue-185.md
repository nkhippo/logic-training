# Issue Bridge Snapshot

- Issue: #185
- Title: feat: MCP に get_file_content / list_directory ツールを追加（トークン効率化）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/185
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T11:03:12Z

## Body

🤖 **Claude より**

## 背景・目的

現在 Claude が GitHub 上のファイルを読む際は `web_fetch` で blob ページ（HTML）を取得している。
これにより以下の問題が発生している。

- ナビゲーション・フッター・メタタグ等のHTML装飾がファイル内容に混入する
- 実際のファイル内容に対してトークン消費が **5〜10倍** 程度になる
- Claude が「必要な情報」に到達するまでのステップが増える

GitHub Contents API（`GET /repos/{owner}/{repo}/contents/{path}`）を MCP ツールとして追加することで、純粋なファイル内容だけを最小トークンで取得できるようにする。

関連: Issue #158（`get_issue` / `update_issue` / `add_comment` の追加）と同一サーバーに実装する。

---

## 実装範囲

対象ファイル: `backend/src/mcp/` 配下の MCP サーバー実装（#158 と同じファイル群）

### 追加するツール

#### 1. `get_file_content`

指定パスのファイル内容を取得する。

**パラメータ**
- `path` (string, required): リポジトリルートからの相対パス（例: `docs/CLAUDE.md`、`src/components/logic/SummaryTab.tsx`）
- `ref` (string, optional): ブランチ名またはコミットSHA（デフォルト: `main`）

**返却値**
- `content` (string): ファイルの内容（UTF-8テキスト）
- `sha` (string): ファイルのSHA（update_file実装時に必要になるため今から返しておく）
- `size` (number): バイト数

**実装方針**
- GitHub Contents API: `GET /repos/nkhippo/ThinkGrindAi/contents/{path}?ref={ref}`
- レスポンスの `content` フィールドはbase64エンコードされているのでデコードして返す
- ファイルが存在しない場合は `404` に準じたエラーメッセージを返す

---

#### 2. `list_directory`

指定パスのディレクトリ内ファイル・フォルダ一覧を取得する。

**パラメータ**
- `path` (string, required): ディレクトリパス（例: `docs/requirements/logic`）。ルートは `""` または `"/"` で指定
- `ref` (string, optional): ブランチ名またはコミットSHA（デフォルト: `main`）

**返却値**
- `entries` (array): 各エントリのオブジェクト配列
  - `name` (string): ファイル名またはフォルダ名
  - `path` (string): リポジトリルートからの相対パス
  - `type` (string): `"file"` または `"dir"`
  - `size` (number): ファイルの場合はバイト数、ディレクトリの場合は `0`

**実装方針**
- `get_file_content` と同じエンドポイント（パスがディレクトリの場合は自動的に一覧が返される）
- `type: "file"` と `type: "dir"` でフィルタリングして返す

---

## 完了定義

以下の状態になっていること：

- Claude が `get_file_content` ツールを呼び出し、`docs/CLAUDE.md` の内容がHTMLなしで返ってくること
- Claude が `list_directory` ツールを呼び出し、`docs/requirements/logic` のファイル一覧（name / path / type）が返ってくること
- 存在しないパスを指定した場合、エラーメッセージが返ること（サーバーがクラッシュしないこと）
- `ref` を省略した場合は `main` ブランチを参照していること

## テスト観点

- `get_file_content("docs/CLAUDE.md")` → ファイル内容のテキストが返る
- `get_file_content("docs/CLAUDE.md", ref="develop")` → develop ブランチのファイル内容が返る
- `get_file_content("docs/nonexistent.md")` → エラーメッセージが返る（クラッシュしない）
- `list_directory("")` → リポジトリルートのファイル・フォルダ一覧が返る
- `list_directory("docs/requirements/logic")` → logic フォルダ内のファイル一覧が返る

## 非対象範囲

- ファイルの作成・更新・削除（write系操作）
- バイナリファイル（画像等）の取得
- 1MB超のファイル（GitHub API の制限内で対応）
- Issue #158 のツール（`get_issue` / `update_issue` / `add_comment`）との統合テスト

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: **develop**、ラベル: feature、本文に `Closes #182` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
