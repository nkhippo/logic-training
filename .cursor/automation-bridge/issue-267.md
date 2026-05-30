# Issue Bridge Snapshot

- Issue: #267
- Title: 【chore / Critical】Bridge workflow 2 本を削除（旧 #214 + #226 統合・#265 マージ後に着手）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/267
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T07:02:14Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Cursor 調査で判明した **Critical** 問題。

旧 Issue #214（Bridge PR 方式廃止）および #226（旧 workflow 削除）がいずれも Bridge PR のみマージで未実装。以下の 2 つの workflow が develop に残存しており、`ready-for-cursor` ラベル付与のたびに **不要な Bridge PR が自動作成され続けている**：

| ファイル | 本来の状態 | 現状 |
|---|---|---|
| `.github/workflows/issue-to-automation-bridge.yml` | #214 で廃止予定 | **存続** |
| `.github/workflows/approval-comment-automation-bridge.yml` | #226 で削除予定 | **存続** |

また、**`#265`（Webhook workflow 追加）が先にマージされていることが前提**。本 Issue は #265 の完了後に着手すること。

## 依存関係

**⚠️ 必須前提**：`Issue #265`（`trigger-cursor-on-ready.yml` 追加）が develop にマージ済みであること。

未マージの場合、本 Issue を実装すると Cursor の起動手段がなくなる。必ず #265 の PR マージを確認してから着手する。

## 実装範囲

### 削除対象ファイル
- `.github/workflows/issue-to-automation-bridge.yml`
- `.github/workflows/approval-comment-automation-bridge.yml`

### 保持するファイル（変更しない）
- `.cursor/automation-bridge/` 配下のスナップショットファイル（歴史的参照用として残す）
- `.github/workflows/trigger-cursor-on-ready.yml`（#265 で追加されたもの）

### 具体的な実装内容

#### 1. 実装前に現状を必ず調査する

```bash
# 削除対象 workflow のトリガー条件を確認
cat .github/workflows/issue-to-automation-bridge.yml
cat .github/workflows/approval-comment-automation-bridge.yml

# これら以外に Bridge 関連の workflow がないか確認
grep -rl 'automation-bridge\|auto bridge\|auto/issue' .github/workflows/
```

削除前に「他の workflow や CLAUDE.md がこれらのファイルを参照していないか」を確認すること。

#### 2. 両 workflow ファイルを削除する

```bash
git rm .github/workflows/issue-to-automation-bridge.yml
git rm .github/workflows/approval-comment-automation-bridge.yml
```

#### 3. CLAUDE.md の Bridge 関連記述を更新する

`CLAUDE.md`「### Cursor と Naoya のコミュニケーションルール」内「**現在の運用フロー（Webhook 自動起動）**」セクションを確認し、Bridge PR への言及（`issue-to-automation-bridge.yml` 等）を削除または更新する。

修正箇所の確認：
```bash
grep -n 'bridge\|Bridge\|auto bridge' CLAUDE.md
```

ヒット箇所を確認し、現在の正しい運用フロー（`trigger-cursor-on-ready.yml` 経由の Webhook）に合わせて書き直す。

#### 4. 動作確認

削除後、テスト用 Issue に `ready-for-cursor` ラベルを付与して：
- **Bridge PR が作成されない**こと
- `trigger-cursor-on-ready.yml` の Webhook が正常に動作すること

を確認する。

## 完了定義

- `.github/workflows/issue-to-automation-bridge.yml` が develop ブランチに存在しない状態
- `.github/workflows/approval-comment-automation-bridge.yml` が develop ブランチに存在しない状態
- `ready-for-cursor` ラベルを付与したとき、Bridge PR（`chore: auto bridge for issue #N`）が**作成されない**状態
- `trigger-cursor-on-ready.yml` による Webhook POST は正常に動作している状態
- `CLAUDE.md` から削除した workflow への言及が除去または更新されている状態

## テスト観点

- `ls .github/workflows/` で 2 ファイルが存在しないことを確認
- テスト用 Issue に `ready-for-cursor` ラベルを付与し、Bridge PR が作成されないことを 5 分待って確認
- GitHub Actions タブで `trigger-cursor-on-ready.yml` のみが動作していることを確認
- `grep -n 'automation-bridge\|issue-to-automation' CLAUDE.md` でヒット 0 件（または更新後の正しい記述のみ）であることを確認

## 非対象範囲

- `.cursor/automation-bridge/` 配下のスナップショットファイルの削除は対象外（歴史的記録として残す）
- 既存の Bridge PR（OPEN 中・マージ済み）の整理は対象外
- Cursor Automation サービス側の設定変更は対象外

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-bridge-workflow-removed.md`
（Issue #245 がマージ済みの場合は `implementations/` に変更）

内容:
```
# Bridge workflow 廃止（旧 #214 + #226 統合対応）
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
2. push
3. PR 作成（**base = `develop`**、ラベル = `chore`、`Closes #XXX` を記載）
4. PR 本文（採用版フォーマット）

---
## 概要
（1〜2 行で要約）

## 変更内容
-

## 変更理由
- Bridge PR 方式が残存し、不要な Bridge PR が作成され続けていたため削除

## 確認済み事項
- [ ] #265 が develop にマージ済みであることを確認
- [ ] 2 ファイルが削除されていることを確認
- [ ] Bridge PR が作成されないことをラベル付与テストで確認

## 未確認・懸念点
- （あれば記載。なければ「なし」）

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。必ず Issue コメントに書いてから止まること。

---
_Claude による自動投稿_
