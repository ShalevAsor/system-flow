// import { useContext } from "react";
// import { AuthContext } from "../context/auth/AuthContext";
// import { AuthContextType } from "../context/auth";
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);

//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }

//   return context;
// };
// frontend/src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthContextType } from "../context/auth/AuthContextType";
import { ErrorType } from "../types/errors";

/**
 * Hook to access the auth context with additional helper methods
 */
export const useAuth = (): AuthContextType & {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  hasAuthError: (errorType?: ErrorType) => boolean;
} => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Add helper methods and derived properties
  return {
    ...context,
    // Check if user is authenticated
    isAuthenticated: !!context.user,
    // Check if current user has verified email
    isEmailVerified: context.user?.isEmailVerified || false,
    // Helper to check for specific auth error types
    hasAuthError: (errorType?: ErrorType): boolean => {
      if (!context.authError) return false;
      if (!errorType) return true;
      return context.authError.type === errorType;
    },
  };
};
