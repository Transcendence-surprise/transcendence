import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { checkHealth } from '../api/health';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import Header from './UI/Header';
import Footer from './UI/Footer';

export default function Layout() {
  const [status, setStatus] = useState('loading...');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, login, signup, logout } = useAuth();

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
          login={login}
        />
      )}
      
      {/* Signup Modal */}
      {showSignup && (
        <SignupForm 
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
          signup={signup}
        />
      )}
      {/* Main content - this is where child routes will render */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
