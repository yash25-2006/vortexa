const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ALLOWED_CATEGORIES = [
  'Healthcare',
  'Education',
  'Roads & Transport',
  'Water & Sanitation',
  'Electricity',
  'Digital Connectivity',
  'Agriculture',
  'Housing',
  'Other'
];

const ALLOWED_URGENCIES = ['Critical', 'High', 'Medium', 'Low'];

// Centralized Configurable AI Engine Limits & Budgets
const CONFIG = {
  model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  maxSummaryTokens: parseInt(process.env.GEMINI_MAX_SUMMARY_TOKENS, 10) || 350,
  maxCitizenTokens: parseInt(process.env.GEMINI_MAX_CITIZEN_TOKENS, 10) || 200,
  maxMatchTokens: parseInt(process.env.GEMINI_MAX_MATCH_TOKENS, 10) || 120,
  maxDuplicateCandidates: parseInt(process.env.AI_DUPLICATE_MAX_CANDIDATES, 10) || 8,
  maxPlanCandidates: parseInt(process.env.AI_PLAN_MAX_CANDIDATES, 10) || 8,
  maxSummaryItems: parseInt(process.env.AI_SUMMARY_MAX_ITEMS, 10) || 10,
  cacheTtlMs: (parseInt(process.env.AI_CACHE_TTL, 10) || 900) * 1000 // 15 minutes default
};

// In-memory data-aware versioned cache for AI summaries
const summaryCache = new Map();

// In-flight Promise map to coalescently deduplicate simultaneous identical Gemini requests
const inFlightRequests = new Map();

// Real-time AI Usage & Token Observability Metrics (in-memory)
const aiMetrics = {
  totalCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
  callsByFeature: {
    citizenRequestAnalysis: 0,
    planMatching: 0,
    duplicateDetection: 0,
    aggregateSummary: 0
  },
  tokensEstimated: {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0
  },
  errorsByCode: {},
  startedAt: new Date().toISOString()
};

/**
 * Fast token estimator (~4 chars per English token, ~2 chars per Indic/Unicode token)
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  const isIndic = /[\u0900-\u0D7F]/.test(text);
  const ratio = isIndic ? 2.2 : 3.8;
  return Math.max(1, Math.ceil(text.length / ratio));
}

/**
 * Record internal AI usage metrics and log clean telemetry
 */
function recordAiCallMetrics({ feature, model, inputTokens, outputTokens, durationMs, cacheHit = false, success = true, errorCode = null }) {
  if (cacheHit) {
    aiMetrics.cacheHits++;
    console.log(`[AI Telemetry] [Cache HIT] [Feature: ${feature}] Saved ~${inputTokens + outputTokens} tokens.`);
    return;
  }

  aiMetrics.totalCalls++;
  aiMetrics.cacheMisses++;
  if (aiMetrics.callsByFeature[feature] !== undefined) {
    aiMetrics.callsByFeature[feature]++;
  }

  const inTok = inputTokens || 0;
  const outTok = outputTokens || 0;
  aiMetrics.tokensEstimated.inputTokens += inTok;
  aiMetrics.tokensEstimated.outputTokens += outTok;
  aiMetrics.tokensEstimated.totalTokens += (inTok + outTok);

  if (!success && errorCode) {
    aiMetrics.errorsByCode[errorCode] = (aiMetrics.errorsByCode[errorCode] || 0) + 1;
  }

  console.log(`[AI Telemetry] [Feature: ${feature}] [Model: ${model}] [Tokens: in=${inTok}, out=${outTok}, total=${inTok + outTok}] [Duration: ${Math.round(durationMs)}ms] [Success: ${success}]`);
}

/**
 * Get internal AI usage telemetry metrics
 */
function getAiMetrics() {
  const hitRate = (aiMetrics.cacheHits + aiMetrics.cacheMisses) > 0
    ? ((aiMetrics.cacheHits / (aiMetrics.cacheHits + aiMetrics.cacheMisses)) * 100).toFixed(1) + '%'
    : '0.0%';

  return {
    ...aiMetrics,
    cacheHitRate: hitRate,
    cacheEntriesCount: summaryCache.size,
    configuration: {
      model: CONFIG.model,
      maxDuplicateCandidates: CONFIG.maxDuplicateCandidates,
      maxPlanCandidates: CONFIG.maxPlanCandidates,
      maxSummaryItems: CONFIG.maxSummaryItems,
      cacheTtlSeconds: CONFIG.cacheTtlMs / 1000
    },
    uptimeSeconds: Math.floor((Date.now() - new Date(aiMetrics.startedAt).getTime()) / 1000)
  };
}

/**
 * Invalidate affected AI summary cache entries upon database modifications
 */
