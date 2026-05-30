# Issue Bridge Snapshot

- Issue: #251
- Title: 【chore / Critical】trigger-cursor-on-ready.yml を新規作成（Cursor 自動起動 Webhook workflow の実装）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/251
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:57:02Z

## Body

🤖 **Claude より**

## 背景・目的

thinkgrindai の CI/CD 設計上の **Critical 級ブロッカー**として確認された問題。

### 現状

CLAUDE.md に記載の Cursor 自動起動フローは以下を想定している：

```
① Naoya が GitHub Issue に ready-for-cursor ラベルを付与
② GitHub Actions（trigger-cursor-on-ready.yml）が Webhook へ Issue 情報を POST
③ Cursor が起動し、Issue を正本として実装を開始
```

しかし **`trigger-cursor-on-ready.yml` がリポジトリに存在しない**ため、このフローが一度も動いていない。

代わりに `issue-to-automation-bridge.yml`（Bridge 方式）が稼働しており、Bridge PR のみが作成される状態になっている。今日起票済みの docs 改修シリーズ（#229〜#249）を含む全 Issue が、Cursor に届いていない根本原因。

### 参考情報

- CLAUDE.md「現在の運用フロー（Webhook 自動起動）」に期待動作が記載済み
- `docs/setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md` に調査結果あり（参照すること）
- Bridge 方式廃止 Issue は別 Issue で対応（本 Issue は Webhook 側の追加のみ）

## 実装範囲

### 新規作成対象ファイル
- `.github/workflows/trigger-cursor-on-ready.yml`

### 具体的な実装内容

CLAUDE.md「現在の運用フロー（Webhook 自動起動）」の記述に従い、以下の動作をするワークフローを作成する：

```yaml
トリガー条件:
  - issues イベント
  - アクション: labeled
  - ラベル: ready-for-cursor

動作:
  1. Issue 番号・タイトル・本文・URL を取得する
  2. Cursor Automation の Webhook エンドポイントへ以下を POST する：
     - issue_number
     - issue_title
     - issue_body
     - issue_url
     - repository（nkhippo/ThinkGrindAi）
  3. Webhook エンドポイント URL は GitHub Secrets（CURSOR_WEBHOOK_URL 等）から取得する
  4. POST 失敗時はワークフローを失敗終了させ、Naoya に通知が届くようにする
```

### 実装前に必ず確認すること

1. `docs/setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md` を全体通読する
2. `.cursor/automation-bridge/issue-219.md`（旧 Issue スナップショット）を参照する
3. 現行の `issue-to-automation-bridge.yml` の動作を理解した上で、**本 workflow とどう共存するか**を Issue Comment で Naoya に報告する（新 Webhook が動いたら Bridge は廃止予定だが、本 Issue 完了時点での並行期間は許容する）
4. Webhook エンドポイント URL の Secrets 名を確認し、存在しない場合は Issue Comment で Naoya に確認する

### 既存 Bridge workflow（issue-to-automation-bridge.yml）との関係

本 Issue では Bridge workflow の削除は行わない。削除は次の Issue（Bridge 完全廃止）で実施する。  
本 Issue 完了時点では **新 Webhook と旧 Bridge が並行稼働**する状態を一時的に許容する。

## 完了定義

- `.github/workflows/trigger-cursor-on-ready.yml` がリポジトリに存在する状態
- `ready-for-cursor` ラベルを Issue に付与したとき、GitHub Actions が起動して Cursor Automation Webhook へ POST が送られる状態
- Webhook エンドポイントへの POST が成功/失敗にかかわらずワークフローのログで確認できる状態
- POST 失敗時にワークフローが `failure` で終了し、Naoya に GitHub Actions の失敗通知が届く状態
- テスト用 Issue（番号は任意）に `ready-for-cursor` ラベルを付与してワークフローが起動したことをログで確認できる状態

## テスト観点

- `gh workflow list --repo nkhippo/ThinkGrindAi` で `trigger-cursor-on-ready` が表示される
- テスト Issue に `ready-for-cursor` ラベルを付与し、Actions タブでワークフローが起動していることを確認する
- ワークフローのログに Webhook への POST リクエストと結果（成功/失敗）が含まれている
- 既存の `issue-to-automation-bridge.yml` が引き続き動作していること（本 Issue では削除しない）

## 非対象範囲

- `issue-to-automation-bridge.yml` の削除・修正（別 Issue で対応）
- `approval-comment-automation-bridge.yml` の削除（別 Issue で対応）
- `.cursor/automation-bridge/` ディレクトリの整理（別 Issue で対応）
- Cursor 側の Webhook 受信設定（Cursor Automation 側の設定）
- Webhook 認証・セキュリティ強化（将来 Issue）

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-webhook-workflow-add.md`

内容:
```
# trigger-cursor-on-ready.yml 新規作成
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `chore`、`Closes #XXX` を記載）
4. PR 本文（採用版フォーマット）：

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Cursor 自動起動の根幹 workflow が存在しなかったため

## 確認済み事項
- [ ] ワークフローが Actions タブで起動確認済み
- [ ] Webhook POST のログが確認できる
- [ ] 既存 Bridge workflow は影響を受けていない

## 未確認・懸念点
- （Webhook URL の Secrets 設定状況など）

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。特に **Webhook エンドポイント URL や Secrets の確認が必要な場合**は、必ず Issue Comment に書いてから止まること：

```
【作業中断】
- 現在の状態：
- 中断理由：
- 次に必要なこと：
```

---
_Claude による自動投稿_
