# 論理トレーニングアプリ 開発フロー

**バージョン**: 1.1  
**作成日**: 2026-05-20  
**更新日**: 2026-05-20  

---

## ブランチ運用（Git Flow 簡易版）

| ブランチ | 役割 |
|---|---|
| `main` | 本番相当。GitHub Pages の公開元。マージは PR 経由 |
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

### API キー（Cursor ローカル / GitHub Pages）

| 環境 | 手順 |
|---|---|
| **Cursor でローカル確認** | `cp js/01-config.local.js.example js/01-config.local.js` → キーを記入（`.gitignore` 対象・コミットしない） |
| **GitHub Pages 本番** | リポジトリ Secrets に `CLAUDE_API_KEY` を登録。Pages の Source を **GitHub Actions** にする。`main` マージで `.github/workflows/deploy-pages.yml` がキーを注入してデプロイ |

---

## 推奨開発フロー

```
STEP 1: Claudeで仕様を議論・決定
         ↓
STEP 2: Claudeで仕様書（specification.md）の変更差分を作成
         ↓
STEP 3: Cursorで仕様書を更新（Claudeの差分を適用）
         ↓
STEP 4: Claudeで「Cursor作業指示プロンプト」を生成
         ↓
STEP 5: CursorにSTEP4のプロンプト + 仕様書を渡してコード修正
         ↓
STEP 6: 動作確認 → git push → GitHub Pages反映
```

---

## Cursorへの作業指示プロンプト テンプレート

```
## 作業指示

### 参照ドキュメント
- docs/specification.md（仕様書）
- docs/requirements.md（要件定義書）

### 修正対象ファイル
- （対象ファイルを明記）

### 変更内容
（変更内容を具体的に記述）

### 制約事項
- 仕様書に記載された定数・設定値は変更しないこと
- 既存の他タブの動作を壊さないこと
- i18n（ja/en 両対応）を維持すること
- バージョンを X.Y → X.(Y+1) に更新すること

### 完了条件
- （確認すべき動作を箇条書きで記載）
```

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
- GASシートのカラム定義
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
