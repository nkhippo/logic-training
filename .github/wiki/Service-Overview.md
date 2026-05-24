# Service Overview — プロジェクト概要

## 🎯 thinkgrindai とは？

**論理・思考トレーニング Web アプリ**

ビジネスパーソン・学生が、段階的に論理的思考力と思考力を鍛えられる Web アプリケーションです。

### ビジョン

「論理的思考を科学的にトレーニングできるプラットフォーム」

ユーザーが体系的に論理的思考力を鍛え、日々の意思決定や問題解決の質を上げられる世界を作ります。

### ミッション

1. 論理的思考の「型」を明確化し、段階的に学べるコンテンツを提供する
2. AI を活用して、個人個人に最適化された学習体験を実現する
3. 学習者が「なぜ」「どのように」思考すべきかを理解する手助けをする

---

## 📊 現在の実装状況

### Logic Training App（論理トレーニング）

**バージョン**: Ver.3.2  
**ステータス**: 機能実装完了、磨き込みフェーズ

実装済みタブ（5つ）:

1. **穴埋め（Fill）** - Content の理解
   - 文章の空白を埋める問題
   - 難易度: Level 1-5

2. **要約（Summary）** - Reasoning の抽出
   - 文章を要約する問題
   - 難易度: Level 1-5

3. **批判読み（Critique）** - Reasoning の検証
   - 主張の根拠を検証する問題
   - 難易度: Level 1-5

4. **空雨傘（AME）** - 実践的応用
   - 事実から推測・対応案を考える
   - 難易度: Level 1-5

### Thinking Training（思考トレーニング）

**バージョン**: Ver.1.0（仕様書作成完了）  
**ステータス**: 実装待機中

- 6 タイプ × 4 レベルの思考トレーニング
- 実装予定: Phase 2（2025年3月）

---

## 🏗️ 技術スタック

- **フロントエンド**: Vanilla JavaScript + HTML5 + CSS3
- **バックエンド**: Google Apps Script + Google Sheets
- **ホスティング**: GitHub Pages
- **AI モデル**: Claude Sonnet 4.6
- **開発ツール**: Claude + Cursor

---

## 🔄 開発プロセス

### 役割分担

| 役割 | 担当 | 内容 |
|------|------|------|
| PM・テスター | Naoya | 要件決定・テスト・全体統括 |
| 要件化・仕様化 | Claude | アイデア整理・要件書・仕様書作成 |
| 実装 | Cursor | ソースコード実装・PR 作成 |

### フロー

```
Naoya のアイデア
    ↓
Claude と議論・要件確定
    ↓
Claude が要件定義書・仕様書・Cursor 指示書を作成
    ↓
GitHub Issue 作成
    ↓
Cursor が実装
    ↓
PR 作成 → Naoya がテスト → Merge
    ↓
完了
```

詳細は [Development Flow](Development-Flow) を参照

---

## 📈 戦略・ロードマップ

### Phase 1: Logic Training 磨き込み（現在）

- 期限: 2025年2月末
- 目標: Ver.3.2 → Ver.3.5（安定版）

### Phase 2: Thinking Training 実装

- 期限: 2025年3月末
- 目標: thinking.html 実装完了

### Phase 3: UI/UX 改善・デザイン統一

- 期限: 2025年4月末
- 目標: Figma 連携・ビジュアル統一

### Phase 4: 受験モード実装

- 期限: 2025年5月末
- 目標: 本格的な受験・採点機能

### Phase 5: マルチユーザー・SaaS 化

- 期限: 2025年6月末
- 目標: ユーザー認証・管理画面

詳細は [Roadmap](Roadmap) を参照

---

## 📚 コア設計理念

### 論理思考フレームワーク

```
Content（何か？）
    ↓
Reasoning（なぜ？どうやって？）
    ↓
Form（どの形式か？）
```

各タブはこのサイクルの異なる段階をトレーニングしています。

### レベル設定

```
Level 1: 基礎（型を学ぶ）
Level 2: 応用（型を使う）
Level 3: 発展（型を組み合わせる）
Level 4: 実践（実ビジネスで応用）
Level 5: 高度（新しい型を作る）
```

---

## 🔗 関連ドキュメント

- [PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md) - ビジョン・背景・戦略詳細
- [DEVELOPMENT_POLICY.md](../docs/DEVELOPMENT_POLICY.md) - 開発ルール詳細
- [要件確定シート](https://docs.google.com/spreadsheets/d/1b4bod69wE_KjM-qL4hOIa2n_MPRw8XDb6dM3RYVCTto/) - タスク管理

---

## 📞 質問・相談

- 新機能のアイデア → Claude.ai Projects「Think Grind Ai」で新チャット
- バグ報告 → GitHub Issues で bug ラベルの Issue 作成
- その他 → Naoya に Slack 連絡
