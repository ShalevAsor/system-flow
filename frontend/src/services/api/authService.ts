import apiClient from "./apiClient";
import { User } from "../../types/userTypes";
import {
  AuthResponse,
  MessageResponse,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from "../../types/authTypes";

const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data.data;
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
};

export default authService;
