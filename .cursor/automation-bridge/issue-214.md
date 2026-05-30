# Issue Bridge Snapshot

- Issue: #214
- Title: chore: Bridge PR方式を廃止しCursorへの直接Label changeトリガーに移行する
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/214
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T01:30:28Z

## Body

🤖 **Claude より**

## 背景・目的

現在、`ready-for-cursor` ラベル付与 → GitHub Actions が Bridge PR（`auto/issue-*`）を作成 → PRコメントでCursorを起動、という3段階の中継構造になっている。

この構造には以下の問題がある：
- Bridge PRのタイトルが `chore: auto bridge for issue #N` 固定で内容が不明瞭
- Bridge PRに `ok` コメントしても自動マージがスキップされ、運用が分かりにくい
- Bridge PR自体は実装の器でなく「Cursorへの通知チャンネル」でしかないため、存在意義が薄い

Cursor Automation が `Label change` トリガーに対応しているため、Bridge PR を廃止し、ラベル付与から直接Cursorが起動する構成に移行する。

> ⚠️ **注意**: Cursor AutomationのAgent Instructionsはすでに新設計に更新済み。本Issueの対応完了後、Naoyaさんがトリガー設定を変更する（手順は下記）。

---

## 実装範囲（対象ファイル明示）

### 削除するファイル
- `.github/workflows/issue-to-automation-bridge.yml`
- `.github/workflows/approval-comment-automation-bridge.yml`
- `.cursor/automation-bridge/` ディレクトリ（中のファイルごと）

### 変更するファイル
- `.github/workflows/approval.yml`
  - Bridge PR（`auto/issue-*`）のスキップ分岐を削除してシンプル化
  - `is_bridge_pr` の判定・スキップステップを除去
- `.cursor/rules/dev-flow.mdc`
  - 「現在の運用フロー」をLabel change起点に書き換え
  - `auto/issue-*` ブランチ・snapshotファイル・AUTOコメントへの言及を除去
  - Cursorが自分でブランチ・PRを作成することを明記

### 変更しないファイル
- `CLAUDE.md`（別Issue #後続 で対応）
- `docs/` 配下（対象外）

---

## 完了定義

以下の状態になっていること：

- `issue-to-automation-bridge.yml` と `approval-comment-automation-bridge.yml` がリポジトリに存在しない
- `.cursor/automation-bridge/` ディレクトリが存在しない
- `approval.yml` に `is_bridge_pr` の分岐が存在せず、`ok` コメントで全PRが自動マージされる
- `dev-flow.mdc` に `auto/issue-*`・`automation-bridge`・`AUTOコメント` への言及がない
- `dev-flow.mdc` にCursorが自分でブランチ・PRを作成する手順が記載されている

---

## テスト観点

- `approval.yml` の変更後、Bridge PRでない通常PRに `ok` コメントしたとき自動マージが動作することをdry-run相当で確認（実際のマージはNaoyaが判断）
- 削除したworkflowファイルが残っていないこと

---

## 非対象範囲

- Cursor AutomationのUI上のトリガー設定変更（Naoyaが手動で行う）
- `CLAUDE.md` の運用フロー記述更新（後続Issueで対応）
- 新しいLabel changeトリガーで実際にCursorが動くかの動作確認（トリガー設定変更後にNaoyaが確認）

---

## Obsidian記録

※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/2026-05-30-bridge-pr-abolish.md`

内容:
```
# Bridge PR廃止・Label changeトリガー移行

## 実装内容
- issue-to-automation-bridge.yml 削除
- approval-comment-automation-bridge.yml 削除
- .cursor/automation-bridge/ 削除
- approval.yml のBridge PRスキップ分岐を削除
- dev-flow.mdc をLabel change起点の記述に更新

## 変更ファイル
-

## 関連Issue
- #（このIssue番号）
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: develop・ラベル: chore・Closes #このIssue番号 を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
