# 🚀 thinkgrindai 開発体制セットアップガイド

**バージョン**: 1.0  
**最終更新**: 2025-01-24  
**対象者**: Naoya（統括）・Claude（要件・指示書）・Cursor（実装）

---

## 目次

1. [全体フロー図](#全体フロー図)
2. [セットアップ手順（優先順）](#セットアップ手順優先順)
3. [日々の運用](#日々の運用)
4. [事例で学ぶ](#事例で学ぶ)
5. [トラブルシューティング](#トラブルシューティング)
6. [ドキュメント一覧](#ドキュメント一覧)

---

## 全体フロー図

### タスク流れ全体

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: 思考（Naoya + Claude の議論）                          │
│                                                                 │
│  Naoya が Obsidian にアイデアを記入                              │
│    ↓                                                             │
│  Claude に相談・議論（ログを Obsidian に保存）                  │
│    ↓                                                             │
│  要件確定（Google Sheets「要件確定シート」に記入）              │
│    ↓                                                             │
│  ステータス: 検討中 → 確定 → 指示書作成済                       │
└──────────────────┬────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: 仕様化（Claude が Cursor 指示書を作成）                │
│                                                                 │
│  Claude が以下を作成:                                           │
│  - docs/requirements-XX.md（要件定義書）                        │
│  - docs/specification-XX.md（仕様書）                           │
│  - docs/cursor-instructions/cursor_instruction_XX.md（指示書） │
│    ↓                                                             │
│  GitHub に commit・push                                         │
│    ↓                                                             │
│  Google Sheets に URL をリンク                                  │
│    ↓                                                             │
│  ステータス: 指示書作成済                                       │
└──────────────────┬────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: 実装（GitHub Issue + Cursor）                         │
│                                                                 │
│  GitHub Issue 作成（テンプレ: feature.md / bug.md）            │
│    ↓                                                             │
│  GitHub Projects Backlog → Ready へ                             │
│  （Label: "Ready for Cursor" を付与）                          │
│    ↓                                                             │
│  Cursor に URL を渡す（実装指示）                               │
│    ↓                                                             │
│  Cursor が実装・PR 作成                                          │
│    ↓                                                             │
│  GitHub Projects: In Progress → In Review                       │
│    ↓                                                             │
│  ステータス: 実装中                                             │
└──────────────────┬────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: 検証・リリース（Naoya）                                │
│                                                                 │
│  Naoya が PR をテスト・確認                                      │
│    ↓                                                             │
│  バグなし → 指示書通り → Merge 承認                              │
│    ↓                                                             │
│  GitHub Projects: Done へ自動移動                               │
│    ↓                                                             │
│  Google Sheets: ステータス = 完了 / アーカイブシート へ          │
│    ↓                                                             │
│  完了                                                            │
└─────────────────────────────────────────────────────────────────┘
```

### ツール間の連携

```
Obsidian (思考)
    ↓ (記入・議論ログ保存)
Google Sheets (意思決定)
    ↓ (要件確定)
GitHub docs (ドキュメント)
    ↓ (指示書 push)
GitHub Issues / Projects (実行)
    ↓ (Issue 作成)
Cursor (実装)
    ↓ (PR 作成)
GitHub PR (レビュー)
    ↓ (Merge)
Main branch (完了)
    ↓
Google Sheets (アーカイブ)
```

---

## セットアップ手順（優先順）

### 【優先度 1】GitHub Projects セットアップ（2 時間）

**なぜ?**: タスク管理の基盤。最初に整える。

#### 手順

1. **リポジトリ設定**:
   - Settings → Projects → Enable Projects

2. **Board を作成**:
   - New project → "Development Pipeline"
   - Template: Table

3. **Column を作成**:
   - Backlog, Ready, In Progress, In Review, Done

4. **Label を作成**:
   - `GITHUB_PROJECTS_SETUP.md` の「Labels 定義」を参照
   - GitHub CLI: `gh label create "bug" --color "d73a4a"`

5. **Issue テンプレを作成**:
   - `.github/ISSUE_TEMPLATE/bug.md`
   - `.github/ISSUE_TEMPLATE/chore.md`
   - `.github/ISSUE_TEMPLATE/feature.md`

6. **確認**:
   - 新しく Issue を作成 → Backlog に自動追加されるか確認

**ドキュメント**: `GITHUB_PROJECTS_SETUP.md`

---

### 【優先度 2】Google Sheets「要件確定シート」セットアップ（1 時間）

**なぜ?**: 要件確定の意思決定ログ。全チームで共有。

#### 手順

1. **Google Sheets 作成**:
   - 新規スプレッドシスト
   - 名前: `thinkgrindai - Task Tracker`

2. **3 つのシートを作成**:
   - 「要件確定シート」
   - 「タスク進捗シート」
   - 「アーカイブシート」

3. **列を定義**:
   - `GOOGLE_SHEETS_SETUP.md` の「列定義」を参照

4. **共有設定**:
   - Share → 編集可能（Naoya・Claude・Cursor）
   - URL を `docs/TASK_TRACKER_URL.md` に記入

5. **テスト**:
   - 試しに 1 つ行を追加 → Google Sheets リンク動作確認

**ドキュメント**: `GOOGLE_SHEETS_SETUP.md`

---

### 【優先度 3】Obsidian Vault セットアップ（1 時間）

**なぜ?**: Naoya の思考の可視化。個人の思考ツール。

#### 手順

1. **Obsidian インストール** (未インストール時):
   - https://obsidian.md/ からダウンロード
   - MacBook にインストール

2. **Vault を作成**:
   - 新規 Vault: `thinkgrindai-dev`
   - 場所: `~/Documents/Obsidian/thinkgrindai-dev` など

3. **フォルダ構造を作成**:
   - `ideas/`, `claude-conversations/`, `project-status/`, 他
   - `OBSIDIAN_SETUP.md` の「フォルダ説明」を参照

4. **テンプレを作成**:
   - `ideas/template.md` に上記の REQ テンプレを記入

5. **プラグインをインストール** (オプション):
   - Templater（新規ファイル生成）
   - Dataview（動的テーブル）
   - Calendar（日付ナビゲーション）

6. **テスト**:
   - 新規アイデアファイルを 1 つ作成 → テンプレが機能するか確認

**ドキュメント**: `OBSIDIAN_SETUP.md`

---

### 【優先度 4】GitHub ドキュメント格納（1 時間）

**なぜ?**: Claude・Cursor がドキュメントを参照する必要があるため。

#### 手順

1. **docs/ 直下に以下を配置**:
   ```
   docs/
   ├── PROJECT_CONTEXT.md
   ├── DEVELOPMENT_POLICY.md
   ├── TASK_TRACKER_URL.md
   ├── requirements-*.md
   ├── specification-*.md
   ├── cursor-instructions/
   │   └── cursor_instruction_*.md
   └── ...既存ファイル
   ```

2. **README.md を更新**:
   - リンクセクションに以下を追加:
   ```markdown
   ## 📋 タスク管理・開発フロー
   - [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) - ビジョン・背景
   - [DEVELOPMENT_POLICY.md](./docs/DEVELOPMENT_POLICY.md) - 開発ルール
   - [GitHub Projects](./docs/GITHUB_PROJECTS_SETUP.md) - タスク管理
   - [Google Sheets](./docs/GOOGLE_SHEETS_SETUP.md) - 要件管理
   - [Obsidian](./docs/OBSIDIAN_SETUP.md) - 思考管理
   ```

3. **commit・push**:
   ```bash
   git add docs/
   git commit -m "docs: add task management & development policy"
   git push
   ```

4. **確認**:
   - GitHub で README が正しく表示されるか確認
   - 各ドキュメントが閲覧可能か確認

**ドキュメント**: すべて

---

### 【優先度 5】GitHub Actions 自動化（2 時間・オプション）

**なぜ?**: 手作業を減らす。ただし初期段階では不須（手動運用でも OK）

#### 手順

1. `.github/workflows/auto-project-backlog.yml` を作成
2. `.github/workflows/auto-project-ready.yml` を作成
3. `.github/workflows/auto-project-merge.yml` を作成

**参考**: `GITHUB_PROJECTS_SETUP.md` の「GitHub Actions で自動化」セクション

---

### 実装順序（推奨）

```
Day 1:
□ GitHub Projects セットアップ（2h）
□ Google Sheets セットアップ（1h）
□ Obsidian セットアップ（1h）

Day 2:
□ ドキュメントを GitHub に配置（1h）
□ README 更新・確認（30min）
□ テスト運用（軽微 Issue で試す）（1h）

Day 3:
□ GitHub Actions 自動化（オプション）（2h）
□ チーム全体に説明・トレーニング
□ 本格運用開始
```

---

## 日々の運用

### Naoya（毎日）

#### 朝（10 分）

1. GitHub Projects Board を確認
   - In Progress に詰まりがないか
   - Critical Issue がないか

2. Google Sheets「要件確定シート」を確認
   - 「実装中」のタスクの進捗
   - 「Ready」待機中のタスクがないか

#### 夜（30 分）

1. バグ・改善点を見つけたら、即座に GitHub Issue 作成
   - テンプレ: bug.md / chore.md
   - Label を付与

2. PR が上がっていたら確認
   - コードレビュー
   - テスト
   - Merge 判定

#### 週 1 回（月曜朝・30 分）

1. Backlog を確認
   - 優先度を付け直す
   - 不要なタスクはクローズ

2. 先週の完了数を集計
   - 目標: > 5 タスク/週
   - 遅延があれば次週の優先度を上げる

3. Obsidian `weekly-status.md` を更新

---

### Claude（毎日）

#### タスク出現時（30 分～2 時間）

1. **軽微タスク** の場合:
   - GitHub Issue を確認
   - 不明な点があれば Issue にコメント

2. **中規模タスク** の場合:
   - Obsidian のリンクを確認（Naoya が用意）
   - Naoya と議論ログを記入
   - 要件確定シートで「確定」を確認

3. **大規模タスク** の場合:
   - 要件定義書（requirements-XX.md）を作成
   - 仕様書（specification-XX.md）を作成
   - Cursor 指示書（cursor_instruction_XX.md）を作成
   - GitHub に commit・push
   - Google Sheets に URL をリンク

---

### Cursor（毎日）

#### 実装時（1～4 時間/タスク）

1. GitHub Issue URL を確認
2. Issue description から以下を確認:
   - 要件
   - テスト方法
   - Cursor 指示書（ある場合）

3. コード実装

4. PR を作成
   - Description に「実装内容」「テスト方法」「関連 Issue」を記入

5. Naoya のレビューを待機

---

## 事例で学ぶ

### Case 1: 軽微バグ（1 時間以内）

**状況**: 穴埋めタブで、解答判定が動作しない

**フロー**:

```
Naoya:
1. GitHub で Issue 作成
   - テンプレ: bug.md
   - タイトル: 【Bug】穴埋めタブで解答判定が動作しない
   - Label: bug, high, logic-training

2. GitHub Projects: 自動で Backlog に追加

Claude:
（通常、軽微バグは Claude の介入不要）

Cursor:
1. Issue #123 を確認
2. 再現手順を試す
3. js/01-fill.js を確認 → バグ箇所を特定
4. 修正
5. PR 作成 → "Fixes #123"

Naoya:
1. PR をテスト
2. 動作確認 OK
3. Merge
4. GitHub Projects: Done へ自動移動
5. 完了
```

**所要時間**: 15～30 分

---

### Case 2: 中規模タスク（2～3 日検討 + 1～3 日実装）

**状況**: 思考トレーニング（REQ-001）の実装

**フロー**:

```
Naoya:
1. Obsidian に ideas/REQ-001-thinking.md を作成
2. アイデア・背景を記入

Claude:
1. Obsidian のリンクをもらう
2. Naoya と議論（会話ログを記入）
3. 要件を確定
4. Google Sheets「要件確定シート」に記入
   - ID: REQ-001
   - ステータス: 検討中 → 確定
   - 確定日を記入

Claude:
1. 要件定義書を作成: docs/requirements-thinking.md
2. 仕様書を作成: docs/specification-thinking.md
3. Cursor 指示書を作成: docs/cursor-instructions/cursor_instruction_thinking_v2.md
4. GitHub に commit・push
5. Google Sheets に URL をリンク
6. ステータス: 指示書作成済

Naoya:
1. GitHub Issue を作成
   - テンプレ: feature.md
   - 関連ドキュメント URL を記入
   - Label: feature, high, thinking-training, ready-for-cursor

Cursor:
1. Issue & 指示書を確認
2. 実装開始
   - js/17-thinking.js（ロジック）
   - js/18-thinking-domain.js（ドメイン）
   - gas-script-v3.js（GAS 拡張）
3. PR 作成 → "Implements #T001"

Naoya:
1. PR をテスト（全機能確認）
2. ドキュメント確認
3. Issue 「完了定義」をチェック
4. OK → Merge
5. Google Sheets: ステータス = 完了

完了
```

**所要時間**: 3～5 日（検討 2～3 日 + 実装 1～3 日）

---

### Case 3: GitHub Issues からの直接対応（緊急）

**状況**: ユーザー（実際のテスター）から「採点結果が表示されない」と報告

**フロー**:

```
Naoya:
1. 【🚨Critical】Issue を即座に作成
2. Label: critical, bug, high priority
3. Cursor に通知（Slack or direct message）

Cursor:
1. Issue を即座に確認
2. 再現・バグ箇所を特定
3. 修正
4. PR を即座に作成

Naoya:
1. PR を即座にテスト
2. 動作確認 OK
3. Merge（通常より簡潔なレビューでも OK）
4. 完了

対応時間: 1 時間以内
```

---

## トラブルシューティング

### Q1: GitHub Issue が Backlog に追加されない

**原因**: GitHub Actions のワークフローが有効化されていない

**解決**:
```bash
# .github/workflows/auto-project-backlog.yml が存在するか確認
ls -la .github/workflows/

# 存在しない場合は GITHUB_PROJECTS_SETUP.md を参照して作成
```

### Q2: Google Sheets へのアクセスが制限されている

**原因**: 共有権限がない

**解決**:
1. Naoya が Google Sheets を開く
2. Share → 編集可能に変更
3. Claude・Cursor のメールアドレスを追加

### Q3: Obsidian のファイルが GitHub に push されない

**原因**: Git が Vault を認識していない

**解決**:
```bash
cd ~/Obsidian/thinkgrindai-dev
git init
git add -A
git commit -m "Initial commit"
git push origin main
```

### Q4: PR がマージされたのに GitHub Projects で Done に移動しない

**原因**: GitHub Actions の自動化が不完全

**解決**: 手動で Done Column に移動（ドラッグ&ドロップ）

### Q5: Cursor が指示書を見つからないと言っている

**原因**: GitHub 上での URL が正しくない

**解決**:
1. GitHub docs ページで URL をコピー
2. 「Raw」ボタンで raw ファイル URL を取得
3. Cursor に raw URL を貼る（Cursor はこちらの方が読みやすい）

---

## ドキュメント一覧

### コア（プロジェクト全体）

| ドキュメント | 位置 | 作成者 | 更新頻度 |
|-----------|------|--------|--------|
| **PROJECT_CONTEXT.md** | docs/ | Naoya | 月 1 回（Phase 変更時） |
| **DEVELOPMENT_POLICY.md** | docs/ | Naoya | 3 月に 1 回（ルール変更時） |
| **このファイル** | docs/ | Claude | 不定期 |

### セットアップ

| ドキュメント | 位置 | 作成者 | 対象 |
|-----------|------|--------|------|
| **GITHUB_PROJECTS_SETUP.md** | docs/ | Claude | GitHub Projects 設定 |
| **GOOGLE_SHEETS_SETUP.md** | docs/ | Claude | Google Sheets 設定 |
| **OBSIDIAN_SETUP.md** | docs/ | Claude | Obsidian Vault 設定 |

### 実装・仕様

| ドキュメント | 位置 | 作成者 | 更新頻度 |
|-----------|------|--------|--------|
| **requirements-logic.md** | docs/ | Claude | Phase 1 終了時 |
| **requirements-thinking.md** | docs/ | Claude | Phase 2 開始時 |
| **specification-logic.md** | docs/ | Claude | Phase 1 終了時 |
| **specification-thinking.md** | docs/ | Claude | Phase 2 開始時 |
| **cursor-instructions/\*.md** | docs/ | Claude | 機能ごと |
| **dev-flow.md** | docs/ | Claude | 不定期 |
| **gas-column-headers.md** | docs/ | Claude | GAS スキーマ変更時 |

### 外部（GitHub ではない）

| ツール | 位置 | 作成者 | 対象 |
|--------|------|--------|------|
| **Obsidian Vault** | ~/Obsidian/thinkgrindai-dev | Naoya | アイデア・議論 |
| **Google Sheets** | https://sheets.google.com/... | Naoya・Claude | 要件確定・進捗管理 |
| **GitHub Projects** | https://github.com/nkhippo/thinkgrindai/projects | 自動 | タスク進捗 |

---

## 次のステップ

1. ✅ すべてのセットアップ手順を完了
2. ✅ 軽微 Issue で試す（1～2 個）
3. ✅ 中規模タスクで本格運用開始
4. 📊 月 1 回、ドキュメント・フローをレビュー
5. 🔄 改善点があれば DEVELOPMENT_POLICY を更新

---

**質問・相談があればお知らせください。柔軟に調整します！**
