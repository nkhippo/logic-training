# thinkgrindai ドキュメント索引

**最終更新**: 2026-05-26（Phase 1-4 Railway 仕様書・Cursor指示書追加）  
**対応バージョン**: Ver.3.3

> このファイルは Claude と Cursor が「何がどこに書いてあるか」を把握するための索引です。  
> ドキュメント追加・変更のたびに必ず更新してください。

---

## ドキュメント構造の方針

```
docs/
├── TERMS.md                   ← ★まず読む：プロジェクト用語定義
├── DOCUMENT_GUIDELINES.md     ← ★まず読む：ドキュメント記載粒度ガイドライン
├── DESIGN_DECISION_HISTORY.md ← 設計判断の経緯メモ（没案・変更理由の記録）
│
├── requirements/          ← 「なぜ・何を」（ユーザー体験・設計の動機）
│   ├── common.md          ← 両サービス共通（目的・背景・AI方針・ペルソナ設計）
│   ├── logic/
│   │   ├── overview.md    ← 論理トレーニング全体（タブ構成・論理力定義・テーマプリセット）
│   │   ├── fill.md        ← 穴埋め
│   │   ├── summary.md     ← 要約
│   │   ├── critique.md    ← 批判読み
│   │   └── ame.md         ← 空雨傘
│   └── thinking/
│       ├── overview.md    ← 思考トレーニング全体（6タイプ・4レベル・設計思想）
│       └── scoring.md     ← 採点・振り返り設計（役割A〜D3・user_core）
│
├── specification/         ← 「どのように動くか」（設計詳細・状態遷移・API仕様）
│   ├── common.md          ← 両サービス共通（ファイル構成・API呼び出し・ヘッダー・GAS共通）
│   ├── logic/
│   │   ├── common.md      ← 論理トレーニング共通UI（テーマ選択・max_tokens・GASエンドポイント）
│   │   ├── fill.md        ← 穴埋め（状態遷移・プロンプト設計意図・GASカラム）
│   │   ├── summary.md     ← 要約
│   │   ├── critique.md    ← 批判読み
│   │   └── ame.md         ← 空雨傘
│   ├── backend/
│   │   └── specification_railway_phase1_4.md  ← Railway デプロイ・CI/CD・FE統合（Phase 1-4）
│   └── thinking/
│       ├── overview.md    ← 状態オブジェクト・問題オブジェクト・画面構成・定数一覧
│       ├── steps.md       ← レベル別ステップフロー・80点ルール・90点ルール・振り返りUI
│       ├── api.md         ← 全API呼び出し仕様（temperature・max_tokens・プロンプト設計意図）
│       └── data.md        ← user_coreフロー・GASカラム・persona_snapshot・残タスク
│
├── cursor-instructions/   ← Cursor向け作業指示書（タイプ C・大規模案件のみ）
│   ├── cursor_instruction_backend_phase1_3.md      ← BEサーバー Phase 1-3（Issue #40）
│   ├── cursor_instruction_phase1-3_backend_base.md
│   └── cursor_instruction_railway_phase1_4.md        ← Railway デプロイ Phase 1-4
├── setup/                 ← 環境構築ガイド
├── PROJECT_CONTEXT.md     ← ビジョン・ロードマップ
├── DEVELOPMENT_POLICY.md  ← 開発フロー・タスク分類・運用ルール
├── architecture.md        ← フロントエンド構成・ディレクトリ設計
├── gas-column-headers.md  ← GAS シートのカラム定義（コピペ用）
├── dev-flow.md            ← 開発フロー詳細
└── _index.md              ← このファイル
```

---

## 直近の変更