function invalidateAiSummaryCache(filter = {}) {
  let invalidatedCount = 0;
  const now = Date.now();

  for (const [key, entry] of summaryCache.entries()) {
    let match = false;
    if (filter.regionId && key.includes(`"region_id":${filter.regionId}`)) match = true;
    if (filter.ward && key.includes(`"ward":"${filter.ward}"`)) match = true;
    if (filter.district && key.includes(`"district":"${filter.district}"`)) match = true;
    if (filter.state && key.includes(`"state":"${filter.state}"`)) match = true;
    if (filter.category && key.includes(`"category":"${filter.category}"`)) match = true;

    // Invalidate if matched or expired
    if (match || (now - entry.timestamp >= CONFIG.cacheTtlMs)) {
      summaryCache.delete(key);
      invalidatedCount++;
    }
  }

  if (invalidatedCount > 0) {
    console.log(`[AI Cache Invalidation] Cleared ${invalidatedCount} cached AI summaries.`);
  }
}

/**
 * Startup Configuration Check (never prints the actual key)
 */
function logGeminiConfig() {
  const key = process.env.GEMINI_API_KEY;
  const isKeyPresent = Boolean(key && key.trim().length > 0 && key !== 'your_gemini_api_key_here');
  console.log('=============================================');
  console.log('Gemini configuration:');
  console.log(`API key configured: ${isKeyPresent ? 'YES' : 'NO'}`);
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Summary Max Items: ${CONFIG.maxSummaryItems} | Cache TTL: ${CONFIG.cacheTtlMs / 1000}s`);
  console.log('=============================================');
}

logGeminiConfig();

/**
 * Classify Gemini errors into specific internal codes
 */
function classifyGeminiError(err) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || (
    msg.includes('404') ? 404 :
    msg.includes('429') ? 429 :
    msg.includes('503') ? 503 :
    msg.includes('401') ? 401 :
    msg.includes('403') ? 403 :
    msg.includes('400') ? 400 : 500
  );

  if (status === 404 || msg.includes('not found') || msg.includes('is not found')) {
    return { code: 'GEMINI_404_MODEL_NOT_FOUND', status: 404, retryable: false };
  }
  if (status === 401 || msg.includes('api_key_invalid') || msg.includes('unauthorized')) {
    return { code: 'GEMINI_401_AUTHENTICATION', status: 401, retryable: false };
  }
  if (status === 403 || msg.includes('permission_denied')) {
    return { code: 'GEMINI_403_PERMISSION', status: 403, retryable: false };
  }
  if (status === 400 || msg.includes('invalid argument')) {
    return { code: 'GEMINI_400_INVALID_REQUEST', status: 400, retryable: false };
  }
  if (status === 429 || msg.includes('quota') || msg.includes('rate limit')) {
    const isDailyQuota = msg.includes('perday') || msg.includes('quota exceeded for metric') || msg.includes('generaterequestsperday');
    return { code: isDailyQuota ? 'GEMINI_429_QUOTA' : 'GEMINI_429_RATE_LIMIT', status: 429, retryable: !isDailyQuota };
  }
  if (status === 503 || msg.includes('service unavailable') || msg.includes('high demand') || msg.includes('overloaded')) {
    return { code: 'GEMINI_503_SERVICE_UNAVAILABLE', status: 503, retryable: true };
  }
  return { code: 'GEMINI_500_INTERNAL_ERROR', status, retryable: false };
}

/**
 * Robust JSON Extractor & Sanitizer for Gemini outputs
 */
function extractAndParseJson(text) {
  if (!text || typeof text !== 'string') throw new Error('Empty text received from Gemini');
  let clean = text.trim();
  // Strip markdown code fences ```json ... ``` or ``` ... ```
  clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        const sanitized = jsonMatch[0].replace(/[\n\r]+/g, ' ');
        return JSON.parse(sanitized);
      }
    }
    throw err;
  }
}

/**
 * Execute Gemini call with controlled exponential backoff, jitter, and fallback model
 */
async function executeGeminiWithBackoff(apiFn, maxRetries = 2) {
  let attempt = 0;
  const fallbackModels = [CONFIG.model, 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.7-flash'];

  while (attempt <= maxRetries) {
    try {
      const activeModel = fallbackModels[Math.min(attempt, fallbackModels.length - 1)];
      return await apiFn(activeModel);
    } catch (err) {
      const info = classifyGeminiError(err);
      console.warn(`[Gemini Engine] Attempt ${attempt + 1} error: [${info.code}] HTTP ${info.status}: ${err.message}`);

      if (!info.retryable || attempt === maxRetries) {
        err.geminiClassification = info;
        throw err;
      }

      attempt++;
      let delayMs = Math.pow(2, attempt) * 1200 + Math.random() * 400;
      if (err.errorDetails) {
        const retryInfo = err.errorDetails.find(d => d['@type'] && d['@type'].includes('RetryInfo'));
        if (retryInfo && retryInfo.retryDelay) {
          const parsedSeconds = parseInt(retryInfo.retryDelay, 10);
          if (!isNaN(parsedSeconds) && parsedSeconds <= 5) {
            delayMs = parsedSeconds * 1000 + 200;
          }
        }
      }

      console.log(`[Gemini Engine] Backing off for ${Math.round(delayMs)}ms before retry ${attempt}/${maxRetries}...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

/**
 * Generate Structured Aggregate AI Summary for Ward, District, State, or Central scope
 * Optimized: Sends pre-aggregated numerical facts + compact representative sample (capped).
 */
async function generateAiAggregateSummary({ scope = {}, requests = [] }) {
  const totalRequests = Array.isArray(requests) ? requests.length : 0;

  // 1. If 0 matching requests, do NOT call Gemini at all
  if (totalRequests === 0) {
    return {
      success: true,
      totalRequests: 0,
      summary: null,
      message: 'No citizen requests found for this selection.',
      mainIssues: [],
      recurringThemes: [],
      affectedGroups: [],
      overallUrgency: null,
      generatedAt: new Date().toISOString()
    };
  }

  // 2. Pre-compute numerical facts in backend code without using Gemini
  const statusCounts = { Pending: 0, Approved: 0, InProgress: 0, Completed: 0, Rejected: 0 };
  const urgencyCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const typeCounts = { demand: 0, complaint: 0 };
  const locationCounts = {};
  const issueKeywords = {};

  let latestTimestamp = '';
  requests.forEach(r => {
    const st = r.status || 'Pending';
    if (statusCounts[st] !== undefined) statusCounts[st]++;
    else statusCounts.Pending++;

    const urg = r.urgency || 'Medium';
    if (urgencyCounts[urg] !== undefined) urgencyCounts[urg]++;

    const typ = (r.request_type || 'demand').toLowerCase();
    if (typeCounts[typ] !== undefined) typeCounts[typ]++;

    const loc = r.problem_address || r.location_details || r.ward || r.village || r.district;
    if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;

    const iss = r.issue || r.subcategory || '';
    if (iss) issueKeywords[iss] = (issueKeywords[iss] || 0) + 1;

    if (r.created_at && r.created_at > latestTimestamp) {
      latestTimestamp = r.created_at;
    }
  });

  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([loc, cnt]) => `${loc} (${cnt})`)
    .join(', ');

  const topIssues = Object.entries(issueKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([iss, cnt]) => `${iss} (${cnt})`)
    .join('; ');

  // 3. Compact representative sample capped at CONFIG.maxSummaryItems (default 10)
  const sampleItems = requests.slice(0, CONFIG.maxSummaryItems).map(r => {
    const textSnippet = (r.original_text || r.description || r.issue || '').replace(/\s+/g, ' ').slice(0, 120);
    const loc = r.problem_address || r.location_details || r.ward || r.village || '';
    return `- [${r.urgency || 'Medium'}/${r.status || 'Pending'}] ${textSnippet}${loc ? ` (${loc})` : ''}`;
  }).join('\n');

  // 4. Data-aware Cache Key (identifies scope + totalCount + latest timestamp + status distribution)
  const cacheKey = JSON.stringify({
    scope,
    count: totalRequests,
    statusCounts,
    latest: latestTimestamp
  });

  const cached = summaryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CONFIG.cacheTtlMs)) {
    recordAiCallMetrics({ feature: 'aggregateSummary', cacheHit: true, inputTokens: 0, outputTokens: 0, durationMs: 0 });
    return cached.data;
  }

  // 5. In-flight Promise deduplication (coalescing)
  if (inFlightRequests.has(cacheKey)) {
    return await inFlightRequests.get(cacheKey);
  }

  const taskPromise = (async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = CONFIG.model;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      console.warn('[Gemini Engine] GEMINI_API_KEY is not configured in .env');
      return {
        success: false,
        totalRequests,
        summary: null,
        error: 'AI summary temporarily unavailable. Please try again.',
        mainIssues: [],
        recurringThemes: [],
        affectedGroups: [],
        overallUrgency: null
      };
    }

    const startTime = Date.now();
    try {
      const responseData = await executeGeminiWithBackoff(async (activeModel) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: activeModel || CONFIG.model,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: CONFIG.maxSummaryTokens
          }
        });

        // Ultra-compact qualitative prompt
        const prompt = `Administrative Scope: ${scope.level || 'ward'} | State: ${scope.state || 'Maharashtra'} | District: ${scope.district || 'All'} | Ward: ${scope.ward || 'All'} | Sector: ${scope.category || 'All'}
Summary Facts: Total: ${totalRequests} (Demand: ${typeCounts.demand}, Complaint: ${typeCounts.complaint}) | Status: Pending=${statusCounts.Pending}, Approved=${statusCounts.Approved}, Completed=${statusCounts.Completed}, Rejected=${statusCounts.Rejected} | Urgency: Critical=${urgencyCounts.Critical}, High=${urgencyCounts.High}, Med=${urgencyCounts.Medium} | Top Clusters: ${topIssues || 'Various'} | Locations: ${topLocations || 'Ward wide'}

Representative Samples:
${sampleItems}

Provide a concise qualitative analysis. Return JSON only:
{
  "summary": "Objective 2-3 sentence executive synthesis for government planners.",
  "mainIssues": ["Top issue 1", "Top issue 2", "Top issue 3"],
  "recurringThemes": ["Theme 1", "Theme 2"],
  "affectedGroups": ["Impacted group 1", "Impacted group 2"],
  "overallUrgency": "Critical"|"High"|"Medium"|"Low"
}`;

        const inputTokens = estimateTokens(prompt);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out after 12s')), 12000)
        );

        const result = await Promise.race([
          model.generateContent(prompt),
          timeoutPromise
        ]);

        const responseText = result.response.text();
        const outputTokens = estimateTokens(responseText);

        const parsed = extractAndParseJson(responseText);

        const durationMs = Date.now() - startTime;
        recordAiCallMetrics({
          feature: 'aggregateSummary',
          model: activeModel || CONFIG.model,
          inputTokens,
          outputTokens,
          durationMs,
          success: true
        });

        return {
          success: true,
          totalRequests,
          summary: typeof parsed.summary === 'string' && parsed.summary.trim().length > 0 ? parsed.summary.trim() : null,
          mainIssues: Array.isArray(parsed.mainIssues) ? parsed.mainIssues.filter(Boolean).slice(0, 5) : [],
          recurringThemes: Array.isArray(parsed.recurringThemes) ? parsed.recurringThemes.filter(Boolean).slice(0, 4) : [],
          affectedGroups: Array.isArray(parsed.affectedGroups) ? parsed.affectedGroups.filter(Boolean).slice(0, 3) : [],
          overallUrgency: ALLOWED_URGENCIES.includes(parsed.overallUrgency) ? parsed.overallUrgency : 'Medium',
          aiModel: modelName,
          generatedAt: new Date().toISOString()
        };
      });

      // Cache successful response
      summaryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responseData
      });

      return responseData;

    } catch (finalErr) {
      const classification = finalErr.geminiClassification || classifyGeminiError(finalErr);
      const durationMs = Date.now() - startTime;
      recordAiCallMetrics({
        feature: 'aggregateSummary',
        model: modelName,
        inputTokens: 0,
        outputTokens: 0,
        durationMs,
        success: false,
        errorCode: classification.code
      });

      console.error(`[Gemini Engine Failure] [${classification.code}] Status ${classification.status}: ${finalErr.message}`);

      return {
        success: false,
        totalRequests,
        summary: null,
        error: 'AI summary temporarily unavailable. Please try again.',
        errorCode: classification.code,
        mainIssues: [],
        recurringThemes: [],
        affectedGroups: [],
        overallUrgency: null,
        generatedAt: new Date().toISOString()
      };
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, taskPromise);
  return await taskPromise;
}

