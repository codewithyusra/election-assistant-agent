# 🗳️ Election Process Assistant — Agent-Based System

An intelligent, multi-agent system that helps users understand the election process, timelines, voter eligibility, and polling procedures through an interactive conversational interface.

## 📋 Chosen Vertical

**Election Process Assistant** — A conversational AI system with specialized agents that guide users through every aspect of the Indian electoral process.

## 🏗️ Architecture & Approach

### Agent-Based Design

The system uses a **multi-agent architecture** where each agent is a specialist in a specific domain:

```
User → Router Agent → Specialist Agent → Response
```

| Agent | Role |
|-------|------|
| 🔀 **Router Agent** | Classifies user intent and routes to the correct specialist |
| 🗳️ **Election Info Agent** | Election types, processes, EVM, and democratic systems |
| 📅 **Timeline Agent** | Election schedules, key dates, and phase information |
| ✅ **Eligibility Agent** | Voter eligibility checks and registration guidance |
| 📍 **Polling Station Agent** | Polling station locator with Google Maps integration |
| ❓ **FAQ Agent** | Common questions about NOTA, postal ballots, and more |

### How It Works

1. **User sends a message** through the chat interface
2. **Router Agent** classifies the intent using Google Gemini AI (or keyword-based fallback)
3. **Specialist Agent** processes the query with domain-specific knowledge and AI
4. **Response** is formatted with markdown, suggestions, and agent metadata
5. **Analytics** are optionally logged to Google Sheets

### Google Services Integration

| Service | Purpose |
|---------|---------|
| **Google Gemini AI** | Powers natural language understanding and intelligent responses |
| **Google Maps API** | Locates nearby polling stations |
| **Google Sheets API** | Logs anonymized conversation analytics |

### Graceful Fallback

The system works **without API keys** using a rule-based fallback mode with a comprehensive static knowledge base. This ensures:
- Full functionality during evaluation without requiring API configuration
- Reliable responses even when cloud services are unavailable

## 🚀 How to Run

### Prerequisites
- Node.js 18+ installed
- npm installed

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd promptwars

# Install dependencies
npm install

# (Optional) Configure API keys
cp .env.example .env
# Edit .env with your API keys

# Start the server
npm start
```

### Access
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
npm test
```

## 🔑 API Keys (Optional)

The system works in **fallback mode** without API keys. For full AI capabilities:

1. **Google Gemini API Key** — Get from [Google AI Studio](https://aistudio.google.com/apikey)
2. **Google Maps API Key** — Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. **Google Sheets** — Create a service account and spreadsheet

Add keys to `.env` file (copy from `.env.example`).

## 📁 Project Structure

```
├── server/
│   ├── index.js              # Express server
│   ├── config.js             # Configuration loader
│   ├── routes/
│   │   └── chat.js           # Chat API endpoints
│   ├── agents/
│   │   ├── baseAgent.js      # Base agent class
│   │   ├── routerAgent.js    # Intent classifier & orchestrator
│   │   ├── electionInfoAgent.js
│   │   ├── timelineAgent.js
│   │   ├── eligibilityAgent.js
│   │   ├── pollingStationAgent.js
│   │   └── faqAgent.js
│   ├── services/
│   │   ├── geminiService.js  # Google Gemini integration
│   │   ├── mapsService.js    # Google Maps integration
│   │   └── sheetsService.js  # Google Sheets analytics
│   └── data/
│       └── electionData.json # Static knowledge base
├── public/
│   ├── index.html            # Chat interface
│   ├── css/styles.css        # Premium dark theme
│   └── js/
│       ├── app.js            # App bootstrap
│       ├── chat.js           # Chat logic
│       └── components.js     # UI renderers
├── tests/
│   ├── agents.test.js        # Agent unit tests
│   └── integration.test.js   # API integration tests
├── package.json
├── .env.example
└── .gitignore
```

## 🎯 Key Features

- **Multi-Agent System** — 6 specialized agents with intelligent routing
- **Google Gemini AI** — Natural language understanding and dynamic responses
- **Graceful Fallback** — Works without API keys using comprehensive static data
- **Interactive Chat UI** — Premium dark theme with glassmorphism design
- **Agent Visualization** — Real-time sidebar showing which agent is active
- **Suggestion Chips** — Contextual follow-up suggestions after each response
- **Responsive Design** — Works on desktop and mobile devices
- **Service Health Dashboard** — Live status of all Google services
- **Comprehensive Knowledge Base** — Indian election data covering all aspects

## 📝 Assumptions

1. **India-focused**: The knowledge base primarily covers Indian elections (Lok Sabha, Vidhan Sabha, Panchayat)
2. **Educational purpose**: The assistant provides information, not actual voter registration services
3. **Fallback priority**: The system is designed to work reliably without external API dependencies
4. **Single-session**: Conversation history is maintained per session (browser tab)
5. **Non-partisan**: All information is factual and non-partisan as per Election Commission guidelines

## 🧪 Testing

- **Unit Tests**: Agent routing, fallback responses, and intent classification
- **Integration Tests**: API endpoints, message processing, and error handling
- **Manual Testing**: UI interactions, responsive design, and agent visualization

## 📄 License

MIT
