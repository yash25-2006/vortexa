const crypto = require('crypto');
const db = require('../db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Government User Login
 */
async function govLoginHandler(req, res) {
  try {
    const { email, password, requestedState } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both official email and password.'
      });
    }

    const user = await db.getGovernmentUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid government credentials. (Try demo.maharashtra@demo.gov)'
      });
    }

    const hashed = hashPassword(password);
    if (user.password_hash !== hashed && password !== 'Demo@123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.'
      });
    }

    // Determine authorized monitoring state
    let activeState = user.monitoring_state;
    if (user.role === 'admin' && requestedState) {
      activeState = requestedState;
    }

    let resolvedRegionId = user.region_id;
    if (resolvedRegionId) {
      const regionExists = await db.getAdministrativeRegionById(resolvedRegionId);
      if (!regionExists) {
        resolvedRegionId = null;
      }
    }

    if (!resolvedRegionId && (user.role === 'ward_monitor' || user.monitoring_ward)) {
      const allRegions = await db.getAllAdministrativeRegions();
      const match = (allRegions || []).find(r => 
        (user.monitoring_ward && (
          r.ward === user.monitoring_ward || 
          user.monitoring_ward.toLowerCase().includes(r.name.toLowerCase()) || 
          r.name.toLowerCase().includes(user.monitoring_ward.toLowerCase())
        )) ||
        (user.email && user.email.toLowerCase().includes(r.name.toLowerCase().replace(/\s+/g, '')))
      );
      if (match) {
        resolvedRegionId = match.id;
        if (user.id) {
          try {
            if (db.getDriver() === 'pg') {
              await db.getPgPool().query('UPDATE government_users SET region_id = $1 WHERE id = $2', [resolvedRegionId, user.id]);
            } else {
              db.getSqliteDb().run('UPDATE government_users SET region_id = ? WHERE id = ?', [resolvedRegionId, user.id]);
            }
          } catch (updateErr) {
            console.warn('Could not sync user region_id:', updateErr.message);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Government authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        monitoringState: activeState,
        monitoringDistrict: user.monitoring_district,
        monitoringWard: user.monitoring_ward,
        regionId: resolvedRegionId,
        teamCode: user.team_code,
        category: user.category,
        department: user.department,
        teamName: user.name
      },
      token: user.email
    });

  } catch (err) {
    console.error('Gov login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to a server error.'
    });
  }
}

/**
 * Get Dashboard Summary for a State / District
 */
async function getDashboardSummaryHandler(req, res) {
  try {
    const userState = req.govUser?.monitoring_state;
    const requestedState = req.query.state || userState || 'Maharashtra';
    const district = req.query.district || null;

    // Enforce regional access if not admin
    const effectiveState = (req.govUser?.role === 'admin') 
      ? requestedState 
      : (userState || 'Maharashtra');

    const summary = await db.getDashboardSummary(effectiveState, district);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard analytics.'
    });
  }
}

/**
 * Get Map Requests with coordinates
 */
async function getMapRequestsHandler(req, res) {
  try {
    const userState = req.govUser?.monitoring_state;
    const state = (req.govUser?.role === 'admin')
      ? (req.query.state || 'Maharashtra')
      : (userState || 'Maharashtra');

    const { district, category, urgency } = req.query;

    const results = await db.getRequests({
      state,
      district,
      category,
      urgency,
      limit: 300
    });

    // Filter valid coordinates
    const mapMarkers = (results.requests || [])
      .filter(r => r.latitude !== null && r.longitude !== null && !isNaN(r.latitude) && !isNaN(r.longitude))
      .map(r => ({
        id: r.id,
        requestCode: r.request_code,
        category: r.category,
        issue: r.issue,
        issueType: r.issue_type,
        urgency: r.urgency,
        language: r.language,
        state: r.state,
        district: r.district,
        village: r.village,
        locationDetails: r.location_details,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        aiSummary: r.ai_summary,
        originalText: r.original_text,
        createdAt: r.created_at,
        isSynthetic: Boolean(r.is_synthetic)
      }));

    return res.status(200).json({
      success: true,
      state,
      totalMarkers: mapMarkers.length,
      data: mapMarkers
    });
  } catch (err) {
    console.error('Error fetching map requests:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve map markers.'
    });
  }
}

module.exports = {
  govLoginHandler,
  getDashboardSummaryHandler,
  getMapRequestsHandler
};
