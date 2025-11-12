/**
 * Builds the Google Gemini API request payload
 * Reads AI instructions, review rules, and diff, then constructs a structured request
 */

const config = require("./config");
const { readFileIfExists, writeJsonFile, validateFilesExist } = require("./utils/fileUtils");
const { withErrorHandling } = require("./utils/errorHandler");

/**
 * Builds the response schema for structured JSON output (Gemini format)
 * @returns {object} The response schema specification
 */
function buildResponseSchema() {
  return {
    type: "object",
    properties: {
      issues: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "path", "line", "message", "suggestion"],
          properties: {
            id: { type: "string" },
            path: { type: "string" },
            line: { type: "integer" },
            message: { type: "string" },
            suggestion: { type: "string" },
          },
        },
      },
    },
    required: ["issues"],
  };
}

/**
 * Main function to build the request payload
 */
async function main() {
  // Validate required files exist
  validateFilesExist([
    config.paths.aiInstruction,
    config.paths.reviewRules,
    config.paths.diffTrimmed,
  ]);

  // Read instruction files and diff
  const systemPrompt = readFileIfExists(config.paths.aiInstruction);
  const reviewRules = readFileIfExists(config.paths.reviewRules);
  const diff = readFileIfExists(config.paths.diffTrimmed);

  if (!diff) {
    console.log("ℹ️  No diff content found, creating empty request");
  }

  // Build the API payload for Gemini
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nRules:\n${reviewRules}\n\nDIFF:\n${diff}`,
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: buildResponseSchema(),
    },
  };

  // Write to file
  writeJsonFile(config.paths.requestJson, payload, false);
  console.log("✅ request.json built successfully");
}

// Execute with error handling
withErrorHandling(main, "Building request")();
