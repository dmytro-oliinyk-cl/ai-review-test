/**
 * Documentation link generator for code quality rules
 * Maps rule IDs to their documentation URLs
 */

const DOCS_BASE_URL = "https://clca-dev.atlassian.net/wiki/spaces/NL/pages/312246283/Frontend+Code+Quality+Architecture+Standards";

/**
 * Rule ID to title mapping
 * Based on the review rules definitions
 */
const RULE_TITLES = {
  // Architecture Rules (CQ-1.xx)
  "CQ-1.01": "Single-Responsibility-Everywhere",
  "CQ-1.02": "Predictability-&-Determinism",
  "CQ-1.03": "Explicit-over-Implicit",
  "CQ-1.04": "Separation-of-Concerns",
  "CQ-1.05": "Observability-&-Logging",
  "CQ-1.06": "Minimal-Global-State",

  // Structure Rules (CQ-2.xx)
  "CQ-2.01": "Shared-Modules-Isolation",
  "CQ-2.02": "Consistent-Naming-(Features/Folders)",
  "CQ-2.03": "Absolute-Import-Paths",
  "CQ-2.04": "No-Cross-Feature-Coupling",

  // Naming Rules (CQ-3.xx)
  "CQ-3.01": "Folders-use-kebab-case",
  "CQ-3.02": "Components/Hooks-Naming",
  "CQ-3.03": "Real-Constants-in-UPPER_SNAKE_CASE",
  "CQ-3.04": "Functions/Variables-in-camelCase",
  "CQ-3.05": "Boolean-Flags-Descriptive-&-Positive",
  "CQ-3.06": "Enums/Dictionaries-PascalCase",
  "CQ-3.07": "File-Name-=-Exported-Entity",
  "CQ-3.08": "Avoid-Abbreviations/Acronyms",
  "CQ-3.09": "No-Meaningless-Suffixes/Prefixes",
  "CQ-3.10": "Tests-Mirror-Source",
  "CQ-3.11": "Singular-Folder-for-Single-Feature",
  "CQ-3.12": "CSS/SCSS-Modules-Match-Component",
  "CQ-3.13": "Context/Provider-Naming-Consistency",

  // React Rules (CQ-4.xx)
  "CQ-4.01": "Single-Responsibility-per-Component",
  "CQ-4.02": "Custom-Hooks-for-Shared-Logic",
  "CQ-4.03": "Complete-Effect-Dependencies",
  "CQ-4.05": "Proper-Keys-in-Lists",
  "CQ-4.06": "Clear-Conditional-Rendering",
  "CQ-4.07": "Memoization-&-Performance",
  "CQ-4.08": "No-Business-Logic-in-JSX",
  "CQ-4.09": "Avoid-Heavy-Components-(>200-lines)",
  "CQ-4.10": "Consistent-Event-Handlers",
  "CQ-4.11": "No-Inline-Functions-in-Hot-Loops",
  "CQ-4.12": "Use-Suspense-&-Lazy-Loading",
  "CQ-4.13": "Avoid-Mixing-UI-&-Business-Logic",

  // State Rules (CQ-5.xx)
  "CQ-5.01": "Local-State-First",
  "CQ-5.02": "Server-State-via-React-Query",
  "CQ-5.03": "Derived-State-in-Selectors",
  "CQ-5.04": "Avoid-Prop-Drilling-Beyond-Two-Levels",
  "CQ-5.05": "Keep-State-Immutable",
  "CQ-5.06": "Avoid-Redundant-State",
  "CQ-5.07": "Reset-State-on-Unmount",
};

/**
 * Generate documentation URL for a rule ID
 * @param {string} ruleId - The rule ID (e.g., "CQ-4.11")
 * @returns {string} Full documentation URL with anchor
 */
function getRuleDocUrl(ruleId) {
  const title = RULE_TITLES[ruleId];

  if (!title) {
    // If rule not found, just link to the base docs
    return DOCS_BASE_URL;
  }

  // Format: #CQ-1.01-%E2%80%94-Single-Responsibility-Everywhere
  // %E2%80%94 is the em-dash (—) in URL encoding
  const anchor = `#${ruleId}-%E2%80%94-${title}`;

  return `${DOCS_BASE_URL}${anchor}`;
}

/**
 * Generate markdown link for a rule
 * @param {string} ruleId - The rule ID (e.g., "CQ-4.11")
 * @returns {string} Markdown formatted link
 */
function getRuleLink(ruleId) {
  const url = getRuleDocUrl(ruleId);
  return `[${ruleId}](${url})`;
}

module.exports = {
  getRuleDocUrl,
  getRuleLink,
  DOCS_BASE_URL,
};
