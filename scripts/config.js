/**
 * Central configuration for AI Code Review scripts
 * @module config
 */

module.exports = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses",
    model: process.env.MODEL || "gpt-5-nano",
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
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
};
