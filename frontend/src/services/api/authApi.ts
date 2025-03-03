import axios from "axios";
import { API_URL } from "./index";
import { StorageKeys, User } from "../../types";

const BASE_URL = `${API_URL}/auth`;

// Create an axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem(StorageKeys.TOKEN);
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Types

interface UserWithToken extends User {
  token: string;
}

type RegisterData = Omit<User, "id"> & { password: string };
type LoginData = Pick<User, "email"> & { password: string };

// Register a new user

export const register = async (
  userData: RegisterData
): Promise<UserWithToken> => {
  const res = await api.post<UserWithToken>("/register", userData);
  if (res.data.token) {
    localStorage.setItem(StorageKeys.TOKEN, res.data.token);
  }
  return res.data;
};

// Login a user
export const login = async (userData: LoginData): Promise<UserWithToken> => {
  const res = await api.post<UserWithToken>("/login", userData);
  if (res.data.token) {
    localStorage.setItem(StorageKeys.TOKEN, res.data.token);
  }
  return res.data;
};

// Get current user

export const getCurrentUser = async (): Promise<UserWithToken> => {
  // Check if token exists before making the request
  const token = localStorage.getItem(StorageKeys.TOKEN);
  if (!token) {
    throw new Error("No token found");
  }

  const res = await api.get<UserWithToken>("/me");
  return res.data;
};

// Logout a user (Client side only)
export const logout = (): void => {
  localStorage.removeItem(StorageKeys.TOKEN);
};

export const authApi = {
  login,
  register,
  getCurrentUser,
  logout,
};
