/**
 * UI Component Renderers
 * Renders structured content like markdown, timelines, tables
 */
const Components = {
  /**
   * Convert markdown text to HTML
   */
  renderMarkdown(text) {
    if (!text) return '';

    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

      // Restore markdown special characters
      .replace(/&gt; /gm, '> ')

      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')

      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')

      // Horizontal rule
      .replace(/^---$/gm, '<hr>')

      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Tables
    html = this.renderTables(html);

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');

    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote><br><blockquote>/g, '<br>');

    return html;
  },

  /**
   * Render markdown tables to HTML
   */
  renderTables(html) {
    const lines = html.split('<br>');
    let result = [];
    let inTable = false;
    let tableHtml = '';
    let isHeader = true;

    for (const line of lines) {
      const trimmed = line.replace(/<\/?p>/g, '').trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter(c => c.trim() !== '');

        // Check if separator row
        if (cells.every(c => /^[\s-:]+$/.test(c))) {
          isHeader = false;
          continue;
        }

        if (!inTable) {
          tableHtml = '<table>';
          inTable = true;
          isHeader = true;
        }

        const tag = isHeader ? 'th' : 'td';
        tableHtml += '<tr>';
        for (const cell of cells) {
          tableHtml += `<${tag}>${cell.trim()}</${tag}>`;
        }
        tableHtml += '</tr>';

        if (isHeader) isHeader = false;
      } else {
        if (inTable) {
          tableHtml += '</table>';
          result.push(tableHtml);
          inTable = false;
          tableHtml = '';
        }
        result.push(line);
      }
    }

    if (inTable) {
      tableHtml += '</table>';
      result.push(tableHtml);
    }

    return result.join('<br>');
  },

  /**
   * Create a suggestion chip element
   */
  createSuggestionChip(text, onClick) {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = text;
    chip.addEventListener('click', () => onClick(text));
    return chip;
  },

  /**
   * Create typing indicator
   */
  createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    return div;
  },

  /**
   * Create welcome screen
   */
  createWelcomeScreen(onCardClick) {
    const cards = [
      { icon: '🗳️', title: 'Election Process', desc: 'Learn how elections work in India', query: 'How does the Indian election process work?' },
      { icon: '✅', title: 'Am I Eligible?', desc: 'Check your voter eligibility', query: 'Am I eligible to vote in India?' },
      { icon: '📅', title: 'Election Timeline', desc: 'Key dates and schedules', query: 'What is the general election timeline?' },
      { icon: '📍', title: 'Find Polling Station', desc: 'Locate your voting booth', query: 'How do I find my polling station?' },
      { icon: '❓', title: 'What is NOTA?', desc: 'Learn about NOTA option', query: 'What is NOTA and how does it work?' },
      { icon: '📝', title: 'Voter Registration', desc: 'How to get your voter ID', query: 'How do I register for a voter ID card?' }
    ];

    const container = document.createElement('div');
    container.className = 'welcome-container';
    container.innerHTML = `
      <div class="welcome-icon">🗳️</div>
      <h1 class="welcome-title">Election Process Assistant</h1>
      <p class="welcome-subtitle">Your intelligent guide to understanding elections. Powered by specialized AI agents.</p>
      <div class="welcome-cards">
        ${cards.map(c => `
          <div class="welcome-card" data-query="${c.query}">
            <div class="welcome-card-icon">${c.icon}</div>
            <div class="welcome-card-title">${c.title}</div>
            <div class="welcome-card-desc">${c.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handlers
    container.querySelectorAll('.welcome-card').forEach(card => {
      card.addEventListener('click', () => {
        onCardClick(card.dataset.query);
      });
    });

    return container;
  }
};
