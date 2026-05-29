# Issue Bridge Snapshot

- Issue: #162
- Title: chore: develop → main コンフリクト解消 PR 作成（2回目）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/162
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T00:06:24Z

## Body

## 背景・目的

`develop` → `main` のマージ時にコンフリクトが発生しており、自動マージ不可の状態。
22コミット・26ファイルの変更がmainに未反映。

## 作業内容

1. `chore/merge-develop-to-main` ブランチを作成
2. `main` ベースに `develop` の内容をマージ
3. コンフリクトを解消する
   - 解消方針：**develop側の変更を優先**
   - 不明な箇所はPR Commentsに質問を書いて止まること
4. lint・テスト確認
5. PR作成

## 注意事項

- マージ後に既存機能が壊れていないか確認すること
- 不明点があればPR Commentsに書いて止まること。勝手に判断しない
- `auto/issue-*` ブランチには触らないこと

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #161` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- develop → main マージのためのコンフリクト解消

## テスト内容
- lint/テスト通過確認
- 既存機能への影響なし確認

## 未確認・懸念点
- （あれば記載。なければ「なし」）

## 関連Issue
Closes #161

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
