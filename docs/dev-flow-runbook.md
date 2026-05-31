# Cursor 自動運用 失敗時ランブック

**最終更新**: 2026-05-31  
**前提**: Cursor 自動起動は Webhook 方式（`.github/workflows/trigger-cursor-on-ready.yml`）。Bridge 方式（`issue-to-automation-bridge.yml`）は **2026-05-30 廃止済み**。

関連: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) §6 / [CURSOR_AUTOMATION_ISSUE_TRIGGER.md](./setup/CURSOR_AUTOMATION_ISSUE_TRIGGER.md)

---

## 確認手順（まずここから）

1. **GitHub Actions タブ**を開き、該当 Issue 番号に関連する workflow が起動しているか確認する
2. 該当 Issue に **`ready-for-cursor` ラベル**が付いているか確認する
3. **Bridge PR**（`chore: auto bridge for issue #N` / `auto/issue-*` ブランチ）が新規作成されていないか確認する
4. PR 一覧で **`label:needs-review`** をフィルタし、Cursor 作成 PR の有無を確認する

---

## トラブル別対処法

### ケース1: ready-for-cursor を付与したが Cursor が起動しない

**確認手順**

1. GitHub Actions で **`Trigger Cursor on ready-for-cursor`** workflow が起動しているか
2. workflow が **失敗（赤）** していないか（Secrets 未設定・Webhook 400 等）
3. Cursor Automation 側の Run 履歴（Usage limit / resource_exhausted 等）

**対処法**

| 状況 | 対処 |
|---|---|
| workflow が起動していない | ラベル付与が正しく完了しているか確認。Issue が Open か確認 |
| workflow 成功だが Cursor が動かない | Cursor Automation の Webhook URL / Token を確認（`CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`） |
| Run summary に Usage limit | Cursor プラン・使用量上限。Automation モデルを Composer 2.5 等に変更、または Desktop 手動起動 |
| 上記で解決しない | [Cursor デスクトップでの手動起動](#cursor-デスクトップでの手動起動手順) |

---

### ケース2: Bridge PR（chore: auto bridge for issue #N）が作成される

**確認手順**

1. PR タイトル・ブランチ名に `auto/issue-` が含まれるか
2. `.github/workflows/issue-to-automation-bridge.yml` が **リポジトリに残存していないか**（廃止後は存在しないはず）

**対処法**

- Bridge workflow が残存している → Issue #253（Bridge 廃止）のマージ状況を確認
- ⚠️ **Bridge PR を手動マージしない**（実装が develop 経由にならない）
- 誤作成 PR は **Close** し、Issue URL を Cursor Desktop で手動起動する

---

### ケース3: Cursor が実装中に止まった

**確認手順**

1. 該当 Issue の **Comments** を確認（`【作業中断】` ブロックがあるか）
2. 関連 PR の **Comments** / Draft 状態を確認
3. Cursor Desktop の Agent セッションが終了していないか

**対処法**

| 状況 | 対処 |
|---|---|
| 【作業中断】コメントあり | コメントの「次に必要なこと」に従い Issue Comment で回答 → Desktop 再起動 |
| コメントなし | Desktop で状況確認。不明点は **Issue Comment** に書いてから再起動 |
| 仕様判断が必要 | Naoya が Issue 本文を更新 → Cursor に再取得を依頼 |

---

### ケース4: Cursor が間違った実装をして PR を作った

**確認手順**

1. PR diff と Issue 完了定義の差分を確認
2. PR の「未確認・懸念点」を確認

**対処法**

1. PR を **Close** する（**マージしない**）
2. Issue Comment に「以下の内容で修正してほしい」と具体的に記載
3. 修正依頼形式: `修正依頼:` / `要修正:` / `change request:`（`approval.yml` が検知）
4. または Cursor Desktop で Issue URL を渡して再実装

---

### ケース5: Cursor が PR を作ったが内容が不完全（[WIP]）

**確認手順**

1. PR 本文の「未確認・懸念点」セクション
2. Issue 本文の完了定義チェックリストとの照合

**対処法**

- 回答が必要 → **PR Comment** または **Issue Comment** に記載
- マージ判断: 完了定義を **すべて** 満たしているか Naoya が確認してから Merge
- `ok` / `lgtm` / ✅ で承認 → `approval.yml` が自動マージ（設定時）

---

### ケース6: Webhook workflow は成功するが Cursor Run が即失敗する

**確認手順**

1. Cursor Automation Run の summary / エラーメッセージ
2. `resource_exhausted` / `usage limit` の有無

**対処法**

- Usage limit → 課金サイクルリセット待ち、または Desktop 手動起動
- Webhook 400 → Automation 設定（Tools 有効化: Open pull request 等）を確認

---

## Cursor デスクトップでの手動起動手順

1. Cursor デスクトップアプリを開く
2. 該当 Issue の URL をコピーする（例: `https://github.com/nkhippo/ThinkGrindAi/issues/270`）
3. Cursor に以下を伝える:

```
以下の Issue を実装してください：
<Issue URL>

base ブランチは develop です。
```

4. 実装完了後、PR URL を Naoya に共有する

---

## リリース（develop → main）前チェック

PR 作成前に以下を実行する：

```bash
# main だけが持つコミットを確認（0 件なら安全）
git log --oneline origin/develop..origin/main

# CLAUDE.md の差分を確認
git diff origin/main...origin/develop -- CLAUDE.md .cursor/rules/dev-flow.mdc
```

コミットや差分がある場合：

1. `git checkout develop && git pull origin develop`
2. `git merge origin/main`
3. コンフリクトがあれば develop 側を正として解消
4. `git push origin develop`
5. 改めてリリース PR を作成する

詳細ルールは `CLAUDE.md`「develop → main リリースルール」を参照。

---

## PR マージ後のブランチ後片付け

- リポジトリ設定 **「Automatically delete head branches」** を有効化済み（2026-05-30）
- PR マージ後、head ブランチ（`docs/issue-*` / `chore/*` / `feature/*` 等）は **自動削除**される
- `main` / `develop` は対象外
- 旧 Bridge 時代の `auto/issue-*` ブランチは **2026-05-30 時点でリモートに 0 件**（整理済み）

手動削除が必要な場合:

```bash
gh api -X DELETE "repos/nkhippo/ThinkGrindAi/git/refs/heads/<branch-name>"
```

---

## エスカレーション（Claude への相談）

上記で解決しない場合:

1. 「ThinkGrindAi / サービス相談」Project に以下を記載
   - 症状
   - 再現手順
   - 試した対処（Actions ログ URL、Issue / PR URL）
2. Claude Chat に状況を共有して相談する
