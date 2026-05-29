# Issue Bridge Snapshot

- Issue: #193
- Title: docs: フォルダ構成最適化（ui-shared.md 改名 + ai-context/ 新設）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/193
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T12:48:03Z

## Body

🤖 **Claude より**

## 背景・目的

現在の `docs/` 配下には以下の問題がある：

1. **`common.md` が3箇所に存在して紛らわしい**
   - `docs/requirements/common.md`
   - `docs/specification/common.md`
   - `docs/specification/logic/common.md`
   → 「共通の仕様を知りたい」ときにどれを読むべきか、AI・人間ともに判断コストが高い

2. **AIが毎回読む「最小限の情報」が CLAUDE.md の大ファイルに埋もれている**
   - CLAUDE.md は初回に GitHub から読む前提だが、25KB超のファイルを毎回全読みしているためトークン消費が大きい
   - 「リポジトリURL」「技術スタック」「どのファイルが何のために存在するか」という軽量情報だけを取り出せる場所がない

**ゴール**: 1回の `list_directory` で「今自分が何を読むべきか」が分かる構造にする

---

## 実装範囲

### 変更1: `specification/logic/common.md` → `ui-shared.md` に改名

```
docs/specification/logic/common.md  →  docs/specification/logic/ui-shared.md
```

**理由**: `common.md` という名前が3箇所に存在するため、「論理トレーニングのUI共通仕様」であることが名前から分かるように改名する。

対応して更新が必要なファイル：
- `docs/_index.md` のリンク
- `ui-shared.md` 内のファイル自身のタイトル行（`# Logic Training 共通 UI 仕様` などに統一）
- `ui-shared.md` を参照している他の specification ファイル内のリンク（存在する場合）

---

### 変更2: `docs/ai-context/` を新設し、軽量ナビゲーションファイルを配置

```
docs/
└── ai-context/                  ← NEW
    ├── REPO.md                  ← NEW
    └── FILE_MAP.md              ← NEW（現 _index.md を改良して移動）
```

#### `ai-context/REPO.md` の内容（新規作成）

```markdown
# ThinkGrindAi リポジトリ情報

**最終更新**: 2026-XX-XX

## 基本情報
- **リポジトリ**: https://github.com/nkhippo/ThinkGrindAi
- **旧リポジトリ名**: thinkgrindai（2026年に移行済み）

## 技術スタック
- FE: Vite + React 18（Vercel）
- BE: Node.js Express（Railway）
- AI: Claude Sonnet 4.6

## ブランチ戦略
- `main`: 本番
- `develop`: 開発ベース
- docs / chore → main 直行
- feature / bug → develop 経由
```

#### `ai-context/FILE_MAP.md` の内容（新規作成）

「何を知りたいか → どのファイルを読むか」のマップ。現 `_index.md` の内容を整理して移動する。

```markdown
# FILE_MAP: 何を知りたいか → どのファイルを読むか

**最終更新**: 2026-XX-XX

## 開発ルール・行動規範
→ `/CLAUDE.md`

## サービス全体のビジョン・背景
→ `docs/PROJECT_CONTEXT.md`

## 要件定義
→ `docs/requirements/<機能名>.md`
- 論理トレーニング共通: `docs/requirements/logic/overview.md`
- 思考トレーニング共通: `docs/requirements/thinking/overview.md`

## 仕様書（実装詳細）
→ `docs/specification/<機能名>.md`
- 論理トレーニングUI共通: `docs/specification/logic/ui-shared.md`
- 要約タブ: `docs/specification/logic/summary.md`
- 穴埋めタブ: `docs/specification/logic/fill.md`
- 批判読みタブ: `docs/specification/logic/critique.md`
- 空雨傘タブ: `docs/specification/logic/ame.md`

## ドキュメント記載基準
→ `docs/DOCUMENT_GUIDELINES.md`
→ `docs/TERMS.md`

## Cursor 実装指示（タイプCのみ）
→ `docs/cursor-instructions/`
```

#### `docs/_index.md` の扱い

`FILE_MAP.md` に内容を移行した後、`_index.md` は削除する。
（`CLAUDE.md` 内に `_index.md` への参照がある場合はあわせて `ai-context/FILE_MAP.md` に更新すること）

---

## 完了定義

以下の状態になっていること：

- `docs/specification/logic/common.md` が存在せず、`ui-shared.md` として存在している
- `docs/ai-context/REPO.md` が存在し、上記の内容が記載されている
- `docs/ai-context/FILE_MAP.md` が存在し、全ファイルへの正確なマップが記載されている
- `docs/_index.md` が削除されている（または `ai-context/FILE_MAP.md` へのリダイレクトコメントのみになっている）
- `_index.md` と `common.md`（logic配下）へのリンクが `CLAUDE.md` および他の docs ファイル内に残っていない

## テスト観点

- `docs/specification/logic/` を開いて `common.md` が存在せず `ui-shared.md` が存在することを確認
- `docs/ai-context/REPO.md` のリポジトリURLが `https://github.com/nkhippo/ThinkGrindAi` であることを確認
- `docs/ai-context/FILE_MAP.md` の各リンク先ファイルが実際に存在することを確認（リンク切れなし）
- `CLAUDE.md` 内の `_index.md` への参照が `FILE_MAP.md` に更新されていることを確認

## 非対象範囲

- 各 `requirements/` / `specification/` ファイルの**内容**変更（ファイル名と参照リンクの修正のみ）
- `CLAUDE.md` の運用ルールセクションの変更
- `cursor-instructions/` の変更
- `docs/setup/` の変更

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: **main**、ラベル: docs、本文に `Closes #192` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
