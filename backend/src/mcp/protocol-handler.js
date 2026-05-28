const {
  createGitHubIssue,
  listGitHubIssues,
  getGitHubIssueComments,
  addGitHubIssueComment,
  getGitHubFileContent,
  listGitHubDirectory,
  getGitHubPrDiff,
  GitHubApiError,
} = require('../services/github-issues-service');

const MCP_PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'thinkgrindai-github';
const SERVER_VERSION = '1.0.0';

const TOOL_DEFINITIONS = [
  {
    name: 'create_issue',
    description: 'thinkgrindai リポジトリに GitHub Issue を作成する',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Issue のタイトル' },
        body: { type: 'string', description: 'Issue の本文（Markdown）' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'ラベル配列（既定: ready-for-cursor）',
        },
      },
      required: ['title', 'body'],
    },
  },
  {
    name: 'list_issues',
    description: 'thinkgrindai リポジトリの GitHub Issue 一覧を取得する',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Issue の状態',
        },
        per_page: {
          type: 'integer',
          minimum: 1,
          maximum: 30,
          description: '取得件数（最大30）',
        },
      },
    },
  },
  {
    name: 'get_issue_comments',
    description: '指定した Issue のコメント一覧を取得する',
    inputSchema: {
      type: 'object',
      properties: {
        issue_number: { type: 'integer', description: 'Issue 番号' },
      },
      required: ['issue_number'],
    },
  },
  {
    name: 'add_issue_comment',
    description: '指定した Issue にコメントを追加する',
    inputSchema: {
      type: 'object',
      properties: {
        issue_number: { type: 'integer', description: 'Issue 番号' },
        body: { type: 'string', description: 'コメント本文（Markdown）' },
      },
      required: ['issue_number', 'body'],
    },
  },
  {
    name: 'get_pr_comments',
    description: '指定した PR のコメント一覧を取得する',
    inputSchema: {
      type: 'object',
      properties: {
        pr_number: { type: 'integer', description: 'PR 番号' },
      },
      required: ['pr_number'],
    },
  },
  {
    name: 'add_pr_comment',
    description: '指定した PR にコメントを追加する',
    inputSchema: {
      type: 'object',
      properties: {
        pr_number: { type: 'integer', description: 'PR 番号' },
        body: { type: 'string', description: 'コメント本文（Markdown）' },
      },
      required: ['pr_number', 'body'],
    },
  },
  {
    name: 'get_pr_diff',
    description: '指定した PR の変更内容（diff）を取得する',
    inputSchema: {
      type: 'object',
      properties: {
        pr_number: { type: 'integer', description: 'PR 番号' },
      },
      required: ['pr_number'],
    },
  },
  {
    name: 'get_file_content',
    description: 'GitHub 上のテキストファイル内容を取得する（main ブランチ固定）',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '取得したいファイルパス（例: docs/_index.md）' },
        repo: { type: 'string', description: '対象リポジトリ名（省略時は既定リポジトリ）' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_directory',
    description: 'GitHub 上のディレクトリ一覧を取得する（1階層・main ブランチ固定）',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '対象ディレクトリパス（省略時はルート）' },
        repo: { type: 'string', description: '対象リポジトリ名（省略時は既定リポジトリ）' },
      },
    },
  },
];

/**
 * Authorization ヘッダーから Bearer トークンを取得する
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * JSON-RPC 成功レスポンス
 * @param {string|number|null} id
 * @param {unknown} result
 * @returns {{ jsonrpc: string, id: string|number|null, result: unknown }}
 */
function jsonRpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

/**
 * JSON-RPC エラーレスポンス
 * @param {string|number|null} id
 * @param {number} code
 * @param {string} message
 * @param {unknown} [data]
 * @returns {{ jsonrpc: string, id: string|number|null, error: { code: number, message: string, data?: unknown } }}
 */
function jsonRpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: '2.0', id, error };
}

/**
 * 外部サービスエラーを HTTP ステータスに変換する
 * @param {unknown} err
 * @returns {number}
 */
function resolveHttpStatus(err) {
  if (err instanceof GitHubApiError && [400, 401, 404].includes(err.status)) {
    return err.status;
  }
  return 500;
}

