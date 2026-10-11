const db = require('../db');
const { resolveLocationHierarchy } = require('../services/locationResolver');
const { invalidateAiSummaryCache } = require('../services/gemini');

/**
 * Get complete regional intelligence for an administrative region
 */
async function getRegionalIntelligenceHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region ID.'
      });
    }

    const intel = await db.getRegionalIntelligence(parseInt(id, 10));

    if (!intel) {
      return res.status(404).json({
        success: false,
        error: 'Administrative region not found.'
      });
    }

    // Regional access control check
    if (req.govUser && req.govUser.role === 'ward_monitor') {
      if (req.govUser.region_id && parseInt(intel.region.id, 10) !== parseInt(req.govUser.region_id, 10)) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You are only authorized to view intelligence for your assigned ward (${req.govUser.monitoring_ward || intel.region.name}).`
        });
      }
    } else if (req.govUser && req.govUser.role !== 'admin') {
      if (intel.region.state !== req.govUser.monitoring_state) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You are only authorized to view intelligence for ${req.govUser.monitoring_state}.`
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: intel
    });
  } catch (err) {
    console.error('Error fetching regional intelligence:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve regional intelligence.'
    });
  }
}

/**
 * Get high-demand geographic hotspots with administrative boundaries for the map
 */
async function getHotspotsHandler(req, res) {
  try {
    const userState = req.govUser?.monitoring_state;
    const requestedState = req.query.state || userState || 'Maharashtra';
    const district = req.query.district || null;

    // Enforce regional scope
    const effectiveState = (req.govUser?.role === 'admin')
      ? requestedState
      : (userState || 'Maharashtra');

    const hotspots = await db.getHotspotsByState(effectiveState, district);

    return res.status(200).json({
      success: true,
      state: effectiveState,
      totalHotspots: hotspots.length,
      data: hotspots
    });
  } catch (err) {
    console.error('Error fetching hotspots:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve geographic hotspots.'
    });
  }
}

/**
 * Resolve GPS coordinates or address text into administrative jurisdiction
 */
async function resolveLocationHandler(req, res) {
  try {
    const { latitude, longitude, locality, district, state } = req.body;

    const result = await resolveLocationHierarchy({
      latitude,
      longitude,
      locality,
      district,
      state
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error resolving location hierarchy:', err);
    return res.status(500).json({
      success: false,
      error: 'Location resolution failed.'
    });
  }
}

/**
 * Update request statuses for a ward and category (Approve, Reject, Complete)
 */
async function batchUpdateWardRequestsStatusHandler(req, res) {
  try {
    const { id } = req.params;
    const {
      category,
      action,
      status,
      rejectionReason,
      rejection_reason,
      requestId,
      request_id,
      requestIds,
      request_ids
    } = req.body;

    const rawAction = action || status || '';
    const rawRejectionReason = rejectionReason || rejection_reason || null;
    const rawRequestIds = requestIds || request_ids || (requestId ? [requestId] : (request_id ? [request_id] : null));

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region ID.'
      });
    }

    const regionId = parseInt(id, 10);
    const region = await db.getAdministrativeRegionById(regionId);
    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Administrative region not found.'
      });
    }

    // Role-based authorization check
    if (req.govUser && req.govUser.role === 'ward_monitor') {
      if (req.govUser.region_id && parseInt(region.id, 10) !== parseInt(req.govUser.region_id, 10)) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You can only update requests for your assigned ward (${req.govUser.monitoring_ward || region.name}).`
        });
      }
    } else if (req.govUser && req.govUser.role !== 'admin') {
      if (region.state !== req.govUser.monitoring_state) {
        return res.status(403).json({
          success: false,
          error: `Access Denied: You are only authorized to manage requests in ${req.govUser.monitoring_state}.`
        });
      }
    }

    if (!rawAction) {
      return res.status(400).json({
        success: false,
        error: 'Action is required (approve, reject, complete).'
      });
    }

    let normalizedAction = rawAction.toString().toLowerCase().trim();
    if (normalizedAction === 'approved') normalizedAction = 'approve';
    else if (normalizedAction === 'rejected') normalizedAction = 'reject';
    else if (normalizedAction === 'completed') normalizedAction = 'complete';

    if ((normalizedAction === 'reject' || normalizedAction === 'reject_selected') && (!rawRejectionReason || !rawRejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required.'
      });
    }

    const result = await db.updateWardRequestsStatus({
      regionId,
      category,
      action: normalizedAction,
      rejectionReason: rawRejectionReason ? rawRejectionReason.trim() : null,
      requestId: requestId || request_id || null,
      requestIds: rawRequestIds
    });

    // Invalidate AI summary cache for this ward & category
    try {
      invalidateAiSummaryCache({ regionId, category });
    } catch (cacheErr) {
      console.warn('AI cache invalidation notice:', cacheErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${normalizedAction} action on ${result.updatedCount || 0} request(s).`,
      updatedCount: result.updatedCount || 0,
      data: result
    });
  } catch (err) {
    console.error('Error updating ward requests status:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update ward requests status.'
    });
  }
}

module.exports = {
  getRegionalIntelligenceHandler,
  getHotspotsHandler,
  resolveLocationHandler,
  batchUpdateWardRequestsStatusHandler
};
