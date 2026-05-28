# Issue Bridge Snapshot

- Issue: #134
- Title: docs: Cursor自動運用 失敗時ランブック作成（再実行ルール・エスカレーション基準）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/134
- Trigger: issue_comment/created
- Updated At (UTC): 2026-05-28T14:28:38Z

## Body

## 背景・目的

Cursor Automation の自動実行チェーンが稼働済み。
失敗時の再実行・エスカレーション手順が未定義のため、
失敗が発生した際に対処方法が分からず放置されるリスクがある。

本Issueでは失敗時の対応フローをドキュメント化し、`docs/operations/cursor-failure-runbook.md` として整備する。

---

## 成果物

### `docs/operations/cursor-failure-runbook.md` の新規作成

以下の内容を含むこと：

#### 1. 失敗パターンの切り分け

| パターン | 判断方法 | 対処 |
|---------|---------|------|
| Bridge失敗 | GitHub Actions の Run が失敗 | `/auto retry` をIssueコメントに投稿 |
| Automation失敗 | Cursor の Run History が Failed | PR Commentsに失敗内容を確認し、`AUTO: retry` をコメント |
| 両方失敗 | ActionsもCursorも失敗 | Naoyaが手動でCursorに指示 |

#### 2. 再実行ルール

```markdown
## 再実行コマンド
- Bridge再実行: IssueまたはPRに `/auto` をコメント
- Automation再実行: PRに `AUTO: retry` をコメント

## 最大再試行回数
- 自動再試行: 2回まで
- 3回目以降: Naoyaが内容を確認してから判断

## タイムアウト基準
- Bridgeが5分以内に完了しない → 失敗とみなして再実行
- Automationが30分以内にPRを出さない → 失敗とみなして確認
```

#### 3. エスカレーション基準

```markdown
## Claudeへエスカレーションする条件
- 同一Issueで2回以上失敗した場合
- エラーメッセージの意味が不明な場合
- コンフリクトが発生した場合
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `docs`、本文に `Closes #134` を記載）

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

## Auto Command

/auto retry
