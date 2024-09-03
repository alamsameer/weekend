import React from 'react';
import { FaGoogle } from 'react-icons/fa'; // Import the Google icon
import { useNavigate } from 'react-router-dom';


interface BasicInfoProps {
  formData: {
    name: string;
    email: string;
    password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
}


const BasicInfo: React.FC<BasicInfoProps> = ({ formData, handleChange, handleNext }) => {
  const navigate = useNavigate();

  const handleGoogleSignUp = () => {
    // Add your Google signup logic here
    console.log('Google signup clicked');
  };

  const handleSignIn = () => {
    // Add your SignIn logic here
    console.log('Sign in clicked');
  };

  return (
    <div className="bg-bgsecondary p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Basic Information
      </h2>
      <div className="mb-5 text-left">
        <label htmlFor="name" className="block text-sm mb-2 text-gray-400">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>
      <div className="mb-5 text-left">
        <label htmlFor="email" className="block text-sm mb-2 text-gray-400">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>
      <div className="mb-5 text-left">
        <label htmlFor="password" className="block text-sm mb-2 text-gray-400">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
        />
      </div>
      <div className="flex flex-col space-y-3 mt-5">
        <button
          type="button"
          onClick={handleNext}
          className="w-full p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
        >
          Next
        </button>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-1/2 p-3 text-white rounded-lg text-md font-medium shadow-lg flex items-center justify-center transition duration-300 hover:bg-green-600"
          >
            <FaGoogle className="mr-2" /> Sign up with Google
          </button>
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="w-1/2 p-3 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
