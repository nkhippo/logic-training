# Issue Bridge Snapshot

- Issue: #181
- Title: docs: CLAUDE.md リポジトリURL修正 + Claude Issue起票ルールの明文化強化
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/181
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T10:08:27Z

## Body

🤖 **Claude より**

## 背景・目的

### 1. リポジトリURLが古いまま
CLAUDE.md の「プロジェクト概要」セクションに以下の記載がある。

```
- **リポジトリ**: https://github.com/nkhippo/thinkgrindai
```

正しくは `https://github.com/nkhippo/ThinkGrindAi`（大文字・新リポジトリ名）。  
Claudeが新しいチャットを開始するたびにCLAUDE.mdを読む際、旧URLを参照し誤解する原因になる。

### 2. Claude の Issue 起票ルールが不十分で形骸化している
CLAUDE.md には `ready-for-cursor` ラベルの付与条件（5項目）や署名ルールが記載されているが、  
Claude が実際にIssueを起票する際のチェックリストが明文化されておらず、抜け漏れが発生している。

**今回発覚した不足（Issue #179 起票時）**：
- 署名（`🤖 Claude より`）未記載
- `ready-for-cursor` 5項目のうち「テスト観点」「非対象範囲」が欠落したまま付与
- タイプ A/B/C の判断と影響ファイル数の確認なしに起票
- docs Issue を先行すべきかの分割判断（5軸チェック）未実施
- 完了定義が「具体的な動作」形式になっていない

---

## 実装範囲

対象ファイル: `CLAUDE.md` のみ（1ファイル）

### 修正1: プロジェクト概要セクションのURL修正

```diff
- **リポジトリ**: https://github.com/nkhippo/thinkgrindai
+ **リポジトリ**: https://github.com/nkhippo/ThinkGrindAi
```

### 修正2: 「Claude への指示」セクションに Issue 起票前チェックリストを追加

「Issue 草稿・仕様書を作るときの形式」セクションの冒頭（タイプ A・B・C の説明の前）に以下を追加する：

```markdown
#### Issue 起票前の必須チェック（Claude 自身が毎回確認すること）

起票前に以下をすべて確認し、OKの場合のみ起票する。

**署名・フォーマット**
- [ ] 本文冒頭に `🤖 **Claude より**` と末尾に `_Claude による自動投稿_` を記載しているか

**タイプ判断**
- [ ] タイプ A / B / C のどれか判断したか（影響ファイル数・仕様の複雑さ）
- [ ] タイプ C の場合、docs/requirements/ → docs/specification/ → Issue の順で作成しているか

**分割判断（5軸チェック）**
- [ ] 仕様書・要件定義書の変更を伴う場合、docs Issue を先行させているか
- [ ] 影響ファイルが5つ超の場合、分割しているか
- [ ] 運用ドキュメント修正は単独 Issue にしているか

**ready-for-cursor ラベルの付与条件（5項目すべてそろっているか）**
- [ ] 背景・目的
- [ ] 実装範囲（対象ファイル明示）
- [ ] 完了定義（「〇〇の状態になっていること」という具体的な動作で記述）
- [ ] テスト観点
- [ ] 非対象範囲

1つでも欠けていれば `ready-for-cursor` ラベルを付与しない。
```

---

## 完了定義

以下の状態になっていること：

- `CLAUDE.md` の「プロジェクト概要」セクションのリポジトリURLが `https://github.com/nkhippo/ThinkGrindAi` に更新されている
- `CLAUDE.md` の「Issue 起票前の必須チェック」チェックリストが追加されており、内容が上記の通りである
- 既存のセクション構造（見出しレベル・順序）は変更されていない

## テスト観点

- `CLAUDE.md` を開いてリポジトリURLが正しいか目視確認
- チェックリストが「Issue 草稿・仕様書を作るときの形式」セクションの冒頭に配置されているか確認

## 非対象範囲

- `docs/` 配下の他ファイルへの変更
- `CLAUDE.md` の他セクションの内容変更
- `docs/_index.md` の更新（今回は CLAUDE.md のみの軽微な修正のため不要）

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: **main**、ラベル: docs、本文に `Closes #180` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
