# CLAUDE.md — thinkgrindai プロジェクト共通ルール

このファイルは Claude・Cursor の両者が参照するプロジェクトの共通ルールです。
新しいチャット・セッションを始めるたびに、まずこのファイルを確認してください。

---

## ルール変更時のセルフチェック手順

CLAUDE.md / dev-flow.mdc / bug-knowledge.md / bug.md / `.github/ISSUE_TEMPLATE/*` / `.cursor/rules/*` を編集する際は、Claude が**必ず以下の手順を踏む**。施策追加時の先祖帰り・矛盾・重複を防ぐためのセルフチェック。

### Step 1: 既存記述の網羅確認（grep）

変更する概念・キーワードが**他の場所にも書かれていないか**を必ず確認する：

```bash
# 例：base ブランチ判断を変更する場合
grep -nE 'base|develop|main' CLAUDE.md .cursor/rules/dev-flow.mdc docs/*.md .github/ISSUE_TEMPLATE/*.md

# 例：PR 本文形式を変更する場合
grep -nE 'PR 本文|PR Description|## 変更内容|## 実装内容' CLAUDE.md .cursor/rules/dev-flow.mdc

# 例：Obsidian 関連を変更する場合
grep -nE 'Obsidian|decisions/|implementations/' CLAUDE.md .cursor/rules/dev-flow.mdc
```

ヒットした箇所**すべて**について、以下のいずれかを判断する：

| パターン | 対応 |
|---|---|
| 完全に同一内容で重複している | 1 箇所に正を残し、他は「→ 〇〇を参照」に置換 |
| 内容が微妙に異なる（矛盾している） | どちらが「正」かを決め、矛盾を解消 |
| 古い記述（旧構成・旧運用）が残っている | 削除または更新 |
| 別概念だが用語が同じで紛らわしい | 別用語に変更、または明示的に「別概念」と注記 |

### Step 2: 連動更新の確認

変更が以下のファイルに**連動更新を必要とするか**を確認する：

- `CLAUDE.md` を変更したか？ → `.cursor/rules/dev-flow.mdc` を見るべきか確認
- `.cursor/rules/dev-flow.mdc` を変更したか？ → `CLAUDE.md` 側に逆参照が必要か確認
- `CLAUDE.md` または `dev-flow.mdc` を変更したか？
  → `git diff origin/main...HEAD -- CLAUDE.md .cursor/rules/dev-flow.mdc` で
  **main との差分**を確認し、main 側に競合しうる変更がないか確認する
- 開発フロー（Step 1〜7 / 事前確認 0〜3 / Step 3-a〜3-c）に影響するか？ → 番号体系の整合性を確認
- Bug Issue 運用に影響するか？ → `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/bug.md` を確認
- スキル（`cursor-instruction-writer/SKILL.md`）に影響するか？ → スキル更新を別 Issue で起票するか判断

### Step 3: 変更後の grep 再確認

変更完了後、もう一度 grep して以下を確認する：

- 旧記述が**完全に**消えているか（部分的な残存がないか）
- 新記述が**意図した箇所すべて**に反映されているか
- 矛盾するペアが存在しないか

### Step 4: Obsidian / 索引の更新確認

変更が以下に影響するか確認：

- `docs/ai-context/FILE_MAP.md` の索引更新が必要か
- Obsidian の `decisions/` または `confirmed-decisions/` に記録すべきか
- 月次 Opus レビュー（`docs/bug-knowledge.md`）で取り上げるべき構造的問題か

### Step 5: Issue 起票時の追記

ルール変更を含む Issue を起票する際、以下を**必ず**Issue 本文に含める：

- 「変更前」「変更後」の対比表または diff 例
- grep コマンドとその出力（網羅確認の証跡）
- 連動更新が必要な他ファイルへの参照
- 既存記述の削除箇所（あれば明示）

> ⚠️ このセルフチェックを省略してルール変更を起票した場合、レビュー時に**Re-open または差し戻し**となる。

## プロジェクト概要

- **名称**: thinkgrindai
- **内容**: 論理・思考トレーニング Web アプリ
- **リポジトリ**: https://github.com/nkhippo/ThinkGrindAi

---

## 開発体制

| 役割 | 担当 | 主な作業 |
|------|------|---------|
| PM・テスター | Naoya | 要件決定・テスト・Merge 判断 |
| 要件・仕様・Issue草稿 | Claude | アイデア整理・要件定義書・仕様書（タイプC）・Issue本文草稿（.md）作成 |
| ソースコード実装 | Cursor | Issue を読んで実装・PR 作成 |

---

## 技術スタック

- **フロントエンド**: Vite + React 18（Vercel ホスト）
- **バックエンド**: Node.js Express（`backend/`）+ Railway
- **データ**: Google Sheets（BE API 経由）
- **AI モデル**: claude-sonnet-4-6（generation: temp=0.9 / scoring: temp=0.3）
- **ソース管理**: GitHub

---

## ファイル構成

