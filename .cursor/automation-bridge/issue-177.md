# Issue Bridge Snapshot

- Issue: #177
- Title: bug: ガイドモーダルの復活（React移行時に未実装）
- URL: https://github.com/nkhippo/ThinkGrindAi/issues/177
- Trigger: issues/labeled
- Updated At (UTC): 2026-05-29T06:59:09Z

## Body

## 背景・問題

legacy（Vanilla JS）では Header 右上に「ガイド？」ボタンがあり、タブ別ガイドをモーダルで表示する機能が存在していた。
React 移行時にこの機能が実装されず、ガイドが消えた状態になっている。

- i18n キー（`guideBtn` / `guideTitle` / `guideLoading` / `guideError`）は残存
- `guide/*.md`（overview / fill / summary / critique / ame、日英両対応）は残存
- `Header.jsx` にガイドボタンが存在しない → **Bug**

## 修正内容

### 1. `GuideModal.jsx` を新規作成

`src/components/shared/GuideModal.jsx`

- タブ: overview / fill / summary / critique / ame（5タブ）
- `guide/{lang}/{tab}.md` を `fetch` で取得してレンダリング（`marked` または既存の `md2h` 相当）
- 言語切替は `useTranslation` の現在 lang に追従
- キャッシュ: セッション内（`useRef` or ローカル変数）でOK
- ESC キーでクローズ
- オーバーレイクリックでクローズ

### 2. `Header.jsx` にガイドボタン追加

`src/components/layout/Header.jsx`

- `app-header-actions` 内の既存ボタン群の**左端**に追加
- ラベル: `{t('guideBtn')}` → 「ガイド？」 / 「Guide?」
- クラス: `header-action-btn no-print`（既存ボタンと統一）
- logic ページのみ表示（`page === 'logic'` のときのみ）

```jsx
// Header.jsx 追加イメージ
const [showGuide, setShowGuide] = useState(false);
// ...
<button type="button" className="header-action-btn no-print" onClick={() => setShowGuide(true)}>
  {t('guideBtn')}
</button>
// ...
{showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
```

### 3. Markdown レンダリング

- `marked`（または `markdown-it`）が未導入の場合は `npm install marked` を追加
- 既存の `src/utils/markdown.js` に `md2h` 相当があれば再利用する

### 影響ファイル

| ファイル | 変更種別 |
|---|---|
| `src/components/shared/GuideModal.jsx` | 新規作成 |
| `src/components/layout/Header.jsx` | 修正（ボタン追加、GuideModal import） |
| `package.json` | 修正（markedが未導入の場合のみ） |

## 参照

- legacy実装: `legacy/js/logic/14-guide.js`
- legacy HTML構造: `legacy/logic.html`（`guide-overlay` / `guide-modal`）
- ガイドコンテンツ: `guide/` ディレクトリ（ja/en 両対応済み）
- i18nキー: `src/services/i18n.js`（`guideBtn`, `guideTitle`, `guideLoading`, `guideError`）

## 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：

1. コミット
2. PR作成（base: develop、ラベル: bug、Closes #このIssue番号 を記載）

途中で止まってよいのは「不明点がある場合」のみ。PR Commentsに質問を書くこと。