/**
 * Intelligent semantic rule-based fallback analyzer for citizen request submission
 */
function analyzeWithRuleFallback(text) {
  let language = 'English';
  if (/[\u0980-\u09FF]/.test(text)) {
    language = /গাঁৱत|চিকিৎসা|পানী|মথাउৰি|বাবে|হৈছে/.test(text) ? 'Assamese' : 'Bengali';
  } else if (/[\u0B80-\u0BFF]/.test(text)) {
    language = 'Tamil';
  } else if (/[\u0C00-\u0C7F]/.test(text)) {
    language = 'Telugu';
  } else if (/[\u0C80-\u0CFF]/.test(text)) {
    language = 'Kannada';
  } else if (/[\u0A80-\u0AFF]/.test(text)) {
    language = 'Gujarati';
  } else if (/[\u0900-\u097F]/.test(text)) {
    if (/आम्हाला|आमच्या|गावात|नाही|आहे|होतो|गेले|पाहिजे|शेतकरी|पाऊस|रस्ता|दवाखाना|शाळा|आरोग्य/.test(text)) {
      language = 'Marathi';
    } else {
      language = 'Hindi';
    }
  }

  let category = 'Other';
  let issue = 'Civic infrastructure requirement';
  let issue_type = 'general_infrastructure_need';
  let urgency = 'Medium';
  let affected_group = 'Local residents';
  let summary = text;

  if (/हॉस्पिटल|दवाखाना|उपचार|आजारी|रुग्णालय|आरोग्य|स्वास्थ्य|अस्पताल|चिकित्सा|डাক্তাৰ|மருத்துவ|doctor|hospital|clinic|medical|health|patient|गरोदर|emergency treatment|travel.*km.*treatment|प्राथमिक आरोग्य|स्वास्थ्य केंद्र/i.test(text)) {
    category = 'Healthcare';
    issue = 'Lack of primary healthcare facility';
    issue_type = 'lack_of_healthcare_facility';
    urgency = 'High';
    affected_group = 'Rural residents and vulnerable patients';
    summary = text;
  } else if (/शाळा|शिक्षक|कमरे|विद्यार्थी|स्कूल|विद्यालय|अध्यापक|বিদ্যালয়|பள்ளி|school|education|teacher|student|classroom|books|leaking roof/i.test(text)) {
    category = 'Education';
    issue = 'Inadequate educational infrastructure or staff';
    issue_type = 'inadequate_school_infrastructure';
    urgency = 'High';
    affected_group = 'School children and teachers';
    summary = text;
  } else if (/road|रस्ता|सडक|खड्डा|bridge|highway|transport|bus|traffic|damaged road|पूल|মথাउৰি|சாலை|பாலம்|flood.*damaged.*road|washed away/i.test(text)) {
    category = 'Roads & Transport';
    issue = 'Damaged transportation route or connectivity breakdown';
    issue_type = 'damaged_transport_infrastructure';
    urgency = 'Critical';
    affected_group = 'Commuters, students, and emergency transit';
    summary = text;
  } else if (/पाणी|पानी|water|drinking water|borewell|drain|drainage|नाला|pipe|sewage|sanitation|পানী|தண்ணீர்|pipeline|contamination/i.test(text)) {
    category = 'Water & Sanitation';
    issue = 'Drinking water shortage or drainage contamination';
    issue_type = 'drinking_water_disruption';
    urgency = 'High';
    affected_group = 'Local households and community';
    summary = text;
  } else if (/electricity|power|load shedding|light|वीज|बिजली|current|voltage|transformer|विद्युत|மின்சாரம்/i.test(text)) {
    category = 'Electricity';
    issue = 'Power outage or erratic electricity supply';
    issue_type = 'power_outage_irrigation';
    urgency = 'High';
    affected_group = 'Farmers, households, and local businesses';
    summary = text;
  } else if (/network|मोबाईल|इंटरनेट|mobile|tower|internet|connectivity|signal|bsnl|செல்போன்/i.test(text)) {
    category = 'Digital Connectivity';
    issue = 'Poor or absent mobile network and internet connectivity';
    issue_type = 'telecom_network_blackout';
    urgency = 'Medium';
    affected_group = 'Students and digital service users';
    summary = text;
  } else if (/शेतकरी|शेती|crop|farming|farmer|कृषी|market|mandi|grain|apmc|बीज|गोदाम|விவசாயம்/i.test(text)) {
    category = 'Agriculture';
    issue = 'Agricultural infrastructure or market storage deficiency';
    issue_type = 'apmc_storage_deficiency';
    urgency = 'Medium';
    affected_group = 'Farming community';
    summary = text;
  } else if (/घर|मकान|आवास|housing|shelter|flood shelter|வீடு/i.test(text)) {
    category = 'Housing';
    issue = 'Substandard housing or lack of disaster shelter';
    issue_type = 'substandard_housing';
    urgency = 'Medium';
    affected_group = 'Vulnerable families';
    summary = text;
  }

  return {
    language,
    category,
    issue,
    issue_type,
    urgency,
    affected_group,
    location_details: null,
    summary,
    ai_engine: 'semantic_fallback_analyzer'
  };
}