```
thinkgrindai/
├── CLAUDE.md                        ← このファイル（共通ルール）
├── index.html                       ← Vite エントリ（SPA）
├── vite.config.js
├── package.json
├── vercel.json
├── .env.example                     ← ローカル開発用設定例
├── src/
│   ├── main.jsx                     ← React エントリポイント
│   ├── App.jsx                      ← ルーティング（/logic / /thinking）
│   ├── contexts/AppContext.jsx      ← グローバル状態（useReducer）
│   ├── hooks/                       ← useAPI / useTranslation / usePersona
│   ├── services/                    ← api.js / config.js / i18n.js / persona.js / user.js
│   ├── components/
│   │   ├── layout/                  ← Header / SubTabs / BusyOverlay / Toast
│   │   ├── logic/                   ← LogicPage / tabs（fill/summary/critique/ame）/ past
│   │   ├── thinking/                ← ThinkingPage / GenerateForm / ProblemView / StepView
│   │   │                               FinalQuestionView / FeedbackView / ReflectionView
│   │   └── shared/                  ← DiffSelector / PresetRow / IndustrySelector 等
│   ├── domain/                      ← constants / industry-persona / logic-domain / thinking-domain
│   ├── logic/                       ← fillLogic / summaryLogic / critiqueLogic / ameLogic / thinkingLogic
│   ├── utils/                       ← markdown.js / migrate.js
│   └── styles/                      ← App.css
├── backend/                         ← BEサーバー（Node.js Express + Railway）
│   ├── src/
│   │   ├── index.js
│   │   ├── api/（generate-problem / score-answer / complete）
│   │   ├── services/（claude-service / sheets-service / validate-service）
│   │   └── config/
│   └── package.json
├── legacy/                          ← 旧 Vanilla JS（参照用アーカイブ、本番使用しない）
├── docs/
│   ├── TERMS.md / DOCUMENT_GUIDELINES.md / PROJECT_CONTEXT.md 等
│   ├── requirements/
│   ├── specification/
│   └── cursor-instructions/
└── .cursor/rules/dev-flow.mdc       ← Cursor 専用ルール
```

---

## 開発フロー（全7ステップ）

> ステップ3〜6は「懸念なし」の場合はスキップして短縮できる。
> 懸念の有無は Cursor の点検結果（Step 3-a）をもとに Naoya と Claude が判断する。

```
Step 1: 要件具体化（Naoya × Claude）
  Naoya が Obsidian に ideas/REQ-XXX-<名前>.md を作成
  Claude と議論 → 確定 → Google Sheets「要件確定シート」に記入

Step 2: 指示書作成（Claude が担当）
  タイプ A・B: Issue 本文草稿を .md ファイルで出力
  タイプ C: docs/requirements/ + docs/specification/ + cursor-instructions/ を作成
            → Issue 本文草稿も .md ファイルで出力
  ★ 指示書には「設計ドキュメントの整備」までを含める（Step 3-a を必ず指示する）
  → タイプ C は GitHub に docs を commit・push

GitHub Issue 作成（Claude が MCP 経由で起票、または Naoya が手動起票）
  - Claude が起票する場合：5 項目チェック OK なら `ready-for-cursor` ラベルも併せて付与
  - Naoya が起票する場合：Claude 出力の .md をコピペし、5 項目チェック後に `ready-for-cursor` を付与
  Label: feature/bug/docs/chore + ready-for-cursor + <priority>（任意）
  タイプ C: Body に docs/ の URL を記載

ready-for-cursor ラベル付与条件
  以下の5項目がすべて記載されている場合のみラベルを付与する：
  1. 背景・目的
  2. 実装範囲（対象ファイル明示）
  3. 完了定義（チェックボックスではなく、以下の状態になっていることを文章で記載）
  4. テスト観点
  5. 非対象範囲
  いずれか1つでも欠けている場合、ラベルは付与しない。

Step 3: 設計ドキュメント整備 ＋ 点検（Cursor が担当）
  a. 設計ドキュメントを整備する。併せて以下を点検し、結果を表形式で出力する
     → 詳細は .cursor/rules/dev-flow.mdc「設計ドキュメント整備フェーズ」を参照
  b. 点検結果に「持ち帰り基準」に該当する懸念があれば、持ち帰り資料を作成して Issue Comment に書き、Naoya に URL を伝える
  c. 該当しなければ、設計変更箇所・実装影響箇所をまとめて次ステップへ

Step 4: 仕様練り直し（Naoya × Claude）  ← Step 3-b がある場合のみ
  Naoya が Issue Comment の持ち帰り資料を Claude との Chat に転記して仕様を練り直す

Step 5: 指示書更新（Claude が担当）  ← Step 3-b がある場合のみ
  4 の結果を踏まえて指示書を更新する

Step 6: 再点検（Cursor が担当）  ← Step 3-b がある場合のみ
  変更箇所のみを対象に Step 3-a・3-b・3-c を再実施する
  ・懸念残存 → Step 4 に戻る（2回目以降は変更箇所のみ対象）
  ・懸念なし → Step 3-c を実施して Step 7 へ

Step 7: 実装（Cursor が担当）
  Step 3-c の成果物（設計変更箇所・実装影響箇所のまとめ）を入力として実装を行う
  a. 実装 ＋ 点検（実装中に UX・運用変更の懸念が生じた場合は Issue Comment に出力）
     → 点検の観点・出力形式は .cursor/rules/dev-flow.mdc「実装フェーズの点検」を参照
  b. 懸念あり → Issue Comment に報告 → Naoya が Claude Chat に転記 → Step 4 に戻る
     （ドキュメント整備は不要、仕様練り直しのみ）
  c. 懸念なし → 完了処理（Obsidian・Issue 整理・Google Sheets 更新）
```

---

