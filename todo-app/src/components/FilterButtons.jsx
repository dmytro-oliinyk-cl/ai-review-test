/**
 * FilterButtons component
 * Following CQ-4.01: Single responsibility per component
 * Following CQ-4.11: No inline functions in hot loops
 */

import { FILTER_OPTIONS } from "../constants/priorities";
import FilterButton from "./FilterButton";

function FilterButtons({ currentFilter, onFilterChange }) {
  return (
    <div className="filter-section">
      {FILTER_OPTIONS.map((filterOption) => (
        <FilterButton
          key={filterOption.value}
          filterOption={filterOption}
          isActive={currentFilter === filterOption.value}
          onFilterChange={onFilterChange}
        />
      ))}
    </div>
  );
}

export default FilterButtons;
