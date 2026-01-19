import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { checkHealth } from '../api/health';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

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
      <header className="p-4 border-b border-blue-600">
        <div className="flex justify-between items-center">
           <div>
            <h1 className="text-3xl font-bold text-blue-400 drop-shadow-lg">
              Transcendence Game
            </h1>
            <p className="text-sm text-blue-300">
              Backend status: {status}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/50 rounded-full p-1 border border-gray-700">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-full transition-all border border-gray-600"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-full transition-all shadow-lg shadow-cyan-500/30"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

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
