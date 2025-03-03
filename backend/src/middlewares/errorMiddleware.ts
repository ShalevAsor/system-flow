// backend/src/middlewares/errorMiddleware.ts
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import mongoose from "mongoose";
import logger from "../utils/logger";
import { sendError } from "../utils/responseFormatter";

export const unknownEndpoint: RequestHandler = (
  _req: Request,
  res: Response
): void => {
  sendError(
    res,
    "Unknown endpoint",
    { path: "The requested resource does not exist" },
    404
  );
};

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Error name:", err.name);
  logger.error("Error message:", err.message);

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};

    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });

    sendError(res, "Validation failed", errors, 400);
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    // Extract the duplicate field
    const field = Object.keys(err.keyPattern)[0];
    sendError(
      res,
      "Duplicate field error",
      {
        [field]: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      },
      400
    );
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    sendError(
      res,
      "Invalid token",
      { auth: "The provided token is invalid" },
      401
    );
    return;
  }

  // Handle token expiration
  if (err.name === "TokenExpiredError") {
    sendError(
      res,
      "Token expired",
      { auth: "The provided token has expired" },
      401
    );
    return;
  }

  // Handle cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    sendError(
      res,
      "Invalid ID format",
      { id: "The provided ID is not in a valid format" },
      400
    );
    return;
  }

  // If it's another type of error we don't recognize, send generic server error
  if (!res.headersSent) {
    sendError(
      res,
      "An unexpected error occurred",
      process.env.NODE_ENV === "development"
        ? { server: err.message }
        : undefined,
      500
    );
    return;
  }

  next(err);
};

export default {
  unknownEndpoint,
  errorHandler,
};
