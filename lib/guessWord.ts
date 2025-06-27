/**
 * Wordle AI Solver
 * Generates intelligent word guesses based on previous results and constraints
 */

// Define the chat message type for LLM API
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Type for previous guess results
export type GuessResult = {
  guess: string;
  results: { letter: string; color: "green" | "yellow" | "gray"; }[];
};

/**
 * Generate the next Wordle guess using AI
 * @param previousResults - Array of previous guesses and their color results
 * @param invalidWords - Array of words that were rejected by Wordle
 * @returns Promise resolving to a 5-letter word guess
 */
export const guessWord = async (
  previousResults: GuessResult[] = [],
  invalidWords: string[] = []
): Promise<string> => {
  const isFirstGuess = previousResults.length === 0;

  // Simplified system message
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a Wordle solver. Respond with only a single 5-letter word.',
    }
  ];

  if (isFirstGuess) {
    messages.push({
      role: 'user',
      content: 'First Wordle guess. Common 5-letter word only.'
    });
  } else {
    // Build constraints more clearly
    const knownPositions: string[] = ['?', '?', '?', '?', '?'];
    const mustInclude = new Set<string>();
    const cantBe: Record<number, Set<string>> = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
    const excluded = new Set<string>();

    previousResults.forEach(result => {
      result.results.forEach((letterResult, position) => {
        const letter = result.guess[position].toUpperCase();
        if (letterResult.color === 'green') {
          knownPositions[position] = letter;
          mustInclude.add(letter);
        } else if (letterResult.color === 'yellow') {
          mustInclude.add(letter);
          cantBe[position].add(letter);
        } else if (letterResult.color === 'gray') {
          // Only exclude if not found elsewhere as green/yellow
          let foundElsewhere = false;
          result.results.forEach((lr, p) => {
            if (result.guess[p].toUpperCase() === letter && lr.color !== 'gray') {
              foundElsewhere = true;
            }
          });
          if (!foundElsewhere) {
            excluded.add(letter);
          }
        }
      });
    });

    // Build clear constraints
    const wordPattern = knownPositions.join('');

    let prompt = `Wordle constraints:\n`;
    prompt += `Word: ${wordPattern}\n`;

    if (mustInclude.size > 0) {
      prompt += `Must have: ${Array.from(mustInclude).join('')}\n`;
    }

    // Show position restrictions for yellow letters
    const restrictions: string[] = [];
    for (let pos = 0; pos < 5; pos++) {
      if (cantBe[pos].size > 0) {
        restrictions.push(`pos${pos + 1}≠${Array.from(cantBe[pos]).join('')}`);
      }
    }
    if (restrictions.length > 0) {
      prompt += `Not at: ${restrictions.join(', ')}\n`;
    }

    if (excluded.size > 0) {
      prompt += `Exclude: ${Array.from(excluded).join('')}\n`;
    }

    if (invalidWords.length > 0) {
      prompt += `NOT these words (invalid): ${invalidWords.join(', ')}\n`;
    }

    prompt += `Give one 5-letter word:`;

    messages.push({
      role: 'user',
      content: prompt
    });
  }

  // Log the system prompt after each turn
  console.log('\n=== SYSTEM PROMPT ===');
  messages.forEach(msg => {
    console.log(`[${msg.role.toUpperCase()}]:`);
    console.log(msg.content);
    console.log('---');
  });
  console.log('===================\n');

  try {
    console.log(`[API] Making request for guess ${previousResults.length + 1}...`);

    // Get LLM configuration from environment variables
    const llmProvider = process.env.LLM_PROVIDER || "openai";
    const llmModel = process.env.LLM_MODEL || "o3-mini";

    // Configure API endpoint and headers based on provider
    let apiUrl: string;
    let headers: Record<string, string>;
    let modelName: string;

    if (llmProvider === "openrouter") {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      modelName = llmModel.includes("/") ? llmModel : `openai/${llmModel}`;
      headers = {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/wordlebot/wordlebot', // Optional: for analytics
        'X-Title': 'Wordle Bot', // Optional: for analytics
      };
    } else {
      // Default to OpenAI direct
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      modelName = llmModel;
      headers = {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      };
    }

    console.log(`[API] Using provider: ${llmProvider}, model: ${modelName}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelName,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`${llmProvider.toUpperCase()} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Response received:`, data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter');
    }

    let content = data.choices[0].message.content.trim();

    // Remove <think> tags and their contents
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Extract just the 5-letter word
    const wordMatch = content.match(/\b[a-zA-Z]{5}\b/);
    if (!wordMatch) {
      throw new Error(`No valid 5-letter word found in response: ${content}`);
    }

    const guess = wordMatch[0].toLowerCase();
    console.log(`[API] Extracted guess: ${guess}`);
    return guess;
  } catch (error) {
    console.error('[API] Error in guessWord:', error);
    throw error;
  }
};