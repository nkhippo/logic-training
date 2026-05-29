# Issue Bridge Snapshot

- Issue: #160
- Title: docs: Claude起票IssueのNaoya承認フロー明文化（needs-reviewラベル導入）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/160
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T00:01:29Z

## Body

## 背景・目的

別ChatのClaudeがMCPコネクタ経由でリポジトリに直接Issue起票し、
`ready-for-cursor` ラベルまで付与されて自動チェーンに乗る事象が発生した（#158）。

Naoyaさんが意図・レビューしていないIssueが自動実行されるリスクを防ぐため、
「ClaudeがIssueを起票した場合はNaoyaさんの承認を経てから `ready-for-cursor` を付ける」
というルールをCLAUDE.mdに明文化する。

---

## 変更対象ファイル

- `CLAUDE.md`

---

## 変更内容

「Issue起票ルール」セクションに以下を追記する：

```markdown
## Issue起票後の承認フロー

### Claudeが起票したIssueの扱い
ClaudeがMCP経由でIssueを起票した場合、以下のルールに従うこと：

1. **起票時点では `ready-for-cursor` ラベルを付与しない**
   - ただし、Naoyaさんとの会話の中で合意済みの内容を起票する場合はこの限りではない
   - 「このChatで決まった内容をIssue化する」場合は付与してよい

2. **別Chat・別文脈で起票する場合は `needs-review` ラベルを付与する**
   - Naoyaさんが内容確認・承認後に `ready-for-cursor` に付け替える

3. **承認の基準**
   - 背景・実装範囲・完了定義が明確か
   - 現在の優先度・方針と合っているか
   - スコープが適切か（大きすぎないか）
```

### `needs-review` ラベルの作成

GitHubに `needs-review` ラベルを追加する：
- 色：`#FFA500`（オレンジ）
- 説明：`Claudeが起票。Naoyaの確認・承認待ち`

---

## 完了定義

以下の状態になっていること：
- `CLAUDE.md` にIssue起票後の承認フローが追記されている
- `needs-review` ラベルがGitHubに存在する
- 既存のIssue起票ルールと矛盾していない

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: `main`、ラベル: `docs`、本文に `Closes #159` を記載）

PR本文には以下を必ず記載すること：

---
## 概要
（何をしたか・なぜしたか）

## 変更内容
- （箇条書き）

## 変更理由
- 別ChatのClaudeが意図せず自動チェーンに乗るIssueを起票した事象への対処

## テスト内容
- CLAUDE.mdの記述に矛盾がないこと確認
- needs-reviewラベルが作成されていること確認

## 関連Issue
Closes #159

---

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
