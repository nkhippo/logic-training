const express = require('express');
const { handleMcpJsonRpc } = require('../mcp/protocol-handler');

const router = express.Router();

const MCP_API_BASE_URL = process.env.MCP_API_BASE_URL || 'https://thinkgrindai-production.up.railway.app';
const MCP_RESOURCE_URL = `${MCP_API_BASE_URL}/mcp`;

/**
 * RFC 9728: OAuth Protected Resource Metadata（resource path = /mcp）
 */
function protectedResourceMetadata() {
  return {
    resource: MCP_RESOURCE_URL,
    authorization_servers: [MCP_API_BASE_URL],
    scopes_supported: ['repo'],
    bearer_methods_supported: ['header'],
  };
}

/**
 * RFC 8414: OAuth Authorization Server Metadata
 */
function authorizationServerMetadata() {
  return {
    issuer: MCP_API_BASE_URL,
    authorization_endpoint: `${MCP_API_BASE_URL}/authorize`,
    token_endpoint: `${MCP_API_BASE_URL}/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
  };
}

router.get('/.well-known/oauth-protected-resource', (req, res) => {
  res.json(protectedResourceMetadata());
});

router.get('/.well-known/oauth-protected-resource/mcp', (req, res) => {
  res.json(protectedResourceMetadata());
});

router.get('/.well-known/oauth-authorization-server', (req, res) => {
  res.json(authorizationServerMetadata());
});

/**
 * Remote MCP: JSON-RPC over HTTP（Streamable HTTP 互換の単一 POST）
 */
router.post('/mcp', async (req, res) => {
  await handleMcpJsonRpc(req, res);
});

module.exports = router;
