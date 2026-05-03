/**
 * Express Server Entry Point
 * Election Process Assistant - Agent-Based System
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const config = require('./config');
const chatRoutes = require('./routes/chat');

const app = express();

// Security middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://i.ytimg.com'],
      frameSrc: ['https://www.google.com', 'https://www.youtube.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' }
}));
app.use(xss());

// Rate limiting: 100 API requests per 15 minutes per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Standard middleware
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
}));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public'), {
  index: 'index.html',
  maxAge: config.nodeEnv === 'production' ? '1h' : 0
}));

// API routes
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      gemini: config.isGeminiEnabled ? 'connected' : 'fallback_mode',
      maps: config.isMapsEnabled ? 'connected' : 'disabled',
      sheets: config.isSheetsEnabled ? 'connected' : 'disabled',
      youtube: config.isYouTubeEnabled ? 'connected' : 'disabled'
    }
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

function startServer() {
  return app.listen(config.port, () => {
    console.log('\nElection Assistant Agent System');
    console.log('===================================');
    console.log(`Server running at: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Gemini AI: ${config.isGeminiEnabled ? 'Enabled' : 'Fallback Mode'}`);
    console.log(`Google Maps: ${config.isMapsEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Google Sheets: ${config.isSheetsEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`YouTube Data API: ${config.isYouTubeEnabled ? 'Enabled' : 'Disabled'}`);
    console.log('===================================\n');
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