## 品質基準

### 1. 運用ドキュメント（要件定義書・仕様書）の品質基準

> Claude が指示書を作成する際に参照する資料の品質は、Cursor の実装の質を左右する。
> 以下の基準を満たすまで仕様書・要件定義書の確定を認めない。

**仕様書に禁止する曖昧さ**
- 「自然な方法で」「直感的に」「適切に」
- 「API で得られる」（どのエンドポイント？）
- 「フロントエンドで処理する」（どのコンポーネント？）
- 「採点が厳しい」（具体的なスコア基準は？）

**仕様書に必須の記述**
- **具体的な数値・定数**（`max_tokens: 600`、`temperature: 0.3`）
- **データ構造の完全定義**（JSON 例または TypeScript 型）
- **API パラメータ**（呼び出し元ファイル・関数も列挙）
- **分岐条件**（`score >= 95 ならば` のような条件式）
- **プロンプト設計意図**（なぜこのパラメータか）

**要件定義書に禁止する記述**（技術詳細は仕様書へ）
- 実装値・JSON 構造・関数名

**要件定義書に必須の記述**
- **なぜこの機能が必要か**（背景・課題感）
- **ユーザーが何を体験するか**（具体的な UI フロー）
- **設計判断の理由**（複数案から選んだ理由）
- **制約・非機能要件**（パフォーマンス・セキュリティ）

**両者に共通：可読性**
- 図表を活用（状態遷移図・API フロー・テーブル）
- 段階性を付ける（「概要」「詳細」「エッジケース」の3段構え）
- 他ドキュメントへの参照を明示（`docs/specification/thinking/steps.md §2-3` のように）
- 用語の統一（同じ概念を複数の言葉で呼ばない）

**メンテナンス時の確認チェックリスト**
- [ ] 仕様書に「具体的な数値」が含まれているか
- [ ] 分岐条件が「式」で書かれているか
- [ ] JSON 例が含まれているか
- [ ] 他の仕様書との矛盾がないか（grep で確認）

**ドキュメント編集時に先に読むファイル**

| ファイル | 役割 |
|---|---|
| `docs/TERMS.md` | プロジェクト内の用語定義 |
| `docs/DOCUMENT_GUIDELINES.md` | ドキュメント記載粒度のガイドライン |

Claude が Cursor 向け指示書を作成する際にドキュメント編集を含む場合は、
指示書冒頭でこれらのファイルへのリンクを必ず提示すること。

Naoya が曖昧な用語（例：「ドキュメントを修正して」「難しさを変えて」）を使った場合は、
`docs/TERMS.md` を参照して具体的にどのファイル・概念を指すか確認すること。

> 💡 このセクションは Issue 起票前のセルフチェック（「#### Issue 起票前の必須チェック」内「**品質基準セルフチェック**」）で参照される。
> Issue 起票時には必ずチェックリスト形式で確認すること。

---

### 2. Cursor 指示書の品質基準

> 以下の基準をすべて満たすまで指示書を完成させないこと。

**作業分割の基準**
- 「機能等価な移植」を含む作業は、論理タブと思考トレーニングを**別指示書に分割**する
- 複雑なドメインロジックを持つ機能（採点・状態機械・AI役割分担）は UI と**別指示書に分割**する
- 目安：1指示書の作業量が「Cursor の 1 セッションで完結できる範囲」を超えないこと

**移植を含む指示書に必須の項目**

移植・React 化・リファクタリングなど既存機能を別実装に移す作業には、以下を必ず含める：
- **移植対照表**：移植元の関数/機能 → 移植先の関数/コンポーネント の対応表（全機能）
- **「移植元ファイルを全体を読むこと」という明示的な指示**
- **移植元ファイルのパス**（`legacy/` 配下など）

**完了定義の書き方**

禁止：
- 「全タブが動作する」「API と連携して動作する」「PR をマージする」

必須：
- ユーザーが体験できる具体的な動作の確認項目
- 例：「80点未満の回答を2回続けると打ち切りフィードバックが表示される」
- 複雑な機能（思考トレーニング等）は、フロー別にチェックリストを設ける

**「読むべきファイル」の明示**

指示書の「実装前に読むもの」に以下を必ず列挙する：
- 機能に関連する `docs/requirements/` のファイル
- 機能に関連する `docs/specification/` のファイル
- 移植元ファイルがある場合はそのパス（「全体を読むこと」と明記）

**指示書の自己チェック（送信前に確認）**
- [ ] 完了定義はすべて「具体的な動作」で書かれているか
- [ ] 移植を含む場合、対照表があるか
- [ ] 作業量が大きすぎないか（分割を検討したか）
- [ ] 「読むべきファイル」に仕様書・要件定義書・移植元がすべて列挙されているか

---

### 3. 運用ドキュメント更新の品質基準

> コードと同様に、ドキュメントも「実装完了 = ドキュメント更新完了」とする。
> 以下のルールに従って、ドキュメントを常に実態に合わせた状態に保つこと。

#### 上流ドキュメント（要件定義書・仕様書）は Claude が更新する

`docs/requirements/` および `docs/specification/` は **Claude が直接更新する**。
Cursor に任せず、Claude が最新の確定内容を反映した完成版を出力し、
Cursor はその内容を `git add / commit / push` するだけにする。

