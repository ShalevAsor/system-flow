// frontend/src/services/api/authService.ts
import apiClient from "./apiClient";
import { StorageKeys } from "../../types";

// Types - should match your backend types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResendVerificationRequest {
  email: string;
}

const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    const userData = response.data.data;

    // Store token in localStorage
    if (userData.token) {
      localStorage.setItem(StorageKeys.TOKEN, userData.token);
    }

    return userData;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData
    );
    const newUser = response.data.data;

    return newUser;
  },

  verifyEmail: async (token: string): Promise<string> => {
    const response = await apiClient.get<MessageResponse>(
      `/auth/verify-email?token=${token}`
    );

    return response.data.message;
  },

  resendVerificationEmail: async (
    data: ResendVerificationRequest
  ): Promise<string> => {
    const response = await apiClient.post<MessageResponse>(
      `/auth/resend-verification`,
      data
    );
    return response.data.message;
  },

  requestPasswordReset: async (
    data: RequestPasswordResetRequest
  ): Promise<string> => {
    const response = await apiClient.post<MessageResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data.message;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<string> => {
    const response = await apiClient.post<MessageResponse>(
      "/auth/reset-password",
      data
    );
    return response.data.message;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    return response.data.data;
  },

  logout: (): void => {
    localStorage.removeItem(StorageKeys.TOKEN);
  },
};

export default authService;
