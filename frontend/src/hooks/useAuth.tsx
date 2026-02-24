import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authentification";

export interface AuthContextType {
  user: authApi.User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<authApi.User>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<authApi.User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      return u;
    } catch (err: any) {
      alert(err.message || "Login failed");
      throw err;
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
        return u;
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


  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}