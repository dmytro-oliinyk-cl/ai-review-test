/**
 * Posts inline review comments to GitHub PR based on AI analysis results
 * Each issue is posted as a line comment on the corresponding file and line
 */

const config = require("./config");
const { readJsonFile } = require("./utils/fileUtils");
const { postGitHubComment } = require("./utils/apiClient");
const { withErrorHandling, validateRequiredEnvVars } = require("./utils/errorHandler");
const { formatIssueComment, isValidIssue } = require("./formatters/commentFormatter");

/**
 * Extracts GitHub PR context from environment
 * @returns {object} PR context containing owner, repo, pull number, and head SHA
 * @throws {Error} If required context is missing
 */
function getGitHubContext() {
  const repoFull = config.github.repository;
  const [owner, repo] = repoFull.split("/");

  if (!config.github.eventPath) {
    throw new Error("GITHUB_EVENT_PATH is not set");
  }

  const eventData = readJsonFile(config.github.eventPath);
  if (!eventData) {
    throw new Error(`Failed to read GitHub event data from ${config.github.eventPath}`);
  }

  const pullNumber = eventData?.pull_request?.number;
  const headSha = eventData?.pull_request?.head?.sha;

  if (!owner || !repo || !pullNumber || !headSha) {
    throw new Error(
      "Cannot resolve GitHub context (owner/repo/pull_number/headSha). " +
        "Ensure this script runs in a pull_request event context."
    );
  }

  return { owner, repo, pullNumber, headSha };
}

/**
 * Posts all issues as inline comments
 * @param {object[]} issues - Array of issues to post
 * @param {object} context - GitHub PR context
 */
async function postInlineComments(issues, context) {
  const maxComments = config.limits.maxInlineComments;
  const limitedIssues = issues.slice(0, maxComments);

  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const issue of limitedIssues) {
    // Validate issue has required fields
    if (!isValidIssue(issue)) {
      console.warn(`⚠️  Skipping invalid issue: ${JSON.stringify(issue)}`);
      skipped++;
      continue;
    }

    const commentBody = formatIssueComment(issue);

    try {
      await postGitHubComment({
        owner: context.owner,
        repo: context.repo,
        pullNumber: context.pullNumber,
        commitId: context.headSha,
        path: issue.path,
        line: issue.line,
        body: commentBody,
        side: "RIGHT",
      });
      posted++;
      console.log(`✓ Posted comment for ${issue.id} at ${issue.path}:${issue.line}`);
    } catch (error) {
      // Line not in diff or file not in PR - this is expected for some issues
      console.warn(`⚠️  Failed to post comment: ${error.message}`);
      failed++;
    }
  }

  return { posted, skipped, failed, total: issues.length };
}

/**
 * Main function to post inline comments
 */
async function main() {
  // Validate required environment variables
  validateRequiredEnvVars(["GITHUB_TOKEN"]);

  // Get GitHub PR context
  const context = getGitHubContext();
  console.log(`📝 Posting inline comments to ${context.owner}/${context.repo}#${context.pullNumber}`);

  // Read AI analysis results
  const aiResult = readJsonFile(config.paths.aiResultJson);
  if (!aiResult || !Array.isArray(aiResult.issues) || aiResult.issues.length === 0) {
    console.log("ℹ️  No issues found to comment");
    return;
  }

  console.log(`📋 Found ${aiResult.issues.length} issue(s) to process`);

  // Post inline comments
  const stats = await postInlineComments(aiResult.issues, context);

  // Summary
  console.log("\n✅ Inline comment posting completed:");
  console.log(`   - Posted: ${stats.posted}`);
  console.log(`   - Skipped (invalid): ${stats.skipped}`);
  console.log(`   - Failed: ${stats.failed}`);

  if (stats.total > config.limits.maxInlineComments) {
    console.log(
      `   ⚠️  Limited to ${config.limits.maxInlineComments} comments (${stats.total - config.limits.maxInlineComments} not posted)`
    );
  }
}

// Execute with error handling
withErrorHandling(main, "Posting inline comments")();
