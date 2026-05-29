# Logic Training 共通 UI 仕様

**対象ページ**: logic.html  
**バージョン**: 1.1  
**作成日**: 2026-05-25  
**最終更新**: 2026-05-29（Issue #193: logic 共通仕様ファイルを ui-shared.md に改名）

> 両サービス共通の仕様は `specification/common.md` を参照。  
> タブ別の仕様は `specification/logic/fill.md` 等を参照。

---

## 1. タブ構成

| タブID | 表示名（日） | 表示名（英） | 実装状態 |
|---|---|---|---|
| fill | 穴埋め | Fill-in | ✅ 実装済み |
| summary | 要約 | Summarize | ✅ 実装済み |
| critique | 批判読み | Critical Reading | ✅ 実装済み |
| ame | 空雨傘 | Sky-Rain-Umbrella | ✅ 実装済み |

> **廃止履歴**：気配りタブ（kibari）は2026-05-25に完全削除。
> 詳細は `DESIGN_DECISION_HISTORY.md §1-2` および `requirements/common.md §3-1` を参照。

---

## 2. テーマ選択UI仕様（全タブ共通）

各タブの「新規生成」カード内で、上から次の順に並べる。

1. **テーマ**（必須）— タブごとのプリセット（穴埋め・要約・批判読み＝文書タイプ、空雨傘＝テーマ領域）。UIラベルは全タブ「テーマ」で統一。
2. **業界**（任意）— 全タブ共通の `st.industry`。生成時に問題に保存し、問題セクションのメタ行に表示（未選択時は「未選択」）。
3. **難易度**（必須）— 5段階。初期は未選択。説明欄は問題方針のみ（穴抜き数・設問数などの自動表示はしない）。
4. **ボリューム**（要約タブのみ）— 難易度4以上のとき、難易度の下に表示。

**テーマUI仕様詳細：**
- **5列グリッド固定**（全タブで要約タブと同じ列幅）
  - CSS: `grid-template-columns: repeat(5, minmax(0, 1fr))`
  - クラス: `.preset-row.preset-row-theme`（`src/styles/App.css`）
  - コンポーネント: `src/components/shared/PresetRow.jsx`
  - 定数: `THEME_PRESET_COLS = 5`
- プリセット数が5未満のタブ（空雨傘＝4個）: 不足列は空セル（`.preset-cell-empty`）で埋め、ボタン幅を他タブと揃える
- 初期は未選択
- 難易度選択後は `minDiff` に応じて無効なテーマを無効化（`disabled` 属性）
- 生成成功後は Context の各タブ状態を更新し、テーマ・業界・難易度・ボリューム等を初期化（Vanilla 時代の `resetGenConditions()` 相当）

**問題生成後に設定を初期化する設計意図：**
毎回意図的にテーマ・難易度を選択させることで「今日はどのテーマを練習するか」という意識的な選択がトレーニングの一部になる。設定を保持すると「同じ設定で連続生成」という多様性のない使い方になりやすいため。

**テーマ一覧の設計意図：**
フリー入力時代はAIが「報告書」「調査レポート」ばかりを生成する傾向があった。
「Chat」「議事録」のような日常業務に近いシーンを起点にテーマを整備し、AIへの指示精度と問題の多様性を向上させた。
テーマプリセット定義（React 正本）: `src/domain/logic-domain.js` の `FILL_PRESETS`・`SUMMARY_PRESETS`（=FILL）・`CRITIQUE_PRESETS`・`AME_PRESETS`。  
（legacy 参照: `legacy/js/logic/04-domain.js`）  
（詳細な選定経緯は `requirements/logic/overview.md §5` を参照）

| タブ | プリセット数 | グリッド上の扱い |
|---|---|---|
| 穴埋め・要約 | 5 | 5ボタン |
| 批判読み | 5 | 5ボタン |
| 空雨傘 | 4 | 4ボタン + 1空セル |

**生成ボタンのバリデーション：**
- テーマ・難易度未選択時は API を呼ばずトースト表示（`validateBeforeGen()` → `SET_TOAST`、文言キー `themeRequired` / `diffRequired`）

---

## 3. 過去問詳細UI（React）

実装: `src/components/logic/past/PastList.jsx`  
一覧からカード選択 → 詳細ビュー。戻るボタンで一覧に復帰。

