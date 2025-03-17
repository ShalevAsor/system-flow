// src/types/authTypes.ts
import { User } from "./userTypes";
import { ApiResponse } from "./apiTypes";

export type AuthResponse = ApiResponse<User>;
export type MessageResponse = ApiResponse<null>;

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
