const express = require('express');
const { validateScoreRequest } = require('../services/validate-service');
const { scoreLogicAnswer, scoreThinkingAnswer } = require('../services/claude-service');
const { updateUserScore } = require('../services/sheets-service');
const { MODEL } = require('../config/claude-config');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const errors = validateScoreRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'invalid_request',
        message: errors.join('; '),
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const { service, user_answer, user_id, context } = req.body;
    const { original_problem, tab, thinking_type, level } = context;

    let scoreResult;
    if (service === 'logic') {
      scoreResult = await scoreLogicAnswer({ tab, original_problem, user_answer });
    } else {
      scoreResult = await scoreThinkingAnswer({
        thinking_type,
        level: Number(level),
        original_problem,
        user_answer,
      });
    }

    if (user_id) {
      updateUserScore(user_id, service, scoreResult.score).catch((e) => {
        // eslint-disable-next-line no-console -- non-fatal error
        console.error('[score-answer] updateUserScore failed:', e.message);
      });
    }

    res.json({
      score: scoreResult.score,
      score_detail: scoreResult.score_detail,
      feedback: scoreResult.feedback,
      suggestions: scoreResult.suggestions,
      metadata: {
        evaluated_at: new Date().toISOString(),
        model: MODEL,
        temperature: 0.3,
        max_tokens: 1000,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
