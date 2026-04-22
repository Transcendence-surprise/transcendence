import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type SidebarLinkProps = {
  to: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
};

export default function SidebarLink({
  to,
  label,
  icon,
  isActive,
}: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`sidebar-link relative
        w-full h-[38px] px-2 rounded-[12px] flex items-center gap-[10px]
        transition-all duration-200 font-medium
        ${
          isActive
            ? "active text-cyan-bright border border-t border-cyan-200/70 border-t-cyan-200/70 bg-[linear-gradient(90deg,rgba(0,234,255,0.35)_0%,rgba(0,102,255,0.35)_100%)]"
            : "text-gray-300 hover:text-cyan-100 hover:shadow-[0_0_12px_rgba(0,200,255,0.45)]"
        }
      `}
    >
      <span
        className={`sidebar-link-icon w-8 h-8 flex items-center justify-center transition-all duration-200 ${
          isActive ? "text-cyan-300" : "text-gray-400/70"
        }`}
      >
        {icon}
      </span>

      {/* Label: hidden when sidebar is collapsed (default). Revealed when parent .group is hovered or when aside has .expanded */}
  <span className="sidebar-link-label ml-2 transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
        {label}
      </span>

      {/* Active dot: keep hidden when collapsed, show on hover or when active */}
      {isActive && (
  <span className="sidebar-link-dot ml-auto w-2 h-2 rounded-full bg-[rgba(0,234,255,1)] shadow-[0_0_8px_rgba(0,234,255,0.8)] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-in-out" />
      )}
    </Link>
  );
}