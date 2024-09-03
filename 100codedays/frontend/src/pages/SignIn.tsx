import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa'; // Import the Google icon
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      login();
      navigate('/');
    } catch (err) {
      setError('Failed to sign in');
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked');
    // Add your Google sign-in logic here
  };

  return (
    <div className="sign-in -container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div>
        <div className="  bg-bgsecondary p-10 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Sign In
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="text-left">
          <label htmlFor="email-address" className="block text-sm mb-2 text-gray-400">Email:</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="text-left">
          <label htmlFor="password" className="block text-sm mb-2 text-gray-400">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full p-3 border-2 border-gray-800 rounded-lg bg-gray-800 text-white text-lg transition duration-300 focus:outline-none focus:border-blue-500 focus:shadow-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-xs italic">{error}</p>}

        <div className="flex flex-col space-y-3 mt-5">
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
          >
            Sign In
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-1/2 p-3 text-white rounded-lg text-md font-medium shadow-lg flex items-center justify-center transition duration-300 hover:bg-green-600"
            >
              <FaGoogle className="mr-2" /> Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-1/2 p-3 text-white rounded-lg text-md font-medium shadow-lg transition duration-300 hover:bg-blue-600"
            >
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
      </div>
    </div>
  );
};

export default SignIn;
