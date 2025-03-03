import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { authApi } from "../../services/api/authApi";
import { User, StorageKeys } from "../../types";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if the user is logged in
  const checkLoggedIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(StorageKeys.TOKEN);
      if (!token) {
        return;
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Set error state instead of just logging
      setError(err instanceof Error ? err.message : "Authentication failed");
      // Clear token on authentication error
      localStorage.removeItem(StorageKeys.TOKEN);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize authentication state when component mounts
  useEffect(() => {
    checkLoggedIn();
  }, []);

  // Function to register a new user
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authApi.register({
        email,
        password,
        firstName,
        lastName,
      });
      const { token: _, ...userInfo } = userData;
      setUser(userInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to log in a user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authApi.login({ email, password });
      const { token: _, ...userInfo } = userData;
      setUser(userInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    authApi.logout();
    setUser(null);
  };
  const refreshAuth = () => {
    if (!loading) {
      checkLoggedIn();
    }
  };
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshAuth, // components can trigger a re-auth
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
