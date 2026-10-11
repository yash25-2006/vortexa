const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const DB_CONFIG = {
  databaseUrl: process.env.DATABASE_URL || '',
  sqlitePath: path.resolve(__dirname, '../data.sqlite'),
  pgSsl: process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production'
};

module.exports = {
  DB_CONFIG
};
