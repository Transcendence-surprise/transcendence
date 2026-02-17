import { useState, useEffect } from "react";
import * as authApi from "../api/authentification";

export function useAuth() {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    authApi.getCurrentUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const u = await authApi.login(username, password);
      setUser(u);
      alert(`Welcome, ${u.username}!`);
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

    const signup = async (
    username: string,
    email: string,
    password: string
    ) => {
    try {
        setLoading(true);
        const u = await authApi.signup(username, email, password);
        setUser(u);
        alert(`Welcome, ${u.username}!`);
        return u; // ← optional but good
    } catch (err: any) {
        alert(err.message || "Signup failed");
        throw err;
    } finally {
        setLoading(false);
    }
    };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      setUser(null);
    } catch (err: any) {
      alert(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, login, signup, logout };
}
