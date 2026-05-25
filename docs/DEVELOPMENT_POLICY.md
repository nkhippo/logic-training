# Development Policy: thinkgrindai

**最終更新**: 2026-05-25  
**バージョン**: 1.1

---

## 目次
1. [開発フロー概要](#開発フロー概要)
2. [タスク分類と対応](#タスク分類と対応)
3. [各ロールの責務](#各ロールの責務)
4. [GitHub Projects 運用](#github-projects-運用)
5. [GitHub Issues 運用](#github-issues-運用)
6. [Cursor への指示方法](#cursor-への指示方法)
7. [コードレビュー・マージ基準](#コードレビュー・マージ基準)
8. [ドキュメント管理](#ドキュメント管理)
9. [緊急対応](#緊急対応)
10. [品質基準](#品質基準)

---

## 開発フロー概要

### タスク流れ全体像

```
┌─────────────────────────────────────────────────────────────┐
│ DISCOVERY PHASE（思考の場）                                  │
│ Naoya が idea を出す → Claude と議論 → 要件確定             │
│ ツール: Obsidian（ローカル: ~/Documents/Obsidian/ThinkGrindAi）│
│ 期間: 数時間～数日（案件による）                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ SPECIFICATION PHASE（意思決定の記録）                        │
│ Claude が Issue本文を草稿出力（.mdファイル）                │
│   → Naoya が GitHub Issue 作成 → Cursor に Issue URL を渡す │
│ ツール: GitHub Issues                                        │
│ 期間: 数時間～1日                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ EXECUTION PHASE（実装）                                      │
│ GitHub Issue 作成 → Cursor 実装 → PR → Naoya テスト → Merge │
│ ツール: GitHub Projects / Issues / PR                      │
│ 期間: 数時間～数日                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## タスク分類と対応

### 分類一覧

| 種別 | Claude がやること | Naoya がやること |
|---|---|---|
| **タイプ A**（Hotfix・軽微変更） | Issue 本文を草稿出力（`.md` ファイル） | コピペして Issue 作成 → Cursor に Issue URL を渡す |
| **タイプ B**（中規模・仕様変更） | Issue 本文を草稿出力（仕様詳細込み・`.md` ファイル） | コピペして Issue 作成 → Cursor に Issue URL を渡す |
| **タイプ C**（大規模・新機能） | `docs/` に要件定義書・仕様書を作成 → Issue 本文も `.md` ファイルで出力 | `docs/` を push → Issue 作成 → Cursor に Issue URL を渡す |

### タイプ B / C の判断基準

**タイプ B（Issue 本文に統合）**:
- 1 つの PR で完結する
- 影響ファイルが 3 つ以下
- 仕様の参照が今回の Issue 内だけで完結する

**タイプ C（`docs/` に仕様書を作成）**:
- 複数 PR に分割が必要
- 影響ファイルが 4 つ以上、または複数タブにまたがる
- 他の Issue や将来の実装から参照される可能性がある

グレーゾーンの場合は Claude が B 寄り / C 寄りを提示し、Naoya が最終判断する。

### `docs/cursor-instructions/` の運用

| 種別 | cursor-instructions |
|---|---|
| タイプ A・B | **作成しない**（廃止）。実装仕様は Issue 本文にすべて記載する |
| タイプ C | **引き続き作成する**（大規模案件の実装単位ごと） |

---

### タイプ A: 軽微タスク（Hotfix・軽微変更）

**特徴**:
- バグ修正
- 軽微な仕様変更（検討から確定まで < 30分）
- ドキュメント更新
- リファクタリング

**フロー**:
```
Claude: Issue 本文草稿を .md ファイルで出力
  ↓
Naoya: 草稿をコピペして GitHub Issue 作成
  ↓
Naoya: Cursor に Issue URL を渡す
  ↓
Cursor: Issue 本文を読んで実装 → PR 作成（Fixes #XXXX）
  ↓
Naoya テスト → Merge → Done
```

**処理時間目安**: 15分～1時間  
**GitHub Issue テンプレ**: bug.md / chore.md

---

### タイプ B: 中規模案件（仕様変更）

**特徴**:
- 新機能（要件整理が必要）
- 仕様変更（影響範囲が中程度）
- 中型リファクタリング

**フロー**:
```
Naoya: Obsidian に idea を書く
  ↓
Claude: Naoya と議論 → Issue 本文草稿（仕様詳細込み）を .md ファイルで出力
  ↓
Naoya: 草稿をコピペして GitHub Issue 作成
  ↓
Naoya: Cursor に Issue URL を渡す
  ↓
Cursor: Issue 本文を読んで実装 → PR 作成（Fixes #XXXX）
  ↓
Naoya テスト → Merge → Done
```

**処理時間目安**: 2～3 日（検討） + 1～3 日（実装）  
**GitHub Issue テンプレ**: feature.md（仕様は Issue 本文に記載）

---

### タイプ C: 大規模案件（新機能・Phase 立ち上げ）

**特徴**:
- 新サービス・新タブの実装
- 大幅な仕様変更
- 技術スタック変更

**フロー**:
```
Naoya: Project Vision をまとめる
  ↓
Claude: 要件定義書（docs/requirements/）・仕様書（docs/specification/）を作成
  ↓
Claude: cursor-instructions/ に実装指示書を作成（タイプ C のみ）
  ↓
Claude: Issue 本文草稿を .md ファイルで出力
  ↓
Naoya: docs/ を push → Issue 作成 → Cursor に Issue URL を渡す
  ↓
複数の Issue + PR に分割して進行
```

**処理時間目安**: 1 週間～数週間  
**ドキュメント**: `docs/requirements/`, `docs/specification/`, `docs/cursor-instructions/`（タイプ C のみ）

---

## 各ロールの責務

### Naoya（PM・テスター）

#### 責務
- **要件決定**: ユーザーの声 → 何をやるのか を決定
- **優先度付け**: タスク間の優先順位を決定
- **意思決定**: 複数案の中から選択
- **テスト**: PR を確認、バグがないか検証
- **マージ判定**: PR を merge するか revert するか決定

#### 実行方法
1. バグ・軽微変更を見つけたら **即座に GitHub Issue 作成**
2. アイデアを思いついたら **Obsidian に記入** → Claude に相談
3. 要件が確定したら **Google Sheets の要件確定シート に記入**
4. PR が上がったら **GitHub Projects で In Progress → Done へ**

#### ツール
- Obsidian（思考）
- GitHub Issues（軽微タスク）
- Google Sheets（要件確定シート）
- GitHub Projects（進捗管理）

---

### Claude（要件・仕様化・Issue 草稿作成）

#### 責務
- **要件整理**: Naoya のアイデア → 明確な要件に落とし込む
- **仕様化**: 要件 → システム仕様に変換（タイプ C は `docs/` に記載）
- **Issue 草稿作成**: 実装仕様・完了定義・チェックリストを含む Issue 本文を `.md` ファイルで出力
- **指示書作成**: タイプ C のみ `docs/cursor-instructions/` に作成
- **QA**: PR や仕様の矛盾がないか確認

#### 実行方法
1. Naoya から Obsidian リンクをもらう → 議論ログを保存
2. タイプ A・B: **Issue 本文草稿を `.md` ファイルで出力**（チャット本文への貼り付けは行わない）
3. タイプ C: `docs/requirements/`・`docs/specification/` を作成 → 必要なら `cursor-instructions/` を作成 → Issue 本文草稿を `.md` ファイルで出力
4. Naoya が草稿をコピペして GitHub Issue を作成するのを待つ

#### ツール
- Obsidian（参照のみ、GitHub リンク経由）
- Google Sheets（要件確定シート参照・タイプ C）
- GitHub（docs / Issues）
- GitHub Projects（進捗確認）

---

### Cursor（実装）

#### 責務
- **コード実装**: Issue 本文（およびタイプ C の場合は `docs/`）に基づいて実装
- **テスト**: 自分のコードが仕様通りか確認
- **PR 作成**: 変更内容をわかりやすく説明
- **Obsidian 記録**: Issue 本文の「Obsidian記録」セクションに従い、実装完了後にメモを保存

#### 実行方法
1. Naoya から GitHub Issue URL を渡される
2. Issue 本文に実装仕様・完了定義・チェックリストがすべて記載されていることを確認
3. タイプ C の場合は `docs/requirements/`・`docs/specification/`・`cursor-instructions/` を参照
4. 実装 → **PR を作成**（タイトル: `Fixes #XXXX`）
5. PR description にチェックリストの完了状況を記載
6. Issue 本文の「Obsidian記録」セクションに従い Obsidian にメモを保存

#### ツール
- GitHub Issues（タスク・仕様の正本）
- GitHub docs（タイプ C の要件・仕様・指示書参照）
- GitHub PR（コード提案）
- Obsidian（実装完了記録）

---

## GitHub Projects 運用

### Board 構成

```
Project: Development Pipeline
├── Column 1: Backlog
├── Column 2: Ready
├── Column 3: In Progress
├── Column 4: In Review
└── Column 5: Done
```

### Column 説明

| Column | 状態 | 誰が見る | 自動化 |
|--------|------|--------|--------|
| **Backlog** | 検討待ち・優先度未決定 | Naoya（優先度付け） | Issue 作成時に自動追加 |
| **Ready** | 要件確定済・Cursor 指示待ち | Claude・Cursor | "Ready for Cursor" ラベル付与時に移動 |
| **In Progress** | Cursor が実装中 | 全員 | PR オープン時に移動 |
| **In Review** | PR レビュー中 | Naoya・Claude | PR オープン時（Ready からの遷移） |
| **Done** | マージ完了 | 全員 | PR マージ時に自動移動 |

### 自動化ルール（GitHub Actions）

```yaml
# .github/workflows/auto-project-update.yml

# Issue 作成時 → Backlog へ
on:
  issues:
    types: [opened]
    action: add to project
    column: Backlog

# Label "Ready for Cursor" が付いた時 → Ready へ
on:
  issues:
    types: [labeled]
    if: label == "Ready for Cursor"
    action: move to column
    column: Ready

# PR オープン時 → In Progress へ
on:
  pull_request:
    types: [opened]
    action: move to column
    column: In Progress

# PR マージ時 → Done へ
on:
  pull_request:
    types: [closed, merged]
    action: move to column
    column: Done
```

### 週次レビュー（毎週月曜 10:00）

Naoya が確認:
1. Backlog に溜まっているタスク数（目標: < 20）
2. In Progress の進捗（停滞していないか）
3. Done の完了数（目標: > 5 / 週）

---

## GitHub Issues 運用

### Issue テンプレ

#### 1. bug.md（バグ報告）— タイプ A

```markdown
## 【Bug】<バグ概要>

### 症状
- どんな状況で起こったか
- 期待される動作
- 実際の動作

### 再現手順
1. 〇〇 タブを開く
2. △△ を選択
3. □□ をクリック

### 環境
- ブラウザ: Chrome 最新
- デバイス: MacBook / Windows / iPhone
- URL: https://...

### 優先度
- [ ] 緊急（使用不可）
- [ ] 高（利用に支障あり）
- [ ] 中（動作するが改善余地あり）
- [ ] 低（UI 改善など）

### 関連コード
- `js/XX-xxx.js` line YY
- `gas-script-v3.js` の callClaudeMsg()

### Obsidian記録
※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: /Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-<トピック>.md
※ YYYY-MM-DD は作業日、<トピック> は内容を表す英数字

内容:
---
# <タイトル>
## 実装内容
-
## 変更ファイル
-
## 関連Issue
- #XXXX
---

### チェックリスト
- [ ] 実装完了
- [ ] 既存機能の動作確認
- [ ] PR に Fixes #XXXX を記載
- [ ] Obsidian メモを保存
```

#### 2. chore.md（軽微変更・リファクタリング）— タイプ A

```markdown
## 【Chore】<変更内容>

### 目的
- なぜこの変更をするのか

### 変更内容
- 〇〇 を 〇〇 に変更
- △△ をリファクタリング
- □□ の性能改善

### 影響範囲
- `js/XX-xxx.js`
- `gas-script-v3.js`

### テスト方法
- 〇〇タブで正常動作確認

### Obsidian記録
※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: /Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-<トピック>.md
※ YYYY-MM-DD は作業日、<トピック> は内容を表す英数字

内容:
---
# <タイトル>
## 実装内容
-
## 変更ファイル
-
## 関連Issue
- #XXXX
---

### チェックリスト
- [ ] 実装完了
- [ ] 既存機能の動作確認
- [ ] PR に Fixes #XXXX を記載
- [ ] Obsidian メモを保存
```

#### 3. feature.md（新機能・要件ありの変更）— タイプ B / C

**タイプ B**: 実装仕様・完了定義は Issue 本文にすべて記載する（`cursor-instructions/` は作成しない）。

**タイプ C**: 関連ドキュメントへのリンクを Issue 本文に記載する。

```markdown
## 【Feature】<機能概要>

### 背景
- ユーザーの声
- なぜこの機能が必要か

### 要件確定シート ID（タイプ C のみ）
- REQ-XXX

### 関連ドキュメント（タイプ C のみ）
- `docs/requirements/...`
- `docs/specification/...`
- `docs/cursor-instructions/cursor_instruction_XXX.md`（タイプ C のみ）

### 実装範囲
- 〇〇機能を追加
- △△ のロジックを変更
- □□ の UI を改善

### 完了定義
- [ ] 要件 A を実装
- [ ] 要件 B を実装
- [ ] テスト完了
- [ ] ドキュメント更新（タイプ C）

### Obsidian記録
※ 実装完了後、Cursor が以下を Obsidian に保存すること

パス: /Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-<トピック>.md
※ YYYY-MM-DD は作業日、<トピック> は内容を表す英数字

内容:
---
# <タイトル>
## 実装内容
-
## 変更ファイル
-
## 関連Issue
- #XXXX
---

### チェックリスト
- [ ] 実装完了
- [ ] 既存機能の動作確認
- [ ] PR に Fixes #XXXX を記載
- [ ] Obsidian メモを保存
- [ ] （タイプ B のみ）影響を受ける既存ドキュメント（docs/）に変更がある場合は更新
```

### Issue 草稿の出力形式（Claude）

Claude は Issue 草稿を **必ず `.md` ファイルとして出力** する。チャット本文への貼り付けは行わない。

Naoya は出力された `.md` ファイルの内容をコピペして GitHub Issue を作成する。

### ラベル体系

```
Type: bug / chore / feature / docs / refactor
Priority: critical / high / medium / low
Status: backlog / ready-for-cursor / in-progress / in-review / done
Area: logic-training / thinking-training / gas / docs / other
```

### Issue 命名規則

```
【Tag】<概要>

タグ一覧:
- 【Bug】
- 【Chore】
- 【Feature】
- 【Docs】
- 【Refactor】

例:
- 【Bug】穴埋めタブで解答判定が動作しない
- 【Chore】gas-script-v3.js をモジュール化
- 【Feature】思考トレーニング タブ実装（REQ-001）
```

---

## Cursor への指示方法

### 標準テンプレ（タイプ A・B・C 共通）

Naoya が Cursor に渡すプロンプト:

```
以下の GitHub Issue を実装してください：

🔗 Issue URL: https://github.com/nkhippo/thinkgrindai/issues/XXXX

Issue 本文に実装仕様・完了定義・チェックリストがすべて記載されています。
実装完了後は以下を行ってください：

1. PR 作成（タイトル：Fixes #XXXX）
2. Obsidian メモの更新（Issue 本文内の「Obsidian記録」セクションを参照）
3. PR にチェックリストの完了状況を記載
```

### タイプ C の追加参照

タイプ C の Issue には `docs/` へのリンクが含まれる。Cursor は Issue 本文に加え、必要に応じて以下を読む:

- `docs/requirements/...`
- `docs/specification/...`
- `docs/cursor-instructions/cursor_instruction_XXX.md`（タイプ C のみ存在）

### Claude への指示（Issue 草稿作成）

```
以下の背景に基づいて GitHub Issue 本文の草稿を作成してください:

背景:
- Naoya からのリクエスト: 〇〇
- 検討内容: △△
- 決定事項: □□

**出力形式**: `.md` ファイルとして出力（チャット本文への貼り付けは行わない）

**記載内容**（タイプ A・B）:
1. 背景・目的
2. 実装範囲・変更内容
3. 完了定義
4. Obsidian記録 セクション
5. チェックリスト

**タイプ C の追加**:
- `docs/requirements/`・`docs/specification/` を先に作成
- 必要なら `docs/cursor-instructions/` を作成
- Issue 本文に上記 docs へのリンクを記載
```

---

## コードレビュー・マージ基準

### PR チェックリスト

PR を merge する前に、以下を確認します：

```markdown
## Code Review Checklist

### 実装
- [ ] Issue の要件をすべて実装している
- [ ] 仕様書通りに実装されている
- [ ] 既存機能を破壊していない
- [ ] パフォーマンス低下がない

### テスト
- [ ] 自分で手動テストを実施した
- [ ] 関連する既存テストが全て PASS している
- [ ] エッジケースをテストしている

### コード品質
- [ ] コードが読みやすい（変数名、コメント）
- [ ] 重複コードを削除している
- [ ] console.log デバッグ出力が残っていない
- [ ] エラーハンドリングが実装されている

### ドキュメント
- [ ] タイプ C: requirements / specification / cursor-instructions を更新している
- [ ] タイプ B: 影響を受ける既存 docs/ を更新している（該当する場合）
- [ ] GAS スキーマ変更があれば gas-column-headers.md を更新
- [ ] Obsidian メモを保存した（Issue 本文の「Obsidian記録」セクション参照）

### 備考
- 既知の問題: XXX
- 今後の改善案: XXX
```

### マージ基準

**以下すべてを満たす場合のみ merge**:

1. ✅ Issue（またはタスク）の要件をすべて実装
2. ✅ 自動テスト・手動テストで問題なし
3. ✅ コードレビュー（Naoya or Claude）で OK
4. ✅ ドキュメント更新が完了
5. ✅ PR description が明確に記載

**merge 不可の場合**:
- 要件が未実装
- テストでバグが見つかった
- 既存機能を破壊している
- ドキュメント未更新

---

## ドキュメント管理

### ドキュメント体系

```
docs/
├── PROJECT_CONTEXT.md              ← 背景・ビジョン
├── DEVELOPMENT_POLICY.md           ← このファイル
├── requirements-logic.md           ← Logic Training 要件定義
├── requirements-thinking.md        ← Thinking Training 要件定義
├── specification-logic.md          ← Logic Training 仕様書
├── specification-thinking.md       ← Thinking Training 仕様書
├── dev-flow.md                     ← 開発フロー（実装詳細）
├── gas-column-headers.md           ← GAS スキーマドキュメント
│
├── cursor-instructions/          ← タイプ C のみ（タイプ A・B では作成しない）
│   └── cursor_instruction_XXX.md （大規模案件の実装単位ごと）
│
└── guides/
    ├── overview.md
    ├── fill.md
    └── ... (タブごと)
```

### ドキュメント更新ルール

| ドキュメント | 更新者 | 更新タイミング | 例 |
|------------|--------|-------------|-----|
| PROJECT_CONTEXT | Naoya | Phase 変更時 | Phase 1 完了 → Phase 2 開始 |
| DEVELOPMENT_POLICY | Naoya | ルール変更時 | Issue 命名規則を変更した |
| requirements-XX | Claude | 要件確定時 | 新機能の要件が確定した |
| specification-XX | Claude | 仕様決定時 | 技術実装方針を決定した |
| cursor-instructions-XX | Claude | タイプ C・指示書作成時 | 大規模案件の実装準備ができた |
| gas-column-headers | Cursor or Claude | GAS スキーマ変更時 | 新しいシート列を追加した |
| guides-XX | Claude or Naoya | コンテンツ変更時 | タブの説明を更新した |

### ドキュメント バージョン管理

各 docs ファイルの先頭に以下を記載:

```markdown
# ファイル名

**最終更新**: 2025-01-24  
**バージョン**: X.Y  
**更新者**: Claude / Naoya / Cursor

---
```

**バージョン規則**:
- **X**: 大幅な仕様変更（X + 1）
- **Y**: 軽微な追加・修正（Y + 1）

---

## 緊急対応

### 緊急度レベル

| レベル | 対応時間 | 例 |
|--------|---------|-----|
| **Critical（緊急）** | 即座（1時間以内） | ユーザーが使用不可、セキュリティ問題 |
| **High（高）** | 当日 | 機能が部分的に動作しない |
| **Medium（中）** | 1～2日 | 動作するが改善余地あり |
| **Low（低）** | 1週間以内 | UI 改善、ドキュメント更新など |

### 緊急対応フロー

```
Naoya: Critical Issue を GitHub で作成（【🚨Critical】と記入）
  ↓
自動通知が Claude・Cursor に送信
  ↓
Cursor: 即座に実装開始
  ↓
テスト・PR 作成（レビュー簡略化）
  ↓
Naoya: 即座に merge
```

---

## 品質基準

### コード品質

- **可読性**: 他の人が読んで 5 分で理解できる
- **テスト**: 新機能には テストコードが含まれる
- **パフォーマンス**: 1 秒以上の遅延がない
- **エラー処理**: ユーザーに分かりやすいエラーメッセージ

### ドキュメント品質

- **正確性**: 実装と矛盾がない
- **完全性**: 全ての機能をカバーしている
- **更新性**: 最新の状態を反映している
- **可読性**: 新しい人でも理解できる

### テスト品質

- **カバレッジ**: 重要な機能は全てテスト
- **自動化**: 手動テストより自動化テスト優先
- **ドキュメント**: テスト方法を明記

### リリース品質

- **バグ 0**: 既知の問題はない（TODO リストはあっても OK）
- **性能**: 1 秒以内にレスポンス
- **セキュリティ**: API キー等が公開されていない
- **ドキュメント完備**: 要件書～ガイドが揃っている

---

## FAQ

### Q: Issue と PR の関係は？
A: 1 Issue = 1 つの作業単位 / 1 PR = 1 つのコード提案。通常、1 Issue に対して 1 PR ですが、大きな Issue は複数 PR に分割する場合もあります。

### Q: PR をレビューしてほしいときは？
A: PR description に `@claude` または `@naoya` とコメントしてください。自動的に通知が送信されます。（要設定）

### Q: アイデアが出たらまず何をすればいい？
A: **Obsidian に記入**してください。Naoya が確認して、Claude に相談するかどうか判断します。

### Q: 仕様書なしで実装してもいい？
A: **タイプ A・B** は Issue 本文に実装仕様がすべて記載されているため、Issue 本文を正本として実装する。**タイプ C** は `docs/requirements/`・`docs/specification/`（および必要なら `cursor-instructions/`）を必ず確認してから実装する。

### Q: ドキュメント更新を忘れた場合は？
A: PR 時に「ドキュメント未更新」として指摘します。修正してから merge します。

---

## 関連リンク

- 🔗 [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - ビジョン・背景
- 🔗 [GitHub Projects](https://github.com/nkhippo/thinkgrindai/projects) - タスク管理
- 🔗 [GitHub Discussions](https://github.com/nkhippo/thinkgrindai/discussions) - 大型議論
- 🔗 [Google Sheets - 要件確定シート](https://docs.google.com/spreadsheets/d/...) - 意思決定ログ

---

**このドキュメントは定期的にレビューされます。ご質問・ご提案があれば GitHub Discussions でお知らせください。**
