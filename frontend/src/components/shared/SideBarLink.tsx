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
      className={`
        w-full h-[38px] px-4 rounded-[10px] flex items-center gap-[12px]
        transition-all duration-200 font-medium
        ${
          isActive
            ? "text-cyan-bright border border-t border-cyan-200/70 border-t-cyan-200/70 bg-[linear-gradient(90deg,rgba(0,234,255,0.35)_0%,rgba(0,102,255,0.35)_100%)]"
            : "text-gray-400 hover:text-cyan-100 hover:shadow-[0_0_12px_rgba(0,200,255,0.45)]"
        }
      `}
    >
      <span
        className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
          isActive ? "text-cyan-300" : "text-gray-400/70"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>

      {isActive && (
        <span className="ml-auto w-2 h-2 rounded-full bg-[rgba(0,234,255,1)] shadow-[0_0_8px_rgba(0,234,255,0.8)]" />
      )}
    </Link>
  );
}