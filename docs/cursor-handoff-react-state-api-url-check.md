# React 状態管理・API URL 調査結果（Cursor → Claude 連携用）

**調査日**: 2025-05-27  
**対象リポジトリ**: thinkgrindai  
**調査者**: Cursor  
**背景**: `st is not defined` エラーの切り分けのため、React 側の状態初期化と API ベース URL の参照方式を確認した。

---

## Q1: `src/contexts/AppContext.jsx` または `src/App.jsx` で `st` が定義・初期化されているか？

### 結論

**いいえ。`src/` 配下には `st` という変数・状態オブジェクトは存在しない。**

React 版では **`state` / `dispatch`** という名前で Context + `useReducer` により管理されている。

### 根拠

#### `AppContext.jsx`

- `initialState` オブジェクトを定義
- `useReducer(appReducer, initialState)` で `[state, dispatch]` を生成
- `AppContext.Provider` の value は `{ state, dispatch }`
- コンポーネント向けフック: `useAppContext()` → `{ state, dispatch }` を返す

```javascript
// AppContext.jsx（要約）
const initialState = { lang: 'ja', fDiff: 0, /* ... */ };

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
```

#### `App.jsx`

- 状態の定義は**なし**
- `<AppProvider>` でルーティングをラップするのみ

```javascript
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>...</BrowserRouter>
    </AppProvider>
  );
}
```

#### `src/` 全体の grep

- `\bst\b` の一致: **0 件**（`src/logic/*.js` を含む）

### Legacy との対照

| 項目 | Legacy (`legacy/js/`) | React (`src/`) |
|------|----------------------|----------------|
| グローバル状態 | `const st = { ... }`（例: `legacy/js/shared/03-state.js`） | `state`（`useReducer` + Context） |
| 参照方法 | グローバル `st` | `const { state, dispatch } = useAppContext()` |

Legacy 配下では `st` が広く使われている（`legacy/js/logic/*.js`, `legacy/js/shared/*.js` 等）。

### `st is not defined` についての示唆

React アプリ本体（`src/`）としては状態管理の初期化は問題ない設計。

エラーが出る場合、**API 環境変数より次を疑う方が妥当**:

1. **`legacy/` の Vanilla JS がまだ読み込まれている**（`index.html` やビルド設定の混在）
2. **移植途中のコードが `st` を参照している**（現時点の `src/` grep では未検出）
3. **ブラウザコンソールのスタックトレースが `legacy/js/...` を指している**

切り分けには、エラー発生時の**スタックトレース（ファイル名・行番号）**が有用。

---

## Q2: `src/hooks/useAPI.js` で API 呼び出し時にどの URL 参照方式を使っているか？

### 結論

**`useAPI.js` 自体は URL を組み立てない。**

実際の HTTP 呼び出しは `src/services/api.js` が行い、ベース URL は **`src/services/config.js` の `CONFIG.API_BASE_URL`** を使用する。

- ✅ `import.meta.env.VITE_API_BASE_URL`（`config.js` 内）
- ✅ `CONFIG.API_BASE_URL`（`api.js` 内）
- ❌ `process.env.VITE_API_BASE_URL` は**未使用**（Vite では通常効かない）

### 呼び出し経路

```
useAPI.js
  → api.beGenerateProblem() / api.beScoreAnswer()
    → api.beFetchJson()
      → CONFIG.API_BASE_URL + path
```

#### `useAPI.js`（要約）

- `useAppContext()` で `dispatch` のみ取得（ローディング状態の反映）
- `api.beGenerateProblem` / `api.beScoreAnswer` に委譲
- URL 文字列の組み立ては**なし**

#### `config.js`（要約）

```javascript
const CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://thinkgrindai-production.up.railway.app',
  USE_BACKEND_API: import.meta.env.VITE_USE_BACKEND_API !== 'false',
  ENDPOINTS: {
    GENERATE_PROBLEM: '/api/generate-problem',
    SCORE_ANSWER: '/api/score-answer',
    COMPLETE: '/api/complete',
    HEALTH: '/health',
  },
};
export default CONFIG;
```

#### `api.js`（要約）

```javascript
import CONFIG from './config.js';

export async function beFetchJson(path, body) {
  const base = String(CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, { method: 'POST', /* ... */ });
  // ...
}
```

### 方式の比較表

| 方式 | 本プロジェクトでの使用 |
|------|------------------------|
| ❌ `process.env.VITE_API_BASE_URL` | 使っていない |
| ✅ `import.meta.env.VITE_API_BASE_URL` | `config.js` で使用 |
| ✅ `CONFIG.API_BASE_URL` | `api.js` / `checkApiHealth()` で使用 |

---

## 総合まとめ

| 質問 | 回答 |
|------|------|
| Q1: React で `st` は定義されているか？ | **いいえ**。`state` + `useAppContext()` が正。`st` は Legacy 専用。 |
| Q2: `useAPI.js` の API URL 方式は？ | **直接は組まない**。`CONFIG.API_BASE_URL`（`import.meta.env` 由来）が正。`process.env` は未使用。 |

**`st is not defined` のトリアージ方針（Cursor 見解）**

- React `src/` の状態初期化失敗というより、**Legacy コードの混入・未移植参照**を優先して調査する。
- API 問題の場合は `VITE_API_BASE_URL` / Railway BE の疎通、`CONFIG.USE_BACKEND_API` を確認する（URL 組み立てロジック自体は新方式で統一済み）。

---

## 参考ファイルパス

- `src/contexts/AppContext.jsx` — 状態の正本
- `src/App.jsx` — Provider ラップのみ
- `src/hooks/useAPI.js` — API ラッパー（dispatch のみ）
- `src/services/api.js` — fetch 実装
- `src/services/config.js` — `CONFIG.API_BASE_URL`
- `legacy/js/shared/03-state.js` — Legacy の `st` 定義
