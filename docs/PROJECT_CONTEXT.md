# Project Context: thinkgrindai

**最終更新**: 2026-05-26  
**バージョン**: 1.2

---

## 1. プロジェクト概要

**プロジェクト名**: thinkgrindai  
**メインサービス**: Logic Training App（論理トレーニングアプリ）  
**二次サービス**: Thinking Training（思考トレーニング）  
**ドメイン**: thinkgrindai.com（取得予定）  
**リポジトリ**: https://github.com/nkhippo/thinkgrindai

---

## 2. ビジョン・ミッション

### ビジョン
**「論理的思考を科学的にトレーニングできるプラットフォーム」**

ユーザーが体系的に論理的思考力を鍛え、日々の意思決定や問題解決の質を上げられる世界を作る。

### ミッション
1. 論理的思考の「型」を明確化し、段階的に学べるコンテンツを提供する
2. AI を活用して、個人個人に最適化された学習体験を実現する
3. 学習者が「なぜ」「どのように」思考すべきかを理解する手助けをする

---

## 3. 現在の状態（2026-05-27 時点）

### サービス
- **Logic Training App**
  - バージョン: Ver.3.2
  - 実装済みタブ: 穴埋め・要約・批判読み・空雨傘（4タブ）
  - フロントエンド: Vite + React 18（Vercel ホスト）
  - バックエンド: Node.js Express + Railway + Google Sheets
  - ステータス: React 移行完了（Phase 2-2）、論理4タブ実装済み

- **Thinking Training**
  - バージョン: Ver.1.0
  - 設計: 6タイプ × 4レベル
  - フロントエンド: React（`/thinking`）— 簡易版実装済み、フル機能は Phase 2-3 で拡張中
  - バックエンド: Node.js Express + Railway（Phase 1-3 API 対応済み）
  - ステータス: 要件定義・仕様書完成、React フル実装進行中

### 開発体制
- **Naoya**: 要件検討・テスト・全体統括
- **Claude**: アイデア整理・要件確定・Cursor 指示書作成
- **Cursor**: ソースコード実装
- **（今後）**: デザイナー（Figma 連携予定）、テスター（複数人想定）

### 開発ペース
- 軽微タスク（バグ・軽微な仕様変更）: 1日に 10～20 件
- 中規模案件（2～3 日の検討が必要）: 週 2～3 件
- 大規模案件（新機能実装）: 月 1～2 件

---

## 4. 戦略的方向性

### Phase 1: 論理トレーニング磨き込み（現在）
**期限**: 2025-02 末  
**目標**: Ver.3.2 → Ver.3.5（安定版リリース）

- GAS 再デプロイ（thinking シート追加）
- 全タブの動作確認・バグ修正
- ユーザーフィードバック改善サイクル開始

### Phase 2: 思考トレーニング実装
**期限**: 2025-03 末  
**目標**: thinking.html 実装完了・ベータリリース

- js/17-18 の実装
- GAS スクリプト拡張
- Google Sheets スキーマ拡張

### Phase 3: UI/UX 改善・デザイン統一
**期限**: 2025-04 末  
**目標**: Figma 連携・ビジュアル統一

- Figma での UI 設計
- CSS リファクタリング
- アクセシビリティ対応

### Phase 4: 受験モード・採点UI
**期限**: 2025-05 末  
**目標**: 本格的な受験・採点機能

- 受験モード UI 実装
- 採点ロジック最適化
- スコアリングシステム

### Phase 5: マルチユーザー・管理画面
**期限**: 2025-06 末  
**目標**: SaaS 化の準備

- ユーザー認証機能
- 管理ダッシュボード
- データ分析機能

---

## 5. 核となる設計理念

### 5.1 論理思考フレームワーク
```
Content (何か？)
    ↓
Reasoning (なぜ？どうやって？)
    ↓
Form (どの形式か？)
```

各タブはこのサイクルの異なる段階をトレーニング：
- **穴埋め**: Content の理解
- **要約**: Reasoning の抽出
- **批判読み**: Reasoning の検証
- **空雨傘**: Reasoning → Form への実践的応用