理由：
- 上流ドキュメントは設計意図を記述するものであり、コードを読むだけでは意図が復元できない
- Cursor が「コードに合わせてドキュメントを書く」と、実装依存の記述になりやすい

#### 下流ドキュメント（architecture.md・dev-flow.md 等）は PR に含める

コードの構造や手順を反映する下流ドキュメントは、対応する **PR に含める**。
Cursor は実装と同じ PR でドキュメントを更新する。

| ドキュメント種別 | 更新担当 | タイミング |
|---|---|---|
| `docs/requirements/` | Claude | Step 2（仕様確定時） |
| `docs/specification/` | Claude | Step 2（仕様確定時） |
| `docs/architecture.md` | Cursor | 対応 PR に含める |
| `docs/dev-flow.md` | Cursor | 対応 PR に含める |
| `CLAUDE.md` | Claude（Naoya確認後） | 運用ルール変更時。変更は develop 経由でマージ |
| `docs/ai-context/FILE_MAP.md` | Cursor | 対応 PR に含める |

#### Cursor がドキュメントを更新するときの禁止事項

- **技術的に動いているからといって、仕様書の内容を勝手に書き換えない**
  （仕様書はコードの従属物ではなく、設計意図の記録であるため）
- **既存のセクション構造（見出しレベル・順序）を変更しない**
  （Claude が次回読んだ時に混乱するため）
- **`docs/requirements/` および `docs/specification/` を単独で編集しない**
  （Claude の明示的な指示がない限り、これらのファイルは読み取り専用とみなす）

#### ドキュメント更新の確認チェックリスト（PR マージ前）

- [ ] `docs/architecture.md` の構成がコードの実態と一致しているか
- [ ] `docs/ai-context/FILE_MAP.md` に変更したファイルが反映されているか
- [ ] 更新したドキュメント内の他ファイルへの参照（パス・セクション名）が正しいか
- [ ] `TERMS.md` に新しい用語を追加すべき変更がなかったか

---

## Claude への指示

### 毎回の返答末尾に付けること

要件整理・議論・仕様作成を行った返答の末尾には、必ず以下のブロックを追加してください：

```
---
✅ この会話での確定事項
・（箇条書きで確定した内容）

📋 次のアクション（Naoya さんがやること）
1. 【ツール名】具体的な作業内容
2. 【ツール名】次の作業
   → 完了したら Claude に「〇〇が終わりました」と伝えてください

🔧 Claude が次に用意するもの（あれば）
・（次の会話で Claude が作成するもの）

📖 Wiki 修正チェックリスト（Cursor へ指示してください）
（以下、修正が必要な場合のみ記入）

修正対象: .github/wiki/<ページ名>.md
修正内容:
- セクション名: ～を追加/修正
- 追加する内容:
  ```
  〇〇について〇〇と記載
  ```
- 修正の理由: 今回確定した仕様が更新されたため

実装後、Cursor に「以下の Wiki 修正チェックリストに従ってください」とチェックリストごと貼り付けて指示してください（Cursor は `.cursor/rules/wiki-modification.mdc` に従って自動修正・push します）

---
```

Wiki の更新が不要な場合（議論・相談のみ）は、次のいずれかとする：
- `📖 Wiki 修正チェックリスト` に「修正なし（議論段階のため）」と記入する
- または当該セクションを省略する

### 仕様変更を伴う確定事項があった場合の追加チェック

要件定義書・仕様書の内容に変更が生じる確定事項があった場合、
返答末尾の「📖 Wiki 修正チェックリスト」に加えて以下も確認すること：

```
📋 索引更新チェック
- [ ] docs/ai-context/FILE_MAP.md のドキュメント一覧に変更はあるか？
      （新規ドキュメント追加・削除・行数の大幅変化）
- [ ] docs/ai-context/FILE_MAP.md のセクション索引に変更はあるか？
      （セクションの追加・削除・内容の大幅変化）
→ 変更がある場合は「📖 Wiki 修正チェックリスト」に
  docs/ai-context/FILE_MAP.md の更新内容も含めること
```

### 新しいチャットを始めるとき

チャットの最初に Naoya から以下のような情報をもらったら、フローのどのステップにいるかを判断して進めてください：

- 「新しいアイデアがある」→ Step 1 からガイド
- 「要件を詰めたい」→ Step 1 から議論開始
- 「要件定義書を作って」→ Step 2 の作業を開始
- 「Issue の文面を作って」→ Step 2 のサポート
- 「PR のテストをしたい」→ Step 7 のサポート
- 「Hotfix したい」→ Hotfix フローで Issue 草稿を作成（後述）

### Issue 分割の判断軸

Claude は以下の軸で Issue を分割するかどうかを判断し、Naoya に提示する。
Naoya が承認後に起票する。

| 判断軸 | 分割する条件 |
|---|---|
| **設計 vs 実装** | 仕様書・要件定義書の変更を伴う → `docs` Issue を先行、`feature` Issue を後続 |
| **対応規模** | 影響ファイルが5つ超 or Cursor の1セッションで完結しない量 → 機能・レイヤー単位で分割 |
| **ドキュメント独立性** | 運用ドキュメント（CLAUDE.md・dev-flow.md 等）の修正は常にコード変更から切り離して先行マージ |
| **ブロッキング関係** | B が A の完了を待たないと着手できない → A を先行 Issue に分割 |
| **リスク隔離** | 本番影響が大きい変更は単独 Issue にする |

