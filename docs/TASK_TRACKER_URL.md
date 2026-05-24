# Task Tracker - Google Sheets

開発タスクの要件確定・進捗管理用の Google Sheets です。

## リンク

- **要件確定シート（メイン）**: https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/edit#gid=0

## 各シートの説明

### 1. 要件確定シート

Naoya さんが「検討中 → 確定 → 指示書作成済 → 実装中 → 完了」とステータスを更新していくシート。

**列定義**:
| 列 | 意味 | 記入内容例 |
|----|------|----------|
| A | ID | REQ-004 |
| B | 案件名 | MECE タブ実装 |
| C | 検討開始日 | 2025-01-24 |
| D | ステータス | 検討中/確定/指示書作成済/実装中/完了 |
| E | 優先度 | 高/中/低 |
| F | Obsidian リンク | obsidian://vault/ideas/REQ-004-mece.md |
| G | 要件定義書 | GitHub docs/ への URL |
| H | 仕様書 | GitHub docs/ への URL |
| I | Cursor指示書 | GitHub docs/ への URL |
| J | 関連GitHub Issue | #T004 |
| K | 担当者 | Cursor（実装担当） |
| L | 確定日 | 2025-01-25 |
| M | 予定開始日 | 2025-01-27 |
| N | 予定完了日 | 2025-01-30 |
| O | 実完了日 | 実装完了時に記入 |
| P | 備考 | 重要な制約・注意点など |

**使い方**:
1. Naoya がアイデアを思いついて Obsidian に記入（ステータス: 検討中）
2. Claude と議論して要件確定（ステータス: 確定）
3. Claude が指示書を作成・GitHub に push（ステータス: 指示書作成済）
4. Cursor が実装・PR 作成（ステータス: 実装中）
5. Naoya がテスト・Merge（ステータス: 完了）

### 2. タスク進捗シート

GitHub Issues を手動で転記（週 1 回程度）。軽微タスク用。

**列定義**:
| 列 | 意味 |
|----|------|
| A | Issue # |
| B | タイトル |
| C | タイプ（bug/chore/feature） |
| D | 優先度 |
| E | ステータス（Backlog/Ready/In Progress/Done） |
| F | 担当者 |
| G | 作成日 |
| H | GitHub Issue URL |

### 3. アーカイブシート

完了したタスク（要件確定シートで「完了」になったもの）をコピーして保管。

**保管方法**:
1. 要件確定シートから完了行をコピー
2. アーカイブシートの最下行に貼り付け
3. 要件確定シートから削除（または非表示）
