/**
 * Chat Interface Logic
 * Optimized for performance, accessibility, and safe rendering.
 */
const Chat = {
  isProcessing: false,
  conversationHistory: [],

  init() {
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.clearBtn = document.getElementById('clearChat');
    this.suggestionsEl = document.getElementById('suggestions');
    this.activeAgentName = document.getElementById('activeAgentName');
    this.modeBadge = document.getElementById('modeBadge');

    this.bindEvents();
    this.chatMessages.setAttribute('role', 'log');
    this.chatMessages.setAttribute('aria-relevant', 'additions');
  },

  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clearConversation());
    }

    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  /**
   * Send message and handle interactive components.
   */
  async sendMessage(overrideText) {
    const text = overrideText || this.messageInput.value.trim();
    if (!text || this.isProcessing) return;

    this.messageInput.value = '';
    this.conversationHistory.push({ role: 'user', text });
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
        this.conversationHistory.push({ role: 'assistant', text: data.response, agent: data.agent });
        this.addMessage(data.response, 'bot', {
          agent: data.agent,
          mode: data.mode,
          metadata: data.metadata
        });

        this.updateModeBadge(data.mode);
        if (data.suggestions) this.showSuggestions(data.suggestions);
      } else {
        this.addMessage(result.error || 'Unable to process that request.', 'bot', { agent: 'System' });
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Connection error. Check your server.', 'bot', { agent: 'System' });
    }

    this.setProcessing(false);
  },

  /**
   * Add message with support for maps and YouTube previews.
   */
  addMessage(text, type, meta = {}) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;

    let html = `<div class="message-bubble">${type === 'bot' ? Components.renderMarkdown(text) : Components.escapeHtml(text)}</div>`;

    if (meta.metadata && meta.metadata.map) {
      html += Components.renderMap(meta.metadata.map);
    }

    if (meta.metadata && meta.metadata.videos) {
      html += Components.renderVideos(meta.metadata.videos);
    }

    div.innerHTML = `
      <div class="message-avatar" aria-hidden="true">${type === 'user' ? 'You' : 'AI'}</div>
      <div class="message-content">${html}</div>
    `;

    this.chatMessages.appendChild(div);
    if (meta.agent) {
      this.activeAgentName.textContent = meta.agent;
      this.highlightAgent(meta.agent);
    }
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

  clearSuggestions() {
    this.suggestionsEl.innerHTML = '';
  },

  clearConversation() {
    this.chatMessages.innerHTML = '';
    this.conversationHistory = [];
    this.clearSuggestions();
    this.activeAgentName.textContent = 'Election Assistant';
    this.updateModeBadge('ready');
  },

  showTyping() {
    this.chatMessages.appendChild(Components.createTypingIndicator());
    this.scrollToBottom();
  },

  hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  },

  scrollToBottom() {
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
  },

  updateModeBadge(mode) {
    this.modeBadge.classList.toggle('ai-mode', mode === 'ai');
    this.modeBadge.classList.toggle('fallback-mode', mode === 'fallback');
    this.modeBadge.textContent = mode === 'ai' ? 'AI Optimized' : mode === 'ready' ? 'Ready' : 'Standard Mode';
  },

  highlightAgent(agentName) {
    document.querySelectorAll('.agent-card').forEach(card => {
      const isActive = card.dataset.agent === agentName;
      card.classList.toggle('active-agent', isActive);
      if (isActive) {
        card.classList.remove('highlight');
        requestAnimationFrame(() => card.classList.add('highlight'));
      }
    });
  }
};
