/**
 * Google Maps Service
 * Optimized for high-quality embedding
 */
const config = require('../config');
const Logger = require('./logger');

const mapsService = {
  /**
   * Get a Google Maps embed URL for a location
   * @param {string} query - Location to search for
   * @returns {object|null} Map metadata and URL
   */
  async getMapEmbed(query) {
    if (!config.isMapsEnabled) return null;

    try {
      const searchQuery = encodeURIComponent(`polling station near ${query}`);
      Logger.info(`Generating map embed for: ${query}`);
      
      return {
        type: 'map',
        embedUrl: `https://www.google.com/maps/embed/v1/search?key=${config.googleMapsApiKey}&q=${searchQuery}`,
        place: query
      };
    } catch (error) {
      Logger.error('Failed to generate map embed', error);
      return null;
    }
  },

  /** Check if Maps is available */
  isAvailable() {
    return config.isMapsEnabled;
  }
};

module.exports = mapsService;
