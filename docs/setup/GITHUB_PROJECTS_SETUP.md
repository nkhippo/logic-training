# GitHub Projects Setup Guide

**最終更新**: 2025-01-24

---

## 概要

GitHub Projects Board「Development Pipeline」を以下の仕様で構築します。

```
Project: Development Pipeline
├── Backlog（優先度未決定）
├── Ready（要件確定・実装待機）
├── In Progress（実装中）
├── In Review（レビュー中）
└── Done（完了）
```

---

## セットアップ手順

### Step 1: GitHub Projects を有効化

1. リポジトリ `thinkgrindai` の **Projects** タブを開く
2. **New project** をクリック
3. 名前: `Development Pipeline`
4. Template: `Table` を選択
5. Create

### Step 2: Column を作成

リポジトリの Projects で以下の Column を作成:

| Column | 説明 | 自動化 |
|--------|------|--------|
| **Backlog** | Issue が自動追加される。優先度が未決定の状態 | Issue 作成時に自動追加 |
| **Ready** | 要件が確定し、Cursor の実装を待っている状態 | Label "Ready for Cursor" 付与時に移動 |
| **In Progress** | Cursor が実装中。PR が作成された状態 | PR オープン時に移動 |
| **In Review** | PR がレビュー中。Naoya が確認中 | PR オープン時から |
| **Done** | PR がマージされ、完了した状態 | PR マージ時に自動移動 |

### Step 3: ステータスのカスタムフィールドを定義

各 Column に以下のカスタム設定を行う:

```yaml
Backlog:
  color: gray
  description: "優先度未決定。Naoya が優先度を付けるまで待機"
  icon: 📋

Ready:
  color: blue
  description: "要件確定済。Cursor の実装を待機中"
  icon: 🔵

In Progress:
  color: yellow
  description: "実装中。PR が作成されている"
  icon: ⚙️

In Review:
  color: orange
  description: "レビュー中。Naoya / Claude が確認中"
  icon: 👀

Done:
  color: green
  description: "完了。PR がマージされた"
  icon: ✅
```

### Step 4: GitHub Actions で自動化

`.github/workflows/` に以下のワークフローを作成:

#### `auto-project-backlog.yml`（Issue 作成時に Backlog へ）

```yaml
name: Auto-add Issue to Backlog

on:
  issues:
    types: [opened]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const project = await github.rest.projects.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: "open"
            });
            
            const devProject = project.data.find(p => p.name === "Development Pipeline");
            
            if (devProject) {
              await github.rest.projects.createCard({
                project_id: devProject.id,
                content_type: "Issue",
                content_id: context.issue.id
              });
            }
```

#### `auto-project-ready.yml`（Label "Ready for Cursor" → Ready へ）

