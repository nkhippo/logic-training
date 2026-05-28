> ⚠️ **このファイルは旧形式です（Phase 1 以前の単一ファイル形式）**
>
> 現在の正本は以下に階層化されています：
> - 要件定義: `docs/requirements/{logic,thinking}/`
> - 仕様書: `docs/specification/{logic,thinking,backend,frontend}/`
>
> このファイルは参照用に残していますが、**新規変更は階層化版に行うこと**。
> 内容に齟齬がある場合は階層化版が優先されます。

# 思考トレーニング 仕様書

**バージョン**: 1.0
**作成日**: 2026-05-24
**対応要件定義書**: requirements-thinking.md Ver.1.1

> **AIへの注意書き**
> このドキュメントはCursorやClaudeへの作業指示の基準ドキュメントです。
> コード修正時は必ずこの仕様書を参照し、仕様と矛盾する実装をしないでください。
> 仕様変更が発生した場合は、コード修正と同時にこのドキュメントの該当箇所も更新してください。

---

## 1. ファイル構成

```
thinkgrindai/
├── thinking.html                ← 思考トレーニングのメインHTML
├── js/
│   ├── shared/                  ← 論理と共通で使用するJS
│   │   ├── 01-config.js         ← GAS_URL・CLAUDE_API_KEY・LANG_KEY・ENABLE_REFLECTION
│   │   ├── 02-i18n.js           ← L.ja / L.en（thinking用キーを含む）
│   │   ├── 03-state.js          ← 論理側のst（思考側は別の thinkingSt を持つ）
│   │   ├── 04-industry-persona.js ← INDUSTRY_PRESETS・JOB_PRESETS
│   │   ├── 06-utils-md.js       ← md2h / esc / safeJSON
│   │   ├── 07-api.js            ← callClaude / gasPost / ensureGasV3
│   │   ├── 08-migrate.js        ← migrateLocalStorageKeys
│   │   ├── 09-persona.js        ← loadPersonaIntoState / buildPersonaPromptNote
│   │   ├── 10-preset-ui.js
│   │   ├── 11-gas-past.js       ← setSync
│   │   └── 12-lang.js           ← getSavedLang / setSavedLang
│   └── thinking/
│       ├── domain.js            ← THINKING_*・LOGIC_CHECK_MAP・THINKING_COLS
│       └── app.js               ← thinkingSt・generateThinking など主要処理
└── guide/
    ├── thinking-overview.md     ← 日本語ガイド
    └── en/thinking-overview.md  ← 英語ガイド
```

JS読み込み順は `thinking.html` 内で固定する（後述）。

---

## 2. フロントエンド仕様

### 2-1. JS読み込み順

`thinking.html` の `</body>` 直前で以下の順に読み込む。
順序を変更しないこと（依存関係が破綻するため）。

```html
<script src="js/shared/01-config.js"></script>
<script src="js/shared/01-config.local.js"></script> <!-- 本番では存在しない -->
<script src="js/shared/02-i18n.js"></script>
<script src="js/shared/03-state.js"></script>
<script src="js/shared/04-industry-persona.js"></script>
<script src="js/shared/06-utils-md.js"></script>
<script src="js/shared/07-api.js"></script>
<script src="js/shared/08-migrate.js"></script>
<script src="js/shared/09-persona.js"></script>
<script src="js/shared/11-gas-past.js"></script>
<script src="js/shared/12-lang.js"></script>
<script src="js/thinking/domain.js"></script>
<script src="js/thinking/app.js"></script>
```

### 2-2. 状態オブジェクト

```js
const thinkingSt = {
  lang: 'ja',           // getSavedLang() の戻り
  diff: 0,              // 1〜5、未選択は0
  level: 1,             // 1〜4。難易度1〜2のときは1固定
  core: '',             // '' = ランダム、'feasibility' などの問いの核心value
  industry: '',         // INDUSTRY_PRESETS の value、空=指定なし
  problem: null,        // 現在の問題オブジェクト（後述）
  past: [],             // 過去問リスト
  busy: false,          // API実行中フラグ
};
```

### 2-3. 問題オブジェクト構造

