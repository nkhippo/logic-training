# js/ モジュール構成

ビルドなし。各 HTML の `<script>` 順序が依存関係。**詳細は [docs/architecture.md](../docs/architecture.md)。**

## logic.html が読み込むもの

1. `shared/*`（01-config 〜 12-lang）
2. `logic/*`（04-domain 〜 16-init）

## thinking.html が読み込むもの

1. `shared/*`（01-config 〜 12-lang）
2. `thinking/domain.js` → `thinking/app.js`

## shared/

| ファイル | 責務 |
|---|---|
| 01-config.js | GAS_URL, API キー, LANG_KEY, ENABLE_REFLECTION |
| 02-i18n.js | 文言 `L` |
| 03-state.js | 論理用 `st` |
| 04-industry-persona.js | 業界プリセット・ペルソナ定数 |
| 06-utils-md.js | esc, md2h, toast（#toast） |
| 07-api.js | Claude, GAS |
| 08-migrate.js | localStorage キー移行 |
| 09-persona.js | ペルソナ読込・プロンプト追記 |
| 10-preset-ui.js | preset ボタン行（thinking 等） |
| 11-gas-past.js | シート別過去問取得・同期表示 |
| 12-lang.js | 言語の保存・ボタン UI |

## logic/

| ファイル | 責務 |
|---|---|
| 04-domain.js | 論理タブの定数・ドメイン関数 |
| 05-core-ui.js | タブ UI・ペルソナモーダル・applyLang |
| 08–15, 17-tsumiaage | タブ別 |
| 13-past.js, 10-past-shared.js | 過去問 |
| 16-init.js | 起動 |

## thinking/

| ファイル | 責務 |
|---|---|
| domain.js | THINKING_CORES, THINKING_TYPES, 採点基準など |
| app.js | 思考トレーニングの全 UI フロー |

## ローカル API キー

```bash
cp js/shared/01-config.local.js.example js/shared/01-config.local.js
```

`logic.html` / `thinking.html` のどちらでも読み込まれます（gitignore）。
