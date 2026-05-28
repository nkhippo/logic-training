# Issue Bridge Snapshot

- Issue: #135
- Title: docs: Cursor自動運用 後処理ポリシー策定（Issue close・auto/* PR ライフサイクル）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/135
- Trigger: issue_comment/created
- Updated At (UTC): 2026-05-28T13:50:32Z

## Body

## 背景・目的

Cursor自動運用チェーンが稼働済み。
Automationが作成した `auto/issue-*` PR の後処理（closeタイミング・本実装PRへの誘導）が未定義のため、
不要なブランチ・PRが溜まり続けるリスクがある。

本Issueでは後処理ポリシーをドキュメント化し、可能な部分はGitHub Actionsで自動化する。

---

## 成果物

### 1. `docs/operations/cursor-pr-policy.md` の新規作成

以下の内容を含むこと：

#### Issue closeのルール

```markdown
## Issue closeのタイミングと責任者

| 条件 | closeする人 | タイミング |
|-----|-----------|---------|
| auto/issue-* PRがmainにマージされた | GitHub Actions（自動） | マージ直後 |
| Cursorが実装を完了できなかった | Naoya | 判断後すみやかに |
| Issueの方針が変わった | Naoya | 変更確定時 |
```

#### `auto/issue-*` PRの扱い

```markdown
## auto/* PRのライフサイクル

1. Bridgeが作成 → Automationが実装
2. 実装完了 → Naoyaがレビュー
3. 問題なし → mainにマージ（Closes #XXX で自動Issue close）
4. 問題あり → PR Commentsに `AUTO: fix` でCursorに修正指示
5. 修正不可 → PRをcloseし、Naoyaが手動対応

## ブランチの削除
- マージ済み auto/* ブランチは即削除（GitHub設定で自動化推奨）
```

### 2. `.github/workflows/auto-close-issue.yml` への追記（#124の拡張）

`auto/issue-*` ブランチからのPRマージ時に、
ブランチ名の Issue番号を抽出して自動closeする処理を追加する。

（#124ですでにブランチ名パターンマッチングは実装済みのため、
`auto/issue-(\d+)` パターンを追加するだけでよい）

---

## 依存関係

- #133（ready-for-cursor条件明文化）完了後に着手推奨
- #134（失敗時ランブック）と並行可

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `docs`、本文に `Closes #135` を記載）

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

## Auto Command

/auto retry