```js
{
  id: <Number>,                  // タイムスタンプ
  core: 'feasibility',           // 問いの核心value
  diff: 3,                       // 難易度1〜5
  level: 2,                      // レベル1〜4
  date: '2026-05-24T...',        // ISO文字列
  industry: 'consulting',        // 業界value（任意）
  lang: 'ja',                    // この問題の言語
  theme: '...',                  // 短いテーマ名（15字以内）
  situation: '...',              // 題材文
  questions: [                   // レベル1・2用：扱う思考タイプと設問
    { typeId: 1, question: '...', targetChars: 200 },
    ...
  ],
  extraInfo: null,               // 仮説を揺さぶる追加情報（難易度3+で生成）
  userCore: '...',               // ユーザーが定義した問い（5-1参照）
  finalQuestion: '',             // 最終問いの文章（生成後）
  currentStepIdx: 0,             // 現在のステップ番号
  steps: [                       // 各ステップの状態
    {
      mode: 'answer'|'define'|'typeselect'|'define2',
      answer: '...',
      score: 75,
      pass: false,
      missing: ['②原因を掘り下げる', ...],
      logicIssues: ['...'],
      reason: '...',
      retryCount: 0,             // 80点未満を1回受けたら1
    }
  ],
  reflectionStep: 0,             // 0:未開始 1:D2完了 2:D3完了
  finalAnswer: '',
  finalScore: 0,
  finalRetried: false,           // 90点ルールの再回答済みフラグ
  done: false,
}
```

---

## 3. 画面構成

### 3-1. ヘッダー

左寄せ（上から順）と右寄せの2カラム構成。論理トレーニング（`logic.html`）と同一パターン。

| 位置 | 要素 | 内容 |
|---|---|---|
| 左 | サービス名 | "thinkgrindai"（小さく） |
| 左 | ページタイトル | "思考トレーニング" / "Thinking Training" |
| 左 | ガイド | "ガイド？" / "Guide?"（テキストリンク。モーダルを開く） |
| 左 | 論理トレーニングへのリンク | `← 論理トレーニング` / `← Logic Training` |
| 右 | プロフィール | ペルソナ設定モーダルを開く（論理と共有） |
| 右 | 言語 | "言語" / "Language" ボタン→モーダルで日本語・English を選択 |

### 3-2. サブタブ

- 新規生成
- 過去問

### 3-3. 新規生成エリア

**問題作成カード**（上から順）

| 項目 | 種別 | 表示条件 |
|---|---|---|
| 問いの核心 | 任意・ボタン式（ランダム＋10タイプ） | 常時 |
| 業界（テーマ） | 任意・ボタン式（INDUSTRY_PRESETS） | 常時 |
| 難易度 | 必須・1〜5の★ボタン | 常時 |
| レベル | 必須・1〜4のボタン式 | 難易度3以上のとき |
| 生成ボタン | 「問題を生成する」 | 常時 |

レベル選択ブロックは難易度1・2のときは非表示、3以上で表示する。
非表示時は `thinkingSt.level = 1` を強制する。

**問題表示エリア**（生成後に表示）

| セクション | 内容 |
|---|---|
| メタ行 | テーマ・業界・難易度バッジ・レベルバッジ |
| 状況 | `situation` の本文 |
| ステップエリア | レベルに応じて動的に生成（後述） |
| フィードバックエリア | 最終フィードバックと最終問いを表示 |
| 振り返りエリア | ENABLE_REFLECTION=trueのとき表示 |

### 3-4. ステップエリアの構成

レベルごとのステップ構成を定義する。

#### レベル1（難易度1〜5）

```
[Step0] 設問A・B・Cに回答する
        ↓
[最終問い] 「つまり、どういうこと？」（難易度2以上のみ）
        ↓
[最終フィードバック＋振り返り]
```

設問A・B・Cは1つの画面に並べて表示し、まとめて回答する。

#### レベル2（難易度3〜5）

```
[Step0] 各思考タイプの中で「何を確認するか」を定義する
        ↓ (採点：80点ルール)
[Step1] 定義した切り口に沿って回答する
        ↓ (採点：80点ルール)
[最終問い]「つまり、どういうこと？」
        ↓
[最終フィードバック＋振り返り]
```

#### レベル3（難易度3〜5）

```
[Step0] どのタイプをどの順序で使うかを選び、理由を述べる
        ↓ (採点：80点ルール)
[Step1] 選んだ順序で実際に回答する
        ↓ (採点：80点ルール)
[最終問い]「つまり、どういうこと？」
        ↓
[最終フィードバック＋振り返り]
```

