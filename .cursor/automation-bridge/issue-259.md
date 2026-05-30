# Issue Bridge Snapshot

- Issue: #259
- Title: 【docs / Important】Cursor 自動運用の失敗時ランブック（docs/dev-flow-runbook.md）を新規作成
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/259
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:59:25Z

## Body

🤖 **Claude より**

## 背景・目的

Cursor 自動起動フロー（Webhook 方式、Issue #251）が整備された後、**「Cursor が途中で止まった」「変なことをした」「PR を作らない」**というトラブルが起きたとき、Naoya が何をすればよいか手順書がない。

`docs/dev-flow-runbook.md` を新規作成し、Cursor 自動運用における典型的なトラブルと対処法を文書化する。

旧 Issue #134 はクローズ済み（Bridge のみマージ）のため、内容を刷新して新規起票。

## 実装範囲

### 作成対象ファイル
- `docs/dev-flow-runbook.md`（新規作成）

### 具体的な内容

以下のセクションを含む `docs/dev-flow-runbook.md` を作成する：

```markdown
# Cursor 自動運用 失敗時ランブック

## 確認手順（まずここから）

1. GitHub Actions タブを確認する
2. 該当 Issue に `ready-for-cursor` ラベルが付いているか確認する
3. Bridge PR（chore: auto bridge for issue #N）が作成されていないか確認する

## トラブル別対処法

### ケース1: ready-for-cursor を付与したが Cursor が起動しない
- GitHub Actions タブで `trigger-cursor-on-ready` workflow が起動しているか確認
- 起動していない → ラベルの付与が正しく完了しているか確認
- 起動しているが Cursor が起動しない → Webhook エンドポイントの状態を確認

### ケース2: Bridge PR（chore: auto bridge for issue #N）が作成される
- Bridge workflow（issue-to-automation-bridge.yml）が残存している
- 対処: Issue #253（Bridge 廃止）が完了しているか確認する
- ⚠️ Bridge PR を手動マージしないこと

### ケース3: Cursor が実装中に止まった
- 該当 Issue の Comments を確認する（Cursor が【作業中断】コメントを書いているはず）
- コメントがない場合: Cursor デスクトップアプリで状況を確認する
- 不明点への回答: Issue Comment に回答を書いてから Cursor デスクトップで再起動する

### ケース4: Cursor が間違った実装をして PR を作った
- PR をクローズする（マージしない）
- Issue Comment に「以下の内容で修正してほしい」と書く
- Cursor デスクトップで再起動する

### ケース5: Cursor が PR を作ったが内容が不完全（[WIP]）
- PR の「未確認・懸念点」セクションを確認する
- 回答が必要な場合は PR Comment に書く
- マージ判断: 完了定義をすべて満たしているか確認してからマージする

## Cursor デスクトップでの手動起動手順

1. Cursor デスクトップアプリを開く
2. 該当 Issue の URL をコピーする
3. Cursor に「以下の Issue を実装してください: <URL>」と伝える

## エスカレーション（Claude への相談）

上記で解決しない場合は Claude との Chat に状況を共有して相談する。
「ThinkGrindAi / サービス相談」Project に症状・再現手順・試したことを書く。
```

> Cursor は上記のセクション構成を参考に、実際の運用状況（workflow 名・ラベル名等）に合わせて内容を作成すること。

## 完了定義

- `docs/dev-flow-runbook.md` が develop ブランチに存在する状態
- 「Cursor が起動しない」「Bridge PR が作られる」「実装中に止まった」という 3 つ以上のトラブルケースが記載されている状態
- 各ケースに「確認手順」と「対処法」が含まれている状態
- Cursor デスクトップでの手動起動手順が含まれている状態

## テスト観点

- `cat docs/dev-flow-runbook.md` でファイルが存在し、内容が読めることを確認
- セクション構成（## トラブル別対処法 等）が含まれていることを目視確認

## 非対象範囲

- トラブルの自動検知・自動復旧は対象外
- Slack / メール通知連携は対象外
- Cursor の内部ログ調査手順は対象外

## 依存関係

- #251（Webhook 追加）と #253（Bridge 廃止）が完了した後に作成する方が内容の正確性が高い
- docs ランブックなので #251/#253 前に起票・起動しても構わないが、**内容は Webhook 方式が前提で書くこと**

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-runbook-creation.md`

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット → push
2. PR 作成（**base = `develop`**、ラベル = `docs`、`Closes #XXX`）

---
## 概要
## 変更内容
- `docs/dev-flow-runbook.md` 新規作成

## 変更理由
- Cursor トラブル時の対処手順が文書化されていなかったため

## 確認済み事項
- [ ] ファイルが存在し、3 ケース以上のトラブル対処法が含まれていること

## 未確認・懸念点
- 

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。

---
_Claude による自動投稿_
