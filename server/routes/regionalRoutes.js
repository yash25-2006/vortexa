const express = require('express');
const router = express.Router();
const {
  getRegionalIntelligenceHandler,
  getHotspotsHandler,
  resolveLocationHandler,
  batchUpdateWardRequestsStatusHandler
} = require('../controllers/regionalController');
const { requireGovAuth } = require('../middleware/authMiddleware');

// Regional Intelligence, Hotspots & Delimitation Endpoints
router.get('/regions/hotspots', requireGovAuth, getHotspotsHandler);
router.get('/regions/:id/intelligence', requireGovAuth, getRegionalIntelligenceHandler);
router.post('/regions/:id/requests/batch-status', requireGovAuth, batchUpdateWardRequestsStatusHandler);
router.post('/regions/resolve', resolveLocationHandler);

module.exports = router;
