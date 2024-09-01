import React from 'react';

interface FinalQuestionsProps {
  formData: {
    additionalInfo: string;
    hearAboutUs: string;
    termsAgreed: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handlePrevious: () => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FinalQuestions: React.FC<FinalQuestionsProps> = ({ formData, handleChange, handleSubmit, handlePrevious, handleCheckboxChange }) => {
  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-10 rounded-lg max-w-lg mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-6 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Final Questions
      </h2>

      <div className="mb-6 text-left">
        <label htmlFor="additionalInfo" className="block text-sm mb-2 text-gray-400">
          Any additional information you'd like to share?
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 border-2 border-gray-700 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>

      <div className="mb-6 text-left">
        <label htmlFor="hearAboutUs" className="block text-sm mb-2 text-gray-400">
          How did you hear about us?
        </label>
        <select
          id="hearAboutUs"
          name="hearAboutUs"
          value={formData.hearAboutUs}
          onChange={handleChange}
          required
          className="w-full text-sm p-3 border-2 border-gray-700 rounded-lg bg-gray-800 text-white  transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        >
          <option value="" className="text-gray-500">Select an option</option>
          <option value="socialMedia">Social Media</option>
          <option value="friend">Friend or Colleague</option>
          <option value="search">Search Engine</option>
          <option value="advertisement">Advertisement</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-6 text-left flex items-center">
        <input
          type="checkbox"
          id="termsAgreed"
          name="termsAgreed"
          checked={formData.termsAgreed}
          onChange={handleCheckboxChange}
          required
          className="mr-2 h-5 w-5 text-blue-500 border-gray-700 bg-gray-800 rounded focus:ring-blue-500"
        />
        <label htmlFor="termsAgreed" className="text-sm text-gray-400">
          I agree to the terms and conditions
        </label>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="w-1/2 p-3 mr-2 bg-gray-800 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gray-700"
        >
          Previous
        </button>
        <button
          type="submit"
          className="w-1/2 p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default FinalQuestions;
