/**
 * thinkgrindai フロントエンド設定
 * BE API URL を管理する（他の JS より先に読み込むこと）
 */
const CONFIG = {
  /** Railway 本番 URL（デプロイ後に実際の URL に合わせて更新） */
  API_BASE_URL: 'https://thinkgrindai-production.up.railway.app',

  /** true のとき問題生成・採点を BE API 経由で実行（false ならブラウザ直叩き） */
  USE_BACKEND_API: true,

  /**
   * ローカル開発時: 下記を有効化し、上記 API_BASE_URL をコメントアウト。
   * BE は `cd backend && npm run dev` で起動。
   */
  // API_BASE_URL: 'http://localhost:3000',
};

window.CONFIG = CONFIG;