#### レベル4（難易度3〜5）

```
[Step0] 「何を解くべきか」という問いを自分で定義する
        ↓ (採点：80点ルール、ここで userCore を抽出)
[Step1] 解くために使うタイプと順序を選ぶ
        ↓ (採点：80点ルール)
[Step2] 選んだ順序で実際に回答する
        ↓ (採点：80点ルール)
[最終問い]「つまり、どういうこと？」
        ↓
[最終フィードバック＋振り返り]
```

### 3-5. 80点ルールの分岐

各ステップの採点後、以下の分岐を行う（5-4参照）。

```
result.score >= 95
  → 問答無用で次のステップへ進む

80 <= result.score < 95
  → 指摘1つを表示
  → 「このまま次へ進む」「修正する」を選択
  → 「修正する」を選んだ場合、回答欄を再表示

result.score < 80 かつ retryCount === 0
  → 問い返しを表示
  → retryCount = 1
  → 回答欄を再表示

result.score < 80 かつ retryCount === 1
  → 打ち切りフィードバックを表示
  → 次のステップには進まない
  → done = true
```

打ち切りで終了した場合でも、最終問いは表示しない。

### 3-6. 最後の問いの分岐

最終問いの90点ルール（5-5参照）。

```
result.score >= 90
  → そのまま最終フィードバックへ

result.score < 90 かつ finalRetried === false
  → 1回だけ問い返しを表示
  → finalRetried = true
  → 再回答欄を表示

result.score < 90 かつ finalRetried === true
  → 最終フィードバックへ（打ち切りではなく通常フィードバック）
```

### 3-7. 振り返りエリア

`ENABLE_REFLECTION === true` のときのみ表示する。

```
[D1の問いかけ]（最終フィードバックの末尾に既に表示済み）
  ↓
[振り返り回答欄1] テキスト入力
  ↓ ユーザーが回答 or スキップ
  - 回答 → 「振り返りに回答する」ボタン → 役割D2のAPI呼び出し
  - スキップ → セッション終了

[D2のフィードバック＋深掘り問いかけ]
  ↓
[振り返り回答欄2] テキスト入力
  ↓ ユーザーが回答 or スキップ
  - 回答 → 「さらに回答する」ボタン → 役割D3のAPI呼び出し
  - スキップ → セッション終了

[D3のフィードバック]（問い返しなし・締めくくり）
```

スキップは `振り返りエリア` を `display:none` にする。

---

## 4. API呼び出し仕様

### 4-1. 共通

すべてのAPI呼び出しは `callClaude(prompt, sys, maxTokens, temperature)` を使用する。
モデル文字列は `js/shared/07-api.js` 内で固定（`claude-sonnet-4-6`）。

### 4-2. 問題生成（generateThinking）

| 項目 | 値 |
|---|---|
| temperature | 0.9 |
| max_tokens | 2000 |
| systemプロンプト | 「You are an expert in business thinking training. ...」（既存実装に準ずる） |
| 戻り値JSON | `theme / situation / extraInfo / questions[]` |

問いの核心がランダムの場合、`THINKING_CORES[lang]` から無作為に1つ選ぶ。

### 4-3. ステップ採点（gradeThinkingStep）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 600 |
| systemプロンプト | 「あなたは厳格かつ建設的なビジネス思考の採点者です。...」 |
| 戻り値JSON | `score / pass / missing / logicIssues / reason / userCore` |

採点プロンプトには以下を動的に組み込む：

- 必須項目（`THINKING_SCORE_CRITERIA[level${level}][lang].required`）
- 加点項目（`THINKING_SCORE_CRITERIA[level${level}][lang].bonus`）
- 論理整合性チェック（`buildLogicCheckPrompt(core, typeIds, isEN)` の戻り）

レベル2・3・4で `mode === 'define' / 'typeselect' / 'define2'` のとき、
JSONレスポンスに `userCore`（ユーザーが定義した問いを1文で要約したもの）を含めるよう指示する。
レベル1の `mode === 'answer'` では `userCore` は空文字でよい。

### 4-4. 問い返し生成（generateThinkingFollowup）

| 項目 | 値 |
|---|---|
| temperature | 0.7 |
| max_tokens | 300 |
| systemプロンプト | 「あなたは部下の分析をレビューする上司です。答えは教えず...」 |
| 戻り値 | プレーンテキスト（2〜3文以内） |

