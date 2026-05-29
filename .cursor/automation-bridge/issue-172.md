# Issue Bridge Snapshot

- Issue: #172
- Title: fix: Bridge PR本文に Closes #XXX を必須化（タイトル記載では自動closeされない問題）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/172
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T01:50:24Z

## Body

## 背景・目的

PRタイトルに `(#XXX)` と番号を記載しているが、
GitHubの自動close機能は**PR本文**に `Closes #XXX` / `Fixes #XXX` がある場合のみ動作する。

タイトルへの記載では自動closeされないため、Issueがopenのまま残り続ける問題が発生している。

---

## 原因の詳細

```
❌ 効果なし（タイトルへの記載）
PR タイトル: "hotfix: workflow修正（#168）"

✅ 正しい（本文への記載）
PR 本文: "Closes #168"
```

---

## 対策

### 1. `issue-to-automation-bridge.yml` のPR本文テンプレートを修正

Bridge が自動生成するPR本文に `Closes #<Issue番号>` を必ず含める：

```yaml
- name: Create PR
  run: |
    gh pr create \
      --title "chore: auto bridge for issue #${{ steps.issue.outputs.number }}" \
      --body "## 概要
Bridge PR（スナップショット用）。実装コミットが入るまでマージしないこと。

## 関連Issue
Closes #${{ steps.issue.outputs.number }}" \
      --base ${{ steps.base.outputs.branch }}
```

### 2. `CLAUDE.md` の「作業の進め方」を強化

PR本文テンプレートに以下を明記：

```markdown
## ⚠️ 重要
PRタイトルに #XXX を書いてもIssueは自動closeされない。
必ずPR**本文**に `Closes #XXX` を記載すること。
タイトルへの記載は参考情報に過ぎない。
```

---

## 完了定義

以下の状態になっていること：
- Bridge が自動生成するPR本文に `Closes #XXX` が含まれている
- CLAUDE.md にタイトルではなく本文への記載が必要である旨が明記されている
- 既存のBridgeフローが壊れていない

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #172` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- PRタイトルへの番号記載ではIssueが自動closeされないため

## テスト内容
- Bridge PRの本文に `Closes #XXX` が含まれていること確認
- 既存Bridgeフローへの影響なし確認

## 関連Issue
Closes #172

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
