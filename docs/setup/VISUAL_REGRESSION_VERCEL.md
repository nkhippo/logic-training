# Visual Regression × Vercel Preview セットアップ

Visual Regression Test を **Vercel Preview URL** 上で実行するための設定手順です。

---

## 概要

| 項目 | 内容 |
|------|------|
| 目的 | PR ごとの Vercel Preview 上で UI スナップショットを撮影・比較 |
| 課題 | Deployment Protection により Preview URL は 401 になる |
| 解決 | **Protection Bypass for Automation** シークレットを CI から送る |

Secret 未設定時は CI 内 `build + preview` にフォールバックします。

> **運用状況（2026-05-31）**: `VERCEL_AUTOMATION_BYPASS_SECRET` 登録済み。PR 時は Vercel Preview を優先してテストする。

---

## Step 1: Vercel で Bypass Secret を発行

1. [Vercel Dashboard](https://vercel.com/dashboard) を開く
2. **thinkgrindai** プロジェクトを選択
3. **Settings** → **Deployment Protection**
4. **Protection Bypass for Automation** セクションへ
5. **Create**（または **Generate Secret**）をクリック
6. 表示されたシークレットを **コピー**（再表示できない場合あり）

> ラベル例: `github-actions-visual-regression`

---

## Step 2: GitHub Secrets に登録

1. [ThinkGrindAi リポジトリ](https://github.com/nkhippo/ThinkGrindAi) を開く
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** をクリック
4. 以下を入力:

| 項目 | 値 |
|------|-----|
| Name | `VERCEL_AUTOMATION_BYPASS_SECRET` |
| Secret | Step 1 でコピーした値 |

5. **Add secret** を保存

---

## Step 3: 動作確認

1. develop 向けに軽い PR を1本作成
2. PR の **Checks** で `Visual Regression Test / visual-test` を確認
3. PR コメントに以下が含まれることを確認:

```
## 📸 Visual Regression Report

対象: Vercel Preview

✅ `/logic` — 差分: 0%
✅ `/thinking` — 差分: 0%
```

`対象: CI local preview (fallback)` と表示される場合は Secret 未設定または Preview 待機失敗です。

---

## トラブルシューティング

### `対象: CI local preview (fallback)` になる

| 原因 | 対処 |
|------|------|
| `VERCEL_AUTOMATION_BYPASS_SECRET` 未登録 | Step 2 を実施 |
| Secret の値が Vercel と不一致 | Vercel で再発行し GitHub を更新 |
| Vercel Preview デプロイが 120 秒以内に完了しない | Actions ログの `Wait for Vercel Preview` を確認 |

### `GET status: 401` が続く

- Vercel の Bypass Secret が正しいか確認
- Deployment Protection の **Vercel Authentication** が有効でも Bypass Secret で回避可能

### 差分が常に 5% 前後出る

- 基準画像が別環境（ローカル macOS 等）で撮影された可能性
- `screenshots/develop` または `screenshots/main` を Vercel 環境で再生成する（下記手順）

---

## 基準画像ブランチ（`screenshots/develop`・`screenshots/main`）

| ブランチ | 用途 | 更新タイミング |
|---------|------|----------------|
| `screenshots/develop` | develop 向け PR の比較基準 | develop への push 後（CI 自動） |
| `screenshots/main` | main 向け PR の比較基準 | main への push 後（CI 自動） |

PR 時の撮影は **その PR の Vercel Preview URL**（現状維持）。比較だけ base ブランチに応じて切り替わる。

旧 `screenshots` ブランチは廃止。バックアップは `screenshots-backup` を参照。

---

## 初回基準画像の手動再生成手順

### 前提

- `VERCEL_AUTOMATION_BYPASS_SECRET` をローカルの `.env` に設定済みであること
- `npm ci` と `npx playwright install chromium` 済みであること

### develop 用（`screenshots/develop`）

1. develop ブランチの最新 Vercel デプロイ URL を確認  
   （Vercel Dashboard → thinkgrindai → Deployments → develop 最新、または  
   `https://thinkgrindai-git-develop-nkhippos-projects.vercel.app`）
2. 撮影:

```bash
PLAYWRIGHT_BASE_URL=<develop の Vercel URL> npm run test:visual
```

3. 生成された `screenshots/*.png` を `screenshots/develop` ブランチのルートにコミット・プッシュ（`logic.png` / `thinking.png`）

### main 用（`screenshots/main`）

1. 本番 URL で撮影:

```bash
PLAYWRIGHT_BASE_URL=https://thinkgrindai.vercel.app npm run test:visual
```

2. 生成された `screenshots/*.png` を `screenshots/main` ブランチのルートにコミット・プッシュ

> Git では `screenshots` というブランチ名があると `screenshots/develop` ブランチを作成できない。  
> 初回移行時は旧 `screenshots` を削除（または `screenshots-backup` にリネーム）してから上記ブランチを作成すること。

---

## Vercel Ignored Build Step の設定

### 背景

`screenshots/develop` / `screenshots/main` ブランチは Visual Regression の基準 PNG のみを格納する倉庫ブランチです。
`package.json` が存在しないため、Vercel がこれらのブランチへの push をビルドしようとすると以下のエラーが発生します。

```
npm error enoent Could not read package.json
Error: Command "npm run build" exited with 254
```

このエラーは **CI（GitHub Actions）には無関係**であり、アプリの不具合ではありません。
ただし Vercel Dashboard にノイズが出続けるため、Ignored Build Step でスキップ設定を行います。

> **develop 向け PR の Preview には影響しません。**  
> Ignored Build Step は `screenshots/*` など倉庫ブランチだけ exit 0（スキップ）にし、  
> `develop` / `feat/*` などは exit 1（ビルド続行）のままです。

### 設定手順

1. [Vercel Dashboard](https://vercel.com/dashboard) → **thinkgrindai** → **Settings**
2. 左メニュー **Build and Deployment**（※ **Git** タブではない）
3. 下へスクロール → **Ignored Build Step**
4. **Behavior** を **Custom** にし、以下を入力して **Save**

```bash
case "$VERCEL_GIT_COMMIT_REF" in
  screenshots/*|screenshots-backup) exit 0 ;;
  *) exit 1 ;;
esac
```

> Vercel の仕様: **exit 0** = ビルドをスキップ / **exit 1** = ビルドを続行  
> `case` 文は末尾の **`esac`** まで含めること（欠けるとシェルエラーになる）。

**Production Overrides** に空の Command が残っていると警告が出ることがあります。
その場合は Override をリセットするか、Project Settings と同じコマンドを入れてください。

### 設定済み環境

| 設定日 | 設定者 | スキップ対象ブランチ |
|--------|--------|---------------------|
| 2026-05-31 | Naoya | `screenshots/*`, `screenshots-backup` |

### 動作確認

| 確認項目 | 期待結果 |
|---------|---------|
| `screenshots/develop` への push | Deployments が **Canceled** / **Skipped**（Failed ではない） |
| develop 向け PR | Vercel Preview が作成され、Visual Regression の `対象: Vercel Preview` になる |

### 注意事項

- 将来 `screenshots` 系のブランチを追加した場合は、上記 `case` のパターンに含まれているか確認すること
- `screenshots/*` のワイルドカードは `screenshots/develop` / `screenshots/main` 両方をカバーする

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `.github/workflows/visual-regression.yml` | CI ワークフロー |
| `scripts/wait-for-vercel-preview.js` | Preview URL 取得・200 待機 |
| `playwright.config.js` | Bypass ヘッダー付与 |
| `scripts/compare-screenshots.js` | 基準画像との差分比較 |

---

## 参考リンク

- [Vercel: Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
- [Vercel: Automated & Agent Access](https://vercel.com/docs/deployment-protection/automated-agent-access)
