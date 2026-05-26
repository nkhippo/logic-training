const request = require('supertest');

jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn(),
  generateThinkingProblem: jest.fn(),
  scoreLogicAnswer: jest.fn().mockResolvedValue({
    score: 80,
    score_detail: { logic_clarity: 85, completeness: 75, accuracy: 80 },
    feedback: 'よくできています',
    suggestions: ['もう少し具体例を加えるとよい'],
  }),
  scoreThinkingAnswer: jest.fn().mockResolvedValue({
    score: 75,
    score_detail: { logic_clarity: 80, completeness: 70, accuracy: 75, creativity: 75 },
    feedback: '良い分析です',
    suggestions: ['別の視点も取り入れてみてください'],
  }),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  ensureUserCore: jest.fn().mockResolvedValue({ user_id: 'test-user' }),
  createUserCore: jest.fn().mockResolvedValue({ user_id: 'test-user' }),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('POST /api/score-answer', () => {
  it('should score a logic answer', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        user_answer: '回答テキスト',
        context: { original_problem: '問題文', tab: 'fill' },
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(80);
    expect(res.body).toHaveProperty('feedback');
    expect(res.body).toHaveProperty('suggestions');
    expect(res.body).toHaveProperty('metadata');
  });

  it('should score a thinking answer', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'thinking',
        user_answer: '回答テキスト',
        context: { original_problem: '問題文', thinking_type: 'type1', level: 2 },
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(75);
    expect(res.body.score_detail).toHaveProperty('creativity');
  });

  it('should return 400 if user_answer is missing', async () => {
    const res = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        context: { original_problem: '問題文', tab: 'fill' },
      });

    expect(res.status).toBe(400);
  });
});
