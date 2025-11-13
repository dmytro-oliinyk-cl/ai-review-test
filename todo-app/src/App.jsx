/**
 * Main App component
 * Following CQ-4.01: Single responsibility per component
 * Following CQ-4.09: Avoid heavy components (now < 200 lines)
 * Following CQ-3.08: No abbreviations (using full names)
 */

import { useState } from "react";
import "./App.css";
import { useTodos } from "./hooks/useTodos";
import { useFilteredTodos } from "./hooks/useFilteredTodos";
import { FILTER_ALL } from "./constants/priorities";
import FilterButtons from "./components/FilterButtons";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import TodoFooter from "./components/TodoFooter";

function App() {
  // State management using custom hooks
  // Following CQ-4.02: Custom hooks for shared logic
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  // Filter state - not abbreviated
  // Following CQ-3.08: Avoid abbreviations
  const [filter, setFilter] = useState(FILTER_ALL);

  // Derived state using custom hook
  // Following CQ-5.03: Derived state in selectors
  const { filteredTodos, remainingCount } = useFilteredTodos(todos, filter);

  return (
    <div className="app">
      <div className="todo-container">
        <h1>My Todo App with AI Review</h1>

        <FilterButtons currentFilter={filter} onFilterChange={setFilter} />

        <TodoInput onAdd={addTodo} />

        <TodoList
          todos={filteredTodos}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
        />

        <TodoFooter remainingCount={remainingCount} totalCount={todos.length} />
      </div>
    </div>
  );
}

export default App;
