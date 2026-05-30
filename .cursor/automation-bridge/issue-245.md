# Issue Bridge Snapshot

- Issue: #245
- Title: 【docs / Important】Obsidian 同期運用を統一・PR 作成時に Cursor が自動保存する設計に変更
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/245
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:58:25Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビュー（観点 E-1 Obsidian 行）＋ Naoya の追加要件（PR 作成時に Cursor が Obsidian へメモを自動保存）を統合した **Important** 級の運用整備。

### 現状の問題

`CLAUDE.md` と `.cursor/rules/dev-flow.mdc` で **Obsidian 保存の運用が 2 系統並立**している：

**系統 A: Cursor が直接保存する設計**
- `CLAUDE.md`「Issue 本文に必ず含めるセクション・Obsidian記録」
- 「実装完了後、Cursor が以下を Obsidian に保存すること」
- パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-<トピック>.md`
- 内容: 実装内容 / 変更ファイル / 関連Issue

**系統 B: Naoya 手動保存リマインド設計**
- `.cursor/rules/dev-flow.mdc`「Obsidian 同期タスク自動リマインド」
- 「Cursor がリマインドを表示し、Naoya が手動で Obsidian に保存」
- パターン 1（ドキュメント push 時）/ パターン 2（コード push 時）

→ どちらが「正」かが Cursor に判断できず、両方やる・どちらもやらない等のばらつきが発生し得る。

### Naoya の追加要件

「**developへのPRをマージした段階（無理ならPRを作成した段階）で Cursor が Obsidian へメモを保存**」

→ 確認の結果、「PR 作成時に Cursor が自動保存」で確定（マージ時は Naoya が GitHub UI で実行するため Cursor 起動トリガーがない / PR 作成時は Cursor 自身が実行するので確実）。

### 解決方針

**「PR 作成時に Cursor が直接 Obsidian ファイルを作成・push する」設計に一本化**し、リマインド設計（系統 B）を**自動保存実装フォールバック**として位置づける。

加えて、「議論結果メモ（Claude × Naoya）」と「実装結果メモ（Cursor）」の保存先・テンプレを明確に分離する。

## 実装範囲

### 修正対象ファイル
- `CLAUDE.md`
- `.cursor/rules/dev-flow.mdc`

### 具体的な修正内容

#### 1. Obsidian ディレクトリ構造の明確化（CLAUDE.md に新規セクション追加）

`CLAUDE.md` 末尾付近に「## Obsidian 同期ルール」セクションを新規追加：

```markdown
## Obsidian 同期ルール

### ディレクトリ構造（Naoya 側 Obsidian）

```
/Users/naoya.k/Documents/Obsidian/thinkgrindai/
├── discussions/        ← Claude × Naoya の議論ログ・要件議論
├── decisions/          ← Claude が確定した設計判断（中間成果）
├── implementations/    ← Cursor が PR 作成時に保存する実装記録（最終成果）
└── confirmed-decisions/ ← マージ済み内容の確定版（Naoya が手動整理）
```

### Cursor が保存するファイル（PR 作成時に自動）

| トリガー | 保存先 | 内容 |
|---|---|---|
| **PR 作成時（全 Issue 共通）** | `implementations/YYYY-MM-DD-<topic>.md` | 実装内容 / 変更ファイル / 関連 Issue / PR URL |
| **Bug Issue PR 作成時（追加）** | 上記に加え `docs/bug-knowledge.md` 末尾追記 | 根本原因記録（dev-flow.mdc「Bug Issue の場合の追加対応」参照） |

> ⚠️ 保存先パスは `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/` に統一する。
> 旧パス（`decisions/` 直下に実装メモを置く）は使用しない。`decisions/` は Claude が確定した設計判断専用。

### Cursor の動作（PR 作成時）

PR 作成後、以下を自動で実行する：

1. ローカル Obsidian ディレクトリにアクセス可能か確認（`/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/`）
2. **アクセス可能な場合**：
   - `YYYY-MM-DD-<topic>.md` を新規作成
   - Issue 本文の「## Obsidian記録」セクションに記載されたテンプレに従って記入
   - 内容を実際の実装結果で埋める
