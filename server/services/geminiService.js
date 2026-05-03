/**
 * Google Gemini API Service
 * Wraps the @google/generative-ai SDK for agent use
 */
const config = require('../config');

let genAI = null;
let model = null;

// Initialize Gemini if API key is available
if (config.isGeminiEnabled) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI service initialized');
  } catch (error) {
    console.warn('⚠️ Gemini AI initialization failed:', error.message);
  }
}

const geminiService = {
  /**
   * Generate content using Gemini API
   * @param {string} userMessage - The user's message
   * @param {string} systemPrompt - System prompt for the agent
   * @returns {Promise<string>} Generated response text
   */
  async generateContent(userMessage, systemPrompt = '') {
    if (!model) {
      throw new Error('Gemini AI not available — using fallback mode');
    }

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const prompt = systemPrompt
      ? `${systemPrompt}\n\nUser Query: ${userMessage}`
      : userMessage;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  },

  /**
   * Classify intent using Gemini
   * @param {string} message - User message to classify
   * @param {string[]} categories - Available categories
   * @returns {Promise<string>} Classified category
   */
  async classifyIntent(message, categories) {
    if (!model) {
      throw new Error('Gemini AI not available');
    }

    const prompt = `Classify this message into one category: ${categories.join(', ')}\n\nMessage: "${message}"\n\nRespond with ONLY the category name.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase();
  },

  /** Check if Gemini is available */
  isAvailable() {
    return !!model;
  }
};

module.exports = geminiService;
