/**
 * TodoList component - renders list of todos
 * Following CQ-4.01: Single responsibility per component
 * Following CQ-4.11: No inline functions in hot loops (using callbacks properly)
 */

import TodoItem from "./TodoItem";

function TodoList({ todos, onToggleTodo, onDeleteTodo }) {
  if (todos.length === 0) {
    return <p className="empty-message">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggleTodo}
          onDelete={onDeleteTodo}
        />
      ))}
    </ul>
  );
}

export default TodoList;
