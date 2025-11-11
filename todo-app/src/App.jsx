import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputValue, completed: false },
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
        <h1>My Todo App with AI Review</h1>

        <div className="input-section">
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
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
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
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))
          )}
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
