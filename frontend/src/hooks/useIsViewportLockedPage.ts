import { useLocation } from "react-router-dom";

export function isViewportLockedPathname(pathname: string) {
  return pathname.startsWith("/chat") || pathname === "/game";
}

export function useIsViewportLockedPage() {
  const { pathname } = useLocation();
  return isViewportLockedPathname(pathname);
}
