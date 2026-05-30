# Issue Bridge Snapshot

- Issue: #239
- Title: 【docs / Important】bug-knowledge.md / bug.md と CLAUDE.md・dev-flow.mdc の連携を追加（Bug 対応ループの確立）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/239
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:55:29Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Important** 級の問題として検出。

施策5 で `docs/bug-knowledge.md`（Bug 根本原因蓄積）と `.github/ISSUE_TEMPLATE/bug.md`（PRマージ後の根本原因記録）を新設したが、これらが **`CLAUDE.md` および `.cursor/rules/dev-flow.mdc` から完全に独立**しており、運用フローに組み込まれていない。

- `CLAUDE.md` 内に `bug-knowledge.md` への言及が **0 件**
- `.cursor/rules/dev-flow.mdc` 内に `bug-knowledge.md` への言及が **0 件**
- `bug.md`（Issue テンプレ）→ `bug-knowledge.md` への参照はある（一方向のみ）

→ Cursor が Bug Issue を実装し PR マージしても、`bug-knowledge.md` 追記運用に気付かないまま完了する可能性が高い。施策5の構造的改善ループ（月1回 Opus レビュー → 改善提案）が機能しなくなる。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`
- `.cursor/rules/dev-flow.mdc`

### 具体的な修正内容

#### 1. `.cursor/rules/dev-flow.mdc` の「## PR 作成後、必ず Naoya に伝えること」セクション直後に「### Bug Issue の場合の追加対応」サブセクションを新規追加

```markdown
### Bug Issue の場合の追加対応

ラベルに `bug` が含まれる Issue を完了させる場合、PR マージ後に以下を**必ず**実施する：

1. **Issue 本文の「## 根本原因記録」テーブル**を記入する
   - 直接原因 / 根本原因 / 根本原因カテゴリ（6 カテゴリから選択）/ 再発防止策
   - カテゴリ定義は `docs/bug-knowledge.md` を参照
2. **`docs/bug-knowledge.md` の末尾に同内容を追記**する
   - フォーマットは `docs/bug-knowledge.md`「## 記録フォーマット（Cursor用）」を参照
   - ファイル末尾の「<!-- 新しい記録は末尾に追加する -->」コメントの後に追記
3. 1〜2 を含めた追加コミットを **同一 PR ブランチ**にプッシュする（PR がまだマージされていない場合）、または **新規 docs PR**を作成する（PR が既にマージされている場合）

> ⚠️ 根本原因が PR マージ時点で不明な場合は、「調査中」と記載して別 Issue を立てる。調査完了後に bug-knowledge.md を更新する。
```

#### 2. `.cursor/rules/dev-flow.mdc`「## このファイルの位置づけ」セクション（Issue 4 で追加予定）に bug-knowledge.md への参照を追加

※ Issue 4 が先行マージされている前提。未マージなら本 Issue でセクションごと新規作成する。

参照を追加する箇所：
```markdown
- Bug 対応の根本原因記録は `docs/bug-knowledge.md` を参照
- Bug Issue テンプレは `.github/ISSUE_TEMPLATE/bug.md` を参照
```

#### 3. `CLAUDE.md`「## Cursor への指示」セクション内「### 基本ルール」に bug 対応の項目を追加

`CLAUDE.md`「### 基本ルール」リストの末尾に以下を追加：

```markdown
- ラベルに `bug` が含まれる Issue を完了させる場合、PR マージ後（または同一 PR 内）で `docs/bug-knowledge.md` に根本原因記録を追記すること（詳細は `.cursor/rules/dev-flow.mdc`「Bug Issue の場合の追加対応」を参照）
```

#### 4. `CLAUDE.md` 末尾に「## Bug 対応ループ（月次運用）」セクションを新規追加

```markdown
## Bug 対応ループ（月次運用）

Bug の根本原因を蓄積し、構造的改善に活かすためのループ：

