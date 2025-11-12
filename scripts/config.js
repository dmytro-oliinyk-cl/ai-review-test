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

  // Retry Configuration
  retry: {
    maxAttempts: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
};
