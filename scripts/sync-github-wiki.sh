#!/usr/bin/env bash
# .github/wiki/ の内容を GitHub Wiki リポジトリへ手動同期
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

WIKI_REMOTE="${WIKI_REMOTE:-https://github.com/nkhippo/thinkgrindai.wiki.git}"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "📥 Cloning wiki repository..."
git clone "$WIKI_REMOTE" "$WORK_DIR/wiki-repo"

echo "📤 Syncing .github/wiki/ → wiki repository..."
rsync -av --delete --exclude '.git' --exclude 'README.md' .github/wiki/ "$WORK_DIR/wiki-repo/"

cd "$WORK_DIR/wiki-repo"
git add -A

if git diff --staged --quiet; then
  echo "✅ Wiki repository is already up to date."
  exit 0
fi

git commit -m "docs: sync wiki from main repository (manual)"
git push origin master 2>/dev/null || git push origin main

echo "✅ GitHub Wiki を更新しました。"
echo "   https://github.com/nkhippo/thinkgrindai/wiki"
