# js/ モジュール構成

GitHub Pages 向けの素の JS（ビルドなし）。`index.html` の `<script>` 順序が依存関係です。

| ファイル | 責務 |
|---|---|
| 01-config.js | GAS_URL, API キー, LANG_KEY |
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
