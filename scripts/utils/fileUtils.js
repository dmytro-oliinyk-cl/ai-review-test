/**
 * File system utilities with error handling
 * @module utils/fileUtils
 */

const fs = require("fs");
const path = require("path");

/**
 * Reads a file if it exists, returns empty string otherwise
 * @param {string} filePath - Path to the file
 * @returns {string} File contents or empty string
 */
function readFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return "";
  }
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} Parsed JSON or null if file doesn't exist or is invalid
 */
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
  }
}

/**
 * Writes content to a file with proper error handling
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @throws {Error} If write fails
 */
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, "utf8");
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Writes a JSON object to a file
 * @param {string} filePath - Path to the file
 * @param {object} data - Data to write
 * @param {boolean} pretty - Whether to pretty-print (default: true)
 * @throws {Error} If write fails
 */
function writeJsonFile(filePath, data, pretty = true) {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFile(filePath, content);
}

/**
 * Validates that required files exist
 * @param {string[]} filePaths - Array of file paths to validate
 * @throws {Error} If any file is missing
 */
function validateFilesExist(filePaths) {
  const missing = filePaths.filter((p) => !fs.existsSync(p));
  if (missing.length > 0) {
    throw new Error(`Required files are missing:\n  - ${missing.join("\n  - ")}`);
  }
}

module.exports = {
  readFileIfExists,
  readJsonFile,
  writeFile,
  writeJsonFile,
  validateFilesExist,
};
