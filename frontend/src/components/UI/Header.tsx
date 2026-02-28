import { useAuth } from "../../hooks/useAuth";

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
    <header className="p-4 border-b border-blue-600">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="../../../public/assets/logo-bolt.svg"
              alt="logo"
              className="h-8 w-8"
              style={{
                filter:
                  "drop-shadow(0 0 30px #00EAFF) drop-shadow(0 0 10px #00EAFF)",
              }}
            />
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#00EAFF] via-[#FF2EDF] to-[#00EAFF] text-transparent bg-clip-text">
              MAZE IS LAVA
            </h1>
          </div>
          <p className="text-sm text-blue-300">Backend status: {status}</p>
        </div>

        {/* ✅ ONLY THIS PART CHANGED */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="px-3 py-1.5 text-sm text-cyan-400 font-semibold">
                👻 {user.username.replace(/\d+/g, '').slice(0, 8)}
              </span>

              <button
                onClick={logout}
                className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all border border-gray-600"
              >
                Login
              </button>

              <button
                onClick={onSignupClick}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-500/30"
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
