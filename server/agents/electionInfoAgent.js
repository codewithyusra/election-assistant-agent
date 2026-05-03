/**
 * Election Info Agent
 * Provides detailed information about election types, processes, and systems
 */
const BaseAgent = require('./baseAgent');
const geminiService = require('../services/geminiService');
const electionData = require('../data/electionData.json');

class ElectionInfoAgent extends BaseAgent {
  constructor() {
    super('Election Info Agent', 'Provides information about election types, processes, and democratic systems', '🗳️');
  }

  getSystemPrompt() {
    return `You are the Election Info Agent, a specialist in explaining election processes and democratic systems, primarily focused on Indian elections.

Your knowledge covers:
- Types of elections in India (General/Lok Sabha, State/Vidhan Sabha, Local Body/Panchayat & Municipal)
- How elections are conducted (EVMs, VVPATs, counting process)
- Role of the Election Commission of India (ECI)
- Electoral bonds, campaign finance, and code of conduct
- First Past The Post (FPTP) system used in India
- Different election processes worldwide for comparison

Guidelines:
- Be accurate, informative, and engaging
- Use bullet points and structured formatting for clarity
- Include relevant facts and statistics when available
- Keep explanations accessible for first-time voters
- Use markdown formatting for emphasis and structure
- Always be non-partisan and factual

Here is reference data you can use:
${JSON.stringify(electionData.electionTypes, null, 2)}
${JSON.stringify(electionData.process, null, 2)}`;
  }

  async process(message, context = {}) {
    try {
      const response = await geminiService.generateContent(
        message,
        this.getSystemPrompt()
      );

      return this.formatResponse(response, {
        suggestions: [
          'What are the different types of elections in India?',
          'How does the EVM voting machine work?',
          'What is the role of Election Commission?',
          'Explain the Model Code of Conduct'
        ],
        mode: 'ai',
        metadata: { source: 'gemini' }
      });
    } catch (error) {
      console.warn('Election Info Agent falling back to static data:', error.message);
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    let response = '';

    if (lowerMsg.includes('type') || lowerMsg.includes('kinds')) {
      const types = electionData.electionTypes;
      response = `## 🗳️ Types of Elections in India\n\n`;
      for (const type of types) {
        response += `### ${type.name}\n`;
        response += `${type.description}\n`;
        response += `- **Frequency:** ${type.frequency}\n`;
        response += `- **Conducted by:** ${type.conductedBy}\n\n`;
      }
    } else if (lowerMsg.includes('evm') || lowerMsg.includes('machine') || lowerMsg.includes('voting machine')) {
      response = `## 🖥️ Electronic Voting Machines (EVMs)\n\n`;
      response += `EVMs have been used in Indian elections since 2004 (fully).\n\n`;
      response += `**Key Features:**\n`;
      response += `- Stand-alone, battery-operated machines\n`;
      response += `- Cannot be connected to internet or any network\n`;
      response += `- Records up to 2,000 votes\n`;
      response += `- Used with VVPAT (Voter Verified Paper Audit Trail) for transparency\n`;
      response += `- Each EVM has a unique ID number\n\n`;
      response += `**How it works:**\n`;
      response += `1. Polling officer verifies voter identity\n`;
      response += `2. Control unit is unlocked for one vote\n`;
      response += `3. Voter presses button next to chosen candidate\n`;
      response += `4. VVPAT slip displays for 7 seconds for verification\n`;
      response += `5. Vote is recorded and machine locks again\n`;
    } else if (lowerMsg.includes('commission') || lowerMsg.includes('eci')) {
      response = `## 🏛️ Election Commission of India (ECI)\n\n`;
      response += `The ECI is an autonomous constitutional body responsible for administering election processes.\n\n`;
      response += `**Key Facts:**\n`;
      response += `- Established: 25 January 1950\n`;
      response += `- Constitutional basis: Article 324\n`;
      response += `- Headed by: Chief Election Commissioner (CEC)\n`;
      response += `- Composition: CEC + 2 Election Commissioners\n\n`;
      response += `**Functions:**\n`;
      response += `- Conduct free and fair elections\n`;
      response += `- Prepare and maintain electoral rolls\n`;
      response += `- Grant recognition to political parties\n`;
      response += `- Enforce Model Code of Conduct\n`;
      response += `- Monitor election expenditure\n`;
    } else {
      const process = electionData.process;
      response = `## 🗳️ How Indian Elections Work\n\n`;
      response += `India follows the **First Past The Post (FPTP)** system — the candidate with the most votes in a constituency wins.\n\n`;
      response += `### Election Process Steps:\n\n`;
      for (let i = 0; i < process.steps.length; i++) {
        const step = process.steps[i];
        response += `**${i + 1}. ${step.title}**\n${step.description}\n\n`;
      }
    }

    return this.formatResponse(response, {
      suggestions: [
        'What are the different types of elections?',
        'How does the EVM work?',
        'What is the Election Commission?',
        'Explain the voting process step by step'
      ],
      mode: 'fallback',
      metadata: { source: 'static_data' }
    });
  }
}

module.exports = ElectionInfoAgent;
