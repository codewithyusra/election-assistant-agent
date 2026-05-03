/**
 * Main Application Bootstrap
 * Initializes the Election Assistant app
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize chat
  Chat.init();

  // Sidebar toggle (mobile)
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside (mobile)
  document.querySelector('.main-content').addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  // Check health and update service status
  checkServiceHealth();

  // Focus input
  document.getElementById('messageInput').focus();
});

/**
 * Check server health and update status indicators
 */
async function checkServiceHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    updateStatusDot('geminiStatus', data.services.gemini);
    updateStatusDot('mapsStatus', data.services.maps);
    updateStatusDot('sheetsStatus', data.services.sheets);
  } catch (error) {
    console.warn('Health check failed:', error);
    updateStatusDot('geminiStatus', 'disabled');
    updateStatusDot('mapsStatus', 'disabled');
    updateStatusDot('sheetsStatus', 'disabled');
  }
}

/**
 * Update a service status dot
 */
function updateStatusDot(elementId, status) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const dot = el.querySelector('.status-dot');
  if (!dot) return;

  dot.className = 'status-dot';

  if (status === 'connected') {
    dot.classList.add('connected');
  } else if (status === 'fallback_mode') {
    dot.classList.add('fallback');
  } else {
    dot.classList.add('disabled');
  }
}
