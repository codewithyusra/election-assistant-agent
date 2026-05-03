/**
 * Router Agent
 * Classifies user intent and routes to the appropriate specialist agent
 * Acts as the orchestrator of the entire agent system
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const ElectionInfoAgent = require('./electionInfoAgent');
const TimelineAgent = require('./timelineAgent');
const EligibilityAgent = require('./eligibilityAgent');
const PollingStationAgent = require('./pollingStationAgent');
const FaqAgent = require('./faqAgent');

class RouterAgent extends BaseAgent {
  constructor() {
    super('Router Agent', 'Routes queries to the appropriate specialist agent', '🔀');

    // Initialize all specialist agents
    this.agents = {
      election_info: new ElectionInfoAgent(),
      timeline: new TimelineAgent(),
      eligibility: new EligibilityAgent(),
      polling_station: new PollingStationAgent(),
      faq: new FaqAgent()
    };

    // Intent classification keywords for fallback mode
    this.intentKeywords = {
      greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste', 'howdy', 'start'],
      election_info: ['election', 'voting system', 'evm', 'electoral', 'democracy', 'lok sabha', 'rajya sabha', 'vidhan sabha', 'parliament', 'mla', 'mp', 'candidate', 'party', 'constituency', 'ward', 'election commission', 'ballot', 'booth', 'campaign', 'manifesto', 'coalition', 'government', 'types of election', 'general election', 'state election', 'local election', 'how does election work', 'election process'],
      timeline: ['timeline', 'schedule', 'date', 'when', 'deadline', 'calendar', 'phase', 'countdown', 'upcoming', 'next election', 'election date', 'registration deadline', 'last date', 'nomination', 'polling date', 'result date', 'how long'],
      eligibility: ['eligible', 'eligibility', 'can i vote', 'age', 'voter id', 'register', 'registration', 'epic', 'voter card', 'nri', 'qualify', 'requirements', 'who can vote', 'minimum age', 'am i eligible', 'voter registration'],
      polling_station: ['polling station', 'booth', 'where to vote', 'location', 'nearest', 'find polling', 'polling place', 'vote center', 'where do i vote', 'my booth', 'station near me', 'locate'],
      faq: ['how', 'what', 'why', 'explain', 'tell me', 'information', 'help', 'guide', 'faq', 'question', 'absentee', 'postal', 'nota', 'right to vote', 'secret ballot', 'recount', 'vote count']
    };
  }

  /**
   * Classify user intent using Gemini or fallback to keyword matching
   */
  async classifyIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Try Gemini-based classification first
    try {
      const classificationPrompt = `You are an intent classifier for an Election Process Assistant. Classify the following user message into exactly one of these categories:
      
- greeting: General greetings or hello messages
- election_info: Questions about election types, processes, systems, or how elections work
- timeline: Questions about election dates, schedules, deadlines, or timelines
- eligibility: Questions about voter eligibility, voter registration, voter ID, or age requirements
- polling_station: Questions about polling station locations, where to vote, or finding a booth
- faq: General questions about voting, rights, or other election-related topics

User message: "${message}"

Respond with ONLY the category name, nothing else.`;

      const result = await geminiService.generateContent(classificationPrompt);
      const intent = result.trim().toLowerCase().replace(/[^a-z_]/g, '');

      if (this.agents[intent] || intent === 'greeting') {
        return intent;
      }
    } catch (error) {
      console.warn('Gemini classification failed, using fallback:', error.message);
    }

    // Fallback: Keyword-based classification
    let bestIntent = 'faq';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          score += keyword.split(' ').length; // Multi-word keywords get higher weight
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return bestIntent;
  }

  /**
   * Process user message through the appropriate agent
   */
  async process(message, context = {}) {
    const intent = await this.classifyIntent(message);

    // Handle greetings directly
    if (intent === 'greeting') {
      return {
        response: `👋 **Welcome to the Election Process Assistant!**\n\nI'm your intelligent guide to understanding elections. I have specialized agents ready to help you:\n\n🗳️ **Election Info** — Learn about election types, processes & systems\n📅 **Timeline** — Election schedules, dates & deadlines\n✅ **Eligibility** — Check if you're eligible to vote\n📍 **Polling Station** — Find your nearest polling station\n❓ **FAQ** — Get answers to common voting questions\n\nJust ask me anything about elections and I'll route you to the right specialist!`,
        agent: this.name,
        intent: 'greeting',
        suggestions: [
          'How does the Indian election process work?',
          'Am I eligible to vote?',
          'What are the upcoming election dates?',
          'Where is my nearest polling station?',
          'What is NOTA?'
        ],
        mode: 'direct',
        metadata: { agentCount: Object.keys(this.agents).length }
      };
    }

    // Route to specialist agent
    const agent = this.agents[intent];
    if (!agent) {
      return this.agents.faq.process(message, context);
    }

    const result = await agent.process(message, context);
    result.intent = intent;
    return result;
  }

  /**
   * Get information about all agents
   */
  getAgentInfo() {
    const info = [this.getInfo()];
    for (const agent of Object.values(this.agents)) {
      info.push(agent.getInfo());
    }
    return info;
  }
}

module.exports = RouterAgent;
