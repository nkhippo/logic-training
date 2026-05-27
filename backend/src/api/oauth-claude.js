const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const MCP_API_BASE_URL = process.env.MCP_API_BASE_URL || 'https://thinkgrindai-production.up.railway.app';
const GITHUB_OAUTH_CALLBACK = `${MCP_API_BASE_URL}/oauth/github/callback`;

/** @type {Map<string, { claudeState: string, claudeRedirectUri: string, codeChallenge?: string, codeChallengeMethod?: string, createdAt: number }>} */
const oauthSessions = new Map();

const SESSION_TTL_MS = 10 * 60 * 1000;

/**
 * 期限切れセッションを削除する
 */
function pruneSessions() {
  const now = Date.now();
  for (const [key, value] of oauthSessions.entries()) {
    if (now - value.createdAt > SESSION_TTL_MS) {
      oauthSessions.delete(key);
    }
  }
}

/**
 * GitHub OAuth の authorization code を access token に交換する（PKCE 対応）
 * @param {string} code
 * @param {string} redirectUri
 * @param {string} [codeVerifier]
 * @returns {Promise<Record<string, string>>}
 */
async function exchangeGitHubCode(code, redirectUri, codeVerifier) {
  const payload = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  };

  if (codeVerifier) {
    payload.code_verifier = codeVerifier;
  }

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

/**
 * claude.ai MCP カスタムコネクタ用: OAuth2 認可開始
 * GET /authorize?response_type=code&client_id=...&redirect_uri=https://claude.ai/...&code_challenge=...&state=...
 */
router.get('/authorize', (req, res) => {
  pruneSessions();

  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: 'GITHUB_CLIENT_ID が設定されていません' });
  }

  const { response_type, redirect_uri, code_challenge, code_challenge_method, state } = req.query;

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type', error_description: 'Only code is supported' });
  }

  if (!redirect_uri || typeof redirect_uri !== 'string') {
    return res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' });
  }

  if (!state || typeof state !== 'string') {
    return res.status(400).json({ error: 'invalid_request', error_description: 'state is required' });
  }

  const internalState = crypto.randomBytes(16).toString('hex');
  oauthSessions.set(internalState, {
    claudeState: state,
    claudeRedirectUri: redirect_uri,
    codeChallenge: typeof code_challenge === 'string' ? code_challenge : undefined,
    codeChallengeMethod: typeof code_challenge_method === 'string' ? code_challenge_method : undefined,
    createdAt: Date.now(),
  });

  let authUrl =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_CALLBACK)}` +
    `&scope=repo&state=${encodeURIComponent(internalState)}&allow_signup=false`;

  if (code_challenge && code_challenge_method) {
    authUrl += `&code_challenge=${encodeURIComponent(code_challenge)}`;
    authUrl += `&code_challenge_method=${encodeURIComponent(code_challenge_method)}`;
  }

  res.redirect(authUrl);
});

/**
 * GitHub からのコールバック → claude.ai へ authorization code を返す
 */
router.get('/oauth/github/callback', (req, res) => {
  pruneSessions();

  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error, error_description });
  }

  if (!state || typeof state !== 'string' || !oauthSessions.has(state)) {
    return res.status(400).json({ error: 'invalid_state', error_description: 'Invalid or expired state' });
  }

  const session = oauthSessions.get(state);
  oauthSessions.delete(state);

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'invalid_request', error_description: 'No authorization code received' });
  }

  const redirectUrl = new URL(session.claudeRedirectUri);
  redirectUrl.searchParams.set('code', code);
  redirectUrl.searchParams.set('state', session.claudeState);

  res.redirect(redirectUrl.toString());
});

/**
 * claude.ai MCP カスタムコネクタ用: authorization code → access token
 */
router.post('/token', async (req, res) => {
  const grantType = req.body.grant_type;
  const code = req.body.code;
  const codeVerifier = req.body.code_verifier;

  if (grantType && grantType !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code is supported',
    });
  }

  if (!code) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'server_error',
      error_description: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET が設定されていません',
    });
  }

  try {
    // GitHub が発行した code は /authorize で指定した redirect_uri と一致する必要がある。
    // Claude 側 redirect_uri をそのまま渡すと mismatch になるため、常に GitHub callback を使用する。
    const tokenData = await exchangeGitHubCode(code, GITHUB_OAUTH_CALLBACK, codeVerifier);

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

module.exports = router;
