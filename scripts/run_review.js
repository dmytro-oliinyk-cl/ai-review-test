#!/usr/bin/env node

/**
 * Main orchestrator for AI Code Review
 * Handles the complete review workflow from diff computation to posting comments
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const { readJsonFile, writeJsonFile, writeFile, readFileIfExists, validateFilesExist } = require("./utils/fileUtils");
const { callGemini, postGitHubComment } = require("./utils/apiClient");
const { withErrorHandling, validateRequiredEnvVars } = require("./utils/errorHandler");
const { extractResponseText, formatMarkdownComment, formatIssueComment, isValidIssue } = require("./formatters/commentFormatter");

/**
 * Executes a shell command and returns the output
 */
function execCommand(command, description) {
  try {
    console.log(`▶️  ${description}...`);
    const output = execSync(command, { encoding: "utf8" });
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed: ${error.message}`);
    throw error;
  }
}

/**
 * Step 1: Compute diff between base and HEAD
 */
function computeDiff() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: COMPUTING DIFF");
  console.log("=".repeat(60));

  const baseSha = process.env.BASE_SHA || process.env.GITHUB_BASE_REF;
  const headSha = process.env.HEAD_SHA || process.env.GITHUB_SHA;

  if (!baseSha || !headSha) {
    console.warn("⚠️  No base/head SHA provided, skipping diff computation");
    return { rawLen: 0, trimLen: 0, empty: true };
  }

  console.log(`Computing diff: ${baseSha}...${headSha}`);

  // Generate diff
  const unifiedLines = process.env.DIFF_UNIFIED_LINES || "0";
  let diffContent = "";
  try {
    diffContent = execSync(
      `git diff --unified=${unifiedLines} ${baseSha}...${headSha}`,
      { encoding: "utf8" }
    );
  } catch (error) {
    console.warn("⚠️  Git diff failed, using empty diff");
    diffContent = "";
  }

  const rawLen = diffContent.length;

  // Trim diff to maximum allowed size
  const limit = config.limits.diffMaxChars;
  const trimmedDiff = diffContent.substring(0, limit);
  writeFile(config.paths.diffTrimmed, trimmedDiff);

  const trimLen = trimmedDiff.length;
  const empty = trimLen === 0;

  console.log(`Diff size: ${rawLen} chars (trimmed to ${trimLen})`);
  console.log(`Empty: ${empty}`);

  return { rawLen, trimLen, empty };
}

/**
 * Step 2: Verify AI instruction files exist
 */
function verifyAIFiles() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: VERIFYING AI INSTRUCTION FILES");
  console.log("=".repeat(60));

  validateFilesExist([
    config.paths.aiInstruction,
    config.paths.reviewRules,
  ]);

  const sysBytes = fs.statSync(config.paths.aiInstruction).size;
  const rulesBytes = fs.statSync(config.paths.reviewRules).size;

  console.log(`✅ AI instruction files found:`);
  console.log(`  - ${config.paths.aiInstruction} (${sysBytes} bytes)`);
  console.log(`  - ${config.paths.reviewRules} (${rulesBytes} bytes)`);
}

/**
 * Step 3: Build request payload
 */
function buildRequest() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: BUILDING REQUEST PAYLOAD");
  console.log("=".repeat(60));

  // Read instruction files and diff
  const systemPrompt = readFileIfExists(config.paths.aiInstruction);
  const reviewRules = readFileIfExists(config.paths.reviewRules);
  const diff = readFileIfExists(config.paths.diffTrimmed);

  if (!diff) {
    console.log("ℹ️  No diff content found, creating empty request");
  }

  // Build response schema
  const responseSchema = {
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
      response_schema: responseSchema,
    },
  };

  // Write to file
  writeJsonFile(config.paths.requestJson, payload, false);
  console.log("✅ request.json built successfully");

  return payload;
}

/**
 * Step 4: Call Gemini API
 */
async function callAI(requestPayload, rawDiffLen) {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: CALLING GEMINI API");
  console.log("=".repeat(60));

  validateRequiredEnvVars(["AI_API_KEY"]);

  console.log(`🚀 Calling Google Gemini API (will try fallback models if needed)...`);
  console.log(`Fallback models: ${config.gemini.fallbackModels.join(", ")}`);

  // Call Gemini API with retry logic (tries multiple models if needed)
  const { data: apiResponse, modelUsed } = await callGemini(requestPayload);

  console.log(`\n✅ Successfully used model: ${modelUsed}`);

  // Save raw API response for debugging
  writeJsonFile(config.paths.responseJson, apiResponse);

  // Extract text from the response
  let responseText = extractResponseText(apiResponse);
  if (!responseText || typeof responseText !== "string") {
    console.warn("⚠️  No text extracted from response, using empty object");
    responseText = "{}";
  }

  // Save raw extracted text
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

  console.log(`\n✅ PARSED RESULT: ${parsedResult.issues?.length || 0} issue(s) found`);

  // Save parsed result
  writeJsonFile(config.paths.aiResultJson, parsedResult);

  // Format and save markdown comment
  const markdownComment = formatMarkdownComment(
    parsedResult,
    modelUsed,
    rawDiffLen.toString()
  );
  writeFile(config.paths.commentMarkdown, markdownComment);

  return { parsedResult, modelUsed };
}

/**
 * Step 5: Post inline review comments to GitHub PR
 */
async function postInlineComments(parsedResult) {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: POSTING INLINE COMMENTS");
  console.log("=".repeat(60));

  validateRequiredEnvVars(["GITHUB_TOKEN", "GITHUB_EVENT_PATH"]);

  // Read GitHub event data
  const eventPath = config.github.eventPath;
  if (!fs.existsSync(eventPath)) {
    throw new Error(`GitHub event file not found: ${eventPath}`);
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const pullRequest = eventData.pull_request;

  if (!pullRequest) {
    throw new Error("No pull_request found in GitHub event data");
  }

  const owner = pullRequest.base.repo.owner.login;
  const repo = pullRequest.base.repo.name;
  const pullNumber = pullRequest.number;
  const commitId = pullRequest.head.sha;

  console.log(`PR context: ${owner}/${repo}#${pullNumber} @ ${commitId.substring(0, 7)}`);

  // Get issues
  const issues = parsedResult?.issues || [];
  if (!Array.isArray(issues) || issues.length === 0) {
    console.log("ℹ️  No issues to post");
    return;
  }

  // Filter valid issues
  const validIssues = issues.filter(isValidIssue);
  console.log(`Found ${validIssues.length} valid issue(s) out of ${issues.length}`);

  // Limit number of inline comments
  const maxInline = config.limits.maxInlineComments;
  const issuesToPost = validIssues.slice(0, maxInline);

  if (validIssues.length > maxInline) {
    console.log(`⚠️  Limiting to first ${maxInline} inline comments`);
  }

  // Post each issue as an inline comment
  let successCount = 0;
  let errorCount = 0;

  for (const issue of issuesToPost) {
    try {
      const body = formatIssueComment(issue);

      await postGitHubComment({
        owner,
        repo,
        pullNumber,
        commitId,
        path: issue.path,
        line: issue.line,
        body,
        side: "RIGHT",
      });

      successCount++;
      console.log(`✅ Posted comment for ${issue.id} at ${issue.path}:${issue.line}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to post ${issue.id}: ${error.message}`);
    }
  }

  console.log(`\n📊 Posted ${successCount} comment(s), ${errorCount} failed`);
}

/**
 * Main workflow
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🤖 AI CODE REVIEW WORKFLOW");
  console.log("=".repeat(60));

  try {
    // Step 1: Compute diff
    const diffStats = computeDiff();

    // Exit early if diff is empty
    if (diffStats.empty) {
      console.log("\nℹ️  No changes to review (empty diff)");
      console.log("Exiting workflow");
      process.exit(0);
    }

    // Step 2: Verify AI files
    verifyAIFiles();

    // Step 3: Build request
    const requestPayload = buildRequest();

    // Step 4: Call AI API
    const { parsedResult, modelUsed } = await callAI(requestPayload, diffStats.rawLen);

    // Step 5: Post inline comments
    await postInlineComments(parsedResult);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ AI CODE REVIEW COMPLETED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log(`Model used: ${modelUsed}`);
    console.log(`Issues found: ${parsedResult.issues?.length || 0}`);
    console.log(`Diff size: ${diffStats.rawLen} chars`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ AI CODE REVIEW FAILED");
    console.error("=".repeat(60));
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    console.error("=".repeat(60));
    process.exit(1);
  }
}

// Execute with error handling
withErrorHandling(main, "AI Code Review Workflow")();
