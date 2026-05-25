# Cursor指示書：ドキュメント整合性の徹底修正＋運用ガイドライン整備

**作成日**: 2026-05-25  
**優先度**: 高  
**関連Issue**: なし（ドキュメント整備作業）

---

## このタスクの全体像

Opusレビューに基づいて、ドキュメントの整合性問題を解消し、今後のドキュメント編集が
基準から逸脱しないように二重チェック体制を構築する。

作業は4ステップに分かれる。

```
Step 1：気配りタブの完全削除
Step 2：ドキュメントの整合性修正（既存ファイルを上書き）
Step 3：新規ガイドラインファイルの追加
Step 4：CLAUDE.md と .cursor/rules/dev-flow.mdc の更新
```

---

## ⚠️ 作業前の必須確認

このタスクの作業に着手する前に、以下を必ず確認すること。

1. **`docs/TERMS.md` を読む**（このタスクで新規作成・上書きされる）
2. **`docs/DOCUMENT_GUIDELINES.md` を読む**（このタスクで新規作成・上書きされる）

これら2ファイルは、本タスク完了後の全ドキュメント編集作業で参照する基準ファイルである。

---

## Step 1：気配りタブの完全削除

### 1-1. 削除するファイル

```bash
rm js/logic/15-kibari.js
```

### 1-2. `logic.html` からの削除

以下の行を削除する：

```html
<!-- 気配りプレビューモーダル -->（コメント直後のモーダル全体）
<script src="js/logic/15-kibari.js" defer></script>
```

気配り関連のHTMLモーダル（`<div>` ブロック）も合わせて削除。
具体的なモーダルIDは `kibari` を含むものを `grep` で検索して特定する。

### 1-3. `js/shared/02-i18n.js` からの削除

`kbGenBtn`・`kbGenLoading`・`kibari*` 系の文言を `L.ja` `L.en` から削除する。

### 1-4. `js/shared/03-state.js` から状態変数削除

```javascript
st.kibariDiff
st.kibariScene
```

の初期化・参照箇所を削除する。

### 1-5. `js/logic/04-domain.js` から削除

```javascript
const KB_MAX_ROUNDS = ...
const KIBARI_PRESETS = ...
```

の定数定義を削除。

### 1-6. `js/logic/05-core-ui.js` からの削除

以下の箇所から `kibari` 関連の分岐を削除：

```javascript
function genPrefix(mode){ ... }   // kibari分岐
function getLoadingLabel(mode){ ... }   // kibari分岐
function resetGenConditions(mode){ ... }   // st.kibariDiff・st.kibariSceneのリセット
function getDiff(mode){ ... }   // 'kb'分岐
function getDocType(mode){ ... }   // 'kb'分岐
function getDocTypeKey(mode){ ... }   // 'kb'分岐
```

`mode === 'kibari'` および `mode === 'kb'` の分岐をすべて削除する。

### 1-7. `gas-script-v3.js` からの削除

```javascript
const KIBARI_COLS = [...]   // 定数
KIBARI_COLS への参照（doGet・doPostの分岐）
```

を削除する。
ただし、**実際のGASシートの「kibari」シートは手動で削除する必要があるため、Naoyaに通知する**。

### 1-8. `docs/architecture.md` の更新

```
08-fill.js … 15-kibari.js
```

の記載を：

```
08-fill.js … 13-past.js, 14-guide.js
```

に修正（15-kibari.jsを削除）。

### 1-9. `docs/gas-column-headers.md` の更新

`## kibari` セクション全体を削除する。

### 1-10. ガイドファイルの削除

```bash
rm guide/kibari.md guide/en/kibari.md
```

### 1-11. 既存の `js/shared/02-i18n.js` ガイド分岐から kibari を削除

`L.ja.kibariGuide` `L.en.kibariGuide` などのキーを削除。
ガイド分岐に `case 'kibari'` がある場合は削除。

### 1-12. 完了確認（grep）

```bash
grep -rn "kibari\|気配り" --include="*.js" --include="*.html" --include="*.css"
```

