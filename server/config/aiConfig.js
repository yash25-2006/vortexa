const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const AI_CONFIG = {
  model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  maxSummaryTokens: parseInt(process.env.GEMINI_MAX_SUMMARY_TOKENS, 10) || 350,
  maxCitizenTokens: parseInt(process.env.GEMINI_MAX_CITIZEN_TOKENS, 10) || 200,
  maxMatchTokens: parseInt(process.env.GEMINI_MAX_MATCH_TOKENS, 10) || 120,
  maxDuplicateCandidates: parseInt(process.env.AI_DUPLICATE_MAX_CANDIDATES, 10) || 8,
  maxPlanCandidates: parseInt(process.env.AI_PLAN_MAX_CANDIDATES, 10) || 8,
  maxSummaryItems: parseInt(process.env.AI_SUMMARY_MAX_ITEMS, 10) || 10,
  cacheTtlMs: (parseInt(process.env.AI_CACHE_TTL, 10) || 900) * 1000 // 15 minutes default
};

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

module.exports = {
  AI_CONFIG,
  ALLOWED_CATEGORIES,
  ALLOWED_URGENCIES
};