| 日付 | 内容 |
|---|---|
| 2026-05-26 | Phase 1-4：Railway デプロイ・CI/CD・FE統合の仕様書・Cursor指示書を追加 |
| 2026-05-26 | Phase 1-3：BEサーバー基盤実装完了、全テスト PASS、Google Sheets 連携動作確認 |
| 2026-05-25 | 整合性修正：requirements/common.md §4欠番・thinking/overview.md §3-3重複・crossref全体を修正 |
| 2026-05-25 | 粒度修正：各タブ要件定義書の難易度別パラメータを「学習体験」記述に統一、実装値は仕様書に集約 |
| 2026-05-25 | 開発フローを GitHub Issue ベースに移行（cursor-instructions はタイプ C のみ） |
| 2026-05-25 | 気配りタブ（kibari）完全削除（コード・ドキュメント両方から） |
| 2026-05-25 | 新規：TERMS.md（用語定義）・DOCUMENT_GUIDELINES.md（記載粒度ガイドライン）を追加 |
| 2026-05-25 | ドキュメント構造を全面再編（単一ファイル → requirements/ + specification/ の階層構造へ） |
| 2026-05-25 | 思考トレーニングの設計意図（Obsidianメモ・ヒアリング）を全ドキュメントに反映 |

---

## ドキュメント編集時に最初に読むファイル

> **Claude・Cursor 共通**：ドキュメントを編集・追加するときは、作業前に必ず以下を確認すること。

| ファイル | 確認すること |
|---|---|
| `docs/TERMS.md` | 「要件定義書」「仕様書」「難易度」「レベル」など用語の正確な意味 |
| `docs/DOCUMENT_GUIDELINES.md` | どこに何を書くか・crossrefのルール・チェックリスト |

---

## 相談種別ごとの参照先

### 「このタブの仕様を変えたい」

```
1. requirements/logic/{tab}.md     ← 変更の目的・ユーザー体験への影響を確認
2. specification/logic/{tab}.md    ← 変更対象の設計詳細・状態遷移を確認
3. タイプ B: Issue 本文に仕様を記載 / タイプ C: cursor-instructions を作成
```

### 「思考トレーニングの採点を変えたい」

```
1. requirements/thinking/scoring.md   ← 採点設計の意図・役割構成を確認
2. specification/thinking/api.md      ← APIパラメータ・プロンプト設計意図を確認
3. specification/thinking/steps.md    ← ステップフローへの影響を確認
```

### 「設計判断の経緯を確認したい」

```
docs/DESIGN_DECISION_HISTORY.md ← 没案・変更理由・ヒアリング確定事項
```

### 「新しいタブを追加したい」

```
1. requirements/logic/overview.md §3  ← タブ構成への影響を確認
2. requirements/common.md             ← 共通AI方針との整合を確認
3. requirements/logic/{newtab}.md を新規作成
4. specification/logic/{newtab}.md を新規作成
5. タイプ C: cursor-instructions を作成 → GitHub Issue 草稿（.md）を出力
```

### 「AIの採点精度を上げたい」

```
1. requirements/common.md §6-3       ← temperatureの原則
2. specification/logic/{tab}.md      ← タブ別プロンプト設計意図
   または specification/thinking/api.md
```

### 「GASスキーマを変えたい」

```
1. specification/logic/{tab}.md §GASカラム または specification/thinking/data.md §2
2. docs/gas-column-headers.md        ← コピペ用ヘッダーも更新
3. gas-script-v3.js の *_COLS 定数を更新
```

---

## 廃止・非表示だがコード・仕様書に残るもの

現フェーズでは該当なし。

> **過去の廃止履歴：**
> - 気配りタブ（kibari）：完全削除（2026-05-25）
> - 積み上げタブ（tsumiaage）：完全削除（2026-05-25以前）

---

## 更新ルール

このファイルは以下のタイミングで更新すること：

- 新しいドキュメントファイルを追加したとき
- 既存ドキュメントにセクションを追加・削除したとき
- ドキュメントを分割・統合したとき

**更新者**: Cursor（Claudeの指示書に従って実施）  
**更新タイミング**: 仕様変更を伴うPRと同一PRで更新する