3. **アクセス不可の場合**（GitHub Actions Webhook 起動時など）：
   - 系統 B（リマインド設計）にフォールバック
   - PR 本文末尾または Issue Comment に保存予定の内容をリマインドとして掲載
   - Naoya が手動で Obsidian に保存できる形式で出力

### Cursor が保存する内容のテンプレ（実装記録）

```markdown
# <Issue タイトル>

## 関連 Issue / PR
- Issue: #XXX
- PR: #YYY

## 実装内容
（Cursor が実装した変更点を箇条書きで）

## 変更ファイル
（git diff --name-only の出力を貼る）

## 動作確認
（lint 結果・テスト結果・手動確認内容）

## 残課題・申し送り
（Issue Comment に書いた懸念があれば転記）
```
```

#### 2. `CLAUDE.md`「Issue 本文に必ず含めるセクション」内「Obsidian記録」セクションの記述を更新

現状の「実装完了後、Cursor が以下を Obsidian に保存すること」を、「PR 作成時に Cursor が以下を Obsidian に保存すること」に修正し、保存先パスを `implementations/` に変更：

```markdown
#### Obsidian記録
※ PR 作成時、Cursor が以下を Obsidian に自動保存すること（詳細は `CLAUDE.md`「## Obsidian 同期ルール」を参照）

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-<topic>.md`

内容（Cursor が実装結果で埋める）：
（テンプレ：実装内容 / 変更ファイル / 動作確認 / 残課題・申し送り）
```

#### 3. `.cursor/rules/dev-flow.mdc`「## Obsidian 同期タスク自動リマインド」セクションを「## Obsidian 同期タスク（PR 作成時に Cursor が自動実行）」にリネームし、内容を更新

現状の「Naoya 手動保存リマインド」中心の記述を、「Cursor 自動保存＋フォールバックリマインド」に再構成：

```markdown
# Obsidian 同期タスク（PR 作成時に Cursor が自動実行）

## あなたが PR を作成するたびに

PR 作成直後に、以下を自動で実行してください：

1. ローカル Obsidian ディレクトリへのアクセス可否を確認
   - 対象: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/`
2. **アクセス可能な場合**：
   - `YYYY-MM-DD-<topic>.md` を新規作成
   - Issue 本文「## Obsidian記録」のテンプレに従い内容を記入
3. **アクセス不可の場合**：
   - Issue Comment に保存予定内容を「🔄 Obsidian 同期タスク」として投稿
   - Naoya が手動で `implementations/` に保存する

## 保存内容テンプレ

（CLAUDE.md「## Obsidian 同期ルール」内「Cursor が保存する内容のテンプレ（実装記録）」と同一）

