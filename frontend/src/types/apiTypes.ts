export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export type ApiSuccessResponse<T = null> = ApiResponse<T> & {
  success: true;
};

export type ApiErrorResponse = ApiResponse & {
  success: false;
  errors?: Record<string, string>;
};
