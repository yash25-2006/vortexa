const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads', 'requests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security & Parsing Middleware
const allowedOrigins = [
  'https://jan-setu-gdg.web.app',
  'https://jan-setu-gdg.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.web.app') ||
      origin.endsWith('.firebaseapp.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-gov-email',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve Static Uploads
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'India Development Intelligence Platform API',
    version: '1.0.0 (Phase 1)',
    databaseDriver: db.getDriver(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend Static Dist if present
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await db.initDb();

    // Ensure complete demo dataset is initialized
    try {
      console.log('==============================================');
      console.log('Verifying & seeding demo dataset...');
      console.log('==============================================');

      const { seed } = require('./db/seed');
      await seed();

      console.log('==============================================');
      console.log('Complete demo dataset ready.');
      console.log('==============================================');
    } catch (seedErr) {
      console.warn('Auto-seed check/execution notice:', seedErr.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(` India Development Intelligence Server (Phase 1)`);
      console.log(` API running at http://localhost:${PORT}`);
      console.log(` Health check:  http://localhost:${PORT}/api/health`);
      console.log(` Requests API:  http://localhost:${PORT}/api/requests`);
      console.log(` Stats API:     http://localhost:${PORT}/api/stats`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  }
}

startServer();
