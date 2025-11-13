/**
 * Custom hook for filtering todos
 * Following CQ-5.03: Derived state in selectors
 */

import { useMemo } from "react";
import {
  FILTER_ALL,
  FILTER_ACTIVE,
  FILTER_COMPLETED,
} from "../constants/priorities";

export function useFilteredTodos(todos, filter) {
  /**
   * Compute filtered todos - don't store derived state
   * Following CQ-5.03: Derived state in selectors
   */
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case FILTER_ACTIVE:
        return todos.filter((todo) => !todo.completed);
      case FILTER_COMPLETED:
        return todos.filter((todo) => todo.completed);
      case FILTER_ALL:
      default:
        return todos;
    }
  }, [todos, filter]);

  /**
   * Count of remaining (active) todos
   */
  const remainingCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  return {
    filteredTodos,
    remainingCount,
  };
}
