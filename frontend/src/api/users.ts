export interface User {
  id: number | string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
}

import { rethrowAbortError } from "./requestUtils";

export async function getAllUsers(signal?: AbortSignal): Promise<User[]> {
  try {
    const res = await fetch("/api/users/", { credentials: "include", signal });
    if (!res.ok) throw new Error("Not logged in");
    const users = await res.json();
    return users;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function toggleTwoFactorAuth(enabled: boolean, signal?: AbortSignal): Promise<User> {
  try {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ twoFactorEnabled: enabled }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to update 2FA settings");

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    // If no JSON response, return a placeholder user object
    return {} as User;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function changePassword(
id: string | number, password: string,
signal?: AbortSignal,
): Promise<User> {
  try {
    const res = await fetch(`/api/users/me/password`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to change password");

    // Backend returns 204 NO_CONTENT, so just return a placeholder object
    // The password change was successful if we reach here
    return {} as User;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function deleteUser(id: number | string, signal?: AbortSignal) {
  const numId = typeof id === "string" ? Number(id) : id;
  if (isNaN(numId)) throw new Error("Invalid user id");

  try {
    const res = await fetch(`/api/users/id/${numId}`, {
      method: "DELETE",
      headers: { accept: "*/*" },
      credentials: "include",
      signal,
    });
    if (!res.ok) throw new Error("Failed to delete user");
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

// Admin: Set 2FA for any user (placeholder, backend endpoint needed)
export async function setUserTwoFactor(id: number | string, enabled: boolean): Promise<User> {
  const numId = typeof id === "string" ? Number(id) : id;
  if (isNaN(numId)) throw new Error("Invalid user id");
  const res = await fetch(`/api/users/id/${numId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ twoFactorEnabled: enabled }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update 2FA for user");
  return res.json();
}