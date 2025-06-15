import React, { useState } from 'react';
import '../styles/MeetingSummary.css'; 

const MeetingSummary = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks(prev => [...prev, taskInput.trim()]);
      setTaskInput("");
    }
  };

  return (
    <div className="meeting-summary">
      <h2>📝 Add Task & Quick Notes</h2>

      {/* Task Section */}
      <div className="section-box">
        <h3>Add Task</h3>
        <div className="task-input-box">
          <input
            type="text"
            placeholder="Enter a task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button onClick={handleAddTask}>Add</button>
        </div>
        <ul className="task-list">
          {tasks.map((task, idx) => (
            <li key={idx}>• {task}</li>
          ))}
        </ul>
      </div>

      {/* Quick Notes Section */}
      <div className="section-box">
        <h3>Quick Notes</h3>
        <textarea
          rows="6"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default MeetingSummary;
