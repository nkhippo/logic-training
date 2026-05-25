const request = require('supertest');

jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn().mockResolvedValue('テスト用穴埋め問題文'),
  generateThinkingProblem: jest.fn().mockResolvedValue('テスト用思考問題文'),
  scoreLogicAnswer: jest.fn(),
  scoreThinkingAnswer: jest.fn(),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('POST /api/generate-problem', () => {
  it('should generate a logic fill problem', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'fill', theme: 'AI倫理' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('problem_id');
    expect(res.body).toHaveProperty('content', 'テスト用穴埋め問題文');
    expect(res.body.context.type).toBe('fill');
  });

  it('should generate a thinking problem', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'thinking', thinking_type: 'type1', level: 2, theme: 'DX戦略' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content', 'テスト用思考問題文');
    expect(res.body.context.type).toBe('type1');
  });

  it('should return 400 if service is missing', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ tab: 'fill', theme: 'AI倫理' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_request');
  });

  it('should return 400 if tab is invalid', async () => {
    const res = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'invalid_tab', theme: 'AI倫理' });

    expect(res.status).toBe(400);
  });
});
