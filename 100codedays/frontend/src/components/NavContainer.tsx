import React, { useState } from 'react';
import Tasks from './navcontainer/Tasks.tsx';
import Challenges from './navcontainer/Challenges.tsx';
import Technologies from './navcontainer/Technologies.tsx';
import Tweet from './navcontainer/Tweet.tsx';
import { useAppSelector } from '../store/hooks.ts';

const NavContainer: React.FC = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const [activeTab, setActiveTab] = useState<string>('tasks');

    const renderContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <Tasks />;
            case 'challenges':
                return <Challenges />;
            case 'technologies':
                return <Technologies />;
            case 'tweet':
                return <Tweet isAuthenticated={isAuthenticated} />;
            default:
                return <Tasks />;
        }
    };

    return (
        <div className="nav-container mt-4 md:mt-8 ">
            <nav className="border-b-2 border-white">
                <ul className="flex justify-around">
                    <li>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`font-orbitron text-white hover:text-gray-200 ${activeTab === 'tasks' ? 'font-bold' : ''}`}
                        >
                            Tasks
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`font-orbitron text-white hover:text-gray-200 ${activeTab === 'challenges' ? 'font-bold' : ''}`}
                        >
                            Challenges
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('technologies')}
                            className={`font-orbitron text-white hover:text-gray-200 ${activeTab === 'technologies' ? 'font-bold' : ''}`}
                        >
                            Technologies
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('tweet')}
                            className={`font-orbitron text-white hover:text-gray-200 ${activeTab === 'tweet' ? 'font-bold' : ''}`}
                        >
                            Tweet
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
};

export default NavContainer;