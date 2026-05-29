# Issue Bridge Snapshot

- Issue: #147
- Title: chore: Bridge workflow にステップレベル自動リトライを追加（max 3回）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/147
- Trigger: issue_comment/created
- Updated At (UTC): 2026-05-28T14:59:43Z

## Body

## 背景・目的

Bridge workflow（`issue-to-automation-bridge.yml`）の実行時、
`gh pr create` などのGitHub API呼び出しが一時的なネットワークエラーや
レート制限により失敗することがある。

現状は手動で `/auto` コメントを再投稿しないと復旧できないため、
ステップレベルの自動リトライを追加して手動介入を不要にする。

---

## 実装内容

### `.github/workflows/issue-to-automation-bridge.yml` の修正

失敗しやすい以下のステップに `nick-fields/retry@v3` を適用する：

1. **ブランチ作成・push ステップ**
2. **`gh pr create` ステップ**
3. **`gh pr comment`（AUTO:コメント投稿）ステップ**

#### 実装例

```yaml
- name: Create PR with retry
  uses: nick-fields/retry@v3
  with:
    max_attempts: 3
    retry_wait_seconds: 30
    on_retry_command: echo "Retrying PR creation..."
    command: |
      gh pr create \
        --title "chore: auto bridge for issue #${{ steps.issue.outputs.number }}" \
        --body "..." \
        --base develop \
        --label chore
```

### リトライ設定値

| 設定 | 値 | 理由 |
|-----|-----|------|
| max_attempts | 3 | 3回失敗なら根本原因あり → 手動対応 |
| retry_wait_seconds | 30 | API制限の一時的な解消を待つ |
| timeout_minutes | 5 | 1ステップの上限 |

### 全リトライ失敗時の通知

3回すべて失敗した場合、対象IssueにコメントでNaoyaさんに通知する：

```yaml
- name: Notify failure
  if: failure()
  run: |
    gh issue comment ${{ steps.issue.outputs.number }} \
      --body "⚠️ Bridge自動リトライが3回失敗しました。手動での確認が必要です。\n\n再実行する場合はこのIssueに \`/auto\` とコメントしてください。"
```

---

## 完了定義

以下の状態になっていること：
- `issue-to-automation-bridge.yml` の主要ステップに `nick-fields/retry@v3` が適用されている
- リトライ設定が max_attempts: 3 / retry_wait_seconds: 30 になっている
- 全リトライ失敗時にIssueへの通知コメントが投稿される
- 既存の正常フローが壊れていない

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #145` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（1〜2行で何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- （背景）

## テスト内容
- lint/テスト通過確認
- 既存Bridgeフローへの影響なし確認

## 関連Issue
Closes #145

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

## Auto Command

/auto
