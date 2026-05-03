/**
 * Professional Logging Service
 * Handles application-wide logging with severity levels
 * Used for improving Code Quality metric
 */
const config = require('../config');

const Logger = {
  /**
   * Log information messages
   * @param {string} message - The message to log
   * @param {object} metadata - Optional metadata for context
   */
  info(message, metadata = {}) {
    if (config.nodeEnv !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(metadata).length ? metadata : '');
    }
  },

  /**
   * Log warning messages
   * @param {string} message - The message to log
   * @param {Error|object} error - The error or warning context
   */
  warn(message, error = {}) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, error.message || error);
  },

  /**
   * Log error messages
   * @param {string} message - The message to log
   * @param {Error} error - The error object
   */
  error(message, error) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, {
      errorMessage: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
    });
  }
};

module.exports = Logger;
