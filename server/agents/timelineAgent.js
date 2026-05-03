/**
 * Timeline Agent
 * Provides election timelines, key dates, schedules, and countdown information
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const electionData = require('../data/electionData.json');
const Logger = require('../services/logger');

class TimelineAgent extends BaseAgent {
  constructor() {
    super('Timeline Agent', 'Provides election schedules, key dates, and timeline information', '📅');
  }

  getSystemPrompt() {
    return `You are the Timeline Agent, a specialist in election schedules, dates, and timelines for Indian elections.

Your knowledge covers:
- General election schedules and phases
- Voter registration deadlines
- Nomination filing dates
- Counting and result dates
- Historical election data
- Election cycle explanations

Guidelines:
- Present dates clearly in a structured timeline format
- Use emoji indicators for different types of events
- Highlight upcoming deadlines prominently
- Explain the multi-phase election process clearly
- Use markdown tables and lists for clarity
- Note that specific dates change each election — provide general patterns and recent examples

Here is reference timeline data:
${JSON.stringify(electionData.timeline, null, 2)}
${JSON.stringify(electionData.keyDates, null, 2)}`;
  }

  async process(message, context = {}) {
    try {
      const response = await geminiService.generateContent(
        message,
        this.getSystemPrompt()
      );

      return this.formatResponse(response, {
        suggestions: [
          'What is the election timeline for general elections?',
          'When is the next voter registration deadline?',
          'How many phases do elections have?',
          'What happens on counting day?'
        ],
        mode: 'ai',
        metadata: { source: 'gemini', type: 'timeline' }
      });
    } catch (error) {
      Logger.warn('Timeline Agent falling back', error);
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    let response = '';

    if (lowerMsg.includes('phase') || lowerMsg.includes('schedule')) {
      response = `## 📅 Election Phases — How Multi-Phase Voting Works\n\n`;
      response += `Indian general elections are conducted in **multiple phases** across different states/regions to manage the massive scale.\n\n`;
      response += `| Phase | What Happens |\n|-------|-------------|\n`;
      response += `| Pre-Election | Voter list revision, nomination filing |\n`;
      response += `| Announcement | Election dates announced by ECI |\n`;
      response += `| Nomination | Candidates file nominations (7-10 days) |\n`;
      response += `| Campaigning | Political campaigns (2-3 weeks per phase) |\n`;
      response += `| Silent Period | 48 hours before polling — no campaigning |\n`;
      response += `| Polling Day | Voting takes place (7 AM - 6 PM typically) |\n`;
      response += `| Counting | Votes counted (usually 3-4 days after last phase) |\n`;
      response += `| Results | Results declared, winning candidates announced |\n\n`;
      response += `> 📌 **Note:** The 2024 General Election was held in 7 phases from April 19 to June 1, 2024.\n`;
    } else if (lowerMsg.includes('registration') || lowerMsg.includes('register') || lowerMsg.includes('deadline')) {
      response = `## 📋 Voter Registration Deadlines\n\n`;
      response += `**Key Points:**\n`;
      response += `- Voter registration is available **year-round** through the ECI portal\n`;
      response += `- The cut-off date for age eligibility is **January 1** of the qualifying year\n`;
      response += `- Electoral roll revision typically happens **annually** (Oct-Nov)\n`;
      response += `- Special revision drives are conducted before major elections\n\n`;
      response += `**How to Register:**\n`;
      response += `1. Visit [voters.eci.gov.in](https://voters.eci.gov.in)\n`;
      response += `2. Fill Form 6 (new registration) or Form 8 (corrections)\n`;
      response += `3. Submit required documents (age proof, address proof, photo)\n`;
      response += `4. Verification by Electoral Registration Officer\n`;
      response += `5. EPIC (Voter ID) issued after approval\n\n`;
      response += `> ⏰ **Tip:** Register well before elections — last-minute registrations may not be processed in time.\n`;
    } else {
      const timeline = electionData.timeline;
      response = `## 📅 Indian Election Timeline Overview\n\n`;
      response += `### General Election Cycle\n\n`;

      for (const phase of timeline.generalElection) {
        response += `**${phase.icon} ${phase.phase}** — ${phase.timing}\n`;
        response += `${phase.description}\n\n`;
      }

      response += `### Key Facts:\n`;
      response += `- General elections happen every **5 years**\n`;
      response += `- State elections follow independent cycles\n`;
      response += `- By-elections are held to fill vacant seats\n`;
      response += `- The entire process takes **1.5 to 2 months** for general elections\n`;
    }

    return this.formatResponse(response, {
      suggestions: [
        'How do multi-phase elections work?',
        'When can I register to vote?',
        'What happens during counting day?',
        'How long is the campaign period?'
      ],
      mode: 'fallback',
      metadata: { source: 'static_data', type: 'timeline' }
    });
  }
}

module.exports = TimelineAgent;
