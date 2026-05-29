const request = require('supertest');
const { completeWithPrompt } = require('../src/services/claude-service');

jest.mock('../src/services/claude-service', () => ({
  completeWithPrompt: jest.fn().mockResolvedValue('フォローアップの問いかけです。'),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';

const app = require('../src/index');

describe('POST /api/complete', () => {
  it('returns content for text prompt', async () => {
    const res = await request(app)
      .post('/api/complete')
      .send({
        system_prompt: 'You are a coach.',
        user_prompt: 'Generate one question.',
        max_tokens: 300,
        temperature: 0.7,
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('フォローアップの問いかけです。');
    expect(res.body.metadata).toHaveProperty('model');
  });

  it('passes multimodal content to Claude', async () => {
    const userContent = [
      { type: 'text', text: 'Read the uploaded answer image.' },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: 'aW1hZ2U=',
        },
      },
    ];

    const res = await request(app)
      .post('/api/complete')
      .send({
        system_prompt: 'You are a grader.',
        user_content: userContent,
        max_tokens: 300,
        temperature: 0.3,
      });

    expect(res.status).toBe(200);
    expect(completeWithPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: 'You are a grader.',
        userPrompt: undefined,
        userContent,
        maxTokens: 300,
        temperature: 0.3,
      })
    );
  });

  it('returns 400 when prompts are missing', async () => {
    const res = await request(app)
      .post('/api/complete')
      .send({ system_prompt: 'sys only' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_request');
  });
});
