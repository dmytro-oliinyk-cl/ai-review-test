/**
 * TodoItem component
 * Following CQ-4.01: Single responsibility per component
 * Following CQ-4.08: No business logic in JSX
 */

import { getPriorityBorderStyle, getPriorityBadgeText } from "../utils/priorityHelpers";

function TodoItem({ todo, onToggle, onDelete }) {
  /**
   * Compute styles outside JSX
   * Following CQ-4.08: No business logic in JSX
   */
  const borderStyle = getPriorityBorderStyle(todo.priority);
  const priorityBadge = getPriorityBadgeText(todo.priority);

  /**
   * Event handlers
   * Following CQ-4.10: Consistent event handlers starting with handle*
   */
  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <li
      className={`todo-item ${todo.completed ? "completed" : ""}`}
      style={borderStyle}
    >
      <div className="todo-content" onClick={handleToggle}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="checkbox"
        />
        <span className="todo-text">{todo.text}</span>
        <span className="priority-badge">{priorityBadge}</span>
      </div>
      <button onClick={handleDelete} className="delete-button">
        Delete
      </button>
    </li>
  );
}

export default TodoItem;
