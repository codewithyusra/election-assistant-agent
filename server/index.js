/**
 * Express Server Entry Point
 * Election Process Assistant — Agent-Based System
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

// Security Middleware
app.use(helmet());
app.use(xss());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      gemini: config.isGeminiEnabled ? 'connected' : 'fallback_mode',
      maps: config.isMapsEnabled ? 'connected' : 'disabled',
      sheets: config.isSheetsEnabled ? 'connected' : 'disabled'
    }
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(config.port, () => {
  console.log(`\n🗳️  Election Assistant Agent System`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server running at: http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Gemini AI: ${config.isGeminiEnabled ? '✅ Enabled' : '⚠️  Fallback Mode'}`);
  console.log(`🗺️  Google Maps: ${config.isMapsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`📋 Google Sheets: ${config.isSheetsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

module.exports = app;