結果がゼロ件になることを確認。

---

## Step 2：ドキュメントの整合性修正

このステップでは、`docs/` 配下の既存ファイルを以下の指示通りに更新する。
すべての修正対象ファイルは、Claudeが作成した「修正済みバージョン」を参照する。

### 2-1. 修正対象ファイル一覧

```
docs/requirements/common.md（セクション番号修正・伝える力導線追加）
docs/requirements/logic/overview.md（crossref修正）
docs/requirements/logic/fill.md（粒度修正：難易度別を「学習体験」へ）
docs/requirements/logic/summary.md（粒度修正：同上）
docs/requirements/logic/critique.md（粒度修正：同上）
docs/requirements/logic/ame.md（粒度修正：同上）
docs/requirements/thinking/overview.md（§3-3重複修正・§3-4/§3-5繰下げ）
docs/requirements/thinking/scoring.md（crossref修正）

docs/specification/common.md（モデル変更時の手順追加）
docs/specification/logic/common.md（気配りタブ関連削除）
docs/specification/logic/critique.md（文章量400字追記）
docs/specification/logic/summary.md（temperature追記）
docs/specification/thinking/data.md（persona_snapshot詳細化・extraInfo参照化）

docs/_index.md（廃止タブ表更新・crossref修正）
```

修正済みファイルは Claudeが提供する `docs_final_v2.zip` から取得し、そのまま上書きすること。

---

## Step 3：新規ガイドラインファイルの追加

以下のファイルを **新規作成** する。内容は Claude が提供する `docs_final_v2.zip` 内の同名ファイルを使用する。

```
docs/TERMS.md                    ← プロジェクト用語定義
docs/DOCUMENT_GUIDELINES.md      ← ドキュメント記載粒度ガイドライン
```

これら2ファイルは、Claude と Cursor の両方が参照する基準ファイルである。

---

## Step 4：CLAUDE.md と .cursor/rules/dev-flow.mdc の更新

### 4-1. `CLAUDE.md` への追記

`CLAUDE.md` の冒頭付近（プロジェクト概要セクションの直前）に、以下のセクションを **追記** する：

```markdown
## 重要：ドキュメント編集時の基準ファイル

このプロジェクトでドキュメント（特に要件定義書・仕様書）を編集する際は、
以下のファイルを **必ず** 先に読むこと。

| ファイル | 役割 |
|---|---|
| `docs/TERMS.md` | プロジェクト内の用語定義（「要件定義書とは何か」など） |
| `docs/DOCUMENT_GUIDELINES.md` | ドキュメント記載粒度のガイドライン |

Claudeが Cursor向けの指示書を作成する際、ドキュメント編集を含む場合は、
指示書冒頭でこれらのファイルへのリンクを必ず提示すること。

Naoyaが曖昧な用語（例：「ドキュメントを修正して」「難しさを変えて」など）を使った場合、
Claudeは `docs/TERMS.md` を参照して具体的にどのファイル・どの概念を指すか確認すること。
```

### 4-2. `CLAUDE.md` のファイル構成セクション更新

ファイル構成ブロックを以下に置き換える：

```
docs/
├── TERMS.md                         ← プロジェクト用語定義（最優先で読む）
├── DOCUMENT_GUIDELINES.md           ← ドキュメント記載粒度ガイドライン（最優先で読む）
├── PROJECT_CONTEXT.md               ← ビジョン・ロードマップ
├── DEVELOPMENT_POLICY.md            ← 開発フロー・タスク分類
├── DESIGN_DECISION_HISTORY.md       ← 設計判断の経緯メモ
├── _index.md                        ← ドキュメント索引
├── architecture.md                  ← フロントエンド構成
├── gas-column-headers.md            ← GAS スキーマ
├── dev-flow.md                      ← 開発フロー詳細
├── requirements/
│   ├── common.md
│   ├── logic/（overview・fill・summary・critique・ame）
│   └── thinking/（overview・scoring）
├── specification/
│   ├── common.md
│   ├── logic/（common・fill・summary・critique・ame）
│   └── thinking/（overview・steps・api・data）
├── cursor-instructions/             ← Cursor向け作業指示書
└── setup/                           ← セットアップガイド
```

