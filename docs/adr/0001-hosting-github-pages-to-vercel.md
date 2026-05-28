# ADR-0001: Hosting を GitHub Pages から Vercel に移行

**日付**: 2026-05-25
**ステータス**: Accepted
**決定者**: Naoya

---

## コンテキスト

フロントエンド公開基盤として GitHub Pages を使っていたが、デプロイ制御・環境変数管理・運用速度の面で制約が目立ち始めた。

## 決定内容

フロントエンドのホスティング基盤を GitHub Pages から Vercel へ移行する。

## 選択肢と却下理由

| 選択肢 | 却下理由 |
|---|---|
| GitHub Pages を継続 | 環境変数運用やデプロイ運用の柔軟性が不足 |
| Vercel に移行（採用） | Vite + React 構成との相性が良く運用性が高い |

## 結果・影響

フロントエンドのデプロイ運用が簡素化され、現行の React 構成を前提にした継続運用が可能になった。

## 関連ドキュメント

- `docs/DESIGN_DECISION_HISTORY.md`
- `docs/INFRASTRUCTURE.md`
