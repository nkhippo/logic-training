# js/ モジュール構成

GitHub Pages 向けの素の JS（ビルドなし）。`index.html` の `<script>` 順序が依存関係です。

| ファイル | 責務 |
|---|---|
| 01-config.js | GAS_URL, API キー, LANG_KEY |
| 01-config.local.js | （任意・gitignore）ローカル用 API キー上書き |
| 02-i18n.js | 文言オブジェクト `L` |
| 03-state.js | `st`, busy 判定 |
| 04-domain.js | 難易度定数・プリセット・要約/穴埋めドメイン関数 |
| 05-core-ui.js | 言語・テーマ・業界・busy・タブ/sub 切替 |
| 06-utils-md.js | esc, md2h, 採点表示 |
| 07-api.js | Claude, GAS, doPrint |
| 10-past-shared.js | pastPrefix, pastList |
| 08–15 | タブ別 + 過去問 + ガイド |
| 16-init.js | 起動 |

再分割: `python3 scripts/split-app-js.py`（`app.monolith.js` が必要）

## API キー（Cursor / ローカル）

1. `cp js/01-config.local.js.example js/01-config.local.js`
2. `js/01-config.local.js` に Anthropic API キーを記入（Cursor で編集可。**コミットしない**）
3. `index.html` 経由で開く（Live Server 等）

## API キー（GitHub Pages 本番）

1. GitHub リポジトリ → **Settings → Secrets and variables → Actions** → `CLAUDE_API_KEY` を登録
2. **Settings → Pages** の Source を **GitHub Actions** に変更
3. `main` へマージすると workflow がキーを注入してデプロイ（リポジトリの `01-config.js` は空のまま）

> ブラウザから Claude API を直接呼ぶ構成のため、配信された JS にはキーが含まれます。限定公開・少人数利用を前提にしてください。
