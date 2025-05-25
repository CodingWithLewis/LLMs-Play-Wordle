import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

// Define the chat message type
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const guessWord = async (previousResults: { guess: string; results: { letter: string; color: "green" | "yellow" | "gray"; }[]; }[] = []) => {
  const isFirstGuess = previousResults.length === 0;

  // Initialize the conversation with a system message
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that helps the user guess the word in the game Wordle. You provide the user with only the word to guess.',
    }
  ];

  if (isFirstGuess) {
    // First guess - just add the initial user message
    messages.push({
      role: 'user',
      content: 'Give an opening guess for the game Wordle. The word should be 5 letters long. The word should not be a proper noun or a plural. Only provide the word, nothing else.'
    });
  } else {
    // Build the status message with previous guesses and results
    const statusMessage = `Here are my previous guesses and their results:
${previousResults.map(result => {
      const wordDisplay = result.guess.toUpperCase().split('').map((letter, idx) => {
        const color = result.results[idx].color;
        const colorEmoji = color === 'green' ? '🟩' : color === 'yellow' ? '🟨' : '⬜';
        return `${colorEmoji} ${letter}`;
      }).join(' ');

      return wordDisplay;
    }).join('\n')}

What we know so far:
${(() => {
        // Create letter knowledge summary
        const letterStatus: Record<string, string> = {};
        const greenPositions: Record<number, string> = {};

        // Track every letter and its status
        previousResults.forEach(result => {
          result.results.forEach((letterResult, position) => {
            const letter = result.guess[position]?.toUpperCase() || '';

            if (letterResult.color === 'green') {
              greenPositions[position] = letter;
              letterStatus[letter] = 'correct position';
            } else if (letterResult.color === 'yellow' && letterStatus[letter] !== 'correct position') {
              letterStatus[letter] = 'in word';
            } else if (letterResult.color === 'gray' && !letterStatus[letter]) {
              letterStatus[letter] = 'not in word';
            }
          });
        });

        // Create summary text
        let summary = '';

        // Known positions
        const knownWord = ['_', '_', '_', '_', '_'];
        Object.entries(greenPositions).forEach(([position, letter]) => {
          knownWord[parseInt(position)] = letter;
        });
        summary += `Word pattern: ${knownWord.join(' ')}\n`;

        // Letters in the word
        const inWordLetters = Object.entries(letterStatus)
          .filter(([_, status]) => status === 'in word' || status === 'correct position')
          .map(([letter, _]) => letter);

        if (inWordLetters.length > 0) {
          summary += `Letters definitely in the word: ${inWordLetters.join(', ')}\n`;
        }

        // Letters not in the word
        const notInWordLetters = Object.entries(letterStatus)
          .filter(([_, status]) => status === 'not in word')
          .map(([letter, _]) => letter);

        if (notInWordLetters.length > 0) {
          summary += `Letters not in the word: ${notInWordLetters.join(', ')}`;
        }

        return summary;
      })()}`;

    // Add previous guess/response pairs to the chat history
    for (let i = 0; i < previousResults.length; i++) {
      if (i === 0) {
        // First guess was from initial prompt
        messages.push({
          role: 'user',
          content: 'Give an opening guess for the game Wordle. The word should be 5 letters long. The word should not be a proper noun or a plural. Only provide the word, nothing else.'
        });
      } else {
        // Add the status update from previous round
        const previousStatus = `Here are my previous guesses and their results so far:
${previousResults.slice(0, i).map(result => {
          const wordDisplay = result.guess.toUpperCase().split('').map((letter, idx) => {
            const color = result.results[idx].color;
            const colorEmoji = color === 'green' ? '🟩' : color === 'yellow' ? '🟨' : '⬜';
            return `${colorEmoji} ${letter}`;
          }).join(' ');
          return wordDisplay;
        }).join('\n')}`;

        messages.push({
          role: 'user',
          content: previousStatus + '\n\nSuggest the next best 5-letter word for Wordle based on these results.'
        });
      }

      // Add the AI's response for this round
      messages.push({
        role: 'assistant',
        content: previousResults[i].guess
      });
    }

    // Add the current user request with round-specific strategy hints
    const round = previousResults.length + 1;
    let strategyHint = '';

    if (round <= 2) {
      strategyHint = "Since we're early in the game, focus on identifying more letters by using common letters that haven't been tried yet.";
    } else if (round <= 4) {
      strategyHint = "We're in the middle of the game. Make an educated guess using the knowledge we have, but still try to discover new letters for positions we're unsure about.";
    } else {
      strategyHint = "We're near the end of the game. MAKE YOUR BEST POSSIBLE GUESS considering ALL constraints. Use ALL information about letter positions and letters present in the word. This is a critical guess - only select a word that satisfies ALL known constraints. Prefer common words over obscure ones.";
    }

    messages.push({
      role: 'user',
      content: `${statusMessage}

Guessing strategy (important):
${strategyHint}

Green squares (🟩) mean the letter is correct and in the right position.
Yellow squares (🟨) mean the letter is in the word but in the wrong position.
White/gray squares (⬜) mean the letter is not in the word.

Suggest the next best 5-letter word for Wordle. Provide only the word, nothing else.`
    });
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-32b',
      messages: messages,
    }),
  });
  console.log(messages)
  const data = await response.json();
  const guess = data.choices[0].message.content.trim();
  return guess;
}

(async () => {
  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: "LOCAL",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    // To use Anthropic, set modelName to "claude-3-5-sonnet-latest"
    modelName: "gpt-4o",
    modelClientOptions: {
      // To use Anthropic, set apiKey to process.env.ANTHROPIC_API_KEY
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const page = stagehand.page;
  await page.goto("https://www.nytimes.com/games/wordle/index.html");

  // Preview an action before taking it
  const suggestions = await page.observe("Click 'play");

  // Take a suggested action
  await page.act(suggestions[0]);

  const x_suggestions = await page.observe("Click the x button to close the instructions modal");

  await page.act(x_suggestions[0]);

  const scroll_to_game = await page.observe("Scroll to the game");
  await page.act(scroll_to_game[0]);

  // Declare item outside the loop to persist between iterations
  let item = null;
  let previousResults = [];

  for (let i = 0; i < 6; i++) {
    // Use the refactored guessWord function for all guesses
    const guess = await guessWord(previousResults);

    console.log(`Guessing: ${guess}`);

    // Type each letter individually
    for (const letter of guess.toLowerCase()) {
      await page.keyboard.press(letter);
      // Add a small delay between keystrokes for stability
      await page.waitForTimeout(100);
    }

    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000); // Wait for the result to be processed

    item = await page.extract({
      instruction: "Extract the letters and their colors from the game board.",
      schema: z.object({
        results: z.array(z.object({
          letter: z.string().length(1),
          color: z.enum(["green", "yellow", "gray"]),
        }))
      }),
    });
    console.log(item);

    // Store this guess result for the next iteration
    if (item && item.results) {
      previousResults.push({
        guess,
        results: item.results
      });
    }

    // Check if all letters are green (we won)
    if (item?.results?.every(result => result.color === "green")) {
      console.log("Word guessed correctly!");
      break;
    }
  }
  await stagehand.close();
})().catch((error) => console.error(error.message));