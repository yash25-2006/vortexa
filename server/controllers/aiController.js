const db = require('../db');
const { generateAiAggregateSummary } = require('../services/gemini');

/**
 * Controller to generate dynamic, real AI structured summaries for Government Portals
 * Endpoint: GET /api/ai/summary or POST /api/ai/summary
 */
async function getAiSummaryHandler(req, res) {
  try {
    const govUser = req.govUser || {};
    const params = req.method === 'POST' ? req.body : req.query;

    let {
      state,
      district,
      region_id,
      regionId,
      ward,
      category,
      status,
      scopeLevel
    } = params;

    const targetRegionId = region_id || regionId;

    // 1. Enforce strict government scope authorization
    if (govUser.role === 'ward_monitor') {
      state = govUser.monitoring_state || state;
      district = govUser.monitoring_district || district;
      ward = govUser.monitoring_ward || ward;
      region_id = govUser.region_id || targetRegionId;
      scopeLevel = 'ward';
    } else if (govUser.role === 'state_monitor') {
      state = govUser.monitoring_state || state;
      scopeLevel = district ? 'district' : 'state';
    } else if (govUser.role === 'admin') {
      scopeLevel = scopeLevel || (targetRegionId ? 'ward' : district ? 'district' : 'state');
    } else {
      state = govUser.monitoring_state || state || 'Maharashtra';
    }

    const effectiveCategory = (category && category !== 'All' && category !== 'All Sectors') ? category : null;

    // 2. Fetch real database records matching the authorized scope
    let rawRequests = [];

    if (targetRegionId) {
      // Query ward-level database records
      const intel = await db.getRegionalIntelligence(parseInt(targetRegionId, 10));
      rawRequests = intel?.demand?.requests || [];
    } else {
      // Query state / district database records
      const queryParams = {
        state: state !== 'All' ? state : undefined,
        district: district && district !== 'All Districts' ? district : undefined,
        category: effectiveCategory || undefined,
        status: status && status !== 'all' ? status : undefined,
        limit: 200
      };
      const result = await db.getRequests(queryParams);
      rawRequests = result?.requests || [];
    }

    // Filter by category in-memory if needed
    if (effectiveCategory) {
      rawRequests = rawRequests.filter(
        (r) => (r.category || '').toLowerCase() === effectiveCategory.toLowerCase()
      );
    }

    // Filter by district in-memory if specified
    if (district && district !== 'All Districts') {
      rawRequests = rawRequests.filter((r) => {
        const rDist = (r.district || '').toLowerCase();
        const rVill = (r.village || '').toLowerCase();
        const rLoc = (r.location_details || '').toLowerCase();
        const target = district.toLowerCase();
        return rDist === target || rVill.includes(target) || rLoc.includes(target);
      });
    }

    // 3. Delegate to central Gemini service for real AI qualitative analysis
    const aiResult = await generateAiAggregateSummary({
      scope: {
        level: scopeLevel || 'ward',
        state: state || null,
        district: district || null,
        ward: ward || null,
        region_id: targetRegionId || null,
        category: effectiveCategory || 'All Sectors'
      },
      requests: rawRequests
    });

    return res.status(200).json({
      success: aiResult.success !== false,
      data: aiResult
    });

  } catch (err) {
    console.error('[AI Controller] Error generating AI summary:', err);
    return res.status(500).json({
      success: false,
      error: 'AI summary temporarily unavailable. Please try again.',
      data: {
        summary: null,
        totalRequests: 0,
        mainIssues: [],
        recurringThemes: [],
        affectedGroups: [],
        overallUrgency: null
      }
    });
  }
}

/**
 * Controller to retrieve aggregate AI usage telemetry & token savings
 * Endpoint: GET /api/ai/metrics
 */
async function getAiMetricsHandler(req, res) {
  try {
    const { getAiMetrics } = require('../services/gemini');
    const metrics = getAiMetrics();
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    console.error('[AI Controller] Error fetching AI telemetry metrics:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI telemetry metrics.'
    });
  }
}

module.exports = {
  getAiSummaryHandler,
  getAiMetricsHandler
};
