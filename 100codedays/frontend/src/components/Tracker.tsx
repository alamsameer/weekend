import React, { useState } from 'react';

interface TrackerProps {
  tasksCompleted: number;
  effortHours: number;
  effortValue: number;
  streakBrokenDays: number;
}

const Tracker: React.FC<TrackerProps> = ({ tasksCompleted, effortHours, effortValue, streakBrokenDays }) => {
  const [isHovered, setIsHovered] = useState(false);

  const calculateBackgroundColor = () => {
    const totalEffort = tasksCompleted + effortHours + effortValue;
    if (totalEffort > 0) {
      const intensity = Math.min(255, totalEffort * 5); // Adjust the multiplier as needed
      return `rgb(0, 0, ${intensity})`;
    }
    return streakBrokenDays === 1 ? '#FF442A' : '#CCCCCC';
  };

  return (
    <div
      className="tracker p-2 rounded-lg shadow-lg "
      style={{ backgroundColor: calculateBackgroundColor(), width: '32px', height: '32px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute mt-4 bg-gray-900 p-2 rounded-lg shadow-lg text-center text-gray-400">
          <p>Tasks Completed: {tasksCompleted}</p>
          <p>Effort Hours: {effortHours}</p>
          <p>Effort Value: {effortValue}</p>
          <p>Streak Broken Days: {streakBrokenDays}</p>
        </div>
      )}
    </div>
  );
};

export default Tracker;
