import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockApi } from '../api/mockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Crucial for preventing redirects on load

  // This effect runs ONLY ONCE when the app starts.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('internUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      // This ensures that we always stop loading after the initial check.
      setLoading(false);
    }
  }, []);

  // This effect syncs any change in user state back to localStorage.
  useEffect(() => {
    if (!loading) { // Only update localStorage after the initial load is complete
      if (user) {
        localStorage.setItem('internUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('internUser');
      }
    }
  }, [user, loading]);

  const login = async (email, password) => {
    const userData = await mockApi.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const newUser = await mockApi.register(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading, // Expose loading state to the rest of the app
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};