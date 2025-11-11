/**
 * Error handling utilities
 * @module utils/errorHandler
 */

/**
 * Handles script errors and exits with appropriate code
 * @param {Error} error - The error that occurred
 * @param {string} context - Context description (e.g., "OpenAI API call")
 */
function handleError(error, context = "Script execution") {
  console.error(`❌ ${context} failed:`);
  console.error(`   ${error.message}`);

  if (error.stack && process.env.DEBUG) {
    console.error("\nStack trace:");
    console.error(error.stack);
  }

  process.exit(1);
}

/**
 * Validates required environment variables
 * @param {string[]} varNames - Array of environment variable names
 * @throws {Error} If any required variable is missing
 */
function validateRequiredEnvVars(varNames) {
  const missing = varNames.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  - ${missing.join("\n  - ")}`
    );
  }
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context description
 * @returns {Function} Wrapped function
 */
function withErrorHandling(fn, context) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      handleError(error, context);
    }
  };
}

module.exports = {
  handleError,
  validateRequiredEnvVars,
  withErrorHandling,
};
