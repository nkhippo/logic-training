const express = require('express');
const { validateScoreRequest } = require('../services/validate-service');
const { scoreLogicAnswer, scoreThinkingAnswer } = require('../services/claude-service');
const { ensureUserCore, updateUserScore } = require('../services/sheets-service');
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

    const {
      service,
      user_answer,
      user_id,
      context,
      system_prompt,
      user_prompt,
      max_tokens,
      temperature,
    } = req.body;
    const { original_problem, tab, thinking_type, level } = context;

    if (user_id) {
      try {
        await ensureUserCore(user_id);
      } catch (e) {
        // eslint-disable-next-line no-console -- non-fatal warning
        console.warn('[score-answer] ensureUserCore failed, continuing:', e.message);
      }
    }

    const useCustomPrompt = Boolean(system_prompt && user_prompt);
    const scoreOpts = useCustomPrompt
      ? {
          systemPrompt: system_prompt,
          userPrompt: user_prompt,
          maxTokens: max_tokens,
          temperature,
        }
      : {};

    let scoreResult;
    if (service === 'logic') {
      scoreResult = await scoreLogicAnswer({
        tab,
        original_problem,
        user_answer,
        ...scoreOpts,
      });
    } else {
      scoreResult = await scoreThinkingAnswer({
        thinking_type,
        level: Number(level),
        original_problem,
        user_answer,
        ...scoreOpts,
      });
    }

    if (user_id && scoreResult.score > 0) {
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
      raw_text: scoreResult.raw_text || null,
      metadata: {
        evaluated_at: new Date().toISOString(),
        model: MODEL,
        temperature: temperature ?? 0.3,
        max_tokens: max_tokens || 1000,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
