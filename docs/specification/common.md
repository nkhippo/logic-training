# thinkgrindai — 共通仕様書

**対象**: js/shared/ 以下・両HTML共通部分  
**バージョン**: 1.1  
**作成日**: 2026-05-25  
**最終更新**: 2026-05-27（#77–#78 Hotfix: モーダル UI を React で定義）

> このファイルは両サービスに共通する実装仕様を記述する。  
> サービス固有の仕様は `specification/logic/` または `specification/thinking/` を参照すること。

---

## 1. ファイル構成

```
thinkgrindai/
├── index.html              # ルートリダイレクト（logic.html へ）
├── logic.html              # 論理トレーニング
├── thinking.html           # 思考トレーニング
├── style.css               # 全タブ共通スタイル
├── gas-script-v3.js        # GAS（論理・思考共通）
├── app.js                  # getUserId()
├── js/
│   ├── config.js           # Railway URL・USE_BACKEND_API・ENDPOINTS（HTML で先に読込）
│   ├── shared/             # 両アプリ共通（読み込み順に依存）
│   │   ├── 01-config.js        # GAS_URL・CLAUDE_API_KEY（空）・LANG_KEY
│   │   ├── 02-i18n.js          # L.ja / L.en（logic + thinking 両方の文言）
│   │   ├── 03-state.js         # 論理用 st（thinking は thinkingSt を app 内で保持）
│   │   ├── 04-industry-persona.js  # INDUSTRY_PRESETS・JOB_PRESETS
│   │   ├── 06-utils-md.js      # md2h / esc / safeJSON
│   │   ├── 07-api.js           # callClaude / gasPost / ensureGasV3
│   │   ├── 08-migrate.js       # migrateLocalStorageKeys
│   │   ├── 09-persona.js       # loadPersonaIntoState / buildPersonaPromptNote
│   │   ├── 10-preset-ui.js
│   │   ├── 11-gas-past.js      # setSync
│   │   ├── 12-lang.js          # getSavedLang / setSavedLang
│   │   └── 13-persona-modal.js # ペルソナ設定モーダル
│   ├── logic/              # logic.html のみ
│   └── thinking/           # thinking.html のみ
├── guide/
│   ├── overview.md 〜 ame.md    # 論理トレーニング用（日本語）
│   ├── thinking-overview.md     # 思考トレーニング用（日本語）
│   └── en/                      # 英語版
└── docs/                   # ドキュメント
```

---

## 2. API呼び出し共通仕様

### 2-1. 構成（Phase 2-1 以降）

| 層 | ファイル | 役割 |
|---|---|---|
| 設定 | `js/config.js` | `API_BASE_URL`・`USE_BACKEND_API`・`ENDPOINTS` |
| ユーザー ID | `app.js` | `getUserId()` → `thinkgrindai_user_id` |
| 呼び出し | `js/shared/07-api.js` | `callClaude` / `callClaudeMsg` / GAS |
| BE | Railway | `/api/generate-problem`・`/api/score-answer`・`/api/complete` |

詳細: `docs/specification/frontend/frontend-api-integration.md`

### 2-2. Claude モデル

**BE 本番**: `backend/src/config/claude-config.js` で `claude-sonnet-4-6` を固定。  
**ブラウザ直叩き**（`USE_BACKEND_API=false` のみ）: `js/shared/07-api.js` 内の `model` 文字列。

モデル変更時は BE と FE 直叩きの両方を確認すること。

### 2-3. API キー

| 環境 | キーの置き場所 |
|---|---|
| 本番 Pages + `USE_BACKEND_API=true` | **不要**（Railway Variables のみ） |
| ローカル + BE | `backend/.env.local` |
| ローカル + BE オフ | `js/shared/01-config.local.js`（gitignore） |

GitHub Pages デプロイでの `CLAUDE_API_KEY` 注入は **廃止**（2026-05-26）。

| 用途 | temperature | 備考 |
|---|---|---|
| 問題生成 | 0.9 | 多様な問題が生成されるよう創造性を確保 |
| 採点・フィードバック | 0.3 | 採点基準が一貫するよう低めに設定 |
| 思考トレーニング振り返り（役割D1〜D3） | 0.7 | 自然な対話として機能するよう適度な幅を持たせる |

---

## 3. ヘッダー仕様（共通パターン）

**本番（React）**: `src/components/layout/Header.jsx`（`page` prop: `'logic'` | `'thinking'`）  
**legacy 参照**: `logic.html` / `thinking.html`（同一レイアウト）

左寄せと右寄せの2カラム構成。

| 位置 | 要素 | 内容 |
|---|---|---|
| 左 | サービス名 | "thinkgrindai"（小さく） |
| 左 | ページタイトル | サービスごとに異なる |
| 左 | 他サービスへのリンク | logic: 「思考トレーニング →」/ thinking: 「← 論理トレーニング」 |
| 右 | プロフィール | ペルソナ設定モーダル（`PersonaModal.jsx`） |
| 右 | 言語 | 言語選択モーダル（`LangModal.jsx`） |

