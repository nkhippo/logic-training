/**
 * ユーザー ID を取得（なければ自動生成して localStorage に保存）
 * @returns {string}
 */
function getUserId() {
  let userId = localStorage.getItem('thinkgrindai_user_id');
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem('thinkgrindai_user_id', userId);
  }
  return userId;
}

window.getCurrentUserId = getUserId;
