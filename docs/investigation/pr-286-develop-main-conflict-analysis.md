# PR #286（develop → main）コンフリクト分析 — Claude 向け

**作成日**: 2026-05-30  
**対象 PR**: https://github.com/nkhippo/ThinkGrindAi/pull/286  
**解消コミット**: develop へ `origin/main` マージ後、`CLAUDE.md` 競合解消

---

## 1. 何が起きたか（要約）

| 項目 | 内容 |
|---|---|
| PR | #286 `develop` → `main`（2026-05-30 品質改善バッチのリリース） |
| コンフリクトファイル | **`CLAUDE.md` のみ**（1 箇所） |
| 競合箇所 | 「Cursor とのコミュニケーションルール」内、Webhook 運用フロー直後 |
| develop 側 | `### PR レビューフロー（needs-review ラベル）` セクション（#283 / #284 で追加） |
| main 側 | 上記セクションなし。Webhook フロー直後に `### Bridge 方式廃止について` のみ（#274 マージ時の状態） |

**解消方針**: develop 側を正とし、両セクションをこの順で保持する。

1. `### PR レビューフロー（needs-review ラベル）`
2. `### Bridge 方式廃止について（2026-05-30）`
3. `**将来の運用フロー（Cursor ネイティブ対応時）**`

---

## 2. なぜ起きたか（根本原因）

### 2-1. 構造的原因: develop と main の「二股更新」

```
merge-base: 82bff68 (Develop #272)
     │
     ├── main:  2f68e5c (Develop #274)  ← Bridge 廃止などを main に先行反映
     │            └── CLAUDE.md: Webhook フロー直後に「Bridge 方式廃止」を挿入
     │
     └── develop: d676c15 (#285 まで 13+ commits)
                  └── CLAUDE.md: 同じアンカー付近に「PR レビューフロー」を後から挿入
                      + ルール変更セルフチェック / Obsidian 同期ルール等も大量追加
```

- **#229 以降**「全変更は develop 経由」が確定したが、**#274 は develop → main の部分同期**として main に先に入った。
- その後 develop 上で **#275〜#285** が続き、同じ `CLAUDE.md` 領域（運用フロー説明ブロック）を再度編集した。
- Git は「同じ行付近を両ブランチが独立に変更」と判断し、#286 マージ時に競合。

### 2-2. 直接原因: 同一アンカーへの追記競合

| ブランチ | 操作 | 由来 Issue |
|---|---|---|
| main | Webhook フロー ` ``` ` 閉じた直後に **Bridge 廃止** セクションを挿入 | #274（develop→main 部分マージ） |
| develop | 同じ位置に **needs-review フロー** を挿入し、その後 Bridge 廃止も保持 | #283, #284 |

main には needs-review 記述が一度も入らず、develop には #274 相当の Bridge 記述が merge-base 以降別経路で入ったため、**内容の矛盾ではなく挿入位置の競合**になった。

### 2-3. 運用上のトリガー

1. **develop → main の同期が分割**（#272 → #274 と、今回 #286）され、間に develop だけが進んだ。
2. **CLAUDE.md が高頻度で編集**される（Opus レビュー一括 docs Issue #229〜#263）。
3. **main への直行マージ履歴**（#274）が develop の最新とずれた。

---

## 3. 再発リスク評価

| 要因 | リスク | 備考 |
|---|---|---|
| バッチ docs PR を develop に集中マージ後、まとめて main へ | **高** | 今回と同型 |
| main へ部分同期（#274 型）を挟む | **高** | develop/main の二重真実 |
| `CLAUDE.md` / `dev-flow.mdc` の並行編集 | **中** | ルール変更セルフチェック（#249）で軽減可能 |
| `develop-main-conflict-check.yml`（#257） | **低〜中** | push 時に検知できるが、解消は手動 |

---

## 4. 改善案（優先度順）

### A. 運用ルールの明確化（コスト低・効果大）✅ 推奨

**ルール案（CLAUDE.md / dev-flow-runbook に追記候補）**:

> - develop → main のリリースは **原則 1 PR で全量**（部分同期 PR を挟まない）
> - main にマージした直後、**develop を main で fast-forward 同期**する（または #286 マージで自然解消）
> - main 単独で docs を直さない（develop 経由のみ）

### B. 定期同期の習慣化（コスト低）

```bash
# リリース判断前 or 大きな docs バッチ後
git checkout develop && git pull origin develop
git merge origin/main   # コンフリクトを develop 側で早めに解消
git push origin develop
```

→ #286 のような「巨大 develop→main PR」の前に、小さな sync PR を develop へ入れる。

### C. 自動検知の活用（#257 実装済み）

- `develop` push 時に `develop-main-conflict-check.yml` がコンフリクトを検知
- **改善余地**: 検知時に Naoya へ通知 + 「develop へ main を merge してください」と runbook リンク

### D. ドキュメント編集ガイド強化（#249 連携）

ルール変更セルフチェック Step 2 に追加候補:

> main ブランチにも同概念の記述がないか `git diff origin/main...HEAD -- CLAUDE.md` で確認

### E. main への部分マージ禁止の CI（コスト中）

- `main` への PR が `develop` 以外から来た場合 warn（branch protection）
- 既に「develop 経由のみ」の方針あり → GitHub Rulesets で enforce

---

## 5. 今回の解消内容

```bash
git checkout develop && git pull origin develop
git merge origin/main
# CLAUDE.md: develop 側（PR レビューフロー + Bridge 廃止）を採用
git commit && git push origin develop
```

→ PR #286 の mergeable が `MERGEABLE` になる想定。

---

## 6. Claude が次にやるとよいこと

1. **#286 マージ後**、Issue #229〜#263 が main でも正本になったことを確認
2. **改善案 A** を Naoya と合意し、必要なら `CLAUDE.md` または `docs/dev-flow-runbook.md` へ 1 段落追記する Issue を起票
3. 次回の docs バッチ前に **改善案 B**（develop へ main 先行 merge）を提案

---

## 7. 参考コマンド（再現調査用）

```bash
# merge-base
git merge-base origin/main origin/develop

# main だけが持つコミット
git log --oneline origin/develop..origin/main

# 競合ファイルの差分
git diff $(git merge-base origin/main origin/develop) origin/main -- CLAUDE.md
git diff $(git merge-base origin/main origin/develop) origin/develop -- CLAUDE.md
```
