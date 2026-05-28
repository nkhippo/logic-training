# thinkgrindai ファイル構成

**最終更新**: 2026-05-28  
**目的**: リポジトリ全体のディレクトリ・ファイル配置を一覧し、新規参加者・Claude・Cursor が「何がどこにあるか」を素早く把握するための索引。

> `node_modules` / `.git` / `dist` / `coverage` / `.DS_Store` は本ドキュメントの対象外。

---

## ルート

```
thinkgrindai/
├── CLAUDE.md                    # プロジェクト共通ルール（Claude・Cursor 共用）
├── index.html                   # Vite エントリ（SPA）
├── package.json
├── package-lock.json
├── vite.config.js               # Vite ビルド設定
├── vercel.json                  # Vercel デプロイ設定
├── .env.example                 # ローカル開発用設定例
├── .gitignore
│
├── .cursor/
│   └── rules/
│       ├── dev-flow.mdc         # Cursor 開発フロールール
│       └── wiki-modification.mdc # Wiki 修正自動化ルール
│
├── .githooks/
│   └── post-push                # push 後フック（Obsidian リマインド等）
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.md
│   │   ├── chore.md
│   │   └── feature.md
│   ├── workflows/
│   │   ├── approval.yml
│   │   ├── auto-pr-to-main.yml
│   │   ├── ci.yml
│   │   ├── deploy-pages.yml
│   │   └── sync-wiki.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── wiki/                    # GitHub Wiki 正本（sync-wiki で同期）
│       ├── Home.md
│       ├── README.md
│       ├── Getting-Started.md
│       ├── Service-Overview.md
│       ├── Specifications.md
│       ├── Development-Flow.md
│       ├── Bug-Fix-Guide.md
│       ├── FAQ.md
│       └── Roadmap.md
│
├── docs/                        # 設計・運用ドキュメント（→ 本ファイル § docs/）
├── guide/                       # ユーザー向けガイド（日英）
├── src/                         # React フロントエンド（本番）
├── backend/                     # Node.js Express API（Railway）
├── legacy/                      # 旧 Vanilla JS（参照用アーカイブ・本番未使用）
└── scripts/                     # 運用スクリプト
```

---

## docs/

設計・運用ドキュメントの正本。詳細索引は [`docs/_index.md`](./_index.md) を参照。

```
docs/
├── _index.md                    # ドキュメント索引
├── FILE_STRUCTURE.md            # このファイル（リポジトリ全体のファイル構成）
├── README.md
├── TERMS.md                     # プロジェクト用語定義
├── DOCUMENT_GUIDELINES.md       # ドキュメント記載粒度ガイドライン
├── PROJECT_CONTEXT.md           # ビジョン・ロードマップ
├── architecture.md              # フロントエンド構成・ディレクトリ設計
├── dev-flow.md                  # 開発フロー詳細
├── DEVELOPMENT_POLICY.md        # 開発フロー・タスク分類・運用ルール
├── DESIGN_DECISION_HISTORY.md   # 設計判断の経緯メモ
├── PROJECTS_KNOWLEDGE_UPDATE_GUIDE.md
├── TASK_TRACKER_URL.md
├── INFRASTRUCTURE.md            # インフラ構成図・CI/CDフロー・環境変数一覧
├── TROUBLESHOOTING.md           # 障害対応ナレッジ
├── gas-column-headers.md        # GAS シートのカラム定義（参照用）
├── requirements.md              # 要件定義（索引・旧形式）
├── requirements-thinking.md
├── specification.md             # 仕様書（索引・旧形式）
├── specification-thinking.md
├── cursor-handoff-react-state-api-url-check.md
│
├── requirements/                # 要件定義書（機能別）
│   ├── common.md
│   ├── logic/
│   │   ├── overview.md
│   │   ├── fill.md
│   │   ├── summary.md
│   │   ├── critique.md
│   │   └── ame.md
│   └── thinking/
│       ├── overview.md
│       └── scoring.md
│
├── specification/               # 仕様書（機能別）
│   ├── common.md
│   ├── backend/
│   │   └── specification_railway_phase1_4.md
│   ├── frontend/
│   │   ├── frontend-react.md
│   │   └── frontend-api-integration.md
│   ├── logic/
│   │   ├── common.md
│   │   ├── fill.md
│   │   ├── summary.md
│   │   ├── critique.md
│   │   └── ame.md
│   └── thinking/
│       ├── overview.md
│       ├── steps.md
│       ├── api.md
│       └── data.md
│
├── cursor-instructions/         # Cursor 向け指示書（タイプ C・大規模案件）
│   ├── README.md
│   ├── cursor_instruction_backend_phase1_3.md
│   ├── cursor_instruction_phase1-3_backend_base.md
│   ├── cursor_instruction_railway_phase1_4.md
│   ├── cursor_instruction_frontend_api_integration.md
│   ├── cursor_instruction_doc_index.md
│   ├── cursor_instruction_doc_integrity_fix.md
│   ├── cursor_instruction_doc_restructure.md
│   ├── cursor_instruction_block_a_environments.md
│   ├── cursor_instruction_block_b_automation.md
│   └── cursor_instruction_block_c_oauth_mcp.md
│
└── setup/                       # 環境セットアップ手順
    ├── COMPREHENSIVE_SETUP_GUIDE.md
    ├── GITHUB_PROJECTS_SETUP.md
    ├── GOOGLE_SHEETS_SETUP.md
    ├── OBSIDIAN_SETUP.md
    └── 2025-01-24_setup-summary.md
```

