# Issue Bridge Snapshot

- Issue: #208
- Title: docs: CLAUDE.md ブランチ運用ルール修正（develop-first、#196の再適用）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/208
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T14:49:03Z

## Body

🤖 **Claude より**

## 背景・目的

Issue #196（CLAUDE.md ブランチ運用ルール更新）は develop にマージ済みだが、
`auto-pr-to-main.yml` の YAML エラーにより develop → main への自動 PR が作成されず、
**main の CLAUDE.md にはまだ旧ルール（`docs` / `chore` → main 直行）が残っている。**

この Issue では CLAUDE.md の「ラベルと base ブランチの対応表」を develop-first 方針に合わせて修正する。
（Issue #206 の `auto-pr-to-main.yml` 修正と並行して進めてよい）

---

## 実装範囲

対象ファイル: `CLAUDE.md`（1ファイルのみ）

---

## 変更内容

### 1. ラベルと base ブランチの対応表を書き換える

該当箇所（「Issue 分割の判断軸」セクション内の表）：

**変更前:**
```markdown
| ラベル       | base       | 用途             |
| --------- | ---------- | -------------- |
| `docs`    | main 直行    | 運用ドキュメント・仕様書のみ |
| `chore`   | main 直行    | リポジトリ整備・CI 設定等 |
| `feature` | develop 経由 | UX に影響するコード変更  |
| `bug`     | develop 経由 | バグ修正（コード変更を伴う） |

> **原則**: ソースコードに断面があることは許容するが、運用ドキュメントは常に最新を保つ。
```

**変更後:**
```markdown
| ラベル       | base         | 用途             |
| --------- | ------------ | -------------- |
| `docs`    | develop 経由   | 運用ドキュメント・仕様書のみ |
| `chore`   | develop 経由   | リポジトリ整備・CI 設定等 |
| `feature` | develop 経由   | UX に影響するコード変更  |
| `bug`     | develop 経由   | バグ修正（コード変更を伴う） |

> **原則**: すべての変更は develop を経由する。main への直接コミット・直行マージは禁止。
> Claude・Cursor は develop ブランチを正として参照すること。
> develop → main のマージはリリース判断時（Naoya の明示的な承認後）のみ行う。
```

### 2. ドキュメント更新担当表の CLAUDE.md 行を修正

該当箇所（「運用ドキュメント更新の品質基準」セクション内の表）：

**変更前:**
```
| `CLAUDE.md` | Claude（Naoya確認後） | 運用ルール変更時      |
```

**変更後:**
```
| `CLAUDE.md` | Claude（Naoya確認後） | 運用ルール変更時。変更は develop 経由でマージ |
```

---

## 完了定義

- CLAUDE.md の対応表で `docs` / `chore` の base が `develop 経由` になっている
- 対応表直下の注記が「develop 正・main への直行禁止」を明示している
- CLAUDE.md 行に「develop 経由」の記載が追加されている

---

## テスト観点

- 変更後の CLAUDE.md を読んで、旧ルール（main 直行）の記述が残っていないこと目視確認

---

## 非対象範囲

- `docs/dev-flow.md` の変更（Issue #198 で対応済み）
- GitHub Actions ワークフローの変更（Issue #206 で対応）
- それ以外のセクションの変更

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: **develop**・ラベル: `docs`・`Closes #207` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
