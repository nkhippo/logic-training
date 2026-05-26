const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateGenerateRequest } = require('../services/validate-service');
const { generateLogicProblem, generateThinkingProblem } = require('../services/claude-service');
const { ensureUserCore } = require('../services/sheets-service');
const { LOGIC_TAB_CONFIG, THINKING_LEVEL_CONFIG } = require('../config/constants');
const { MODEL } = require('../config/claude-config');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const errors = validateGenerateRequest(req.body);
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
      tab,
      thinking_type,
      level,
      theme,
      user_id,
      system_prompt,
      user_prompt,
      max_tokens,
      temperature,
    } = req.body;

    if (user_id) {
      try {
        await ensureUserCore(user_id);
      } catch (e) {
        // eslint-disable-next-line no-console -- non-fatal warning
        console.warn('[generate-problem] ensureUserCore failed, continuing:', e.message);
      }
    }

    const useCustomPrompt = Boolean(system_prompt && user_prompt);
    let content;
    const temperature_used = temperature ?? 0.9;
    let max_tokens_used;

    if (service === 'logic') {
      max_tokens_used = max_tokens || LOGIC_TAB_CONFIG[tab].max_tokens;
      content = await generateLogicProblem({
        tab,
        theme,
        systemPrompt: useCustomPrompt ? system_prompt : undefined,
        userPrompt: useCustomPrompt ? user_prompt : undefined,
        maxTokens: max_tokens,
        temperature,
      });
    } else {
      max_tokens_used = max_tokens || THINKING_LEVEL_CONFIG[Number(level)].max_tokens;
      content = await generateThinkingProblem({
        thinking_type,
        level: Number(level),
        theme,
        systemPrompt: useCustomPrompt ? system_prompt : undefined,
        userPrompt: useCustomPrompt ? user_prompt : undefined,
        maxTokens: max_tokens,
        temperature,
      });
    }

    res.json({
      problem_id: uuidv4(),
      content,
      context: {
        theme,
        type: service === 'logic' ? tab : thinking_type,
        level: level ? Number(level) : null,
        instructions: null,
      },
      metadata: {
        created_at: new Date().toISOString(),
        model: MODEL,
        temperature: temperature_used,
        max_tokens: max_tokens_used,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
