# thinkgrindai ドキュメント索引

**最終更新**: 2026-05-25（ドキュメント構造を全面再編）  
**対応バージョン**: Ver.3.3

> このファイルは Claude と Cursor が「何がどこに書いてあるか」を把握するための索引です。  
> ドキュメント追加・変更のたびに必ず更新してください。

---

## ドキュメント構造の方針

```
docs/
├── requirements/          ← 「なぜ・何を」（ユーザー体験・設計の動機）
│   ├── common.md          ← 両サービス共通（目的・背景・AI方針・ペルソナ設計）
│   ├── logic/
│   │   ├── overview.md    ← 論理トレーニング全体（タブ構成・論理力定義）
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
│   └── thinking/
│       ├── overview.md    ← 状態オブジェクト・問題オブジェクト・画面構成・定数一覧
│       ├── steps.md       ← レベル別ステップフロー・80点ルール・90点ルール・振り返りUI
│       ├── api.md         ← 全API呼び出し仕様（temperature・max_tokens・プロンプト設計意図）
│       └── data.md        ← user_coreフロー・GASカラム・ENABLE_REFLECTION・残タスク
│
├── cursor-instructions/   ← Cursor向け作業指示書（実装単位で追加）
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
| 2026-05-25 | ドキュメント構造を全面再編（単一ファイル → requirements/ + specification/ の階層構造へ） |
| 2026-05-25 | 旧 requirements.md・requirements-thinking.md・specification.md・specification-thinking.md を分割 |
| 2026-05-25 | 思考トレーニングの設計意図（Obsidianメモ06〜12）を仕様書に反映 |
| 2026-05-25 | 状態遷移フロー・プロンプト設計意図を全タブの仕様書に追加 |

---

## 相談種別ごとの参照先

### 「このタブの仕様を変えたい」

```
1. requirements/logic/{tab}.md     ← 変更の目的・ユーザー体験への影響を確認
2. specification/logic/{tab}.md    ← 変更対象の設計詳細・状態遷移を確認
3. Cursor指示書を作成
```

### 「思考トレーニングの採点を変えたい」

```
1. requirements/thinking/scoring.md   ← 採点設計の意図・役割構成を確認
2. specification/thinking/api.md      ← APIパラメータ・プロンプト設計意図を確認
3. specification/thinking/steps.md    ← ステップフローへの影響を確認
```

### 「新しいタブを追加したい」

```
1. requirements/logic/overview.md §3  ← タブ構成への影響を確認
2. requirements/common.md             ← 共通AI方針との整合を確認
3. requirements/logic/{newtab}.md を新規作成
4. specification/logic/{newtab}.md を新規作成
5. Cursor指示書を作成
```

### 「AIの採点精度を上げたい」

```
1. requirements/common.md §5-3       ← temperatureの原則
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

| 機能 | 状態 | 関連ファイル |
|---|---|---|
| 気配りタブ（kibari） | UI非表示・コード残存 | `js/logic/15-kibari.js`・GAS kibariシート |
| 積み上げタブ（tsumiaage） | 完全廃止 | 削除済み |

---

## 更新ルール

このファイルは以下のタイミングで更新すること：

- 新しいドキュメントファイルを追加したとき
- 既存ドキュメントにセクションを追加・削除したとき
- ドキュメントを分割・統合したとき

**更新者**: Cursor（Claudeの指示書に従って実施）  
**更新タイミング**: 仕様変更を伴うPRと同一PRで更新する
