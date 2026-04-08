import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./UI/Sidebar";

export default function LayoutWithSidebar() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");
  const isGameEntryPage = location.pathname === "/game";
  const isViewportLockedPage = isChatPage || isGameEntryPage;

  return (
    <div
      className={
        isViewportLockedPage ? "flex h-full min-h-0 overflow-hidden" : "flex"
      }
    >
      <Sidebar />
      <main
        className={
          isViewportLockedPage
            ? "flex-1 min-h-0 overflow-hidden p-4 bg-bg-dark text-blue-hero"
            : "flex-1 p-6 bg-bg-dark text-blue-hero"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