/**
 * Primary Google Gemini AI Semantic Classifier for Individual Citizen Request
 * Optimized: Concise prompt, output tokens limited to 200, respects client-selected language/category.
 */
async function processCitizenRequestWithGemini(userText, clientMetadata = {}) {
  if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
    throw new Error('Request text cannot be empty');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = CONFIG.model;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.warn('[Gemini Engine] GEMINI_API_KEY is not configured in .env. Using resilient semantic analyzer.');
    return analyzeWithRuleFallback(userText);
  }

  const startTime = Date.now();
  try {
    const resultData = await executeGeminiWithBackoff(async (activeModel) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: activeModel || CONFIG.model,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: CONFIG.maxCitizenTokens
        }
      });

      const explicitLang = clientMetadata.userLanguage && clientMetadata.userLanguage !== 'Auto' && clientMetadata.userLanguage !== 'Unknown'
        ? clientMetadata.userLanguage
        : null;

      const prompt = `Analyze this citizen civic request:${explicitLang ? ` Language: ${explicitLang}` : ''}
"${userText.trim()}"

Return JSON only:
{
  "language": "${explicitLang || 'detected language (Marathi/Hindi/English/etc.)'}",
  "category": "Healthcare"|"Education"|"Roads & Transport"|"Water & Sanitation"|"Electricity"|"Digital Connectivity"|"Agriculture"|"Housing"|"Other",
  "issue": "Concise English title of the civic defect or demand",
  "issue_type": "snake_case_defect_tag",
  "urgency": "Critical"|"High"|"Medium"|"Low",
  "affected_group": "Specific demographic affected",
  "location_details": "Mentioned locality/landmark or null",
  "summary": "1-2 sentence professional English summary of the problem and civic impact."
}`;

      const inputTokens = estimateTokens(prompt);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out after 10s')), 10000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const responseText = result.response.text();
      const outputTokens = estimateTokens(responseText);

      const parsed = extractAndParseJson(responseText);

      const durationMs = Date.now() - startTime;
      recordAiCallMetrics({
        feature: 'citizenRequestAnalysis',
        model: activeModel || CONFIG.model,
        inputTokens,
        outputTokens,
        durationMs,
        success: true
      });

      const validatedCategory = ALLOWED_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : 'Other';

      const validatedUrgency = ALLOWED_URGENCIES.includes(parsed.urgency)
        ? parsed.urgency
        : 'Medium';

      return {
        language: explicitLang || parsed.language || 'Unknown',
        category: validatedCategory,
        issue: parsed.issue || 'Civic infrastructure request',
        issue_type: parsed.issue_type || 'general_civic_need',
        urgency: validatedUrgency,
        affected_group: parsed.affected_group || 'General public',
        location_details: parsed.location_details || null,
        summary: parsed.summary || userText,
        ai_engine: activeModel || CONFIG.model
      };
    });

    return resultData;
  } catch (err) {
    const classification = err.geminiClassification || classifyGeminiError(err);
    const durationMs = Date.now() - startTime;
    recordAiCallMetrics({
      feature: 'citizenRequestAnalysis',
      model: modelName,
      inputTokens: 0,
      outputTokens: 0,
      durationMs,
      success: false,
      errorCode: classification.code
    });

    console.warn(`[Gemini Engine Semantic Classifier Notice] [${classification.code}]: ${err.message}. Engaging resilient semantic analyzer.`);
    return analyzeWithRuleFallback(userText);
  }
}

