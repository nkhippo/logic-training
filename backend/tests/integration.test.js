const request = require('supertest');

jest.mock('../src/services/claude-service', () => ({
  generateLogicProblem: jest.fn().mockResolvedValue('穴埋め問題：___はAIの倫理原則のひとつである。'),
  generateThinkingProblem: jest.fn().mockResolvedValue('思考問題：MECEを用いて分析せよ。'),
  scoreLogicAnswer: jest.fn().mockResolvedValue({
    score: 85,
    score_detail: { logic_clarity: 90, completeness: 80, accuracy: 85 },
    feedback: '正確な回答です',
    suggestions: [],
  }),
  scoreThinkingAnswer: jest.fn().mockResolvedValue({
    score: 78,
    score_detail: { logic_clarity: 80, completeness: 75, accuracy: 78, creativity: 79 },
    feedback: '丁寧な分析です',
    suggestions: ['もう一段深掘りすると良い'],
  }),
}));
jest.mock('../src/services/sheets-service', () => ({
  getUserCore: jest.fn().mockResolvedValue(null),
  updateUserScore: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';

const app = require('../src/index');

describe('Full flow: generate → score', () => {
  it('logic: fill problem generate → score', async () => {
    const genRes = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'logic', tab: 'fill', theme: 'AI倫理' });
    expect(genRes.status).toBe(200);

    const scoreRes = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'logic',
        user_answer: '透明性',
        context: { original_problem: genRes.body.content, tab: 'fill' },
      });
    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.score).toBeGreaterThanOrEqual(0);
    expect(scoreRes.body.score).toBeLessThanOrEqual(100);
  });

  it('thinking: type1 level2 generate → score', async () => {
    const genRes = await request(app)
      .post('/api/generate-problem')
      .send({ service: 'thinking', thinking_type: 'type1', level: 2, theme: 'DX戦略' });
    expect(genRes.status).toBe(200);

    const scoreRes = await request(app)
      .post('/api/score-answer')
      .send({
        service: 'thinking',
        user_answer: 'MECEを用いると...',
        context: { original_problem: genRes.body.content, thinking_type: 'type1', level: 2 },
      });
    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body).toHaveProperty('score_detail');
    expect(scoreRes.body.score_detail).toHaveProperty('creativity');
  });
});

describe('Health check', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
