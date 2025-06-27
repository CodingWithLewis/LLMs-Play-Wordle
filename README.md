# 🎯 Wordle Bot

[![Watch the Demo](https://img.shields.io/badge/▶️_Watch_Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=Stcqh4BqlIY)

An AI-powered Wordle solver that uses browser automation and large language models to automatically play and solve Wordle puzzles.

## Features

- 🤖 **AI-Powered**: Uses OpenAI or OpenRouter APIs to generate intelligent word guesses
- 🌐 **Browser Automation**: Powered by [Stagehand](https://github.com/browserbase/stagehand) for reliable web interaction
- 🧠 **Smart Strategy**: Analyzes previous guesses and applies Wordle constraints for optimal play
- 🔄 **Multiple LLM Support**: Compatible with OpenAI, OpenRouter, and other LLM providers
- 🎛️ **Configurable**: Easy setup with environment variables

## How It Works

1. **Navigates** to the New York Times Wordle website
2. **Generates** intelligent word guesses using AI based on Wordle constraints
3. **Extracts** color feedback (green/yellow/gray) from the game interface
4. **Analyzes** results to build constraints for the next guess
5. **Repeats** until the word is solved or maximum attempts reached

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wordlebot

# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:

### Required API Keys

**For Browser Automation (Browserbase - Recommended):**
- `BROWSERBASE_API_KEY`: Get from [Browserbase](https://browserbase.com)
- `BROWSERBASE_PROJECT_ID`: Your Browserbase project ID

**For LLM API:**
- `OPENAI_API_KEY`: Get from [OpenAI](https://platform.openai.com) OR
- `OPENROUTER_API_KEY`: Get from [OpenRouter](https://openrouter.ai)

### Configuration Options

```env
# LLM Provider: "openai" or "openrouter"
LLM_PROVIDER="openai"

# Model selection based on provider:
# For OpenAI: "o3-mini", "gpt-4o", "gpt-4o-mini", etc.
# For OpenRouter: "openai/o3-mini", "anthropic/claude-3-sonnet", etc.
LLM_MODEL="o3-mini"
```

## Usage

### Run with Browserbase (Recommended)
```bash
npm start
```

### Run Locally
To run with a local browser instead of Browserbase, modify [`stagehand.config.ts`](stagehand.config.ts):
```typescript
env: "LOCAL" // Change from "BROWSERBASE" to "LOCAL"
```

Then run:
```bash
npm start
```

## How the AI Strategy Works

The bot uses a sophisticated constraint-based approach:

1. **First Guess**: Uses common 5-letter words with good letter distribution
2. **Subsequent Guesses**: 
   - **Green letters**: Fixed in correct positions
   - **Yellow letters**: Must be included but not in guessed positions
   - **Gray letters**: Excluded from future guesses
   - **Invalid words**: Tracks and avoids words not in Wordle's dictionary

The AI receives prompts like:
```
Wordle constraints:
Word: ?R?I?
Must have: RAISE
Not at: pos1≠R, pos4≠I
Exclude: XTON
NOT these words (invalid): TRAIL, BRAIN
Give one 5-letter word:
```

## Project Structure

```
wordlebot/
├── index.ts              # Main application entry point
├── lib/
│   └── guessWord.ts      # AI word generation logic
├── llm_clients/          # Custom LLM client implementations
├── stagehand.config.ts   # Browser automation configuration
├── utils.ts              # Utility functions
└── .env.example          # Environment configuration template
```

## Requirements

- Node.js 18+
- API keys for:
  - Browserbase (for cloud browser automation) OR local browser setup
  - OpenAI or OpenRouter (for AI word generation)

## Development

```bash
# Build TypeScript
npm run build

# Development with auto-reload
npm run start
```

## Troubleshooting

### Common Issues

1. **"Word not in dictionary" errors**: The bot automatically handles this by tracking invalid words and retrying
2. **Browser automation failures**: Ensure your Browserbase API keys are correct, or try local mode
3. **LLM API errors**: Check your API keys and rate limits

### Environment Setup

Make sure your `.env` file has all required variables from `.env.example`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Stagehand](https://github.com/browserbase/stagehand) for browser automation
- Powered by [Browserbase](https://browserbase.com) for cloud browser infrastructure
- Uses OpenAI and OpenRouter APIs for intelligent word generation

## Disclaimer

This bot is for educational purposes. Please use responsibly and in accordance with the New York Times' terms of service.
