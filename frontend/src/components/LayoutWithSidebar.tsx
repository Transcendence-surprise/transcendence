import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./UI/Sidebar";
import { useIsViewportLockedPage } from "../hooks/useIsViewportLockedPage";

export default function LayoutWithSidebar() {
  const { pathname } = useLocation();
  const isViewportLockedPage = useIsViewportLockedPage();
  const pageContentClassName = "mx-auto w-full max-w-6xl";
  const isGamePage = pathname.startsWith("/game");
  const defaultPageShellClassName =
    `${pageContentClassName} flex min-h-[60vh] flex-col rounded-xl border border-[var(--color-border-subtle)] bg-bg-modal p-4`;

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
            ? "flex flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-bg-dark p-4 text-blue-hero"
            : "flex-1 min-w-0 bg-bg-dark p-6 text-blue-hero"
        }
      >
        {isGamePage ? (
          <div className={`${pageContentClassName} flex h-full min-h-0 flex-col`}>
            <Outlet />
          </div>
        ) : (
          <div className={defaultPageShellClassName}>
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
