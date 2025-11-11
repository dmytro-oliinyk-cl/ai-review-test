/**
 * Builds the OpenAI API request payload
 * Reads AI instructions, review rules, and diff, then constructs a structured request
 */

const config = require("./config");
const { readFileIfExists, writeJsonFile, validateFilesExist } = require("./utils/fileUtils");
const { withErrorHandling } = require("./utils/errorHandler");

/**
 * Builds the response format schema for structured JSON output
 * @returns {object} The response format specification
 */
function buildResponseFormat() {
  return {
    type: "json_schema",
    name: "AiCodeReviewIssues",
    schema: {
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
            additionalProperties: false,
          },
        },
      },
      required: ["issues"],
      additionalProperties: false,
    },
    strict: true,
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

  // Build the API payload
  const payload = {
    model: config.openai.model,
    text: {
      format: buildResponseFormat(),
    },
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Rules:\n${reviewRules}\n\nDIFF:\n${diff}` },
    ],
  };

  // Write to file
  writeJsonFile(config.paths.requestJson, payload, false);
  console.log("✅ request.json built successfully");
}

// Execute with error handling
withErrorHandling(main, "Building request")();
