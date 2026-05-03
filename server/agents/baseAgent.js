/**
 * Base Agent Class
 * All specialized agents extend this class
 */
class BaseAgent {
  constructor(name, description, icon) {
    this.name = name;
    this.description = description;
    this.icon = icon;
  }

  /**
   * Process a user message and return a response
   * @param {string} message - User's message
   * @param {object} context - Conversation context
   * @returns {Promise<object>} Agent response
   */
  async process(message, context = {}) {
    throw new Error('process() must be implemented by subclass');
  }

  /**
   * Get the system prompt for this agent
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    throw new Error('getSystemPrompt() must be implemented by subclass');
  }

  /**
   * Get agent info
   * @returns {object} Agent metadata
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      icon: this.icon
    };
  }

  /**
   * Format a structured response
   * @param {string} text - Response text
   * @param {object} options - Additional response options
   * @returns {object} Formatted response
   */
  formatResponse(text, options = {}) {
    return {
      response: text,
      agent: this.name,
      suggestions: options.suggestions || [],
      metadata: options.metadata || {},
      mode: options.mode || 'fallback'
    };
  }
}

module.exports = BaseAgent;