/**
 * Heuristic semantic fallback comparator when AI service is unavailable
 */
function compareTextSimilarityFallback(newText, candidateText) {
  if (!newText || !candidateText) return { isDuplicate: false, confidence: 0, reason: '' };

  const clean = (str) => str.toLowerCase().replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F]/g, ' ').replace(/\s+/g, ' ').trim();
  const c1 = clean(newText);
  const c2 = clean(candidateText);

  if (c1 === c2) {
    return { isDuplicate: true, confidence: 1.0, reason: 'Exact text match with existing active request.' };
  }

  const tokens1 = new Set(c1.split(' ').filter(w => w.length > 2));
  const tokens2 = new Set(c2.split(' ').filter(w => w.length > 2));

  if (tokens1.size === 0 || tokens2.size === 0) {
    return { isDuplicate: false, confidence: 0, reason: '' };
  }

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  const score = intersection.size / union.size;

  if (score >= 0.65) {
    return {
      isDuplicate: true,
      confidence: Math.round(score * 100) / 100,
      reason: `Significant semantic overlap (${Math.round(score * 100)}% keyword match) with existing active issue.`
    };
  }

  return { isDuplicate: false, confidence: Math.round(score * 100) / 100, reason: 'No significant semantic overlap found.' };
}

/**
 * Multilingual Semantic Duplicate Detection using Google Gemini AI
 * Optimized: Zero AI call if candidates === 0, candidates capped at CONFIG.maxDuplicateCandidates (8),
 * compact input list, output tokens limited to 120.
 */
