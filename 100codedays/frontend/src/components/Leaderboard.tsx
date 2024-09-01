import React from 'react';

const Leaderboard: React.FC = () => {
  const users = [
    { name: 'Alice', emoji: '👩‍💻' },
    { name: 'Bob', emoji: '👨‍💻' },
    { name: 'Charlie', emoji: '🧑‍💻' },
    { name: 'Diana', emoji: '👩‍🔬' },
    { name: 'Ethan', emoji: '👨‍🚀' },
    { name: 'Fiona', emoji: '👩‍🏫' },
    { name: 'George', emoji: '👨‍🍳' },
    { name: 'Hannah', emoji: '👩‍🎨' },
    { name: 'Ian', emoji: '👨‍🔧' },
    { name: 'Julia', emoji: '👩‍⚕️' },
  ];

  return (
    <div className="leaderboard bg-bgsecondary shadow-lg rounded-lg p-8 font-orbitron text-gray-400 animate-fadeIn">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Leaderboard
      </h2>
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        <ul className="space-y-4">
          {users.map((user, index) => (
            <li key={index} className="flex items-center">
              <span className="text-4xl mr-4">{user.emoji}</span>
              <span className="text-lg text-gray-200">{user.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
