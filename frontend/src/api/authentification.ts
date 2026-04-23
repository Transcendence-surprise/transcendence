// src/api/authentication.ts

import { rethrowAbortError } from "./requestUtils";

const AUTH_HINT_KEY = "transcendence.auth.hasSession";

function setAuthHint(hasSession: boolean): void {
  try {
    if (hasSession) {
      localStorage.setItem(AUTH_HINT_KEY, "1");
    } else {
      localStorage.removeItem(AUTH_HINT_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.)
  }
}

export function hasAuthHint(): boolean {
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export interface User {
  id: number | string;
  username: string;
  email: string;
  avatarImageId?: number | null;
  avatarUrl?: string | null;
  roles: string[];
  rankNumber?: number;
  winStreak?: number;
  totalGames?: number;
  totalWins?: number;
  createdAt?: string;
  updatedAt?: string;
  twoFactorEnabled?: boolean;
}

export interface TwoFactorRequiredResponse {
  twoFactorRequired: true;
  email: string;
  message: string;
}

export type LoginResponse = User | TwoFactorRequiredResponse;

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

    const data = await res.json();
    const user = (data?.user ?? data) as User | undefined;

    if (user && user.username) {
      setAuthHint(true);
      return user;
    }

    // Fallback for unexpected payload shape
    const refreshed = await getCurrentUser(signal);
    if (!refreshed) {
      throw new Error("Signup succeeded but user session is unavailable");
    }
    setAuthHint(true);
    return refreshed;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export function isTwoFactorRequiredResponse(
  response: LoginResponse,
): response is TwoFactorRequiredResponse {
  return "twoFactorRequired" in response && response.twoFactorRequired;
}

export async function login(
  identifier: string,
  password: string,
  signal?: AbortSignal,
): Promise<LoginResponse> {
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

    const data = await res.json();

    if (data?.twoFactorRequired) {
      return data as TwoFactorRequiredResponse;
    }

    const user = (data?.user ?? data) as User;
    setAuthHint(true);
    return user;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function loginWith2FA(
  email: string,
  code: string,
  signal?: AbortSignal,
): Promise<User> {
  try {
    const res = await fetch("/api/auth/login/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.message || "Verification code failed");
    }

    const data = await res.json();
    const user = (data?.user ?? data) as User;
    setAuthHint(true);
    return user;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function getCurrentUser(signal?: AbortSignal): Promise<User>;
export async function getCurrentUser(
  signal: AbortSignal | undefined,
  options: { allowUnauthorized: true },
): Promise<User | null>;
export async function getCurrentUser(
  signal?: AbortSignal,
  options?: { allowUnauthorized?: boolean },
): Promise<User | null> {
  try {
    const res = await fetch("/api/users/me", { credentials: "include", signal });
    if (!res.ok) {
      // 401 = unauthorized, 404 = user deleted
      if ((res.status === 401 || res.status === 404) && options?.allowUnauthorized) {
        setAuthHint(false);
        return null;
      }
      throw new Error("Not logged in");
    }
    const data = await res.json();
    setAuthHint(true);
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
    setAuthHint(false);
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

    const user = await getCurrentUser(signal);
    setAuthHint(true);
    return user;
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