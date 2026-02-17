// src/api/authentication.ts

export interface User { id: string; username: string; }

export async function signup(
  username: string,
  email: string,
  password: string
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

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
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
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
}