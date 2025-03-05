import axios, { AxiosError, AxiosInstance } from "axios";
import { API_URL } from "./index";
import { StorageKeys } from "../../types";

// Types
export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor for adding auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(StorageKeys.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(StorageKeys.TOKEN);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
