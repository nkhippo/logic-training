const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'nkhippo';
const GITHUB_REPO = process.env.GITHUB_REPO || 'ThinkGrindAi';
const MCP_API_BASE_URL = process.env.MCP_API_BASE_URL || 'https://thinkgrindai-production.up.railway.app';
const GITHUB_API = 'https://api.github.com';

// セッション用メモリストア（本番環境では Redis 等を使用）
const sessions = new Map();

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
      authorization_url: `${MCP_API_BASE_URL}/mcp/auth`,
      token_url: `${MCP_API_BASE_URL}/mcp/token`,
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

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&state=${state}&allow_signup=false`;
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
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    const accessToken = tokenData.access_token;

    res.json({
      access_token: accessToken,
      token_type: 'bearer',
      scope: 'repo',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * アクセストークン エンドポイント（OpenAPI 互換）
 */
router.post('/token', async (req, res) => {
  res.status(501).json({ error: 'Token endpoint not implemented. Use /auth and /callback flow.' });
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
              authorizationUrl: `${MCP_API_BASE_URL}/mcp/auth`,
              tokenUrl: `${MCP_API_BASE_URL}/mcp/token`,
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
    const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, labels }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message });
    }

    const issue = await response.json();
    res.status(201).json({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map((l) => l.name),
    });
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
    const response = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=${state}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const issues = await response.json();
    res.json(
      issues.map((i) => ({
        number: i.number,
        title: i.title,
        url: i.html_url,
        labels: i.labels.map((l) => l.name),
        state: i.state,
        created_at: i.created_at,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
