const express = require('express');
const router = express.Router();
const {
  getDashboardSummaryHandler,
  getMapRequestsHandler
} = require('../controllers/dashboardController');
const { requireGovAuth } = require('../middleware/authMiddleware');

// Government Dashboard Analytics & Map Endpoints (with regional authorization)
router.get('/dashboard/summary', requireGovAuth, getDashboardSummaryHandler);
router.get('/map/requests', requireGovAuth, getMapRequestsHandler);

module.exports = router;
