/**
 * API client with retry logic and timeout handling
 * @module utils/apiClient
 */

const config = require("../config");

/**
 * Sleeps for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes an HTTP request with retry logic
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} maxAttempts - Maximum retry attempts
 * @returns {Promise<Response>} The fetch response
 * @throws {Error} If all retries fail
 */
async function fetchWithRetry(url, options = {}, maxAttempts = config.retry.maxAttempts) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        options.timeout || config.gemini.timeoutMs
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response;
    } catch (error) {
      lastError = error;
      clearTimeout(timeout);

      if (attempt < maxAttempts) {
        const delay = Math.min(
          config.retry.initialDelayMs * Math.pow(config.retry.backoffMultiplier, attempt - 1),
          config.retry.maxDelayMs
        );
        console.warn(
          `⚠️  Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Failed after ${maxAttempts} attempts. Last error: ${lastError.message}`
  );
}

/**
 * Calls Google Gemini API with the provided payload
 * @param {object} payload - The request payload
 * @returns {Promise<object>} The API response
 * @throws {Error} If the API call fails
 */
async function callGemini(payload) {
  if (!config.gemini.apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  // Construct the full URL with model and API key
  const url = `${config.gemini.apiUrl}/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    timeout: config.gemini.timeoutMs,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Gemini API error (HTTP ${response.status}): ${text}`);
  }

  return await response.json();
}

/**
 * Posts a comment to GitHub PR
 * @param {object} params - Comment parameters
 * @param {string} params.owner - Repository owner
 * @param {string} params.repo - Repository name
 * @param {number} params.pullNumber - Pull request number
 * @param {string} params.commitId - Commit SHA
 * @param {string} params.path - File path
 * @param {number} params.line - Line number
 * @param {string} params.body - Comment body
 * @param {string} params.side - Side (LEFT or RIGHT)
 * @returns {Promise<void>}
 * @throws {Error} If posting fails
 */
async function postGitHubComment({ owner, repo, pullNumber, commitId, path, line, body, side = "RIGHT" }) {
  if (!config.github.token) {
    throw new Error("GITHUB_TOKEN is not set");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;
  const payload = {
    body,
    commit_id: commitId,
    path,
    line,
    side,
  };

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.github.token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": config.github.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `GitHub API error (HTTP ${response.status}) for ${path}:${line} - ${text}`
    );
  }
}

module.exports = {
  fetchWithRetry,
  callGemini,
  postGitHubComment,
};
