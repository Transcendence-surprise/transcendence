import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  onClose: () => void;
  onContinueAsGuest: (nickname: string) => void;
}

export default function GuestOrAuthModal({ onClose, onContinueAsGuest }: Props) {
  const { login, signup } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [nickname, setNickname] = useState('');

  if (showLogin)
    return (
      <LoginForm
        onClose={onClose}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
    );

  if (showSignup)
    return (
      <SignupForm
        onClose={onClose}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
       />
    );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-3xl p-10 w-full max-w-md shadow-2xl text-center flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white">Choose How to Play</h2>

        {/* Nickname input for guest */}
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />

        <button
          onClick={() => {
            if (!nickname.trim()) return; // don't allow empty
            onContinueAsGuest(nickname.trim());
          }}
          className="py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium"
        >
          Play as Guest
        </button>

        <button
          onClick={() => setShowLogin(true)}
          className="py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium"
        >
          Login
        </button>

        <button
          onClick={() => setShowSignup(true)}
          className="py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium"
        >
          Sign Up
        </button>

        <button onClick={onClose} className="mt-2 text-gray-400 hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}