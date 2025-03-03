// backend/src/utils/responseFormatter.ts
import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Operation successful",
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "Operation failed",
  errors?: Record<string, string>,
  statusCode = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
