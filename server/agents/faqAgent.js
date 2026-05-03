/**
 * FAQ Agent
 * Handles general frequently asked questions about voting and elections
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const electionData = require('../data/electionData.json');

class FaqAgent extends BaseAgent {
  constructor() {
    super('FAQ Agent', 'Answers frequently asked questions about voting and elections', '❓');
  }

  getSystemPrompt() {
    return `You are the FAQ Agent for an Election Process Assistant focused on Indian elections. Answer general questions about voting rights, NOTA, postal ballots, election security, code of conduct, and democratic processes. Be concise, accurate, and use markdown. Reference: ${JSON.stringify(electionData.faqs)}`;
  }

  async process(message, context = {}) {
    try {
      const response = await geminiService.generateContent(message, this.getSystemPrompt());
      return this.formatResponse(response, {
        suggestions: ['What is NOTA?', 'How is vote secrecy maintained?', 'What is postal ballot?', 'What is Model Code of Conduct?'],
        mode: 'ai', metadata: { source: 'gemini' }
      });
    } catch (error) {
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    const faqs = electionData.faqs;
    let response = '';

    // Try to match a FAQ
    const matched = faqs.find(faq =>
      faq.keywords.some(kw => lowerMsg.includes(kw))
    );

    if (matched) {
      response = `## ${matched.icon} ${matched.question}\n\n${matched.answer}`;
    } else {
      response = `## ❓ Frequently Asked Questions\n\nHere are some common questions I can help with:\n\n`;
      for (const faq of faqs.slice(0, 6)) {
        response += `**${faq.icon} ${faq.question}**\n${faq.shortAnswer}\n\n`;
      }
      response += `\nAsk me any of these or anything else about elections!`;
    }

    return this.formatResponse(response, {
      suggestions: faqs.slice(0, 4).map(f => f.question),
      mode: 'fallback', metadata: { source: 'static_data' }
    });
  }
}

module.exports = FaqAgent;
