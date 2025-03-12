import { User } from "../../services/api/authService";
import { AppError } from "../../types/errors";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: AppError | null; // Changed from string to AppError
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
  verifyEmail: (token: string) => Promise<string>;
  resendVerificationEmail: (email: string) => Promise<string>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  clearAuthError: () => void; // Method to explicitly clear auth errors
}

export const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  authError: null,
  register: async () => {},
  login: async () => {},
  logout: () => {},
  refreshAuth: () => {},
  verifyEmail: async () => "",
  resendVerificationEmail: async () => "",
  requestPasswordReset: async () => "",
  resetPassword: async () => "",
  clearAuthError: () => {},
};
