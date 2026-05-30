# Issue Bridge Snapshot

- Issue: #263
- Title: 【chore / Minor】GitHub MCP に update_issue ツールを追加（Claude が Issue 本文を編集できるように）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/263
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T07:00:16Z

## Body

🤖 **Claude より**

## 背景・目的

現状、Claude（私）は GitHub Issue を**新規起票・コメント追加**はできるが、**起票後の Issue 本文を編集**することができない。

これが不便なケース：
- 起票後に誤字・内容不足が発覚したとき
- 実装中に仕様変更が生じ、完了定義を更新したいとき
- Cursor の Issue Comment に質問が来て、Issue 本文の「非対象範囲」を修正したいとき

現状の回避策（コメント追加）では Issue 本文の構造を変えられないため、読みにくい補足が増えていく。

本 Issue では MCP コネクター（`ThinkGrindAi GitHub`）に `update_issue` ツールを追加し、Claude が Issue 本文を直接編集できるようにする。

旧 Issue #158 はクローズ済み（Bridge のみマージ）のため、内容を刷新して新規起票。

## 実装範囲

### 修正対象
- `.github/` 配下の MCP コネクター設定ファイル、または Claude.ai カスタムコネクターのスキーマ定義

### 具体的な実装内容

> 実装前に `docs/CLAUDE_AI_MCP_SETUP.md` を通読し、MCP コネクターの現在の設定方法を確認すること。

現行の `ThinkGrindAi GitHub` MCP コネクターには以下のツールが存在する：

| 既存ツール | 機能 |
|---|---|
| `create_issue` | Issue 新規作成 |
| `add_issue_comment` | Issue にコメント追加 |
| `get_issue_comments` | Issue コメント取得 |
| `list_issues` | Issue 一覧取得 |
| `create_pull_request` | PR 作成 |
| `get_pull_request` | PR 取得 |
| 等 |  |

**追加したいツール**:

```
update_issue:
  説明: 指定した Issue の本文・タイトルを更新する
  パラメータ:
    issue_number: integer - 対象 Issue 番号
    title: string（任意）- 新しいタイトル
    body: string（任意）- 新しい本文（Markdown）
```

追加方法は MCP コネクターのスキーマ定義方法に依存する。`docs/CLAUDE_AI_MCP_SETUP.md` に記載の方法に従って実装する。

GitHub REST API の `PATCH /repos/{owner}/{repo}/issues/{issue_number}` を利用する。

### 実装が困難な場合

MCP コネクターのスキーマ変更が Claude.ai 側（Anthropic 管理）の設定変更を必要とする場合、Cursor 単独では実装できない可能性がある。その場合は Issue Comment に「技術的制約と代替案」を報告し、Naoya と相談すること。

## 完了定義

- Claude（私）が `update_issue` ツールを呼び出して、既存の Issue 本文を更新できる状態
- 更新後の Issue 本文が GitHub 上で反映されていることを確認できる状態
- `docs/CLAUDE_AI_MCP_SETUP.md` に `update_issue` の追加が反映されている状態

## テスト観点

- テスト Issue に対して `update_issue` を呼び出し、本文が更新されることを確認
- `update_issue` を Claude の Chat から実行できること（MCP 経由での動作確認）

## 非対象範囲

- Issue ラベルの変更（別ツールが必要）
- Issue のクローズ・再オープン
- PR 本文の編集
- コメントの編集・削除

## 依存関係

- フェーズ 1〜4 が完了した後に対応する（優先度 Minor）
- 本 Issue はインフラ系には依存しないため、並行作業は可能

## Obsidian記録

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-mcp-update-issue.md`

## 作業の進め方

1. コミット → push
2. PR 作成（**base = `develop`**、ラベル = `chore`、`Closes #XXX`）

**技術的制約で実装不可能な場合は、実装を開始せず Issue Comment に報告してから止まること。**

---
## 概要
## 変更内容
## 変更理由
- Claude が Issue 本文を起票後に編集できない状態だったため

## 確認済み事項
- [ ] Claude が update_issue ツールを実行して Issue 本文が更新されることを確認

## 未確認・懸念点
- MCP コネクターのスキーマ変更方法（docs/CLAUDE_AI_MCP_SETUP.md 参照）

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。

---
_Claude による自動投稿_
