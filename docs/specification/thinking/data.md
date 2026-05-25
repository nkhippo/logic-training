# 思考トレーニング — データ仕様書

**バージョン**: 1.0  
**作成日**: 2026-05-25

---

## 1. user_coreの取得フロー

```
問題生成時：
  prob.userCore = THINKING_CORE_DEFAULT_USER_CORE[lang][prob.core]  ← デフォルトを設定

各ステップの採点後：
  if (result.userCore && result.userCore.length > 0 && mode !== 'answer') {
    prob.userCore = result.userCore;  ← 上書き
  }

レベル別の上書きタイミング：
  レベル1：上書きしない（システムデフォルトのまま）
  レベル2：mode === 'define2' のステップで上書き
  レベル3：mode === 'typeselect' のステップで上書き
  レベル4：mode === 'define' のステップで上書き

打ち切りで終了した場合：
  最後に取得した値のまま残す
  最終問い生成時に空ならシステムデフォルトにフォールバック
```

---

## 2. GASカラム定義（thinking シート）

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
| user_core | システムデフォルトまたはユーザー定義 | '...' |
| theme | 短いテーマ名（15字以内） | '新機能開発の優先順位' |
| persona_snapshot | ペルソナのJSON文字列（空可） | '{...}' |
| lang | 言語 | 'ja' |

カラム順序は `THINKING_COLS` 配列で固定する。

### 2-1. persona_snapshot の取得タイミングと使用方針

| タイミング | 動作 |
|---|---|
| 問題生成時 | その時点の localStorage `thinkgrindai_persona_v1` をJSON文字列化して保存 |
| 過去問再挑戦時 | **現在のペルソナを優先使用**（snapshotは「問題生成時の状態の記録」目的） |
| 後方互換 | snapshot が空（旧データ）の場合は現在のペルソナを使用 |

**設計意図**：snapshotは「この問題はどんなペルソナの想定で生成されたか」のメタ情報として保存する。
再挑戦時に snapshot を使うと、現在のペルソナと食い違って混乱するため、再挑戦時は常に現ペルソナを使用する。

---

## 3. GAS エンドポイント（thinking）

| メソッド | パラメータ | 内容 |
|---|---|---|
| GET | `?sheet=thinking` | thinkingシートの全行を返す |
| POST | `{sheet: 'thinking', ...}` | thinkingシートに1行追加 |

---

## 4. localStorageキー

`specification/common.md §6` を参照。thinking 固有のキーは存在しない。

---

## 5. ENABLE_REFLECTION フラグ

```js
// js/shared/01-config.js
const ENABLE_REFLECTION = true;
```

| 値 | 影響範囲 |
|---|---|
| `true` | 役割D1の問いかけが最終フィードバックに含まれる。振り返りエリアが表示される |
| `false` | D1の問いかけ追記が省略される。振り返りエリアは生成されない |

---

## 6. 既知の残タスク

| タスク | 内容 | 優先度 |
|---|---|---|
| ③ extraInfoのUI表示 | 詳細は `specification/thinking/overview.md §6`「extraInfo（追加情報）の設計と現状」を参照 | 低（将来検討） |
| ④ THINKING_FOLLOWUP_PATTERNSの組み込み | 問い返し生成にパターン定数を使っていない | 中 |
| ⑤ 採点スコアのブレ対処（C-4） | temperature=0.3でも採点がブレるリスクへの対応未設計 | 低（将来検討） |

詳細は Obsidian `decisions/2026-05-24_残タスク一覧.md` または `docs/15_残タスク一覧.md` を参照。