**ラベルと base ブランチの対応**:

| ラベル | base | 用途 |
|---|---|---|
| `docs` | develop 経由 | 運用ドキュメント・仕様書のみ |
| `chore` | develop 経由 | リポジトリ整備・CI 設定等 |
| `feature` | develop 経由 | UX に影響するコード変更 |
| `bug` | develop 経由 | バグ修正（コード変更を伴う） |

> **原則**: すべての変更は develop を経由する。main への直接コミット・直行マージは禁止。
> Claude・Cursor は develop ブランチを正として参照すること。
> develop → main のマージはリリース判断時（Naoya の明示的な承認後）のみ行う。

### Issue 草稿・仕様書を作るときの形式

#### Issue 起票前の必須チェック（Claude 自身が毎回確認すること）

起票前に以下をすべて確認し、OKの場合のみ起票する。

**署名・フォーマット**
- [ ] 本文冒頭に `🤖 **Claude より**` と末尾に `_Claude による自動投稿_` を記載しているか

**タイプ判断**
- [ ] タイプ A / B / C のどれか判断したか（影響ファイル数・仕様の複雑さ）
- [ ] タイプ C の場合、docs/requirements/ → docs/specification/ → Issue の順で作成しているか

**分割判断（5軸チェック）**
- [ ] 仕様書・要件定義書の変更を伴う場合、docs Issue を先行させているか
- [ ] 影響ファイルが5つ超の場合、分割しているか
- [ ] 運用ドキュメント修正は単独 Issue にしているか

**品質基準セルフチェック（タイプ C のみ・仕様書/要件定義書を作成する場合）**

仕様書（`docs/specification*`）または要件定義書（`docs/requirements*`）を作成・更新する場合、以下を起票前に Claude が必ず確認する。1 つでも欠けていれば、起票せず仕様書を作り直す。

**仕様書チェック**
- [ ] §1「禁止する曖昧さ」が含まれていないか
  - 「自然な方法で」「直感的に」「適切に」「API で得られる」「フロントエンドで処理する」「採点が厳しい」等
- [ ] §1「必須記述」がすべて含まれているか
  - 具体的な数値・定数（`max_tokens: 600`、`temperature: 0.3` 等）
  - データ構造の完全定義（JSON 例または TypeScript 型）
  - API パラメータ（呼び出し元ファイル・関数も列挙）
  - 分岐条件（`score >= 95 ならば` のような条件式）
  - プロンプト設計意図（なぜこのパラメータか）

**要件定義書チェック**
- [ ] 技術詳細（実装値・JSON 構造・関数名）が含まれていないか
- [ ] §1「必須記述」がすべて含まれているか
  - なぜこの機能が必要か（背景・課題感）
  - ユーザーが何を体験するか（具体的な UI フロー）
  - 設計判断の理由（複数案から選んだ理由）
  - 制約・非機能要件

**共通チェック**
- [ ] 図表（状態遷移図・API フロー・テーブル）が活用されているか
- [ ] 用語が `docs/TERMS.md` と整合しているか
- [ ] 他ドキュメントへの参照が「ファイル名 §セクション番号」の形式で明示されているか

> ⚠️ 1 つでも欠けていれば、起票前に仕様書・要件定義書を補完する。Cursor の解釈ばらつきを防ぐため、起票後の修正で対応しないこと。

**ラベル付与者・タイミング**

| 起票ルート | 5 項目チェック実施者 | ラベル付与者 | タイミング |
|---|---|---|---|
| Claude が MCP 経由で起票 | Claude | **Claude（起票時に同時付与）** | Issue 起票時 |
| Naoya が GitHub UI で起票 | Naoya | **Naoya（起票直後）** | Issue 起票直後 |
| 既存 Issue への後付け | Naoya（最終確認） | **Naoya** | 起票後に内容が 5 項目を満たした時点 |

> ⚠️ Claude が起票する場合でも、Naoya が後で 5 項目チェックを再確認し、不備があればラベルを外す権限を持つ。

**ready-for-cursor ラベルの付与条件（5項目すべてそろっているか）**
- [ ] 背景・目的
- [ ] 実装範囲（対象ファイル明示）
- [ ] 完了定義（「〇〇の状態になっていること」という具体的な動作で記述）
- [ ] テスト観点
- [ ] 非対象範囲

1つでも欠けていれば `ready-for-cursor` ラベルを付与しない。

**Bug Issue の場合の追加チェック**
- [ ] Issue 本文に「## 根本原因記録（PR マージ後に Cursor が記入）」テーブルが含まれているか
  （`.github/ISSUE_TEMPLATE/bug.md` のテンプレを使う場合は自動的に含まれる）
- [ ] テンプレを使わない場合は手動で追加すること

#### Issue 起票・コメント時の署名ルール

Claude が Issue を起票・コメント追加する際は、本文冒頭に必ず以下を付ける。

```markdown
🤖 **Claude より**

（本文）

---
_Claude による自動投稿_
```

#### タイプ A・B（中規模以下）

Claude は **Issue 本文草稿を `.md` ファイルとして出力** する（チャット本文への貼り付けは行わない）。

草稿に必ず含めるセクション:
- 背景・実装範囲・完了定義
- **Obsidian記録**（PR 作成時に Cursor が `implementations/` に保存するパス・テンプレ）
- **チェックリスト**（実装完了・動作確認・PR・Obsidian 保存）
- **作業の進め方**（全 Issue に必須）

