# 2025-01-24 開発体制セットアップ完了サマリー

**作成日**: 2025-01-24  
**最終更新**: 2025-05-25  
**バージョン**: 1.1

**Obsidian Vault**: `ThinkGrindAi`（ローカル）  
**パス**: `/Users/naoya.k/Documents/Obsidian/ThinkGrindAi`  
**旧パス（iCloud・廃止）**: `/Users/naoya.k/Library/Mobile Documents/com~apple~CloudDocs/Obsidian/ThinkGrindAi`

---

## 📋 概要

thinkgrindai プロジェクトの開発体制を整備しました。

これにより：
- ✅ Claude・Cursor が開発フローを自動でガイド
- ✅ 新規参入者がオンボーディングできる
- ✅ 議論の流れ・決定の背景が記録される
- ✅ 少ないトークンで質の高い会話が可能

---

## 🎯 実施した施策

### 1. Claude.ai Projects「Think Grind Ai」の設定

**目的**: Claude との会話で開発フローを自動ガイド

**内容**:
- Instructions: CLAUDE.md に従うよう記入
- Knowledge: 3 つのファイルをアップロード
  - CLAUDE.md
  - PROJECT_CONTEXT.md
  - DEVELOPMENT_POLICY.md

**効果**: どのチャットを立てても、自動的にフローがガイドされる

---

### 2. GitHub リポジトリへのルールファイル配置

**対象ファイル**:
- `CLAUDE.md`（Claude・Cursor 共通ルール）
- `.cursor/rules/dev-flow.mdc`（Cursor 専用ルール）

**効果**: 
- Claude・Cursor が常にプロジェクトの「やり方」を把握
- 毎回「洗い出してください」と言わずに済む

---

### 3. GitHub Projects Board 作成

**Board**: `Development Pipeline`

**Column**:
- Backlog（優先度未決定）
- Ready（Cursor 指示待ち）
- In Progress（実装中）
- In Review（レビュー中）
- Done（完了）

**効果**: 全タスクの進捗が一元管理される

---

### 4. GitHub Issues テンプレ・Labels 作成

**Issue テンプレ**:
- bug.md（バグ報告）
- chore.md（軽微変更）
- feature.md（新機能）

**Labels**: Type / Priority / Status / Area（計 13 個）

**効果**: Issue の品質向上、分類が容易

---

### 5. Google Sheets「Task Tracker」作成

**URL**: https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/

**3 つのシート**:
- 要件確定シート（検討中 → 完了までのステータス管理）
- タスク進捗シート（GitHub Issues の一覧）
- アーカイブシート（完了したタスク）

**効果**: 要件確定から実装完了までを一元管理

**GitHub リンク**: `docs/TASK_TRACKER_URL.md`

---

### 6. GitHub Wiki ページ作成（8 ページ）

**ページ一覧**:
1. Home（トップ・ナビゲーション）
2. Getting Started（セットアップ）
3. Service Overview（プロジェクト概要）
4. Development Flow（アイデア実装フロー）
5. Bug Fix Guide（バグ修正フロー）
6. Specifications（仕様・経緯）
7. Roadmap（計画・残タスク）
8. FAQ（よくある質問）

**効果**: 新規参入者が「何をしたらいい？」を一目で理解

---

### 7. GitHub Wiki 自動同期（Git 管理）

**正本**: リポジトリ内 `.github/wiki/*.md`

**仕組み**:
```
.github/wiki/<ページ>.md を編集
    ↓
git commit & push（main）
    ↓
GitHub Actions（sync-wiki.yml）が Wiki リポジトリへ同期
    ↓
https://github.com/nkhippo/thinkgrindai/wiki が更新
```

**手動同期**: `bash scripts/sync-github-wiki.sh`

**効果**: GitHub Wiki UI への手動コピペが不要

---

### 8. Obsidian Vault 構成整備（ThinkGrindAi）

**Vault ルートのフォルダ構成**:
```
ThinkGrindAi/
├── ideas/                  ← アイデア・検討中
├── discussions/            ← Claude との議論ログ
├── confirmed-decision/     ← 確定した仕様（※複数形でも可）
├── project-documentation/  ← 運用ドキュメント（今ここ）
├── claude-conversations/   ← Claude 会話の抜粋
├── project-status/         ← 月次レビューなど
├── learnings/              ← 学び・気づき
└── archive/                ← アーカイブ
```

**効果**: 議論の流れ・決定の背景が整理される

---

### 9. Cursor 自動リマインド機能（Obsidian 同期）

**機能**: GitHub に push するたびに、Obsidian 同期タスクを自動リマインド

**実装**:
- `.cursor/rules/dev-flow.mdc` にルール追記
- `scripts/obsidian-sync-reminder.sh`（post-push フック）
- 初回: `bash scripts/install-git-hooks.sh`

**例**:
```
🔄 Obsidian 同期タスク（自動生成）

要件が確定しました。以下を Obsidian に整理してください：

□ discussions/2025-XX-XX_round-X.md を作成
□ confirmed-decision/REQ-XXX.md を作成
```

**効果**: 「Obsidian に整理しないといけない」と自動で思い出せる

---

## ✅ 構築された開発体制の全体像

