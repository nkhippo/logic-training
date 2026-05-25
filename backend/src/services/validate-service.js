const { LOGIC_TABS, THINKING_TYPES, THINKING_LEVELS } = require('../config/constants');

/**
 * /api/generate-problem のリクエスト検証
 * @param {object} body
 * @returns {string[]}
 */
function validateGenerateRequest(body) {
  const errors = [];

  if (!body.service) errors.push('service is required');
  else if (!['logic', 'thinking'].includes(body.service)) {
    errors.push('service must be "logic" or "thinking"');
  }

  if (!body.theme || typeof body.theme !== 'string' || body.theme.trim() === '') {
    errors.push('theme is required');
  }

  if (body.service === 'logic') {
    if (!body.tab) errors.push('tab is required for logic service');
    else if (!LOGIC_TABS.includes(body.tab)) {
      errors.push(`tab must be one of: ${LOGIC_TABS.join(', ')}`);
    }
  }

  if (body.service === 'thinking') {
    if (!body.thinking_type) errors.push('thinking_type is required for thinking service');
    else if (!THINKING_TYPES.includes(body.thinking_type)) {
      errors.push(`thinking_type must be one of: ${THINKING_TYPES.join(', ')}`);
    }

    if (body.level === undefined || body.level === null) {
      errors.push('level is required for thinking service');
    } else if (!THINKING_LEVELS.includes(Number(body.level))) {
      errors.push(`level must be one of: ${THINKING_LEVELS.join(', ')}`);
    }
  }

  return errors;
}

/**
 * /api/score-answer のリクエスト検証
 * @param {object} body
 * @returns {string[]}
 */
function validateScoreRequest(body) {
  const errors = [];

  if (!body.service) errors.push('service is required');
  else if (!['logic', 'thinking'].includes(body.service)) {
    errors.push('service must be "logic" or "thinking"');
  }

  if (!body.user_answer || typeof body.user_answer !== 'string' || body.user_answer.trim() === '') {
    errors.push('user_answer is required');
  }

  if (!body.context) {
    errors.push('context is required');
  } else {
    if (!body.context.original_problem) errors.push('context.original_problem is required');

    if (body.service === 'logic') {
      if (!body.context.tab) errors.push('context.tab is required for logic service');
      else if (!LOGIC_TABS.includes(body.context.tab)) {
        errors.push(`context.tab must be one of: ${LOGIC_TABS.join(', ')}`);
      }
    }

    if (body.service === 'thinking') {
      if (!body.context.thinking_type) errors.push('context.thinking_type is required');
      else if (!THINKING_TYPES.includes(body.context.thinking_type)) {
        errors.push(`context.thinking_type must be one of: ${THINKING_TYPES.join(', ')}`);
      }

      if (body.context.level === undefined || body.context.level === null) {
        errors.push('context.level is required');
      } else if (!THINKING_LEVELS.includes(Number(body.context.level))) {
        errors.push(`context.level must be one of: ${THINKING_LEVELS.join(', ')}`);
      }
    }
  }

  return errors;
}

module.exports = { validateGenerateRequest, validateScoreRequest };