| タブ | 本文 | 設問 |
|---|---|---|
| 穴埋め | `problem-box`（`【_n_】` → 番号付き blank） | 本文内の穴（別ブロックなし） |
| 要約 | `problem-box`（`text`） | `sum-q-block`（`normSummaryProb()` で `questions` を配列化） |
| 批判読み | form A: `problem-box`（`text`） / form B: 本文なし可 | `crit-q-block`（`normCritiqueProb()`。B形式は `argument` 枠あり） |
| 空雨傘 | `problem-box`（`article`）、`law` あればラベル付き表示 | `ame-q-block`（`normAmeProb()`。傘設問に `constraint` あれば表示） |

**データ正規化：**
- `questions` は JSON 文字列または配列。`parseQuestions()` で配列に変換してから各 `norm*Prob()` に渡す
- 要約: `normSummaryProb()` — `src/domain/logic-domain.js`
- 批判読み: `normCritiqueProb()` — `src/logic/critiqueLogic.js`
- 空雨傘: `normAmeProb()` — `src/logic/ameLogic.js`

メタ行は `ProblemMeta` コンポーネント（テーマ・業界・難易度・日時）。

> 写真回答・採点の過去問フロー（`pp-*`）は Vanilla 時代の仕様。React Phase 2-2時点では詳細表示＋設問テキスト表示までを実装（採点 UI は Phase 2-3以降）。

---

## 4. 状態管理

```javascript
// React: src/contexts/AppContext.jsx（useReducer）
// legacy: js/shared/03-state.js
const st = {
  // 各タブの選択状態・問題データ等を保持
  industry: '',         // 全タブ共通の業界
  fDocType: '',         // 穴埋めテーマ
  sDocType: '',         // 要約テーマ
  cDocType: '',         // 批判読みテーマ
  aDocType: '',         // 空雨傘テーマ
  answerMode: 'text',   // 回答方式（要約・批判読み・空雨傘共通）
  // ...
};
```

---

## 5. 写真回答・過去問のスコープ

| タブ | 新規生成 | 過去問（pp） | 理由 |
|---|---|---|---|
| 穴埋め | テキストのみ | テキストのみ | 情報量が写真添削に足りない |
| 要約 | テキスト or 写真 | テキスト or 写真 | 長文回答の添削想定 |
| 批判読み | テキスト or 写真 | テキスト or 写真 | 同上 |
| 空雨傘 | テキスト or 写真 | テキスト or 写真 | 同上 |

過去問UI（`pp-*`）は要約・批判読み・空雨傘で `st.answerMode` / 写真配列を共有する。
**意図的**（同一タブ横断の回答方式）。

---

## 6. 採点時の max_tokens 設定

採点レスポンスが途中で切れないよう、全タブ共通で約1.5倍の上限を設定する。
問題生成の `max_tokens` は対象外。

| 用途 | 条件 | max_tokens |
|---|---|---|
| 穴埋め・批判読み・空雨傘 | 難易度1〜3 | 2250 |
| 穴埋め・批判読み・空雨傘 | 難易度4〜5 | 3750 |
| 要約（テキスト・写真） | 文章量 ≤500字 | 1800 |
| 要約 | 文章量 ≤2000字 | 4500 |
| 要約 | 文章量 >2000字 | 9000 |
| 写真採点（要約以外のデフォルト） | — | 3750 |

実装：`GRADE_MAX_TOKENS` 定数と `gradeMaxTokensByDiff()` / `gradeMaxTokensBySummaryLength()` を `callClaudeMsg` の引数に渡す。

---

## 7. GAS エンドポイント（論理トレーニング）

| メソッド | パラメータ | 内容 |
|---|---|---|
| GET | `?sheet=fill` | 穴埋め過去問一覧 |
| GET | `?sheet=summary` | 要約過去問一覧 |
| GET | `?sheet=critique` | 批判読み過去問一覧 |
| GET | `?sheet=ame` | 空雨傘過去問一覧 |
| POST | `{ sheet: 'fill', ... }` | 穴埋め保存 |
| POST | `{ sheet: 'summary', ... }` | 要約保存 |
| POST | `{ sheet: 'critique', ... }` | 批判読み保存 |
| POST | `{ sheet: 'ame', ... }` | 空雨傘保存 |
