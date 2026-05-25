# CLAUDE.md — thinkgrindai プロジェクト共通ルール

このファイルは Claude・Cursor の両者が参照するプロジェクトの共通ルールです。
新しいチャット・セッションを始めるたびに、まずこのファイルを確認してください。

---

## プロジェクト概要

- **名称**: thinkgrindai
- **内容**: 論理・思考トレーニング Web アプリ
- **リポジトリ**: https://github.com/nkhippo/thinkgrindai
- **現バージョン**: Logic Training Ver.3.2

## 開発体制

| 役割 | 担当 | 主な作業 |
|------|------|---------|
| PM・テスター | Naoya | 要件決定・テスト・Merge 判断 |
| 要件・仕様・指示書 | Claude | アイデア整理・要件定義書・仕様書・Cursor 指示書作成 |
| ソースコード実装 | Cursor | Issue を読んで実装・PR 作成 |

## 技術スタック

- **フロントエンド**: Vanilla JS / HTML5 / CSS3（GitHub Pages）
- **バックエンド**: Google Apps Script + Google Sheets
- **AI モデル**: claude-sonnet-4-6（generation: temp=0.9 / scoring: temp=0.3）
- **ソース管理**: GitHub

## ファイル構成

```
thinkgrindai/
├── CLAUDE.md                        ← このファイル（共通ルール）
├── index.html
├── style.css
├── app.js
├── gas-script-v3.js
├── js/
│   ├── 01-fill.js                   ← 穴埋めタブ
│   ├── 02-summary.js                ← 要約タブ
│   ├── 03-critique.js               ← 批判読みタブ
│   ├── 04-ame.js                    ← 空雨傘タブ
│   └── 17-thinking.js               ← 思考トレーニング
├── docs/
│   ├── PROJECT_CONTEXT.md           ← GitHub docs/ に配置済み
│   ├── DEVELOPMENT_POLICY.md        ← GitHub docs/ に配置済み
│   ├── PROJECTS_KNOWLEDGE_UPDATE_GUIDE.md
│   ├── setup/                       ← セットアップガイド一式
│   ├── README.md                    ← ドキュメント索引
│   ├── requirements-*.md
│   ├── specification-*.md
│   └── cursor-instructions/
│       └── cursor_instruction_*.md
├── guide/
└── .cursor/rules/dev-flow.mdc       ← Cursor 専用ルール
```

---

## 開発フロー（全6フェーズ）

```
Phase 1: アイデア出し
  Naoya が Obsidian に ideas/REQ-XXX-<名前>.md を作成

Phase 2: 要件確定
  Claude と議論 → 確定 → Google Sheets「要件確定シート」に記入

Phase 3: 仕様書作成（Claude が担当）
  docs/requirements-XX.md
  docs/specification-XX.md
  docs/cursor-instructions/cursor_instruction_XX.md
  → GitHub に commit・push
  → Sheets の URL 列を更新（ステータス: 指示書作成済）

Phase 4: GitHub Issue 作成
  テンプレ feature.md で Issue 作成
  Label: feature / ready-for-cursor / <priority>
  Body に全ドキュメントの URL を記載

Phase 5: 実装（Cursor が担当）
  指示書を読んで実装 → PR 作成（Fixes #T0XX）

Phase 6: 完了処理
  Naoya がテスト → Merge
  → Sheets: ステータス = 完了、実完了日記入
  → Obsidian: 完了ログ追記
```

---

## Claude への指示

### 毎回の返答末尾に付けること

要件整理・議論・仕様作成を行った返答の末尾には、必ず以下のブロックを追加してください：

```
---
✅ この会話での確定事項
・（箇条書きで確定した内容）

📋 次のアクション（Naoya さんがやること）
1. 【ツール名】具体的な作業内容
2. 【ツール名】次の作業
   → 完了したら Claude に「〇〇が終わりました」と伝えてください

🔧 Claude が次に用意するもの（あれば）
・（次の会話で Claude が作成するもの）

📖 Wiki 修正チェックリスト（Cursor へ指示してください）
（以下、修正が必要な場合のみ記入）

修正対象: .github/wiki/<ページ名>.md
修正内容:
- セクション名: ～を追加/修正
- 追加する内容:
  ```
  〇〇について〇〇と記載
  ```
- 修正の理由: 今回確定した仕様が更新されたため

実装後、Cursor に「以下の Wiki 修正チェックリストに従ってください」とチェックリストごと貼り付けて指示してください（Cursor は `.cursor/rules/wiki-modification.mdc` に従って自動修正・push します）

---
```

Wiki の更新が不要な場合（議論・相談のみ）は、次のいずれかとする：

- `📖 Wiki 修正チェックリスト` に「修正なし（議論段階のため）」と記入する
- または当該セクションを省略する

### 仕様変更を伴う確定事項があった場合の追加チェック

要件定義書・仕様書の内容に変更が生じる確定事項があった場合、
返答末尾の「📖 Wiki 修正チェックリスト」に加えて以下も確認すること：

```
📋 索引更新チェック
- [ ] docs/_index.md のドキュメント一覧に変更はあるか？
      （新規ドキュメント追加・削除・行数の大幅変化）
- [ ] docs/_index.md のセクション索引に変更はあるか？
      （セクションの追加・削除・内容の大幅変化）
→ 変更がある場合は「📖 Wiki 修正チェックリスト」に
  docs/_index.md の更新内容も含めること
```

### 新しいチャットを始めるとき

チャットの最初に Naoya から以下のような情報をもらったら、フローのどのフェーズにいるかを判断して進めてください：

- 「新しいアイデアがある」→ Phase 1 からガイド
- 「要件を詰めたい」→ Phase 2 から議論開始
- 「要件定義書を作って」→ Phase 3 の作業を開始
- 「Issue の文面を作って」→ Phase 4 のサポート
- 「PR のテストをしたい」→ Phase 5-6 のサポート

### 要件定義書・仕様書・指示書を作るときの形式

必ず以下のファイルを**この順番で**作成してください：

1. `docs/requirements-<name>.md`（要件定義書）
2. `docs/specification-<name>.md`（仕様書）
3. `docs/cursor-instructions/cursor_instruction_<name>.md`（Cursor 指示書）

作成後に Naoya に伝えること：
```
3 つのファイルを作成しました。以下を実施してください：
1. 【GitHub】上記ファイルを commit・push
2. 【Google Sheets】REQ-XXX 行の G/H/I 列に URL を記入、ステータスを「指示書作成済」に変更
3. 【GitHub】Issue を作成（テンプレ: feature.md、全ドキュメント URL を Body に記載）
```

---

## Cursor への指示

詳細は `.cursor/rules/dev-flow.mdc` を参照してください。

基本ルール：
- 実装前に必ず `docs/cursor-instructions/cursor_instruction_XX.md` を熟読する
- 既存の js ファイルへの変更は最小限（新機能は新規ファイルで実装）
- PR 作成後、必ず Naoya へのネクストアクションを提案する
