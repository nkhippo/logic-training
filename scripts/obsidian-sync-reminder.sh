#!/usr/bin/env bash
# Obsidian 同期タスク自動リマインド（post-push / 手動実行）
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

REPO="${GITHUB_REPOSITORY:-nkhippo/thinkgrindai}"
ZERO=$(git hash-object --stdin </dev/null | tr '0-9a-f' '0')

PATTERN_DISCOVERY=0
PATTERN_IMPLEMENTATION=0
ISSUE_NUMBERS=()

add_issue_numbers_from_text() {
  local text="$1"
  local n
  while IFS= read -r n; do
    [[ -n "$n" ]] && ISSUE_NUMBERS+=("$n")
  done < <(printf '%s\n' "$text" | grep -oiE '(fixes[[:space:]]+)?#t?[0-9]+' | grep -oiE '[0-9]+' | sort -u)
}

classify_files() {
  local files="$1"
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    if [[ "$f" == .github/wiki/* ]]; then
      continue
    fi
    if [[ "$f" == docs/requirements* ]] || [[ "$f" == docs/specification* ]] || [[ "$f" == docs/cursor-instructions/* ]]; then
      PATTERN_DISCOVERY=1
    fi
    if [[ "$f" == js/* ]] && [[ "$f" == *.js ]]; then
      PATTERN_IMPLEMENTATION=1
    fi
    if [[ "$f" == gas-script*.js ]]; then
      PATTERN_IMPLEMENTATION=1
    fi
  done <<< "$files"
}

analyze_range() {
  local range="$1"
  [[ -z "$range" ]] && return 0

  local files
  files=$(git diff --name-only "$range" 2>/dev/null || true)
  [[ -z "$files" ]] && return 0

  classify_files "$files"

  local messages
  messages=$(git log "$range" --format=%B 2>/dev/null || true)
  add_issue_numbers_from_text "$messages"
}

discovery_message() {
  cat <<'EOF'
🔄 Obsidian 同期タスク（自動生成）

要件が GitHub に確定しました。Naoya さんが以下を Obsidian に記入してください：

📋 直後（即座）にやること:
  □ discussions/2025-XX-XX_round-X.md を作成
    └ 今日の Claude との議論ログをコピペ

📋 要件確定後にやること:
  □ discussions/summary-REQ-XXX.md を作成
    └ 最終確定事項をまとめる

📋 このファイルを GitHub に push した後:
  □ confirmed-decisions/REQ-XXX.md を作成
    └ requirements + specification を統合してコピペ

チェック: 上記すべてに ✅ が入ったら Issue をクローズしてください
EOF
}

implementation_message() {
  cat <<'EOF'
🔄 Obsidian 同期タスク（自動生成）

実装が GitHub に push されました。以下は Naoya さんが完了後に実施してください：

📋 PR マージ後:
  □ Google Sheets REQ-XXX のステータスを「完了」に変更
  □ 実完了日を記入
  □ Obsidian confirmed-decisions/ へ行をコピー

完了後、Issue をクローズしてください
EOF
}

post_issue_comment() {
  local issue_num="$1"
  local body="$2"
  if ! command -v gh >/dev/null 2>&1; then
    return 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    return 1
  fi
  printf '%s\n' "$body" | gh issue comment "$issue_num" --repo "$REPO" --body-file - >/dev/null 2>&1
}

emit_reminders() {
  if [[ "$PATTERN_DISCOVERY" -eq 0 && "$PATTERN_IMPLEMENTATION" -eq 0 ]]; then
    return 0
  fi

  echo ""
  echo "════════════════════════════════════════════════════════"
  echo "✅ Push 完了 — Obsidian 同期タスク"
  echo "════════════════════════════════════════════════════════"

  if [[ "$PATTERN_DISCOVERY" -eq 1 ]]; then
    echo ""
    discovery_message
    if [[ ${#ISSUE_NUMBERS[@]} -gt 0 ]]; then
      for num in "${ISSUE_NUMBERS[@]}"; do
        if post_issue_comment "$num" "$(discovery_message)"; then
          echo ""
          echo "→ GitHub Issue #${num} にコメントを投稿しました（議論ログ整理タスク）"
        fi
      done
    fi
  fi

  if [[ "$PATTERN_IMPLEMENTATION" -eq 1 ]]; then
    echo ""
    implementation_message
    if [[ ${#ISSUE_NUMBERS[@]} -gt 0 ]]; then
      for num in "${ISSUE_NUMBERS[@]}"; do
        if post_issue_comment "$num" "$(implementation_message)"; then
          echo ""
          echo "→ GitHub Issue #${num} にコメントを投稿しました（PR マージ後タスク）"
        fi
      done
    fi
  fi

  if [[ ${#ISSUE_NUMBERS[@]} -eq 0 ]]; then
    echo ""
    echo "ℹ️  commit message に Issue 番号（例: Fixes #T005）がないため、Issue コメントはスキップしました。"
    echo "   ターミナル出力のみでリマインドしています。"
  fi

  echo "════════════════════════════════════════════════════════"
  echo ""
}

# post-push からの呼び出し: remote_sha local_sha
if [[ $# -ge 2 ]]; then
  remote_sha="$1"
  local_sha="$2"
  if [[ "$remote_sha" == "$ZERO" ]]; then
    analyze_range "$local_sha"
  else
    analyze_range "${remote_sha}..${local_sha}"
  fi
  emit_reminders
  exit 0
fi

# 手動実行: 直近の push 分を @{u} の1つ前から推定できないため、HEAD の最新 commit のみ
if git rev-parse --verify '@{u}' >/dev/null 2>&1; then
  upstream='@{u}'
  count=$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo 0)
  if [[ "$count" -gt 0 ]]; then
    analyze_range "${upstream}..HEAD"
    emit_reminders
    exit 0
  fi
fi

# push 直後は @{u} が更新済みのため、直近 commit を分析
last=$(git rev-parse HEAD~0 2>/dev/null || true)
if [[ -n "$last" ]]; then
  analyze_range "$last"
  emit_reminders
fi
