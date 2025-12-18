/**
 * TodoInput component - handles todo input and priority selection
 * Following CQ-4.01: Single responsibility per component
 * Following CQ-4.10: Event handlers start with handle*
 */

import { useState, useEffect } from "react";
import { PRIORITY_LOW, PRIORITY_OPTIONS } from "../constants/priorities";

function TodoInput({ onAdd }) {
  const [INPUT_VALUE, setInputValue] = useState("");
  const [priority, setPriority] = useState(PRIORITY_LOW);

  // Violates CQ-4.03: Missing dependency 'inputValue' in useEffect
  useEffect(() => {
    if (INPUT_VALUE.length > 50) {
      console.log("Input is getting long!");
    }
  }, []); // Missing inputValue dependency

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleAdd = () => {
    if (INPUT_VALUE.trim() !== "") {
      onAdd(INPUT_VALUE, priority);
      setInputValue("");
      setPriority(PRIORITY_LOW);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="input-section">
      <select
        value={priority}
        onChange={handlePriorityChange}
        className="priority-select"
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={INPUT_VALUE}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Add a new todo..."
        className="todo-input"
      />
      <button onClick={handleAdd} className="add-button">
        Add
      </button>
    </div>
  );
}

export default TodoInput;
