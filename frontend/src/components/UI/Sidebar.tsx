import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useIsViewportLockedPage } from "../../hooks/useIsViewportLockedPage";
import { FiSettings, FiShield, FiHome, FiMessageSquare, FiUsers, FiUser } from "react-icons/fi";
import { GoTrophy, GoListUnordered } from "react-icons/go";
import { IoGameControllerOutline } from "react-icons/io5";
import SidebarLink from "../shared/SideBarLink";
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
            ? "sidebar-font w-18 h-full overflow-hidden bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4 transition-all duration-300 ease-in-out"
            : "sidebar-font w-18 min-h-screen overflow-hidden bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4 transition-all duration-300 ease-in-out"
          : isViewportLockedPage
          ? "sidebar-font group w-16 hover:w-[240px] h-full overflow-hidden hover:overflow-y-auto bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4 transition-all duration-300 ease-in-out"
          : "sidebar-font group w-16 hover:w-[240px] min-h-screen overflow-hidden hover:overflow-y-auto bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4 transition-all duration-300 ease-in-out"
      }
    >
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
    </aside>
  );
}