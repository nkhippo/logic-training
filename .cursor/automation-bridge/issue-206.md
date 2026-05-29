# Issue Bridge Snapshot

- Issue: #206
- Title: chore: auto-pr-to-main.yml YAMLエラー修正 + 全ラベル対象に拡張（develop-first対応）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/206
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T14:48:43Z

## Body

🤖 **Claude より**

## 背景・目的

`auto-pr-to-main.yml` は develop → main の自動PR作成を担うワークフローだが、
**line 43 の YAML シンタックスエラーにより、全 Run が Failure になっており機能していない。**

さらに develop-first 方針への切り替え（2026-05-29）に伴い、
現行の発火条件（`feature` / `bug` ラベルのみ）を全ラベルに拡張する必要がある。

本 Issue で以下の2点をまとめて修正する：
1. YAML シンタックスエラーの修正
2. 発火条件を全ラベル（`docs` / `chore` / `feature` / `bug`）に拡張

---

## 実装範囲

対象ファイル: `.github/workflows/auto-pr-to-main.yml`（1ファイルのみ）

---

## 現状のエラー

line 43 付近、`--body` に渡すヒアドキュメント内でのマルチラインが原因。
GitHub Actions のワークフロー構文エラー：
```
You have an error in your yaml syntax on line 43
```

## 修正内容

### 1. YAML エラー修正

`--body` に渡す文字列を単一行または正しくエスケープされた形式に書き換える。

### 2. 発火条件を全ラベルに拡張

**変更前:**
```yaml
if: |
  github.event.pull_request.merged == true &&
  (contains(github.event.pull_request.labels.*.name, 'feature') ||
  contains(github.event.pull_request.labels.*.name, 'bug'))
```

**変更後:**
```yaml
if: |
  github.event.pull_request.merged == true &&
  (contains(github.event.pull_request.labels.*.name, 'feature') ||
   contains(github.event.pull_request.labels.*.name, 'bug') ||
   contains(github.event.pull_request.labels.*.name, 'docs') ||
   contains(github.event.pull_request.labels.*.name, 'chore'))
```

---

## 完了定義

- `.github/workflows/auto-pr-to-main.yml` が YAML バリデーションエラーなく parse される
- develop に `docs` ラベル付き PR をマージしたとき、develop → main の PR が自動作成される
- 既存の `feature` / `bug` の動作が変わらない

---

## テスト観点

- `act` または GitHub Actions のワークフロー構文チェックツールで YAML エラーがないことを確認
- `docs` ラベルのマージ後に develop → main PR が作成されることを確認（または dry-run）

---

## 非対象範囲

- `approval.yml` の変更
- PR マージ後の develop 同期処理（別 Issue で対応予定）

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: **develop**・ラベル: `chore`・`Closes #206` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