> ⚠️ 旧運用（パターン 1 / パターン 2 / post-push フック等）は本セクションに統合された。
> `scripts/obsidian-sync-reminder.sh` は引き続き使ってよいが、PR 作成時の自動保存が主、スクリプトは補助。
```

#### 4. `.cursor/rules/dev-flow.mdc` 内の「パターン 1: 要件定義書・仕様書・指示書を push したとき」「パターン 2: ソースコード実装を push したとき」セクションは**保持**するが、位置づけを明示

これらは「push 時の補助リマインド」として残し、「PR 作成時の自動保存（メイン）」と区別する記述を冒頭に追加：

```markdown
> 以下のパターンは push 時の補助リマインドです。
> PR 作成時の自動保存（前述）が完了している場合、これらのリマインドは省略してよい。
> push 単位で別途確認したいタスクがある場合のみ出力する。
```

#### 5. `.cursor/rules/dev-flow.mdc`「## トリガー一覧」表のうち、Obsidian 同期の意味づけを更新

Issue 3 で表自体は更新されている前提。表に対する解釈の文章を追加：

```markdown
> ⚠️ パターン 1・2 は **push 単位の補助リマインド**。
> PR 作成時の自動保存（Cursor が `implementations/` に直接保存）が主のフローであり、
> パターン 1・2 はそれを補完する位置づけ。
```

## 完了定義

- `CLAUDE.md` に「## Obsidian 同期ルール」セクションが存在し、ディレクトリ構造・保存先・Cursor の動作・テンプレが明示されている状態
- `CLAUDE.md`「Issue 本文に必ず含めるセクション」内「Obsidian記録」が「PR 作成時に保存」「保存先 `implementations/`」に更新されている状態
- `.cursor/rules/dev-flow.mdc`「Obsidian 同期タスク自動リマインド」が「Obsidian 同期タスク（PR 作成時に Cursor が自動実行）」にリネームされ、自動保存中心の記述になっている状態
- フォールバック動作（アクセス不可時の Issue Comment 出力）が明示されている状態
- パターン 1・2 が「push 単位の補助リマインド」として位置づけが明示されている状態
- `decisions/` と `implementations/` の役割分離が CLAUDE.md に明示されている状態

## テスト観点

- `grep -n '## Obsidian 同期ルール' CLAUDE.md` で 1 件ヒット
- `grep -n 'implementations' CLAUDE.md .cursor/rules/dev-flow.mdc` で複数件ヒット
- `grep -n 'PR 作成時' CLAUDE.md .cursor/rules/dev-flow.mdc | grep -i 'obsidian'` で複数件ヒット
- `grep -n 'アクセス不可' .cursor/rules/dev-flow.mdc` でフォールバック記述が存在すること
- `grep -nE 'decisions/.*implementations|implementations/.*decisions' CLAUDE.md` でディレクトリ構造が明示されていること（隣接表記の確認）
- 全 Obsidian 関連セクションで「PR 作成時」が「実装完了後」より優位な記述になっていること（目視）

## 非対象範囲

- Obsidian 側のディレクトリ作成・既存ファイル移動は対象外（Naoya が必要に応じて手動実施）
- `scripts/obsidian-sync-reminder.sh` の修正は対象外（補助的に残す）
- `.githooks/` 配下の post-push フック修正は対象外
- マージ時の追加保存（develop → main マージ時のリリースノート連携等）は対象外
- `confirmed-decisions/` 配下の整理ルールは対象外（Naoya 手動運用のまま）
- 既存の `decisions/` 配下にある旧実装記録の移動は対象外

## 想定される技術的懸念

PR 作成時に Cursor が `/Users/naoya.k/Documents/Obsidian/...` にアクセスできるかは**起動経路に依存**する：

- **Cursor デスクトップアプリでローカル起動**：アクセス可能 → 自動保存できる
- **GitHub Actions Webhook 起動**：通常はリポジトリ内のみ → アクセス不可 → フォールバック動作

→ アクセス可否は Cursor 自身が実行時に確認し、不可な場合は Issue Comment 出力にフォールバックする設計にする。実装中に技術的不可能が判明した場合は Issue Comment に報告し、Naoya と相談する（dev-flow.mdc「実装フェーズの点検」に準拠）。

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること（本 Issue で確定した新運用に従って）

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-obsidian-sync-unification.md`

内容：
```
# Obsidian 同期運用の統一・Cursor が PR 作成時に自動保存
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `docs`、`Closes #XXX` を記載）
   - 未完成の場合はタイトルに `[WIP]` を付けてよい
4. **本 Issue で確定した新運用に従い、PR 作成直後に Obsidian 自動保存を試行**
   - アクセス可能：`implementations/YYYY-MM-DD-obsidian-sync-unification.md` を作成
   - アクセス不可：Issue Comment にリマインド出力
5. PR 本文（採用版フォーマット）

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Opus レビュー（観点 E-1）＋ Naoya 追加要件で、Obsidian 同期運用の 2 系統並立を解消するため

## 確認済み事項
- [ ] grep で「Obsidian 同期ルール」「implementations」「PR 作成時」が複数件ヒット
- [ ] 旧運用（実装完了後保存・パターン 1/2 中心）からの移行が完了していることを目視確認
- [ ] Obsidian 自動保存の試行結果（成功/フォールバック）を PR 本文に記載
- [ ] lint 通過

## 未確認・懸念点
- Obsidian 自動保存が技術的に不可能だった場合は Issue Comment に報告

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
