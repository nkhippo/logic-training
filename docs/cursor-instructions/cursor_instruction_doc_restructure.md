# Cursor指示書：ドキュメント構造の全面再編

**作成日**: 2026-05-25  
**優先度**: 高  
**関連Issue**: なし（ドキュメント整備作業）

---

## 概要

docs/ ディレクトリのドキュメント構造を全面再編する。
単一ファイルだった要件定義書・仕様書を、タブ・サービス単位に分割した階層構造に移行する。

---

## Step 1：新しいディレクトリ構造の作成

以下のディレクトリを作成する：

```bash
mkdir -p docs/requirements/logic
mkdir -p docs/requirements/thinking
mkdir -p docs/specification/logic
mkdir -p docs/specification/thinking
```

---

## Step 2：新規ファイルの配置

以下のファイルをリポジトリに追加する。
ファイルの内容はClaudeが作成済みのものを使用すること。

```
docs/requirements/common.md
docs/requirements/logic/overview.md
docs/requirements/logic/fill.md
docs/requirements/logic/summary.md
docs/requirements/logic/critique.md
docs/requirements/logic/ame.md
docs/requirements/thinking/overview.md
docs/requirements/thinking/scoring.md

docs/specification/common.md
docs/specification/logic/ui-shared.md
docs/specification/logic/fill.md
docs/specification/logic/summary.md
docs/specification/logic/critique.md
docs/specification/logic/ame.md
docs/specification/thinking/overview.md
docs/specification/thinking/steps.md
docs/specification/thinking/api.md
docs/specification/thinking/data.md

docs/DESIGN_DECISION_HISTORY.md  ← 設計判断の経緯メモ（新規）
docs/ai-context/FILE_MAP.md（更新版）
```

---

## Step 3：旧ファイルの処理

以下の旧ファイルは**削除せず**、先頭にdeprecation noticeを追加して残す。
理由：GitHubのWikiや既存のIssue・PRが旧ファイルをリンクしている可能性があるため。

**docs/requirements.md** の先頭に追加：
```markdown
> ⚠️ **このファイルは廃止予定です。**
> 新しいドキュメントは以下を参照してください：
> - `docs/requirements/common.md`（共通要件）
> - `docs/requirements/logic/` 以下（論理トレーニング）
```

**docs/requirements-thinking.md** の先頭に追加：
```markdown
> ⚠️ **このファイルは廃止予定です。**
> 新しいドキュメントは以下を参照してください：
> - `docs/requirements/thinking/overview.md`（思考トレーニング全体）
> - `docs/requirements/thinking/scoring.md`（採点・振り返り設計）
```

**docs/specification.md** の先頭に追加：
```markdown
> ⚠️ **このファイルは廃止予定です。**
> 新しいドキュメントは以下を参照してください：
> - `docs/specification/common.md`（共通仕様）
> - `docs/specification/logic/` 以下（論理トレーニング）
```

**docs/specification-thinking.md** の先頭に追加：
```markdown
> ⚠️ **このファイルは廃止予定です。**
> 新しいドキュメントは以下を参照してください：
> - `docs/specification/thinking/` 以下（思考トレーニング）
```

---

## Step 4：CLAUDE.md の更新

`CLAUDE.md` の「ファイル構成」セクションを以下の構造に更新する：

```
docs/
├── requirements/
│   ├── common.md
│   ├── logic/（overview・fill・summary・critique・ame）
│   └── thinking/（overview・scoring）
├── specification/
│   ├── common.md
│   ├── logic/（ui-shared・fill・summary・critique・ame）
│   └── thinking/（overview・steps・api・data）
├── cursor-instructions/
├── setup/
├── PROJECT_CONTEXT.md
├── DEVELOPMENT_POLICY.md
├── architecture.md
├── gas-column-headers.md
├── dev-flow.md
└── ai-context/FILE_MAP.md
```

---

## Step 5：完了確認チェックリスト

- [ ] `docs/requirements/` 以下：8ファイルが存在する
- [ ] `docs/specification/` 以下：10ファイルが存在する
- [ ] `docs/ai-context/FILE_MAP.md` が更新されている
- [ ] 旧4ファイルの先頭にdeprecation noticeが追加されている
- [ ] `CLAUDE.md` のファイル構成セクションが更新されている

---

## Step 6：git commit

```bash
git add docs/requirements/ docs/specification/ docs/ai-context/FILE_MAP.md
git add docs/requirements.md docs/requirements-thinking.md docs/specification.md docs/specification-thinking.md
git add docs/DESIGN_DECISION_HISTORY.md
git add CLAUDE.md
git commit -m "docs: ドキュメント構造を全面再編（requirements/ + specification/ への分割・設計経緯メモ追加）"
git push
```

---

## 注意事項

- コードへの変更は一切不要。このPRはドキュメントのみ
- ファイルの内容は変更せず、配置と旧ファイルへの案内追加のみ行う
- 完了後、Naoyaに「ドキュメント再編完了」と報告すること
