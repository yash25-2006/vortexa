const express = require('express');
const router = express.Router();
const {
  getCitizenRequestsHandler,
  getCitizenCooldownStatusHandler,
  getGovernmentPerformanceHandler,
  getGovernmentPlansHandler,
  getGovernmentPlanByIdHandler
} = require('../controllers/requestsController');
const {
  submitCitizenRatingHandler,
  getCitizenRatingHandler
} = require('../controllers/ratingController');

// Citizen-Specific Requests, Cooldown Status, Plans & Government Performance
router.get('/citizen/requests', getCitizenRequestsHandler);
router.get('/citizen/cooldown-status', getCitizenCooldownStatusHandler);
router.get('/citizen/performance', getGovernmentPerformanceHandler);
router.get('/citizen/plans', getGovernmentPlansHandler);
router.get('/citizen/plans/:id', getGovernmentPlanByIdHandler);
router.get('/plans', getGovernmentPlansHandler);
router.get('/plans/:id', getGovernmentPlanByIdHandler);

// Citizen Ratings & Feedback for Completed Complaints
router.post('/citizen/requests/:id/rating', submitCitizenRatingHandler);
router.post('/citizen/complaints/:id/rating', submitCitizenRatingHandler);
router.get('/citizen/requests/:id/rating', getCitizenRatingHandler);
router.get('/citizen/complaints/:id/rating', getCitizenRatingHandler);
router.post('/requests/:id/rating', submitCitizenRatingHandler);
router.get('/requests/:id/rating', getCitizenRatingHandler);

module.exports = router;
