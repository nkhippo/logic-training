# Issue Bridge Snapshot

- Issue: #204
- Title: chore: bridge PRのコメント・本文を改善する
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/204
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T14:44:49Z

## Body

🤖 **Claude より**

## 背景・目的

`issue-to-automation-bridge.yml` および `approval-comment-automation-bridge.yml` が生成するPR本文・コメントが読みにくく、Cursorへの指示も不十分。
以下3箇所を改善し、人間の可読性とCursorへの指示品質を向上させる。

---

## 実装範囲

対象ファイル：
- `.github/workflows/issue-to-automation-bridge.yml`
- `.github/workflows/approval-comment-automation-bridge.yml`

ソースコードの変更なし。YAMLのシェルスクリプト部分のみ編集。

---

## 変更内容（3箇所）

### A: bridge PR本文（`issue-to-automation-bridge.yml` の `Create or find PR` ステップ）

**現状：**
```
PR_BODY="Bridge PR auto-created from issue #${ISSUE_NUMBER}. Issue URL: ${ISSUE_URL}. Snapshot file: ${SNAPSHOT_FILE}. Do not merge this PR manually unless you intentionally want to keep the snapshot changes."
```

**変更後：**
```bash
PR_BODY=$(printf '## 🤖 Auto Bridge PR\n\n| 項目 | 値 |\n|---|---|\n| 関連Issue | #%s |\n| Issue URL | %s |\n| スナップショット | `%s` |\n\n---\n\n> ⚠️ このPRはCursorの自動実装トリガー用です。\n> Cursorによる実装PRが別途作成されます。**このPRを手動マージしないでください。**' \
  "${ISSUE_NUMBER}" "${ISSUE_URL}" "${SNAPSHOT_FILE}")
```

---

### B: Cursorへのトリガーコメント（`issue-to-automation-bridge.yml` の `Comment AUTO trigger on PR` ステップ）

**現状：**
```
COMMENT_BODY="AUTO: Issue #${ISSUE_NUMBER} を処理してください。 ${MARKER} 要件: Issue本文を正本として読み、最小変更で実装し、不明点はPRへ質問コメント、修正後はこのPRへcommit。"
```

**変更後：**
```bash
COMMENT_BODY=$(printf '%s\nAUTO: Issue #%s を実装してください。\n\nIssue本文を正本として読み、記載された完了定義・作業の進め方に従って進めること。' \
  "${MARKER}" "${ISSUE_NUMBER}")
```

---

### C: approvalコメント（`approval-comment-automation-bridge.yml` の `gh pr comment` 呼び出し）

**現状：**
```
--body "AUTO: This PR has been approved by the reviewer. Please merge this PR if all checks pass."
```

**変更後：**
```bash
--body "AUTO: このPRはレビュアーによって承認されました。すべてのチェックが通過していることを確認し、このPRをdevelopにマージしてください。マージ後、関連するIssueがCloseされていることを確認すること。"
```

---

## 完了定義

以下の状態になっていること：

- `issue-to-automation-bridge.yml` のPR本文がMarkdown表形式で出力される
- `issue-to-automation-bridge.yml` のCursorトリガーコメントが「Issue本文を正本として読め」という指示を含む
- `approval-comment-automation-bridge.yml` のapprovalコメントが日本語になっている
- 既存のワークフローのロジック・トリガー条件は一切変更されていない

---

## テスト観点

- `issue-to-automation-bridge.yml` の構文エラーがないこと（GitHub ActionsのYAML lint）
- `approval-comment-automation-bridge.yml` の構文エラーがないこと
- ワークフローのトリガー条件（`ready-for-cursor` ラベル付与・`/auto` コメント）が従来通り動作すること

---

## 非対象範囲

- ワークフローのトリガー条件・ロジックの変更
- スナップショットファイルの内容・生成ロジックの変更
- 他のワークフローファイルへの変更

---

## Obsidian記録
※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: /Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-bridge-comment-improve.md

内容:
```
# bridge PRコメント・本文の改善
## 実装内容
- bridge PR本文をMarkdown表形式に変更
- Cursorトリガーコメントをシンプル化
- approvalコメントを日本語化
## 変更ファイル
- .github/workflows/issue-to-automation-bridge.yml
- .github/workflows/approval-comment-automation-bridge.yml
## 関連Issue
- #（このIssue番号）
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット・push
2. PR作成（`base: develop`・ラベル `chore`・`Closes #このIssue番号` を記載）
3. PR本文に以下を記載すること：

```
## 概要
## 変更内容
## 変更理由
## テスト内容
- [ ] YAMLの構文エラーなし
- [ ] 既存ロジックへの影響なし
## 関連Issue
Closes #このIssue番号
```

途中で止まってよいのは「不明点がある場合」のみ。その場合はこのIssueにコメントしてから止まること。

---
_Claude による自動投稿_
