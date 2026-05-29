# Issue Bridge Snapshot

- Issue: #189
- Title: feat: MCP に PR 操作ツールを追加（create / merge / get）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/189
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T11:29:24Z

## Body

## 概要

現在の ThinkGrindAi MCP サーバーには `create_issue` / `list_issues` / `get_file_content` / `list_directory` のみが実装されている。

Claude が develop → main のマージや PR 作成を自律的に行えるよう、PR 操作ツールを MCP に追加する。

## 追加するツール（3つ）

### 1. `create_pull_request`
```ts
// 入力
{
  title: string;
  body: string;
  head: string;       // 例: "develop"
  base: string;       // 例: "main"
  labels?: string[];
  draft?: boolean;
}
// 出力: { number, url, title }
```

### 2. `merge_pull_request`
```ts
// 入力
{
  pull_number: number;
  merge_method?: "merge" | "squash" | "rebase"; // default: "squash"
  commit_title?: string;
}
// 出力: { merged, message }
```

### 3. `get_pull_request`
```ts
// 入力
{
  pull_number: number;
}
// 出力: { number, title, state, mergeable, labels, head, base }
```

## 実装方針

- 既存の `src/mcp/` 以下に `pullRequest.ts`（または同等）を追加
- GitHub REST API（Octokit）を使用（既存の `create_issue` と同じ方式）
- 権限：既存の `GITHUB_TOKEN` に `pull_requests: write` が必要（確認すること）

## 完了条件

- Claude（claude.ai）から `create_pull_request` / `merge_pull_request` / `get_pull_request` が呼び出せる
- develop → main の squash merge が Claude の指示で実行できる

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: main・ラベル: feature・`Closes #189` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