`strength` パラメータで強さを切り替える：
- `'soft'`：80〜95点向け（やわらかい指摘）
- `'strong'`：80点未満向け（明確で直接的）

### 4-5. 打ち切りフィードバック（generateThinkingClosingFeedback）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 800 |
| 出力形式 | Markdown（`## できていたこと` / `## 不足していた点とその理由` / `## 次回意識すべき1点`） |

### 4-6. 最終問いの文章生成（generateThinkingFinalQuestion）

| 項目 | 値 |
|---|---|
| temperature | 0.5 |
| max_tokens | 200 |
| 入力 | `userCore` と `theme` |
| 出力 | 1〜2文の質問文（プレーンテキスト） |

`userCore` が空の場合はシステムデフォルト
（`THINKING_CORE_DEFAULT_USER_CORE[lang][core]`）を使う。
最終API呼び出しが失敗した場合は固定文言にフォールバックする。

### 4-7. 最終回答の採点（gradeThinkingFinalAnswer）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 300 |
| 戻り値JSON | `score / pass / feedback` |

採点基準は `THINKING_FINAL_Q_CRITERIA[lang]` を使用する。
90点ルール（3-6参照）で分岐する。

### 4-8. 最終フィードバック＋振り返り問いかけ（showThinkingFinalFeedback）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 2000 |
| 出力形式 | Markdown |
| 入力 | `situation / core / level / missing / logicIssues / finalAnswer / finalScore` |

`ENABLE_REFLECTION === true` のとき、プロンプトに以下を追記する：

```
## 振り返り
回答パターンをもとに、以下のいずれかのパターンで1〜2問を生成してください：
- パターンX（省略・混同）：「[ステップ]で[具体的な問題]がありました。そのときの判断の根拠を振り返ってみてください」
- パターンY（自己批判）：「今回の回答全体で、最も『本当にこれで良いか』と迷った場面はどこですか？」
- パターンZ（思い込み）：「[ステップ]で[前提]を確認せずに進んだ場面がありました。なぜそこを疑わなかったと思いますか？」
```

`ENABLE_REFLECTION === false` のときはこの追記を行わない。

### 4-9. 振り返り回答へのフィードバック（submitThinkingReflection）

| ラウンド | 役割 | 必須 | 締めくくり |
|---|---|---|---|
| 1回目 | D2 | 必ず問いかけで締める | 深掘り問いかけ |
| 2回目 | D3 | 問い返しなし | 持ち帰り示唆を1つ |

| 項目 | 値 |
|---|---|
| temperature | 0.7 |
| max_tokens | 500 |
| 出力形式 | Markdown |

AIにはユーザーの回答中の「質問の有無」を自動判定させ、
質問がある場合は先に答えてから次に進むよう指示する。

---

## 5. データ仕様

### 5-1. ユーザーが定義した問い（user_core）の取得フロー

```
問題生成時：
  prob.userCore = THINKING_CORE_DEFAULT_USER_CORE[lang][prob.core]  ← デフォルトを設定

各ステップの採点後：
  if (result.userCore && result.userCore.length > 0) {
    prob.userCore = result.userCore;  ← 上書き
  }

レベル別の上書きタイミング：
  レベル1：上書きしない（システムデフォルトのまま）
  レベル2：mode === 'define2' のステップで上書き
  レベル3：mode === 'typeselect' のステップで上書き
  レベル4：mode === 'define' のステップで上書き

打ち切りで終了した場合：
  prob.userCore は最後に取得した値のまま（フォールバックとしてシステムデフォルトに戻すかは実装判断）
```

### 5-2. GAS保存スキーマ

シート名：`thinking`

| カラム | 内容 | 例 |
|---|---|---|
| id | タイムスタンプ | 1748000000000 |
| core | 問いの核心value | 'feasibility' |
| diff | 難易度1〜5 | 3 |
| level | レベル1〜4 | 2 |
| date | ISO文字列 | '2026-05-24T03:00:00.000Z' |
| industry | 業界value（空可） | 'consulting' |
| situation | 題材文 | '...' |
| questions | JSON文字列 | '[{"typeId":1,...}]' |
| user_core | システムデフォルトまたは過去のユーザー定義 | '...' |
| theme | 短いテーマ名 | '新機能開発の優先順位' |
| persona_snapshot | ペルソナのJSON文字列（空可） | '{...}' |
| lang | 言語 | 'ja' |

