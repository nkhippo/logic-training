const GITHUB_OWNER = process.env.GITHUB_OWNER || 'nkhippo';
const GITHUB_REPO = process.env.GITHUB_REPO || 'ThinkGrindAi';
const GITHUB_API = 'https://api.github.com';

class GitHubApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

/**
 * GitHub REST API 用の共通ヘッダーを返す
 * @param {string} accessToken
 * @returns {Record<string, string>}
 */
function githubHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * GitHub Issue を作成する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} params.title
 * @param {string} params.body
 * @param {string[]} [params.labels]
 * @returns {Promise<{ number: number, title: string, url: string, labels: string[] }>}
 */
async function createGitHubIssue({ accessToken, title, body, labels = ['ready-for-cursor'] }) {
  const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: githubHeaders(accessToken),
    body: JSON.stringify({ title, body, labels }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'GitHub Issue 作成に失敗しました');
  }

  const issue = await response.json();
  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    labels: issue.labels.map((label) => label.name),
  };
}

/**
 * Issue/PR のコメント一覧を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {number} params.issueNumber
 * @returns {Promise<{ comments: Array<{ id: number, author: string, body: string, created_at: string, url: string }>, total: number }>}
 */
async function getGitHubIssueComments({ accessToken, issueNumber }) {
  const response = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`,
    { headers: githubHeaders(accessToken) }
  );

  if (!response.ok) {
    let message = 'GitHub コメント取得に失敗しました';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_err) {
      // ignore JSON parse error
    }
    throw new GitHubApiError(message, response.status);
  }

  const comments = await response.json();
  const normalized = comments.map((comment) => ({
    id: comment.id,
    author: comment.user?.login || '',
    body: comment.body || '',
    created_at: comment.created_at,
    url: comment.html_url,
  }));

  return { comments: normalized, total: normalized.length };
}

/**
 * Issue/PR にコメントを追加する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {number} params.issueNumber
 * @param {string} params.body
 * @returns {Promise<{ id: number, url: string, created_at: string }>}
 */
async function addGitHubIssueComment({ accessToken, issueNumber, body }) {
  const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: githubHeaders(accessToken),
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    let message = 'GitHub コメント追加に失敗しました';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_err) {
      // ignore JSON parse error
    }
    throw new GitHubApiError(message, response.status);
  }

  const comment = await response.json();
  return {
    id: comment.id,
    url: comment.html_url,
    created_at: comment.created_at,
  };
}

/**
 * GitHub Issue 一覧を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} [params.state]
 * @param {number} [params.perPage]
 * @returns {Promise<Array<{ number: number, title: string, url: string, labels: string[], state: string, created_at: string }>>}
 */
async function listGitHubIssues({ accessToken, state = 'open', perPage = 10 }) {
  const response = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=${state}&per_page=${perPage}`,
    { headers: githubHeaders(accessToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'GitHub Issue 一覧取得に失敗しました');
  }

  const issues = await response.json();
  return issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    labels: issue.labels.map((label) => label.name),
    state: issue.state,
    created_at: issue.created_at,
  }));
}

module.exports = {
  createGitHubIssue,
  listGitHubIssues,
  getGitHubIssueComments,
  addGitHubIssueComment,
  GitHubApiError,
  GITHUB_OWNER,
  GITHUB_REPO,
};
