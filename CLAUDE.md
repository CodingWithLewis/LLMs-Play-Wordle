# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Install dependencies and Playwright browsers
npm install

# Run the Wordle bot
npm start

# Build TypeScript
npm run build

# Development mode (same as start)
npm run dev
```

## Architecture Overview

This is an AI-powered Wordle-solving bot that automates playing the NYT Wordle game. The system has three main components:

1. **Browser Automation Layer** - Uses Stagehand (built on Playwright) to control the browser and interact with the Wordle UI
2. **AI Word Guessing** - Configurable LLM integration (OpenAI, OpenRouter, etc.) to analyze game state and generate strategic word guesses
3. **Game Loop Controller** - Orchestrates the flow between browser actions and AI decisions across up to 6 attempts

## Key Files Structure

```
wordlebot/
├── index.ts              # Main application entry point and game loop
├── lib/
│   └── guessWord.ts      # AI word generation logic with constraint analysis
├── llm_clients/          # Example LLM client implementations (not used by main app)
├── stagehand.config.ts   # Browser automation and LLM configuration
├── utils.ts              # Utility functions for UI, caching, and environment handling
├── .env.example          # Environment variables template
└── README.md             # Main project documentation
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your API keys based on chosen providers:

**Required for Browser Automation:**
- `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` (recommended for cloud)
- OR use local browser by setting `env: "LOCAL"` in `stagehand.config.ts`

**Required for AI Word Generation:**
- `OPENAI_API_KEY` (if using OpenAI directly)
- `OPENROUTER_API_KEY` (if using OpenRouter for multi-model access)

**Configuration:**
- `LLM_PROVIDER`: "openai" or "openrouter"
- `LLM_MODEL`: Model name (e.g., "o3-mini", "gpt-4o", "anthropic/claude-3-sonnet")

## Key Implementation Details

### AI Strategy
- **Constraint-based guessing**: Analyzes green (correct position), yellow (wrong position), and gray (not in word) letters
- **Dictionary validation**: Tracks invalid words to avoid re-guessing
- **Progressive strategy**: Uses common starting words, then constraint-driven guesses

### Browser Automation
- **DOM extraction**: Uses Stagehand's AI to extract letter colors from game board
- **Error handling**: Automatically retries invalid words and handles UI edge cases
- **Reliable input**: Types letters individually with delays for stability

### Code Quality
- **TypeScript**: Fully typed with proper interfaces
- **Error handling**: Comprehensive try/catch with detailed logging
- **Modular design**: Separated concerns between browser automation and AI logic
- **Configuration-driven**: Easy to switch between providers and models

## Development Tips

- **Testing locally**: Set `env: "LOCAL"` in `stagehand.config.ts` to use local browser
- **Debugging**: Check console output for detailed round-by-round information
- **API costs**: Use cheaper models like "o3-mini" for development
- **Rate limits**: Be mindful of API rate limits when testing repeatedly