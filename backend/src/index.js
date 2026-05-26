require('dotenv').config({ path: '.env.local' });

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const generateProblemRoute = require('./api/generate-problem');
const scoreAnswerRoute = require('./api/score-answer');

const app = express();
const PORT = process.env.PORT || 3000;

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
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console -- startup message
    console.log(`[thinkgrindai-be] Server running on port ${PORT}`);
  });
}

module.exports = app;
