import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface Props {
  onClose: () => void;
  onContinueAsGuest: (nickname: string) => Promise<any>;
}

export default function GuestOrAuthModal({
  onClose,
  onContinueAsGuest,
}: Props) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [nickname, setNickname] = useState("");

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl bg-black text-white font-mono border border-[#FFFFFF1A] rounded-xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Choose How to Play
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="p-6 bg-[#1A1A1F99] rounded-lg border border-[#FFFFFF1A] text-left">
            <h3 className="text-xl font-bold">Continue as Guest</h3>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="mt-4 w-full px-4 py-2.5 rounded-lg bg-black/40 text-white border border-[#FFFFFF1A] focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={async () => {
                if (!nickname.trim()) return;
                await onContinueAsGuest(nickname.trim());
                onClose();
              }}
              className="mt-5 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              Continue as Guest
            </button>
          </section>

          <section className="p-6 bg-[#1A1A1F99] rounded-lg border border-[#FFFFFF1A] text-left">
            <h3 className="text-xl font-bold">Use an Account</h3>

            <div className="mt-4 space-y-3">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full py-3 px-6 rounded-lg font-medium bg-[#2A2A3199] border border-[#FFFFFF1A] hover:shadow-[0_8px_20px_rgba(0,234,255,0.25)] hover:border-cyan-200 transition-all"
              >
                Login
              </button>

              <button
                onClick={() => setShowSignup(true)}
                className="w-full py-3 px-6 rounded-lg font-medium bg-[#2A2A3199] border border-[#FFFFFF1A] hover:shadow-[0_8px_20px_rgba(0,234,255,0.25)] hover:border-cyan-200 transition-all"
              >
                Sign Up
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
