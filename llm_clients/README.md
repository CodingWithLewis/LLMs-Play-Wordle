# LLM Client Examples

This directory contains example LLM client implementations that come with Stagehand. These are **not currently used** by the main Wordle Bot application.

## Current Implementation

The Wordle Bot currently makes direct API calls to LLM providers in [`../lib/guessWord.ts`](../lib/guessWord.ts). This approach was chosen for simplicity and direct control over the API interaction.

## Available Examples

- **`aisdk_client.ts`** - Example client using Vercel AI SDK
- **`customOpenAI_client.ts`** - Example client for OpenAI-compatible APIs

## Future Improvements

These clients could be integrated in future versions to:
- Provide better abstraction over different LLM providers
- Add retry logic and error handling
- Support streaming responses
- Enable easier testing with mock clients

## Contributing

If you'd like to refactor the bot to use these client implementations, please:
1. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for guidelines
2. Ensure backward compatibility with existing configuration
3. Add proper error handling and logging
4. Update documentation accordingly

For questions about these clients, refer to the [Stagehand documentation](https://github.com/browserbase/stagehand).