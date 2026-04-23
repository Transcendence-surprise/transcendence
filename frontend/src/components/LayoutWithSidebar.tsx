import { Outlet } from "react-router-dom";
import Sidebar from "./UI/Sidebar";
import { useIsViewportLockedPage } from "../hooks/useIsViewportLockedPage";

export default function LayoutWithSidebar() {
  const isViewportLockedPage = useIsViewportLockedPage();

  return (
    <div
      className={
        isViewportLockedPage
          ? "flex h-full min-h-0 overflow-hidden"
          : "flex min-h-full flex-1"
      }
    >
      <Sidebar />
      <main
        className={
          isViewportLockedPage
            ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-bg-dark p-4 text-blue-hero"
            : "flex-1 min-w-0 bg-bg-dark p-6 text-blue-hero"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
