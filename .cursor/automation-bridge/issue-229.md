# Issue Bridge Snapshot

- Issue: #229
- Title: 【docs / Critical】base ブランチ判断の3箇所矛盾を統一（全ラベル develop 経由）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/229
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:51:21Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビュー（thinkgrindai 品質改善の先祖帰りチェック）で **Critical** 級の構造的矛盾として検出された問題。

PR の base ブランチ判断が現在 **3 箇所で食い違っており**、しかも CLAUDE.md 内部で**自己矛盾**している：

| 出典 | docs | chore | feature | bug |
|---|---|---|---|---|
| `CLAUDE.md`「ラベルと base ブランチの対応」表 | **develop 経由** | **develop 経由** | develop 経由 | develop 経由 |
| `CLAUDE.md`「Cursor の PR 作成時チェックリスト」 | **main** | **main** | develop | develop |
| `.cursor/rules/dev-flow.mdc`「PR の base ブランチ判断ルール」 | **main** | **main** | develop | develop |

CLAUDE.md「ラベルと base ブランチの対応」表の直下に **「すべての変更は develop を経由する。main への直接コミット・直行マージは禁止」** と明記されているため、「develop 経由」が現行の正のルール。これに合わせて他 2 箇所を修正する。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`
- `.cursor/rules/dev-flow.mdc`

### 具体的な修正内容

1. **`CLAUDE.md`「### Cursor の PR 作成時チェックリスト」セクション**
   - 現状: `- [ ] base ブランチが正しいか（docs/chore → main、feature/bug → develop）`
   - 修正後: `- [ ] base ブランチが正しいか（全ラベル develop 経由）`

2. **`.cursor/rules/dev-flow.mdc`「## PR の base ブランチ判断ルール」セクション**
   - 表の `docs → main` を `docs → develop` に修正
   - 表の `chore → main` を `chore → develop` に修正
   - 表の下に **「すべての変更は develop を経由する。main への直接コミット・直行マージは禁止。develop → main のマージはリリース判断時のみ」** を追記
   - 既存の「ラベルが複数ある場合は〜」「ラベルが不明・未設定の場合は develop を base にして〜」は残す

3. **`CLAUDE.md`「### Issue 分割の判断軸」直下の「ラベルと base ブランチの対応」表** — 変更なし（これが正）

## 完了定義

- `CLAUDE.md`「Cursor の PR 作成時チェックリスト」の base ブランチ記述が「全ラベル develop 経由」になっている状態
- `.cursor/rules/dev-flow.mdc`「PR の base ブランチ判断ルール」の表で docs / chore 行が `develop` になっている状態
- `.cursor/rules/dev-flow.mdc` の同セクションに「すべての変更は develop を経由する」原則が追記されている状態
- 以下のコマンドで `docs.*main` / `chore.*main` の記述が一切残っていない状態：
  ```bash
  grep -nE 'docs.*main|chore.*main' CLAUDE.md .cursor/rules/dev-flow.mdc
  ```

## テスト観点

- `grep -nE 'docs.*main|chore.*main' CLAUDE.md .cursor/rules/dev-flow.mdc` を実行してヒット 0 件であることを確認する
- `grep -n 'すべての変更は develop' .cursor/rules/dev-flow.mdc` で原則文が含まれていることを確認する
- `git diff` で base ブランチ関連以外の箇所が変更されていないことを確認する

## 非対象範囲

- 既存の docs / chore Issue・PR の base ブランチ修正は対象外（このルール改定後の新規分から適用）
- `release-please` 設定ファイルの変更は対象外
- ラベル分類（docs / chore / feature / bug）そのものの見直しは対象外
- 優先度ラベル（critical / important / minor）の整理は別 Issue 対象

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-base-branch-unification.md`

内容:
```
# base ブランチ判断ルールの統一
## 実装内容
- 
## 変更ファイル
- 
## 関連Issue
- #XXXX
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `docs`、`Closes #XXX` を記載）
   - 未完成の場合はタイトルに `[WIP]` を付けてよい
4. PR 本文に以下を必ず記載すること：

---
## 変更内容
- （何をどう変えたか、箇条書き）

## 確認済み事項
- grep で `docs.*main` / `chore.*main` のヒットが 0 件であることを確認した
- lint / 既存テスト通過

## 未確認・懸念点
- （あれば記載。なければ「なし」）
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
