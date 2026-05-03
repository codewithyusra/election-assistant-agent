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
  googleSheetsId: process.env.GOOGLE_SHEETS_ID || '',

  // Google YouTube Data API
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',

  // Feature flags based on available keys
  get isGeminiEnabled() {
    return this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here';
  },
  get isMapsEnabled() {
    return this.googleMapsApiKey && this.googleMapsApiKey !== 'your_google_maps_api_key_here';
  },
  get isSheetsEnabled() {
    return this.googleSheetsCredentials && this.googleSheetsId &&
           this.googleSheetsCredentials !== './credentials.json';
  },
  get isYouTubeEnabled() {
    return this.youtubeApiKey && this.youtubeApiKey !== 'your_youtube_api_key_here';
  }
};

module.exports = config;