```yaml
name: Move to Ready

on:
  issues:
    types: [labeled]

jobs:
  move-to-ready:
    runs-on: ubuntu-latest
    if: github.event.label.name == 'Ready for Cursor'
    steps:
      - uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            # Project API v2 を使用して、Issue を Ready Column に移動
            const query = `
              query {
                repository(owner: "${{ github.repository_owner }}", name: "${{ github.event.repository.name }}") {
                  projectsV2(first: 1, query: "Development Pipeline") {
                    nodes {
                      id
                      fields(first: 20) {
                        nodes {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            `;
            # 詳細実装は GitHub Actions の GraphQL 連携参照
```

---

## Labels 定義

### 適用ルール

Issue を作成時に、以下のラベルを複数付与します:

```
Type labels:
- 🐛 bug
- 🔧 chore
- ✨ feature
- 📚 docs
- ♻️ refactor

Priority labels:
- 🚨 critical (対応時間: 1時間以内)
- ⚡ high (対応時間: 当日)
- 📌 medium (対応時間: 1-2日)
- 💤 low (対応時間: 1週間以内)

Status labels:
- 📋 backlog (Backlog Column)
- 🔵 ready-for-cursor (Ready Column へ移動)
- ⚙️ in-progress (In Progress Column)
- 👀 in-review (In Review Column)
- ✅ done (Done Column)

Area labels:
- 📖 logic-training
- 🧠 thinking-training
- ⚙️ gas-script
- 📄 documentation
- 🎨 design
- 🔒 security
- 🚀 infrastructure
```

### Label 作成コマンド

GitHub CLI を使う場合:

```bash
gh label create "bug" --color "d73a4a" --description "バグ報告"
gh label create "chore" --color "a2eeef" --description "軽微な変更・リファクタリング"
gh label create "feature" --color "a2eeef" --description "新機能・大型変更"
gh label create "docs" --color "0075ca" --description "ドキュメント更新"
gh label create "refactor" --color "fbca04" --description "コードリファクタリング"

gh label create "critical" --color "ff0000" --description "緊急対応（1時間以内）"
gh label create "high" --color "ff6600" --description "高優先度（当日）"
gh label create "medium" --color "ffcc00" --description "中優先度（1-2日）"
gh label create "low" --color "cccccc" --description "低優先度（1週間以内）"

gh label create "ready-for-cursor" --color "0075ca" --description "Cursor に実装指示待ち"
gh label create "in-progress" --color "ffc107" --description "実装中"

gh label create "logic-training" --color "28a745" --description "Logic Training タブ関連"
gh label create "thinking-training" --color "6f42c1" --description "Thinking Training タブ関連"
gh label create "gas-script" --color "ff7700" --description "GAS・Google Sheets 関連"
```

---

## Issue テンプレ

### `.github/ISSUE_TEMPLATE/bug.md`

```markdown
---
name: 🐛 Bug Report
about: バグを報告する
title: "【Bug】"
labels: ["bug"]
---

## 症状
（どんな状況で起こったか、期待される動作と実際の動作を記入）

## 再現手順
1. 〇〇タブを開く
2. △△を選択
3. □□をクリック

## 期待される動作
（何が起こるべきだったか）

## 実際の動作
（何が起こったか）

## 環境
- ブラウザ: Chrome / Firefox / Safari
- デバイス: MacBook / Windows / iPhone
- URL: https://...

## スクリーンショット
（あれば）

## 優先度
- [ ] 🚨 Critical（使用不可）
- [ ] ⚡ High（利用に支障あり）
- [ ] 📌 Medium（動作するが改善余地あり）
- [ ] 💤 Low（UIなど）

## 関連コード
（あれば）
```

### `.github/ISSUE_TEMPLATE/chore.md`

```markdown
---
name: 🔧 Chore
about: 軽微な変更・リファクタリング
title: "【Chore】"
labels: ["chore"]
---

## 目的
（なぜこの変更をするのか）

## 変更内容
- 〇〇を△△に変更
- □□をリファクタリング
- ◎◎のパフォーマンス改善

## 影響範囲
（修正対象ファイル）
- `js/XX-xxx.js`
- `gas-script-v3.js`

## テスト方法
（どのようにテストしたか）
- 〇〇タブで動作確認

## 優先度
- [ ] ⚡ High
- [ ] 📌 Medium
- [ ] 💤 Low
```

### `.github/ISSUE_TEMPLATE/feature.md`

```markdown
---
name: ✨ Feature Request
about: 新機能・大型の仕様変更
title: "【Feature】"
labels: ["feature"]
---

## 背景
（ユーザーの声、なぜこの機能が必要か）

## 要件確定シート ID
（Google Sheets の ID）
例: REQ-001

## 関連ドキュメント
- [ ] 要件定義書: `docs/requirements-XX.md`
- [ ] 仕様書: `docs/specification-XX.md`
- [ ] Cursor指示書: `docs/cursor-instructions/cursor_instruction_REQ-XXX.md`

## 実装範囲
- 〇〇機能を追加
- △△のロジックを変更
- □□のUIを改善

## 完了定義
- [ ] 要件 A を実装
- [ ] 要件 B を実装
- [ ] テスト完了
- [ ] ドキュメント更新
- [ ] Cursor による実装確認

## 優先度
- [ ] ⚡ High
- [ ] 📌 Medium
- [ ] 💤 Low

## 備考
（その他の情報）
```

---

## 運用手順

### 日次（毎日）

- [ ] GitHub Projects Board を確認
  - In Progress にタスクが詰まっていないか
  - Done に新しいタスクが追加されたか
- [ ] 新規 Issue が上がっていないか確認
- [ ] PR のレビューが必要か確認

### 週次（毎週月曜）

Naoya が実施:
- [ ] Backlog の優先度付けを更新
- [ ] 今週の目標完了数を確認（目標: > 5）
- [ ] 停滞しているタスクがないか確認

### 月次（毎月末）

Naoya が実施:
- [ ] 今月のベロシティ（完了数）を集計
- [ ] 次月の目標を設定
- [ ] DEVELOPMENT_POLICY に問題がないか確認

---

## トラブルシューティング

### Q: Issue が Backlog に追加されない
A: GitHub Actions のワークフローが有効化されているか確認してください。

### Q: PR をマージしたのに Done に移動しない
A: GitHub Actions の設定を確認してください。もしくは手動で Done Column に移動できます。

### Q: Label を複数つけたい
A: GitHub の Issue page で複数選択できます。Ctrl + クリック（Mac: Cmd + クリック）で複数選択。

### Q: Project Board で Column 間の Issue ドラッグが効かない
A: ブラウザをリロードしてみてください。キャッシュが原因の場合があります。

---

## 参考

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub Actions - Automating your workflow](https://docs.github.com/en/actions)
- [GitHub Issues Best Practices](https://guides.github.com/features/issues/)
