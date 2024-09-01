import React from 'react';

interface ApproachProps {
  formData: {
    skillLevel: string;
    hoursPerDay: string;
    learningStyle: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

const Approach: React.FC<ApproachProps> = ({ formData, handleChange, handlePrevious, handleNext }) => {
  return (
    <div className="bg-bgsecondary p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Your Learning Approach
      </h2>

      <div className="mb-5 text-left">
        <label htmlFor="skillLevel" className="block text-sm mb-2 text-gray-400">
          Current Skill Level:
        </label>
        <select
          id="skillLevel"
          name="skillLevel"
          value={formData.skillLevel}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        >
          <option value="" className="text-gray-500">Select your skill level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="mb-5 text-left">
        <label htmlFor="hoursPerDay" className="block text-sm mb-2 text-gray-400">
          Hours you can dedicate per day:
        </label>
        <input
          type="number"
          id="hoursPerDay"
          name="hoursPerDay"
          min="0"
          max="24"
          value={formData.hoursPerDay}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>

      <div className="mb-5 text-left">
        <label htmlFor="learningStyle" className="block text-sm mb-2 text-gray-400">
          Preferred Learning Style:
        </label>
        <select
          id="learningStyle"
          name="learningStyle"
          value={formData.learningStyle}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        >
          <option value="" className="text-gray-500">Select your learning style</option>
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="reading">Reading/Writing</option>
          <option value="kinesthetic">Kinesthetic (hands-on)</option>
        </select>
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

export default Approach;
