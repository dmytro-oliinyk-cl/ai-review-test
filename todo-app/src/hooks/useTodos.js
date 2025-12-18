/**
 * Custom hook for managing todo state and operations
 * Following CQ-4.02: Custom hooks for shared logic
 * Following CQ-5.01: Local state first
 */

import { useState, useCallback } from "react";

export function useTodos() {
  const [todos, setTodos] = useState([]);

  /**
   * Add a new todo
   * Following CQ-5.05: Keep state immutable
   */
  const addTodo = useCallback((text, priority) => {
    if (text.trim() === "") {
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      priority,
    };

    setTodos((prevTodos) => [...prevTodos, newTodo]);
  }, []);

  /**
   * Toggle todo completion status
   * Following CQ-5.05: Keep state immutable
   */
  const toggleTodo = useCallback((id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  /**
   * Delete a todo
   * Following CQ-5.05: Keep state immutable
   */
  const deleteTodo = useCallback((id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
