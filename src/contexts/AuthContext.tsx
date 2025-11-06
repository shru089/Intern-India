import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "../services/api";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: "student" | "organization" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Decode token to get user info (simplified - in production decode JWT properly)
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchUserInfo() {
    // For now, we'll get user info from token or a separate endpoint
    // In production, decode JWT or call /auth/me
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem("token", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    // Fetch user info after login
    await fetchUserInfo();
  }

  async function register(email: string, password: string, name: string, role: string) {
    const { data } = await apiClient.post("/auth/register", { email, password, name, role });
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem("token", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    await fetchUserInfo();
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

