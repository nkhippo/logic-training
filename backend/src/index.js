require('dotenv').config();

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const generateProblemRoute = require('./api/generate-problem');
const scoreAnswerRoute = require('./api/score-answer');

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

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console -- startup message
    console.log(`[app] Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    // eslint-disable-next-line no-console -- error reporting
    console.error(`[app] Server error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = app;
