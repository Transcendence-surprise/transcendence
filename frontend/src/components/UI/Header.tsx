import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import logoBolt from "/logo-bolt.svg";
import GameStatusDot from "../game/GameStatusDot";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 border-b border-gray-600">
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
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <GameStatusDot user={user ? { id: user.id?.toString() } : null} />
                  </div>
                  <Link
                    to="/profile"
                    className="py-1.5 text-base text-cyan-bright font-semibold hover:underline"
                  >
                    {user?.username ?? "Guest"}
                  </Link>
                

                </div>

                <button
                  onClick={logout}
                  aria-label="Logout"
                  className="ml-3 p-2 rounded-lg transition-all hover:scale-105"
                >
                  <LuLogOut className="text-color-magenta w-6 h-6" />
                </button>
              </div>
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
