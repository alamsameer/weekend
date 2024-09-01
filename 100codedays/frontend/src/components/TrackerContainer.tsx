import React from 'react';
import Tracker from './Tracker.tsx'

const TrackerContainer: React.FC = () => {
  return (
    <div className='flex gap-2 flex-wrap p-2 m-3 md:m-0 md:p-7 shadow-container bg-bgsecondary shadow-lg rounded-lg'>
      {[...Array(100)].map((_, index) => (
        <Tracker
          key={index}
          tasksCompleted={Math.floor(Math.random() * 10)}
          effortHours={Math.floor(Math.random() * 10)}
          effortValue={Math.floor(Math.random() * 10)}
        />
      ))}
    </div> 
  );
};

export default TrackerContainer;
