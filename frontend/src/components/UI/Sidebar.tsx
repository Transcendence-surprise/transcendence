import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "/assets/home_icon.svg" },
    { path: "/profile", label: "Profile", icon: "/assets/profile_icon.svg" },
    { path: "/game", label: "Game", icon: "/assets/game_icon.svg" },
    { path: "/friends", label: "Friends", icon: "/assets/friends_icon.svg" },
    { path: "/chat", label: "Chat", icon: "/assets/chat_icon.svg" },
    {path: "/leaderboard", label: "Leaderboard", icon: "/assets/tournament_icon.svg" },
    { path: "/settings", label: "Settings", icon: "/assets/settings_icon.svg" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className=" w-[280px] min-h-screen bg-[background: rgba(26, 26, 31, 0.95)] border-r border-blue-600 p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              w-full h-[38px] px-4 rounded-[10px] flex items-center gap-[12px]
              transition-all duration-200 font-medium
              ${
                isActive(item.path)
                  ? "text-[#00eaff] border border-t border-cyan-200/70 border-t-cyan-200/70 bg-[linear-gradient(90deg,rgba(0,234,255,0.35)_0%,rgba(0,102,255,0.35)_100%)]"
                  : "text-gray-400 hover:text-cyan-100 hover:shadow-[0_0_12px_rgba(0,200,255,0.45)]"
              }
            `}
          >
            <img
              src={item.icon}
              alt={item.label}
              style={{
                filter: isActive(item.path)
                  ? "brightness(0) saturate(100%) invert(74%) sepia(95%) saturate(2876%) hue-rotate(160deg) brightness(101%) contrast(101%)"
                  : "brightness(0) invert(1) opacity(0.5)",
              }}
              className="w-6 h-6 transition-all duration-200"
            />
            <span>{item.label}</span>
            {isActive(item.path) && (
              <span className="ml-auto w-2 h-2 rounded-full bg-[rgba(0,234,255,1)] shadow-[0_0_8px_rgba(0,234,255,0.8)]" />
            )}
          </Link>
        ))}
      </nav>

    </aside>
  );
}
