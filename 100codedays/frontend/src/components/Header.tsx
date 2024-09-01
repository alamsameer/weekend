import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [quote, setQuote] = useState('');

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

  return (
    <header className="flex justify-between items-center p-5">
      <div className="font-bold font-orbitron text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
        100codedays
      </div>
      <div className="max-w-1/2 font-bold text-right  text-white">
        <p className="italic">{quote}</p>
      </div>
    </header>
  );
};

export default Header;
