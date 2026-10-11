const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const { AI_CONFIG, ALLOWED_CATEGORIES, ALLOWED_URGENCIES } = require('./aiConfig');
const { DB_CONFIG } = require('./dbConfig');

const APP_CONFIG = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'india-dev-intel-secure-secret-key-2026',
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID || '',
    dialogflowLanguageCode: process.env.DIALOGFLOW_LANGUAGE_CODE || 'en'
  },
  ai: AI_CONFIG,
  db: DB_CONFIG,
  categories: ALLOWED_CATEGORIES,
  urgencies: ALLOWED_URGENCIES
};

module.exports = APP_CONFIG;
