# Issue Bridge Snapshot

- Issue: #249
- Title: 【docs / Minor】ルール変更時のセルフチェック手順を CLAUDE.md 冒頭に追加（先祖帰り再発防止策）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/249
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:00:13Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Minor** 級の問題（観点 E-3-③）として検出。

今回の Opus レビューで判明したように、施策追加時に**既存記述の grep・更新が漏れ**、結果として複数の真実が並立する状況が複数発生していた：

- base ブランチ判断（3 箇所食い違い・CLAUDE.md 内部に自己矛盾）
- PR 本文形式（3 箇所で異なる形式）
- Step 番号（2 つの意味で使用）
- bug-knowledge.md / bug.md が運用ルールから独立

→ **根本原因**：施策追加時に「同一トピックが他箇所にも書かれていないか」を**機械的に確認する手順がない**。

これを構造的に防ぐため、`CLAUDE.md` 冒頭に「ルール変更時のセルフチェック手順」を新規追加する。これは Claude 自身が遵守する手順であり、ルール変更（CLAUDE.md / dev-flow.mdc / bug-knowledge.md / bug.md / .github/ISSUE_TEMPLATE 等の編集）を行う前後に必ずチェックする。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`

### 具体的な修正内容

`CLAUDE.md` の以下の位置に新規セクションを追加する。

**挿入位置**：「## プロジェクト概要」セクションの**直前**、または冒頭の説明文（「このファイルは Claude・Cursor の両者が参照する〜」）の直後。

```markdown
## ルール変更時のセルフチェック手順

CLAUDE.md / dev-flow.mdc / bug-knowledge.md / bug.md / `.github/ISSUE_TEMPLATE/*` / `.cursor/rules/*` を編集する際は、Claude が**必ず以下の手順を踏む**。施策追加時の先祖帰り・矛盾・重複を防ぐためのセルフチェック。

### Step 1: 既存記述の網羅確認（grep）

変更する概念・キーワードが**他の場所にも書かれていないか**を必ず確認する：

```bash
# 例：base ブランチ判断を変更する場合
grep -nE 'base|develop|main' CLAUDE.md .cursor/rules/dev-flow.mdc docs/*.md .github/ISSUE_TEMPLATE/*.md

# 例：PR 本文形式を変更する場合
grep -nE 'PR 本文|PR Description|## 変更内容|## 実装内容' CLAUDE.md .cursor/rules/dev-flow.mdc

# 例：Obsidian 関連を変更する場合
grep -nE 'Obsidian|decisions/|implementations/' CLAUDE.md .cursor/rules/dev-flow.mdc
```

ヒットした箇所**すべて**について、以下のいずれかを判断する：

| パターン | 対応 |
|---|---|
| 完全に同一内容で重複している | 1 箇所に正を残し、他は「→ 〇〇を参照」に置換 |
| 内容が微妙に異なる（矛盾している） | どちらが「正」かを決め、矛盾を解消 |
| 古い記述（旧構成・旧運用）が残っている | 削除または更新 |
| 別概念だが用語が同じで紛らわしい | 別用語に変更、または明示的に「別概念」と注記 |

### Step 2: 連動更新の確認

変更が以下のファイルに**連動更新を必要とするか**を確認する：

- `CLAUDE.md` を変更したか？ → `.cursor/rules/dev-flow.mdc` を見るべきか確認
- `.cursor/rules/dev-flow.mdc` を変更したか？ → `CLAUDE.md` 側に逆参照が必要か確認
- 開発フロー（Step 1〜7 / 事前確認 0〜3 / Step 3-a〜3-c）に影響するか？ → 番号体系の整合性を確認
- Bug Issue 運用に影響するか？ → `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/bug.md` を確認
- スキル（`cursor-instruction-writer/SKILL.md`）に影響するか？ → スキル更新を別 Issue で起票するか判断

### Step 3: 変更後の grep 再確認

変更完了後、もう一度 grep して以下を確認する：

- 旧記述が**完全に**消えているか（部分的な残存がないか）
- 新記述が**意図した箇所すべて**に反映されているか
- 矛盾するペアが存在しないか

### Step 4: Obsidian / 索引の更新確認

変更が以下に影響するか確認：

- `docs/ai-context/FILE_MAP.md` の索引更新が必要か
- Obsidian の `decisions/` または `confirmed-decisions/` に記録すべきか
- 月次 Opus レビュー（`docs/bug-knowledge.md`）で取り上げるべき構造的問題か

### Step 5: Issue 起票時の追記

ルール変更を含む Issue を起票する際、以下を**必ず**Issue 本文に含める：

- 「変更前」「変更後」の対比表または diff 例
- grep コマンドとその出力（網羅確認の証跡）
- 連動更新が必要な他ファイルへの参照
- 既存記述の削除箇所（あれば明示）

> ⚠️ このセルフチェックを省略してルール変更を起票した場合、レビュー時に**Re-open または差し戻し**となる。
```

## 完了定義

- `CLAUDE.md` の「## プロジェクト概要」セクションの直前（または冒頭説明文の直後）に「## ルール変更時のセルフチェック手順」セクションが存在する状態
- Step 1（既存記述の網羅確認）に grep コマンド例が含まれている状態
- Step 2（連動更新の確認）に確認対象ファイルリストが含まれている状態
- Step 3（変更後の grep 再確認）が含まれている状態
- Step 4（Obsidian / 索引の更新確認）が含まれている状態
- Step 5（Issue 起票時の追記）に変更前後の対比表・grep 証跡・既存記述削除箇所明示の指示が含まれている状態
- 重複パターン別対応表（4 パターン）が含まれている状態

## テスト観点

- `grep -n '## ルール変更時のセルフチェック手順' CLAUDE.md` で 1 件ヒット
- `grep -nE 'Step [1-5]:' CLAUDE.md | grep -i 'セルフチェック'` 相当でステップ全体が含まれていることを目視確認
- `grep -n 'grep -nE' CLAUDE.md` で grep コマンド例が含まれていること
- 挿入位置が「## プロジェクト概要」の直前または冒頭説明文の直後であることを目視確認
- `git diff` で対象セクション以外が変更されていないこと

## 非対象範囲

- 既存のルール変更運用への遡及適用は対象外（過去の Issue・PR の再点検は不要）
- スキル（`cursor-instruction-writer`）への連携は対象外（スキル側で対応）
- GitHub Actions / CI でのセルフチェック自動化は対象外（将来の要件相談）
- Cursor 側のルール変更時のセルフチェック手順整備は対象外（`dev-flow.mdc` 編集時のフロー追加など、別 Issue で対応可）

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること（Issue #245 で確定する新運用に従う）

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-rule-change-self-check.md`

内容：
```
# ルール変更時のセルフチェック手順を CLAUDE.md 冒頭に追加
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

※ Issue #245 が未マージの場合は旧パス（`decisions/` 直下）で構わない。

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `docs`、`Closes #XXX` を記載）
   - 未完成の場合はタイトルに `[WIP]` を付けてよい
4. PR 本文（採用版フォーマット）

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Opus レビューで施策追加時の先祖帰り・矛盾・重複が複数検出されたため、再発防止策として

## 確認済み事項
- [ ] grep で「## ルール変更時のセルフチェック手順」がヒット
- [ ] Step 1〜5 が含まれていることを目視確認
- [ ] 挿入位置が「## プロジェクト概要」の直前または冒頭説明文の直後であることを目視確認
- [ ] lint 通過

## 未確認・懸念点
- （あれば記載。なければ「なし」）

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
