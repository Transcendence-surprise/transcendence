// src/api/authentication.ts

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
): Promise<User> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Signup failed");
  }

  return getCurrentUser();
}

export async function login(
  identifier: string,
  password: string,
): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Login failed");
  }

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch("/api/users/me", { credentials: "include" });
  if (!res.ok) throw new Error("Not logged in");
  const data = await res.json();
  return data;
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
}

export async function createGuestToken(nickname: string): Promise<User> {
  const res = await fetch("/api/auth/guest-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Guest token creation failed");
  }

  return getCurrentUser();
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean }> {
  const res = await fetch("/api/auth/password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to request password reset");
  }

  return res.json();
}

export async function confirmPasswordReset(
  token: string,
  password: string,
): Promise<{ ok: true }> {
  const res = await fetch("/api/auth/password-reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to confirm password reset");
  }

  return res.json();
}
