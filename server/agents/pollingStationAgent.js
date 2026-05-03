/**
 * Polling Station Agent
 * Helps users find their nearest polling station using Google Maps
 * Targeted at high-quality Google Services integration
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const mapsService = require('../services/mapsService');
const config = require('../config');
const Logger = require('../services/logger');

class PollingStationAgent extends BaseAgent {
  constructor() {
    super('Polling Station Agent', 'Expert in locating voting booths and polling procedures', '📍');
  }

  /**
   * Specialist system prompt for the Polling Station Agent
   */
  getSystemPrompt() {
    return `You are the Polling Station Agent. Your job is to:
1. Explain how to find a polling station (Voter ID portal, 1950 Helpline, Voter Helpline App).
2. Explain the difference between a polling station and a counting center.
3. Help users understand what documents to carry on polling day.
4. If a location is provided, guide them on how to find the specific booth.

BE CONCISE AND HELPFUL.`;
  }

  /**
   * Process user message and provide interactive maps if possible
   */
  async process(message, context = {}) {
    try {
      Logger.info(`Processing request in PollingStationAgent`);
      
      const response = await geminiService.generateContent(message, this.getSystemPrompt());
      
      // Try to extract a location name from the message if it seems like a location query
      let mapMetadata = null;
      if (message.length > 5 && (message.toLowerCase().includes('in') || message.toLowerCase().includes('at') || message.toLowerCase().includes('near'))) {
         mapMetadata = await mapsService.getMapEmbed(message);
      }

      return this.formatResponse(response, {
        suggestions: [
          'What documents do I need at the polling booth?',
          'What are the timings for voting?',
          'Can I vote if I don\'t have my EPIC card?',
          'Find my booth online'
        ],
        mode: geminiService.isAvailable() ? 'ai' : 'fallback',
        metadata: { 
          source: 'polling_specialist',
          map: mapMetadata,
          interactive: !!mapMetadata
        }
      });
    } catch (error) {
      Logger.error('PollingStationAgent processing failed', error);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Rule-based fallback for reliability
   */
  getFallbackResponse(message) {
    const text = `## 📍 Locating Your Polling Booth\n\nYou can find your assigned polling station through these official channels:\n\n1. **Online**: Visit [voters.eci.gov.in](https://voters.eci.gov.in) and enter your EPIC number.\n2. **SMS**: Send \`EPIC <Voter ID Number>\` to **1950**.\n3. **App**: Use the **Voter Helpline App** (Android/iOS).\n\n**Polling Day Checklist:**\n- Voting Hours: **7 AM to 6 PM**.\n- Carry your **Voter ID (EPIC)** or an approved photo ID (Aadhaar, PAN, Passport, etc.).`;

    return this.formatResponse(text, {
      suggestions: ['IDs accepted at polling booth', 'Polling timings', 'Registration status'],
      mode: 'fallback',
      metadata: { source: 'static_data' }
    });
  }
}

module.exports = PollingStationAgent;
