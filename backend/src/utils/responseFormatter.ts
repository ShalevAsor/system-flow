// backend/src/utils/responseFormatter.ts
import { Response } from "express";
import { ApiResponse } from "../types/responsesTypes";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Operation successful",
  statusCode = 200
): Response<ApiResponse<T>> => {
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
): Response<ApiResponse<null>> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
