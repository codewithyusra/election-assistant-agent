/**
 * Eligibility Checker Agent
 * Checks voter eligibility and guides through registration
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const electionData = require('../data/electionData.json');

class EligibilityAgent extends BaseAgent {
  constructor() {
    super('Eligibility Agent', 'Checks voter eligibility and guides through registration', '✅');
  }

  getSystemPrompt() {
    return `You are the Eligibility Checker Agent for Indian elections. Help users check voter eligibility (age 18+, Indian citizen, resident), guide registration via Form 6 at voters.eci.gov.in, explain EPIC/Voter ID, NRI voting, and required documents. Be empathetic, factual, and use markdown formatting.

Reference: ${JSON.stringify(electionData.eligibility)}`;
  }

  async process(message, context = {}) {
    try {
      const response = await geminiService.generateContent(message, this.getSystemPrompt());
      return this.formatResponse(response, {
        suggestions: ['Minimum age to vote?', 'How to register for voter ID?', 'Can NRIs vote?', 'Documents needed?'],
        mode: 'ai', metadata: { source: 'gemini' }
      });
    } catch (error) {
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    let response = '';

    if (lowerMsg.includes('nri') || lowerMsg.includes('overseas')) {
      response = `## 🌍 NRI Voting Rights\n\nYes! NRIs can vote in Indian elections.\n\n**Requirements:**\n- Indian citizen with valid passport\n- Register as overseas elector (Form 6A)\n- Must vote in person at assigned polling station\n\nRegister at [voters.eci.gov.in](https://voters.eci.gov.in)`;
    } else if (lowerMsg.includes('document') || lowerMsg.includes('paper')) {
      response = `## 📄 Documents for Voter Registration\n\n**Age Proof:** Birth Certificate, Aadhaar, Passport, PAN\n**Address Proof:** Aadhaar, Ration Card, Utility Bill, Bank Passbook\n**Photo:** 2 passport-size photographs\n\n> 💡 Aadhaar serves as both age and address proof!`;
    } else if (lowerMsg.includes('register') || lowerMsg.includes('how to')) {
      response = `## 📝 How to Register\n\n1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n2. Fill **Form 6**\n3. Upload documents\n4. Submit & note reference number\n5. BLO verification visit\n6. EPIC card dispatched (2-4 weeks)`;
    } else {
      response = `## ✅ Voter Eligibility\n\n| Criteria | Requirement |\n|----------|-------------|\n| 🎂 Age | **18+ years** on Jan 1 of qualifying year |\n| 🇮🇳 Citizenship | **Indian citizen** |\n| 🏠 Residency | **Resident** of the constituency |\n| 🧠 Mental Fitness | Sound mind |\n| ⚖️ Legal Status | Not disqualified |\n\n> 🎯 If you're 18+, Indian citizen, and a resident — you're eligible! Register at [voters.eci.gov.in](https://voters.eci.gov.in)`;
    }

    return this.formatResponse(response, {
      suggestions: ['How to register online?', 'Documents needed?', 'Can NRIs vote?', 'Minimum voting age?'],
      mode: 'fallback', metadata: { source: 'static_data' }
    });
  }
}

module.exports = EligibilityAgent;
