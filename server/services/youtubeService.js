/**
 * Google YouTube Data API Service
 * Fetches relevant educational videos for election queries
 */
const { google } = require('googleapis');
const config = require('../config');
const Logger = require('./logger');

let youtube = null;

if (config.isYouTubeEnabled) {
  try {
    youtube = google.youtube({
      version: 'v3',
      auth: config.youtubeApiKey
    });
    Logger.info('YouTube Data API service initialized successfully');
  } catch (error) {
    Logger.error('YouTube Data API initialization failed', error);
  }
}

const youtubeService = {
  /**
   * Search for educational videos related to elections
   * @param {string} query - The search query
   * @returns {Promise<Array>} Array of video objects with title, id, and thumbnail
   */
  async searchVideos(query) {
    if (!youtube) return [];

    try {
      const response = await youtube.search.list({
        part: 'snippet',
        q: query + ' election commission of india',
        type: 'video',
        maxResults: 2,
        relevanceLanguage: 'en',
        safeSearch: 'strict'
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      Logger.error('YouTube video search failed', error);
      return [];
    }
  },

  isAvailable() {
    return !!youtube;
  }
};

module.exports = youtubeService;
