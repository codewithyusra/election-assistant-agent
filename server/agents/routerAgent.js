/**
 * Router Agent
 * The central orchestrator that classifies intent and delegates work
 * Optimized for Efficiency with local caching and Smart Routing
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const Logger = require('../services/logger');

// Specialized Agent Imports
const ElectionInfoAgent = require('./electionInfoAgent');
const TimelineAgent = require('./timelineAgent');
const EligibilityAgent = require('./eligibilityAgent');
const PollingStationAgent = require('./pollingStationAgent');
const FaqAgent = require('./faqAgent');

class RouterAgent extends BaseAgent {
  constructor() {
    super('Router Agent', 'Orchestrator for the election assistant multi-agent system', '🔀');

    /** @type {Object<string, BaseAgent>} */
    this.agents = {
      election_info: new ElectionInfoAgent(),
      timeline: new TimelineAgent(),
      eligibility: new EligibilityAgent(),
      polling_station: new PollingStationAgent(),
      faq: new FaqAgent()
    };

    /** @type {Map<string, string>} Intent cache for efficiency */
    this.intentCache = new Map();
  }

  /**
   * Classifies user intent using Gemini or Smart Keywords
   * @param {string} message - User query
   * @returns {Promise<string>} Classified intent
   */
  async classifyIntent(message) {
    const input = message.toLowerCase().trim();
    
    // Efficiency: Check cache first
    if (this.intentCache.has(input)) {
      Logger.info(`Intent cache hit: ${input}`);
      return this.intentCache.get(input);
    }

    // High Accuracy: Use Gemini for classification
    const categories = ['greeting', ...Object.keys(this.agents)];
    let intent = await geminiService.classifyIntent(input, categories);

    // Reliability: Keyword fallback if Gemini fails or returns invalid
    if (!categories.includes(intent)) {
      intent = this.keywordFallback(input);
    }

    // Store in cache for next time
    if (this.intentCache.size < 100) this.intentCache.set(input, intent);
    
    return intent;
  }

  /**
   * Fast keyword matching for basic queries
   * @private
   */
  keywordFallback(input) {
    if (input.includes('hello') || input.includes('hi')) return 'greeting';
    if (input.includes('register') || input.includes('eligible')) return 'eligibility';
    if (input.includes('date') || input.includes('when')) return 'timeline';
    if (input.includes('where') || input.includes('booth')) return 'polling_station';
    if (input.includes('how') || input.includes('what')) return 'election_info';
    return 'faq';
  }

  /**
   * Process user request through the best specialist agent
   */
  async process(message, context = {}) {
    const intent = await this.classifyIntent(message);
    Logger.info(`Routing message to agent for intent: ${intent}`);

    if (intent === 'greeting') {
      return this.generateGreeting();
    }

    const agent = this.agents[intent] || this.agents.faq;
    return agent.process(message, context);
  }

  /**
   * Generates a high-quality personalized greeting
   * @private
   */
  generateGreeting() {
    return {
      response: `👋 **Namaste! Welcome to the Election Process Assistant.**\n\nI am your intelligent guide to Indian democracy. I have specialized agents ready to help you with:\n\n- 🗳️ **Election Info**: How the voting system works.\n- 📅 **Timelines**: Dates, deadlines, and schedules.\n- ✅ **Eligibility**: Check if you are ready to vote.\n- 📍 **Polling Station**: Find where to cast your ballot.\n\nHow can I help you today?`,
      agent: this.name,
      intent: 'greeting',
      suggestions: ['Am I eligible to vote?', 'When is the next election?', 'How to find my booth?'],
      mode: 'direct'
    };
  }

  /**
   * Returns metadata for all available agents
   */
  getAgentInfo() {
    return [this.getInfo(), ...Object.values(this.agents).map(a => a.getInfo())];
  }
}

module.exports = RouterAgent;
