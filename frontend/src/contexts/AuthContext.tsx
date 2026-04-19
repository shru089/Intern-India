import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { apiClient } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; fullName: string; role?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchUserInfo() {
    try {
      const { data } = await apiClient.get<User>("/auth/me");
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user info", error);
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
      "/auth/login",
      { email, password }
    );
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem("token", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    await fetchUserInfo();
  }

  async function register(userData: { email: string; password: string; fullName: string; role?: string }) {
    const { email, password, fullName, role } = userData;
    const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
      "/auth/register",
      { email, password, full_name: fullName, role }
    );
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

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, login, register, logout, loading, isAuthenticated: !!token }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
