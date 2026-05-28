# Cursor 指示書（記録）：Block B 開発フロー自動化

**区分**: 完了済み記録  
**関連Issue**: 不明

## 実装概要
- Issue 起点の実装フローに合わせて、レビュー依頼から承認までの運用を自動化。
- PR 承認コメントをトリガーにしたマージ処理とラベル運用を整備。

## 主な変更ファイル
- `.github/workflows/approval.yml`
- `.github/workflows/ci.yml`
- `.cursor/rules/dev-flow.mdc`
- `docs/dev-flow.md`

## 完了確認方法
1. PR に対する承認コメントで `approval.yml` が起動すること。
2. CI で FE build と BE 起動確認が成功すること。
3. `docs/dev-flow.md` に Issue ベースの運用手順が反映されていること。
