/**
 * thinkgrindai フロントエンド設定
 * BE API URL を管理する（他の JS より先に読み込むこと）
 */
const CONFIG = {
  /** Railway 本番 URL */
  API_BASE_URL: 'https://thinkgrindai-production.up.railway.app',

  /** true のとき Claude 呼び出しはすべて BE 経由（ブラウザに API キー不要） */
  USE_BACKEND_API: true,

  ENDPOINTS: {
    GENERATE_PROBLEM: '/api/generate-problem',
    SCORE_ANSWER: '/api/score-answer',
    COMPLETE: '/api/complete',
    HEALTH: '/health',
  },

  /**
   * ローカル開発時: 下記を有効化し、上記 API_BASE_URL をコメントアウト。
   * BE は `cd backend && npm run dev` で起動。
   */
  // API_BASE_URL: 'http://localhost:3000',
};

window.CONFIG = CONFIG;

/**
 * BE ヘルスチェック（デバッグ用）
 * @returns {Promise<boolean>}
 */
async function checkApiHealth() {
  const base = String(CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  const path = (CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.HEALTH) || '/health';
  try {
    const res = await fetch(`${base}${path}`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

window.checkApiHealth = checkApiHealth;
