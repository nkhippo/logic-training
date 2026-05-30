# Issue Bridge Snapshot

- Issue: #243
- Title: 【docs / Important】ready-for-cursor ラベルの付与者・タイミング・確認者を明確化
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/243
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:56:59Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Important** 級の問題（観点 D-2-①）として検出。

`CLAUDE.md` には `ready-for-cursor` ラベル付与に関する記述が **2 箇所**あり、付与者・タイミング・確認者が**不明確**：

**箇所 1**: 「## 開発フロー（全7ステップ）」内「GitHub Issue 作成（Naoya が担当）」サブセクション
> Label: feature / ready-for-cursor / <priority>

→ **Naoya が起票時に付与**する読み方。

**箇所 2**: 「### Issue 草稿・仕様書を作るときの形式」内「#### Issue 起票前の必須チェック」
> **ready-for-cursor ラベルの付与条件（5項目すべてそろっているか）**
> （5項目チェック）
> 1つでも欠けていれば `ready-for-cursor` ラベルを付与しない。

→ Claude が起票時に **5 項目チェック**を行う前提だが、誰が**ラベルを実際に付与**するかが明示されていない。

加えて：
- Claude が MCP 経由で Issue 起票する際、ラベルもまとめて付与可能
- Naoya が GitHub UI で手動付与するワークフローも併存している
- どちらが**「正」の運用か**が決まっていない

→ Claude が 5 項目チェック OK と判断した後、自分でラベルを付けるか、Naoya に伝えて付けてもらうかが状況によって分かれてしまう。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`

### 修正方針

以下を**正のルール**とする：

> **Claude が Issue を起票する場合**：5 項目チェック OK なら **Claude が自分で `ready-for-cursor` ラベルを付与**して起票する。  
> **Naoya が GitHub UI から起票する場合**：5 項目チェックは Naoya が確認し、付与する。  
> **既存 Issue に対する後付け**：Naoya が確認後に付与する。

### 具体的な修正内容

#### 1. `CLAUDE.md`「## 開発フロー（全7ステップ）」内「GitHub Issue 作成」サブセクションを「GitHub Issue 作成（Claude が MCP 経由で起票、または Naoya が手動起票）」に変更し、内容を更新

現状：
```
GitHub Issue 作成（Naoya が担当）
  Claude 出力の .md をコピペして Issue 作成
  Label: feature / ready-for-cursor / <priority>
  タイプ C: Body に docs/ の URL を記載
```

修正後：
```
GitHub Issue 作成（Claude が MCP 経由で起票、または Naoya が手動起票）
  - Claude が起票する場合：5 項目チェック OK なら `ready-for-cursor` ラベルも併せて付与
  - Naoya が起票する場合：Claude 出力の .md をコピペし、5 項目チェック後に `ready-for-cursor` を付与
  Label: feature/bug/docs/chore + ready-for-cursor + <priority>（任意）
  タイプ C: Body に docs/ の URL を記載
```

#### 2. `CLAUDE.md`「#### Issue 起票前の必須チェック」内「**ready-for-cursor ラベルの付与条件**」セクションの先頭に、付与者・タイミングを明示する

現状の `ready-for-cursor ラベルの付与条件（5項目すべてそろっているか）` の直前に以下を追加：

```markdown
**ラベル付与者・タイミング**

| 起票ルート | 5 項目チェック実施者 | ラベル付与者 | タイミング |
|---|---|---|---|
| Claude が MCP 経由で起票 | Claude | **Claude（起票時に同時付与）** | Issue 起票時 |
| Naoya が GitHub UI で起票 | Naoya | **Naoya（起票直後）** | Issue 起票直後 |
| 既存 Issue への後付け | Naoya（最終確認） | **Naoya** | 起票後に内容が 5 項目を満たした時点 |

> ⚠️ Claude が起票する場合でも、Naoya が後で 5 項目チェックを再確認し、不備があればラベルを外す権限を持つ。
```

#### 3. `CLAUDE.md`「### Issue 草稿・仕様書を作るときの形式」内「タイプ A・B」「タイプ C」セクションの「作成後に Naoya に伝えること」を更新

現状（タイプ A・B）：
```
Issue 草稿（.md）を作成しました。以下を実施してください：
1. 【GitHub】草稿をコピペして Issue を作成
2. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
```

修正後：
```
**[Claude が MCP 経由で起票する場合]**

Issue を起票しました（#XXX）。以下を実施してください：
1. 【GitHub】Issue 内容を確認
2. 【任意】優先度ラベル（critical/important/minor 等）を付与
3. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
   - ready-for-cursor ラベルは既に付与済み（5 項目チェック OK 確認済み）

**[Naoya が手動起票する場合]**

Issue 草稿（.md）を作成しました。以下を実施してください：
1. 【GitHub】草稿をコピペして Issue を作成
2. 【GitHub】5 項目チェック後に ready-for-cursor ラベルを付与
3. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
```

タイプ C 側も同様の構造で更新する（docs/ コミット手順は既存のまま）。

## 完了定義

- `CLAUDE.md`「## 開発フロー（全7ステップ）」内「GitHub Issue 作成」サブセクションが「Claude が MCP 経由で起票、または Naoya が手動起票」の二経路を明示している状態
- `CLAUDE.md`「#### Issue 起票前の必須チェック」内「**ready-for-cursor ラベルの付与条件**」直前に「**ラベル付与者・タイミング**」サブセクションが存在し、3 通りの起票ルート（Claude MCP / Naoya 手動 / 既存後付け）と付与者・タイミングが表形式で明示されている状態
- タイプ A・B・C それぞれの「作成後に Naoya に伝えること」が、Claude 起票時 / Naoya 起票時の 2 経路に分岐している状態

## テスト観点

- `grep -n 'ラベル付与者・タイミング' CLAUDE.md` で 1 件ヒット
- `grep -n 'MCP 経由で起票' CLAUDE.md` で複数件ヒット
- `grep -n 'Naoya が手動起票' CLAUDE.md` で複数件ヒット
- 「タイプ A・B」「タイプ C」両方に「[Claude が MCP 経由で起票する場合]」「[Naoya が手動起票する場合]」の分岐が存在することを目視確認
- `git diff` で対象セクション以外が変更されていないこと

## 非対象範囲

- 5 項目自体（背景・目的 / 実装範囲 / 完了定義 / テスト観点 / 非対象範囲）の修正は対象外
- 優先度ラベル（critical/important/minor）の体系整理は対象外
- ラベル付与権限の GitHub 側設定（branch protection rules 等）は対象外
- Cursor 側の自動起動フロー（Webhook）の変更は対象外

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-ready-for-cursor-attribution.md`

内容:
```
# ready-for-cursor ラベル付与者・確認者の明確化
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
4. PR 本文（採用版フォーマット）

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Opus レビューで ready-for-cursor 付与者・タイミングが不明確な Important 問題が検出されたため

## 確認済み事項
- [ ] grep で「ラベル付与者・タイミング」「MCP 経由で起票」が含まれていることを確認
- [ ] タイプ A・B・C 各セクションで二経路分岐が存在することを目視確認
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
