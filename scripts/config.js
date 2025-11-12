/**
 * Central configuration for AI Code Review scripts
 * @module config
 */

module.exports = {
  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.AI_API_KEY,
    apiUrl:
      process.env.GEMINI_API_URL ||
      "https://generativelanguage.googleapis.com/v1beta/models",
    model: process.env.MODEL || "gemini-2.5-flash",
    // Model fallback list - will try each in order if previous fails
    fallbackModels: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ],
    timeoutMs: 60000,
  },

  // GitHub Configuration
  github: {
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY || "",
    eventPath: process.env.GITHUB_EVENT_PATH,
    apiVersion: "2022-11-28",
  },

  // File Paths
  paths: {
    aiInstruction: ".ai/ai-reviewer-instruction.md",
    reviewRules: ".ai/review-rules.md",
    diffTrimmed: "diff.trimmed",
    requestJson: "request.json",
    responseJson: "response.json",
    aiResultJson: "ai_result.json",
    aiRawText: "ai_raw_text.txt",
    commentMarkdown: "comment.md",
  },

  // Limits and Constraints
  limits: {
    diffMaxChars: Number(process.env.DIFF_MAX_CHARS) || 150000,
    maxInlineComments: Number(process.env.MAX_INLINE) || 30,
  },

  // Retry Configuration (per model, not total)
  retry: {
    maxAttempts: 5, // Default, but callGemini uses 2 per model
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
};
