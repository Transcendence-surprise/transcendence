// src/api/authentication.ts
export interface LoginResponse {
  token: string;      // JWT token
  user: { id: string; username: string }; // user info
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to login");
  }

  // Save token locally for future requests
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("currentUser", JSON.stringify(data.user));

  return data;
}

export async function getCurrentUser(): Promise<{ id: string; username: string }> {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not logged in");

  const res = await fetch("/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch user");

  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}
