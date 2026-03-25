import { useAuth } from "../../hooks/useAuth";
import logoBolt from "/logo-bolt.svg";
import GameStatusDot from "../game/GameStatusDot";

interface HeaderProps {
  status: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Header({
  status,
  onLoginClick,
  onSignupClick,
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 border-b border-[var(--color-border-blue)]">
      <div className="flex justify-between items-center">
        <a
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <img
              src={logoBolt}
              alt="logo"
              className="h-8 w-8"
              style={{
                filter:
                  "drop-shadow(0 0 30px #00EAFF) drop-shadow(0 0 10px #00EAFF)",
              }}
            />
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-bright via-magenta to-cyan-bright bg-clip-text text-transparent">
              MAZE IS LAVA
            </h1>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <p className="text-sm text-light-cyan">Backend status: {status}</p>
          <GameStatusDot user={user ? { id: user.id?.toString() } : null} />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="px-3 py-1.5 text-sm text-cyan-bright font-semibold">
                👻 {user?.username ?? "Guest"}
              </span>

              <button
                onClick={logout}
                className="px-4 py-1.5 text-sm bg-magenta hover:bg-pink-400 text-white border border-pink-300/40 font-medium rounded-lg transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-1.5 text-sm bg-button-gray hover:bg-gray-700 text-white font-medium rounded-lg transition-all border border-gray-600"
              >
                Login
              </button>

              <button
                onClick={onSignupClick}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-cyan-bright to-blue-hero hover:from-cyan-bright hover:to-blue-hero text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-500/30"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
