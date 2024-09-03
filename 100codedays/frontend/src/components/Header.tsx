import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const Header: React.FC = () => {
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const quotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "It always seems impossible until it's done.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-5">
      <div className="font-bold font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-0">
        100codedays
      </div>
      <div className="flex flex-col sm:flex-row items-center">
        <div className=" hidden md:block max-w-full sm:max-w-1/2 font-bold text-center sm:text-right text-white text-sm sm:text-base mb-3 sm:mb-0 sm:mr-4">
          <p className="italic">{quote}</p>
        </div>
        <button
        onClick={handleSignOut}
        className="hidden md:block bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
      >
        Sign Out
      </button>
      </div>
    </header>
  );
};

export default Header;
