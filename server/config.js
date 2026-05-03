/**
 * Centralized configuration loader
 * Loads environment variables and provides defaults
 */
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Google Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Google Maps API
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

  // Google Sheets API
  googleSheetsCredentials: process.env.GOOGLE_SHEETS_CREDENTIALS || '',
  googleSheetsCredentialsJson: process.env.GOOGLE_SHEETS_CREDENTIALS_JSON || '',
  googleSheetsId: process.env.GOOGLE_SHEETS_ID || '',

  // Google YouTube Data API
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',

  // Security
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),

  // Feature flags based on available keys
  get isGeminiEnabled() {
    return this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here';
  },
  get isMapsEnabled() {
    return this.googleMapsApiKey && this.googleMapsApiKey !== 'your_google_maps_api_key_here';
  },
  get isSheetsEnabled() {
    const hasFileCredentials = this.googleSheetsCredentials &&
      this.googleSheetsCredentials !== './credentials.json';
    return (this.googleSheetsCredentialsJson || hasFileCredentials) && this.googleSheetsId;
  },
  get isYouTubeEnabled() {
    return this.youtubeApiKey && this.youtubeApiKey !== 'your_youtube_api_key_here';
  }
};

if (config.allowedOrigins.length === 0) {
  config.allowedOrigins = config.nodeEnv === 'production'
    ? [process.env.APP_URL, process.env.GOOGLE_CLOUD_RUN_SERVICE_URL].filter(Boolean)
    : [`http://localhost:${config.port}`, `http://127.0.0.1:${config.port}`];
}

module.exports = config;
