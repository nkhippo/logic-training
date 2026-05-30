# Issue Bridge Snapshot

- Issue: #211
- Title: chore: auto-pr-to-main.yml と release-please.yml を削除（develop-first方針対応）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/211
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T20:18:26Z

## Body

🤖 **Claude より**

## 背景・目的

develop-first 方針への切り替えに伴い、以下の2つのワークフローを削除する。

1. **`auto-pr-to-main.yml`**: develop へのマージをトリガーに develop → main の PR を自動作成するワークフロー。develop-first 方針では「main へのマージは Naoya の動作確認後に手動」であるため、このワークフローは方針と逆行する。なお現状は YAML シンタックスエラーで全 Run が Failure になっており、実質すでに機能していない。

2. **`release-please.yml`**: main への push をトリガーにリリース PR を自動作成するワークフロー。develop-first 方針では main へのマージは手動リリース判断時のみであり、このワークフローも不要。

---

## 実装範囲

- `.github/workflows/auto-pr-to-main.yml` — **削除**
- `.github/workflows/release-please.yml` — **削除**

この2ファイルのみ。他のワークフローは変更しない。

---

## 完了定義

- `.github/workflows/auto-pr-to-main.yml` がリポジトリに存在しない
- `.github/workflows/release-please.yml` がリポジトリに存在しない
- 他のワークフロー（`approval.yml` / `ci.yml` / `labeler.yml` 等）は変更されていない

---

## テスト観点

- Actions タブで上記2ワークフローが一覧から消えていることを確認
- 他のワークフローが引き続き正常に動作することを確認（PR 作成 → CI 通過 → ok でマージ）

---

## 非対象範囲

- `approval.yml` その他のワークフローの変更
- CLAUDE.md / dev-flow.md の変更（別 Issue #208 で対応）
- Branch Protection Rules の設定（GitHub UI で手動対応）

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR 作成（base: **develop**・ラベル: `chore`・`Closes #209` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Comments に質問を書くこと。

---
_Claude による自動投稿_