```
新規参入者が thinkgrindai に参加
    ↓
GitHub Wiki「Home」ページを見る
    ↓
「アイデアを実装したい」→ Development Flow ページ
「バグを直したい」→ Bug Fix Guide ページ
「プロジェクトを理解したい」→ Service Overview ページ
    ↓
指示に従って Chat / Issue / 実装を進める
    ↓
Naoya がテスト・Merge
    ↓
完了
```

---

## 📚 主要ドキュメント一覧

### GitHub に配置（公式ドキュメント）

| ファイル | 用途 | 対象者 |
|---------|------|--------|
| CLAUDE.md | 共通ルール | Claude・Cursor |
| .cursor/rules/dev-flow.mdc | Cursor ルール | Cursor |
| docs/PROJECT_CONTEXT.md | ビジョン・背景 | 全員 |
| docs/DEVELOPMENT_POLICY.md | 開発ルール詳細 | 全員 |
| docs/TASK_TRACKER_URL.md | Sheets リンク | 全員 |
| docs/requirements-*.md | 要件定義書 | 開発者 |
| docs/specification-*.md | 仕様書 | 開発者 |
| docs/cursor-instructions/*.md | Cursor 指示書 | Cursor |
| .github/wiki/*.md | Wiki 正本 | 全員 |

### GitHub Wiki（新規参入者向け）

- Home / Getting Started / Service Overview / Development Flow
- Bug Fix Guide / Specifications / Roadmap / FAQ

### Obsidian ThinkGrindAi（作業ノート・議論ログ）

- `ideas/` — 検討中のアイデア
- `discussions/` — Claude との議論ログ
- `confirmed-decision/` — 確定した仕様
- `project-documentation/` — 運用ドキュメント（本ファイル）

---

## 🔄 これからの開発フロー

### アイデアを実装したい場合

```
1. Obsidian ThinkGrindAi に ideas/REQ-XXX.md を作成
2. Claude.ai Projects で新チャットを立てる
3. 「新しいアイデアがあります」と送信
4. Claude が Phase 1 からガイド（自動）
5. 議論ログを discussions/ に記入
6. 要件確定 → Google Sheets に記入
7. Claude が要件定義書・仕様書・指示書を作成
8. GitHub Issue 作成
9. Cursor が実装・PR 作成
10. Naoya がテスト・Merge
11. Obsidian に完了ログ記入
```

### バグを修正したい場合

```
1. GitHub Issues で bug Issue 作成
2. Cursor が実装
3. PR 作成 → Merge
4. 完了
```

---

## 🛠️ 運用上のチェックリスト

### 週 1 回（毎週月曜朝）

- [ ] GitHub Projects Board を確認（Backlog の優先度付け）
- [ ] Google Sheets「要件確定シート」を確認（進捗状況）
- [ ] 停滞しているタスクはないか確認

### 月 1 回（毎月末）

- [ ] Obsidian `project-status/monthly-review.md` を更新
- [ ] Wiki（`.github/wiki/`）に更新が必要か確認
- [ ] 次月の優先タスクを決定

### タスク完了時

- [ ] Google Sheets でステータス更新
- [ ] Obsidian に完了ログ記入
- [ ] アーカイブシートへ移動

---

## 💡 今後の改善案

### 短期（1 ヶ月以内）

- MECE タブの実装を進める
- Wiki ページの実装例を追加
- Obsidian リマインド機能の運用確認

### 中期（3-6 ヶ月）

- ~~GitHub Wiki の自動更新メカニズム構築~~ ✅ 完了（sync-wiki.yml）
- Obsidian - GitHub 間の同期自動化
- 開発チームの拡大に対応したスケーリング

### 長期（6 ヶ月以上）

- 社外開発者の受け入れ体制
- CI/CD パイプラインの構築
- 監視・ロギング機能の追加

---

## 🔗 関連リンク

**GitHub**:
- [thinkgrindai リポジトリ](https://github.com/nkhippo/thinkgrindai)
- [GitHub Projects Board](https://github.com/nkhippo/thinkgrindai/projects)
- [GitHub Wiki](https://github.com/nkhippo/thinkgrindai/wiki)
- [.github/wiki フォルダ](https://github.com/nkhippo/thinkgrindai/tree/main/.github/wiki)

**外部ツール**:
- [Claude.ai Projects](https://claude.ai) → 「Think Grind Ai」プロジェクト
- [Google Sheets Task Tracker](https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/)

**Obsidian（ThinkGrindAi Vault）** — `~/Documents/Obsidian/ThinkGrindAi`:
- `ideas/`
- `discussions/`
- `confirmed-decision/`

---

## 📝 このドキュメントについて

このドキュメントは以下の用途で使用してください：

1. **新しいチャットを立てるときの context 提供**
   - このファイルを Claude チャットに添付
   - Claude が全体的な背景を素早く把握 → 効率的な会話が可能

2. **新規参入者のオンボーディング**
   - 「ここまでの開発体制を理解したい」という人に共有

3. **定期的な振り返り**
   - 月 1 回、このドキュメントを見直して更新

---

**次のドキュメント更新**: 2025-02-24（1 ヶ月後）
