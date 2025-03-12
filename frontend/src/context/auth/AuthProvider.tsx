import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { StorageKeys } from "../../types";
import { User } from "../../services/api/authService";
import authService from "../../services/api/authService";
import { parseApiError } from "../../utils/apiUtils";
import { AppError } from "../../types/errors";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AppError | null>(null);

  // Function to explicitly clear auth errors
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Function to check if the user is logged in
  const checkLoggedIn = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const token = localStorage.getItem(StorageKeys.TOKEN);
      if (!token) {
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user:", err);
      // Clear token on authentication error
      localStorage.removeItem(StorageKeys.TOKEN);
      setUser(null);

      // Only set auth state errors, not form errors
      const appError = parseApiError(err);
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }
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
    setAuthError(null);
    try {
      await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
    } catch (err) {
      // Parse the error
      const appError = parseApiError(err);

      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }

      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  // Function to log in a user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
    } catch (err) {
      const appError = parseApiError(err);
      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }
      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    clearAuthError(); // Clear any errors on logout
  };

  const refreshAuth = () => {
    if (!loading) {
      checkLoggedIn();
    }
  };

  // Email verification handling
  const verifyEmail = async (token: string): Promise<string> => {
    setLoading(true);
    setAuthError(null);
    try {
      const message = await authService.verifyEmail(token);

      // Refresh auth to update user state if they're logged in
      refreshAuth();

      return message;
    } catch (err) {
      console.error("Verification error details:", err);
      const appError = parseApiError(err);

      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }

      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<string> => {
    setLoading(true);
    setAuthError(null);
    try {
      const message = await authService.resendVerificationEmail({ email });
      return message;
    } catch (err) {
      const appError = parseApiError(err);

      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }

      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  // Password reset handling
  const requestPasswordReset = async (email: string): Promise<string> => {
    setLoading(true);
    setAuthError(null);
    try {
      const message = await authService.requestPasswordReset({ email });
      return message;
    } catch (err) {
      const appError = parseApiError(err);

      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }

      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<string> => {
    setLoading(true);
    setAuthError(null);
    try {
      const message = await authService.resetPassword({ token, newPassword });
      return message;
    } catch (err) {
      const appError = parseApiError(err);

      // Only set auth state errors in the provider
      if (appError.type.startsWith("auth/")) {
        setAuthError(appError);
      }

      // Always throw the structured error for the component to handle
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    refreshAuth,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