### 3-1. モーダル共通UI

ヘッダーから開くモーダル（言語・ペルソナ）は、ガイドと同じオーバーレイパターンを使う。

| 項目 | 仕様 |
|---|---|
| オーバーレイ | `.guide-overlay.show` — `position: fixed; inset: 0; z-index: 2000`、背景 `rgba(44,31,14,.45)` |
| ダイアログ | `.guide-modal` — 白背景・角丸・`max-height: 88vh` |
| ヘッダー行 | `.guide-modal-header` + `.guide-close-btn`（×） |
| 閉じ方 | ×ボタン、オーバーレイクリック、`Escape` キー |
| 本文 | `.guide-body`（言語モーダルは `.lang-modal-body`） |

| モーダル | React コンポーネント | `max-width` |
|---|---|---|
| 言語 | `src/components/shared/LangModal.jsx` | `360px` |
| ペルソナ | `src/components/shared/PersonaModal.jsx` | `520px` |

言語モーダルの選択肢は `.lang-choice-btn`（選択中は `.sel` + `disabled`）。

> legacy: `js/shared/12-lang.js` / `js/shared/13-persona-modal.js` も同一クラス名（`guide-overlay`）を使用。

---

## 4. ペルソナ設定仕様

### 4-1. UI仕様

- ヘッダー右の「プロフィール」ボタン → `PersonaModal`（`guide-overlay`）で設定
- 業界×職種（最大3行・業界/職種は `PERSONA_INDUSTRY_ROLES` から選択、行の追加は最大3まで）
- 勤続年数（`PERSONA_TENURE_OPTIONS` から選択、説明文は `PERSONA_TENURE_DESC`）
- 保存 / クリアボタン。保存時トースト（`personaSavedMsg` / `personaClearedMsg`）
- localStorageに保存（キー: `thinkgrindai_persona_v1`）
- 論理トレーニング・思考トレーニング共通（`src/services/persona.js` / `usePersona` hook）

### 4-2. 問題生成プロンプトへの付加

ペルソナが設定されている場合、全タブ・全問題の生成プロンプトに以下を付加する。

```
回答者のバックグラウンド：[業界×職種]（勤続[N]年）
このバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。
ただし難易度・採点基準はバックグラウンドによって変えないこと。
```

実装：`src/services/persona.js` の `buildPersonaPromptNote()`（legacy: `js/shared/09-persona.js`）

---

## 5. 言語切替仕様

- ヘッダー右の「言語」ボタン → `LangModal`（`guide-overlay`）で日本語・English を選択
- 現在の言語と同じボタンは `disabled` + `.sel`
- 設定は localStorageに保存（キー: `thinkgrindai_lang`）
- 文言は `src/services/i18n.js` の `L.ja` / `L.en` で管理（legacy: `js/shared/02-i18n.js`）
- ガイドMarkdownのキャッシュキーは `{lang}:{tab}`（言語切替時に別言語の本文が混ざらないこと）

---

## 6. localStorageキー一覧

| キー | 用途 | 共有範囲 |
|---|---|---|
| `thinkgrindai_lang` | 言語設定 | logic / thinking 共通 |
| `thinkgrindai_persona_v1` | ペルソナ設定 | logic / thinking 共通 |

旧キー（`logic_v10_*`）からのマイグレーションは `js/shared/08-migrate.js` で処理する。

---

## 7. GAS共通仕様

### 7-1. デプロイ設定

```
実行ユーザー: Me（スプレッドシートオーナー）
アクセス権限: Anyone（認証なし）
バージョン: v3（gas-script-v3.js）
```

### 7-2. 共通エンドポイント

| メソッド | パラメータ | 内容 |
|---|---|---|
| GET | `?ping=1` | バージョン確認 |
| POST | `{ action: 'delete', sheet, id }` | 過去問削除（全シート共通） |

タブ別のエンドポイントは各タブ仕様書（`specification/logic/*.md`、`specification/thinking/data.md`）を参照。

---

## 8. ガイドMarkdown仕様

| 言語 | パス | 備考 |
|---|---|---|
| 日本語 | `guide/{tab}.md` または `guide/ja/{tab}.md` | ルート直下を ja のフォールバックとして読み込む |
| 英語 | `guide/en/{tab}.md` | 英語UI時はこちらを優先。未配置タブはエラー表示 |

`fetchGuide` のキャッシュキーは `{lang}:{tab}`。

---

## 9. API処理中のUI仕様

全画面オーバーレイで操作不可（タブ・過去問・ガイド含む）。スクロールのみ可能。
ユーザーが誤操作でAPI呼び出しを多重実行するのを防ぐため。
