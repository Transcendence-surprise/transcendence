
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch("/api/users/", { credentials: "include" });
  if (!res.ok) throw new Error("Not logged in");
  const users = await res.json();
  console.log("users", users);
  return users;
}