### Issue 本文に必ず含めるセクション

タイプ A・B・C 共通で、以下のセクションを Issue 本文末尾に含めること：

#### Obsidian記録
※ PR 作成時、Cursor が以下を Obsidian に自動保存すること（詳細は `CLAUDE.md`「## Obsidian 同期ルール」を参照）

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-<topic>.md`

内容（Cursor が実装結果で埋める）:
```
# <タイトル>

## 関連 Issue / PR
- Issue: #XXXX
- PR: #YYY

## 実装内容
-

## 変更ファイル
-

## 動作確認
-

## 残課題・申し送り
-
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. push（未完成でも必ずpushすること）
3. PR作成（Draft可。base・ラベルを記載）
   ※ `Closes #XXX` は develop 向け PR には書かない。リリース PR（develop→main）作成時に Claude がまとめて記載する。
   - 未完成の場合はタイトルに `[WIP]` を付けてよい
4. PR 本文の必須フォーマットは **`.cursor/rules/dev-flow.mdc`「## PR Description」を参照** すること。以下の採用版に従う：

---
## 概要
（1〜2 行で「何をしたか・なぜしたか」を要約）

## 変更内容
- （何をどう変えたか、箇条書き）

## 変更理由
- （対応する Issue の背景を踏まえて、なぜこの変更が必要だったか）

## 確認済み事項
- [ ] lint / 既存テスト通過
- [ ] 該当機能を動作確認済み
- [ ] 既存機能への影響なし

## 未確認・懸念点
- （あれば記載。なければ「なし」）

## 関連 Issue
#XXX（`Closes #XXX` は記載しない — develop 向け PR のため）
---

途中で止まってよいのは「不明点がある場合」のみ。
その場合は **必ずIssueコメントに以下を書いてから止まること**：

```
【作業中断】
- 現在の状態：（何をやったか）
- 中断理由：（何がわからないか）
- 次に必要なこと：（何があれば再開できるか）
```

作成後に Naoya に伝えること：

**[Claude が MCP 経由で起票する場合]**

```
Issue を起票しました（#XXX）。以下を実施してください：
1. 【GitHub】Issue 内容を確認
2. 【任意】優先度ラベル（critical/important/minor 等）を付与
3. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
   - ready-for-cursor ラベルは既に付与済み（5 項目チェック OK 確認済み）
```

**[Naoya が手動起票する場合]**

```
Issue 草稿（.md）を作成しました。以下を実施してください：
1. 【GitHub】草稿をコピペして Issue を作成
2. 【GitHub】5 項目チェック後に ready-for-cursor ラベルを付与
3. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
```

#### タイプ C（大規模・新機能）

以下を**この順番で**作成してください：

1. `docs/requirements/...`（要件定義書）
2. `docs/specification/...`（仕様書）
3. `docs/cursor-instructions/cursor_instruction_<name>.md`（Cursor 指示書・タイプ C のみ）
4. Issue 本文草稿（`.md` ファイル）

作成後に Naoya に伝えること：

**[Claude が MCP 経由で起票する場合]**

```
docs/ と Issue を起票しました（#XXX）。以下を実施してください：
1. 【GitHub】docs/ を commit・push（Claude が未 push の場合）
2. 【Google Sheets】REQ-XXX 行の G/H/I 列に URL を記入、ステータスを「指示書作成済」に変更
3. 【GitHub】Issue 内容を確認
4. 【任意】優先度ラベル（critical/important/minor 等）を付与
5. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
   - ready-for-cursor ラベルは既に付与済み（5 項目チェック OK 確認済み）
```

**[Naoya が手動起票する場合]**

```
docs/ と Issue 草稿を作成しました。以下を実施してください：
1. 【GitHub】docs/ を commit・push
2. 【Google Sheets】REQ-XXX 行の G/H/I 列に URL を記入、ステータスを「指示書作成済」に変更
3. 【GitHub】Issue 草稿をコピペして Issue を作成（docs/ の URL を Body に記載）
4. 【GitHub】5 項目チェック後に ready-for-cursor ラベルを付与
5. 【Cursor】Issue URL をデスクトップアプリで渡して実装依頼
```

#### タイプ B / C の判断

- **タイプ B**: 1 PR・影響ファイル 3 つ以下・仕様が Issue 内で完結
- **タイプ C**: 複数 PR・影響ファイル 4 つ以上または複数タブ・将来参照される仕様
- グレーゾーンは Claude が B 寄り / C 寄りを提示し、Naoya が最終判断

#### Hotfix フロー（タイプ A の軽量版）

> バグ・軽微な不具合で「今すぐ直したい」場合はこのフローを使う。
> Naoya は「ThinkGrindAi / Hotfix修正」Project の Chat に症状を書くだけでよい。

**Hotfix 適用判定（Claude が必ず判定する）**

Naoya から Hotfix の症状が入力されたら、Claude は以下の 3 条件をすべて満たすかを判定する：

1. **影響ファイルが 3 つ以下と見積もれる**
2. **仕様書（`docs/specification*` または `docs/requirements*`）に正解が既に明記されている**
   （新規仕様判断を必要としない。既存仕様への復帰のみ）
3. **UX 変更を伴わない**
   （ユーザーが体験する画面遷移・操作手順・文言・タイミングが変わらない）

