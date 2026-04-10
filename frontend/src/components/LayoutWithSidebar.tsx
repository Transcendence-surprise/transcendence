import { Outlet } from "react-router-dom";
import Sidebar from "./UI/Sidebar";
import { useIsViewportLockedPage } from "../hooks/useIsViewportLockedPage";

export default function LayoutWithSidebar() {
  const isViewportLockedPage = useIsViewportLockedPage();

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
