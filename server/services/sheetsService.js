/**
 * Google Sheets Service
 * Logs anonymized conversation analytics
 */
const config = require('../config');

let sheets = null;
let auth = null;

// Initialize Google Sheets if credentials available
if (config.isSheetsEnabled) {
  try {
    const { google } = require('googleapis');
    const fs = require('fs');
    const credentials = config.googleSheetsCredentialsJson
      ? JSON.parse(config.googleSheetsCredentialsJson)
      : JSON.parse(fs.readFileSync(config.googleSheetsCredentials, 'utf8'));
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets service initialized');
  } catch (error) {
    console.warn('⚠️ Google Sheets initialization failed:', error.message);
  }
}

const sheetsService = {
  /**
   * Log an interaction to Google Sheets
   * @param {object} data - Interaction data to log
   */
  async logInteraction(data) {
    if (!sheets) {
      // Silent fail — analytics is optional
      return;
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.googleSheetsId,
        range: 'Sheet1!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.timestamp,
            data.intent,
            data.agent,
            data.processingTime + 'ms',
            data.mode,
            'election-assistant'
          ]]
        }
      });
    } catch (error) {
      console.warn('Sheets logging error:', error.message);
    }
  },

  isAvailable() {
    return !!sheets;
  }
};

module.exports = sheetsService;
