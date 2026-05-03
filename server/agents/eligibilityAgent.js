/**
 * Eligibility Checker Agent
 * Checks voter eligibility and generates a personalized registration roadmap
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const electionData = require('../data/electionData.json');
const Logger = require('../services/logger');

class EligibilityAgent extends BaseAgent {
  constructor() {
    super('Eligibility Agent', 'Expert in voter qualifications and registration roadmaps', '✅');
  }

  /**
   * System prompt for high-accuracy eligibility assessment
   */
  getSystemPrompt() {
    return `You are the Eligibility Agent. Your goal is to determine if a user is eligible to vote in India.
Criteria:
- Age: 18+ (as of Jan 1 of qualifying year).
- Citizenship: Indian.
- Residence: Resident of the constituency.

If the user is eligible, provide a "PERSONALIZED VOTER ROADMAP" in 3 simple steps.
If not, explain why clearly and kindly.
Use markdown for structure.`;
  }

  /**
   * Process user details and generate a roadmap
   */
  async process(message, context = {}) {
    try {
      Logger.info('Generating eligibility assessment');
      
      const response = await geminiService.generateContent(message, this.getSystemPrompt());
      
      return this.formatResponse(response, {
        suggestions: [
          'What documents do I need?',
          'How to register online?',
          'Can NRIs vote?',
          'Check my EPIC status'
        ],
        mode: geminiService.isAvailable() ? 'ai' : 'fallback',
        metadata: { 
          source: 'eligibility_engine',
          feature: 'voter_roadmap'
        }
      });
    } catch (error) {
      Logger.error('EligibilityAgent failed', error);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Static fallback for mission-critical reliability
   */
  getFallbackResponse(message) {
    const text = `## ✅ Basic Voter Eligibility (India)\n\nTo vote in Indian elections, you must meet these 3 criteria:\n\n1. **Age**: You must be **18 years or older**.\n2. **Citizenship**: You must be a **Citizen of India**.\n3. **Residency**: You must be an **Ordinary Resident** in the constituency.\n\n### Next Steps:\n- **If eligible**: Register online at [voters.eci.gov.in](https://voters.eci.gov.in) using **Form 6**.\n- **Documents**: Keep your Aadhaar, Passport, or Birth Certificate ready as proof.`;

    return this.formatResponse(text, {
      suggestions: ['Required documents', 'How to register', 'NRI voting'],
      mode: 'fallback',
      metadata: { source: 'static_data' }
    });
  }
}

module.exports = EligibilityAgent;
