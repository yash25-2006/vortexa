const db = require('../db');

/**
 * Government Authentication & Regional Authorization Middleware
 * Enforces that government users must be authenticated and only access their authorized regional scope (State or Ward).
 */
function requireGovAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const govUserEmail = req.headers['x-gov-email'] || req.query.govUserEmail;

  if (!govUserEmail && !authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Government authentication required. Please log in.'
    });
  }

  const emailToLookup = govUserEmail || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '');

  if (!emailToLookup || !emailToLookup.trim()) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication header. Please log in.'
    });
  }

  db.getGovernmentUserByEmail(emailToLookup.trim().toLowerCase())
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Official government credentials not recognized. Please log in again.'
        });
      }

      req.govUser = user;

      // 1. Field team users
      if (user.role === 'field_team') {
        // Field team authorized for their assigned operations
      }
      // 2. Enforce ward monitoring access constraint
      else if (user.role === 'ward_monitor') {
        if (req.query.state && req.query.state !== user.monitoring_state && req.query.state !== 'All') {
          return res.status(403).json({
            success: false,
            error: `Access Denied: You are authorized to monitor only ${user.monitoring_ward || user.monitoring_state}.`
          });
        }
        if (req.query.district && user.monitoring_district && req.query.district !== user.monitoring_district) {
          return res.status(403).json({
            success: false,
            error: `Access Denied: You are authorized to monitor only district ${user.monitoring_district}.`
          });
        }
        if (req.query.region_id && user.region_id && parseInt(req.query.region_id, 10) !== parseInt(user.region_id, 10)) {
          return res.status(403).json({
            success: false,
            error: `Access Denied: You are authorized to monitor only ward region ${user.region_id}.`
          });
        }
        // Enforce the ward scope on queries
        req.query.state = user.monitoring_state;
        if (user.monitoring_district) req.query.district = user.monitoring_district;
        if (user.region_id) req.query.region_id = user.region_id;
      }
      // 3. Enforce state monitoring access constraint
      else if (user.role !== 'admin') {
        if (req.query.state && req.query.state !== user.monitoring_state && req.query.state !== 'All') {
          return res.status(403).json({
            success: false,
            error: `Access Denied: You are authorized to monitor only ${user.monitoring_state}.`
          });
        }
        // Enforce the state scope on queries
        req.query.state = user.monitoring_state;
      }

      next();
    })
    .catch((err) => {
      console.error('[Auth Middleware Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Authentication verification failed due to internal error.'
      });
    });
}

module.exports = {
  requireGovAuth
};
