const GITHUB_OWNER = process.env.GITHUB_OWNER || 'nkhippo';
const GITHUB_REPO = process.env.GITHUB_REPO || 'ThinkGrindAi';
const GITHUB_API = 'https://api.github.com';
const MAX_FILE_SIZE_BYTES = 100 * 1024;

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
 * Base64文字列をUTF-8文字列として復号する
 * @param {string} base64Text
 * @returns {string}
 */
function decodeBase64Text(base64Text) {
  const normalized = base64Text.replace(/\n/g, '');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

/**
 * 文字列がバイナリっぽいかを判定する
 * @param {string} text
 * @returns {boolean}
 */
function isLikelyBinaryText(text) {
  return text.includes('\u0000');
}

/**
 * 参照対象リポジトリ名を確定する
 * @param {string|undefined} repo
 * @returns {string}
 */
function resolveRepo(repo) {
  if (typeof repo === 'string' && repo.trim().length > 0) {
    return repo.trim();
  }
  return GITHUB_REPO;
}

/**
 * GitHub Contents API を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} [params.path]
 * @param {string} [params.repo]
 * @returns {Promise<any>}
 */
async function fetchGitHubContents({ accessToken, path = '', repo }) {
  const targetRepo = resolveRepo(repo);
  const cleanPath = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
  const endpoint = `${GITHUB_API}/repos/${GITHUB_OWNER}/${targetRepo}/contents/${cleanPath}`;
  const response = await fetch(`${endpoint}?ref=main`, { headers: githubHeaders(accessToken) });

  if (!response.ok) {
    let message = 'GitHub ファイル取得に失敗しました';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_err) {
      // ignore JSON parse error
    }
    throw new GitHubApiError(message, response.status);
  }

  return {
    data: await response.json(),
    repo: targetRepo,
    path: cleanPath,
  };
}

/**
 * GitHub 上のテキストファイル内容を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} params.path
 * @param {string} [params.repo]
 * @returns {Promise<{ path: string, content: string, sha: string, size: number, url: string }>}
 */
async function getGitHubFileContent({ accessToken, path, repo }) {
  const result = await fetchGitHubContents({ accessToken, path, repo });
  const file = result.data;

  if (Array.isArray(file) || file.type !== 'file') {
    throw new GitHubApiError('指定パスはファイルではありません', 400);
  }

  if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE_BYTES) {
    throw new GitHubApiError('ファイルが大きすぎます（100KB以下のみ対応）', 400);
  }

  if (file.encoding !== 'base64' || typeof file.content !== 'string') {
    throw new GitHubApiError('テキストファイルのみ対応しています', 400);
  }

  const content = decodeBase64Text(file.content);
  if (isLikelyBinaryText(content)) {
    throw new GitHubApiError('テキストファイルのみ対応しています', 400);
  }

  return {
    path: result.path,
    content,
    sha: file.sha,
    size: file.size,
    url: file.html_url,
  };
}

/**
 * GitHub 上のディレクトリ一覧（1階層）を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} [params.path]
 * @param {string} [params.repo]
 * @returns {Promise<{ path: string, entries: Array<{ name: string, type: string, size: number }>, total: number, url: string }>}
 */
async function listGitHubDirectory({ accessToken, path = '', repo }) {
  const result = await fetchGitHubContents({ accessToken, path, repo });
  const entries = result.data;

  if (!Array.isArray(entries)) {
    throw new GitHubApiError('指定パスはディレクトリではありません', 400);
  }

  const normalized = entries.map((entry) => ({
    name: entry.name,
    type: entry.type === 'dir' ? 'dir' : 'file',
    size: entry.type === 'file' ? entry.size || 0 : 0,
  }));

  return {
    path: result.path,
    entries: normalized,
    total: normalized.length,
    url:
      result.path.length > 0
        ? `https://github.com/${GITHUB_OWNER}/${result.repo}/tree/main/${result.path}`
        : `https://github.com/${GITHUB_OWNER}/${result.repo}`,
  };
}

/**
 * GitHub PR の diff 情報を取得する
 * @param {object} params
 * @param {string} params.accessToken
 * @param {number} params.prNumber
 * @returns {Promise<{ pr_number: number, title: string, base: string, head: string, state: string, files: Array<{ filename: string, status: string, additions: number, deletions: number, patch: string }>, total_additions: number, total_deletions: number, total_files: number }>}
 */
async function getGitHubPrDiff({ accessToken, prNumber }) {
  const prResponse = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${prNumber}`, {
    headers: githubHeaders(accessToken),
  });

  if (!prResponse.ok) {
    let message = 'PR 情報の取得に失敗しました';
    try {
      const error = await prResponse.json();
      message = error.message || message;
    } catch (_err) {
      // ignore JSON parse error
    }
    throw new GitHubApiError(message, prResponse.status);
  }

  const filesResponse = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${prNumber}/files`, {
    headers: githubHeaders(accessToken),
  });

  if (!filesResponse.ok) {
    let message = 'PR diff の取得に失敗しました';
    try {
      const error = await filesResponse.json();
      message = error.message || message;
    } catch (_err) {
      // ignore JSON parse error
    }
    throw new GitHubApiError(message, filesResponse.status);
  }

  const pr = await prResponse.json();
  const files = await filesResponse.json();

  const normalizedFiles = files.map((file) => {
    const patchText = typeof file.patch === 'string' ? file.patch : '';
    const patch = Buffer.byteLength(patchText, 'utf8') > MAX_FILE_SIZE_BYTES ? '(省略: ファイルが大きすぎます)' : patchText;

    return {
      filename: file.filename,
      status: file.status,
      additions: file.additions || 0,
      deletions: file.deletions || 0,
      patch,
    };
  });

  const totalAdditions = normalizedFiles.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = normalizedFiles.reduce((sum, file) => sum + file.deletions, 0);

  return {
    pr_number: pr.number,
    title: pr.title,
    base: pr.base?.ref || '',
    head: pr.head?.ref || '',
    state: pr.state,
    files: normalizedFiles,
    total_additions: totalAdditions,
    total_deletions: totalDeletions,
    total_files: normalizedFiles.length,
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
  getGitHubFileContent,
  listGitHubDirectory,
  getGitHubPrDiff,
  GitHubApiError,
  GITHUB_OWNER,
  GITHUB_REPO,
};
