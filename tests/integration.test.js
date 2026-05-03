/**
 * API Integration Tests
 */
const http = require('http');

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

const app = require('../server/index');

let server;
const TEST_PORT = 4999;

beforeAll((done) => {
  server = app.listen(TEST_PORT, done);
});

afterAll((done) => {
  server.close(done);
});

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('API Endpoints', () => {
  test('GET /api/health should return health status', async () => {
    const res = await makeRequest('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services).toBeDefined();
  });

  test('GET /api/agents should return agent list', async () => {
    const res = await makeRequest('GET', '/api/agents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.agents.length).toBeGreaterThan(0);
  });

  test('POST /api/chat should process a message', async () => {
    const res = await makeRequest('POST', '/api/chat', { message: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.response).toBeDefined();
    expect(res.body.data.agent).toBeDefined();
  });

  test('POST /api/chat should reject empty message', async () => {
    const res = await makeRequest('POST', '/api/chat', { message: '' });
    expect(res.status).toBe(400);
  });

  test('POST /api/chat should handle election query', async () => {
    const res = await makeRequest('POST', '/api/chat', { message: 'How does election work?' });
    expect(res.status).toBe(200);
    expect(res.body.data.agent).toBe('Election Info Agent');
  });

  test('POST /api/chat should handle eligibility query', async () => {
    const res = await makeRequest('POST', '/api/chat', { message: 'Am I eligible to vote?' });
    expect(res.status).toBe(200);
    expect(res.body.data.agent).toBe('Eligibility Agent');
  });
});
