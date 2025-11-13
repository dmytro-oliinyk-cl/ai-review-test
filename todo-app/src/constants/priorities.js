/**
 * Priority constants for todo items
 * Following CQ-3.03: Real constants in UPPER_SNAKE_CASE
 */

export const PRIORITY_LOW = "low";
export const PRIORITY_MEDIUM = "medium";
export const PRIORITY_HIGH = "high";

export const PRIORITY_OPTIONS = [
  { value: PRIORITY_LOW, label: "Low", emoji: "🟢", color: "green" },
  { value: PRIORITY_MEDIUM, label: "Medium", emoji: "🟠", color: "orange" },
  { value: PRIORITY_HIGH, label: "High", emoji: "🔴", color: "red" },
];

export const FILTER_ALL = "all";
export const FILTER_ACTIVE = "active";
export const FILTER_COMPLETED = "completed";

export const FILTER_OPTIONS = [
  { value: FILTER_ALL, label: "All" },
  { value: FILTER_ACTIVE, label: "Active" },
  { value: FILTER_COMPLETED, label: "Completed" },
];
