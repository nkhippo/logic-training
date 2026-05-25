# 思考トレーニング — 全体・画面構成仕様書

**対象ページ**: thinking.html  
**バージョン**: 1.0  
**作成日**: 2026-05-25

> 要件定義は `requirements/thinking/overview.md`、共通仕様は `specification/common.md` を参照。  
> ステップフロー詳細は `specification/thinking/steps.md`、API仕様は `specification/thinking/api.md` を参照。

---

## 1. ファイル構成（thinking専用）

```
js/thinking/
├── domain.js   # THINKING_* 定数・LOGIC_CHECK_MAP
└── app.js      # thinkingSt・generateThinking など主要処理

thinking.html   # メインHTML（JSを </body> 直前で読み込む）
```

### JS読み込み順（thinking.html）

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

順序を変更しないこと（依存関係が破綻するため）。

---

## 2. 状態オブジェクト

```js
// js/thinking/app.js 内で定義
const thinkingSt = {
  lang: 'ja',      // getSavedLang() の戻り
  diff: 0,         // 1〜5、未選択は0
  level: 1,        // 1〜4。難易度1〜2のときは1固定
  core: '',        // '' = ランダム、'feasibility' などの問いの核心value
  industry: '',    // INDUSTRY_PRESETS の value、空=指定なし
  problem: null,   // 現在の問題オブジェクト（後述）
  past: [],        // 過去問リスト
  busy: false,     // API実行中フラグ
};
```

---

## 3. 問題オブジェクト構造

```js
{
  id: <Number>,                  // タイムスタンプ
  core: 'feasibility',           // 問いの核心value
  diff: 3,                       // 難易度1〜5
  level: 2,                      // レベル1〜4
  date: '2026-05-24T...',        // ISO文字列
  industry: 'consulting',        // 業界value（任意）
  lang: 'ja',
  theme: '...',                  // 短いテーマ名（15字以内）
  situation: '...',              // 題材文
  questions: [                   // レベル1・2用：扱う思考タイプと設問
    { typeId: 1, question: '...', targetChars: 200 },
  ],
  extraInfo: null,               // 仮説を揺さぶる追加情報（難易度3以上で生成）
  userCore: '...',               // ユーザーが定義した問い
  finalQuestion: '',             // 最終問いの文章（生成後）
  currentStepIdx: 0,
  steps: [
    {
      mode: 'answer'|'define'|'typeselect'|'define2',
      answer: '...',
      score: 75,
      pass: false,
      missing: ['②原因を掘り下げる'],
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

## 4. 画面構成

### 4-1. サブタブ

- 新規生成
- 過去問

### 4-2. 新規生成エリア

**問題作成カード（上から順）**

| 項目 | 種別 | 表示条件 |
|---|---|---|
| 問いの核心 | 任意・ボタン式（ランダム＋10タイプ） | 常時 |
| 業界（テーマ） | 任意・ボタン式（INDUSTRY_PRESETS） | 常時 |
| 難易度 | 必須・1〜5 | 常時 |
| レベル | 必須・1〜4 | 難易度3以上のときのみ表示 |
| 生成ボタン | 「問題を生成する」 | 常時 |

難易度1・2のときはレベル選択ブロックを非表示にし、`thinkingSt.level = 1` を強制する。

**問題表示エリア（生成後に表示）**

| セクション | 内容 |
|---|---|
| メタ行 | テーマ・業界・難易度バッジ・レベルバッジ |
| 状況 | `situation` の本文 |
| ステップエリア | レベルに応じて動的に生成（`specification/thinking/steps.md` 参照） |
| フィードバックエリア | 最終フィードバックと最終問いを表示 |
| 振り返りエリア | ENABLE_REFLECTION=trueのとき表示 |

---

## 5. 難易度別の生成パラメータ（THINKING_SITUATION_PARAMS）

```js
const THINKING_SITUATION_PARAMS = {
  1: { minChars: 250, maxChars: 350, ambiguity: 'low',      extraInfo: false, numTypes: 2 },
  2: { minChars: 300, maxChars: 420, ambiguity: 'low',      extraInfo: false, numTypes: 2 },
  3: { minChars: 380, maxChars: 500, ambiguity: 'medium',   extraInfo: true,  numTypes: 3 },
  4: { minChars: 450, maxChars: 580, ambiguity: 'high',     extraInfo: true,  numTypes: 4 },
  5: { minChars: 500, maxChars: 650, ambiguity: 'very_high',extraInfo: true,  numTypes: '4-5' },
};
```

**各パラメータの設計意図：**
- `ambiguity`：レベルが上がるほど情報を曖昧・断片的にする。レベル4では「最近チームの動きが悪い」程度の状況文になる
- `extraInfo`：難易度3以上では「仮説を揺さぶる追加情報」を生成する。ただし現状UIには未表示（残タスク③）
- `numTypes`：使用する思考タイプ数。難易度が上がるほど多くのタイプを組み合わせる

---

## 6. 定数一覧（domain.js）

| 定数名 | 内容 |
|---|---|
| `THINKING_CORES` | 問いの核心10タイプ（日英） |
| `THINKING_TYPES` | 6つの思考タイプ（日英） |
| `THINKING_LEVELS` | 4レベル定義（日英） |
| `THINKING_CORE_DEFAULT_USER_CORE` | user_coreのシステムデフォルト（日英） |
| `LOGIC_CHECK_MAP` | 論理整合性チェック：共通＋タイプ別＋核心別 |
| `THINKING_SCORE_CRITERIA` | レベル別の80点評価基準（必須項目・加点項目） |
| `THINKING_FINAL_Q_CRITERIA` | 最終問いの評価基準 |
| `THINKING_FOLLOWUP_PATTERNS` | 問い返しパターン（思考タイプ別） |
| `THINKING_REFLECTION_PATTERNS` | 振り返りパターンX・Y・Z |
| `THINKING_SITUATION_PARAMS` | 難易度別の生成パラメータ |
| `THINKING_COLS` | GASカラム定義 |

**THINKING_FOLLOWUP_PATTERNSの使用状況（残タスク④）：**  
定数は定義済みだが、問い返し生成（役割B）ではまだAIの自由生成を使用している。
パターン定数をプロンプトに組み込むことで問い返しの質と一貫性が向上する。
対応は別途Cursor指示書を作成して実施する。

**extraInfo（追加情報）の設計と現状（残タスク③）：**

extraInfo は「一次回答後に新しい情報を提示することで、新情報が与えられたときに適切に判断を修正できるか」を訓練するための情報。ビジネス現場では「一次判断の後に新情報が出てきて判断修正を迫られる」経験が頻繁に起きるため、重要な訓練要素として設計された。

**現フェーズで先送りにした理由**：
- レベル・難易度・extraInfoのタイミング・内容制御など、設計制御要素が多く複雑すぎる
- extraInfo がなくても思考トレーニングのコアスキル（6タイプの思考操作と問い立て）は満たせる
- 将来的に別タブで鍛える可能性も見越して、まず現フェーズはシンプルな構成に絞る

**将来の対応**：
- 導入タイミング・設計内容ともに未検討（Phase 2以降で要検討）
- 「どのタイミングで開示するか」（STEP1後か、STEP2後か）も仕様未確定