async function detectSemanticDuplicate({ userText, requestType = 'demand', category = null, candidateRequests = [] }) {
  if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
    return { isDuplicate: false, matchedRequestId: null, confidence: 0, reason: 'Empty request text' };
  }

  // Zero tokens spent if no active candidates
  if (!Array.isArray(candidateRequests) || candidateRequests.length === 0) {
    return { isDuplicate: false, matchedRequestId: null, confidence: 0, reason: 'No active candidates to compare' };
  }

  // Cap candidates and format into ultra-compact lines
  const cappedCandidates = candidateRequests.slice(0, CONFIG.maxDuplicateCandidates);
  const compactCandidateList = cappedCandidates.map((r, idx) => {
    const reqId = r.request_code || (r.id ? `REQ-${r.id}` : `REQ-${idx + 1}`);
    const textSnippet = (r.original_text || r.issue || '').replace(/\s+/g, ' ').slice(0, 140);
    const loc = r.problem_address || r.location_details || r.ward || r.village || '';
    return `${idx + 1}. [${reqId}] (${r.request_type || 'demand'}/${r.status || 'Pending'}) ${loc ? `[${loc}] ` : ''}"${textSnippet}"`;
  }).join('\n');

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = CONFIG.model;
  const confidenceThreshold = parseFloat(process.env.GEMINI_DUPLICATE_THRESHOLD) || 0.85;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    for (const cand of cappedCandidates) {
      const match = compareTextSimilarityFallback(userText, cand.original_text || cand.issue);
      if (match.isDuplicate && match.confidence >= confidenceThreshold) {
        return {
          isDuplicate: true,
          matchedRequestId: cand.request_code || (cand.id ? `REQ-${cand.id}` : 'REQ-1'),
          confidence: match.confidence,
          reason: match.reason
        };
      }
    }
    return { isDuplicate: false, matchedRequestId: null, confidence: 0, reason: 'No duplicate detected.' };
  }

  const startTime = Date.now();
  try {
    const duplicateDecision = await executeGeminiWithBackoff(async (activeModel) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: activeModel || CONFIG.model,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: CONFIG.maxMatchTokens
        }
      });

      const prompt = `Determine if this NEW citizen submission is a semantic duplicate of ANY existing active request. Understand Marathi, Hindi, English semantic equivalence.

NEW: [${requestType}/${category || 'General'}] "${userText.trim()}"

EXISTING CANDIDATES:
${compactCandidateList}

Return JSON only:
{
  "isDuplicate": boolean,
  "matchedRequestId": "REQ-xxxx"|null,
  "confidence": number (0.0-1.0),
  "reason": "1-sentence explanation"
}`;

      const inputTokens = estimateTokens(prompt);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API duplicate check timed out after 8s')), 8000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const responseText = result.response.text();
      const outputTokens = estimateTokens(responseText);

      const parsed = extractAndParseJson(responseText);

      const durationMs = Date.now() - startTime;
      recordAiCallMetrics({
        feature: 'duplicateDetection',
        model: activeModel || CONFIG.model,
        inputTokens,
        outputTokens,
        durationMs,
        success: true
      });

      const isDup = Boolean(parsed.isDuplicate) && (typeof parsed.confidence === 'number' ? parsed.confidence >= confidenceThreshold : true);
      const defaultMatchedId = cappedCandidates[0].request_code || (cappedCandidates[0].id ? `REQ-${cappedCandidates[0].id}` : 'REQ-1');

      return {
        isDuplicate: isDup,
        matchedRequestId: isDup ? (parsed.matchedRequestId || defaultMatchedId) : null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (isDup ? 0.95 : 0.2),
        reason: parsed.reason || (isDup ? 'Semantic duplicate detected.' : 'Different civic issue.')
      };
    });

    return duplicateDecision;

  } catch (err) {
    const classification = err.geminiClassification || classifyGeminiError(err);
    const durationMs = Date.now() - startTime;
    recordAiCallMetrics({
      feature: 'duplicateDetection',
      model: CONFIG.model,
      inputTokens: 0,
      outputTokens: 0,
      durationMs,
      success: false,
      errorCode: classification.code
    });

    console.warn(`[Gemini Duplicate Detector Notice] [${classification.code}]: ${err.message}. Engaging resilient semantic comparator.`);

    for (const cand of cappedCandidates) {
      const match = compareTextSimilarityFallback(userText, cand.original_text || cand.issue);
      if (match.isDuplicate && match.confidence >= confidenceThreshold) {
        return {
          isDuplicate: true,
          matchedRequestId: cand.request_code || (cand.id ? `REQ-${cand.id}` : 'REQ-1'),
          confidence: match.confidence,
          reason: match.reason
        };
      }
    }

    return {
      isDuplicate: false,
      matchedRequestId: null,
      confidence: 0,
      reason: 'No duplicate detected.'
    };
  }
}

