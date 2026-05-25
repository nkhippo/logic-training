require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const generateProblemRoute = require('./api/generate-problem');
const scoreAnswerRoute = require('./api/score-answer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://thinkgrindai.vercel.app'
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    railway_app: 'thinkgrindai-be',
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
