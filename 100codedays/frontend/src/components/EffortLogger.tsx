import React, { useState } from 'react';

const EffortLogger: React.FC = () => {
  const [effort, setEffort] = useState<number>(5);
  const [hours, setHours] = useState<number>(0);

  const handleEffortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEffort(Number(e.target.value));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(Number(e.target.value));
  };

  return (
    <div className="effort-logger bg-bgsecondary my-4 shadow-lg rounded-lg p-8 text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Effort Logger
      </h2>
      
      <div className="mb-5 text-left">
        <label htmlFor="effort" className="block text-sm mb-2 text-gray-400">
          Rate your effort today (1-10):
        </label>
        <input
          type="range"
          id="effort"
          min="1"
          max="10"
          value={effort}
          onChange={handleEffortChange}
          className="w-full cursor-pointer accent-blue-500"
        />
        <div className="mt-2 text-lg text-gray-200">Effort: {effort}</div>
      </div>

      <div className="text-left">
        <label htmlFor="hours" className="block text-sm mb-2 text-gray-400">
          Hours spent coding:
        </label>
        <input
          type="range"
          id="hours"
          min="0"
          max="24"
          value={hours}
          onChange={handleHoursChange}
          className="w-full cursor-pointer accent-green-500"
        />
        <div className="mt-2 text-lg text-gray-200">Hours: {hours}</div>
      </div>
    </div>
  );
};

export default EffortLogger;
