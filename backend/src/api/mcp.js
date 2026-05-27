const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const MCP_API_BASE_URL = process.env.MCP_API_BASE_URL || 'https://thinkgrindai-production.up.railway.app';
const OAUTH_CALLBACK_URL = `${MCP_API_BASE_URL}/mcp/callback`;
const { createGitHubIssue, listGitHubIssues } = require('../services/github-issues-service');

// セッション用メモリストア（本番環境では Redis 等を使用）
const sessions = new Map();

/**
 * GitHub OAuth の authorization code を access token に交換する
 * @param {string} code - GitHub から受け取った authorization code
 * @param {string} [redirectUri] - 認可リクエスト時と同じ redirect_uri
 * @returns {Promise<Record<string, string>>}
 */
async function exchangeGitHubAuthorizationCode(code, redirectUri = OAUTH_CALLBACK_URL) {
  const payload = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  };

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return tokenResponse.json();
}

// ======================
// MCP メタデータエンドポイント
// ======================
router.get('/', (req, res) => {
  res.json({
    schema_version: 'v1',
    name_for_human: 'thinkgrindai GitHub',
    name_for_model: 'thinkgrindai_github',
    description_for_human: 'thinkgrindai の GitHub Issue を作成・参照する',
    description_for_model: 'Creates and lists GitHub Issues for the thinkgrindai repository.',
    auth: {
      type: 'oauth2',
      authorization_url: `${MCP_API_BASE_URL}/authorize`,
      token_url: `${MCP_API_BASE_URL}/token`,
      scopes: ['repo'],
    },
    api: {
      type: 'openapi',
      url: `${MCP_API_BASE_URL}/mcp/openapi.json`,
    },
  });
});

// ======================
// OAuth フロー
// ======================

/**
 * ステップ 1: Claude → GitHub へリダイレクト
 */
router.get('/auth', (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: 'GITHUB_CLIENT_ID が設定されていません' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  sessions.set(state, { createdAt: Date.now() });

  const authUrl =
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}` +
    `&scope=repo&state=${state}&allow_signup=false` +
    `&redirect_uri=${encodeURIComponent(OAUTH_CALLBACK_URL)}`;
  res.redirect(authUrl);
});

/**
 * ステップ 2: GitHub → コールバック → アクセストークン取得
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!state || !sessions.has(state)) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  sessions.delete(state);

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    const tokenData = await exchangeGitHubAuthorizationCode(code);

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope || 'repo',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * OAuth2 token エンドポイント（authorization_code grant）
 * claude.ai カスタムコネクタが code を access_token に交換する際に使用
 */
router.post('/token', express.urlencoded({ extended: false }), async (req, res) => {
  const grantType = req.body.grant_type || req.body.grantType;
  const code = req.body.code;
  const redirectUri = req.body.redirect_uri || OAUTH_CALLBACK_URL;

  if (grantType && grantType !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code is supported',
    });
  }

  if (!code) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'code is required',
    });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'server_error',
      error_description: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET が設定されていません',
    });
  }

  try {
    const tokenData = await exchangeGitHubAuthorizationCode(code, redirectUri);

    if (tokenData.error) {
      return res.status(400).json({
        error: tokenData.error,
        error_description: tokenData.error_description || 'Token exchange failed',
      });
    }

    res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope || 'repo',
    });
  } catch (err) {
    res.status(500).json({
      error: 'server_error',
      error_description: err.message,
    });
  }
});

// ======================
// OpenAPI スキーマ
// ======================
router.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'thinkgrindai GitHub MCP', version: '1.0.0' },
    servers: [{ url: `${MCP_API_BASE_URL}/mcp` }],
    components: {
      securitySchemes: {
        oauth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: `${MCP_API_BASE_URL}/authorize`,
              tokenUrl: `${MCP_API_BASE_URL}/token`,
              scopes: { repo: 'Full control of private repositories' },
            },
          },
        },
      },
    },
    security: [{ oauth2: ['repo'] }],
    paths: {
      '/issues': {
        post: {
          operationId: 'createIssue',
          summary: 'GitHub Issue を作成する',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'body', 'access_token'],
                  properties: {
                    title: { type: 'string', description: 'Issue のタイトル' },
                    body: { type: 'string', description: 'Issue の本文（Markdown）' },
                    labels: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'ラベル配列（例: ["ready-for-cursor"]）',
                    },
                    access_token: { type: 'string', description: 'GitHub OAuth access token' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Issue 作成成功' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'エラー' },
          },
        },
        get: {
          operationId: 'listIssues',
          summary: '直近の GitHub Issue を一覧取得する',
          parameters: [
            { name: 'state', in: 'query', schema: { type: 'string', enum: ['open', 'closed', 'all'], default: 'open' } },
            { name: 'per_page', in: 'query', schema: { type: 'integer', default: 10, maximum: 30 } },
            { name: 'access_token', in: 'query', schema: { type: 'string', description: 'GitHub OAuth access token' } },
          ],
          responses: {
            '200': { description: 'Issue 一覧' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
    },
  });
});

// ======================
// Issue 作成・一覧取得（OAuth トークン使用）
// ======================

/**
 * GitHub Issue を作成する
 */
router.post('/issues', async (req, res) => {
  const { title, body, labels = ['ready-for-cursor'], access_token } = req.body;

  if (!access_token) {
    return res.status(401).json({ error: 'access_token は必須です' });
  }

  if (!title || !body) {
    return res.status(400).json({ error: 'title と body は必須です' });
  }

  try {
    const issue = await createGitHubIssue({
      accessToken: access_token,
      title,
      body,
      labels,
    });
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GitHub Issue 一覧を取得する
 */
router.get('/issues', async (req, res) => {
  const { state = 'open', per_page = 10, access_token } = req.query;

  if (!access_token) {
    return res.status(401).json({ error: 'access_token は必須です' });
  }

  try {
    const issues = await listGitHubIssues({
      accessToken: access_token,
      state,
      perPage: Number(per_page) || 10,
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
