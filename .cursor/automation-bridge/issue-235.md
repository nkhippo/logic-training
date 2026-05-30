# Issue Bridge Snapshot

- Issue: #235
- Title: 【docs / Important】dev-flow.mdc 内 Step 番号の二重定義解消＋CLAUDE.md への逆参照を追加
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/235
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:53:43Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Important** 級の構造的問題として検出。

### 問題 A: dev-flow.mdc 内で「Step 3」が二重定義されている

`.cursor/rules/dev-flow.mdc` には現在「Step 3」が **2 つの異なる意味で**使われている：

1. 「## 実装前に必ずやること（この順番で）」内の **Step 3: 既存コードを確認**
2. 「## 設計ドキュメント整備フェーズ（Step 3-a〜3-c）」の **Step 3-a〜3-c: ドキュメント整備＋点検**

さらに `CLAUDE.md`「## 開発フロー（全7ステップ）」の **Step 3 は「設計ドキュメント整備＋点検」全体**を指すため、`dev-flow.mdc` 内「Step 3: 既存コードを確認」とは別概念。

→ 同一ファイル内で Step 3 が 2 つの意味、ファイル間でさらに 3 つ目の意味。Cursor が「Step 3」と言われたときどれを指すか判断できない。

### 問題 B: dev-flow.mdc から CLAUDE.md への逆参照がない

- `CLAUDE.md` → `dev-flow.mdc`：明示（「詳細は `.cursor/rules/dev-flow.mdc` を参照」）✅
- `dev-flow.mdc` → `CLAUDE.md`：**なし** ❌

→ Cursor が `dev-flow.mdc` だけ読んだ場合、CLAUDE.md §1（品質基準）の存在に気付けない。また、「実装前にやること」が CLAUDE.md 7 ステップフローのどこに対応するかが見えない。

## 実装範囲

### 修正対象ファイル
- `.cursor/rules/dev-flow.mdc`

### 具体的な修正内容

#### 1. Step 番号の二重定義を解消（リネーム）

「## 実装前に必ずやること（この順番で）」セクションのサブ見出しをリネームする。

| 現状 | 修正後 |
|---|---|
| `### Step 0: ドキュメント基準ファイルの確認（最初に必ず行う）` | `### 事前確認 0: ドキュメント基準ファイルの確認（最初に必ず行う）` |
| `### Step 1: GitHub Issue を確認（正本・最重要）` | `### 事前確認 1: GitHub Issue を確認（正本・最重要）` |
| `### Step 2: タイプに応じた追加参照（Issue 本文のリンクに従う）` | `### 事前確認 2: タイプに応じた追加参照（Issue 本文のリンクに従う）` |
| `### Step 3: 既存コードを確認` | `### 事前確認 3: 既存コードを確認` |

→ セクション名を「事前確認 0〜3」に統一し、「Step」は CLAUDE.md と整合する「設計ドキュメント整備フェーズ（Step 3-a〜3-c）」「実装フェーズの点検（Step 7-a）」にだけ使う形に揃える。

#### 2. ファイル冒頭に CLAUDE.md への逆参照と位置づけを追加

`.cursor/rules/dev-flow.mdc` の最上部（YAML frontmatter の直下）に、以下のセクションを **新規追加** する：

```markdown
## このファイルの位置づけ

このルールは **`CLAUDE.md` の開発フロー Step 3〜7（設計ドキュメント整備〜実装）を Cursor 視点で詳述した**ものです。

- 全体フロー・分割判断・タイプ判定・base ブランチ判断は `CLAUDE.md` を参照
- ドキュメント編集・要件定義書・仕様書の品質基準は `CLAUDE.md` の「## 品質基準」セクションを参照
- Bug 対応の根本原因記録は `docs/bug-knowledge.md` を参照

> 矛盾を見つけた場合は **`CLAUDE.md` が正**。Issue Comment で Naoya に報告すること。
```

#### 3. 「## 実装前に必ずやること」セクションの直前に、CLAUDE.md フロー全体との対応関係を追加

```markdown
> ⚠️ このセクション（事前確認 0〜3）は CLAUDE.md の **Step 3-a の前準備**にあたる。
> CLAUDE.md 開発フローの「Step 3: 設計ドキュメント整備＋点検」を実施する前に、必ずこの 4 項目を完了すること。
```

#### 4. 設計ドキュメント整備フェーズ・実装フェーズ点検のセクション見出しは現状維持

`### Step 3-a: ドキュメント整備＋点検`〜`### Step 3-c: 設計変更箇所・実装影響箇所のまとめ` および `## 実装フェーズの点検（Step 7-a）` は CLAUDE.md と整合しているため**変更しない**。

## 完了定義

- `.cursor/rules/dev-flow.mdc`「## 実装前に必ずやること」セクション内の `Step 0〜3` が `事前確認 0〜3` にリネームされている状態
- ファイル冒頭（frontmatter 直下）に「## このファイルの位置づけ」セクションが追加され、CLAUDE.md / bug-knowledge.md への参照が明示されている状態
- 「## 実装前に必ずやること」セクションの直前または直下に、「事前確認 0〜3 は CLAUDE.md の Step 3-a の前準備」という注記が追加されている状態
- 設計ドキュメント整備フェーズの `Step 3-a〜3-c` および実装フェーズ点検の `Step 7-a` は変更されずに残っている状態
- 矛盾発生時のルール（CLAUDE.md が正）が明示されている状態

## テスト観点

- `grep -nE '^### Step [0-3]:' .cursor/rules/dev-flow.mdc` を実行してヒット 0 件であること（`Step 3-a` 等のサブステップは除外）
- `grep -nE '^### 事前確認 [0-3]:' .cursor/rules/dev-flow.mdc` で 4 件ヒットすること
- `grep -n 'CLAUDE.md' .cursor/rules/dev-flow.mdc` で複数箇所ヒットすること（現状 0 件）
- `grep -n 'Step 3-a' .cursor/rules/dev-flow.mdc` で既存記述が残っていること
- `git diff` で対象セクション以外が変更されていないこと

## 非対象範囲

- `CLAUDE.md` 側の修正は対象外
- 設計ドキュメント整備フェーズ（Step 3-a〜3-c）の中身の変更は対象外
- 実装フェーズ点検（Step 7-a）の中身の変更は対象外
- Cursor → Naoya コミュニケーションルール（Issue Comment を正とする等）の変更は対象外

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-dev-flow-step-renumbering.md`

内容:
```
# dev-flow.mdc Step 番号二重定義解消＋CLAUDE.md逆参照追加
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
- grep で `^### Step [0-3]:` が 0 件、`^### 事前確認 [0-3]:` が 4 件であることを確認した
- CLAUDE.md への参照が複数箇所含まれていることを確認した
- lint 通過

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
