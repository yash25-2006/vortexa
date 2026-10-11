const express = require('express');
const router = express.Router();
const { getAiSummaryHandler, getAiMetricsHandler } = require('../controllers/aiController');
const { requireGovAuth } = require('../middleware/authMiddleware');

// Central AI Structured Intelligence Summary & Telemetry Endpoints
router.get('/summary', requireGovAuth, getAiSummaryHandler);
router.post('/summary', requireGovAuth, getAiSummaryHandler);
router.get('/metrics', getAiMetricsHandler);

module.exports = router;
