import type { ConstructorParams } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

const StagehandConfig: ConstructorParams = {
  verbose: 1 /* Verbosity level for logging: 0 = silent, 1 = info, 2 = all */,
  domSettleTimeoutMs: 30_000 /* Timeout for DOM to settle in milliseconds */,

  // LLM configuration - dynamically set based on environment variables
  modelName: (() => {
    const llmProvider = process.env.LLM_PROVIDER || "openai";
    const llmModel = process.env.LLM_MODEL || "o3-mini";

    if (llmProvider === "openrouter") {
      return llmModel.includes("/") ? llmModel : `openai/${llmModel}`;
    } else {
      return llmModel;
    }
  })() /* Name of the model to use */,

  modelClientOptions: (() => {
    const llmProvider = process.env.LLM_PROVIDER || "openai";

    if (llmProvider === "openrouter") {
      return {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      };
    } else {
      return {
        apiKey: process.env.OPENAI_API_KEY,
      };
    }
  })() /* Configuration options for the model client */,

  // Browser configuration - change to "LOCAL" for local browser automation
  env: "BROWSERBASE" /* Environment to run in: LOCAL or BROWSERBASE */,
  apiKey: process.env.BROWSERBASE_API_KEY /* API key for authentication */,
  projectId: process.env.BROWSERBASE_PROJECT_ID /* Project identifier */,
  browserbaseSessionID:
    undefined /* Session ID for resuming Browserbase sessions */,
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      blockAds: true,
      viewport: {
        width: 1024,
        height: 768,
      },
    },
  },
  localBrowserLaunchOptions: {
    viewport: {
      width: 1024,
      height: 768,
    },
  } /* Configuration options for the local browser */,
};

export default StagehandConfig;
