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

export default function Sidebar() {
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
    <aside
      className={
        isViewportLockedPage
          ? "w-[280px] h-full overflow-y-auto bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4"
          : "w-[280px] min-h-screen bg-[background: rgba(26, 26, 31, 0.95)] border-r border-gray-600 p-4"
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