# Issue Bridge Snapshot

- Issue: #253
- Title: 【chore / Critical】Bridge workflow 完全廃止（issue-to-automation-bridge.yml / approval-comment-automation-bridge.yml 削除）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/253
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:57:51Z

## Body

🤖 **Claude より**

## 背景・目的

**前提: 本 Issue は #251（trigger-cursor-on-ready.yml 追加）のマージ完了後に着手すること。**

Bridge 方式（`auto/issue-*` ブランチへの Issue スナップショット作成 → Bridge PR）は、当初 Cursor 自動起動のつなぎ手として機能する予定だったが、以下の問題を引き起こしていた：

1. **Bridge PR が手動マージされる** → `.cursor/automation-bridge/issue-XXX.md` のみが develop に入り、実装 0 件で Issue が自動クローズ
2. **Cursor が自動起動していない** → Bridge を通しても Webhook が存在しないため Cursor に届かない
3. **誤マージを防ぐ仕組みが弱い** → Bridge PR 本文に「手動マージしないでください」と書かれているが無視されてきた

#251 で Webhook 方式（`ready-for-cursor` ラベル → Webhook → Cursor 直接起動）が導入されるため、Bridge 方式は不要になる。本 Issue でこれを完全に廃止する。

### 削除対象 workflow ファイル

| ファイル | 役割（現状） | 状態 |
|---|---|---|
| `.github/workflows/issue-to-automation-bridge.yml` | `ready-for-cursor` 付与時に Bridge PR を作成 | **削除対象** |
| `.github/workflows/approval-comment-automation-bridge.yml` | コメントで Bridge PR を承認・マージ | **削除対象** |

## 実装範囲

### 削除対象ファイル
- `.github/workflows/issue-to-automation-bridge.yml`
- `.github/workflows/approval-comment-automation-bridge.yml`

### 判断が必要な対象（実装前に Issue Comment で Naoya に確認すること）

1. **`.cursor/automation-bridge/` ディレクトリ**（スナップショットファイル群）
   - 現状は Bridge PR が作成された Issue のスナップショット（`issue-XXX.md`）が蓄積されている
   - 削除してよいか、アーカイブとして残すか → **Naoya に確認**
   - 判断基準の提案：削除して問題ない（Cursor は Issue 本文を直接参照するため、スナップショットは不要）

2. **OPEN 中の Bridge PR の扱い**
   - 現在 OPEN 中の Bridge PR（#230, #232, #234... 等、docs 改修シリーズの偶数番）は、workflow 削除後も OPEN のまま残る
   - これらを手動クローズすべきか → **Naoya に確認**
   - 判断基準の提案：OPEN 中の Bridge PR は一括クローズし、対応する Issue（#229, #231, #233...）は引き続き Cursor デスクトップで手動起動する

3. **既存の `auto/issue-*` ブランチの後片付け**
   - 古い `auto/issue-*` ブランチが残存している可能性がある
   - 削除してよいか → **Naoya に確認**
   - 判断基準の提案：削除可（develop にマージ済みでないブランチも、Bridge 方式廃止後は不要）

### 具体的な実装手順

1. `.github/workflows/issue-to-automation-bridge.yml` を削除
2. `.github/workflows/approval-comment-automation-bridge.yml` を削除
3. 上記の判断確認を Issue Comment で受け取ってから：
   - `.cursor/automation-bridge/` の処理（削除 or 保持）
   - OPEN 中の Bridge PR の一括クローズ（`gh pr close` で対応）
   - 古い `auto/issue-*` ブランチの削除

### CLAUDE.md の更新（同一 PR に含める）

`.cursor/rules/dev-flow.mdc` と `CLAUDE.md` に以下を追記する：

```markdown
### Bridge 方式廃止について（2026-05-30）
旧 Bridge workflow（issue-to-automation-bridge.yml / approval-comment-automation-bridge.yml）は廃止済み。
Cursor の自動起動は trigger-cursor-on-ready.yml（Webhook 方式）に統一。
`.cursor/automation-bridge/` ディレクトリは参照不要。
```

## 完了定義

- `.github/workflows/issue-to-automation-bridge.yml` がリポジトリに存在しない状態
- `.github/workflows/approval-comment-automation-bridge.yml` がリポジトリに存在しない状態
- `ready-for-cursor` ラベルを付与したとき、Bridge PR が作成されない状態（`gh pr list --search "chore: auto bridge"` で新規 PR が作られないことを確認）
- CLAUDE.md または dev-flow.mdc に Bridge 方式廃止の旨が記載されている状態
- Naoya の確認を受けた追加作業（`.cursor/automation-bridge/` 処理 / OPEN Bridge PR クローズ / 古いブランチ削除）が完了している状態

## テスト観点

- `ls .github/workflows/ | grep bridge` を実行してヒット 0 件
- テスト Issue に `ready-for-cursor` ラベルを付与し、Actions タブで Bridge PR 作成ワークフローが**起動しない**ことを確認
- `gh pr list --repo nkhippo/ThinkGrindAi --search "chore: auto bridge" --state open` で 0 件
- `git branch -r | grep auto/` を実行して古いブランチが整理されていること

## 非対象範囲

- `trigger-cursor-on-ready.yml` の修正（別 Issue #251 で対応）
- Bridge が誤マージされた既存 Issue の再実装（各 Issue ごとに別途対応）
- `.cursor/rules/` 以下の workflow 設定ファイルの変更
- auto/* ブランチの保護ルール追加

## 依存関係

- **#251（trigger-cursor-on-ready.yml 追加）が先行マージされていること**
- #251 が未マージの場合、Webhook がない状態で Bridge を廃止すると Cursor への自動起動手段が完全になくなる。必ず #251 後に着手する。

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-bridge-workflow-abolish.md`

内容:
```
# Bridge workflow 完全廃止
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

## 作業の進め方

**着手前に必ず #251 がマージ済みであることを確認すること。未マージの場合は Issue Comment に報告して止まること。**

確認が必要な 3 点（`.cursor/automation-bridge/` 処理 / OPEN Bridge PR / 古いブランチ）については、作業開始時に現状を調査し、**Issue Comment に確認事項を書いて Naoya の回答を待つこと**。

Naoya の確認が取れた箇所から順次作業を進め、全確認が取れたら PR を作成すること。

PR 作成（Draft 可。**base = `develop`**、ラベル = `chore`、`Closes #XXX` を記載）

PR 本文（採用版フォーマット）：

---
## 概要
（Bridge workflow 2 ファイルの削除 + 移行措置の概要）

## 変更内容
- 

## 変更理由
- Webhook 方式（#251）導入により Bridge 方式が不要になったため

## 確認済み事項
- [ ] Bridge PR が新規作成されないことをテスト確認済み
- [ ] OPEN 中の Bridge PR の処理（クローズ or 保留）を Naoya に確認済み
- [ ] `.cursor/automation-bridge/` の処理を Naoya に確認済み

## 未確認・懸念点
- （あれば記載）

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。その場合は **必ず Issue コメントに以下を書いてから止まること**：

```
【作業中断】
- 現在の状態：
- 中断理由：
- 次に必要なこと：
```

---
_Claude による自動投稿_
