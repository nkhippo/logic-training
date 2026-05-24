# Getting Started — 開発環境セットアップ

thinkgrindai の開発を始めるための初期セットアップガイドです。

## 前提条件

以下がインストール済みであることを確認してください：

- Git
- Node.js（推奨: v16 以上）
- GitHub CLI（gh コマンド）（推奨）

## Step 1: リポジトリをクローン

```bash
git clone https://github.com/nkhippo/thinkgrindai.git
cd thinkgrindai
```

## Step 2: 開発ツールの確認

### Claude・Cursor を使う（推奨）

このプロジェクトは Claude と Cursor で開発しています。

- **Claude.ai Projects**（要件相談・指示書作成）
  - URL: https://claude.ai
  - プロジェクト名: 「Think Grind Ai」
  - こちらで新機能のアイデアを相談します

- **Cursor**（ソースコード実装）
  - URL: https://cursor.com
  - このリポジトリを Cursor で開きます

### 必要な設定

1. Cursor で `.cursor/rules/dev-flow.mdc` が認識されているか確認
   - Cursor の右下に「Rules」が表示されていれば OK

2. GitHub CLI の認証を確認
   ```bash
   gh auth status
   ```

## Step 3: ブラウザで動作確認

アプリは GitHub Pages でホストされています。

- **本番**: https://nkhippo.github.io/thinkgrindai/
- **ローカルテスト**: VS Code の Live Server 拡張機能を使う
  1. `index.html` を右クリック
  2. 「Live Server で開く」を選択

## Step 4: Google Sheets・Obsidian の確認

このプロジェクトは複数のツールを使用しています：

### Google Sheets（タスク管理）

- **要件確定シート**: https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/
- 実装予定のタスク・進捗を確認できます
- 編集権限が必要な場合は Naoya に連絡

### Obsidian（議論の流れ管理）

- **フォルダ構成**:
  - `ideas/` - 検討中のアイデア
  - `discussions/` - Claude との議論ログ
  - `confirmed-decisions/` - 確定した仕様
- Naoya の MacBook にローカル保存されています
- 議論の経緯を知りたい場合は Naoya に相談

## Step 5: 最初のアイデア・バグに取り組む

### 新機能を実装したい場合

1. [Development Flow](Development-Flow) ページを読む
2. Claude.ai Projects「Think Grind Ai」で新しいチャットを立てる
3. 「新しいアイデアがあります」と送信

### バグを修正したい場合

1. [Bug Fix Guide](Bug-Fix-Guide) ページを読む
2. GitHub Issues で `bug` ラベルの Issue を探す
3. 指示書を確認して実装

## トラブルシューティング

### Cursor が `.cursor/rules/dev-flow.mdc` を読まない場合

```bash
# Cursor を再起動
# または
rm -rf .cursor/.cursorignore
# Cursor を再度開く
```

### GitHub CLI（gh）がない場合

```bash
# macOS
brew install gh

# Ubuntu
sudo apt install gh

# Windows
choco install gh
```

### その他の問題

[FAQ](FAQ) を確認するか、Naoya に Slack で連絡してください。

---

## 次のステップ

- 新機能を実装したい → [Development Flow](Development-Flow)
- バグを修正したい → [Bug Fix Guide](Bug-Fix-Guide)
- プロジェクト全体を理解したい → [Service Overview](Service-Overview)
