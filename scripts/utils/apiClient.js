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
    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(
        () => controller.abort(),
        options.timeout || config.gemini.timeoutMs
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Check for retryable HTTP errors (503 Service Unavailable, 429 Rate Limited, 500 Server Error)
      if (!response.ok && (response.status === 503 || response.status === 429 || response.status === 500)) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Return response for success or non-retryable errors
      return response;
    } catch (error) {
      lastError = error;
      if (timeout) clearTimeout(timeout);

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
 * Tries multiple models in fallback order if previous models fail
 * @param {object} payload - The request payload
 * @returns {Promise<{data: object, modelUsed: string}>} The API response and model used
 * @throws {Error} If all models fail
 */
async function callGemini(payload) {
  if (!config.gemini.apiKey) {
    throw new Error("AI_API_KEY is not set");
  }

  const modelsToTry = config.gemini.fallbackModels || [config.gemini.model];
  const errors = [];

  // Try each model in sequence
  for (const model of modelsToTry) {
    console.log(`\n🔄 Trying model: ${model}`);

    try {
      // Construct the full URL with model and API key
      const url = `${config.gemini.apiUrl}/${model}:generateContent?key=${config.gemini.apiKey}`;

      // Use fewer retries per model (2 attempts) to cycle through models faster
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        timeout: config.gemini.timeoutMs,
      }, 2);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully used model: ${model}`);

      // Return both data and the model that succeeded
      return { data, modelUsed: model };

    } catch (error) {
      console.warn(`❌ Model ${model} failed: ${error.message}`);
      errors.push({ model, error: error.message });

      // Continue to next model
      continue;
    }
  }

  // All models failed
  const errorSummary = errors.map(e => `${e.model}: ${e.error}`).join("; ");
  throw new Error(`All Gemini models failed. Errors: ${errorSummary}`);
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
