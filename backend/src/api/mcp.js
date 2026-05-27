const express = require('express');

const router = express.Router();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'nkhippo';
const GITHUB_REPO = process.env.GITHUB_REPO || 'thinkgrindai';
const GITHUB_API = 'https://api.github.com';

router.get('/', (req, res) => {
  res.json({
    schema_version: 'v1',
    name_for_human: 'thinkgrindai GitHub',
    name_for_model: 'thinkgrindai_github',
    description_for_human: 'thinkgrindai の GitHub Issue を作成・参照する',
    description_for_model: 'Creates and lists GitHub Issues for the thinkgrindai repository.',
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${process.env.BE_URL || 'https://thinkgrindai-production.up.railway.app'}/mcp/openapi.json`,
    },
  });
});

router.get('/openapi.json', (req, res) => {
  const baseUrl = process.env.BE_URL || 'https://thinkgrindai-production.up.railway.app';
  res.json({
    openapi: '3.0.0',
    info: { title: 'thinkgrindai GitHub MCP', version: '1.0.0' },
    servers: [{ url: `${baseUrl}/mcp` }],
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
                  required: ['title', 'body'],
                  properties: {
                    title: { type: 'string', description: 'Issue のタイトル' },
                    body: { type: 'string', description: 'Issue の本文（Markdown）' },
                    labels: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'ラベルの配列（例: ["ready-for-cursor", "feature"]）',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Issue 作成成功',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
            '500': { description: 'エラー' },
          },
        },
        get: {
          operationId: 'listIssues',
          summary: '直近の GitHub Issue を一覧取得する',
          parameters: [
            {
              name: 'state',
              in: 'query',
              schema: { type: 'string', enum: ['open', 'closed', 'all'], default: 'open' },
            },
            { name: 'per_page', in: 'query', schema: { type: 'integer', default: 10, maximum: 30 } },
          ],
          responses: {
            '200': {
              description: 'Issue 一覧',
              content: { 'application/json': { schema: { type: 'array' } } },
            },
          },
        },
      },
    },
  });
});

router.post('/issues', async (req, res) => {
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN が設定されていません' });
  }

  const { title, body, labels = ['ready-for-cursor'] } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title と body は必須です' });
  }

  try {
    const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
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
    return res.status(201).json({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map((label) => label.name),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/issues', async (req, res) => {
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN が設定されていません' });
  }

  const { state = 'open', per_page = 10 } = req.query;

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=${state}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const issues = await response.json();
    return res.json(
      issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: issue.labels.map((label) => label.name),
        state: issue.state,
        created_at: issue.created_at,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
