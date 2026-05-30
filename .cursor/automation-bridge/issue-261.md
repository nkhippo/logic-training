# Issue Bridge Snapshot

- Issue: #261
- Title: 【chore / Minor】PR マージ後の auto/issue-* ブランチ自動削除ルールを整備（後片付け）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/261
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:59:49Z

## Body

🤖 **Claude より**

## 背景・目的

Cursor が `auto/issue-*` ブランチを作成するたびに GitHub 上にブランチが蓄積しており、古いブランチの後片付けルールが未定義。

また、Bridge 方式廃止（Issue #253）後も `auto/issue-*` ブランチの作成が継続する可能性があるため（Cursor が自分でブランチを切る運用は継続する）、PR マージ後の自動削除を整備する。

旧 Issue #135 はクローズ済み（Bridge のみマージ）のため、内容を刷新して新規起票。

## 実装範囲

### 修正対象
- GitHub リポジトリの branch protection / delete on merge 設定（または workflow 追加）

### 具体的な実装内容

#### 方法 A（推奨）: GitHub の「Automatically delete head branches」設定を有効化

GitHub リポジトリの Settings → General → Pull Requests → **「Automatically delete head branches」にチェックを入れる**。

これにより PR マージ後に head ブランチが自動削除される。

> ただしこれは `git push` で設定するものではなく、GitHub UI から Naoya が設定する必要がある。Cursor が実施できない場合は Issue Comment で Naoya に手順を案内すること。

#### 方法 B: workflow で明示的に削除

```
トリガー: pull_request イベント、アクション: closed（merged: true のみ）
動作: head ブランチを削除する（gh api で削除）
```

Cursor は方法 A が設定可能かどうかを確認し、可能であれば Naoya に設定手順を案内する。方法 A が設定済みであれば方法 B は不要。

#### 既存の古いブランチの整理

現在残っている `auto/issue-*` ブランチを確認し、以下を実施する：

1. `gh branch list --remote | grep auto/` で一覧取得
2. マージ済み（または実装不要と判定された）ブランチを削除
3. 残すべきブランチがあれば Issue Comment で Naoya に確認

## 完了定義

- PR マージ後に head ブランチが自動削除される状態（方法 A または方法 B）
- 既存の古い `auto/issue-*` ブランチが整理されている状態（または Naoya への確認済み）
- ブランチ削除ルールが `CLAUDE.md` または `docs/dev-flow-runbook.md` に一行追記されている状態

## テスト観点

- テスト PR をマージした後、head ブランチが自動削除されていることを確認
- `gh branch list --remote | grep auto/` で古いブランチが減少していることを確認

## 非対象範囲

- `main` や `develop` ブランチの保護ルール変更は対象外
- `feature/*` など Naoya が手動作成するブランチの自動削除は対象外

## 依存関係

- #253（Bridge 廃止）が完了している方が望ましい（廃止後のブランチ状況が安定してから整理する）

## Obsidian記録

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-branch-cleanup.md`

## 作業の進め方

1. コミット → push
2. PR 作成（**base = `develop`**、ラベル = `chore`、`Closes #XXX`）

**方法 A（GitHub UI 設定）の場合**、Cursor は「設定手順を Issue Comment に書いて Naoya に案内」してから止まること。Naoya の設定完了を確認した後に完了報告を行う。

---
## 概要
## 変更内容
## 変更理由
- PR マージ後のブランチ後片付けルールが未整備だったため

## 確認済み事項
- [ ] 自動削除が有効化されていること
- [ ] 既存ブランチの整理が完了または Naoya に確認済み

## 未確認・懸念点
- 

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。

---
_Claude による自動投稿_