`THINKING_COLS` 配列で順序を固定する。

### 5-3. localStorageキー

| キー | 用途 | 共有 |
|---|---|---|
| `thinkgrindai_lang` | 言語設定 | logic / thinking 共通 |
| `thinkgrindai_persona_v1` | ペルソナ | logic / thinking 共通 |

旧キー（`logic_v10_*`）からのマイグレーションは `js/shared/08-migrate.js` で処理する。

---

## 6. 設定・定数

### 6-1. ENABLE_REFLECTION

```js
// js/shared/01-config.js
const ENABLE_REFLECTION = true;
```

| 値 | 影響範囲 |
|---|---|
| `true` | 役割D1の問いかけが最終フィードバックに含まれる。振り返りエリアが表示される。 |
| `false` | D1の問いかけ追記が省略される。振り返りエリアは生成されない。 |

### 6-2. THINKING_SITUATION_PARAMS（難易度別の生成パラメータ）

```js
const THINKING_SITUATION_PARAMS = {
  1: { minChars: 250, maxChars: 350, ambiguity: 'low',    extraInfo: false, numTypes: 2 },
  2: { minChars: 300, maxChars: 420, ambiguity: 'low',    extraInfo: false, numTypes: 2 },
  3: { minChars: 380, maxChars: 500, ambiguity: 'medium', extraInfo: true,  numTypes: 3 },
  4: { minChars: 450, maxChars: 580, ambiguity: 'high',   extraInfo: true,  numTypes: 4 },
  5: { minChars: 500, maxChars: 650, ambiguity: 'very_high', extraInfo: true, numTypes: '4-5' },
};
```

### 6-3. THINKING_COLS

```js
const THINKING_COLS = [
  'id', 'core', 'diff', 'level', 'date', 'industry',
  'situation', 'questions', 'user_core', 'theme',
  'persona_snapshot', 'lang'
];
```

---

## 7. バックエンド仕様（GAS）

### 7-1. エンドポイント

| メソッド | sheetパラメータ | 動作 |
|---|---|---|
| GET | `?sheet=thinking` | thinkingシートの全行を返す |
| POST | `{sheet: 'thinking', ...}` | thinkingシートに1行追加 |

### 7-2. 既存GAS関数への追加

`gas-script-v3.js` に以下を追加する：

```js
const THINKING_COLS = ['id','core','diff','level','date','industry','situation','questions','user_core','theme','persona_snapshot','lang'];

// doGet() のsheetName分岐に追加
if (sheetName === 'thinking') return jsonOut_(readAllRows_('thinking'));

// doPost() のsheet分岐に追加
else if (sheet === 'thinking') writeThinking_(data);

// 書き込み関数
function writeThinking_(data) {
  const sh = getSh_('thinking', THINKING_COLS);
  const row = THINKING_COLS.map(c => {
    const v = data[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sh.appendRow(row);
}
```

`readAllRows_()` の `logical === 'thinking' ? THINKING_COLS` への分岐も追加する。

---

## 8. i18nキー

`js/shared/02-i18n.js` の `L.ja` と `L.en` に以下のキーを必ず含める：

```
thinkingAppTitle, thinkingTagline,
thinkingCoreLbl, thinkingCoreRandom,
thinkingDiffLbl, thinkingLevelLbl,
thinkingGenBtn, thinkingGenLoading,
thinkingSituationLbl, thinkingQuestionsLbl,
thinkingTypeSelectLbl, thinkingTypeOrderLbl,
thinkingDefineCheckLbl, thinkingDefineQuestionLbl,
thinkingSubmitBtn, thinkingNextBtn, thinkingReviseBtn,
thinkingFinalQLbl, thinkingSubmitFinalBtn,
thinkingReflectLbl, thinkingReflectReplyBtn,
thinkingReflectSkipBtn, thinkingReflectReply2Btn,
thinkingPastLbl, thinkingNewLbl,
thinkingGenFailed, thinkingLinkToLogic,
thinkingDescs (配列・要素数4)
linkToThinking (logic.html側)
```

---

## 9. 変更履歴

| バージョン | 日付 | 内容 |
|---|---|---|
| 1.0 | 2026-05-24 | 初版作成。要件定義書Ver.1.1に対応。既存ソース（js/thinking/）の構造に整合。 |
