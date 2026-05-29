# Issue Bridge Snapshot

- Issue: #174
- Title: chore: PULL_REQUEST_TEMPLATE.md 作成（Closes #XXX 記載漏れの恒久対策）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/174
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T01:50:40Z

## Body

## 背景・目的

Cursorが作成するPRに `Closes #XXX` が書かれていないケースが継続して発生している。
#118・#143でCLAUDE.mdのPR本文テンプレートを整備したが、
Cursorがテンプレートに従わずPRを作成するケースが散見される。

GitHubのPRテンプレート機能（`.github/PULL_REQUEST_TEMPLATE.md`）を使うことで、
PR作成時に自動的にテンプレートが挿入されるようにする。

---

## 実装内容

### `.github/PULL_REQUEST_TEMPLATE.md` を新規作成

```markdown
## 概要
<!-- 1〜2行で「何をしたか・なぜしたか」を説明 -->

## 変更内容
- 

## 変更理由
- 

## テスト内容
- [ ] lint / テスト通過
- [ ] 該当機能を動作確認済み
- [ ] 既存機能への影響なし

## 未確認・懸念点
<!-- あれば記載。なければ削除 -->
- 

## 関連Issue
<!-- ⚠️ タイトルへの記載では自動closeされません。必ずここに記載してください -->
Closes #
```

### `CLAUDE.md` に注意書きを追記

```markdown
## ⚠️ PR作成時の必須事項

- `Closes #XXX` は必ずPR**本文**に記載すること
- PRタイトルに `(#XXX)` と書いてもIssueは自動closeされない
- `.github/PULL_REQUEST_TEMPLATE.md` のテンプレートを必ず埋めること
```

---

## 完了定義

以下の状態になっていること：
- `.github/PULL_REQUEST_TEMPLATE.md` が作成されている
- PR作成時にテンプレートが自動挿入される
- CLAUDE.mdに `Closes #XXX` はPR本文への記載が必要である旨が明記されている
- 既存のPRフローが壊れていない

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #173` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- CursorがPR本文にCloses #XXXを書かないケースが継続発生しているため

## テスト内容
- PULL_REQUEST_TEMPLATE.mdが作成されていること確認
- CLAUDE.mdに注意書きが追記されていること確認

## 関連Issue
Closes #173

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