1. **Bug Issue 完了時（Cursor）**：PR マージ後に `docs/bug-knowledge.md` 末尾に根本原因記録を追記
2. **月次レビュー時（Naoya）**：「ThinkGrindAi / サービス相談」Project で Opus に分析依頼
   - 依頼文テンプレは `docs/bug-knowledge.md`「## Opusレビュー依頼文（月1回・コピペ用）」を参照
3. **Opus 分析結果に基づく改善（Claude）**：改善提案を CLAUDE.md / dev-flow.mdc / スキルに反映
```

#### 5. `CLAUDE.md`「### Issue 草稿・仕様書を作るときの形式」内「#### Issue 起票前の必須チェック」に Bug Issue 用追加チェックを追加

```markdown
**Bug Issue の場合の追加チェック**
- [ ] Issue 本文に「## 根本原因記録（PR マージ後に Cursor が記入）」テーブルが含まれているか
  （`.github/ISSUE_TEMPLATE/bug.md` のテンプレを使う場合は自動的に含まれる）
- [ ] テンプレを使わない場合は手動で追加すること
```

## 完了定義

- `.cursor/rules/dev-flow.mdc`「## PR 作成後、必ず Naoya に伝えること」セクション直後に「### Bug Issue の場合の追加対応」サブセクションが存在する状態
- このサブセクションに「Issue 本文の根本原因記録テーブル記入」「bug-knowledge.md 追記」「追加コミット or 新規 docs PR」の 3 ステップが明示されている状態
- `CLAUDE.md`「### 基本ルール」に bug 対応の項目が 1 行追加されている状態
- `CLAUDE.md` 末尾に「## Bug 対応ループ（月次運用）」セクションが存在し、3 ステップが明示されている状態
- `CLAUDE.md`「Issue 起票前の必須チェック」に「Bug Issue の場合の追加チェック」が存在する状態
- `grep -n 'bug-knowledge' CLAUDE.md .cursor/rules/dev-flow.mdc` で複数箇所がヒットする状態（現状 0 件）

## テスト観点

- `grep -n 'bug-knowledge' CLAUDE.md` で 3 件以上ヒット（基本ルール / Bug 対応ループ / Issue 起票前チェック）
- `grep -n 'bug-knowledge' .cursor/rules/dev-flow.mdc` で 2 件以上ヒット（追加対応セクション / 位置づけセクション）
- `grep -n 'Bug 対応ループ' CLAUDE.md` で 1 件ヒット
- `grep -n 'Bug Issue の場合' .cursor/rules/dev-flow.mdc` で 1 件ヒット
- `git diff` で対象セクション以外が変更されていないこと

## 非対象範囲

- `docs/bug-knowledge.md` 自体の内容変更は対象外
- `.github/ISSUE_TEMPLATE/bug.md` 自体の内容変更は対象外
- 月次 Opus レビューの実施手順・Project 設定は対象外（要件相談で別途）
- 月次レビュー忘れ防止のリマインド機構の実装は対象外（要件相談で別途）
- 既存の Bug Issue（過去分）への遡及記録は対象外

## 依存関係

- **Issue 4（dev-flow.mdc Step 番号二重定義解消＋逆参照追加）が先行マージされていることが望ましい**
- Issue 4 で「## このファイルの位置づけ」セクションが追加されているため、本 Issue ではそこへの追記のみで完結する
- Issue 4 が未マージの場合は本 Issue 内でセクションごと新規作成する

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-bug-knowledge-integration.md`

内容:
```
# bug-knowledge.md / bug.md と CLAUDE.md・dev-flow.mdc の連携追加
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
4. PR 本文（採用版フォーマット。Issue #237 が先行マージ済みなら新フォーマット、未マージなら旧フォーマットで構わない）

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Opus レビューで施策5（bug-knowledge.md 運用）が他ルールと独立している Important 問題が検出されたため

## 確認済み事項
- [ ] grep で `bug-knowledge` が CLAUDE.md / dev-flow.mdc 両方に複数件ヒット
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
