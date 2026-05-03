/**
 * Polling Station Agent
 * Helps users find nearby polling stations using Google Maps
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const mapsService = require('../services/mapsService');
const config = require('../config');

class PollingStationAgent extends BaseAgent {
  constructor() {
    super('Polling Station Agent', 'Helps locate nearby polling stations', '📍');
  }

  getSystemPrompt() {
    return `You are the Polling Station Agent. Help users find their polling station. Explain how polling stations are assigned based on constituency and voter registration. Guide users to check their assigned booth via the Voter Helpline app or voters.eci.gov.in. Use markdown formatting.`;
  }

  async process(message, context = {}) {
    try {
      const response = await geminiService.generateContent(message, this.getSystemPrompt());
      const mapData = config.isMapsEnabled ? await mapsService.getMapEmbed(message) : null;

      return this.formatResponse(response, {
        suggestions: ['How to find my polling booth?', 'What to bring on polling day?', 'Polling station timings?', 'What if my name is missing from voter list?'],
        mode: 'ai',
        metadata: { source: 'gemini', mapEmbed: mapData, mapsEnabled: config.isMapsEnabled }
      });
    } catch (error) {
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const response = `## 📍 Finding Your Polling Station\n\n### Online Methods:\n1. **Voter Helpline App** — Download from Play Store/App Store\n2. **SMS Service** — Send SMS "EPIC <Voter ID Number>" to 1950\n3. **Website** — Visit [voters.eci.gov.in](https://voters.eci.gov.in) → "Know Your Polling Station"\n4. **Call** — Dial **1950** (Voter Helpline)\n\n### What You Need:\n- Your **EPIC Number** (Voter ID number) OR\n- Your **Name + Constituency** details\n\n### On Polling Day:\n- **Timings:** Usually 7:00 AM to 6:00 PM\n- **Carry:** Voter ID (EPIC) or any approved photo ID\n- **Approved IDs:** Aadhaar, Passport, Driving License, PAN Card, Bank Passbook with photo\n\n> 💡 **Tip:** Check your polling station a few days before the election to avoid last-minute confusion!`;

    return this.formatResponse(response, {
      suggestions: ['What IDs are accepted at polling booth?', 'Polling station timings?', 'What to do if name is missing?', 'How are polling stations assigned?'],
      mode: 'fallback', metadata: { source: 'static_data' }
    });
  }
}

module.exports = PollingStationAgent;
