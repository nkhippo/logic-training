# 論理トレーニングアプリ 開発フロー

**バージョン**: 1.2  
**作成日**: 2026-05-20  
**更新日**: 2026-05-28  

---

## ブランチ運用（Git Flow 簡易版）

| ブランチ | 役割 |
|---|---|
| `main` | 本番相当。Vercel の公開元。マージは PR 経由 |
| `develop` | 開発の統合ブランチ。**常に `main` の最新を含む** |
| `feature/*` | 機能開発。**必ず `develop` から作成**（例: `feature/4`） |

### ブランチの流れ

```
main ─────●────●────●────────────●  （リリース・本番）
            ↑              ↑
            │    merge PR  │
develop ────┴────●────●────┴────●  （統合・検証）
                      ↑       ↑
                      │  PR   │
feature/4 ────────────┴───●───●      （作業中の機能）
```

### `develop` を `main` に追従させる（定期・リリース後）

`main` が進んだら、**先に `develop` を更新**してから `feature/*` で作業する。

```bash
git checkout develop
git pull origin develop
git pull origin main          # または: git merge origin/main
git push origin develop
```

マージ後、作業中の feature ブランチがある場合:

```bash
git checkout feature/4
git rebase develop            # コンフリクト時は解消 → git rebase --continue
git push --force-with-lease origin feature/4
```

### 機能開発の手順

```bash
git checkout develop
git pull origin develop
git checkout -b feature/5    # 新機能は develop から

# 作業 → commit → push
git push -u origin feature/5

# GitHub: PR の base は develop（main ではない）
```

### 本番（main）へ反映するとき

`develop` で十分に動作確認できたら:

```bash
# GitHub: PR base=main, compare=develop
# マージ後、再度 develop を main に合わせる（fast-forward で揃う）
git checkout develop && git pull origin main && git push origin develop
```

### API キー（Cursor ローカル / Vercel 本番）

| 環境 | 手順 |
|---|---|
| **Cursor でローカル確認** | `cp .env.example .env.local` → `VITE_API_BASE_URL` に Railway URL を記入。`npm run dev` で起動 |
| **Vercel 本番** | Vercel Environment Variables に `VITE_API_BASE_URL` を設定。FE に Claude API キーは不要。Claude キーは Railway Variables のみ |

### Remote MCP（claude.ai カスタムコネクタ）運用

| 項目 | ルール |
|---|---|
| 接続URL | `https://thinkgrindai-production.up.railway.app/mcp` |
| OAuth callback URL | `https://thinkgrindai-production.up.railway.app/oauth/github/callback` |
| 必須環境変数 | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OWNER`, `GITHUB_REPO`, `MCP_API_BASE_URL` |
| 本番反映 | Railway は **Deploy Latest Commit** を使用（Redeploy は同一コミット再実行） |
| 連携確認 | `/.well-known/oauth-protected-resource/mcp` と `POST /mcp (initialize)` を curl で確認 |

#### Remote MCP 障害時の切り分け

1. `GET /.well-known/oauth-protected-resource/mcp` が 200 か
2. `POST /mcp` の `initialize` が 200 か
3. Railway HTTP Logs に `@path:/token` を指定し、OAuth エラーを確認
4. GitHub OAuth App の callback URL が一致しているか確認

---

## 推奨開発フロー（GitHub Issue ベース・現行）

```
STEP 1: 要件議論（Claude × Naoya）
         ↓
STEP 2: Claude が Issue を直接起票（MCP カスタムコネクタ経由）
        または Issue 本文草稿（.md）を出力して Naoya がコピペ
        タイプCの場合は docs/requirements/・docs/specification/ も作成
         ↓
STEP 3: Issue に ready-for-cursor ラベルが付与される
        （feature.yml の自動付与 or Naoya が手動付与）
         ↓
STEP 4: Cursor が Issue を検知・実装（feature/* ブランチ）
        ※ Mac 起動・Cursor 起動中の場合のみ自動検知（最大5分）
         ↓
STEP 5: CI が npm test + build を実行
         ↓
STEP 6: PR 作成（base: develop）→ waiting-for-review ラベル自動付与
        Cursor は不明点を PR Comments に書いて Naoya の回答を待つ
         ↓
STEP 7: Naoya が iPhone/PC で動作確認
        ・承認: PR Comments に「approve」「OK」「lgtm」「👍」「✅」のいずれか
          → GitHub Actions が自動マージ → Vercel Preview / Railway Staging 反映
        ・修正依頼: PR Comments に「修正依頼: ○○」「要修正: ○○」「change request: ○○」のいずれか
          → Cursor が再実装して同 PR に追加コミット
         ↓
STEP 8: develop マージ後、GitHub Actions が develop → main の PR を自動作成
         ↓
STEP 9: Naoya が同様に承認コメント → main マージ → 本番自動デプロイ
```

詳細な担当分担・ツール責務は `docs/DEVELOPMENT_POLICY.md` を参照。

Issue 本文に含めるべき項目は `CLAUDE.md` の「Cursor 指示書の品質基準」を参照。

---

## ドキュメント管理ルール

| ドキュメント | 場所 | 更新タイミング |
|---|---|---|
| requirements.md（要件定義書） | docs/（GitHub管理） | 方針・目的が変わったとき |
| specification.md（仕様書） | docs/（GitHub管理） | 機能追加・仕様変更のたびに |
| 作業指示プロンプト | 使い捨て（Claudeで生成） | 毎回 |

---

## AIフレンドリーにするためのルール

### 仕様書に書くべきこと
- 定数・設定値（変えてはいけない値）
- タブ別の固有仕様（文字数・設問数など）
- GASシートのカラム定義（スプレッドシート1行目へ貼る用: [gas-column-headers.md](./gas-column-headers.md)）
- 「やらないこと」の明示（例：対偶の検証はビジネスフェーズでは出題しない）

### Cursorに渡すときのコツ
- 仕様書全体を毎回コンテキストとして渡す（`docs/specification.md` を参照させる）
- 「変更してよいファイル」と「変更してはいけないファイル」を明示する
- 完了条件を具体的に書く

### 担当分担

| 作業 | 担当 |
|---|---|
| 仕様の議論・決定 | Claude |
| 仕様書・要件定義書の差分作成 | Claude |
| Cursor作業指示プロンプト生成 | Claude |
| コードの実装・修正 | Cursor |
| ドキュメントの更新・コミット | Naoya または Cursor |
| 動作確認・git push | Naoya |
