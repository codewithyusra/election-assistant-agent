/**
 * Google Maps Service
 * Provides polling station location functionality
 */
const config = require('../config');

const mapsService = {
  /**
   * Get a Google Maps embed URL for polling station search
   * @param {string} query - Location query from user
   * @returns {object|null} Map embed data
   */
  async getMapEmbed(query) {
    if (!config.isMapsEnabled) return null;

    try {
      const searchQuery = encodeURIComponent(`polling station ${query}`);
      return {
        embedUrl: `https://www.google.com/maps/embed/v1/search?key=${config.googleMapsApiKey}&q=${searchQuery}`,
        searchUrl: `https://www.google.com/maps/search/polling+station+${searchQuery}`
      };
    } catch (error) {
      console.warn('Maps service error:', error.message);
      return null;
    }
  },

  /**
   * Get a static search link (works without API key)
   * @param {string} location - Location string
   * @returns {string} Google Maps search URL
   */
  getSearchLink(location) {
    const query = encodeURIComponent(`polling station near ${location}`);
    return `https://www.google.com/maps/search/${query}`;
  },

  isAvailable() {
    return config.isMapsEnabled;
  }
};

module.exports = mapsService;
