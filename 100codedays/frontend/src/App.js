import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import SignUp from './pages/SignUp.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/middleware/ProtectedRoute.tsx';
import SignIn from './pages/SignIn.tsx';

const App = () => {
  return (
    <AuthProvider>
      <div className="bg-bgprimary min-h-screen">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
