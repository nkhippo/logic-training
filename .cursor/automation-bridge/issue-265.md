# Issue Bridge Snapshot

- Issue: #265
- Title: 【chore / Critical】ready-for-cursor ラベル付与時に Cursor を自動起動する Webhook workflow を追加（旧 #219 新規起票）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/265
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T07:01:42Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 に Cursor による調査で判明した **最重要ブロッカー**。

`ready-for-cursor` ラベル付与時に Cursor を起動する workflow（`trigger-cursor-on-ready.yml`）が **develop ブランチに存在しない**。旧 Issue #219 で実装予定だったが、Bridge PR（#220）のみマージされ本体未実装のまま CLOSED。

**影響範囲**：
- 今日までに起票した **すべての Issue（#229〜#249 を含む）** が、`ready-for-cursor` ラベルを付与されても Cursor が一度も起動していない
- Bridge PR（`.cursor/automation-bridge/issue-XXX.md` のみ）が作成・マージされて Issue が誤クローズされ続けていた根本原因
- この Issue が未解決のまま他の Issue を進めても、Cursor の自動起動は機能しない

**このIssueは最優先で対応すること。完了するまで他の chore/feature Issue は着手しないこと。**

## 実装範囲

### 修正・作成対象ファイル
- `.github/workflows/trigger-cursor-on-ready.yml`（**新規作成**）

### 具体的な実装内容

#### 1. 実装前に現状を必ず調査する

```bash
# 現在の workflow 一覧を確認
ls .github/workflows/

# 関連ドキュメントを読む
cat docs/setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md
cat .github/workflows/issue-to-automation-bridge.yml
```

`docs/setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md` に Issue ラベル起点の Cursor 起動調査結果が記載されているので、**必ず全体を読んでから実装を開始**する。

#### 2. `trigger-cursor-on-ready.yml` の要件

```yaml
# トリガー
on:
  issues:
    types: [labeled]

# 条件
# - 付与されたラベルが 'ready-for-cursor' のとき
# - Issue が OPEN のとき

# 実行内容
# - Cursor Automation Webhook エンドポイント（Repository Secret: CURSOR_WEBHOOK_URL）へ POST
# - POST body に含める最低限の情報:
#   - issue.number
#   - issue.title
#   - issue.body
#   - issue.html_url
#   - repository.full_name

# 失敗時の動作
# - Webhook POST が失敗（HTTP 非 2xx）した場合、対象 Issue に Comment を投稿する
#   「⚠️ Cursor 自動起動に失敗しました。手動で Cursor に Issue URL を渡してください。 URL: {issue.html_url}」
```

#### 3. Repository Secret の確認

Webhook URL の格納先 Secret 名は `docs/setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md` を参照して確認する。Secret が設定されていない場合は PR Comments に「`CURSOR_WEBHOOK_URL` Secret の設定が必要です」と書いてから止まること。

#### 4. 既存の `issue-to-automation-bridge.yml` は触らない

Bridge workflow の廃止は **別 Issue（本 Issue の次）** で対応する。本 Issue では `trigger-cursor-on-ready.yml` の新規作成のみ行う。

## 完了定義

- `.github/workflows/trigger-cursor-on-ready.yml` が develop ブランチに存在する状態
- `ready-for-cursor` ラベルを Issue に付与したとき、Cursor Automation Webhook に POST が送信される状態
  - テスト方法：テスト用 Issue に `ready-for-cursor` ラベルを付与し、GitHub Actions のログで workflow が起動・POST したことを確認
- Webhook POST が失敗したとき、対象 Issue に自動でコメントが投稿される状態
- 既存の `issue-to-automation-bridge.yml` が変更されていない状態

## テスト観点

- GitHub Actions の「Actions」タブで `trigger-cursor-on-ready.yml` のトリガー条件（issues: labeled）が確認できること
- テスト用 Issue（またはサンドボックス）で `ready-for-cursor` ラベルを付与し、workflow が実際に動作することを GitHub Actions ログで確認する
- Webhook URL が不正なとき、Issue Comment に失敗通知が出ることを確認する
- `ready-for-cursor` 以外のラベル（例: `docs`）を付与しても workflow が起動しないことを確認する

## 非対象範囲

- `issue-to-automation-bridge.yml` の変更・廃止は対象外（次の Issue で対応）
- Cursor Automation サービス自体の設定・修正は対象外（Naoya が別途確認）
- Bridge PR（`.cursor/automation-bridge/`）スナップショットファイルの整理は対象外
- PR ラベル変更・PR コメントをトリガーにする拡張は対象外（将来対応）

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-webhook-workflow-added.md`
（Issue #245 がマージ済みの場合は `implementations/` に変更）

内容:
```
# Webhook workflow 追加（Cursor 自動起動の根幹）
## 実装内容
-
## 変更ファイル
-
## 関連Issue
- #XXXX
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `chore`、`Closes #XXX` を記載）
4. PR 本文：

---
## 概要
（1〜2 行で要約）

## 変更内容
-

## 変更理由
- Bridge PR のみマージが続いていた根本原因（Cursor 自動起動 workflow の欠如）を解消するため

## 確認済み事項
- [ ] `trigger-cursor-on-ready.yml` が存在することを確認
- [ ] GitHub Actions ログで workflow トリガーを確認
- [ ] `issue-to-automation-bridge.yml` が変更されていないことを確認

## 未確認・懸念点
- （`CURSOR_WEBHOOK_URL` Secret 設定状況などあれば記載）

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。必ず Issue コメントに書いてから止まること。

```
【作業中断】
- 現在の状態：
- 中断理由：
- 次に必要なこと：
```

---
_Claude による自動投稿_
