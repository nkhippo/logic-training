# thinkgrindai — フロントエンド構成

GitHub Pages 向けの**ビルドなし**構成。エントリポイントは HTML が2つ。

| ページ | 役割 |
|---|---|
| `index.html` | ルート → `logic.html` へリダイレクト |
| `logic.html` | 論理トレーニング（穴埋め・要約・批判読み・空雨傘） |
| `thinking.html` | 思考トレーニング |

## ディレクトリ

```
js/
  shared/          # 両アプリ共通（script 順序どおり）
    01-config.js
    02-i18n.js     # L（logic + thinking の文言）
    03-state.js    # 論理用 st（thinking は thinkingSt を app 内で保持）
    04-industry-persona.js
    06-utils-md.js
    07-api.js      # Claude / GAS
    08-migrate.js
    09-persona.js
    10-preset-ui.js
    11-gas-past.js
    12-lang.js
  logic/           # logic.html のみ
    04-domain.js
    05-core-ui.js
    08-fill.js … 13-past.js, 14-guide.js
    16-init.js
  thinking/        # thinking.html のみ
    domain.js      # THINKING_* 定数
    app.js           # UI・生成・採点フロー
```

## 変更時の目安

| 変更内容 | 触る場所 |
|---|---|
| 文言（日英） | `js/shared/02-i18n.js` |
| 業界・ペルソナ | `js/shared/04-industry-persona.js` + 論理 UI は `logic/05-core-ui.js` |
| GAS 列 | `gas-script-v3.js` + `docs/gas-column-headers.md` |
| 論理タブの挙動 | `js/logic/` 配下の該当ファイル |
| 思考トレーニング | `js/thinking/` + `thinking.html` |
| 両方の API・過去問取得 | `js/shared/07-api.js` / `11-gas-past.js` |

## ローカル開発

```bash
cp js/shared/01-config.local.js.example js/shared/01-config.local.js
# キーを記入して logic.html または thinking.html を開く
```

## 将来の分岐（判断ポイント）

| 方針 | 向いているとき |
|---|---|
| **現状維持（2 HTML + shared）** | 画面が独立したまま、ビルドなしで運用したい |
| **i18n を logic/thinking に分割** | 文言ファイルがさらに肥大化したとき |
| **SPA 化（1 HTML）** | ヘッダー・ペルソナ・言語を完全共通化したい |
| **バンドラ導入** | ファイル数・依存関係の管理を自動化したい |

現時点では **2 HTML + `js/shared`** を採用（変更コストと Pages 運用のバランス）。
