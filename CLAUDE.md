# CLAUDE.md — thinkgrindai プロジェクト共通ルール

このファイルは Claude・Cursor の両者が参照するプロジェクトの共通ルールです。
新しいチャット・セッションを始めるたびに、まずこのファイルを確認してください。

---

## 重要：ドキュメント編集時の基準ファイル

このプロジェクトでドキュメント（特に要件定義書・仕様書）を編集する際は、
以下のファイルを **必ず** 先に読むこと。

| ファイル | 役割 |
|---|---|
| `docs/TERMS.md` | プロジェクト内の用語定義（「要件定義書とは何か」など） |
| `docs/DOCUMENT_GUIDELINES.md` | ドキュメント記載粒度のガイドライン |

Claudeが Cursor向けの指示書を作成する際、ドキュメント編集を含む場合は、
指示書冒頭でこれらのファイルへのリンクを必ず提示すること。

Naoyaが曖昧な用語（例：「ドキュメントを修正して」「難しさを変えて」など）を使った場合、
Claudeは `docs/TERMS.md` を参照して具体的にどのファイル・どの概念を指すか確認すること。

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
| 要件・仕様・Issue草稿 | Claude | アイデア整理・要件定義書・仕様書（タイプC）・Issue本文草稿（.md）作成 |
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
│   ├── TERMS.md                         ← プロジェクト用語定義（最優先で読む）
│   ├── DOCUMENT_GUIDELINES.md           ← ドキュメント記載粒度ガイドライン（最優先で読む）
│   ├── PROJECT_CONTEXT.md               ← ビジョン・ロードマップ
│   ├── DEVELOPMENT_POLICY.md            ← 開発フロー・タスク分類
│   ├── DESIGN_DECISION_HISTORY.md       ← 設計判断の経緯メモ
│   ├── _index.md                        ← ドキュメント索引
│   ├── architecture.md                  ← フロントエンド構成
│   ├── gas-column-headers.md            ← GAS スキーマ
│   ├── dev-flow.md                      ← 開発フロー詳細
│   ├── requirements/
│   │   ├── common.md
│   │   ├── logic/（overview・fill・summary・critique・ame）
│   │   └── thinking/（overview・scoring）
│   ├── specification/
│   │   ├── common.md
│   │   ├── logic/（common・fill・summary・critique・ame）
│   │   └── thinking/（overview・steps・api・data）
│   ├── cursor-instructions/             ← Cursor向け作業指示書（タイプCのみ）
│   └── setup/                           ← セットアップガイド
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

Phase 3: 仕様・Issue 草稿（Claude が担当）
  タイプ A・B: Issue 本文草稿を .md ファイルで出力
  タイプ C: docs/requirements/ + docs/specification/ + cursor-instructions/ を作成
            → Issue 本文草稿も .md ファイルで出力
  → タイプ C は GitHub に docs を commit・push

Phase 4: GitHub Issue 作成（Naoya が担当）
  Claude 出力の .md をコピペして Issue 作成
  Label: feature / ready-for-cursor / <priority>
  タイプ C: Body に docs/ の URL を記載

Phase 5: 実装（Cursor が担当）
  Naoya が Issue URL を Cursor に渡す
  → Issue 本文（+ タイプ C は docs/）を読んで実装 → PR 作成（Fixes #XXXX）

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

### Issue 草稿・仕様書を作るときの形式

#### タイプ A・B（中規模以下）

Claude は **Issue 本文草稿を `.md` ファイルとして出力`** する（チャット本文への貼り付けは行わない）。

草稿に必ず含めるセクション:
- 背景・実装範囲・完了定義
- **Obsidian記録**（実装完了後に Cursor が保存するパス・テンプレ）
- **チェックリスト**（実装完了・動作確認・PR・Obsidian 保存）

作成後に Naoya に伝えること：
```
Issue 草稿（.md）を作成しました。以下を実施してください：
1. 【GitHub】草稿をコピペして Issue を作成
2. 【Cursor】Issue URL を渡して実装依頼
```

#### タイプ C（大規模・新機能）

以下を**この順番で**作成してください：

1. `docs/requirements/...`（要件定義書）
2. `docs/specification/...`（仕様書）
3. `docs/cursor-instructions/cursor_instruction_<name>.md`（Cursor 指示書・タイプ C のみ）
4. Issue 本文草稿（`.md` ファイル）

作成後に Naoya に伝えること：
```
docs/ と Issue 草稿を作成しました。以下を実施してください：
1. 【GitHub】docs/ を commit・push
2. 【Google Sheets】REQ-XXX 行の G/H/I 列に URL を記入、ステータスを「指示書作成済」に変更
3. 【GitHub】Issue 草稿をコピペして Issue を作成（docs/ の URL を Body に記載）
4. 【Cursor】Issue URL を渡して実装依頼
```

#### タイプ B / C の判断

- **タイプ B**: 1 PR・影響ファイル 3 つ以下・仕様が Issue 内で完結
- **タイプ C**: 複数 PR・影響ファイル 4 つ以上または複数タブ・将来参照される仕様
- グレーゾーンは Claude が B 寄り / C 寄りを提示し、Naoya が最終判断

---

## Cursor への指示

詳細は `.cursor/rules/dev-flow.mdc` を参照してください。

基本ルール：
- 実装前に GitHub Issue 本文を熟読する（仕様の正本）
- タイプ C のみ `docs/cursor-instructions/cursor_instruction_XX.md` および requirements/specification を参照
- タイプ A・B では `cursor-instructions/` は作成・参照しない
- 既存の js ファイルへの変更は最小限（新機能は新規ファイルで実装）
- PR 作成後、Issue 本文の Obsidian記録セクションに従いメモを保存する
- PR 作成後、必ず Naoya へのネクストアクションを提案する
