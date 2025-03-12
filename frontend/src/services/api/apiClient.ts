import axios, { AxiosError, AxiosInstance } from "axios";
import { API_URL } from "./index";
import { StorageKeys } from "../../types";
import { ErrorType, createAppError, AppError } from "../../types/errors";

// Types
export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
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
    // Create structured app error
    let appError: AppError;

    if (!error.response) {
      // Network-related errors (no response from server)
      if (error.code === "ECONNABORTED") {
        appError = createAppError(
          ErrorType.API_TIMEOUT_ERROR,
          "Request timed out",
          undefined,
          error
        );
      } else {
        appError = createAppError(
          ErrorType.API_CONNECTION_ERROR,
          "Could not connect to server",
          undefined,
          error
        );
      }
    } else {
      // Server responded with an error
      const { status, data } = error.response;
      const errorMessage = data?.message || "An unexpected error occurred";

      // Organize by status code
      switch (status) {
        // 400 Bad Request
        case 400:
          if (data?.message?.toLowerCase().includes("user already exists")) {
            appError = createAppError(
              ErrorType.AUTH_EMAIL_ALREADY_IN_USE,
              errorMessage,
              data?.errors,
              error
            );
          } else if (
            data?.message
              ?.toLowerCase()
              .includes("invalid or expired reset link")
          ) {
            appError = createAppError(
              ErrorType.AUTH_INVALID_RESET_TOKEN,
              errorMessage,
              data?.errors,
              error
            );
          } else if (data?.errors) {
            appError = createAppError(
              ErrorType.VALIDATION_ERROR,
              errorMessage,
              data.errors,
              error
            );
          } else {
            appError = createAppError(
              ErrorType.BAD_REQUEST,
              errorMessage,
              data?.errors,
              error
            );
          }
          break;

        // 401 Unauthorized
        case 401:
          appError = createAppError(
            ErrorType.AUTH_UNAUTHORIZED,
            errorMessage || "You need to be logged in",
            data?.errors,
            error
          );
          break;

        // 403 Forbidden
        case 403:
          if (data?.message?.toLowerCase().includes("verified")) {
            appError = createAppError(
              ErrorType.AUTH_EMAIL_UNVERIFIED,
              errorMessage,
              data?.errors,
              error
            );
          } else {
            appError = createAppError(
              ErrorType.AUTH_FORBIDDEN,
              errorMessage ||
                "You don't have permission to access this resource",
              data?.errors,
              error
            );
          }
          break;

        // 404 Not Found
        case 404:
          appError = createAppError(
            ErrorType.RESOURCE_NOT_FOUND,
            errorMessage || "Resource not found",
            data?.errors,
            error
          );
          break;

        // 409 Conflict
        case 409:
          appError = createAppError(
            ErrorType.RESOURCE_CONFLICT,
            errorMessage,
            data?.errors,
            error
          );
          break;

        // 422 Unprocessable Entity
        case 422:
          appError = createAppError(
            ErrorType.VALIDATION_ERROR,
            errorMessage,
            data?.errors,
            error
          );
          break;

        // 500+ Server Errors
        case 500:
        case 502:
        case 503:
        case 504:
          appError = createAppError(
            ErrorType.API_SERVER_ERROR,
            errorMessage || "Server error occurred",
            data?.errors,
            error
          );
          break;

        // Default case for any other status codes
        default:
          appError = createAppError(
            ErrorType.UNKNOWN_ERROR,
            errorMessage,
            data?.errors,
            error
          );
          break;
      }
    }

    return Promise.reject(appError);
  }
);
export default apiClient;
