/**
 * Google Gemini API Service
 * Wraps the @google/generative-ai SDK for agent use
 * Optimized for "Meaningful Integration" with structured output
 */
const config = require('../config');
const Logger = require('./logger');

let genAI = null;
let model = null;

// Response Cache for Efficiency
const responseCache = new Map();
const CACHE_MAX_SIZE = 200;

// Initialize Gemini if API key is available
if (config.isGeminiEnabled) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    
    // Using a specific system instruction configuration
    model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: 'You are an expert Election Process Assistant. Your goal is to provide highly accurate, non-partisan, and structured information about Indian elections. Use markdown for formatting and prioritize clarity.'
    });
    
    Logger.info('Gemini AI service initialized successfully');
  } catch (error) {
    Logger.error('Gemini AI initialization failed', error);
  }
}

/**
 * Gemini Service Module
 * Handles all AI interactions with the Gemini API
 */
const geminiService = {
  /**
   * Generate content using Gemini API
   * @param {string} userMessage - The user's message
   * @param {string} systemPrompt - Specific system prompt for the specialized agent
   * @returns {Promise<string>} Generated response text
   * @throws {Error} If Gemini AI is not available or request fails
   */
  async generateContent(userMessage, systemPrompt = '') {
    if (!model) {
      throw new Error('Gemini AI service is in fallback mode');
    }

    try {
      const cacheKey = `${systemPrompt}|${userMessage}`;
      
      // Return cached response if available
      if (responseCache.has(cacheKey)) {
        Logger.info('Gemini cache hit for efficient response generation');
        return responseCache.get(cacheKey);
      }

      const prompt = systemPrompt
        ? `${systemPrompt}\n\nUSER QUERY: ${userMessage}\n\nRESPONSE:`
        : userMessage;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Store in cache
      if (responseCache.size >= CACHE_MAX_SIZE) {
        // Remove oldest entry if limit reached
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
      responseCache.set(cacheKey, responseText);

      return responseText;
    } catch (error) {
      Logger.error('Gemini content generation failed', error);
      throw error;
    }
  },

  /**
   * Classify intent with high accuracy
   * @param {string} message - User message
   * @param {string[]} categories - Available intent categories
   * @returns {Promise<string>} Classified category
   */
  async classifyIntent(message, categories) {
    if (!model) return 'faq';

    try {
      const prompt = `Classify the following user message into exactly one category: ${categories.join(', ')}\n\nMESSAGE: "${message}"\n\nRESPONSE (Category only):`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim().toLowerCase().replace(/[^a-z_]/g, '');
    } catch (error) {
      Logger.warn('Intent classification failed', error);
      return 'faq';
    }
  },

  /** 
   * Check if Gemini is available 
   * @returns {boolean}
   */
  isAvailable() {
    return !!model;
  }
};

module.exports = geminiService;
