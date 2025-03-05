// frontend/src/services/api/authService.ts
import apiClient from "./apiClient";

// Types - should match your backend types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: User;
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

const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    const userData = response.data.data;

    // Store token in localStorage
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    return userData;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData
    );
    const newUser = response.data.data;

    // Store token in localStorage
    if (newUser.token) {
      localStorage.setItem("token", newUser.token);
    }

    return newUser;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    return response.data.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
  },
};

export default authService;