---

## guide/

アプリ内ガイド overlay で表示するユーザー向け説明文（日本語・英語）。

```
guide/
├── overview.md                  # 論理タブ概要（日本語）
├── fill.md
├── summary.md
├── critique.md
├── ame.md
├── thinking-overview.md
└── en/                          # 英語版
    ├── overview.md
    ├── fill.md
    ├── summary.md
    ├── critique.md
    ├── ame.md
    └── thinking-overview.md
```

---

## src/（React フロントエンド）

Vite + React 18。Vercel にデプロイ。詳細は [`docs/architecture.md`](./architecture.md) を参照。

```
src/
├── main.jsx                     # React エントリポイント
├── App.jsx                      # ルーティング（/logic / /thinking）
│
├── contexts/
│   └── AppContext.jsx           # グローバル状態（useReducer）
│
├── hooks/
│   ├── useAPI.js                # BE API 呼び出し
│   ├── useLocalStorage.js
│   ├── usePersona.js
│   └── useTranslation.js
│
├── services/
│   ├── api.js                   # API クライアント
│   ├── config.js                # 環境設定
│   ├── i18n.js                  # 多言語
│   ├── persona.js               # ペルソナ管理
│   ├── user.js                  # ユーザー識別
│   └── pastStorage.js           # 過去問ローカル保存
│
├── domain/
│   ├── constants.js
│   ├── industry-persona.js
│   ├── logic-domain.js
│   └── thinking-domain.js
│
├── logic/
│   ├── fillLogic.js             # 穴埋めタブ
│   ├── summaryLogic.js          # 要約タブ
│   ├── critiqueLogic.js         # 批判読みタブ
│   ├── ameLogic.js              # 空雨傘タブ
│   ├── thinkingLogic.js         # 思考トレーニング
│   └── themeHelpers.js          # テーマ行 UI ヘルパー
│
├── utils/
│   ├── markdown.js
│   └── migrate.js               # 旧データ移行
│
├── styles/
│   └── App.css
│
└── components/
    ├── layout/
    │   ├── Header.jsx
    │   ├── SubTabs.jsx
    │   ├── BusyOverlay.jsx
    │   └── Toast.jsx
    ├── shared/
    │   ├── DiffSelector.jsx
    │   ├── PresetRow.jsx
    │   ├── IndustrySelector.jsx
    │   ├── ProblemMeta.jsx
    │   ├── LangModal.jsx
    │   └── PersonaModal.jsx
    ├── logic/
    │   ├── LogicPage.jsx
    │   ├── tabs/
    │   │   ├── FillTab.jsx
    │   │   ├── SummaryTab.jsx
    │   │   ├── CritiqueTab.jsx
    │   │   ├── CritiqueQuestionBlock.jsx
    │   │   └── AmeTab.jsx
    │   └── past/
    │       └── PastList.jsx
    └── thinking/
        ├── ThinkingPage.jsx
        ├── GenerateForm.jsx
        ├── ProblemView.jsx
        ├── StepView.jsx
        ├── FinalQuestionView.jsx
        ├── FeedbackView.jsx
        ├── ReflectionView.jsx
        └── ThinkingPastList.jsx
```

