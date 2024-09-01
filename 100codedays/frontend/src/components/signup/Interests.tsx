import React from 'react';

interface InterestsProps {
  formData: any;
  handleMultiSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectInterest: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

const Interests: React.FC<InterestsProps> = ({ formData, handleMultiSelectInterest, handleMultiSelect, handlePrevious, handleNext }) => {
  const technologies = formData.technologies || [];
  const interests = formData.interests || [];

  return (
    <div className="bg-bgsecondary p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Interests
      </h2>

      <div className="mb-6 text-left">
        <label className="block text-sm mb-2 text-gray-400" htmlFor="interests">
          Interests:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['Interest 1', 'Interest 2', 'Interest 3'].map((interest) => (
            <label
              key={interest}
              className={`block text-sm text-center py-2 px-3 rounded-full cursor-pointer transition-all duration-300 ${
                interests.includes(interest)
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500'
              }`}
            >
              <input
                type="checkbox"
                name="interests"
                value={interest}
                checked={interests.includes(interest)}
                onChange={handleMultiSelectInterest}
                className="hidden"
              />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 text-left">
        <label className="block text-sm mb-2 text-gray-400" htmlFor="technologies">
          Technologies:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['Technology 1', 'Technology 2', 'Technology 3','Technology 1', 'Technology 2', 'Technology 3','Technology 2', 'Technology 3'].map((tech) => (
            <label
              key={tech}
              className={`block text-center text-sm py-2 px-3 rounded-full cursor-pointer transition-all duration-300 ${
                technologies.includes(tech)
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500'
              }`}
            >
              <input
                type="checkbox"
                name="technologies"
                value={tech}
                checked={technologies.includes(tech)}
                onChange={handleMultiSelect}
                className="hidden"
              />
              {tech}
            </label>
          ))}
        </div>
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

export default Interests;
