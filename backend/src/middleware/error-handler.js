/**
 * Express エラーハンドリングミドルウェア
 * @param {Error & { code?: string; status?: number; message?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // eslint-disable-next-line no-console -- error logging
  console.error('[error-handler]', err.message || err);

  if (err.code) {
    return res.status(err.status || 503).json({
      error: err.code,
      message: err.message || 'An error occurred',
      status: err.status || 503,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'AnthropicError' || err.constructor?.name?.includes('Anthropic')) {
    return res.status(503).json({
      error: 'claude_api_error',
      message: 'Claude API is temporarily unavailable. Please try again.',
      status: 503,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred.',
    status: 500,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
