// backend/src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult } from "express-validator";
import logger from "../utils/logger";
import { sendError } from "../utils/responseFormatter";
// Middleware to handle validation errors
export const validate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  logger.error("Validation error:", errors.array());

  // Format errors for response
  const extractedErrors: Record<string, string> = {};
  errors.array().forEach((err) => {
    if ("path" in err && "msg" in err) {
      extractedErrors[err.path] = err.msg as string;
    }
  });

  sendError(res, "Validation failed", extractedErrors, 400);
};
