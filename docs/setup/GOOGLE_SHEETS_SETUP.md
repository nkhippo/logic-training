# Google Sheets - 要件確定シート 運用ガイド

**最終更新**: 2025-01-24

---

## 概要

Google Sheets に以下 3 つのシートを作成します：

1. **要件確定シート** ← 要件整理から完了まで を一元管理
2. **タスク進捗シート** ← GitHub Issues を一覧表示（リアルタイム）
3. **アーカイブシート** ← 完了したタスクを記録（履歴管理）

---

## 1. 要件確定シート

### 目的
Naoya と Claude が「何をやるのか」を決めたタスクを記録。仕様確定までのプロセスを管理する。

### 列定義

| 列 | 名前 | 型 | 説明 | 例 |
|----|------|-----|------|-----|
| A | ID | 文字列 | 要件の一意識別子 | REQ-001 |
| B | 案件名 | 文字列 | わかりやすい名前 | Thinking Training 実装 |
| C | 検討開始日 | 日付 | アイデア出しを開始した日 | 2025-01-10 |
| D | ステータス | 選択肢 | 進行状況（後述） | 検討中 / 確定 / 指示書作成済 / 実装中 / 完了 |
| E | 優先度 | 選択肢 | 実装優先度 | 高 / 中 / 低 |
| F | Obsidian リンク | URL | Obsidian の記念ノートへのリンク | `obsidian://vault/ideas/REQ-001.md` |
| G | 要件定義書 | URL | `docs/requirements-XX.md` へのリンク | `https://github.com/.../docs/requirements-thinking.md` |
| H | 仕様書 | URL | `docs/specification-XX.md` へのリンク | `https://github.com/.../docs/specification-thinking.md` |
| I | Cursor指示書 | URL | `docs/cursor-instructions/...` へのリンク | `https://github.com/.../cursor_instruction_thinking_v2.md` |
| J | 関連GitHub Issue | 文字列 | GitHub Issue 番号（複数可） | #T001, #T002 |
| K | 担当者 | 選択肢 | 主担当（初期は Cursor で固定） | Claude / Cursor / Naoya |
| L | 確定日 | 日付 | 要件が「確定」になった日 | 2025-01-15 |
| M | 予定開始日 | 日付 | 実装予定開始日 | 2025-01-18 |
| N | 予定完了日 | 日付 | 実装予定完了日 | 2025-02-28 |
| O | 実完了日 | 日付 | 実装完了日（自動入力）| 2025-02-20 |
| P | 備考 | 文字列 | 特記事項・制約 | 「GAS 再デプロイが必要」等 |

### ステータス遷移図

```
未着手
  ↓
検討中 ← Naoya がアイデアを出し、Obsidian に記入
  ↓
確定 ← Naoya と Claude が要件を確定
  ↓
指示書作成済 ← Claude が Cursor 指示書を作成
  ↓
実装中 ← Cursor が実装、GitHub Issue + PR を作成
  ↓
完了 ← PR マージ、GitHub Issue を Close
  ↓
アーカイブシート へ移行
```

### 運用フロー

#### 1. アイデア出し（Naoya）

```
1. Obsidian に新規ファイルを作成: `ideas/REQ-001-thinking.md`
2. アイデア、背景、検討内容を記入
3. 要件確定シートに新規行を追加:
   - ID: REQ-001
   - 案件名: Thinking Training 実装
   - 検討開始日: 2025-01-10
   - ステータス: 検討中
   - Obsidian リンク: obsidian://vault/ideas/REQ-001-thinking.md
```

#### 2. 要件確定（Naoya & Claude）

```
1. Obsidian の REQ-001-thinking.md に Claude と議論ログを記入
2. 要件が確定したら「要件確定シート」のステータスを「確定」に変更
3. 確定日を記入
```

#### 3. Cursor 指示書作成（Claude）

```
1. Claude が以下を作成:
   - `docs/requirements-thinking.md`（要件定義書）
   - `docs/specification-thinking.md`（仕様書）
   - `docs/cursor-instructions/cursor_instruction_thinking.md`（指示書）
2. GitHub で commit
3. 要件確定シートに URL をリンク
4. ステータスを「指示書作成済」に変更
```

#### 4. GitHub Issue 作成（Cursor or Naoya）

```
1. GitHub Issue を作成（テンプレ: feature.md）
2. Issue description に以下をリンク:
   - 要件定義書 URL
   - 仕様書 URL
   - Cursor 指示書 URL
3. 要件確定シートの「関連GitHub Issue」に Issue 番号を記入 (#T001)
4. ステータスを「実装中」に変更
```