### 5.2 学習者のレベル設定
```
Level 1: 基礎（型を学ぶ）
Level 2: 応用（型を使う）
Level 3: 発展（型を組み合わせる）
Level 4: 実践（実ビジネスで応用）
Level 5: 高度（新しい型を作る）
```

---

## 6. 技術スタック（確定）

### フロントエンド
- HTML5 + CSS3 + Vanilla JavaScript
- GitHub Pages ホスティング

### バックエンド
- Google Apps Script (GAS)
- Google Sheets（データストア）
- Claude API (model: claude-sonnet-4-6)

### 開発補助
- GitHub (ソース管理)
- Obsidian (思考ツール)
- Google Sheets (タスク・要件管理)
- Figma (デザイン、今後)

### AI
- Claude Pro + Cursor Pro
- 生成モデル: claude-sonnet-4-6
- 設定: generation (temperature=0.9) / scoring (temperature=0.3)

---

## 7. 重要な設計決定

| 決定事項 | 方針 | 理由 |
|---------|------|------|
| **ホスティング** | GitHub Pages | シンプル、デプロイが速い |
| **バックエンド** | GAS + Sheets | スケーラビリティより速度重視 |
| **言語** | Vanilla JS | フレームワーク不要、軽量 |
| **AI モデル** | Claude Sonnet 4.6 | バランス型、学習コンテンツ生成に最適 |
| **UI/デザイン** | Bootstrap or Tailwind（保留中） | 今後 Figma と統合 |
| **認証** | 未実装（Phase 5） | MVP では不要 |
| **多言語** | 日本語優先、英語は後付け | まず日本市場を深掘り |

---

## 8. 成功指標（KPI）

### 短期（3ヶ月）
- Logic Training App: 全タブ正常動作、バグ 0
- Thinking Training: ベータリリース完了
- ユーザーテスト: 5～10 名

### 中期（6ヶ月）
- Logic Training App: Ver.3.5 安定版
- Thinking Training: Ver.1.0 正式リリース
- UI/UX 改善: Phase 3 完了
- ユーザー: 100 名以上（想定）

### 長期（12ヶ月）
- マルチユーザー・管理画面実装
- SaaS 化の基盤完成
- 月間アクティブユーザー: 1000 名以上（目標）

---

## 9. 制約・留意点

1. **開発スケジュール**: Naoya の時間は限定的（サイドプロジェクト）
2. **リソース**: Claude + Cursor を中心に回す
3. **品質**: バグは許さない（教育アプリのため）
4. **拡張性**: 将来的に複数人開発を想定
5. **保守性**: ドキュメント・コード品質を最優先

---

## 10. 今後の方向性

- **短期**: Logic Training 安定化、Thinking Training 実装開始
- **中期**: UI/UX 統一、受験モード実装
- **長期**: SaaS 化、マルチプラットフォーム化（モバイルアプリなど）

---

## 11. ドキュメント体系

このプロジェクトで管理されるドキュメント：

```
docs/
├── PROJECT_CONTEXT.md          ← このファイル（背景・ビジョン）
├── DEVELOPMENT_POLICY.md       ← 開発ルール・方針
├── requirements-logic.md       ← Logic Training 要件定義
├── requirements-thinking.md    ← Thinking Training 要件定義
├── specification-logic.md      ← Logic Training 仕様書
├── specification-thinking.md   ← Thinking Training 仕様書
├── dev-flow.md                 ← 開発フロー（Cursor・Claude の動き）
├── gas-column-headers.md       ← GAS スキーマドキュメント
└── cursor-instructions/        ← Cursor への個別指示書
```

---

## 付録: 用語定義

- **要件**: ユーザーが必要とする、実現すべき「何」
- **仕様**: 要件を実現するための技術的な「どうやって」
- **Phase**: 開発の大きなマイルストーン（1～5）
- **Version**: リリースの世代管理（Ver.X.Y）
- **Issue**: 実装・修正の最小単位（GitHub Issues）
- **PR**: コードレビュー前のコード提案（Pull Request）