---

## backend/

Node.js Express API。Railway にデプロイ。仕様は [`docs/specification/backend/`](./specification/backend/) を参照。

```
backend/
├── README.md
├── package.json
├── package-lock.json
├── nixpacks.toml                # Railway ビルド設定
├── railway.json
├── .env.example
├── .gitignore
├── test-local.sh
│
├── src/
│   ├── index.js                 # Express サーバー
│   ├── api/
│   │   ├── generate-problem.js  # 問題生成
│   │   ├── score-answer.js      # 採点
│   │   └── complete.js          # セッション完了
│   ├── config/
│   │   ├── claude-config.js
│   │   └── constants.js
│   ├── middleware/
│   │   └── error-handler.js
│   └── services/
│       ├── claude-service.js    # Claude API
│       ├── sheets-service.js    # Google Sheets
│       └── validate-service.js  # リクエスト検証
│
└── tests/
    ├── generate.test.js
    ├── score.test.js
    ├── complete.test.js
    └── integration.test.js
```

---

## legacy/（参照用アーカイブ）

旧 Vanilla JS 実装。本番では使用しない。React 移植時の参照用。

```
legacy/
├── README.md
├── app.js
├── logic.html
├── thinking.html
├── style.css
└── js/
    ├── README.md
    ├── config.js
    ├── 01-config.local.js
    ├── logic/
    │   ├── 04-domain.js
    │   ├── 05-core-ui.js
    │   ├── 08-fill.js
    │   ├── 09-summary.js
    │   ├── 10-past-shared.js
    │   ├── 11-critique.js
    │   ├── 12-ame.js
    │   ├── 13-past.js
    │   ├── 14-guide.js
    │   └── 16-init.js
    ├── shared/
    │   ├── 01-config.js
    │   ├── 01-config.local.js.example
    │   ├── 02-i18n.js
    │   ├── 03-state.js
    │   ├── 04-industry-persona.js
    │   ├── 06-utils-md.js
    │   ├── 07-api.js
    │   ├── 08-migrate.js
    │   ├── 09-persona.js
    │   ├── 10-preset-ui.js
    │   ├── 11-gas-past.js
    │   ├── 12-lang.js
    │   └── 13-persona-modal.js
    └── thinking/
        ├── app.js
        └── domain.js
```

---

## scripts/

```
scripts/
├── install-git-hooks.sh         # post-push フック有効化
├── obsidian-sync-reminder.sh    # Obsidian 同期リマインド
├── sync-github-wiki.sh          # GitHub Wiki 手動同期
├── split-app-js.py              # 旧 app.js 分割（メンテ用）
└── inject-api-key.py            # API キー注入（メンテ用）
```

---

## カテゴリ別サマリ

| カテゴリ | 主な役割 | ファイル数（目安） |
|---|---|---|
| ルート設定 | ビルド・デプロイ・共通ルール | 8 |
| `.cursor/` / `.github/` | 開発ルール・CI・Wiki | 18 |
| `docs/` | 要件・仕様・指示書・セットアップ | 53 |
| `guide/` | エンドユーザー向け説明 | 12 |
| `src/` | React 本番フロントエンド | 52 |
| `backend/` | API サーバー・テスト | 22 |
| `legacy/` | 旧実装（参照用） | 35 |
| `scripts/` | 運用自動化 | 5 |

---

## 関連ドキュメント

| 知りたいこと | 参照先 |
|---|---|
| ドキュメントの内容・索引 | [`docs/_index.md`](./_index.md) |
| フロントエンドの設計意図 | [`docs/architecture.md`](./architecture.md) |
| 開発フロー | [`docs/dev-flow.md`](./dev-flow.md) / `.cursor/rules/dev-flow.mdc` |
| 用語の定義 | [`docs/TERMS.md`](./TERMS.md) |

---

## 更新ルール

以下のタイミングで本ファイルを更新すること：

- 新規ディレクトリ・主要ファイルを追加したとき
- タブ追加・廃止など構成が変わったとき
- `legacy/` の整理など、アーカイブ構成が変わったとき

**更新者**: Cursor  
**更新タイミング**: 構成変更を伴う PR と同一 PR で更新する
