import React, { useState } from 'react';


interface TweetProps {
  isAuthenticated: boolean;
  username?: string;
}

const Tweet: React.FC<TweetProps> = ({ isAuthenticated, username }) => {
  const [tweetContent, setTweetContent] = useState('');

  const handleTweetSubmit = () => {
    if (tweetContent.trim() !== '') {
      // Here you would typically send the tweet to your backend
      console.log(`Tweet submitted: ${tweetContent}`);
      setTweetContent('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-bgsecondary p-6 rounded-lg max-w-md mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400">
        <p className="mb-4">You need to log in to tweet.</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bgsecondary p-6 rounded-lg max-w-md mx-auto mt-12 shadow-lg font-orbitron text-gray-400">
      <h2 className="text-2xl mb-4 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Tweet
      </h2>
      <div className="mb-4">
        <textarea
          className="w-full p-2 bg-gray-800 text-white rounded-lg resize-none"
          rows={4}
          placeholder="What's happening?"
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
          maxLength={280}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">{280 - tweetContent.length} characters remaining</span>
        <button
          onClick={handleTweetSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          disabled={tweetContent.trim() === ''}
        >
          Tweet
        </button>
      </div>
    </div>
  );
};

export default Tweet;
