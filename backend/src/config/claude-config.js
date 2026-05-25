const Anthropic = require('@anthropic-ai/sdk');

let client = null;

/**
 * Claude API クライアントを取得する（シングルトン）
 * @returns {import('@anthropic-ai/sdk').Anthropic}
 */
function getClaudeClient() {
  if (!client) {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set');
    }
    client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return client;
}

/** フロント・GAS と同一（docs/specification/common.md） */
const MODEL = 'claude-sonnet-4-6';

module.exports = { getClaudeClient, MODEL };
