import React, { useState } from 'react';

interface Task {
  id: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Complete project proposal', status: 'In Progress' },
    { id: 2, title: 'Review code changes', status: 'Pending' },
    { id: 3, title: 'Update documentation', status: 'Completed' },
    { id: 4, title: 'Fix bug in login module', status: 'In Progress' },
    { id: 5, title: 'Prepare for team meeting', status: 'Pending' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim() !== '') {
      const newTask: Task = {
        id: tasks.length + 1,
        title: newTaskTitle.trim(),
        status: 'Pending',
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const handleStatusChange = (id: number, newStatus: Task['status']) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="p-6  shadow-lg rounded-lg font-orbitron text-gray-400 animate-fadeIn">
      <div className="flex mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter new task"
          className="flex-grow p-3 text-gray-800 rounded-lg shadow-inner bg-gray-200 mr-4 placeholder-gray-600"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center"
          aria-label="Add Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="bg-gray-800 text-gray-200 p-4 rounded-lg shadow flex justify-between items-center">
            <span className="font-semibold text-lg">{task.title}</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
              className={`ml-4 p-2 rounded-lg text-sm ${
                task.status === 'Completed' ? 'bg-green-600 text-white' :
                task.status === 'In Progress' ? 'bg-yellow-600 text-white' :
                'bg-gray-600 text-white'
              }`}
            >
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
