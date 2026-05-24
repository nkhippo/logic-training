# Roadmap — 開発計画・残タスク

## 全体戦略

```
Phase 1: Logic Training 磨き込み（現在）
    ↓
Phase 2: Thinking Training 実装
    ↓
Phase 3: UI/UX 改善
    ↓
Phase 4: 受験モード
    ↓
Phase 5: SaaS 化
```

---

## Phase 1: Logic Training 磨き込み（現在）

**期限**: 2025年2月末  
**ステータス**: 進行中（Ver.3.2）  
**目標**: Ver.3.5 安定版リリース

### 完了済み

- ✅ 5 タブ（穴埋め・要約・批判読み・空雨傘・積み上げ）の実装
- ✅ GAS + Google Sheets バックエンド
- ✅ 80/90 点ルール採点
- ✅ Claude Sonnet 4.6 との AI 連携

### 進行中のタスク

- ⏳ GAS 再デプロイ（新規シート「mece」追加）
- ⏳ 積み上げタブの全動作確認（STEP・上司問い返し・採点）
- ⏳ 全タブの横断テスト（バグ検出）
- ⏳ ユーザーテスト（5-10 名）

### 残タスク

- 🔲 軽微な UI 改善（ボタン・配色など）
- 🔲 モバイル対応の検討
- 🔲 パフォーマンス最適化

### 関連 Issue

- GitHub Issues の `logic-training` ラベルを参照
- または [Google Sheets - 要件確定シート](https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/)

---

## Phase 2: Thinking Training 実装

**期限**: 2025年3月末  
**ステータス**: 準備中  
**目標**: thinking.html 実装完了・ベータリリース

### 計画

- 6 タイプ × 4 レベルの思考トレーニング
- GAS・Google Sheets スキーマ拡張
- 新規タブ UI 実装

### 要件確定

- ✅ 仕様書作成完了: `docs/specification-thinking.md`
- ✅ Cursor 指示書作成完了

### 実装予定

- `js/17-thinking.js` (ロジック)
- `js/18-thinking-domain.js` (ドメイン)
- GAS に thinking シート追加

---

## Phase 3: UI/UX 改善・デザイン統一

**期限**: 2025年4月末  
**ステータス**: 検討中  
**目標**: Figma 連携・ビジュアル統一

### 計画

- Figma でのデザイン
- CSS リファクタリング
- アクセシビリティ対応
- ダークモード対応（オプション）

---

## Phase 4: 受験モード実装

**期限**: 2025年5月末  
**ステータス**: 検討中  
**目標**: 本格的な受験・採点機能

### 計画

- タイムリミット機能
- 進捗率表示
- スコアレポート生成

---

## Phase 5: マルチユーザー・SaaS 化

**期限**: 2025年6月末  
**ステータス**: 検討中  
**目標**: SaaS 化の準備

### 計画

- ユーザー認証（Google OAuth など）
- 管理ダッシュボード
- ユーザーデータ分析
- 課金機能（オプション）

---

## 残タスク一覧

### 高優先度（今月中）

| REQ ID | 内容 | ステータス |
|--------|------|-----------|
| REQ-001 | Thinking Training 実装準備 | 検討中 |
| REQ-002 | 積み上げタブ全テスト | 進行中 |
| REQ-003 | GAS 再デプロイ | 待機中 |

詳細: [Google Sheets - 要件確定シート](https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/)

### 中優先度（来月以降）

- MECE タブ（分類型）実装検討
- UI/UX 改善計画
- ユーザーテスト拡大

### 低優先度（半年以降）

- 受験モード
- マルチユーザー
- SaaS 化

---

## KPI（成功指標）

### Phase 1 の目標

- Logic Training Ver.3.5 リリース
- ユーザーテスト: 10 名完了
- バグ: 0

### 全体の目標（12 ヶ月）

- 月間アクティブユーザー: 1000 名以上
- タブ数: 10 タブ以上
- Phase 5 完了: SaaS 基盤構築

---

## 質問・提案

タスクについて質問や、「こういう機能も欲しい」という提案は：

1. GitHub Issues で feature Issue を作成
2. または Claude.ai Projects「Think Grind Ai」で新チャット
3. または Naoya に Slack で連絡

すべての声がロードマップに反映されます！
