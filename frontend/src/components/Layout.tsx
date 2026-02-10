import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { checkHealth } from '../api/health';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import Header from './UI/Header';

export default function Layout() {
  const [status, setStatus] = useState('loading...');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono">
      {/* Header */}
	  <Header 
        status={status}
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
      />
      {/* Login Modal */}
      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)} 
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}
      
      {/* Signup Modal */}
      {showSignup && (
        <SignupForm 
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {/* Main content - this is where child routes will render */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-blue-600 text-center text-sm text-blue-300">
        © 2026 Transcendence Game
      </footer>
    </div>
  );
}
