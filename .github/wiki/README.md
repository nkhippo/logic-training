# GitHub Wiki（Git 管理）

このディレクトリが Wiki の**正本**です。`*.md` を編集して `main` に push すると、GitHub Actions が [thinkgrindai Wiki](https://github.com/nkhippo/thinkgrindai/wiki) へ自動同期します。

## 運用

```bash
# 1. ページを編集
vim .github/wiki/Specifications.md

# 2. commit & push
git add .github/wiki/Specifications.md
git commit -m "docs: update Specifications for REQ-005"
git push origin main
```

push 後、`.github/workflows/sync-wiki.yml` が Wiki リポジトリ（`thinkgrindai.wiki.git`）へ反映します。

## 手動同期（Actions を待たない場合）

```bash
bash scripts/sync-github-wiki.sh
```

## ファイル名ルール

| ファイル名 | Wiki 表示名 | URL |
|-----------|------------|-----|
| `Home.md` | Home | `/wiki/Home` |
| `Getting-Started.md` | Getting Started | `/wiki/Getting-Started` |

- ハイフン `-` は Wiki 上でスペースに変換されます
- 拡張子 `.md` は必須です
- ファイル名は **ASCII ハイフン**（`-`）を使用してください（全角・Unicode ハイフンは不可）

## 初回セットアップ（参考）

Wiki リポジトリの内容を取り込む場合:

```bash
git clone https://github.com/nkhippo/thinkgrindai.wiki.git /tmp/thinkgrindai-wiki
# 必要に応じて .github/wiki/ と差分を確認してから上書き
```

通常はこのディレクトリを編集するだけで問題ありません。
