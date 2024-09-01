import React from 'react';

interface FunFactsProps {
  formData: {
    funFact: string;
    favLanguage: string;
    superpower: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

const FunFacts: React.FC<FunFactsProps> = ({ formData, handleChange, handlePrevious, handleNext }) => {
  return (
    <div className="bg-gray-900 p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-6 bg-gradient-to-r from-blue-500 to-green-500  bg-clip-text text-transparent">
        Fun Facts About You
      </h2>

      <div className="mb-6 text-left">
        <label htmlFor="funFact" className="block text-sm mb-2 text-gray-400">
          Share a fun fact about yourself:
        </label>
        <input
          type="text"
          id="funFact"
          name="funFact"
          value={formData.funFact}
          onChange={handleChange}
          required
          className="w-full p-3  border-gray-700 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-purple-500 focus:shadow-purple-500"
        />
      </div>

      <div className="mb-6 text-left">
        <label htmlFor="favLanguage" className="block text-sm mb-2 text-gray-400">
          Your favorite programming language:
        </label>
        <input
          type="text"
          id="favLanguage"
          name="favLanguage"
          value={formData.favLanguage}
          onChange={handleChange}
          required
          className="w-full p-3 border-gray-700 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-purple-500 focus:shadow-purple-500"
        />
      </div>

      <div className="mb-6 text-left">
        <label htmlFor="superpower" className="block text-sm mb-2 text-gray-400">
          If coding was a superpower, what would yours be?
        </label>
        <input
          type="text"
          id="superpower"
          name="superpower"
          value={formData.superpower}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-700 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-purple-500 focus:shadow-purple-500"
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

export default FunFacts;
