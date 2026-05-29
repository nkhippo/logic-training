# Issue Bridge Snapshot

- Issue: #191
- Title: docs: DEVELOPMENT_POLICY.md 廃止 + 必要情報を CLAUDE.md に吸収
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/191
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T12:47:25Z

## Body

🤖 **Claude より**

## 背景・目的

`docs/DEVELOPMENT_POLICY.md` と `CLAUDE.md` に内容の重複があり、かつ DEVELOPMENT_POLICY.md には古い記述（旧ファイル構成・旧URL・GAS時代の記述）が残っている。

「未来のために一応残しておく」はしない方針のため、廃止する。
ただし廃止前に、CLAUDE.md に**まだ吸収されていない必要情報**を移植する。

---

## 実装範囲

対象ファイル: `CLAUDE.md`（修正）、`docs/DEVELOPMENT_POLICY.md`（削除）

### Step 1: CLAUDE.md への追記

以下の情報が CLAUDE.md に存在しないため追記する。

#### 追記1: Issue 本文への `Obsidian記録` セクション必須化

「Issue 起票ルール」セクションの「作業の進め方」テンプレの直前に追加：

```markdown
### Issue 本文に必ず含めるセクション

タイプ A・B・C 共通で、以下のセクションを Issue 本文末尾に含めること：

#### Obsidian記録
※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: /Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-<トピック>.md

内容:
\```
# <タイトル>
## 実装内容
-
## 変更ファイル
-
## 関連Issue
- #XXXX
\```
```

#### 追記2: PR チェックリスト（Cursor 向け）

「Issue 起票ルール」セクションの末尾に追加：

```markdown
### Cursor の PR 作成時チェックリスト

Cursor は PR 作成前に以下を確認すること：

**実装**
- [ ] Issue の完了定義をすべて満たしているか
- [ ] 既存機能を破壊していないか

**コード品質**
- [ ] `console.log` などのデバッグ出力が残っていないか
- [ ] エラーハンドリングが実装されているか

**ドキュメント**
- [ ] タイプ B: 影響を受ける `docs/` ファイルを更新したか（該当する場合）
- [ ] タイプ C: `docs/requirements/`・`docs/specification/` を更新したか
- [ ] Obsidian メモを保存したか

**PR 本文**
- [ ] `Closes #XXX` を記載したか
- [ ] base ブランチが正しいか（docs/chore → main、feature/bug → develop）
```

### Step 2: DEVELOPMENT_POLICY.md の削除

`docs/DEVELOPMENT_POLICY.md` を削除する。

削除前に以下を確認すること：
- 上記 Step 1 の追記が CLAUDE.md にマージ済みであること
- `docs/_index.md` から DEVELOPMENT_POLICY.md への参照リンクを削除すること

---

## 完了定義

以下の状態になっていること：

- `CLAUDE.md` に `Obsidian記録` セクションの必須化が追記されている
- `CLAUDE.md` に Cursor の PR チェックリストが追記されている
- `docs/DEVELOPMENT_POLICY.md` が削除されている
- `docs/_index.md` に DEVELOPMENT_POLICY.md へのリンクが残っていない
- `docs/_index.md` の他のリンクは変更されていない

## テスト観点

- `CLAUDE.md` を開いて追記内容が正しく記載されているか目視確認
- `docs/` を開いて `DEVELOPMENT_POLICY.md` が存在しないことを確認
- `docs/_index.md` を開いてリンク切れがないことを確認

## 非対象範囲

- `CLAUDE.md` の他セクションの内容変更
- `docs/requirements/` / `docs/specification/` の変更
- フォルダ構成の変更（別 Issue で対応）

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: **main**、ラベル: docs、本文に `Closes #186` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