#### 5. 完了（PR マージ後）

```
1. PR がマージされたら、GitHub Issue を Close
2. 要件確定シートのステータスを「完了」に変更
3. 実完了日を記入
4. アーカイブシート に移動（またはフィルターで隠す）
```

---

## 2. タスク進捗シート

### 目的
GitHub Issues をリアルタイムで一覧表示（軽微タスク用）

### 列定義

| 列 | 名前 | 説明 |
|----|------|------|
| A | Issue # | GitHub Issue 番号（#T001） |
| B | タイトル | Issue のタイトル |
| C | タイプ | bug / chore / feature |
| D | 優先度 | critical / high / medium / low |
| E | ステータス | Backlog / Ready / In Progress / Done |
| F | 担当 | Cursor / Naoya / Claude |
| G | 作成日 | Issue 作成日 |
| H | URL | GitHub Issue へのリンク |

### 手動更新 vs 自動更新

**現状**:
- GitHub CLI や API で自動取得することも可能だが、初期段階では **手動更新** でいい
- 週 1 回（月曜朝）に Naoya が GitHub Projects から転記

**将来的**:
- Google Sheets API + GitHub API で自動同期（Python スクリプト化）

---

## 3. アーカイブシート

### 目的
完了したタスクを履歴として保管

### 列定義

要件確定シートと同じ列を持つ。

### 操作方法

```
1. 要件確定シート で ステータス = 「完了」
2. その行全体をコピー
3. アーカイブシート の最下行に貼り付け
4. 要件確定シート から削除
```

---

## Google Sheets URL の設定

### リポジトリで URL を管理

`docs/TASK_TRACKER_URL.md` を作成:

```markdown
# Task Tracker URL

以下のリンクから、タスク管理シートにアクセスしてください。

- **要件確定シート**: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={SHEET_ID_1}
- **タスク進捗シート**: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={SHEET_ID_2}
- **アーカイブシート**: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={SHEET_ID_3}

（URL は Naoya が共有時に記入）
```

---

## 運用 Tips

### 1. フィルター機能を活用

各シートの先頭行を「フリーズ」し、フィルターを有効化:

```
データ → フィルタを作成
→ 各列の ▼ をクリックで条件設定
```

例：「ステータス = 検討中」「優先度 = 高」

### 2. 条件付き書式で色付け

`D列（ステータス）` に条件付き書式を適用:

```
検討中 → 灰色
確定 → 青
指示書作成済 → 緑
実装中 → オレンジ
完了 → チェックマーク
```

### 3. ピボットテーブルで統計

「ステータス別の件数」「優先度別の件数」を自動集計:

```
データ → ピボットテーブルを作成
→ 行: ステータス / 列: 優先度 / 値: COUNTA
```

### 4. Google Apps Script で自動処理

将来的に以下を自動化:

- GitHub Issues から自動取得
- PR マージ時に自動で「完了」に変更
- 週報の自動生成

```javascript
// 例: GitHub API を呼び出して Issue 取得
function syncGitHubIssues() {
  const issues = // GitHub API 呼び出し
  const sheet = SpreadsheetApp.getActiveSheet();
  // シートに追記
}
```

---

## セットアップ手順

### Step 1: Google Sheets を新規作成

1. Google Sheets を開く
2. **新規スプレッドシスト** をクリック
3. 名前: `thinkgrindai - Task Tracker`

### Step 2: シートを 3 つ作成

1. 最初のシート名を「要件確定シート」に変更
2. 新規シートを 2 つ追加:
   - 「タスク進捗シート」
   - 「アーカイブシート」

### Step 3: 列ヘッダーを記入

各シートで、上記の「列定義」に従ってヘッダーを記入。

### Step 4: 条件付き書式・フィルターを設定

```
フォーマット → 条件付き書式
→ ステータス列に色分けを設定
```

### Step 5: リンクを GitHub に記入

`docs/TASK_TRACKER_URL.md` に Sheets URL を記入。

---

## 関連ドキュメント

- 🔗 [DEVELOPMENT_POLICY.md](./DEVELOPMENT_POLICY.md) - 開発ポリシー
- 🔗 [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - プロジェクト背景
- 🔗 [GITHUB_PROJECTS_SETUP.md](./GITHUB_PROJECTS_SETUP.md) - GitHub Projects 設定
