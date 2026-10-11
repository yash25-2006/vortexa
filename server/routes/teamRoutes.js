const express = require('express');
const router = express.Router();
const {
  assignTeamHandler,
  getTeamTasksHandler,
  getTaskByIdHandler,
  startTaskHandler,
  completeTaskHandler
} = require('../controllers/tasksController');
const { getTeamRatingsHandler } = require('../controllers/ratingController');
const { requireGovAuth } = require('../middleware/authMiddleware');

// Field Team Routes
router.post('/assign', requireGovAuth, assignTeamHandler);
router.get('/tasks', requireGovAuth, getTeamTasksHandler);
router.get('/tasks/:id', requireGovAuth, getTaskByIdHandler);
router.post('/tasks/:id/start', requireGovAuth, startTaskHandler);
router.post('/tasks/:id/complete', requireGovAuth, completeTaskHandler);
router.get('/ratings', requireGovAuth, getTeamRatingsHandler);

module.exports = router;
