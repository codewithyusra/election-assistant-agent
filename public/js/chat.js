/**
 * Chat Interface Logic
 * Optimized for high performance and accessibility
 */
const Chat = {
  isProcessing: false,
  conversationHistory: [],

  init() {
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.suggestionsEl = document.getElementById('suggestions');
    this.activeAgentName = document.getElementById('activeAgentName');
    this.modeBadge = document.getElementById('modeBadge');

    this.bindEvents();
    // Use an ARIA-live region for message announcements
    this.chatMessages.setAttribute('role', 'log');
    this.chatMessages.setAttribute('aria-relevant', 'additions');
  },

  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  /**
   * Send message and handle interactive components
   */
  async sendMessage(overrideText) {
    const text = overrideText || this.messageInput.value.trim();
    if (!text || this.isProcessing) return;

    this.messageInput.value = '';
    this.addMessage(text, 'user');
    this.clearSuggestions();
    this.showTyping();
    this.setProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const result = await response.json();
      this.hideTyping();

      if (result.success) {
        const data = result.data;
        this.addMessage(data.response, 'bot', {
          agent: data.agent,
          mode: data.mode,
          metadata: data.metadata
        });

        // Update UI logic
        this.updateModeBadge(data.mode);
        if (data.suggestions) this.showSuggestions(data.suggestions);
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Connection error. Check your server.', 'bot', { agent: 'System' });
    }

    this.setProcessing(false);
  },

  /**
   * Add message with support for interactive maps
   */
  addMessage(text, type, meta = {}) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    
    let html = `<div class="message-bubble">${type === 'bot' ? Components.renderMarkdown(text) : text}</div>`;
    
    // Meaningful Integration: If map metadata is present, render the interactive map
    if (meta.metadata && meta.metadata.map) {
      html += Components.renderMap(meta.metadata.map);
    }

    div.innerHTML = `
      <div class="message-avatar" aria-hidden="true">${type === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">${html}</div>
    `;

    this.chatMessages.appendChild(div);
    this.scrollToBottom();
  },

  setProcessing(state) {
    this.isProcessing = state;
    this.sendBtn.disabled = state;
    this.messageInput.placeholder = state ? 'Thinking...' : 'Ask about elections...';
  },

  showSuggestions(suggestions) {
    this.suggestionsEl.innerHTML = '';
    suggestions.forEach(s => {
      this.suggestionsEl.appendChild(Components.createSuggestionChip(s, (q) => this.sendMessage(q)));
    });
  },

  clearSuggestions() { this.suggestionsEl.innerHTML = ''; },
  showTyping() { this.chatMessages.appendChild(Components.createTypingIndicator()); this.scrollToBottom(); },
  hideTyping() { const el = document.getElementById('typingIndicator'); if (el) el.remove(); },
  scrollToBottom() { const c = document.getElementById('chatContainer'); c.scrollTop = c.scrollHeight; },
  updateModeBadge(m) { this.modeBadge.textContent = m === 'ai' ? 'AI Optimized' : 'Standard Mode'; }
};
