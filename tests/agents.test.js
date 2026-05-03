/**
 * Agent Unit Tests
 */
const path = require('path');

// Mock the services before requiring agents
jest.mock('../server/services/geminiService', () => ({
  generateContent: jest.fn().mockRejectedValue(new Error('Test mode')),
  isAvailable: () => false
}));

jest.mock('../server/services/mapsService', () => ({
  getMapEmbed: jest.fn().mockResolvedValue(null),
  isAvailable: () => false
}));

jest.mock('../server/services/sheetsService', () => ({
  logInteraction: jest.fn().mockResolvedValue(undefined),
  isAvailable: () => false
}));

const RouterAgent = require('../server/agents/routerAgent');
const ElectionInfoAgent = require('../server/agents/electionInfoAgent');
const TimelineAgent = require('../server/agents/timelineAgent');
const EligibilityAgent = require('../server/agents/eligibilityAgent');
const PollingStationAgent = require('../server/agents/pollingStationAgent');
const FaqAgent = require('../server/agents/faqAgent');

describe('Router Agent', () => {
  let router;

  beforeEach(() => {
    router = new RouterAgent();
  });

  test('should classify greeting intent', async () => {
    const result = await router.process('Hello!');
    expect(result.intent).toBe('greeting');
    expect(result.agent).toBe('Router Agent');
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('should classify election info intent', async () => {
    const result = await router.process('How does the election process work?');
    expect(result.agent).toBe('Election Info Agent');
  });

  test('should classify timeline intent', async () => {
    const result = await router.process('When is the next election date?');
    expect(result.agent).toBe('Timeline Agent');
  });

  test('should classify eligibility intent', async () => {
    const result = await router.process('Am I eligible to vote?');
    expect(result.agent).toBe('Eligibility Agent');
  });

  test('should classify polling station intent', async () => {
    const result = await router.process('Where is my nearest polling station?');
    expect(result.agent).toBe('Polling Station Agent');
  });

  test('should return agent info', () => {
    const info = router.getAgentInfo();
    expect(info.length).toBe(6); // Router + 5 specialists
    expect(info[0].name).toBe('Router Agent');
  });
});

describe('Election Info Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new ElectionInfoAgent();
  });

  test('should respond about election types', async () => {
    const result = await agent.process('What are the types of elections?');
    expect(result.response).toContain('Election');
    expect(result.mode).toBe('fallback');
  });

  test('should respond about EVMs', async () => {
    const result = await agent.process('How does the EVM work?');
    expect(result.response).toContain('EVM');
  });

  test('should have suggestions', async () => {
    const result = await agent.process('Tell me about elections');
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});

describe('Timeline Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new TimelineAgent();
  });

  test('should respond about election phases', async () => {
    const result = await agent.process('How do election phases work?');
    expect(result.response).toContain('Phase');
  });

  test('should respond about registration deadlines', async () => {
    const result = await agent.process('When is the voter registration deadline?');
    expect(result.response).toContain('registration');
  });
});

describe('Eligibility Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new EligibilityAgent();
  });

  test('should respond about eligibility criteria', async () => {
    const result = await agent.process('Can I vote in India?');
    expect(result.response).toContain('Eligibility');
  });

  test('should respond about NRI voting', async () => {
    const result = await agent.process('Can NRIs vote?');
    expect(result.response).toContain('NRI');
  });

  test('should respond about documents', async () => {
    const result = await agent.process('What documents do I need?');
    expect(result.response).toContain('Document');
  });
});

describe('FAQ Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new FaqAgent();
  });

  test('should respond about NOTA', async () => {
    const result = await agent.process('What is NOTA?');
    expect(result.response).toContain('NOTA');
  });

  test('should show FAQ list for generic questions', async () => {
    const result = await agent.process('I have a random question about xyz');
    expect(result.response).toContain('Frequently Asked Questions');
  });
});

describe('Polling Station Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new PollingStationAgent();
  });

  test('should respond about finding polling stations', async () => {
    const result = await agent.process('Where do I vote?');
    expect(result.response).toContain('Polling Station');
  });
});
