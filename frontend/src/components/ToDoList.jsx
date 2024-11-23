import { useState, useEffect } from "react";
import { Check, X, Plus } from "lucide-react"; // Icons for interaction

const ToDoList = () => {
  const [tasks, setTasks] = useState([]); // List of tasks
  const [newTask, setNewTask] = useState(""); // New task input

  // Load tasks from localStorage when component mounts
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks)); // Parse and set the tasks from localStorage
    }
  }, []);

  // Save tasks to localStorage whenever the tasks state changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks)); // Save tasks as a JSON string
    }
  }, [tasks]);

  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return; // Avoid adding empty tasks
    const newTaskObject = { text: newTask, completed: false };
    setTasks([...tasks, newTaskObject]);
    setNewTask(""); // Clear the input field
  };

  // Toggle task completion
  const toggleTaskCompletion = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks); // Update tasks state
  };

  // Delete a task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks); // Update tasks state
  };

  return (
    <div className="p-4 w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">To-Do List</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a new task"
            className="input input-bordered w-full"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addTask}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              className={`btn btn-circle ${
                task.completed ? "btn-success" : "btn-secondary"
              }`}
              onClick={() => toggleTaskCompletion(index)}
            >
              {task.completed ? <Check size={18} /> : <X size={18} />}
            </button>
            <span
              className={`flex-1 ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.text}
            </span>
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => deleteTask(index)}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToDoList;
