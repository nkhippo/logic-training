# Issue Bridge Snapshot

- Issue: #257
- Title: 【chore / Important】develop → main コンフリクト解消 PR を自動作成する workflow を追加
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/257
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:58:53Z

## Body

🤖 **Claude より**

## 背景・目的

develop ブランチを main にマージしようとした際、コンフリクト（変更の衝突）が発生することがある。現状はこれを手動で解消する必要があり、リリース時の負担になっている。

コンフリクト発生時に自動でコンフリクト解消用 PR を作成する workflow を追加し、Naoya の作業負担を軽減する。

旧 Issue #162 はクローズ済み（Bridge のみマージ）のため、内容を刷新して新規起票。

## 実装範囲

### 作成対象ファイル
- `.github/workflows/` 配下に新規 workflow

### 具体的な実装内容

以下の動作をする workflow を作成する：

```
トリガー:
  - pull_request イベント
  - アクション: synchronize（develop への push）
  - ブランチ: develop → main の PR が存在する場合に限る

または:

トリガー:
  - push イベント
  - ブランチ: develop

動作:
  1. develop → main の PR が存在するか確認する
  2. コンフリクトが発生しているか確認する（gh pr view でマージ可能状態を確認）
  3. コンフリクトが発生している場合：
     a. `conflict-resolution/develop-main-YYYYMMDD-HHMMSS` ブランチを作成
     b. develop ブランチの内容を main にリベースまたはマージ試行
     c. コンフリクト解消用 PR を自動作成（title: "chore: develop → main コンフリクト解消"）
     d. PR 本文に「コンフリクトが発生しているファイル一覧」を記載する
  4. コンフリクトがない場合は何もしない
```

> 実装前に `docs/setup/` 配下や既存 workflow を確認し、develop → main マージに関する既存の仕組みがあれば参照すること。

### 実装が複雑な場合の代替案

GitHub の PR 自動作成だけでなく、「コンフリクトが発生しています。解消が必要なファイル: XXX」という **Issue Comment / PR Comment で通知するだけ**でも十分な場合は、その簡略版から始めてよい。実装の複雑さ次第で Issue Comment に提案を書き、Naoya と相談すること。

## 完了定義

- develop ブランチへの push 時またはマージ試行時に、コンフリクトの有無を自動検知する状態
- コンフリクトがある場合に自動でコンフリクト解消用 PR が作成される状態（または通知が発行される状態）
- 自動作成された PR の本文に「コンフリクトが発生しているファイル」が記載されている状態
- コンフリクトがない場合は何も起きない状態

## テスト観点

- テスト用にコンフリクトを発生させ、workflow が起動することを確認する
- コンフリクト解消用 PR が自動作成されること（または通知が発行されること）を確認する
- コンフリクトがない場合に不要な PR が作成されないことを確認する

## 非対象範囲

- コンフリクトの自動解消（Cursor が自動で解消コードを書く）は対象外 — あくまで「解消用 PR を作成」または「通知する」まで
- release-please との連携は対象外
- hotfix ブランチへの対応は対象外

## 依存関係

- #251（Webhook）と #253（Bridge 廃止）が先行マージされていることが望ましい
- 本 Issue 自体は他の Issue と独立して進めることも可能

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-conflict-resolution-workflow.md`

内容:
```
# develop→main コンフリクト解消 PR 自動作成
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット → push
2. PR 作成（**base = `develop`**、ラベル = `chore`、`Closes #XXX`）

---
## 概要
## 変更内容
## 変更理由
- develop→main マージ時のコンフリクト解消を手動でやっていたため

## 確認済み事項
- [ ] コンフリクト発生時に workflow が起動することを確認
- [ ] 不要な PR が作成されないことを確認

## 未確認・懸念点
- 実装が複雑な場合の代替案を採用した場合はここに記載

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。**実装が複雑で代替案を採用したい場合は Issue Comment で相談すること。**

---
_Claude による自動投稿_
