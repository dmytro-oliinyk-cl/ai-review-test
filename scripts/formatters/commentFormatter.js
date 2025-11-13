/**
 * Formatters for AI review comments and responses
 * @module formatters/commentFormatter
 */

const { getRuleLink } = require("../utils/docLinks");

/**
 * Extracts text from AI API response
 * Handles multiple response formats:
 * 1. Google Gemini format (candidates array)
 * 2. Direct output_text field (OpenAI Responses API)
 * 3. Nested output array with message content (OpenAI Responses API)
 * 4. Chat Completions format (OpenAI fallback)
 *
 * @param {object} data - The API response data
 * @returns {string} Extracted text or empty string
 */
function extractResponseText(data) {
  // Format 1: Google Gemini API format
  if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
      const textParts = candidate.content.parts
        .filter(part => typeof part?.text === "string")
        .map(part => part.text);
      if (textParts.length > 0) {
        return textParts.join("\n");
      }
    }
  }

  // Format 2: Direct output_text field (OpenAI Responses API)
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  // Format 3: Responses API with output array (OpenAI)
  if (Array.isArray(data?.output)) {
    const chunks = [];
    for (const part of data.output) {
      if (part?.type === "message" && Array.isArray(part.content)) {
        for (const contentItem of part.content) {
          if (contentItem?.type === "output_text" && typeof contentItem.text === "string") {
            chunks.push(contentItem.text);
          }
        }
      }
    }
    if (chunks.length > 0) {
      return chunks.join("\n");
    }
  }

  // Format 4: Chat Completions API fallback (OpenAI)
  const choice = data?.choices?.[0];
  if (choice?.message?.content && typeof choice.message.content === "string") {
    return choice.message.content;
  }

  return "";
}

/**
 * Formats a single issue for inline comment
 * @param {object} issue - The issue object
 * @param {string} issue.id - Issue ID (e.g., "CQ-4.08")
 * @param {string} issue.path - File path
 * @param {number} issue.line - Line number
 * @param {string} issue.message - Issue message
 * @param {string} issue.suggestion - Suggestion for fix
 * @returns {string} Formatted comment body
 */
function formatIssueComment(issue) {
  const ruleLink = getRuleLink(issue.id);

  const lines = [
    `**${ruleLink}**`,
    "",
    issue.message || "",
  ];

  if (issue.suggestion) {
    lines.push("");
    lines.push(`**Suggestion:** ${issue.suggestion}`);
  }

  lines.push("");
  lines.push("---");
  lines.push(`<sub>CodeGuardian AI • [View all rules →](https://clca-dev.atlassian.net/wiki/spaces/NL/pages/312246283/Frontend+Code+Quality+Architecture+Standards)</sub>`);

  return lines.join("\n");
}

/**
 * Formats the AI result as a markdown comment
 * @param {object} result - The parsed AI result
 * @param {string} model - The model used
 * @param {number} rawDiffLength - The raw diff length in characters
 * @returns {string} Formatted markdown comment
 */
function formatMarkdownComment(result, model, rawDiffLength) {
  const issueCount = result?.issues?.length || 0;

  const lines = [
    "## CodeGuardian AI Review",
    "",
    `<sub>Powered by ${model} • Analyzed ${rawDiffLength} characters</sub>`,
    "",
  ];

  if (result?.issues && Array.isArray(result.issues) && result.issues.length > 0) {
    lines.push(`### Found ${result.issues.length} issue${result.issues.length > 1 ? 's' : ''}`);
    lines.push("");

    result.issues.forEach((issue, index) => {
      const ruleLink = getRuleLink(issue.id);
      lines.push(`#### ${index + 1}. ${ruleLink}`);
      lines.push("");
      lines.push(`\`${issue.path}:${issue.line}\``);
      lines.push("");

      if (issue.message) {
        lines.push(issue.message);
        lines.push("");
      }

      if (issue.suggestion) {
        lines.push(`**Suggestion:** ${issue.suggestion}`);
        lines.push("");
      }
    });
  } else {
    lines.push("### ✓ No issues found");
    lines.push("");
    lines.push("All code quality checks passed.");
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("<details>");
  lines.push("<summary>View detailed analysis</summary>");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(result, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("</details>");
  lines.push("");
  lines.push(`<sub>**CodeGuardian AI** • [View documentation →](https://clca-dev.atlassian.net/wiki/spaces/NL/pages/312246283/Frontend+Code+Quality+Architecture+Standards)</sub>`);

  return lines.join("\n");
}

/**
 * Validates that an issue has required fields for posting
 * @param {object} issue - The issue to validate
 * @returns {boolean} True if valid
 */
function isValidIssue(issue) {
  return (
    issue &&
    typeof issue.path === "string" &&
    issue.path.length > 0 &&
    Number.isInteger(issue.line) &&
    issue.line > 0
  );
}

module.exports = {
  extractResponseText,
  formatIssueComment,
  formatMarkdownComment,
  isValidIssue,
};
