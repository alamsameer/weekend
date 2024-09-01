import React from 'react';

interface GoalsProps {
  formData: {
    goal: string;
    motivation: string;
    challenges: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

const Goals: React.FC<GoalsProps> = ({ formData, handleChange, handlePrevious, handleNext }) => {
  return (
    <div className="bg-bgsecondary p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Your Coding Goals
      </h2>

      <div className="mb-5 text-left">
        <label htmlFor="goal" className="block text-sm mb-2 text-gray-400">
          What's your main coding goal for the next 100 days?
        </label>
        <input
          type="text"
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>

      <div className="mb-5 text-left">
        <label htmlFor="motivation" className="block text-sm mb-2 text-gray-400">
          What motivates you to achieve this goal?
        </label>
        <textarea
          id="motivation"
          name="motivation"
          value={formData.motivation}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
          rows={4}
        />
      </div>

      <div className="mb-5 text-left">
        <label htmlFor="challenges" className="block text-sm mb-2 text-gray-400">
          What challenges do you anticipate?
        </label>
        <textarea
          id="challenges"
          name="challenges"
          value={formData.challenges}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
          rows={4}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="w-1/2 p-3 mr-2 bg-gray-800 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="w-1/2 p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Goals;
