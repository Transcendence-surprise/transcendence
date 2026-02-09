// src/api/authentication.ts
export interface LoginResponse {
  token: string;      // JWT token
  user: any; //user: { id: string; username: string }; // user info
}

export interface SignupResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include", // if using cookies
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to login");
  }

  // Save token locally (optional if using cookies)
  localStorage.setItem("authToken", data.access_token);
  localStorage.setItem("currentUser", JSON.stringify(data.user));

  return data;
}

export async function signup(
  username: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    credentials: "include", // if backend sets cookies
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to sign up");
  }

  // Save token locally (optional if backend returns JWT)
  localStorage.setItem("authToken", data.access_token);
  localStorage.setItem("currentUser", JSON.stringify(data.user));

  return data;
}

// export async function getCurrentUser(): Promise<{ id: string; username: string }> {
//   const token = localStorage.getItem("authToken");
//   if (!token) throw new Error("Not logged in");

//   const res = await fetch("/api/users/me", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await res.json();
//   if (!res.ok) throw new Error(data?.message || "Failed to fetch user");

//   return data;
// }

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}
