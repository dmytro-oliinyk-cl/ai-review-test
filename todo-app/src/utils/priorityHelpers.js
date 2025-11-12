/**
 * Priority helper utilities
 * Following CQ-4.08: No business logic in JSX
 */

import {
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HIGH,
  PRIORITY_OPTIONS,
} from "../constants/priorities";

/**
 * Get priority color border style
 * @param {string} priority - Priority level
 * @returns {object} Style object for border
 */
export function getPriorityBorderStyle(priority) {
  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === priority);
  const color = priorityOption?.color || "gray";
  return { borderLeft: `5px solid ${color}` };
}

/**
 * Get priority badge text with emoji
 * @param {string} priority - Priority level
 * @returns {string} Formatted priority text
 */
export function getPriorityBadgeText(priority) {
  switch (priority) {
    case PRIORITY_HIGH:
      return "🔴 HIGH";
    case PRIORITY_MEDIUM:
      return "🟠 MED";
    case PRIORITY_LOW:
      return "🟢 LOW";
    default:
      return "???";
  }
}
