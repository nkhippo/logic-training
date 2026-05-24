# Development Policy: thinkgrindai

**最終更新**: 2025-01-24  
**バージョン**: 1.0

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
│ 要件確定シート に記入 → Claude が Cursor 指示書作成         │
│ ツール: Google Sheets + GitHub Docs                        │
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

### タイプ A: 軽微タスク（1日10～20件）

**特徴**:
- バグ修正
- 軽微な仕様変更（検討から確定まで < 30分）
- ドキュメント更新
- リファクタリング

**フロー**:
```
Naoya: Issue 作成
  ↓
GitHub Projects 自動: Backlog へ追加
  ↓
Naoya: "Ready for Cursor" ラベル追加
  ↓
Cursor: Issue URL を貼ったプロンプトで実装
  ↓
PR 作成 → Naoya テスト → Merge → Done
```

**処理時間目安**: 15分～1時間  
**GitHub Issue テンプレ**: bug.md / chore.md

---

### タイプ B: 中規模案件（検討 2～3 日）

**特徴**:
- 新機能（要件整理が必要）
- 仕様変更（影響範囲が広い）
- 大型リファクタリング

**フロー**:
```
Naoya: Obsidian に idea を書く
  ↓
Claude: Naoya と議論（会話ログは Obsidian に保存）
  ↓
Naoya: 要件確定シート に記入（ID: REQ-XXX）
  ↓
Claude: Cursor 指示書を作成 → GitHub docs に push
  ↓
GitHub Issue 作成（関連ファイルをリンク）
  ↓
Cursor: 指示書を読んで実装
  ↓
PR 作成 → Naoya テスト → Merge → Done
```

**処理時間目安**: 2～3 日（検討） + 1～3 日（実装）  
**GitHub Issue テンプレ**: feature.md

---

### タイプ C: 大規模案件（Phase 立ち上げ）

**特徴**:
- 新サービス・新タブの実装
- 大幅な仕様変更
- 技術スタック変更

**フロー**:
```
Naoya: Project Vision をまとめる
  ↓
Claude: 要件定義書（requirements-XX.md）を作成
  ↓
Naoya: 仕様決定（requirements → specification）
  ↓
Claude: 仕様書（specification-XX.md）を確定
  ↓
Cursor: マイルストーン単位で実装指示書を複数作成
  ↓
複数の Issue + PR に分割して進行
```

**処理時間目安**: 1 週間～数週間  
**ドキュメント**: requirements-XX.md, specification-XX.md

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

### Claude（要件・仕様化・指示書作成）

#### 責務
- **要件整理**: Naoya のアイデア → 明確な要件に落とし込む
- **仕様化**: 要件 → システム仕様に変換
- **指示書作成**: 仕様 → Cursor への実装指示書を生成
- **QA**: PR や仕様の矛盾がないか確認

#### 実行方法
1. Naoya から Obsidian リンクをもらう → 議論ログを保存
2. 要件が確定したら **要件確定シート に記入を確認**
3. 指示書を作成 → **GitHub docs に push**（`cursor-instructions/` フォルダ）
4. 指示書の内容を確認後 → **GitHub Issue の description に貼る**

#### ツール
- Obsidian（参照のみ、GitHub リンク経由）
- Google Sheets（要件確定シート参照）
- GitHub（docs / Issues 作成）
- GitHub Projects（進捗確認）

---

### Cursor（実装）

#### 責務
- **コード実装**: 指示書に基づいて実装
- **テスト**: 自分のコードが仕様通りか確認
- **PR 作成**: 変更内容をわかりやすく説明

#### 実行方法
1. GitHub Issue URL を Claude に渡される
2. Issue の description から指示書 URL を確認
3. 指示書を読んで実装 → **PR を作成**
4. PR description に以下を記入
   - 実装内容（何をやったか）
   - テスト方法（どうテストしたか）
   - 関連 Issue（#XXX）

#### ツール
- GitHub Issues（タスク確認）
- GitHub docs（指示書参照）
- GitHub PR（コード提案）

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

#### 1. bug.md（バグ報告）

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
```

#### 2. chore.md（軽微変更・リファクタリング）

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
```

#### 3. feature.md（新機能・要件ありの変更）

```markdown
## 【Feature】<機能概要>

### 背景
- ユーザーの声
- なぜこの機能が必要か

### 要件確定シート ID
- REQ-XXX

### 関連ドキュメント
- `docs/requirements-XX.md`
- `docs/specification-XX.md`
- `docs/cursor-instructions/cursor_instruction_REQ-XXX.md`

### 実装範囲
- 〇〇機能を追加
- △△ のロジックを変更
- □□ の UI を改善

### 完了定義
- [ ] 要件 A を実装
- [ ] 要件 B を実装
- [ ] テスト完了
- [ ] ドキュメント更新
```

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

### パターン 1: 軽微タスク（Issue リンク）

```
以下の GitHub Issue を実装してください:

🔗 Issue URL: https://github.com/nkhippo/thinkgrindai/issues/T042
タイトル: 【Bug】穴埋めタブで解答判定が動作しない
優先度: 高

Issue の description に詳細があります。
テスト方法も記載されています。

完了後は PR を作成し、関連 Issue（#T042）をリンクしてください。
```

### パターン 2: 中規模案件（指示書フル）

```
以下の要件に基づいて実装してください:

📋 要件確定シート: REQ-XXX
🔗 要件定義: https://github.com/nkhippo/thinkgrindai/blob/main/docs/requirements-XX.md
🔗 仕様書: https://github.com/nkhippo/thinkgrindai/blob/main/docs/specification-XX.md
🔗 Cursor 指示書: https://github.com/nkhippo/thinkgrindai/blob/main/docs/cursor-instructions/cursor_instruction_REQ-XXX.md

🎯 実装範囲:
- 〇〇 を実装する
- △△ の ロジックを修正する
- □□ のテストを追加する

✅ 完了定義:
- [ ] 要件 A を実装
- [ ] 要件 B を実装
- [ ] 既存テストが全て PASS する
- [ ] 新規テストが追加されている

🔗 関連 Issue: #T0XX

PR 作成時に以下を記入してください:
- 実装内容（何をやったか）
- テスト方法（どうテストしたか）
- 既知の問題・TODO（あれば）
```

### パターン 3: 指示書作成（Claude へ）

```
以下の背景に基づいて Cursor への指示書を作成してください:

📋 要件確定シート: REQ-XXX
🔗 要件定義: https://...
🔗 仕様書: https://...

背景:
- Naoya からのリクエスト: 〇〇 ができるようにしたい
- 検討内容: 〇〇 が必要
- 決定事項: △△ を採用する

上記を踏まえて、以下の指示書を作成してください:

**ファイル名**: `docs/cursor-instructions/cursor_instruction_REQ-XXX.md`

**記載内容**:
1. 背景・目的
2. 実装範囲
3. ファイル一覧（修正対象）
4. ロジック変更
5. テスト方法
6. 既知制約・TODO

参考: `docs/cursor-instructions/cursor_instruction_thinking_v2.md` など既存の指示書と同じ形式で作成してください。
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
- [ ] 新機能は docs/cursor-instructions/ に記載されている
- [ ] GAS スキーマ変更があれば gas-column-headers.md を更新
- [ ] requirements / specification を更新している

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
├── cursor-instructions/
│   ├── cursor_instruction_thinking_v2.md
│   └── cursor_instruction_REQ-XXX.md （新機能ごと）
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
| cursor-instructions-XX | Claude | 指示書作成時 | 実装準備ができた |
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
A: **いいえ**。軽微なバグ修正以外は、必ず仕様書や指示書を確認してから実装してください。

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
