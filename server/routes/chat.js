/**
 * Chat API Routes
 * Handles incoming user messages and routes them through the agent system
 */
const express = require('express');
const router = express.Router();
const RouterAgent = require('../agents/routerAgent');
const sheetsService = require('../services/sheetsService');

// Initialize the router agent (which manages all other agents)
const routerAgent = new RouterAgent();

/**
 * POST /api/chat
 * Process a user message through the agent system
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: 'Message exceeds the maximum allowed length of 500 characters'
      });
    }

    // Process through the Router Agent
    const startTime = Date.now();
    const result = await routerAgent.process(message.trim(), context);
    const processingTime = Date.now() - startTime;

    // Log to Google Sheets (non-blocking)
    sheetsService.logInteraction({
      timestamp: new Date().toISOString(),
      intent: result.intent,
      agent: result.agent,
      processingTime,
      mode: result.mode
    }).catch(err => console.warn('Sheets logging failed:', err.message));

    res.json({
      success: true,
      data: {
        response: result.response,
        agent: result.agent,
        intent: result.intent,
        suggestions: result.suggestions || [],
        metadata: result.metadata || {},
        mode: result.mode,
        processingTime
      }
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

/**
 * GET /api/agents
 * Return information about available agents
 */
router.get('/agents', (req, res) => {
  const agents = routerAgent.getAgentInfo();
  res.json({ success: true, agents });
});

module.exports = router;
