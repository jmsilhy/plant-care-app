import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import PlantManager from './PlantManager';
import LandingPage from './components/LandingPage';
import { AuthModal } from './components/AuthModal';

function App() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app with your existing styling
  if (user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/images/BGportphoto.png')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.1)" // Slight oversizing to eliminate gaps
          }}
        />
        
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-60"></div>
        
        {/* Your content */}
        <div className="relative z-10">
          <PlantManager />
        </div>
      </div>
    );
  }

  // If user is not authenticated, show landing page
  const handleGetStarted = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="App">
      <LandingPage 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
      />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
        initialMode={authMode}
        signIn={signIn}
        signUp={signUp}
        resetPassword={resetPassword}
        user={user}
      />
    </div>
  );
}

export default App;