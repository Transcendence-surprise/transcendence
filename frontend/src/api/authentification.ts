// src/api/authentication.ts

import { rethrowAbortError } from "./requestUtils";

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

async function parseErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  if (res.status === 502 || res.status === 503) {
    return "Service unavailable.";
  }

  const text = await res.text();
  if (!text) return fallback;

  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallback;
  } catch {
    return `${fallback}: ${res.status} ${res.statusText}`;
  }
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
      const message = await parseErrorMessage(res, "Signup failed");
      throw new Error(message);
    }

    const data = await res.json();
    const user = (data?.user ?? data) as User | undefined;

    if (user && user.username) {
      return user;
    }

    // Fallback for unexpected payload shape
    const refreshed = await getCurrentUser(signal);
    if (!refreshed) {
      throw new Error("Signup succeeded but user session is unavailable");
    }
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
      const message = await parseErrorMessage(res, "Login failed");
      throw new Error(message);
    }

    const data = await res.json();

    if (data?.twoFactorRequired) {
      return data as TwoFactorRequiredResponse;
    }

    const user = (data?.user ?? data) as User;
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
      const message = await parseErrorMessage(res, "Verification code failed");
      throw new Error(message);
    }

    const data = await res.json();
    const user = (data?.user ?? data) as User;
    return user;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function getCurrentUser(
  signal?: AbortSignal,
  options?: { allowUnauthorized?: boolean },
): Promise<User | null> {
  try {
    const res = await fetch("/api/users/me", { credentials: "include", signal });
    // 401 = unauthorized, 404 = user deleted
    if (res.status === 401 || res.status === 404) return null;

    if (!res.ok) {
      const message = await parseErrorMessage(res, "Failed to fetch user");
      throw new Error(message);
    }

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

    if (!res.ok && res.status !== 401 && res.status !== 404) {
      throw new Error("Logout failed");
    }
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
      const message = await parseErrorMessage(res, "Guest token creation failed");
      throw new Error(message);
    }

    const user = await getCurrentUser(signal);
    if (!user) {
      throw new Error("Guest token created but user session is unavailable");
    }
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
      const message = await parseErrorMessage(
        res,
        "Failed to request password reset",
      );
      throw new Error(message);
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
      const message = await parseErrorMessage(
        res,
        "Failed to confirm password reset",
      );
      throw new Error(message);
    }

    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
  }
}