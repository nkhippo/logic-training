# thinkgrindai — フロントエンド構成

Vite + React 18 の SPA 構成。ホスティングは Vercel。

| URL パス | 役割 |
|---|---|
| `/` | `/logic` へリダイレクト |
| `/logic` | 論理トレーニング（穴埋め・要約・批判読み・空雨傘） |
| `/thinking` | 思考トレーニング |

---

## ディレクトリ構成

```
src/
  App.jsx                # ルーティング（BrowserRouter + Routes）
  main.jsx               # ReactDOM.createRoot エントリ
  contexts/
    AppContext.jsx        # グローバル状態（useReducer）+ AppProvider
  hooks/
    useAPI.js            # Railway API ラッパー（ローディング状態を Context に反映）
    useTranslation.js    # i18n フック（t / lang / setLang）
    usePersona.js        # ペルソナ読み書き
    useLocalStorage.js   # localStorage 汎用フック
  services/
    api.js               # fetch ラッパー・callClaude・JSON パーサ
    config.js            # Railway URL・エンドポイント定数
    i18n.js              # 文言マップ（ja / en）
    pastStorage.js       # 過去問 localStorage 読み書き
    persona.js           # ペルソナ localStorage 読み書き・プロンプト生成
    user.js              # userId 生成（localStorage）
  components/
    layout/
      Header.jsx         # ヘッダー（言語・ペルソナ・サービス切替）
      SubTabs.jsx        # 新規 / 過去問 サブタブ
      BusyOverlay.jsx    # ローディングオーバーレイ
      Toast.jsx          # トースト通知
    logic/
      LogicPage.jsx      # 論理トレーニングメインページ（タブ管理）
      tabs/
        FillTab.jsx      # 穴埋めタブ
        SummaryTab.jsx   # 要約タブ
        CritiqueTab.jsx  # 批判読みタブ
        CritiqueQuestionBlock.jsx # 批判読みの設問ブロック（Phase 2-3で抽出）
        AmeTab.jsx       # 空雨傘タブ
      past/
        PastList.jsx     # 過去問一覧・詳細（設問表示含む）
    thinking/
      ThinkingPage.jsx   # 思考トレーニングメインページ
      GenerateForm.jsx   # 問題設定フォーム（核心・業界・難易度・レベル）
      ProblemView.jsx    # 問題表示・ステップ回答
      StepView.jsx       # ステップ別回答UI（answer/define/typeselect モード）
      FinalQuestionView.jsx # 最終問い表示・回答UI
      FeedbackView.jsx   # 最終フィードバック表示
      ReflectionView.jsx # 振り返り対話（D1/D2/D3）
      ThinkingPastList.jsx # 思考トレーニング過去問一覧
    shared/
      DiffSelector.jsx   # 難易度選択
      PresetRow.jsx      # テーマプリセット行（5列 CSS Grid・THEME_PRESET_COLS=5）
      IndustrySelector.jsx # 業界選択
      PersonaModal.jsx   # ペルソナ設定モーダル
      LangModal.jsx      # 言語切替モーダル
      ProblemMeta.jsx    # 問題のメタ情報表示
  domain/
    constants.js         # LANG_KEY・PERSONA_KEY 等の定数
    industry-persona.js  # 業界・職種・勤続年数のプリセット
    logic-domain.js      # 論理タブのドメイン定数
    thinking-domain.js   # 思考タブのドメイン定数（6タイプ・4レベル・採点基準等）
  logic/
    fillLogic.js         # 穴埋め：問題生成・採点・過去問エントリ構築
    summaryLogic.js      # 要約：問題生成・採点・過去問エントリ構築
    critiqueLogic.js     # 批判読み：問題生成・採点・過去問エントリ構築
    ameLogic.js          # 空雨傘：問題生成・採点・過去問エントリ構築
    thinkingLogic.js     # 思考：問題生成・採点・振り返り
    themeHelpers.js      # テーマ選択バリデーション共通関数
  utils/
    markdown.js          # HTML エスケープ・Markdown フォーマット・日付フォーマット
    migrate.js           # localStorage キー移行
  styles/
    App.css              # 全コンポーネント共通スタイル
```

## バックエンド（Remote MCP）構成

`backend/src/` のうち、claude.ai カスタムコネクタ連携で使用する主要ファイルは以下。

