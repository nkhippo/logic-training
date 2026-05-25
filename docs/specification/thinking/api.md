# 思考トレーニング — API呼び出し仕様書

**バージョン**: 1.0  
**作成日**: 2026-05-25

> 採点の役割構成の要件は `requirements/thinking/scoring.md §2` を参照。

---

## 1. 共通

すべてのAPI呼び出しは `callClaude(prompt, sys, maxTokens, temperature)` を使用する。
モデル文字列は `js/shared/07-api.js` 内で固定（`claude-sonnet-4-6`）。

---

## 2. 問題生成（generateThinking）

| 項目 | 値 |
|---|---|
| temperature | 0.9 |
| max_tokens | 2000 |
| 戻り値JSON | `theme / situation / extraInfo / questions[]` |

**systemプロンプトの方針：**
教育目的・ビジネス思考トレーニング向けであることを明示。
題材は「今何を解くべきかが題材文から直接読み取れないようにする」（状況の事実と情報だけを記述）。

**問いの核心がランダムの場合：**
`THINKING_CORES[lang]` から無作為に1つ選ぶ。

**設計意図：**
temperature=0.9を使う理由は、毎回異なる業界・状況・人物構成の問題を生成するため。
同じ問いの核心でも題材が変われば全く異なる練習になる。

---

## 3. ステップ採点（gradeThinkingStep）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 600 |
| 戻り値JSON | `score / pass / missing / logicIssues / reason / userCore` |

**採点プロンプトに動的に組み込む要素：**
- 必須項目：`THINKING_SCORE_CRITERIA[level${level}][lang].required`
- 加点項目：`THINKING_SCORE_CRITERIA[level${level}][lang].bonus`
- 論理整合性チェック：`buildLogicCheckPrompt(core, typeIds, isEN)` の戻り

**user_coreの抽出：**
レベル2・3・4で `mode === 'define' / 'typeselect' / 'define2'` のとき、
JSONレスポンスに `userCore`（ユーザーが定義した問いを1文で要約）を含めるよう指示する。
レベル1の `mode === 'answer'` では `userCore` は空文字でよい。

**設計意図：**
- temperature=0.3の理由：採点基準の一貫性を最優先するため
- max_tokens=600の理由：採点結果のJSONは必要最小限。フィードバック文章はここには含まない
- JSONで返す理由：スコアのしきい値（80/95点）で分岐処理するためプログラム的に扱いやすい形式が必要

---

## 4. 問い返し生成（generateThinkingFollowup）

| 項目 | 値 |
|---|---|
| temperature | 0.7 |
| max_tokens | 300 |
| 戻り値 | プレーンテキスト（2〜3文以内） |

**systemプロンプト：**
「あなたは部下の分析をレビューする上司です。答えは教えず...」

**`strength` パラメータによる切り替え：**
- `'soft'`：80〜95点向け（やわらかい指摘）
- `'strong'`：80点未満向け（明確で直接的）

**設計意図：**
- temperature=0.7の理由：採点（0.3）ほど固くする必要はなく、自然な問い返しの言葉が出るよう少し余裕を持たせる
- プレーンテキストで返す理由：問い返しは短く対話的であり、JSON構造にする必要がない
- 2〜3文以内に制限する理由：長い問い返しは「答えを教えてしまう」リスクがあるため

---

## 5. 打ち切りフィードバック（generateThinkingClosingFeedback）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 800 |
| 出力形式 | Markdown |

**出力セクション：**
```
## できていたこと
## 不足していた点とその理由
## 次回意識すべき1点
```

**設計意図：**
打ち切りでセッションが終わっても、ユーザーが「何が足りなかったか」を持ち帰れるよう、
コンパクトだが具体的なフィードバックを出力する。
「次回意識すべき1点」に絞ることで、改善ポイントが散漫にならないようにする。

---

## 6. 最終問いの文章生成（generateThinkingFinalQuestion）

| 項目 | 値 |
|---|---|
| temperature | 0.5 |
| max_tokens | 200 |
| 入力 | `userCore` と `theme` |
| 出力 | 1〜2文の質問文（プレーンテキスト） |

`userCore` が空の場合は `THINKING_CORE_DEFAULT_USER_CORE[lang][core]` を使う。
最終API呼び出しが失敗した場合は固定文言にフォールバックする。

**設計意図：**
- temperature=0.5の理由：生成（0.9）ほど自由にする必要はないが、採点（0.3）ほど固くしない。ユーザーの問いに沿いつつ自然な問いかけを生成するため中間値を使う
- userCoreを起点にする理由：ユーザーが定義した問いに対して評価するため、最終問いもその問いに沿った文言にする必要がある

---

## 7. 最終回答の採点（gradeThinkingFinalAnswer）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 300 |
| 戻り値JSON | `score / pass / feedback` |

採点基準は `THINKING_FINAL_Q_CRITERIA[lang]` を使用する。
90点ルール（`specification/thinking/steps.md §3`）で分岐する。

---

## 8. 最終フィードバック＋振り返り問いかけ（showThinkingFinalFeedback）

| 項目 | 値 |
|---|---|
| temperature | 0.3 |
| max_tokens | 2000 |
| 出力形式 | Markdown |
| 入力 | `situation / core / level / missing / logicIssues / finalAnswer / finalScore` |

`ENABLE_REFLECTION === true` のとき、プロンプトに振り返りパターン（X・Y・Z）の生成指示を追記する。
`ENABLE_REFLECTION === false` のときはこの追記を行わない。

**設計意図：**
- 役割C（最終フィードバック）と役割D1（振り返り問いかけ）を1回のAPI呼び出しにまとめる理由：
  ユーザーへの応答速度を上げるため。D1の問いかけは最終フィードバックの文脈を踏まえて生成されるため、同時生成が自然
- 省いた視点の「影響を具体的に示す」フォーマットを使う理由：
  「②原因を掘り下げるをやるべきでした」という抽象的な指摘より、
  「②を省くと直接原因への対処しか行われず同じ問題が繰り返す」という具体的な影響の方が、
  次回の目的意識につながるから

---

## 9. 振り返り回答へのフィードバック（submitThinkingReflection）

| ラウンド | 役割 | 締めくくり |
|---|---|---|
| 1回目 | D2 | 必ず問いかけで締める（D1とは異なるパターン） |
| 2回目 | D3 | 問い返しなし・持ち帰り示唆を1つで締める |

| 項目 | 値 |
|---|---|
| temperature | 0.7 |
| max_tokens | 500 |
| 出力形式 | Markdown |

AIにはユーザーの回答中の「質問の有無」を自動判定させ、
質問がある場合は先に答えてから次に進むよう指示する。

**設計意図：**
- temperature=0.7の理由：振り返りは対話形式であり、採点より自然な言葉が求められるため
- D2で「必ず問いかけで締める」理由：ユーザーが振り返りをここで終えてもよいが、さらに深めたい場合の導線を残すため
- D3で「問い返しなし」にする理由：セッションの終わりとして、問いかけではなく「気づきの提示」で締める方が体験として完結する
