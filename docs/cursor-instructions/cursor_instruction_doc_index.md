# Cursor 指示書: ドキュメント索引の作成と管理体制の整備

作成日: 2026-05-25
対象バージョン: Ver.3.3以降
**ステータス**: 完了（PR #34 マージ済み。索引メンテは `docs/_index.md` の更新ルールに従う）

---

## 概要

この指示書は以下の作業を行うためのものです：

1. `docs/_index.md`（ドキュメント索引）を新規作成する ✅
2. 索引が仕様変更のたびに更新されるよう、`CLAUDE.md` にルールを追記する ✅

マージ後の索引メンテ（積み上げ廃止・Obsidian 移行の反映など）は、Claude 返答の「📋 索引更新チェック」に従い Cursor が `docs/_index.md` を更新する。

---

## 参照

- 索引本体: [docs/_index.md](../_index.md)
- Cursor ルール: [.cursor/rules/dev-flow.mdc](../../.cursor/rules/dev-flow.mdc)（ドキュメント索引の更新）
- Claude ルール: [CLAUDE.md](../../CLAUDE.md)（索引更新チェック）

---

## 作業完了の確認（初回）

- [x] `docs/_index.md` が新規作成されている
- [x] `CLAUDE.md` に索引更新チェックが追記されている
- [x] PR #34 マージ済み

## マージ後の索引メンテ（随時）

仕様変更のたびに以下を更新する：

- [ ] `docs/_index.md` の「直近の仕様変更」
- [ ] ドキュメント一覧の行数目安
- [ ] セクション索引（requirements / specification / gas 等）
