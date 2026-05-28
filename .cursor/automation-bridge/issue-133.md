# Issue Bridge Snapshot

- Issue: #133
- Title: docs: ready-for-cursor ラベル付与条件の明文化（Issueテンプレ + CLAUDE.md）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/133
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-28T13:41:09Z

## Body

## 背景・目的

Cursor自動運用（Bridge → Automation）の技術チェーンは完成済み。
しかし「どのIssueにready-for-cursorを付けてよいか」の基準が曖昧なため、
品質の低いIssueがCursorに渡ってしまうリスクがある。

本Issueでは `ready-for-cursor` ラベル付与条件をドキュメント化し、
IssueテンプレートとCLAUDE.mdに反映する。

---

## 成果物

### 1. `.github/ISSUE_TEMPLATE/cursor_task.md` の作成

以下の項目をすべて満たしたIssueのみ `ready-for-cursor` を付与できるものとする：

```markdown
## 背景・目的
- （なぜこの作業が必要か）

## 実装範囲
- （何を変更するか。対象ファイル・機能を明示）

## 完了定義
- （何ができたら完了か。チェックリスト形式）

## テスト観点
- （動作確認の方法・確認項目）

## 非対象範囲
- （今回やらないこと。スコープ外を明示）
```

**付与NG条件（以下のいずれかに該当する場合はラベルを付けない）：**
- 完了定義が未記載
- 実装範囲が「全体的に改善」など曖昧
- テスト観点が未記載
- 影響ファイルが5つを超え、かつIssue分割されていない

### 2. `CLAUDE.md` への追記

「Issue起票ルール」セクションに以下を追記：

```markdown
## ready-for-cursor ラベル付与条件

以下の5項目がすべて記載されている場合のみラベルを付与する：
1. 背景・目的
2. 実装範囲（対象ファイル明示）
3. 完了定義（チェックリスト）
4. テスト観点
5. 非対象範囲

いずれか1つでも欠けている場合、ラベルは付与しない。
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `docs`、本文に `Closes #133` を記載）

PR本文には以下を必ず記載すること：

---
## 変更内容
- （何をどう変えたか、箇条書き）

## 確認済み事項
- （lint・テスト・動作確認の結果）

## 未確認・懸念点
- （あれば記載。なければ「なし」）

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
