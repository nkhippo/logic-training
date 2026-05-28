# Issue Bridge Snapshot

- Issue: #140
- Title: hotfix: okコメントでCursorがマージを実行しない問題（承認コメントのAUTO:変換）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/140
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-28T13:56:46Z

## Body

## 背景・目的

Cursor Automation のトリガーが `AUTO:` で始まるコメントのみのため、
レビュワーが `ok` や `LGTM` などの承認コメントを書いても Cursor が反応せず、
マージが実行されない問題が発生している。

## 問題の詳細

現在の動作：
1. Cursorが実装完了 → PR作成
2. Naoyaさんが `ok` とコメント
3. **何も起きない**（Cursorがトリガーされない）

期待する動作：
1. Cursorが実装完了 → PR作成
2. Naoyaさんが `ok` / `LGTM` / `approve` とコメント
3. **Cursorがマージを実行する** または **マージ可能な状態であることを通知する**

## 対応方針

以下の2つのアプローチのうち、**Aを優先実装**する。

### A）承認コメントをAUTO:に変換するBridgeを追加（推奨）

`.github/workflows/issue-to-automation-bridge.yml` に以下を追加：

- トリガー: PRコメントが `ok` / `lgtm` / `approve` / `ship it`（大文字小文字不問）
- 処理: 該当PRに `AUTO: This PR has been approved by the reviewer. Please merge this PR if all checks pass.` をコメント投稿
- 条件: PRのbaseブランチが `develop` または `main` であること

### B）CLAUDE.mdにレビュー承認の書き方を明記（補足ドキュメント）

```markdown
## PRレビュー時の承認コメント

Cursorにマージを指示する場合は以下のコメントを使うこと：

AUTO: approved. Please merge this PR.

`ok` や `LGTM` だけではCursorは反応しない。
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #140` を記載）

PR本文には以下を必ず記載すること：

---
## 変更内容
- （何をどう変えたか、箇条書き）

## 確認済み事項
- （lint・テスト・動作確認の結果）

## 未確認・懸念点
- （あれば記載。なければ「なし」）

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
