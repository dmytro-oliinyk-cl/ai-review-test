/**
 * FilterButton component - individual filter button
 * Following CQ-4.11: Extracted from loop to avoid recreating handlers
 * Following CQ-4.07: Memoization for performance (component rendered in list)
 */

import { memo } from "react";

function FilterButton({ filterOption, isActive, onFilterChange }) {
  const handleClick = () => {
    onFilterChange(filterOption.value);
  };

  return (
    <button
      onClick={handleClick}
      className={isActive ? "filter-btn active" : "filter-btn"}
    >
      {filterOption.label}
    </button>
  );
}

export default memo(FilterButton);
