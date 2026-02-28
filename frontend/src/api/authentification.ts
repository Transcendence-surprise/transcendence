// src/api/authentication.ts

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

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

export async function login(identifier: string, password: string): Promise<User> {
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
  const user = await res.json();
  console.log("user", user);
  // Temperary DELETE LATER
  user.roles = [...(user.roles || []), "admin"];
  console.log("user!", user);
  ////////////////////////////
  return user;
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
}

// Role-based helper functions
export function isAdmin(user: User | null): boolean {
  return user?.roles?.includes('admin') ?? false;
}

export function isUser(user: User | null): boolean {
  return user?.roles?.includes('user') ?? false;
}

export function hasRole(user: User | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false;
}
