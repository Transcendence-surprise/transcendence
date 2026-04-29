import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useIsViewportLockedPage } from "../../hooks/useIsViewportLockedPage";
import { FiSettings, FiShield, FiHome, FiMessageSquare, FiUsers, FiUser, FiFileText, FiLock } from "react-icons/fi";
import { GoTrophy, GoListUnordered } from "react-icons/go";
import { IoGameControllerOutline } from "react-icons/io5";
import SidebarLink from "./SideBarLink";
import type { ReactNode } from "react";

type NavItem = {
  path: string;
  label: string;
  icon: ReactNode;
};

type SidebarProps = {
  forceCollapsed?: boolean;
};

export default function Sidebar({ forceCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isViewportLockedPage = useIsViewportLockedPage();

  const navItems: NavItem[] = [
    { path: "/", label: "Home", icon: <FiHome /> },
    { path: "/profile", label: "Profile", icon: <FiUser /> },
    { path: "/game", label: "Game", icon: <IoGameControllerOutline /> },
    { path: "/rules", label: "Rules", icon: <GoListUnordered /> },
    { path: "/friends", label: "Friends", icon: <FiUsers /> },
    { path: "/chat", label: "Chat", icon: <FiMessageSquare /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <GoTrophy /> },
    { path: "/settings", label: "Settings", icon: <FiSettings /> },
    ...(isAdmin
      ? [
          {
            path: "/admin",
            label: "Admin Panel",
            icon: <FiShield />,
          },
        ]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    // `group` allows children to respond to hover state on the sidebar
    <aside
      className={
        // If forceCollapsed is true, sidebar stays thin and doesn't expand on hover
        forceCollapsed
          ? isViewportLockedPage
            ? "sidebar-font h-full w-18 overflow-hidden border-r border-gray-600 bg-[background: rgba(26, 26, 31, 0.95)] p-4 transition-all duration-300 ease-in-out"
            : "sidebar-font h-full w-18 self-stretch overflow-hidden border-r border-gray-600 bg-[background: rgba(26, 26, 31, 0.95)] p-4 transition-all duration-300 ease-in-out"
          : isViewportLockedPage
          ? "sidebar-font group h-full w-16 overflow-hidden border-r border-gray-600 bg-[background: rgba(26, 26, 31, 0.95)] p-4 transition-all duration-300 ease-in-out hover:w-[240px] hover:overflow-y-auto"
          : "sidebar-font group min-h-full self-stretch w-16 overflow-hidden border-r border-gray-600 bg-[background: rgba(26, 26, 31, 0.95)] p-4 transition-all duration-300 ease-in-out hover:w-[240px] hover:overflow-y-auto"
      }
    >
      <div className="flex h-full flex-col justify-between">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <SidebarLink
                key={item.path}
                to={item.path}
                label={item.label}
                icon={item.icon} 
                isActive={isActive(item.path)}
              />
            ))}
        </nav>
        <div className="mt-4 pt-3 border-t border-gray-500 w-full">
          <div className="flex flex-col items-center">
            {/* Brand name: only visible when sidebar is expanded (group-hover) */}
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 hidden group-hover:block">
              Transcendence
            </p>

            <div className="mt-2 flex flex-col items-center gap-2 w-full">
              <Link
                to="/terms"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors w-full justify-center"
                aria-label="Terms of Service"
              >
                <FiFileText className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  Terms of Service
                </span>
              </Link>

              <Link
                to="/privacy"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors w-full justify-center"
                aria-label="Privacy Policy"
              >
                <FiLock className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  Privacy Policy
                </span>
              </Link>

              <p className="text-xs text-gray-500 mt-2 hidden group-hover:block">© 2026</p>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
