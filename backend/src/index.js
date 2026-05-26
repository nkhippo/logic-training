const fs = require('fs');
const path = require('path');

// 本番（Railway）: process.env のみ。ローカル: .env → .env.local の順で読み込む
require('dotenv').config();
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath, override: false });
}

// eslint-disable-next-line no-console -- startup diagnostic
console.log('[app] === STARTUP DEBUG ===');
// eslint-disable-next-line no-console -- startup diagnostic
console.log('[app] NODE_ENV:', process.env.NODE_ENV);
// eslint-disable-next-line no-console -- startup diagnostic
console.log('[app] PORT:', process.env.PORT || '(default 3000)');
// eslint-disable-next-line no-console -- startup diagnostic
console.log('[app] CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✓ SET' : '✗ NOT SET');

let express;
let errorHandler;
let generateProblemRoute;
let scoreAnswerRoute;

try {
  express = require('express');
  // eslint-disable-next-line no-console -- startup diagnostic
  console.log('[app] ✓ express module loaded');

  errorHandler = require('./middleware/error-handler');
  // eslint-disable-next-line no-console -- startup diagnostic
  console.log('[app] ✓ error-handler middleware loaded');

  generateProblemRoute = require('./api/generate-problem');
  // eslint-disable-next-line no-console -- startup diagnostic
  console.log('[app] ✓ generate-problem route loaded');

  scoreAnswerRoute = require('./api/score-answer');
  // eslint-disable-next-line no-console -- startup diagnostic
  console.log('[app] ✓ score-answer route loaded');
} catch (err) {
  // eslint-disable-next-line no-console -- fatal error
  console.error('[app] ✗ FATAL: Module loading failed');
  // eslint-disable-next-line no-console -- fatal error
  console.error('[app] Error message:', err.message);
  // eslint-disable-next-line no-console -- fatal error
  console.error('[app] Stack trace:', err.stack);
  process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.CLAUDE_API_KEY) {
    // eslint-disable-next-line no-console -- local dev warning
    console.warn('[app] WARNING: CLAUDE_API_KEY is not set');
  }
  if (!process.env.GOOGLE_SHEETS_API_KEY && !process.env.GOOGLE_SHEETS_CREDENTIALS) {
    // eslint-disable-next-line no-console -- local dev warning
    console.warn('[app] WARNING: GOOGLE_SHEETS_API_KEY is not set');
  }
}

const app = express();

const ALLOWED_ORIGINS = [
  'https://nkhippo.github.io',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    railway_app: 'thinkgrindai-be',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/generate-problem', generateProblemRoute);
app.use('/api/score-answer', scoreAnswerRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Endpoint not found', status: 404 });
});

app.use(errorHandler);

const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID
);

if (process.env.NODE_ENV === 'test' && isRailway) {
  // eslint-disable-next-line no-console -- fatal misconfiguration
  console.error('[app] ✗ FATAL: NODE_ENV=test on Railway — server will not listen. Set NODE_ENV=production');
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console -- fatal error
  console.error('[app] ✗ uncaughtException:', err.message);
  // eslint-disable-next-line no-console -- fatal error
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console -- fatal error
  console.error('[app] ✗ unhandledRejection:', reason);
  process.exit(1);
});

/**
 * Railway は PORT を自動注入する。未設定時のみ 3000（ローカル用）。
 * @returns {number}
 */
function resolveListenPort() {
  const raw = process.env.PORT;
  if (raw !== undefined && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 3000;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = resolveListenPort();

  // eslint-disable-next-line no-console -- startup diagnostic
  console.log(`[app] Attempting to listen on 0.0.0.0:${PORT} (Railway: ${isRailway})...`);

  const server = app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console -- startup message
    console.log(`[app] ✓ Server running on port ${PORT}`);
    // eslint-disable-next-line no-console -- startup message
    console.log('[app] === STARTUP COMPLETE ===');
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console -- error reporting
    console.error(`[app] ✗ Server error: ${err.message}`);
    // eslint-disable-next-line no-console -- error reporting
    console.error('[app] Stack:', err.stack);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console -- shutdown log
    console.log('[app] SIGTERM received, shutting down...');
    server.close(() => process.exit(0));
  });
} else if (isRailway) {
  // eslint-disable-next-line no-console -- fatal misconfiguration
  console.error('[app] ✗ FATAL: listen skipped (NODE_ENV=test). Cannot serve traffic.');
  process.exit(1);
}

module.exports = app;
