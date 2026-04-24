import { useLocation } from "react-router-dom";

export function isViewportLockedPathname(pathname: string) {
  // Lock viewport for chat and any /game routes (including /game/:id)
  return pathname.startsWith("/chat") || pathname.startsWith("/game");
}

export function useIsViewportLockedPage() {
  const { pathname } = useLocation();
  return isViewportLockedPathname(pathname);
}
