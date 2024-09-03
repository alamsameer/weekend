import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks.ts';
import Header from '../components/Header.tsx';
import TrackerContainer from '../components/TrackerContainer.tsx';
import NavContainer from '../components/NavContainer.tsx';
import Leaderboard from '../components/Leaderboard.tsx';
import EffortLogger from '../components/EffortLogger.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const Home: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signup');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      logout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <div className="home-container flex flex-col min-h-screen">
      <Header />
      <div className="content-container flex flex-1 relative">
        <div className="left-column w-full md:w-[70%] flex flex-col p-4">
          <TrackerContainer />
          <NavContainer />
        </div>
        <div className={`right-column fixed top-0 right-0 h-full w-full md:w-[30%] bg-bgprimary transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 flex flex-col p-4 z-10 overflow-y-auto`}>
          <button 
            className="md:hidden absolute top-4 left-4 z-20"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? 'Close' : 'Open'} Sidebar
          </button>
          <div className="mt-16 md:mt-0">
            <Leaderboard />
          </div>
          <div className="mt-4">
            <EffortLogger />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSignOut}
              className="md:hidden mt-4 max-w-32 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition duration-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
        <button 
          className="fixed bottom-4 right-4 md:hidden bg-blue-500 p-2 rounded-full shadow-lg z-20"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>
    </div>
  );
};

export default Home;
