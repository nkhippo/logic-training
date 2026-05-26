const express = require('express');
const { validateCompleteRequest } = require('../services/validate-service');
const { completeWithPrompt } = require('../services/claude-service');
const { ensureUserCore } = require('../services/sheets-service');
const { MODEL } = require('../config/claude-config');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const errors = validateCompleteRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'invalid_request',
        message: errors.join('; '),
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const {
      system_prompt,
      user_prompt,
      user_content,
      max_tokens,
      temperature,
      user_id,
    } = req.body;

    if (user_id) {
      try {
        await ensureUserCore(user_id);
      } catch (e) {
        // eslint-disable-next-line no-console -- non-fatal warning
        console.warn('[complete] ensureUserCore failed, continuing:', e.message);
      }
    }

    const content = await completeWithPrompt({
      systemPrompt: system_prompt,
      userPrompt: user_prompt,
      userContent: user_content,
      maxTokens: max_tokens,
      temperature,
    });

    res.json({
      content,
      metadata: {
        completed_at: new Date().toISOString(),
        model: MODEL,
        temperature: temperature ?? 0.9,
        max_tokens: max_tokens || 2500,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
