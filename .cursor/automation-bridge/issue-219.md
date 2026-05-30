# Issue Bridge Snapshot

- Issue: #219
- Title: chore: ready-for-cursorラベル付与時にCursor AutomationへWebhook送信するworkflowを追加する
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/219
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T01:51:29Z

## Body

🤖 **Claude より**

## 背景・目的

Issue #214 にて Bridge PR 方式を廃止し「Cursor Automation の Label change トリガーで直接起動」する設計に移行したが、調査の結果 **Cursor Automation の Label change トリガーは PR 専用であり Issue には対応していない**ことが判明した。

代替として **GitHub Actions から Cursor Automation の Webhook エンドポイントに POST する**方式を採用する。Bridge PR は不要のまま維持しつつ、旧方式より大幅にシンプルな構成となる。

### 新フロー

```
Issue + ready-for-cursor ラベル付与
  ↓ GitHub Actions（Webhook送信のみ・10行程度）
  → Cursor Automation Webhook に Issue 番号・本文を POST
  ↓ Cursor が Webhook で起動
  → Issue を読んで新ブランチ作成・実装・PR 作成
  ↓
Naoya が PR に「ok」→ 自動マージ
```

---

## 実装範囲（対象ファイル明示）

### 追加するファイル
- `.github/workflows/trigger-cursor-on-ready.yml`
  - `issues: labeled` イベントで `ready-for-cursor` ラベルのときのみ起動
  - Cursor Automation Webhook URL に Issue 情報を POST する
  - Secrets: `CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`

### 変更しないファイル
- `CLAUDE.md`（後続 Issue で対応）
- `approval.yml`（#214 対応済み・変更不要）
- `dev-flow.mdc`（#214 対応済み・変更不要）

---

## Webhook workflow の実装仕様

```yaml
name: Trigger Cursor on ready-for-cursor

on:
  issues:
    types: [labeled]

permissions:
  issues: read

jobs:
  trigger:
    if: github.event.label.name == 'ready-for-cursor'
    runs-on: ubuntu-latest
    steps:
      - name: POST to Cursor Automation webhook
        env:
          WEBHOOK_URL: ${{ secrets.CURSOR_AUTOMATION_WEBHOOK_URL }}
          WEBHOOK_TOKEN: ${{ secrets.CURSOR_AUTOMATION_WEBHOOK_TOKEN }}
        run: |
          set -euo pipefail
          jq -n \
            --arg event "github.issue.labeled" \
            --arg label "${{ github.event.label.name }}" \
            --argjson issue_number "${{ github.event.issue.number }}" \
            --arg issue_url "${{ github.event.issue.html_url }}" \
            --arg title "${{ github.event.issue.title }}" \
            --arg body "${{ github.event.issue.body }}" \
            '{
              event: $event,
              label: $label,
              issue_number: $issue_number,
              issue_url: $issue_url,
              title: $title,
              body: $body
            }' > /tmp/payload.json

          curl -sfS -X POST "${WEBHOOK_URL}" \
            -H "Authorization: Bearer ${WEBHOOK_TOKEN}" \
            -H "Content-Type: application/json" \
            --data-binary @/tmp/payload.json
```

---

## 完了定義

以下の状態になっていること：

- `.github/workflows/trigger-cursor-on-ready.yml` が存在する
- `ready-for-cursor` ラベルを Issue に付与したとき、GitHub Actions が起動して Webhook POST が実行される（Actions のログで確認可能）
- Secrets（`CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`）が未登録の場合、PR Comments に「Secrets の登録が必要」と記載する

---

## テスト観点

- workflow のトリガー条件（`ready-for-cursor` ラベルのみ）が正しく設定されていること
- `ready-for-cursor` 以外のラベルでは起動しないこと（`if` 条件の確認）
- jq / curl の構文エラーがないこと（lintレベルの確認）

---

## 非対象範囲

- Cursor Automation UI 側の設定変更（Naoya が手動で行う）
- `CLAUDE.md` の記述修正（後続 Issue で対応）
- 実際に Cursor が起動するかの end-to-end 確認（Secrets 登録後に Naoya が確認）

---

## Naoya さんへ（Cursor 対応と並行してやること）

1. **Cursor Automation UI** でトリガーを **Webhook triggered** に変更する
2. 表示された Webhook URL と auth token（`crsr_...`）を控える
3. GitHub リポジトリの **Settings > Secrets > Actions** に以下を登録する
   - `CURSOR_AUTOMATION_WEBHOOK_URL`
   - `CURSOR_AUTOMATION_WEBHOOK_TOKEN`（`crsr_...` の値のみ、`Bearer ` は不要）

---

## Obsidian記録

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/2026-05-30-webhook-trigger.md`

内容:
```
# Cursor Automation Webhook トリガー追加

## 実装内容
- trigger-cursor-on-ready.yml 追加
- ready-for-cursor ラベル付与 → Webhook POST → Cursor 起動

## 変更ファイル
-

## 関連Issue
- #214
- #（このIssue番号）
```

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR 作成（base: develop・ラベル: chore・Closes #このIssue番号 を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Comments に質問を書くこと。

---
_Claude による自動投稿_
