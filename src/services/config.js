/**
 * フロントエンド設定（Railway BE）
 */
const CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || 'https://thinkgrindai-production.up.railway.app',
  USE_BACKEND_API: import.meta.env.VITE_USE_BACKEND_API !== 'false',
  ENDPOINTS: {
    GENERATE_PROBLEM: '/api/generate-problem',
    SCORE_ANSWER: '/api/score-answer',
    COMPLETE: '/api/complete',
    HEALTH: '/health',
  },
};

export default CONFIG;

/**
 * BE ヘルスチェック
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
  const base = String(CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  const path = CONFIG.ENDPOINTS?.HEALTH || '/health';
  try {
    const res = await fetch(`${base}${path}`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
