/**
 * FilterButtons component
 * Following CQ-4.01: Single responsibility per component
 */

import { FILTER_OPTIONS } from "../constants/priorities";

function FilterButtons({ currentFilter, onFilterChange }) {
  return (
    <div className="filter-section">
      {FILTER_OPTIONS.map((filterOption) => {
        const isActive = currentFilter === filterOption.value;

        const handleClick = () => {
          onFilterChange(filterOption.value);
        };

        return (
          <button
            key={filterOption.value}
            onClick={handleClick}
            className={isActive ? "filter-btn active" : "filter-btn"}
          >
            {filterOption.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterButtons;