3 条件をすべて満たす → Hotfix フローで進める（このセクション以下の手順）。  
1 つでも満たさない → 以下のメッセージで「サービス相談 Project」へ誘導する：

> このご依頼は Hotfix の適用判定基準（①影響 3 ファイル以下 ②仕様書に正解明記 ③UX 変更なし）を満たさないため、
> 「ThinkGrindAi / サービス相談」Project に書き直していただけますか？  
> 通常フロー（Step 1〜7）で要件具体化から進めます。  
> 該当しない条件: <①/②/③ のいずれか具体的に>

**Naoya の入力フォーマット**（Project Chat に貼る）：
```
## 症状
（例：穴埋めタブで「解答する」ボタンを押しても反応しない）

## 再現手順
（例：難易度3を選択 → 問題生成 → テキスト入力 → 解答するボタンをクリック）

## 期待動作
（例：採点結果が表示される）

## 補足（任意）
（例：昨日までは動いていた／Chrome のみで発生）
```

**Claude の動作**（Project の System Prompt で設定済み）：
1. Hotfix 適用判定を実施する（上記 3 条件）
2. 上記フォーマットを受け取ったら自動で Issue 草稿（.md）を出力する
3. 草稿には「再現手順・期待動作・影響ファイル候補・完了定義」を含める
4. Naoya に「GitHub Issue を作成 → Cursor に URL を渡す」手順を案内する

### Cursor の PR 作成時チェックリスト

Cursor は PR 作成前に以下を確認すること：

**実装**
- [ ] Issue の完了定義をすべて満たしているか
- [ ] 既存機能を破壊していないか

**コード品質**
- [ ] `console.log` などのデバッグ出力が残っていないか
- [ ] エラーハンドリングが実装されているか

**ドキュメント**
- [ ] タイプ B: 影響を受ける `docs/` ファイルを更新したか（該当する場合）
- [ ] タイプ C: `docs/requirements/`・`docs/specification/` を更新したか
- [ ] PR 作成時に Obsidian `implementations/` にメモを保存したか（またはフォールバックで Issue Comment に出力したか）

**PR 本文**
- [ ] `Closes #XXX` は記載しない（develop 向け PR のため）
- [ ] base ブランチが正しいか（全ラベル develop 経由）

---

## Cursor への指示

詳細は `.cursor/rules/dev-flow.mdc` を参照してください。

### 基本ルール

- 実装前に GitHub Issue 本文を熟読する（仕様の正本）
- タイプ C のみ `docs/cursor-instructions/cursor_instruction_XX.md` および requirements/specification を参照
- タイプ A・B では `cursor-instructions/` は作成・参照しない
- 既存のファイルへの変更は最小限（新機能は新規ファイルで実装）
- `docs/requirements/` および `docs/specification/` は Claude の明示的な指示がない限り編集しない
- PR 作成直後、Issue 本文の Obsidian記録セクションに従い `implementations/` にメモを自動保存すること（詳細は `CLAUDE.md`「## Obsidian 同期ルール」および `.cursor/rules/dev-flow.mdc`「Obsidian 同期タスク」を参照）
- PR 作成後、必ず Naoya へのネクストアクションを提案する
- ラベルに `bug` が含まれる Issue を完了させる場合、PR マージ後（または同一 PR 内）で `docs/bug-knowledge.md` に根本原因記録を追記すること（詳細は `.cursor/rules/dev-flow.mdc`「Bug Issue の場合の追加対応」を参照）

### 作業の進め方

PR 本文の必須フォーマットは **`.cursor/rules/dev-flow.mdc`「## PR Description」を参照** すること。

### Cursor と Naoya のコミュニケーションルール

**基本方針：Cursor とのやり取りは GitHub Issue / Comment を正とする**

- Naoya から Cursor への作業依頼は **GitHub Issue** で行う
- Cursor から Naoya への質問・報告・持ち帰り資料は **Issue Comment** に書く
- Cursor デスクトップアプリは「GitHub の URL を伝える中継手段」として使う

**現在の運用フロー（Webhook 自動起動）**

```
① Naoya が GitHub Issue を作成し、完了定義・実装範囲などを記載して
   `ready-for-cursor` ラベルを付与する
② GitHub Actions（`trigger-cursor-on-ready.yml`）が Cursor Automation の
   Webhook へ Issue 番号・本文などを POST し、Cursor が起動する
③ Cursor が Issue 本文を正本として読み、実装ブランチを作成して実装する
④ Cursor が PR を作成する（base ブランチは Issue ラベルに従う）
⑤ Cursor が Issue Comment に作業結果・懸念・質問を書く
⑥ Naoya が PR をレビューし、`ok` 等で承認 → 自動マージ（または手動マージ）
```

### PR レビューフロー（needs-review ラベル）

| イベント | ラベル変化 |
|---|---|
| Cursor が PR を作成 / 追加 push | `needs-review` が自動付与される |
| Naoya が PR をマージ | `needs-review` が自動除去される |
| Naoya が承認コメント（ok / lgtm / ✅）| `needs-review` が自動除去される |

> Naoya は GitHub の PR 一覧で `label:needs-review` フィルターを使うとレビュー待ち PR のみを表示できる。
> 付与対象は Bot / github-actions 作成 PR のみ（Naoya 本人作成 PR には付与しない）。
> PR マージ後の head ブランチ自動削除・Cursor トラブル時の対処は `docs/dev-flow-runbook.md` を参照。

