# Issue Bridge Snapshot

- Issue: #237
- Title: 【docs / Important】PR 本文形式を 1 箇所に統一＋Closes/Fixes 表記統一
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/237
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:54:33Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Important** 級の問題として検出。

PR 本文の必須セクションが **3 箇所で異なる形式**になっており、Cursor がどの形式で書けば PR が通るか一意に決められない：

| 出典 | 必須セクション |
|---|---|
| `CLAUDE.md`「### Claude への指示・作業の進め方」 | 変更内容 / 確認済み事項 / 未確認・懸念点 |
| `CLAUDE.md`「## Cursor への指示・作業の進め方」 | 概要 / 変更内容 / 変更理由 / テスト内容 / 関連Issue |
| `.cursor/rules/dev-flow.mdc`「## PR Description」 | 実装内容 / テスト方法 / テスト結果 / 既知の問題・TODO / 関連 Issue |

加えて、Issue 番号の参照キーワードが揺れている：
- `CLAUDE.md`: `Closes #XXX`
- `.cursor/rules/dev-flow.mdc`: `Fixes #T0XX`

→ `Closes` に統一する（GitHub の自動 Issue クローズ動作はどちらも同じだが、ドキュメントとして揺れている）。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`
- `.cursor/rules/dev-flow.mdc`

### 修正方針

**`.cursor/rules/dev-flow.mdc` の「## PR Description」セクションを「正」とする**。

ただし内容は CLAUDE.md「Claude への指示・作業の進め方」と CLAUDE.md「Cursor への指示・作業の進め方」の良いところを統合した形式に再定義する。

### 統一する PR 本文フォーマット（採用版）

```markdown
## 概要
（1〜2 行で「何をしたか・なぜしたか」を要約）

## 変更内容
- （具体的な変更点を箇条書き）

## 変更理由
- （対応する Issue の背景を踏まえて、なぜこの変更が必要だったか）

## 確認済み事項
- [ ] lint / 既存テスト通過
- [ ] 該当機能を動作確認済み
- [ ] 既存機能への影響なし

## 未確認・懸念点
- （あれば記載。なければ「なし」）

## 関連 Issue
Closes #XXX
```

### 具体的な修正内容

#### 1. `.cursor/rules/dev-flow.mdc`「## PR Description」を上記「採用版」に書き換え

- 既存の「実装内容 / テスト方法 / テスト結果 / 既知の問題・TODO」を削除し、上記採用版に置換
- 「Fixes #T0XX」を「Closes #XXX」に修正

#### 2. `.cursor/rules/dev-flow.mdc`「## PR タイトル形式」内の `Fixes` 言及を `Closes` に統一

※ Issue 3（dev-flow.mdc を React 構成に全面更新）で `#T0XX → #XXX` は対応済みのため、本 Issue では「Closes」への統一のみ実施。Issue 3 が先にマージされている前提。Issue 3 が未マージの場合はマージ後に再点検すること。

#### 3. `CLAUDE.md`「### Cursor への指示・作業の進め方」の PR 本文記述を削除し、参照のみに置換

現状の以下の節を削除：
```
PR本文には以下を必ず記載すること：
（## 概要 / ## 変更内容 / ## 変更理由 / ## テスト内容 / ## 関連Issue を含む長文）
```

修正後：
```
PR 本文の必須フォーマットは **`.cursor/rules/dev-flow.mdc`「## PR Description」を参照** すること。
```

#### 4. `CLAUDE.md`「### Claude への指示・毎回の返答末尾に付けること」内の PR 本文記述については保持

※ こちらは「Issue 本文に必ず含めるセクション」の中の `## 作業の進め方` における PR 本文記載例であり、Cursor が PR 作成時に従う最終フォーマットとは別の文脈。  
→ ただし、ここも採用版に合わせて統一する：

現状の「## 変更内容 / ## 確認済み事項 / ## 未確認・懸念点」を、上記「採用版」フォーマット（概要 / 変更内容 / 変更理由 / 確認済み事項 / 未確認・懸念点 / 関連 Issue）に置き換える。

#### 5. CLAUDE.md / dev-flow.mdc の `Fixes` 言及をすべて `Closes` に統一

`grep -nE 'Fixes #' CLAUDE.md .cursor/rules/dev-flow.mdc` でヒットする箇所をすべて `Closes #` に置換する。

## 完了定義

- `.cursor/rules/dev-flow.mdc`「## PR Description」が上記「採用版」フォーマット（概要 / 変更内容 / 変更理由 / 確認済み事項 / 未確認・懸念点 / 関連 Issue）になっている状態
- `CLAUDE.md`「Cursor への指示・作業の進め方」の PR 本文記述が削除され、`.cursor/rules/dev-flow.mdc` への参照だけに置き換えられている状態
- `CLAUDE.md`「Claude への指示・毎回の返答末尾」内の PR 本文記述（Issue 草稿内の「## 作業の進め方」）も採用版フォーマットに統一されている状態
- `grep -nE 'Fixes #' CLAUDE.md .cursor/rules/dev-flow.mdc` のヒットが 0 件になっている状態
- `grep -nE 'Closes #' CLAUDE.md .cursor/rules/dev-flow.mdc` のヒットが複数箇所で確認できる状態
- `## 実装内容` / `## テスト方法` / `## テスト結果` / `## 既知の問題・TODO` という旧フォーマットの見出しが PR Description セクションから消えている状態

## テスト観点

- `grep -nE 'Fixes #' CLAUDE.md .cursor/rules/dev-flow.mdc` を実行してヒット 0 件
- `grep -n 'Closes #' CLAUDE.md .cursor/rules/dev-flow.mdc` で複数件ヒット
- `grep -nE '## 実装内容|## テスト方法|## テスト結果|## 既知の問題' .cursor/rules/dev-flow.mdc` でヒット 0 件
- `grep -n '採用版' .cursor/rules/dev-flow.mdc` または `grep -n '## 概要' .cursor/rules/dev-flow.mdc` で新フォーマットが含まれていること
- `grep -n 'PR Description' CLAUDE.md` で dev-flow.mdc への参照が含まれていること
- `git diff` で対象セクション以外が変更されていないこと

## 非対象範囲

- Issue 本文フォーマット（背景・実装範囲・完了定義・テスト観点・非対象範囲）の変更は対象外
- PR タイトル形式（`feat:` / `fix:` 等のプレフィックス）の変更は対象外（Issue 3 で対応）
- `#T0XX` から `#XXX` への番号形式統一は対象外（Issue 3 で対応）
- `.cursor/rules/wiki-modification.mdc` の修正は対象外

## 依存関係

- **Issue 3（dev-flow.mdc を React 構成に全面更新）が先行マージされていることが望ましい**
- Issue 3 で `#T0XX → #XXX` が修正されているため、本 Issue では `Fixes → Closes` の置換のみで完結する
- 並行作業の場合は merge 時に競合する可能性あり

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-pr-body-format-unification.md`

内容:
```
# PR 本文形式の統一＋Closes/Fixes 表記統一
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
4. PR 本文に以下を必ず記載すること（本 Issue の修正対象のフォーマットを自ら適用すること）：

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Opus レビューで PR 本文形式が 3 箇所で食い違う Important 問題が検出されたため

## 確認済み事項
- [ ] grep で `Fixes #` が 0 件、新フォーマット見出しが含まれていることを確認
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
