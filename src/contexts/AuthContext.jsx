import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { apiClient } from "../services/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
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
      // In production, decode JWT or call /auth/me
      // For now, we'll mock the user profile data based on the token
      // This allows the UI to work while we wait for the full backend integration
      const mockUser = {
        id: 1,
        fullName: "Intern User",
        email: "user@example.com",
        role: "student",
        profileCompletion: 85,
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Failed to fetch user info", error);
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem("token", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    await fetchUserInfo();
  }

  async function register(userData) {
    const { email, password, fullName, role } = userData;
    const { data } = await apiClient.post("/auth/register", { 
      email, 
      password, 
      name: fullName, 
      role 
    });
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

  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token,
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
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
