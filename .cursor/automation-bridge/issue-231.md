# Issue Bridge Snapshot

- Issue: #231
- Title: 【docs / Critical】Hotfix 適用判定基準（①②③）を CLAUDE.md に明文化＋サービス相談誘導フローを追加
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/231
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:52:01Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Critical** 級の構造的問題として検出。

施策4 で Hotfix フローを新設し「①影響ファイル 3 つ以下 ②仕様書に正解が明記されている ③UX 変更なし」という適用判定基準を定義したはずだが、**現状の `CLAUDE.md`「Hotfix フロー」セクションには判定基準が一切明文化されていない**。

→ Naoya が「これ Hotfix で」と言ったとき、Claude が適用可否を判定する根拠がない。  
→ Hotfix フローが「品質基準を事実上スキップする抜け道」になりかねない。

加えて、判定基準を満たさない場合の「サービス相談 Project への誘導」も明文化されていないため、大規模変更が誤って Hotfix で進む動線が残っている。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`（「#### Hotfix フロー（タイプ A の軽量版）」セクション）

### 具体的な修正内容

`CLAUDE.md` の「#### Hotfix フロー（タイプ A の軽量版）」セクションに、以下のサブセクションを **新規追加** する。

```markdown
**Hotfix 適用判定（Claude が必ず判定する）**

Naoya から Hotfix の症状が入力されたら、Claude は以下の 3 条件をすべて満たすかを判定する：

1. **影響ファイルが 3 つ以下と見積もれる**
2. **仕様書（`docs/specification*` または `docs/requirements*`）に正解が既に明記されている**
   （新規仕様判断を必要としない。既存仕様への復帰のみ）
3. **UX 変更を伴わない**
   （ユーザーが体験する画面遷移・操作手順・文言・タイミングが変わらない）

3 条件をすべて満たす → Hotfix フローで進める（このセクション以下の手順）。  
1 つでも満たさない → 以下のメッセージで「サービス相談 Project」へ誘導する：

> このご依頼は Hotfix の適用判定基準（①影響 3 ファイル以下 ②仕様書に正解明記 ③UX 変更なし）を満たさないため、
> 「ThinkGrindAi / サービス相談」Project に書き直していただけますか？  
> 通常フロー（Step 1〜7）で要件具体化から進めます。  
> 該当しない条件: <①/②/③ のいずれか具体的に>
```

### 判定基準の配置場所

- 「Hotfix フロー」セクション内、**Naoya の入力フォーマット の直前** に挿入する
- 「Claude の動作」サブセクションの 1 番目に「Hotfix 適用判定を実施」を追加する

## 完了定義

- `CLAUDE.md`「Hotfix フロー」セクションに「Hotfix 適用判定（Claude が必ず判定する）」サブセクションが存在する状態
- 判定基準①②③が文章で明示されている状態
- 「3 条件をすべて満たす → Hotfix フロー」「1 つでも満たさない → サービス相談 Project へ誘導」の分岐が明示されている状態
- 「Claude の動作」サブセクションの最初のステップが「Hotfix 適用判定を実施」になっている状態
- 誘導メッセージのテンプレ文が明示されている状態（コピペで使える形）

## テスト観点

- `grep -n 'Hotfix 適用判定' CLAUDE.md` でセクションが存在することを確認する
- `grep -n '影響ファイルが 3 つ以下' CLAUDE.md` で判定基準①が存在することを確認する
- `grep -n '仕様書' CLAUDE.md | grep -i 'hotfix' -A2 -B2` 相当で判定基準②周辺が読めることを確認する（手動）
- `grep -n 'サービス相談' CLAUDE.md` で誘導先が明示されていることを確認する

## 非対象範囲

- 「ThinkGrindAi / Hotfix 修正」Project の System Prompt 修正は対象外（Project 側の管理）
- 「ThinkGrindAi / サービス相談」Project の System Prompt 修正は対象外
- Hotfix 用ラベル（仮に新設するなら）の追加は対象外
- Naoya の入力フォーマット自体の変更は対象外（既存のまま）

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-hotfix-criteria.md`

内容:
```
# Hotfix 適用判定基準の明文化
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
- grep で判定基準①②③・誘導文・「Hotfix 適用判定」セクションが存在することを確認した
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