### 4-3. `.cursor/rules/dev-flow.mdc` への追記

`.cursor/rules/dev-flow.mdc` の「実装前に必ずやること」セクションに、新しいステップを追加する：

**追加場所**：「Step 1: GitHub Issue を確認」の前

**追加内容**：

```markdown
### Step 0: ドキュメント基準ファイルの確認（最初に必ず行う）

ドキュメント編集を含むタスクの場合、以下のファイルを最初に読むこと：

1. `docs/TERMS.md` — プロジェクト用語定義
2. `docs/DOCUMENT_GUIDELINES.md` — ドキュメント記載粒度ガイドライン

これらに従わない編集を行った場合、PR時に必ず指摘される。
編集後は、ガイドラインの §4「ドキュメントの粒度判定チェックリスト」を確認すること。

不明な用語・粒度判断に迷う場合は、実装を開始せず Naoya に確認する。
```

---

## Step 5：完了確認チェックリスト

すべての作業が完了したら、以下を確認する。

- [ ] `grep -rn "kibari\|気配り" --include="*.js" --include="*.html"` がゼロ件
- [ ] `docs/requirements/common.md` のセクション番号が §1〜§8 で連続している
- [ ] `docs/requirements/thinking/overview.md` の §3 セクションが §3-1, §3-2, §3-3, §3-4, §3-5 で連続している
- [ ] `docs/_index.md` の crossref が正しいセクション番号を指している
- [ ] `docs/TERMS.md` が新規作成されている
- [ ] `docs/DOCUMENT_GUIDELINES.md` が新規作成されている
- [ ] `CLAUDE.md` に「ドキュメント編集時の基準ファイル」セクションが追加されている
- [ ] `.cursor/rules/dev-flow.mdc` に「Step 0: ドキュメント基準ファイルの確認」が追加されている

---

## Step 6：Naoyaへの報告事項

作業完了後、以下をNaoyaに報告する：

1. **GASシートの手動削除依頼**：気配りタブの完全削除に伴い、Googleスプレッドシートの「kibari」シートを手動で削除する必要がある。Naoya自身がスプレッドシートを開いて削除する必要がある。
2. **GAS再デプロイ依頼**：`gas-script-v3.js` から `KIBARI_COLS` を削除したため、GASを再デプロイする必要がある。

---

## Step 7：git commit

```bash
git add docs/ js/ logic.html gas-script-v3.js guide/ CLAUDE.md .cursor/rules/dev-flow.mdc

git commit -m "docs/refactor: 整合性修正・ドキュメント基準ガイドライン整備・気配りタブ完全削除

- 気配りタブ（kibari）を完全削除（コード・HTML・i18n・GAS・guide・state）
- requirements/common.md のセクション番号欠番（§4）を修正
- requirements/thinking/overview.md の §3-3 重複を解消
- 各タブ要件定義書を「学習体験」記述に統一（実装値は仕様書に集約）
- specification/logic/critique.md に文章量400字を明記
- specification/logic/summary.md 採点仕様に temperature を追記
- specification/common.md にモデル変更時の手順を明記
- specification/thinking/data.md に persona_snapshot 仕様を詳細化
- crossref を全体的に修正
- 新規: docs/TERMS.md（プロジェクト用語定義）
- 新規: docs/DOCUMENT_GUIDELINES.md（記載粒度ガイドライン）
- CLAUDE.md・.cursor/rules/dev-flow.mdc にガイドライン参照を追加"

git push
```

---

## 注意事項

- 削除対象のファイル・コード行を間違えないこと
- GASシートの「kibari」シートはコードからは消せないため、必ずNaoyaに通知する
- 各ドキュメントの修正は、Claude が提供する `docs_final_v2.zip` の内容をそのまま使うこと（自分で書き直さない）
- 不明点があれば実装を中断して Naoya に確認すること
