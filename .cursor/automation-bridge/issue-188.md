# Issue Bridge Snapshot

- Issue: #188
- Title: docs: Issue起票時の ready-for-cursor ラベル付け漏れを防ぐルール整備
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/188
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T13:42:16Z

## Body

## 概要

Claude（仕様パートナー）が MCP 経由で Issue を起票する際、`ready-for-cursor` ラベルの付与が漏れていた（例：#184）。

これにより Bridge workflow がスキップされ、Cursor による自動実装が起動しないという問題が発生した。

## 修正内容

### 1. CLAUDE.md の Issue 起票ルールに追記

`## Issue 起票ルール（MCP経由）` セクションに以下を追加：

```
- ラベル付与ルール（必須）：
  - feature / bug → ["feature" or "bug", "ready-for-cursor"] を必ず両方付与
  - docs / chore  → ["docs" or "chore"] のみ（ready-for-cursor 不要）
```

### 2. Issue テンプレートの確認・修正

`.github/ISSUE_TEMPLATE/bug.yml` および `feature_request.yml` に `ready-for-cursor` ラベルがデフォルトで付与されているか確認し、付いていなければ追加する。

```yaml
# bug.yml / feature_request.yml
labels: ["bug", "ready-for-cursor"]  # ← ready-for-cursor を明示
```

## 対象ファイル

- `CLAUDE.md`
- `.github/ISSUE_TEMPLATE/bug.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`（存在する場合）

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: main・ラベル: docs・`Closes #185` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
