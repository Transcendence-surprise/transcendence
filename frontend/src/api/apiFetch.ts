import { User } from "./authentification";

/**
 * We store current user in memory manually
 * because apiFetch cannot use React hooks.
 */

let currentUser: User | null = null;

export function setApiUser(user: User | null) {
  currentUser = user;
}

export function getApiUser(): User | null {
  return currentUser;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  // Normalize caller-provided headers, regardless of their shape
  const headers = new Headers(options.headers);

  // Set default Content-Type only when a body is present and caller did not specify one
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Guest user → attach custom headers
  if (currentUser?.roles.includes("guest")) {
    headers.set("X-Guest-Id", String(currentUser.id));
    headers.set("X-Guest-Username", currentUser.username);
  }

  return fetch(url, {
    ...options,
    credentials: "include",                                 // normal JWT token in cookies
    headers,
  });
}