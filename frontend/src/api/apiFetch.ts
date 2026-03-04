import { User } from "./authentification";

/**
 * We store current user in memory manually
 * because apiFetch cannot use React hooks.
 */

let currentUser: User | null = null;

export function setApiUser(user: User | null) {
  currentUser = user;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Guest user → attach custom headers
  if (currentUser?.roles.includes("guest")) {
    headers["X-Guest-Id"] = String(currentUser.id);
    headers["X-Guest-Username"] = currentUser.username;
  }

  return fetch(url, {
    ...options,
    credentials: "include",                                 // normal JWT token in cookies
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}