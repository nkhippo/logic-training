# Issue Bridge Snapshot

- Issue: #164
- Title: chore: Bridge workflowのベースブランチをラベルで分岐（docs/chore→main、feature/bug→develop）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/164
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T00:07:03Z

## Body

## 背景・目的

現在のBridge workflow（`issue-to-automation-bridge.yml`）は、
Issueのラベルに関わらず全てのPRを `develop` ベースで作成している。

CLAUDE.mdのラベル別フロールール：
- `docs` / `chore` → main直行
- `feature` / `bug` → develop経由

このルールがBridgeに反映されていないため、
`docs` / `chore` IssueもdevelopにPRが作られ、
定期的に develop → main のコンフリクト解消作業が発生している。

---

## 実装内容

### `issue-to-automation-bridge.yml` の修正

PRのベースブランチをIssueのラベルで分岐させる：

```yaml
- name: Determine base branch
  id: base
  run: |
    LABELS="${{ steps.issue.outputs.labels }}"
    if echo "$LABELS" | grep -qE '"(docs|chore)"'; then
      echo "branch=main" >> $GITHUB_OUTPUT
    else
      echo "branch=develop" >> $GITHUB_OUTPUT
    fi

- name: Create PR
  run: |
    gh pr create \
      --base ${{ steps.base.outputs.branch }} \
      --title "..." \
      --body "..."
```

### 分岐ルール

| ラベル | ベースブランチ |
|--------|--------------|
| `docs` | `main` |
| `chore` | `main` |
| `feature` | `develop` |
| `bug` | `develop` |
| その他 | `develop`（デフォルト） |

---

## 完了定義

以下の状態になっていること：
- `docs` ラベル付きIssueのBridge PRが `main` ベースで作成される
- `chore` ラベル付きIssueのBridge PRが `main` ベースで作成される
- `feature` ラベル付きIssueのBridge PRが `develop` ベースで作成される
- 既存のBridgeフロー（ブランチ作成・AUTO:コメント投稿）が壊れていない

---

## 期待される効果

```
修正前：
  docs/chore Issue → develop PR → コンフリクト発生 → 手動解消

修正後：
  docs/chore Issue → main PR → 直接マージ → コンフリクトなし ✅
  feature/bug Issue → develop PR → develop経由 → 従来通り ✅
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #163` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- docs/chore IssueがdevelopベースPRになっていたためコンフリクトが頻発していた

## テスト内容
- docs/chore ラベルIssueでBridge PRのbaseがmainになっていること確認
- feature ラベルIssueでBridge PRのbaseがdevelopになっていること確認
- 既存Bridgeフローへの影響なし確認

## 関連Issue
Closes #163

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
