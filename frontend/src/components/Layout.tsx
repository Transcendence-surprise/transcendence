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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      
      {/* Signup Modal */}
      {showSignup && <SignupForm onClose={() => setShowSignup(false)} />}

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
