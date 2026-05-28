# Issue Bridge Snapshot

- Issue: #149
- Title: hotfix: auto/issue-* PRが okコメントで誤マージされるのを防ぐガード追加
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/149
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-28T14:56:06Z

## Body

## 背景・目的

Issue #140 で「okコメントでCursor Automationをトリガーする」仕組みを実装しようとしているが、
その前に **Bridge PR（`chore: auto bridge for issue-*`）が `ok` コメントで誤マージされる問題** を先に塞ぐ必要がある。

Bridge PRはスナップショット用途であり、実装コミットが付くまでマージしてはいけない。
しかし現状、`ok` コメント → `approval.yml` → 自動マージ のフローが Bridge PR にも適用されてしまっている。

---

## 修正内容

### `.github/workflows/approval.yml`（または同等のワークフロー）に除外条件を追加

以下のいずれかの条件に該当するPRは `ok` / `approve` コメントによる自動マージをスキップする：

**条件A：ラベルによる除外（推奨）**
```yaml
if: |
  !contains(github.event.pull_request.labels.*.name, 'chore: auto bridge')
```

**条件B：PRタイトルによる除外**
```yaml
if: |
  !startsWith(github.event.pull_request.title, 'chore: auto bridge')
```

**条件C：ブランチ名による除外**
```yaml
if: |
  !startsWith(github.event.pull_request.head.ref, 'auto/issue-')
```

→ **条件Cが最も確実**。`auto/issue-*` ブランチからのPRは自動マージ対象外とする。

---

## 完了定義

以下の状態になっていること：
- `auto/issue-*` ブランチからのPRに `ok` コメントしても自動マージされない
- 通常の実装PRには引き続き `ok` コメントで自動マージが機能する
- 既存の approval フローが壊れていない

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #149` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- （背景）

## テスト内容
- lint/テスト通過確認
- auto/issue-* PRへのokコメントでマージされないこと確認

## 関連Issue
Closes #149

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
