/**
 * Chat Interface Logic
 * Handles message sending, receiving, and display
 */
const Chat = {
  isProcessing: false,
  conversationHistory: [],

  /**
   * Initialize chat interface
   */
  init() {
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.suggestionsEl = document.getElementById('suggestions');
    this.activeAgentName = document.getElementById('activeAgentName');
    this.modeBadge = document.getElementById('modeBadge');

    this.bindEvents();
    this.showWelcome();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    });

    // Clear chat
    document.getElementById('clearChat').addEventListener('click', () => {
      this.clearChat();
    });
  },

  /**
   * Show welcome screen
   */
  showWelcome() {
    const welcome = Components.createWelcomeScreen((query) => {
      this.messageInput.value = query;
      this.sendMessage();
    });
    this.chatMessages.appendChild(welcome);
  },

  /**
   * Send a message
   */
  async sendMessage(overrideText) {
    const text = overrideText || this.messageInput.value.trim();
    if (!text || this.isProcessing) return;

    // Remove welcome screen if present
    const welcome = this.chatMessages.querySelector('.welcome-container');
    if (welcome) welcome.remove();

    // Clear input
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';

    // Add user message
    this.addMessage(text, 'user');
    this.clearSuggestions();

    // Show typing indicator
    this.showTyping();
    this.setProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { history: this.conversationHistory.slice(-6) }
        })
      });

      const result = await response.json();

      this.hideTyping();

      if (result.success) {
        const data = result.data;
        this.addMessage(data.response, 'bot', {
          agent: data.agent,
          mode: data.mode,
          processingTime: data.processingTime
        });

        // Update UI state
        this.updateActiveAgent(data.agent);
        this.updateModeBadge(data.mode);
        this.highlightAgent(data.agent);

        // Show suggestions
        if (data.suggestions && data.suggestions.length > 0) {
          this.showSuggestions(data.suggestions);
        }

        // Track conversation
        this.conversationHistory.push(
          { role: 'user', content: text },
          { role: 'assistant', content: data.response }
        );
      } else {
        this.addMessage('Sorry, I encountered an error. Please try again.', 'bot', {
          agent: 'System',
          mode: 'error'
        });
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Unable to connect to the server. Please make sure the server is running.', 'bot', {
        agent: 'System',
        mode: 'error'
      });
    }

    this.setProcessing(false);
  },

  /**
   * Add a message to the chat
   */
  addMessage(text, type, meta = {}) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;

    const avatar = type === 'user' ? '👤' : this.getAgentIcon(meta.agent);
    const renderedText = type === 'bot' ? Components.renderMarkdown(text) : this.escapeHtml(text);

    div.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-bubble">${renderedText}</div>
        ${meta.agent ? `
          <div class="message-meta">
            <span class="agent-badge">${this.getAgentIcon(meta.agent)} ${meta.agent}</span>
            ${meta.processingTime ? `<span>${meta.processingTime}ms</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    this.chatMessages.appendChild(div);
    this.scrollToBottom();
  },

  /**
   * Get agent icon by name
   */
  getAgentIcon(agentName) {
    const icons = {
      'Router Agent': '🔀',
      'Election Info Agent': '🗳️',
      'Timeline Agent': '📅',
      'Eligibility Agent': '✅',
      'Polling Station Agent': '📍',
      'FAQ Agent': '❓',
      'System': '⚙️'
    };
    return icons[agentName] || '🤖';
  },

  /**
   * Show/hide typing indicator
   */
  showTyping() {
    const indicator = Components.createTypingIndicator();
    this.chatMessages.appendChild(indicator);
    this.scrollToBottom();
  },

  hideTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  },

  /**
   * Show suggestion chips
   */
  showSuggestions(suggestions) {
    this.suggestionsEl.innerHTML = '';
    suggestions.forEach(text => {
      const chip = Components.createSuggestionChip(text, (query) => {
        this.messageInput.value = query;
        this.sendMessage();
      });
      this.suggestionsEl.appendChild(chip);
    });
  },

  clearSuggestions() {
    this.suggestionsEl.innerHTML = '';
  },

  /**
   * Update active agent display
   */
  updateActiveAgent(agentName) {
    this.activeAgentName.textContent = agentName || 'Election Assistant';
  },

  /**
   * Update mode badge
   */
  updateModeBadge(mode) {
    this.modeBadge.textContent = mode === 'ai' ? 'AI Mode' : mode === 'fallback' ? 'Fallback Mode' : mode;
    this.modeBadge.className = 'mode-badge';
    if (mode === 'ai') this.modeBadge.classList.add('ai-mode');
    else if (mode === 'fallback') this.modeBadge.classList.add('fallback-mode');
  },

  /**
   * Highlight the active agent in sidebar
   */
  highlightAgent(agentName) {
    document.querySelectorAll('.agent-card').forEach(card => {
      card.classList.remove('active-agent');
      if (card.dataset.agent === agentName) {
        card.classList.add('active-agent', 'highlight');
        setTimeout(() => card.classList.remove('highlight'), 1500);
      }
    });
  },

  /**
   * Set processing state
   */
  setProcessing(state) {
    this.isProcessing = state;
    this.sendBtn.disabled = state;
    this.messageInput.disabled = state;

    // Update agent status indicators
    document.querySelectorAll('.agent-status').forEach(dot => {
      if (state) dot.classList.add('processing');
      else dot.classList.remove('processing');
    });
  },

  /**
   * Clear chat
   */
  clearChat() {
    this.chatMessages.innerHTML = '';
    this.conversationHistory = [];
    this.clearSuggestions();
    this.showWelcome();
    this.updateActiveAgent('Election Assistant');
    this.modeBadge.textContent = 'Ready';
    this.modeBadge.className = 'mode-badge';
  },

  /**
   * Scroll to bottom of chat
   */
  scrollToBottom() {
    const container = document.getElementById('chatContainer');
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