/**
 * Multilingual AI Semantic Government Plan Matching using Google Gemini
 * Optimized: Zero AI call if candidates === 0, candidates capped at CONFIG.maxPlanCandidates (8),
 * compact input list, output tokens limited to 150.
 */
async function matchCitizenRequestToGovernmentPlans({ userText, requestType = 'demand', category = null, location = {}, candidatePlans = [] }) {
  if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
    return { planMatch: false, matchedPlanCode: null, confidence: 0, reason: 'Empty request text' };
  }

  // Zero tokens spent if no candidate plans
  if (!Array.isArray(candidatePlans) || candidatePlans.length === 0) {
    return { planMatch: false, matchedPlanCode: null, confidence: 0, reason: 'No upcoming government plans in this area/category.' };
  }

  // Cap candidates and format into ultra-compact lines
  const cappedPlans = candidatePlans.slice(0, CONFIG.maxPlanCandidates);
  const compactPlanList = cappedPlans.map((p, idx) => {
    const code = p.plan_code || (p.id ? `PLAN-${p.id}` : `PLAN-${idx + 1}`);
    const loc = p.ward || p.village || p.district || '';
    const dateStr = p.planned_completion_date ? ` (Target: ${p.planned_completion_date})` : '';
    return `${idx + 1}. [${code}] (${p.category}) ${loc ? `[${loc}] ` : ''}${p.title}${dateStr}`;
  }).join('\n');

  const apiKey = process.env.GEMINI_API_KEY;
  const matchThreshold = parseFloat(process.env.GEMINI_PLAN_MATCH_THRESHOLD) || 0.75;

  const locSummary = [location.ward, location.village, location.locality, location.district, location.state]
    .filter(Boolean)
    .join(', ');

  // Fallback heuristic comparator with multilingual synonym expansion
  const runFallbackPlanMatch = () => {
    const cleanUser = userText.toLowerCase().replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F]/g, ' ');
    const userWords = new Set(cleanUser.split(/\s+/).filter(w => w.length > 2));

    const MULTILINGUAL_SYNONYMS = {
      health: ['आरोग्य', 'दवाखाना', 'रुग्णालय', 'प्राथमिक आरोग्य केंद्र', 'प्रसूती', 'डॉक्टर', 'अस्पताल', 'इलाज', 'स्वास्थ्य', 'प्रसूति', 'चिकित्सा', 'चिकित्सालय', 'health', 'hospital', 'clinic', 'phc', 'maternity'],
      road: ['रस्ता', 'डांबरीकरण', 'रस्ते', 'खड्डे', 'पूल', 'सड़क', 'रास्ता', 'गड्ढे', 'road', 'highway', 'pavement', 'asphalt', 'widening'],
      water: ['पाणी', 'पिण्याचे पाणी', 'टाकी', 'पाईपलाईन', 'जल', 'नल', 'पानी', 'पाइपलाइन', 'water', 'tank', 'reservoir', 'pipeline', 'drainage'],
      electricity: ['वीज', 'लाईट', 'खांब', 'ट्रान्सफॉर्मर', 'बिजली', 'लाइट', 'खंभा', 'electricity', 'power', 'light', 'substation', 'cabling', 'lighting'],
      waste: ['कचरा', 'सांडपाणी', 'सफाई', 'कचराकुंडी', 'कूड़ा', 'सफाई', 'waste', 'garbage', 'sanitation', 'composting']
    };

    for (const plan of cappedPlans) {
      if (category && plan.category && category.toLowerCase() !== plan.category.toLowerCase() && category !== 'Other') {
        continue;
      }

      const planText = `${plan.title} ${plan.title_mr || ''} ${plan.title_hi || ''} ${plan.description || ''}`.toLowerCase();
      const planWords = new Set(planText.split(/\s+/).filter(w => w.length > 2));

      let matchedWords = 0;
      for (const w of userWords) {
        if (planWords.has(w)) matchedWords++;
      }

      let conceptMatch = false;
      for (const [concept, keywords] of Object.entries(MULTILINGUAL_SYNONYMS)) {
        const userHasKeyword = keywords.some(k => cleanUser.includes(k.toLowerCase()));
        const planHasKeyword = keywords.some(k => planText.includes(k.toLowerCase()));
        if (userHasKeyword && planHasKeyword) {
          conceptMatch = true;
          break;
        }
      }

      const overlapRatio = userWords.size > 0 ? (matchedWords / userWords.size) : 0;
      if (overlapRatio >= 0.3 || conceptMatch || planText.includes(cleanUser.trim())) {
        return {
          planMatch: true,
          matchedPlanCode: plan.plan_code || `PLAN-${plan.id}`,
          confidence: Math.min(0.95, Math.round((0.80 + (conceptMatch ? 0.1 : 0) + overlapRatio * 0.1) * 100) / 100),
          reason: `The requested civic development aligns directly with the upcoming government project: "${plan.title}".`
        };
      }
    }

    return { planMatch: false, matchedPlanCode: null, confidence: 0, reason: 'No matching upcoming government plan found.' };
  };

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return runFallbackPlanMatch();
  }

  const startTime = Date.now();
  try {
    const matchDecision = await executeGeminiWithBackoff(async (activeModel) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: activeModel || CONFIG.model,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: CONFIG.maxMatchTokens
        }
      });

      const prompt = `Determine if this citizen request is ALREADY INCLUDED in one of the upcoming government development plans. Understand Marathi, Hindi, English equivalence.

CITIZEN REQUEST:
Type: ${requestType} | Sector: ${category || 'General'} | Location: ${locSummary || 'Not specified'}
"${userText.trim()}"

UPCOMING GOVERNMENT PLANS IN THIS REGION:
${compactPlanList}

Return JSON only:
{
  "planMatch": boolean,
  "matchedPlanCode": "PLAN-xxxx"|null,
  "confidence": number (0.0-1.0),
  "reason": "1-sentence explanation why this work is already planned or null"
}`;

      const inputTokens = estimateTokens(prompt);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API plan match check timed out after 8s')), 8000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const responseText = result.response.text();
      const outputTokens = estimateTokens(responseText);

      const parsed = extractAndParseJson(responseText);

      const durationMs = Date.now() - startTime;
      recordAiCallMetrics({
        feature: 'planMatching',
        model: activeModel || CONFIG.model,
        inputTokens,
        outputTokens,
        durationMs,
        success: true
      });

      const isMatched = Boolean(parsed.planMatch) && (typeof parsed.confidence === 'number' ? parsed.confidence >= matchThreshold : true);
      const defaultMatchedCode = cappedPlans[0].plan_code || (cappedPlans[0].id ? `PLAN-${cappedPlans[0].id}` : 'PLAN-1');

      return {
        planMatch: isMatched,
        matchedPlanCode: isMatched ? (parsed.matchedPlanCode || defaultMatchedCode) : null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (isMatched ? 0.92 : 0.1),
        reason: parsed.reason || (isMatched ? 'This development is already included in an upcoming government plan.' : 'No matching plan found.')
      };
    });

    return matchDecision;

  } catch (err) {
    const classification = err.geminiClassification || classifyGeminiError(err);
    const durationMs = Date.now() - startTime;
    recordAiCallMetrics({
      feature: 'planMatching',
      model: modelName,
      inputTokens: 0,
      outputTokens: 0,
      durationMs,
      success: false,
      errorCode: classification.code
    });

    console.warn(`[Gemini Plan Matcher Notice] [${classification.code}]: ${err.message}. Running resilient plan comparator.`);
    return runFallbackPlanMatch();
  }
}

module.exports = {
  generateAiAggregateSummary,
  processCitizenRequestWithGemini,
  detectSemanticDuplicate,
  matchCitizenRequestToGovernmentPlans,
  invalidateAiSummaryCache,
  getAiMetrics,
  logGeminiConfig,
  ALLOWED_CATEGORIES,
  ALLOWED_URGENCIES,
  CONFIG
};
