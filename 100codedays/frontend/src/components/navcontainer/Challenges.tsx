import React, { useState } from 'react';

interface Challenge {
  id: string;
  name: string;
  duration: string;
  description: string;
  logo: string;
}

const Challenges: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const challenges: Challenge[] = [
    { id: '30js', name: '30 Days of JavaScript', duration: '30 days', description: 'Improve your JavaScript skills with daily coding challenges.', logo: '🟨' },
    { id: '30css', name: '30 Days of CSS', duration: '30 days', description: 'Enhance your CSS mastery through daily styling exercises.', logo: '🎨' },
    { id: '10proj', name: '10 Projects in 10 Days', duration: '10 days', description: 'Build a new project every day for 10 days to boost your portfolio.', logo: '🏗️' },
    { id: '100algo', name: '100 Algorithms Challenge', duration: '100 days', description: 'Solve one algorithm problem daily for 100 days.', logo: '🧮' },
    { id: '50react', name: '50 Days of React', duration: '50 days', description: 'Master React.js by building components and projects for 50 days.', logo: '⚛️' },
    { id: '60python', name: '60 Days of Python', duration: '60 days', description: 'Dive deep into Python with daily coding exercises for 60 days.', logo: '🐍' },
  ];

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto mt-8 shadow-lg font-orbitron text-gray-400">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Coding Challenges
      </h2>
      <p className="mb-4 text-center text-sm">Select a challenge to embark on your coding journey. You can only choose one at a time.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedChallenge === challenge.id
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            } ${selectedChallenge && selectedChallenge !== challenge.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !selectedChallenge && handleChallengeSelect(challenge.id)}
          >
            <div className="flex items-center mb-2">
              <span className="text-4xl mr-3">{challenge.logo}</span>
              <h3 className="text-lg font-semibold">{challenge.name}</h3>
            </div>
            <p className="text-sm mb-2">Duration: {challenge.duration}</p>
            <p className="text-sm">{challenge.description}</p>
          </div>
        ))}
      </div>
      {selectedChallenge && (
        <div className="mt-6 text-center">
          <p className="mb-4">You've selected: {challenges.find(c => c.id === selectedChallenge)?.name}</p>
          <button
            onClick={() => setSelectedChallenge(null)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Reset Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Challenges;

