const db = require('../db');

/**
 * Controller for Citizen Ratings & Feedback System
 */

/**
 * Citizen submits a 5-star rating & optional feedback for a resolved complaint
 * POST /api/citizen/requests/:id/rating
 * POST /api/citizen/complaints/:id/rating
 */
async function submitCitizenRatingHandler(req, res) {
  try {
    const { id } = req.params;
    const {
      citizenId,
      citizen_id,
      rating,
      feedback,
      comment,
      notes,
      resolutionQuality,
      resolution_quality,
      timeliness,
      overallSatisfaction,
      overall_satisfaction
    } = req.body;

    const effCitizenId = citizenId || citizen_id || req.headers['x-citizen-id'] || req.query.citizenId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Complaint / Request ID is required.'
      });
    }

    if (!effCitizenId) {
      return res.status(401).json({
        success: false,
        error: 'Citizen authentication required. Please identify with your verified Aadhaar profile.'
      });
    }

    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating score between 1 and 5 stars.'
      });
    }

    const effFeedback = (feedback || comment || notes || '').trim() || null;
    const effResQuality = resolutionQuality || resolution_quality || parsedRating;
    const effTimeliness = timeliness || parsedRating;
    const effSatisfaction = overallSatisfaction || overall_satisfaction || parsedRating;

    const createdRating = await db.createRating({
      requestId: id,
      citizenId: effCitizenId,
      rating: parsedRating,
      feedback: effFeedback,
      resolutionQuality: effResQuality,
      timeliness: effTimeliness,
      overallSatisfaction: effSatisfaction
    });

    return res.status(201).json({
      success: true,
      message: 'Rating Submitted. Thank you for your feedback.',
      data: createdRating
    });
  } catch (err) {
    console.error('Error submitting citizen rating:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to submit rating.'
    });
  }
}

/**
 * Get rating for a specific complaint
 * GET /api/citizen/requests/:id/rating
 * GET /api/citizen/complaints/:id/rating
 */
async function getCitizenRatingHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Complaint / Request ID is required.'
      });
    }

    const rating = await db.getRatingByRequestId(id);
    return res.status(200).json({
      success: true,
      data: rating || null
    });
  } catch (err) {
    console.error('Error fetching citizen rating:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve rating.'
    });
  }
}

/**
 * Ward Government retrieves ratings and aggregate feedback metrics for its jurisdiction
 * GET /api/ward/ratings
 */
async function getWardRatingsHandler(req, res) {
  try {
    const { state, district, ward, category, rating, search, limit = 100, offset = 0 } = req.query;

    const effState = req.govUser?.monitoring_state || state || 'Maharashtra';
    const effDistrict = req.govUser?.monitoring_district || district || null;
    const effWard = req.govUser?.monitoring_ward || ward || null;

    const results = await db.getRatingsForWard({
      state: effState,
      district: effDistrict,
      ward: effWard,
      category,
      rating,
      search,
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0
    });

    return res.status(200).json({
      success: true,
      data: results.ratings,
      summary: results.summary,
      total: results.total
    });
  } catch (err) {
    console.error('Error fetching ward ratings:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve citizen feedback and ratings.'
    });
  }
}

/**
 * Field Team retrieves ratings and feedback for its completed work orders
 * GET /api/team/ratings
 */
async function getTeamRatingsHandler(req, res) {
  try {
    const { teamId, team_id, category, rating, search, limit = 100, offset = 0 } = req.query;

    const effTeamId = teamId || team_id || req.govUser?.team_code || req.govUser?.email || null;
    const effTeamCode = req.govUser?.team_code || null;
    const effUserEmail = req.govUser?.email || null;
    const effTeamName = req.govUser?.name || null;
    const effCategory = category || (req.govUser?.role === 'field_team' ? req.govUser?.category : null);

    const results = await db.getRatingsForTeam({
      teamId: effTeamId,
      teamCode: effTeamCode,
      userEmail: effUserEmail,
      teamName: effTeamName,
      category: effCategory,
      rating,
      search,
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0
    });

    return res.status(200).json({
      success: true,
      data: results.ratings,
      summary: results.summary,
      total: results.total
    });
  } catch (err) {
    console.error('Error fetching team ratings:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve team performance ratings.'
    });
  }
}

module.exports = {
  submitCitizenRatingHandler,
  getCitizenRatingHandler,
  getWardRatingsHandler,
  getTeamRatingsHandler
};
