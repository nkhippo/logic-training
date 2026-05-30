# Issue Bridge Snapshot

- Issue: #223
- Title: chore: Issueclose時のready-for-cursorラベル除去とapproval.ymlのBridge PR判定削除
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/223
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T02:13:41Z

## Body

🤖 **Claude より**

## 背景・目的

Issue #219 の Webhook 方式移行に伴い、`ready-for-cursor` ラベルが Cursor の起動トリガーになった。これにより以下の2つの問題が生じている。

### 問題1：`ready-for-cursor` がIssueclose後も残存する（重大）

PRマージ → Issueclose後も `ready-for-cursor` ラベルがIssueに残り続ける。将来的にWebhookのリトライや別のActionsがIssueを触った際、予期せずCursorが再起動するリスクがある。

### 問題2：`approval.yml` にBridge PR判定が残存している（軽微）

`auto/issue-*` ブランチへの `ok` コメントをスキップする処理が残っている。Bridge PRはIssue #214で廃止済みのため、このコードは不要。現状実害はないが、混乱の元になる。

---

## 実装範囲（対象ファイル明示）

### 変更するファイル①：`.github/workflows/auto-close-issue.yml`

Issueをcloseする処理の直後に、`ready-for-cursor` ラベルを除去するステップを追加する。

追加するステップのイメージ：
```yaml
- name: Remove ready-for-cursor label from closed issues
  uses: actions/github-script@v7
  with:
    script: |
      for (const issueNumber of closedIssueNumbers) {
        try {
          await github.rest.issues.removeLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNumber,
            name: 'ready-for-cursor'
          });
        } catch (error) {
          // ラベルが存在しない場合は無視
          core.info(`Label not found on #${issueNumber}: ${error.message}`);
        }
      }
```

※ 既存のclose処理と同じ `numbers` セットを使い回すこと。ラベルが存在しない場合はエラーを無視する。

### 変更するファイル②：`.github/workflows/approval.yml`

以下を削除する：
- `Resolve PR head branch` ステップ内の `is_bridge_pr` 判定（`auto/issue-*` チェック）
- `Skip merge for bridge PR (auto/issue-*)` ステップ全体
- `Merge on approve` の `is_bridge_pr != 'true'` 条件（単純に `action == 'approve'` のみでマージ）

削除後の `Merge on approve` ステップの条件：
```yaml
if: |
  github.event.comment.user.login == 'nkhippo' &&
  steps.intent.outputs.action == 'approve'
```

---

## 完了定義

以下の状態になっていること：

- PRマージ後、対応するIssueがcloseされ、かつ `ready-for-cursor` ラベルが除去されている
- `ready-for-cursor` ラベルを持たないIssueがcloseされた場合もエラーにならない
- `approval.yml` に `is_bridge_pr` の変数・判定・スキップステップが存在しない
- `ok` コメントで全PRが条件なく自動マージされる（Bridge PR判定なし）

---

## テスト観点

- `auto-close-issue.yml` の変更後、`Closes #N` を含むPRをマージしたとき Issue #N がcloseされ `ready-for-cursor` ラベルが除去されること
- Issue #N に `ready-for-cursor` ラベルがない場合もエラーにならないこと
- `approval.yml` の変更後、通常PRに `ok` コメントしたとき自動マージが動作すること

---

## 非対象範囲

- `ready-for-cursor` の付与タイミングのルール変更（CLAUDE.md運用ルールの話であり別途対応）
- `labeler.yml` / `pr-label.yml`（変更不要）
- `docs/` 配下

---

## Obsidian記録

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/2026-05-30-label-cleanup.md`

内容:
```
# ラベル管理改善（ready-for-cursor残存・Bridge PR判定削除）

## 実装内容
- auto-close-issue.yml: Issueclose時にready-for-cursorラベルを除去
- approval.yml: Bridge PR（auto/issue-*）判定・スキップ処理を削除

## 変更ファイル
-

## 関連Issue
- #214（Bridge PR廃止）
- #219（Webhook方式移行）
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