/**
 * MCP JSON-RPC リクエストを処理する
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function handleMcpJsonRpc(req, res) {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json(jsonRpcError(null, -32600, 'Invalid Request'));
  }

  const { jsonrpc, method, id } = body;
  const params = body.params && typeof body.params === 'object' ? body.params : {};

  if (jsonrpc !== '2.0' || typeof method !== 'string') {
    return res.status(400).json(jsonRpcError(id ?? null, -32600, 'Invalid Request'));
  }

  if (method === 'notifications/initialized' || method.startsWith('notifications/')) {
    return res.status(204).send();
  }

  if (method === 'initialize') {
    return res.json(
      jsonRpcResult(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      })
    );
  }

  if (method === 'ping') {
    return res.json(jsonRpcResult(id, {}));
  }

  if (method === 'tools/list') {
    return res.json(jsonRpcResult(id, { tools: TOOL_DEFINITIONS }));
  }

  if (method === 'tools/call') {
    const accessToken = getBearerToken(req);
    if (!accessToken) {
      return res.status(401).json(
        jsonRpcError(id, -32001, 'Unauthorized', { message: 'Authorization: Bearer <token> が必要です' })
      );
    }

    const toolName = params.name;
    const args = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};

    try {
      if (toolName === 'create_issue') {
        const { title, body: issueBody, labels } = args;
        if (!title || !issueBody) {
          return res.status(400).json(jsonRpcError(id, -32602, 'title と body は必須です'));
        }

        const issue = await createGitHubIssue({
          accessToken,
          title,
          body: issueBody,
          labels: Array.isArray(labels) ? labels : undefined,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'list_issues') {
        const state = typeof args.state === 'string' ? args.state : 'open';
        const perPage = Number.isFinite(args.per_page) ? args.per_page : 10;

        const issues = await listGitHubIssues({
          accessToken,
          state,
          perPage,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(issues, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'get_issue_comments') {
        if (!Number.isInteger(args.issue_number)) {
          return res.status(400).json(jsonRpcError(id, -32602, 'issue_number は整数で指定してください'));
        }

        const payload = await getGitHubIssueComments({
          accessToken,
          issueNumber: args.issue_number,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'add_issue_comment') {
        if (!Number.isInteger(args.issue_number) || !args.body) {
          return res.status(400).json(jsonRpcError(id, -32602, 'issue_number と body は必須です'));
        }

        const payload = await addGitHubIssueComment({
          accessToken,
          issueNumber: args.issue_number,
          body: args.body,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'get_pr_comments') {
        if (!Number.isInteger(args.pr_number)) {
          return res.status(400).json(jsonRpcError(id, -32602, 'pr_number は整数で指定してください'));
        }

        const payload = await getGitHubIssueComments({
          accessToken,
          issueNumber: args.pr_number,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'get_pr_diff') {
        if (!Number.isInteger(args.pr_number)) {
          return res.status(400).json(jsonRpcError(id, -32602, 'pr_number は整数で指定してください'));
        }

        const payload = await getGitHubPrDiff({
          accessToken,
          prNumber: args.pr_number,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'add_pr_comment') {
        if (!Number.isInteger(args.pr_number) || !args.body) {
          return res.status(400).json(jsonRpcError(id, -32602, 'pr_number と body は必須です'));
        }

        const payload = await addGitHubIssueComment({
          accessToken,
          issueNumber: args.pr_number,
          body: args.body,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'get_file_content') {
        if (typeof args.path !== 'string' || args.path.trim().length === 0) {
          return res.status(400).json(jsonRpcError(id, -32602, 'path は必須です'));
        }

        const payload = await getGitHubFileContent({
          accessToken,
          path: args.path,
          repo: typeof args.repo === 'string' ? args.repo : undefined,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      if (toolName === 'list_directory') {
        if (typeof args.path !== 'undefined' && typeof args.path !== 'string') {
          return res.status(400).json(jsonRpcError(id, -32602, 'path は文字列で指定してください'));
        }

        const payload = await listGitHubDirectory({
          accessToken,
          path: typeof args.path === 'string' ? args.path : '',
          repo: typeof args.repo === 'string' ? args.repo : undefined,
        });

        return res.json(
          jsonRpcResult(id, {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            isError: false,
          })
        );
      }

      return res.status(404).json(jsonRpcError(id, -32601, `Unknown tool: ${toolName}`));
    } catch (err) {
      return res.status(resolveHttpStatus(err)).json(
        jsonRpcResult(id, {
          content: [{ type: 'text', text: err.message }],
          isError: true,
        })
      );
    }
  }

  return res.status(404).json(jsonRpcError(id ?? null, -32601, `Method not found: ${method}`));
}

module.exports = {
  handleMcpJsonRpc,
  getBearerToken,
  MCP_PROTOCOL_VERSION,
  SERVER_NAME,
  SERVER_VERSION,
};
