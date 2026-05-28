# Issue Bridge Snapshot

- Issue: #156
- Title: chore: main → develop sync（Bridge PRコンフリクト解消）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/156
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-28T15:05:06Z

## Body

## 背景・目的

#149（Bridge PR誤マージガード）などのmainへの変更が developに反映されておらず、
auto/issue-* ブランチとのコンフリクトが発生している。

main → develop を sync してコンフリクトを解消する。

---

## 作業内容

1. `develop` ブランチに `main` の最新内容をマージする
   ```
   git checkout develop
   git merge main
   git push origin develop
   ```
2. コンフリクトが発生した場合は **main側を優先**して解消する
3. 解消後、`auto/issue-*` ブランチも同様に develop をマージして最新化する

---

## 完了定義

以下の状態になっていること：
- `develop` ブランチが `main` の最新コミットを含んでいる
- `auto/issue-152〜155` ブランチでコンフリクトが解消されている
- 既存の Bridge PR（#152〜#155）が「No conflicts」状態になっている

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット・push
2. PR作成（base: `main`、ラベル: `chore`、本文に `Closes #156` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- main → develop sync によるコンフリクト解消

## テスト内容
- コンフリクトなし確認
- 既存ブランチへの影響なし確認

## 関連Issue
Closes #156

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
