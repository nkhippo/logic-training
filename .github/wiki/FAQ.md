# FAQ — よくある質問

## 開発について

### Q: アイデアはどこに報告したら良い？

A: Claude.ai Projects「Think Grind Ai」で新しいチャットを立てて、「新しいアイデアがあります」と送信してください。

Claude が自動でフローをガイドします。詳細は [Development Flow](Development-Flow) を参照

### Q: バグを見つけた。報告したい

A: GitHub Issues で 🐛 Bug Report テンプレを選んで Issue を作成してください。

詳細は [Bug Fix Guide](Bug-Fix-Guide) を参照

### Q: 実装の技術的な質問がある

A: Cursor に質問してください。または `.cursor/rules/dev-flow.mdc` に書かれた実装ルールを参照

### Q: 仕様や過去の決定について知りたい

A: [Specifications](Specifications) ページを読んでください。

詳細は Obsidian の `discussions/` フォルダ（Naoya が管理）

---

## ツールについて

### Q: Claude.ai Projects とは？

A: Claude とのチャット専用のプロジェクト管理ツールです。

このプロジェクトではフロー自動ガイド、ドキュメント共有、ネクストアクション提示に使用しています。

URL: https://claude.ai → Projects → 「Think Grind Ai」

### Q: Obsidian ってなに？

A: ローカルのノート管理ツール。このプロジェクトでは「議論の流れ」「アイデア」を管理しています。

Naoya の MacBook で管理。新規参入者が直接触る必要はありません。

### Q: Google Sheets のアクセスがない

A: Naoya に連絡して共有権限をもらってください。

### Q: Cursor（開発ツール）は何？

A: AI コーディングアシスタント。このプロジェクトではソースコード実装を担当しています。

URL: https://cursor.com

---

## 実装について

### Q: PR を作成するときに何を書けばいい？

A: PR テンプレに従ってください。最低限以下を記入：

```markdown
## 実装内容
- 〇〇を実装した

## テスト方法
- 〇〇タブで動作確認

## 関連 Issue
Fixes #T0XX
```

詳細は [DEVELOPMENT_POLICY.md](../docs/DEVELOPMENT_POLICY.md) を参照

### Q: 既存コードを修正してもいい？

A: 既存の `js/01-05.js` などへの変更は避けてください。

新機能は新規ファイル（例: `js/07-mece.js`）で実装してください。詳細は `.cursor/rules/dev-flow.mdc` を参照

### Q: テストはどこまでやればいい？

A: 最低限、Cursor 指示書の「テスト項目」をすべて確認してください。

詳細は各機能の指示書を参照

---

## トラブルシューティング

### Cursor が `.cursor/rules/dev-flow.mdc` を読まない

```bash
# Cursor を完全に再起動
# または環境キャッシュを削除して再起動
```

### GitHub CLI（gh）がインストールできない

macOS:
```bash
brew install gh
```

Ubuntu:
```bash
sudo apt install gh
```

Windows:
```bash
choco install gh
```

### Claude.ai Projects に接続できない

- ブラウザを更新
- キャッシュを削除
- 別ブラウザで試す

### PR が Merge できない

- GitHub の Branch protection rules を確認
- または Naoya に連絡

---

## 学習リソース

### 論理思考について知りたい

- [PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md) - フレームワーク詳細
- [Specifications](Specifications) - 各タブの設計思想

### Claude・Cursor の使い方について

- [CLAUDE.md](../CLAUDE.md) - 共通ルール
- [.cursor/rules/dev-flow.mdc](../.cursor/rules/dev-flow.mdc) - 実装ルール

### Git・GitHub について

- [GitHub Docs](https://docs.github.com/)

---

## さらに質問がある場合

1. 📖 このページをもう一度読む
2. 🔍 関連ページ（Development Flow / Bug Fix Guide など）を読む
3. 💬 Naoya に Slack / GitHub Issues で質問
4. 🤖 Claude.ai Projects で新チャット

質問は大歓迎です！プロジェクトをよりよくするために、遠慮なく聞いてください。
