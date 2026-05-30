# Issue Bridge Snapshot

- Issue: #233
- Title: 【docs / Critical】dev-flow.mdc を React + Vite 構成・最新運用に全面更新（globs / 実装ルール / Obsidian トリガー / #T0XX 形式）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/233
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T05:52:55Z

## Body

🤖 **Claude より**

## 背景・目的

2026-05-30 の Opus レビューで **Critical** 級の構造的問題として検出。

現状の `.cursor/rules/dev-flow.mdc` には **Vanilla JS 時代の記述が複数残存**しており、React + Vite + 現運用と乖離している。これにより：

- Cursor ルールが新規 React コードに適用されない（globs 不一致）
- Cursor が旧構成（`js/01〜05` / `gas-script-v3.js`）を前提に判断する余地が残る
- Obsidian 同期トリガーが `src/**/*.jsx` を捕捉しない
- PR タイトル・Issue 番号形式が旧タスクトラッカー時代の `#T0XX` のまま

これらをまとめて React + Vite 構成・現運用に整合させる。

## 実装範囲

### 修正対象ファイル
- `.cursor/rules/dev-flow.mdc`

### 具体的な修正内容

#### 1. ファイル冒頭の `globs` 更新

現状：
```yaml
globs: ["**/*.js", "**/*.html", "**/*.css", "**/gas-script*.js"]
```

修正後：
```yaml
globs: ["**/*.jsx", "**/*.js", "**/*.ts", "**/*.tsx", "**/*.html", "**/*.css", "backend/**/*.js"]
```

※ `legacy/` 配下を意図的にスコープから外す場合は `!legacy/**` も追加してよい（Cursor の glob 仕様に従う）。

#### 2.「## 実装ルール」セクション「### ファイル操作」内「✅ やること / ❌ やらないこと」の全面書き直し

現状：
```
✅ やること
- 新機能は新規ファイルで実装（例: js/07-mece.js）
- style.css は新規 class のみ追加
- index.html はタブボタン追加のみ（最小限）

❌ やらないこと
- 既存の js/01〜05 ファイルの関数を変更する
- gas-script-v3.js の既存関数を変更する（新規関数のみ追加）
```

修正後：
```
✅ やること
- 新機能は新規コンポーネント・新規ロジックファイルで実装
  - UI: src/components/<feature>/
  - ロジック: src/logic/<feature>Logic.js
  - API: backend/src/api/<endpoint>/
- 既存の共通フック・コンテキスト（src/contexts/AppContext.jsx, src/hooks/useAPI 等）は原則拡張のみ
- backend の新規 API は src/api/ 配下に追加し、services は変更せず利用する

❌ やらないこと
- src/contexts/AppContext.jsx の既存 reducer ロジックを変更する（拡張のみ可）
- src/services/api.js の既存関数シグネチャを変更する（破壊的変更禁止）
- legacy/ 配下を編集する（参照専用アーカイブ）
- backend/src/services/ の既存関数シグネチャを変更する
```

#### 3.「## PR 作成のルール」セクション「### PR タイトル形式」更新

現状：
```
feat: <機能名>（#T0XX）
fix: <バグ内容>（#T0XX）
chore: <作業内容>（#T0XX）
```

修正後：
```
feat: <機能名>（#XXX）
fix: <バグ内容>（#XXX）
chore: <作業内容>（#XXX）
docs: <作業内容>（#XXX）
```

※ `docs:` プレフィックスを追加（docs ラベル Issue の PR で使用）。  
※ `#T0XX` は旧タスクトラッカー時代の番号形式。現在は GitHub Issue 番号 `#XXX`。

#### 4.「## PR 作成のルール」セクション「### PR Description」内の `Fixes #T0XX` 修正

現状：
```
## 関連 Issue
Fixes #T0XX
```

修正後：
```
## 関連 Issue
Closes #XXX
```

※ `Closes` に統一する（CLAUDE.md 側と整合）。なお PR 本文形式そのものの統一は別 Issue（PR本文形式統一）で対応。

#### 5.「## Obsidian 同期タスク自動リマインド」セクション「## トリガー一覧」表の更新

