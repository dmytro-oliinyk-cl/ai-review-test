/**
 * Calls Google Gemini API with the built request and processes the response
 * Extracts structured JSON output and generates review comments
 */

const config = require("./config");
const { readJsonFile, writeJsonFile, writeFile } = require("./utils/fileUtils");
const { callGemini } = require("./utils/apiClient");
const {
  withErrorHandling,
  validateRequiredEnvVars,
} = require("./utils/errorHandler");
const {
  extractResponseText,
  formatMarkdownComment,
} = require("./formatters/commentFormatter");

/**
 * Main function to call Google Gemini API and process response
 */
async function main() {
  // Validate required environment variables
  validateRequiredEnvVars(["AI_API_KEY"]);

  // Read the request payload
  const requestPayload = readJsonFile(config.paths.requestJson);
  if (!requestPayload) {
    throw new Error(`Request file not found: ${config.paths.requestJson}`);
  }

  console.log(`🚀 Calling Google Gemini API (will try fallback models if needed)...`);

  // Log request payload for debugging (without full content to avoid clutter)
  console.log("\n" + "=".repeat(60));
  console.log("📤 REQUEST PAYLOAD SUMMARY");
  console.log("=".repeat(60));
  console.log(`Fallback models: ${config.gemini.fallbackModels.join(", ")}`);
  console.log(`Contents: ${requestPayload.contents?.length || 0}`);
  if (requestPayload.contents) {
    requestPayload.contents.forEach((content, i) => {
      const textPreview = content.parts?.[0]?.text?.substring(0, 100).replace(/\n/g, " ") || "";
      const textLength = content.parts?.[0]?.text?.length || 0;
      console.log(`  [${i}] ${content.role}: ${textPreview}${textLength > 100 ? "..." : ""} (${textLength} chars)`);
    });
  }
  console.log(`Response MIME type: ${requestPayload.generationConfig?.response_mime_type || "N/A"}`);
  console.log("=".repeat(60) + "\n");

  // Call Gemini API with retry logic (tries multiple models if needed)
  const { data: apiResponse, modelUsed } = await callGemini(requestPayload);

  // Log which model was successfully used
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Successfully used model: ${modelUsed}`);
  console.log("=".repeat(60) + "\n");

  // Log API response structure for debugging
  console.log("\n" + "=".repeat(60));
  console.log("📥 GEMINI API RESPONSE");
  console.log("=".repeat(60));
  console.log(JSON.stringify(apiResponse, null, 2));
  console.log("=".repeat(60) + "\n");

  // Save raw API response for debugging
  writeJsonFile(config.paths.responseJson, apiResponse);

  // Extract text from the response (handles multiple formats)
  let responseText = extractResponseText(apiResponse);
  if (!responseText || typeof responseText !== "string") {
    console.warn("⚠️  No text extracted from response, using empty object");
    responseText = "{}";
  }

  // Log extracted text
  console.log("\n" + "=".repeat(60));
  console.log("📄 EXTRACTED TEXT FROM RESPONSE");
  console.log("=".repeat(60));
  console.log(responseText);
  console.log("=".repeat(60) + "\n");

  // Save raw extracted text for debugging
  writeFile(config.paths.aiRawText, responseText);

  // Parse the JSON response
  let parsedResult;
  try {
    parsedResult = JSON.parse(responseText);
  } catch (error) {
    console.warn("⚠️  Failed to parse AI response as JSON, using empty result");
    console.warn(`   Parse error: ${error.message}`);
    parsedResult = { issues: [] };
  }

  // Log parsed result
  console.log("\n" + "=".repeat(60));
  console.log("✅ PARSED RESULT");
  console.log("=".repeat(60));
  console.log(JSON.stringify(parsedResult, null, 2));
  console.log("=".repeat(60) + "\n");

  // Save parsed result
  writeJsonFile(config.paths.aiResultJson, parsedResult);

  // Get diff length from environment
  const rawDiffLength = process.env.RAW_DIFF_LEN || "0";

  // Format and save markdown comment
  const markdownComment = formatMarkdownComment(
    parsedResult,
    modelUsed,
    rawDiffLength
  );
  writeFile(config.paths.commentMarkdown, markdownComment);

  console.log("\n" + "=".repeat(60));
  console.log("✅ GEMINI API CALL COMPLETED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log(`Model used: ${modelUsed}`);
  console.log(`Response saved to: ${config.paths.responseJson}`);
  console.log(`Parsed result saved to: ${config.paths.aiResultJson}`);
  console.log(`Comment saved to: ${config.paths.commentMarkdown}`);

  if (parsedResult.issues && Array.isArray(parsedResult.issues)) {
    console.log(`\n🔍 FOUND ${parsedResult.issues.length} ISSUE(S):`);
    if (parsedResult.issues.length > 0) {
      parsedResult.issues.forEach((issue, i) => {
        console.log(
          `  ${i + 1}. [${issue.id}] ${issue.path}:${
            issue.line
          } - ${issue.message?.substring(0, 60)}${
            issue.message?.length > 60 ? "..." : ""
          }`
        );
      });
    } else {
      console.log("  ✅ No code quality issues detected");
    }
  } else {
    console.log("\n⚠️  WARNING: Response did not contain valid 'issues' array");
  }
  console.log("=".repeat(60) + "\n");
}

// Execute with error handling
withErrorHandling(main, "Gemini API call")();
