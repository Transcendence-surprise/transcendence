export interface User {
  id: number | string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
}

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch("/api/users/", { credentials: "include" });
  if (!res.ok) throw new Error("Not logged in");
  const users = await res.json();
  console.log("users", users);
  return users;
}

export async function toggleTwoFactorAuth(enabled: boolean): Promise<User> {
  const res = await fetch("/api/users/me", {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ twoFactorEnabled: enabled }),
  });
  if (!res.ok) throw new Error("Failed to update 2FA settings");

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  // If no JSON response, return a placeholder user object
  return {} as User;
}

export async function changePassword(
id: string | number, password: string,
): Promise<User> {
  const res = await fetch(`/api/users/me/password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Failed to change password");

  // Backend returns 204 NO_CONTENT, so just return a placeholder object
  // The password change was successful if we reach here
  return {} as User;
}