現状：
```
| `docs/requirements-*.md` を push | パターン 1 | 議論ログ整理タスク |
| `docs/specification-*.md` を push | パターン 1 | 確定版コピータスク |
| `docs/cursor-instructions/*.md` を push | パターン 1 | 確定版コピータスク |
| `js/**/*.js` / `gas-script*.js` を push | パターン 2 | Sheets 更新・Obsidian 完了ログ |
| `.github/wiki/*.md` を push | なし | リマインド不要 |
```

修正後：
```
| `docs/requirements*/**.md` / `docs/requirements*.md` を push | パターン 1 | 議論ログ整理タスク |
| `docs/specification*/**.md` / `docs/specification*.md` を push | パターン 1 | 確定版コピータスク |
| `docs/cursor-instructions/*.md` を push | パターン 1 | 確定版コピータスク |
| `src/**/*.{js,jsx,ts,tsx}` / `backend/**/*.js` を push | パターン 2 | Sheets 更新・Obsidian 完了ログ |
| `.github/wiki/*.md` を push | なし | リマインド不要 |
```

※ `docs/requirements-*.md`（ハイフン形式）から `docs/requirements*` に変更し、ディレクトリ形式（`docs/requirements/`）にも対応させる。  
※ パターン 2 を `src/` `backend/` 配下の React・Node コードに変更。

#### 6.「### パターン 2: ソースコード実装を push したとき」セクション「対象」の更新

現状：
```
対象: `js/**/*.js` / `gas-script*.js`
```

修正後：
```
対象: `src/**/*.{js,jsx,ts,tsx}` / `backend/**/*.js`
```

## 完了定義

- `.cursor/rules/dev-flow.mdc` の `globs` が React + Vite 構成（`*.jsx` / `*.ts` / `*.tsx` / `backend/`）を含んでいる状態
- `js/01〜05` / `gas-script-v3.js` / `js/07-mece.js` / `style.css` / `index.html` への明示的言及がファイル全体から消えている状態（ただし `legacy/` への言及は残してよい）
- PR タイトル形式・関連 Issue 形式が `#T0XX` から `#XXX` に修正されている状態
- Obsidian 同期トリガー一覧が React 構成に対応している状態
- `legacy/` 配下を編集禁止とする旨が「❌ やらないこと」に明示されている状態

## テスト観点

- `grep -nE 'T0[0-9]+|gas-script-v3|js/0[1-5]|js/07-mece' .cursor/rules/dev-flow.mdc` を実行してヒット 0 件
- `grep -nE 'src/components|src/logic|backend/src' .cursor/rules/dev-flow.mdc` で新構成への言及が複数ヒット
- `grep -n 'jsx' .cursor/rules/dev-flow.mdc` で globs と Obsidian トリガーに `.jsx` が含まれること
- `grep -n 'legacy' .cursor/rules/dev-flow.mdc` で legacy/ 編集禁止が明示されている
- `git diff` で対象 5 箇所以外が変更されていないこと

## 非対象範囲

- `CLAUDE.md` 側の修正は対象外（必要であれば別 Issue で対応）
- PR 本文形式そのものの統一は別 Issue（PR本文形式統一）で対応
- `.cursor/rules/wiki-modification.mdc` の更新は対象外
- post-push フックスクリプト（`scripts/obsidian-sync-reminder.sh`）の修正は対象外（必要なら別 Issue）
- `legacy/` 配下のファイル自体への変更は対象外

## Obsidian記録

※ 実装完了後（PR 作成時）、Cursor が以下を Obsidian に保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/decisions/YYYY-MM-DD-dev-flow-react-migration.md`

内容:
```
# dev-flow.mdc を React 構成・最新運用に全面更新
## 実装内容
- 
## 変更ファイル
- 
## 関連Issue
- #XXXX
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push（未完成でも必ず push すること）
3. PR 作成（Draft 可。**base = `develop`**、ラベル = `docs`、`Closes #XXX` を記載）
   - 未完成の場合はタイトルに `[WIP]` を付けてよい
4. PR 本文に以下を必ず記載すること：

---
## 変更内容
- （何をどう変えたか、箇条書き）

## 確認済み事項
- grep で旧記述（T0XX / gas-script-v3 / js/0X 等）のヒットが 0 件であることを確認した
- lint 通過

## 未確認・懸念点
- （あれば記載。なければ「なし」）
---

途中で止まってよいのは「不明点がある場合」のみ。その場合は **必ず Issue コメントに以下を書いてから止まること**：

```
【作業中断】
- 現在の状態：
- 中断理由：
- 次に必要なこと：
```

---
_Claude による自動投稿_
