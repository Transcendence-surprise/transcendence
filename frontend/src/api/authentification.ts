// src/api/authentication.ts

import { rethrowAbortError } from "./requestUtils";

export interface User {
  id: number | string;
  username: string;
  email: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function signup(
  username: string,
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<User> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Signup failed");
    }

    return getCurrentUser(signal);
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function login(identifier: string, password: string, signal?: AbortSignal): Promise<User> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Login failed");
    }

    return getCurrentUser(signal);
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
  try {
    const res = await fetch("/api/users/me", { credentials: "include", signal });
    if (!res.ok) throw new Error("Not logged in");
    const data = await res.json();
    return data;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function logout(signal?: AbortSignal): Promise<void> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      signal,
    });

    if (!res.ok) throw new Error("Logout failed");
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function createGuestToken(nickname: string, signal?: AbortSignal): Promise<User> {
  try {
    const res = await fetch("/api/auth/guest-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Guest token creation failed");
    }

    return getCurrentUser(signal);
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function requestPasswordReset(
  email: string,
  signal?: AbortSignal,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Failed to request password reset");
    }

    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function confirmPasswordReset(
  token: string,
  password: string,
  signal?: AbortSignal,
): Promise<{ ok: true }> {
  try {
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Failed to confirm password reset");
    }

    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
  }
}