#!/usr/bin/env bash
# Git hooks を有効化（Obsidian 同期リマインド用 post-push）
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

chmod +x scripts/obsidian-sync-reminder.sh
chmod +x .githooks/post-push

git config core.hooksPath .githooks

echo "✅ Git hooks を有効化しました（core.hooksPath=.githooks）"
echo "   push 時に Obsidian 同期タスクがターミナルに表示されます。"
echo "   Issue コメント投稿には gh auth login が必要です。"
