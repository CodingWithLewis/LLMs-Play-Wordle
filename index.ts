import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { GuessResult, guessWord } from "./lib/guessWord.js";
import StagehandConfig from "./stagehand.config.js";
import { announce } from "./utils.js";

/**
 * Main Wordle Bot Application
 * Automatically plays and solves Wordle using AI and browser automation
 */
async function main() {
  try {
    announce(
      "🎯 Starting Wordle Bot\n\nThis bot will automatically play Wordle using AI to generate intelligent guesses.",
      "Wordle Bot"
    );

    // Initialize Stagehand with configuration
    console.log("🚀 Initializing browser automation...");
    const stagehand = new Stagehand(StagehandConfig);

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

    // Game state variables
    let extractedResult: { results: { letter: string; color: "green" | "yellow" | "gray" }[] } | null = null;
    let previousResults: GuessResult[] = [];
    let invalidWords: string[] = [];

    console.log("🎮 Starting Wordle game...");

    for (let i = 0; i < 6; i++) {
      console.log(`\n[ROUND ${i + 1}] Starting...`);

      // Use the refactored guessWord function for all guesses
      const guess = await guessWord(previousResults, invalidWords);

      console.log(`[ROUND ${i + 1}] Guessing: ${guess}`);

      // Type each letter individually
      console.log(`[ROUND ${i + 1}] Typing letters...`);
      for (const letter of guess.toLowerCase()) {
        await page.keyboard.press(letter);
        // Add a small delay between keystrokes for stability
        await page.waitForTimeout(50);
      }

      console.log(`[ROUND ${i + 1}] Pressing Enter...`);
      await page.keyboard.press("Enter");

      console.log(`[ROUND ${i + 1}] Waiting for game to process...`);
      await page.waitForTimeout(1500); // Wait a bit for word validation

      // Try to extract results - if the word is invalid, this will fail or return incomplete data
      let wordAccepted = false;

      console.log(`[ROUND ${i + 1}] Attempting to extract results...`);
      try {
        extractedResult = await page.extract({
          instruction: `Extract only the letters and their colors from row ${i + 1} (the current row just entered) of the game board. Do not include previous rows.`,
          schema: z.object({
            results: z.array(z.object({
              letter: z.string().length(1),
              color: z.enum(["green", "yellow", "gray"]),
            })).length(5)
          }),
        });

        // If we successfully extracted 5 tiles with colors, the word was accepted
        if (extractedResult && extractedResult.results && extractedResult.results.length === 5) {
          wordAccepted = true;
          console.log(`[ROUND ${i + 1}] Word accepted, extraction successful:`, extractedResult);
        }
      } catch (extractError) {
        console.log(`[ROUND ${i + 1}] Extraction failed, word likely not in dictionary`);
        wordAccepted = false;
      }

      if (!wordAccepted) {
        console.log(`[ROUND ${i + 1}] Word "${guess}" not in dictionary, clearing and trying again...`);

        // Add to invalid words list
        invalidWords.push(guess.toUpperCase());

        // Clear the invalid word
        for (let j = 0; j < 5; j++) {
          await page.keyboard.press("Backspace");
          await page.waitForTimeout(50);
        }

        // Decrement i to retry this round
        i--;
        continue;
      }

      // Results already extracted above, no need to extract again

      // Store this guess result for the next iteration
      if (extractedResult && extractedResult.results) {
        previousResults.push({
          guess,
          results: extractedResult.results
        });
      }

      // Check if all letters are green (we won)
      if (extractedResult?.results?.every((result: { color: string }) => result.color === "green")) {
        console.log("🎉 Word guessed correctly!");
        announce("🏆 Wordle solved successfully!", "Victory");
        break;
      }
    }

    console.log("🎯 Game completed!");
    await stagehand.close();

  } catch (error) {
    console.error("❌ Error occurred:", error);
    throw error;
  }
}

// Run the main function
main().catch((error) => {
  console.error("💥 Fatal error:", error.message);
  process.exit(1);
});