### develop → main リリースルール

**必ず守ること**：

- develop → main のリリースは **原則 1 PR で全量**（部分同期 PR を挟まない）
- main に直接 docs を編集・マージしない（develop 経由のみ）
- main にマージした直後、develop を main で同期する（`git merge origin/main`）

**リリース PR 作成前の必須チェック**：

1. `git log --oneline origin/develop..origin/main` を実行して、main だけが持つコミットがないか確認
2. 存在する場合は先に `develop` へ `git merge origin/main` して sync する
3. sync 後に改めてリリース PR を作成する

**部分同期 PR が必要な緊急時**：

- Hotfix フロー（CLAUDE.md「Hotfix フロー」参照）を使う
- develop にも同内容を確実に backport すること

> 💡 main への直接 push および force push は GitHub Rulesets（「main protection」）によりブロックされている。PR 経由でのマージが必須。
> 「develop 以外からの main 向け PR の禁止」は GitHub Free では Rulesets で enforce できないため、上記運用ルールで遵守する。

### Bridge 方式廃止について（2026-05-30）

旧 Bridge workflow（`issue-to-automation-bridge.yml` / `approval-comment-automation-bridge.yml`）は廃止済み。  
Cursor の自動起動は `trigger-cursor-on-ready.yml`（Webhook 方式）に統一。  
`.cursor/automation-bridge/` ディレクトリは参照不要（Issue 本文を正本として読む）。

**将来の運用フロー（Cursor ネイティブ対応時）**

```
① Naoya が GitHub Issue を作成し、`ready-for-cursor` ラベルを付与する
② Cursor Automation が Issue のラベル変更をネイティブに検知して起動する
   （GitHub Actions による Webhook POST は不要になる想定）
③ Cursor が Issue Comment に作業結果・懸念・質問を書く
④ Naoya が GitHub で確認・返信
```

**Cursor が守るべきルール**

- 作業中に生じた懸念・質問は Cursor デスクトップアプリに直接書かず、
  **必ず Issue Comment に書いてから** URL を Naoya に伝える
- 持ち帰り資料（Step 3-b・Step 7-a）も Issue Comment に書く
- Issue Comment に書いた内容が「正」。口頭（デスクトップアプリ）でのやり取りは補足のみ

---

## Bug 対応ループ（月次運用）

Bug の根本原因を蓄積し、構造的改善に活かすためのループ：

1. **Bug Issue 完了時（Cursor）**：PR マージ後に `docs/bug-knowledge.md` 末尾に根本原因記録を追記
2. **月次レビュー時（Naoya）**：「ThinkGrindAi / サービス相談」Project で Opus に分析依頼
   - 依頼文テンプレは `docs/bug-knowledge.md`「## Opusレビュー依頼文（月1回・コピペ用）」を参照
3. **Opus 分析結果に基づく改善（Claude）**：改善提案を CLAUDE.md / dev-flow.mdc / スキルに反映

---

## Obsidian 同期ルール

### ディレクトリ構造（Naoya 側 Obsidian）

```
/Users/naoya.k/Documents/Obsidian/thinkgrindai/
├── discussions/        ← Claude × Naoya の議論ログ・要件議論
├── decisions/          ← Claude が確定した設計判断（中間成果）
├── implementations/    ← Cursor が PR 作成時に保存する実装記録（最終成果）
└── confirmed-decisions/ ← マージ済み内容の確定版（Naoya が手動整理）
```

### Cursor が保存するファイル（PR 作成時に自動）

| トリガー | 保存先 | 内容 |
|---|---|---|
| **PR 作成時（全 Issue 共通）** | `implementations/YYYY-MM-DD-<topic>.md` | 実装内容 / 変更ファイル / 関連 Issue / PR URL |
| **Bug Issue PR 作成時（追加）** | 上記に加え `docs/bug-knowledge.md` 末尾追記 | 根本原因記録（dev-flow.mdc「Bug Issue の場合の追加対応」参照） |

> ⚠️ 保存先パスは `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/` に統一する。
> 旧パス（`decisions/` 直下に実装メモを置く）は使用しない。`decisions/` は Claude が確定した設計判断専用。

### Cursor の動作（PR 作成時）

PR 作成後、以下を自動で実行する：

1. ローカル Obsidian ディレクトリにアクセス可能か確認（`/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/`）
2. **アクセス可能な場合**：
   - `YYYY-MM-DD-<topic>.md` を新規作成
   - Issue 本文の「## Obsidian記録」セクションに記載されたテンプレに従って記入
   - 内容を実際の実装結果で埋める
3. **アクセス不可の場合**（GitHub Actions Webhook 起動時など）：
   - 系統 B（リマインド設計）にフォールバック
   - PR 本文末尾または Issue Comment に保存予定の内容をリマインドとして掲載
   - Naoya が手動で Obsidian に保存できる形式で出力

### Cursor が保存する内容のテンプレ（実装記録）

```markdown
# <Issue タイトル>

## 関連 Issue / PR
- Issue: #XXX
- PR: #YYY

## 実装内容
（Cursor が実装した変更点を箇条書きで）

## 変更ファイル
（git diff --name-only の出力を貼る）

## 動作確認
（lint 結果・テスト結果・手動確認内容）

## 残課題・申し送り
（Issue Comment に書いた懸念があれば転記）
```
