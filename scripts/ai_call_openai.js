/**
 * Calls OpenAI API with the built request and processes the response
 * Extracts structured JSON output and generates review comments
 */

const config = require("./config");
const { readJsonFile, writeJsonFile, writeFile } = require("./utils/fileUtils");
const { callOpenAI } = require("./utils/apiClient");
const { withErrorHandling, validateRequiredEnvVars } = require("./utils/errorHandler");
const { extractResponseText, formatMarkdownComment } = require("./formatters/commentFormatter");

/**
 * Main function to call OpenAI API and process response
 */
async function main() {
  // Validate required environment variables
  validateRequiredEnvVars(["OPENAI_API_KEY"]);

  // Read the request payload
  const requestPayload = readJsonFile(config.paths.requestJson);
  if (!requestPayload) {
    throw new Error(`Request file not found: ${config.paths.requestJson}`);
  }

  // Ensure model is set (safety check)
  requestPayload.model = requestPayload.model || config.openai.model;

  console.log(`🚀 Calling OpenAI API (model: ${requestPayload.model})...`);

  // Call OpenAI API with retry logic
  const apiResponse = await callOpenAI(requestPayload);

  // Save raw API response for debugging
  writeJsonFile(config.paths.responseJson, apiResponse);

  // Extract text from the response (handles multiple formats)
  let responseText = extractResponseText(apiResponse);
  if (!responseText || typeof responseText !== "string") {
    responseText = "{}";
  }

  // Save raw extracted text for debugging
  writeFile(config.paths.aiRawText, responseText);

  // Parse the JSON response
  let parsedResult;
  try {
    parsedResult = JSON.parse(responseText);
  } catch (error) {
    console.warn("⚠️  Failed to parse AI response as JSON, using empty result");
    parsedResult = { issues: [] };
  }

  // Save parsed result
  writeJsonFile(config.paths.aiResultJson, parsedResult);

  // Get diff length from environment
  const rawDiffLength = process.env.RAW_DIFF_LEN || "0";

  // Format and save markdown comment
  const markdownComment = formatMarkdownComment(
    parsedResult,
    requestPayload.model,
    rawDiffLength
  );
  writeFile(config.paths.commentMarkdown, markdownComment);

  console.log("✅ OpenAI call completed successfully");
  console.log(`   - Response saved to: ${config.paths.responseJson}`);
  console.log(`   - Parsed result saved to: ${config.paths.aiResultJson}`);
  console.log(`   - Comment saved to: ${config.paths.commentMarkdown}`);

  if (parsedResult.issues && Array.isArray(parsedResult.issues)) {
    console.log(`   - Found ${parsedResult.issues.length} issue(s)`);
  }
}

// Execute with error handling
withErrorHandling(main, "OpenAI API call")();
