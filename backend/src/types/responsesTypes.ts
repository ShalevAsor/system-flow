// backend/src/types/responses.ts
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
