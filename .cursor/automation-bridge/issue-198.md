# Issue Bridge Snapshot

- Issue: #198
- Title: docs: develop-first方針への切り替え — dev-flow.md ブランチ運用記述更新
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/198
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T13:08:39Z

## Body

🤖 **Claude より**

## 背景・目的

Issue #196 と同じ方針転換（develop-first）を `docs/dev-flow.md` にも反映する。
現状の dev-flow.md には以下の問題がある：

- 推奨開発フローの STEP 6 PR作成 の `base: develop` は正しいが、
  Cursorが参照する正規ブランチの明示がない
- mainへの直接コミット禁止が明文化されていない
- Claude・Cursorがdevelopを正として参照するという方針の記載がない

本Issueは `docs/dev-flow.md` のブランチ運用セクションを新方針に合わせて更新する。

**依存関係**: Issue #196 の完了後に着手することを推奨（CLAUDE.md更新が先行）

---

## 実装範囲

対象ファイル: `docs/dev-flow.md`（1ファイルのみ）

---

## 変更内容

### 1. ブランチ運用テーブルに注記を追加

`main` 行の役割欄に以下を追記：
```
直接コミット・直行マージ禁止。develop からの PR 経由のみ。
```

### 2. 「ブランチの流れ」セクション直下に方針ブロックを追加

以下のブロックを図の直後に挿入：

```markdown
> **⚠️ develop-first 原則（2026-05-29 改訂）**
> - すべての変更（コード・ドキュメント・CI設定を含む）は develop を経由する
> - main への直接コミット・直行マージは禁止
> - **Claude・Cursor は develop ブランチを正として参照すること**
> - develop → main のマージはリリース判断時（Naoya の明示的な承認後）のみ
```

### 3. 推奨開発フロー STEP 9 を修正

**変更前:**
```
STEP 9: Naoya が同様に承認コメント → main マージ → 本番自動デプロイ
```

**変更後:**
```
STEP 9: develop で動作確認完了後、Naoya がリリース判断
        → develop → main の PR を作成（または自動作成）
        → Naoya が承認コメント → main マージ → 本番自動デプロイ
        ※ main への直接コミット・直行マージは禁止
```

---

## 完了定義

- `docs/dev-flow.md` のブランチテーブルに「直接コミット禁止」の記載がある
- 「ブランチの流れ」セクション直下に develop-first 原則ブロックが存在する
- STEP 9 に「直接コミット禁止」の注記がある

---

## テスト観点

- 変更後の dev-flow.md を読んで、mainへの直行が禁止されていることが一目で分かるか目視確認

---

## 非対象範囲

- CLAUDE.md の変更（Issue #196 で対応）
- GitHub Actionsのワークフロー変更
- Branch Protection Rules の設定

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: **develop**・ラベル: `docs`・`Closes #197` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
