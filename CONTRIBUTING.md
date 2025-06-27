# Contributing to Wordle Bot

Thank you for your interest in contributing to Wordle Bot! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/wordlebot.git
   cd wordlebot
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

## Development Workflow

1. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes** thoroughly:
   ```bash
   npm run build
   npm start
   ```

4. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "Add: description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Follow the existing code style
- **Comments**: Add JSDoc comments for functions and classes
- **Error Handling**: Always handle errors appropriately
- **Logging**: Use descriptive console messages with emojis for better UX

## Types of Contributions

### 🐛 Bug Fixes
- Fix browser automation issues
- Resolve API integration problems
- Improve error handling

### ✨ Features
- Add support for new LLM providers
- Improve word guessing strategy
- Add new game modes or variants

### 📚 Documentation
- Improve README.md
- Add code comments
- Create tutorials or guides

### 🔧 Maintenance
- Update dependencies
- Improve performance
- Add tests

## Project Structure

```
wordlebot/
├── index.ts              # Main application entry point
├── lib/
│   └── guessWord.ts      # AI word generation logic
├── llm_clients/          # Custom LLM client implementations
├── stagehand.config.ts   # Browser automation configuration
├── utils.ts              # Utility functions
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Key Components

- **Browser Automation**: Uses Stagehand/Playwright for web interaction
- **AI Strategy**: LLM-powered word guessing with constraint analysis
- **Multi-Provider Support**: OpenAI, OpenRouter, and custom LLM clients

## Testing

Before submitting a PR:

1. **Manual Testing**: Run the bot and verify it works end-to-end
2. **Different Scenarios**: Test with various API providers and configurations
3. **Error Cases**: Verify error handling works properly

## Reporting Issues

When reporting bugs, please include:

- **Environment**: OS, Node.js version, npm version
- **Configuration**: Which LLM provider and browser environment
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Expected vs Actual**: What you expected vs what happened
- **Logs**: Relevant console output or error messages

## Feature Requests

For new features:

- **Use Case**: Explain why this feature would be useful
- **Implementation**: Suggest how it might be implemented
- **Breaking Changes**: Note if this would break existing functionality

## Questions?

If you have questions about contributing:

- **GitHub Issues**: Open an issue for discussion
- **Code Review**: We'll provide feedback on your Pull Request

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code and ideas, not the person
- Help newcomers learn and contribute

Thank you for contributing to Wordle Bot! 🎯