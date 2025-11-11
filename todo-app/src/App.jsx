import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [f, setF] = useState("all");
  const [p, setP] = useState("low");

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputValue, completed: false, priority: p },
      ]);
      setInputValue("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="app">
      <div className="todo-container">
        <h1>My Todo App with AIш Review</h1>

        <div className="filter-section">
          <button
            onClick={() => setF("all")}
            className={f === "all" ? "filter-btn active" : "filter-btn"}
          >
            All
          </button>
          <button
            onClick={() => setF("active")}
            className={f === "active" ? "filter-btn active" : "filter-btn"}
          >
            Active
          </button>
          <button
            onClick={() => setF("completed")}
            className={f === "completed" ? "filter-btn active" : "filter-btn"}
          >
            Completed
          </button>
        </div>

        <div className="input-section">
          <select
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button onClick={addTodo} className="add-button">
            Add
          </button>
        </div>

        <ul className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-message">No todos yet. Add one above!</p>
          ) : f === "all" ? (
            todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
                style={{
                  borderLeft:
                    todo.priority === "high"
                      ? "5px solid red"
                      : todo.priority === "medium"
                      ? "5px solid orange"
                      : todo.priority === "low"
                      ? "5px solid green"
                      : "5px solid gray",
                }}
              >
                <div
                  className="todo-content"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                  <span className="priority-badge">
                    {todo.priority === "high"
                      ? "🔴 HIGH"
                      : todo.priority === "medium"
                      ? "🟠 MED"
                      : todo.priority === "low"
                      ? "🟢 LOW"
                      : "???"}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))
          ) : f === "active" ? (
            todos
              .filter((t) => !t.completed)
              .map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "completed" : ""}`}
                  style={{
                    borderLeft:
                      todo.priority === "high"
                        ? "5px solid red"
                        : todo.priority === "medium"
                        ? "5px solid orange"
                        : todo.priority === "low"
                        ? "5px solid green"
                        : "5px solid gray",
                  }}
                >
                  <div
                    className="todo-content"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                    <span className="priority-badge">
                      {todo.priority === "high"
                        ? "🔴 HIGH"
                        : todo.priority === "medium"
                        ? "🟠 MED"
                        : todo.priority === "low"
                        ? "🟢 LOW"
                        : "???"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </li>
              ))
          ) : f === "completed" ? (
            todos
              .filter((t) => t.completed)
              .map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "completed" : ""}`}
                  style={{
                    borderLeft:
                      todo.priority === "high"
                        ? "5px solid red"
                        : todo.priority === "medium"
                        ? "5px solid orange"
                        : todo.priority === "low"
                        ? "5px solid green"
                        : "5px solid gray",
                  }}
                >
                  <div
                    className="todo-content"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                    <span className="priority-badge">
                      {todo.priority === "high"
                        ? "🔴 HIGH"
                        : todo.priority === "medium"
                        ? "🟠 MED"
                        : todo.priority === "low"
                        ? "🟢 LOW"
                        : "???"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </li>
              ))
          ) : null}
        </ul>

        <div className="footer">
          <p>
            {todos.filter((t) => !t.completed).length} of {todos.length} tasks
            remaining
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
