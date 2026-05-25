# thinkgrindai — 共通仕様書

**対象**: js/shared/ 以下・両HTML共通部分  
**バージョン**: 1.0  
**作成日**: 2026-05-25

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
├── js/
│   ├── shared/             # 両アプリ共通（読み込み順に依存）
│   │   ├── 01-config.js        # GAS_URL・CLAUDE_API_KEY・LANG_KEY・ENABLE_REFLECTION
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

```javascript
// callClaudeMsg(messages, systemPrompt, temperature, maxTokens)
// model: claude-sonnet-4-6（js/shared/07-api.js 内で固定）
// APIキー: CLAUDE_API_KEY（js/shared/01-config.js）のみ
//          本番: GitHub Actions が secrets.CLAUDE_API_KEY を注入
//          ローカル: js/shared/01-config.local.js（gitignore）
//          設定UI・localStorage は使わない
```

| 用途 | temperature | 備考 |
|---|---|---|
| 問題生成 | 0.9 | 多様な問題が生成されるよう創造性を確保 |
| 採点・フィードバック | 0.3 | 採点基準が一貫するよう低めに設定 |
| 思考トレーニング振り返り（役割D1〜D3） | 0.7 | 自然な対話として機能するよう適度な幅を持たせる |

---

## 3. ヘッダー仕様（共通パターン）

logic.html・thinking.html は同一のヘッダーパターンを使用する。
左寄せと右寄せの2カラム構成。

| 位置 | 要素 | 内容 |
|---|---|---|
| 左 | サービス名 | "thinkgrindai"（小さく） |
| 左 | ページタイトル | サービスごとに異なる |
| 左 | ガイド | "ガイド？" → ガイドモーダル |
| 左 | 他サービスへのリンク | logic: 「思考トレーニング →」/ thinking: 「← 論理トレーニング」 |
| 右 | プロフィール | ペルソナ設定モーダルを開く（`js/shared/13-persona-modal.js`） |
| 右 | 言語 | モーダルで日本語・English を選択（`js/shared/12-lang.js`） |

---

## 4. ペルソナ設定仕様

### 4-1. UI仕様

- ヘッダー右の「プロフィール」ボタン → モーダルで設定
- 業界×職種（最大3つ・プリセット選択）と勤続年数（数値選択）
- localStorageに保存（キー: `thinkgrindai_persona_v1`）
- 論理トレーニング・思考トレーニング共通

### 4-2. 問題生成プロンプトへの付加

ペルソナが設定されている場合、全タブ・全問題の生成プロンプトに以下を付加する。

```
回答者のバックグラウンド：[業界×職種]（勤続[N]年）
このバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。
ただし難易度・採点基準はバックグラウンドによって変えないこと。
```

実装：`js/shared/09-persona.js` の `buildPersonaPromptNote()`

---

## 5. 言語切替仕様

- ヘッダー右の「言語」ボタン → モーダルで日本語・English を選択
- 設定は localStorageに保存（キー: `thinkgrindai_lang`）
- 文言は `js/shared/02-i18n.js` の `L.ja` / `L.en` で管理
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
