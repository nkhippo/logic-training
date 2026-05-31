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

- 基準画像（`screenshots` ブランチ）が別環境（ローカル macOS 等）で撮影された可能性
- main マージ後に `screenshots` ブランチが CI 環境で再生成されるまで ⚠️ が続く場合あり

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
