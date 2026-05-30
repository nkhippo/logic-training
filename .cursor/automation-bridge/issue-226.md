# Issue Bridge Snapshot

- Issue: #226
- Title: chore: Bridge PR関連の旧workflowを削除する（#214作業漏れ）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/226
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T02:29:03Z

## Body

🤖 **Claude より**

## 背景・目的

Issue #214（Bridge PR廃止）の作業漏れとして、以下の2つのworkflowファイルが削除されずに残っている。

- `issue-to-automation-bridge.yml`：`ready-for-cursor` ラベル付与や `/auto` コメントをトリガーにBridge PRを作成する旧workflow。Issue #219のWebhook方式移行により完全に不要。**現在も `ready-for-cursor` ラベルに反応して動作するため、Webhook起動と二重起動するリスクがある。**
- `approval-comment-automation-bridge.yml`：PRコメントの `ok` をAUTO変換する旧workflow。Bridge PRが廃止された今は不要。

---

## 実装範囲（対象ファイル明示）

### 削除するファイル
- `.github/workflows/issue-to-automation-bridge.yml`
- `.github/workflows/approval-comment-automation-bridge.yml`

### 変更しないファイル
- その他すべて

---

## 完了定義

以下の状態になっていること：

- `.github/workflows/issue-to-automation-bridge.yml` がリポジトリに存在しない
- `.github/workflows/approval-comment-automation-bridge.yml` がリポジトリに存在しない

---

## テスト観点

- 削除後、`ready-for-cursor` ラベルを付与してもBridge PRが作成されないこと（GitHub Actionsのログで確認）

---

## 非対象範囲

- その他のworkflowファイル
- `docs/` 配下

---

## Obsidian記録

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/2026-05-30-bridge-workflow-cleanup.md`

内容:
```
# Bridge関連workflow削除（#214作業漏れ対応）

## 実装内容
- issue-to-automation-bridge.yml 削除
- approval-comment-automation-bridge.yml 削除

## 変更ファイル
-

## 関連Issue
- #214（Bridge PR廃止）
- #（このIssue番号）
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: develop・ラベル: chore・Closes #このIssue番号 を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