```
backend/src/
  index.js                      # Express エントリ。/mcp と OAuth ルートをマウント
  api/
    mcp-remote.js               # Remote MCP エンドポイント（well-known + POST /mcp）
    oauth-claude.js             # OAuth 認可開始 /authorize と token 交換 /token
    mcp.js                      # 既存 OpenAPI 互換エンドポイント（互換用途）
  mcp/
    protocol-handler.js         # MCP JSON-RPC ハンドラ（initialize/tools/list/tools/call）
  services/
    github-issues-service.js    # GitHub Issue 作成・一覧の共通サービス
```

### Remote MCP エンドポイント

| エンドポイント | 役割 |
|---|---|
| `GET /.well-known/oauth-protected-resource/mcp` | OAuth Protected Resource Metadata（RFC 9728） |
| `GET /.well-known/oauth-authorization-server` | OAuth Authorization Server Metadata（RFC 8414） |
| `GET /authorize` | claude.ai からの OAuth 認可開始 |
| `POST /token` | authorization_code + PKCE でトークン交換 |
| `POST /mcp` | MCP JSON-RPC（`initialize` / `tools/list` / `tools/call`） |

### 提供ツール（MCP）

| ツール名 | 内容 |
|---|---|
| `create_issue` | thinkgrindai リポジトリに Issue 作成 |
| `update_issue` | 指定 Issue のタイトル・本文を更新 |
| `list_issues` | thinkgrindai リポジトリの Issue 一覧取得 |

---

## 変更時の目安

| 変更内容 | 触る場所 |
|---|---|
| 文言（日英） | `src/services/i18n.js` |
| 業界・ペルソナ | `src/domain/industry-persona.js` + `src/services/persona.js` |
| 論理タブの挙動 | `src/logic/{tab}Logic.js` + `src/components/logic/tabs/{Tab}Tab.jsx` |
| 思考トレーニング | `src/logic/thinkingLogic.js` + `src/components/thinking/` |
| API 呼び出し共通 | `src/services/api.js` |
| グローバル状態 | `src/contexts/AppContext.jsx` |
| BE API 仕様 | `backend/src/api/` |

---

## ローカル開発

```bash
# フロントエンド
cp .env.example .env.local
# VITE_API_BASE_URL に Railway URL を記入
npm install
npm run dev

# バックエンド（別ターミナル）
cd backend
cp .env.example .env.local
# CLAUDE_API_KEY / GOOGLE_SHEETS_CREDENTIALS を記入
npm install
npm run dev
```

---

## Vercel デプロイ

- Vercel プロジェクト設定 → Environment Variables に `VITE_API_BASE_URL` を設定
- `main` へのマージで自動デプロイ（vercel.json で SPA ルーティング設定済み）

---

## 将来の分岐（判断ポイント）

| 方針 | 向いているとき |
|---|---|
| **現状維持（React SPA + Railway）** | 機能追加・SaaS化の基盤として十分 |
| **バックエンドスケールアップ** | ユーザー数が増えて Railway の制限に当たったとき |
| **認証追加** | Phase 5（マルチユーザー対応）のタイミング |
| **React Native 化** | モバイルアプリ化の需要が出たとき |

---

## 環境構成

| 環境 | FE | BE | 用途 |
|---|---|---|---|
| **本番** | Vercel Production（`main` ブランチ） | Railway Production | ユーザー利用 |
| **検証** | Vercel Preview（`develop` ブランチ） | Railway Staging | マージ前確認 |
| **ローカル** | `npm run dev`（feature ブランチ） | 検証環境に接続 | 開発作業 |

### URL 対応表

| 種類 | URL |
|---|---|
| BE 本番 | https://thinkgrindai-production.up.railway.app |
| BE 検証 | https://thinkgrindai-staging.up.railway.app |
| MCP エンドポイント | https://thinkgrindai-production.up.railway.app/mcp |
| FE 本番・検証 | Vercel ダッシュボードで確認 |

### CI/CD フロー

```
feature/* push → CI（npm test + build）
  ↓
PR (base: develop)
  ↓ Naoya が承認（approve / OK / 👍 等）
  ↓
develop マージ → Vercel Preview / Railway Staging 自動デプロイ
  ↓ 検証OK
  ↓
develop → main PR（GitHub Actions が自動作成）
  ↓ Naoya が承認
  ↓
main マージ → Vercel Production / Railway Production 自動デプロイ
```
