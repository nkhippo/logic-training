# Issue Bridge Snapshot

- Issue: #179
- Title: bug: 要約タブの印刷ボタン・画像アップロード答え合わせ機能が消失
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/179
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T07:08:39Z

## Body

## 概要

要約タブに以前存在していた以下の2機能が失われている。React移行時またはリファクタリング時に脱落したと思われる。

## 失われた機能

### 1. 印刷ボタン
- ボタンを押下すると `window.print()` が発火し、ブラウザ固有の印刷プレビューが表示される
- プレビューからそのまま印刷できる

### 2. 画像アップロードによる答え合わせ
- 答え合わせの入力パターンが **2択** 存在していた
  - パターンA: テキスト入力（現在も存在）
  - パターンB: 画像アップロード（**消失**）
- 画像パターンを選択すると画像アップロードエリアが表示される
- 「答え合わせ」ボタン押下で、アップロードした画像をAI（Claude）が読み取り採点する

## 再現方法

1. 要約タブを開く
2. 印刷ボタンが存在しないことを確認
3. 答え合わせ入力方式の切り替えUI（テキスト/画像）が存在しないことを確認

## 期待する動作

- 印刷ボタンがUIに存在し、押下でブラウザの印刷ダイアログが開く
- 答え合わせ入力方式のトグル/タブがあり、「画像」を選択するとファイルアップロードエリアが表示される
- 画像アップロード後に「答え合わせ」ボタンを押すと、画像をbase64でAPIに渡してAIが採点を返す

## 実装方針（参考）

### 印刷ボタン
```tsx
<button onClick={() => window.print()}>印刷</button>
```
印刷時に不要なUIを非表示にする場合は `@media print` で制御。

### 画像アップロード答え合わせ
```tsx
// 入力方式の状態
const [answerMode, setAnswerMode] = useState<'text' | 'image'>('text');
const [imageFile, setImageFile] = useState<File | null>(null);

// 画像をbase64に変換してAPIへ
const handleImageCheck = async () => {
  if (!imageFile) return;
  const base64 = await toBase64(imageFile);
  // Claudeへ: { type: 'image', source: { type: 'base64', ... } } で送信
};
```

## 関連

- スクリーンショット参照（添付）: 現在の要約タブUI（印刷ボタン・画像入力モードなし）

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: develop、ラベル: bug、本文に `Closes #179` を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
