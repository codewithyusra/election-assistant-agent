/**
 * UI Component Renderers
 * Optimized for accessibility, security, and Google service previews.
 */
const Components = {
  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  sanitizeUrl(value, allowedProtocols = ['https:', 'http:']) {
    try {
      const url = new URL(value, window.location.origin);
      return allowedProtocols.includes(url.protocol) ? url.href : '#';
    } catch {
      return '#';
    }
  },

  /**
   * Convert a small, safe subset of markdown text to HTML.
   */
  renderMarkdown(text) {
    if (!text) return '';

    return this.escapeHtml(text)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
        const safeHref = this.sanitizeUrl(href);
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      })
      .replace(/\n/g, '<br>');
  },

  /**
   * Render an interactive Google Map.
   */
  renderMap(mapData) {
    if (!mapData || !mapData.embedUrl) return '';
    const safeEmbedUrl = this.sanitizeUrl(mapData.embedUrl, ['https:']);
    if (!safeEmbedUrl.startsWith('https://www.google.com/maps/embed/')) return '';

    return `
      <div class="interactive-map-container" role="application" aria-label="Google Maps showing polling stations">
        <iframe
          width="100%"
          height="300"
          style="border:0; border-radius: 12px; margin-top: 12px;"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="${safeEmbedUrl}">
        </iframe>
        <div class="map-caption">Polling stations near ${this.escapeHtml(mapData.place)}</div>
      </div>
    `;
  },

  /**
   * Render educational YouTube results returned by the FAQ agent.
   */
  renderVideos(videos) {
    if (!Array.isArray(videos) || videos.length === 0) return '';

    const items = videos.map(video => {
      const safeUrl = this.sanitizeUrl(video.url, ['https:']);
      const safeThumb = this.sanitizeUrl(video.thumbnail, ['https:']);
      if (!safeUrl.startsWith('https://www.youtube.com/watch')) return '';

      return `
        <a class="video-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
          <img src="${safeThumb}" alt="" loading="lazy">
          <span>${this.escapeHtml(video.title)}</span>
        </a>
      `;
    }).join('');

    return `<div class="video-results" aria-label="Related election education videos">${items}</div>`;
  },

  /**
   * Create a suggestion chip with accessibility support.
   */
  createSuggestionChip(text, onClick) {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = text;
    chip.setAttribute('aria-label', `Ask about ${text}`);
    chip.addEventListener('click', () => onClick(text));
    return chip;
  },

  /**
   * Create accessible typing indicator.
   */
  createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = 'typingIndicator';
    div.setAttribute('aria-live', 'polite');
    div.innerHTML = `
      <div class="message-avatar" aria-hidden="true">AI</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator" aria-label="Assistant is thinking">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    return div;
  }
};
