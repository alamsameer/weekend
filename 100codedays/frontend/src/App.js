import React from 'react';
// Import necessary components
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import SignUp from './pages/SignUp.tsx';

const App = () => {
  return (
    <div className="bg-bgprimary">
      <Routes>
        <Route path="/" element={ <Home/> } />
        <Route path="/signup" element={ <SignUp/> } />
      </Routes>
    </div>
  );
};

export default App;
