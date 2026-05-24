# Development Flow — 新機能実装フロー

新しいアイデア・機能を実装したい時の全フローです。

## 概要

```
Naoya がアイデアを思いつく
    ↓
Claude と議論して要件確定
    ↓
Claude が要件定義書・仕様書・指示書を作成
    ↓
GitHub Issue 作成
    ↓
Cursor が実装・PR 作成
    ↓
Naoya がテスト・Merge
    ↓
完了
```

---

## Step 1: アイデアを Claude に相談（1-2日）

### 1-1. Obsidian にアイデアを記入（Naoya）

```
Obsidian で新規ファイル作成:
vault/ideas/REQ-XXX-<機能名>.md

内容:
- なぜこの機能が必要か
- 実装の複数案
- 初期の考え
```

### 1-2. Claude.ai Projects で新チャットを立てる（Naoya）

1. Claude.ai にアクセス
2. 左の「Projects」から「Think Grind Ai」を選択
3. 「新しいチャット」をクリック
4. メッセージ: 「新しいアイデアがあります。REQ-XXX です。〇〇について相談したいです。」

### 1-3. Claude と議論（Claude が自動ガイド）

- Claude が Phase 1 のガイドを自動で提示
- 複数案を比較
- 実装方針を決定
- Obsidian に議論ログを記入

---

## Step 2: 要件確定（Naoya + Claude）

### 2-1. Obsidian に最終確定事項をまとめる（Naoya）

```
vault/discussions/summary-REQ-XXX.md に:
- 最終決定事項
- トピック
- レベル設定
- 採点方法
など
```

### 2-2. Google Sheets に記入（Naoya）

```
要件確定シート に REQ-XXX 行を追加:
- ID: REQ-XXX
- 案件名: 〇〇
- ステータス: 確定
- Obsidian リンク: obsidian://vault/...
など
```

---

## Step 3: 仕様書作成（Claude）

Claude が以下を作成：

```
docs/requirements-XX.md       ← 要件定義書
docs/specification-XX.md      ← 仕様書
docs/cursor-instructions/cursor_instruction_XX.md ← Cursor 指示書
```

作成後：

1. GitHub に commit・push
2. Google Sheets の G・H・I 列に URL を記入
3. ステータスを「指示書作成済」に変更

---

## Step 4: GitHub Issue 作成（Naoya）

1. GitHub Issues → New issue
2. テンプレ「Feature」を選択
3. Body に以下をリンク:
   - 要件定義書 URL
   - 仕様書 URL
   - Cursor 指示書 URL
4. Label 付与: feature / ready-for-cursor / <優先度>

---

## Step 5: Cursor が実装（Cursor）

1. GitHub Issue を確認
2. Cursor 指示書を熟読
3. 実装開始
4. PR 作成（Fixes #T0XX）

詳細は [Cursor ルール](../.cursor/rules/dev-flow.mdc) を参照

---

## Step 6: テスト・Merge（Naoya）

1. PR をテスト
2. 問題なければ Merge
3. GitHub Projects: Done へ自動移動

---

## Step 7: 完了処理（Naoya）

### 7-1. Google Sheets 更新

```
要件確定シート REQ-XXX 行:
- ステータス: 完了
- 実完了日: 記入
- アーカイブシート へ移行
```

### 7-2. Obsidian に完了ログ記入

```
vault/completed-decisions/REQ-XXX-<機能名>.md を作成

内容:
- 実装内容
- テスト結果
- 継続改善項目
```

---

## ツール一覧

| ツール | 役割 | 詳細 |
|--------|------|------|
| Obsidian | 思考・議論ログ | ideas/ / discussions/ |
| Claude.ai Projects | フロー自動ガイド | Think Grind Ai プロジェクト |
| Google Sheets | タスク管理 | 要件確定シート |
| GitHub | ソース管理 | Issues / Projects / Docs |
| Cursor | 実装 | ソースコード |

詳細は [Getting Started](Getting-Started) を参照

---

## 所要時間目安

- 検討・要件確定: 2-3 日
- 指示書作成: 1 日
- 実装: 1-5 日
- テスト・Merge: 1 日

**合計: 5-10 日**

---

## よくある質問

**Q: 要件定義書と仕様書の違いは？**  
A: 要件定義書は「何をするか」、仕様書は「どうやるか」です。詳細は [Specifications](Specifications) を参照

**Q: 途中で要件が変わったら？**  
A: Obsidian に議論ログを追記して、Google Sheets の「備考」に変更内容を記入してください

**Q: 実装中にバグを見つけたら？**  
A: PR コメントに記録し、別 Issue を作成することを推奨します
