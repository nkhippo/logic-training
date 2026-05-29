# Issue Bridge Snapshot

- Issue: #196
- Title: docs: develop-first方針への切り替え — CLAUDE.md ブランチ運用ルール更新
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/196
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T13:08:21Z

## Body

🤖 **Claude より**

## 背景・目的

これまで `docs` / `chore` ラベルのIssueはmainへ直行マージする運用だったが、
この方針が `develop → main` マージ時のコンフリクト多発の原因になっていた。

Naoya・Claudeの合意により、**すべてのIssueをdevelop経由に統一**し、
Claude・Cursorはdevelopブランチを正として参照する方針に変更する。

本Issueは CLAUDE.md のブランチ運用ルール記述を新方針に合わせて更新する。

---

## 実装範囲

対象ファイル: `CLAUDE.md`（1ファイルのみ）

---

## 変更内容

### 1. ラベルと base ブランチの対応表を書き換える

**変更前:**
```
| ラベル     | base       | 用途             |
| --------- | ---------- | -------------- |
| `docs`    | main 直行    | 運用ドキュメント・仕様書のみ |
| `chore`   | main 直行    | リポジトリ整備・CI 設定等 |
| `feature` | develop 経由 | UX に影響するコード変更  |
| `bug`     | develop 経由 | バグ修正（コード変更を伴う） |
```

**変更後:**
```
| ラベル     | base         | 用途             |
| --------- | ------------ | -------------- |
| `docs`    | develop 経由   | 運用ドキュメント・仕様書のみ |
| `chore`   | develop 経由   | リポジトリ整備・CI 設定等 |
| `feature` | develop 経由   | UX に影響するコード変更  |
| `bug`     | develop 経由   | バグ修正（コード変更を伴う） |
```

### 2. 対応表直下の注記を書き換える

**変更前:**
```
> **原則**: ソースコードに断面があることは許容するが、運用ドキュメントは常に最新を保つ。
```

**変更後:**
```
> **原則**: すべての変更は develop を経由する。main への直接コミット・直行マージは禁止。
> Claude・Cursor は develop ブランチを正として参照すること。
> develop → main のマージはリリース判断時のみ行う。
```

### 3. ドキュメント更新担当表の CLAUDE.md 行を修正

**変更前:**
```
| `CLAUDE.md` | Claude（Naoya確認後） | 運用ルール変更時 |
```

**変更後:**
```
| `CLAUDE.md` | Claude（Naoya確認後） | 運用ルール変更時。変更はdevelop経由でマージ |
```

---

## 完了定義

- `CLAUDE.md` の対応表で `docs` / `chore` の base が `develop 経由` になっている
- 対応表直下の注記が「develop正・mainへの直行禁止」を明示している
- `CLAUDE.md` の CLAUDE.md 行にdevelop経由の記載が追加されている

---

## テスト観点

- 変更後の `CLAUDE.md` を読んだ Claude が `docs` ラベルのIssueに対してdevelopを base として起票することを口頭確認

---

## 非対象範囲

- GitHub Actionsのワークフロー変更（別Issue #182 で対応）
- `docs/dev-flow.md` の変更（別Issue #182 で対応）
- Branch Protection Rules の設定変更

---

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. PR作成（base: **develop**・ラベル: `docs`・`Closes #181` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。

---
_Claude による自動投稿_
