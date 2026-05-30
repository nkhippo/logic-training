# Issue Bridge Snapshot

- Issue: #255
- Title: 【chore / Important】needs-review ラベルを Cursor の PR 作成時に自動付与する仕組みを実装
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/255
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-30T06:58:29Z

## Body

🤖 **Claude より**

## 背景・目的

Cursor が PR を作成したとき、Naoya がレビューすべき PR を GitHub 上で素早く識別できる仕組みがない。

現状では Naoya は PR 一覧を目視確認し「どれが自分のレビュー待ちか」を判断する必要がある。`needs-review` ラベルを自動付与することで、**フィルタリング一発で自分待ちの PR が抽出できる**状態を作る。

あわせて CLAUDE.md にラベルの運用ルールを追記し、レビュー完了時のラベル除去もルール化する。

旧 Issue #160 はクローズ済み（Bridge のみマージ）のため、内容を刷新して新規起票。

## 実装範囲

### 修正・作成対象ファイル
- `.github/workflows/` 配下に PR 作成トリガーの workflow（新規作成）
- `CLAUDE.md`（needs-review 運用ルールの追記）

### 具体的な実装内容

#### 1. `needs-review` ラベルの自動付与 workflow を新規作成

```
ファイル名: .github/workflows/label-pr-needs-review.yml

トリガー:
  - pull_request イベント
  - アクション: opened, reopened, synchronize（追加 push 時）

動作:
  1. PR の作成者が Cursor（ボット）または github-actions である場合に限り、
     needs-review ラベルを PR に付与する
  2. 作成者が Naoya（nkhippo）の場合は付与しない
```

> 実装前に `.github/workflows/` 既存ファイルを確認し、同様の処理が存在しないか確認すること。

#### 2. レビュー完了時のラベル除去（任意）

Naoya が `ok` / `lgtm` / ✅ 等の承認コメントをした場合、または PR を Merge した場合に `needs-review` ラベルを除去する処理を追加する。

既存の承認フロー workflow があれば、そこに追記する。なければ本 workflow に含める。

#### 3. CLAUDE.md に `needs-review` ラベルの運用ルールを追記

「## 開発フロー（全7ステップ）」内のステップ 7 の後（または「### Cursor と Naoya のコミュニケーションルール」セクション）に追記：

```markdown
### PR レビューフロー（needs-review ラベル）

| イベント | ラベル変化 |
|---|---|
| Cursor が PR を作成 / 追加 push | `needs-review` が自動付与される |
| Naoya が PR をマージ | `needs-review` が自動除去される |
| Naoya が承認コメント（ok / lgtm / ✅）| `needs-review` が自動除去される |

> Naoya は GitHub の PR 一覧で `label:needs-review` フィルターを使うとレビュー待ち PR のみを表示できる。
```

## 完了定義

- `.github/workflows/label-pr-needs-review.yml`（または同等のファイル）が存在する状態
- Cursor が PR を作成したとき、自動で `needs-review` ラベルが付与される状態
- Naoya（nkhippo）が PR を作成したときには `needs-review` ラベルが付与されない状態
- PR マージ時または承認コメント時に `needs-review` ラベルが除去される状態
- CLAUDE.md に `needs-review` の運用ルールが追記されている状態
- `needs-review` ラベルが GitHub リポジトリに登録されている状態（`gh label list` で確認）

## テスト観点

- `gh label list --repo nkhippo/ThinkGrindAi | grep needs-review` でラベルが存在すること
- テスト PR を作成し、`needs-review` ラベルが自動付与されることを Actions ログで確認する
- Naoya 本人が PR を作成したとき（または Naoya として作成したテスト）には付与されないことを確認
- PR マージ後に `needs-review` ラベルが除去されていることを確認

## 非対象範囲

- `needs-review` ラベルのスタイル（色等）は任意
- PR 承認（Approve）ボタンとの連携は対象外
- Slack / 通知連携は対象外
- Naoya の PR への適用（作成者フィルタで除外）

## 依存関係

- #251（Webhook workflow）と #253（Bridge 廃止）が先行マージされている状態が望ましい
- 本 Issue 自体は #251/#253 と独立して進めることも可能

## Obsidian記録

※ PR 作成時、Cursor が以下を Obsidian に自動保存すること

パス: `/Users/naoya.k/Documents/Obsidian/thinkgrindai/implementations/YYYY-MM-DD-needs-review-label.md`

内容:
```
# needs-review ラベル自動付与の実装
## 関連 Issue / PR
## 実装内容
## 変更ファイル
## 動作確認
## 残課題・申し送り
```

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. push
3. PR 作成（**base = `develop`**、ラベル = `chore`、`Closes #XXX`）

---
## 概要
（1〜2 行で要約）

## 変更内容
- 

## 変更理由
- Naoya がレビュー待ち PR を一目で識別できる仕組みがなかったため

## 確認済み事項
- [ ] needs-review ラベルの自動付与をテスト確認済み
- [ ] Naoya 自身の PR では付与されないことを確認済み
- [ ] ラベルが GitHub に登録されていることを確認済み

## 未確認・懸念点
- 

## 関連 Issue
Closes #XXX
---

途中で止まってよいのは「不明点がある場合」のみ。その場合は Issue コメントに書いてから止まること。

---
_Claude による自動投稿_
