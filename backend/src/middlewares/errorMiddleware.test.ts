import { Request, Response } from "express";
import mongoose from "mongoose";
import { unknownEndpoint, errorHandler } from "../middlewares/errorMiddleware";
import { sendError } from "../utils/responseFormatter";
import logger from "../utils/logger";

// Mock dependencies
jest.mock("../utils/responseFormatter", () => ({
  sendError: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  error: jest.fn(),
}));

describe("Error Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      headersSent: false,
    };
    next = jest.fn();
    (sendError as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  describe("unknownEndpoint", () => {
    it("should handle unknown endpoints with 404 status", () => {
      unknownEndpoint(req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Unknown endpoint",
        { path: "The requested resource does not exist" },
        404
      );
    });
  });

  describe("errorHandler", () => {
    it("should log the error name and message", () => {
      const error = new Error("Test error");
      error.name = "TestError";

      errorHandler(error, req as Request, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith("Error name:", "TestError");
      expect(logger.error).toHaveBeenCalledWith("Error message:", "Test error");
    });

    it("should handle mongoose validation errors", () => {
      // Create a mock validation error
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: new mongoose.Error.ValidatorError({
          message: "Name is required",
          path: "name",
          type: "required",
        }),
        email: new mongoose.Error.ValidatorError({
          message: "Email is invalid",
          path: "email",
          type: "format",
        }),
      };

      errorHandler(validationError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Validation failed",
        {
          name: "Name is required",
          email: "Email is invalid",
        },
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle MongoDB duplicate key errors", () => {
      // Create a mock MongoDB duplicate key error
      const duplicateError = new mongoose.mongo.MongoServerError({
        keyPattern: { email: 1 },
        keyValue: { email: "test@example.com" },
      }) as mongoose.mongo.MongoServerError;
      duplicateError.code = 11000;

      errorHandler(duplicateError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Duplicate field error",
        {
          email: "Email already exists",
        },
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle JWT errors", () => {
      const jwtError = new Error("invalid token");
      jwtError.name = "JsonWebTokenError";

      errorHandler(jwtError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Invalid token",
        { auth: "The provided token is invalid" },
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle token expiration errors", () => {
      const tokenExpiredError = new Error("jwt expired");
      tokenExpiredError.name = "TokenExpiredError";

      errorHandler(tokenExpiredError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Token expired",
        { auth: "The provided token has expired" },
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle cast errors (invalid ObjectId)", () => {
      const castError = new Error("Cast to ObjectId failed");
      castError.name = "CastError";

      errorHandler(castError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Invalid ID format",
        { id: "The provided ID is not in a valid format" },
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle unknown errors in development mode", () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const unknownError = new Error("Something went wrong");

      errorHandler(unknownError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "An unexpected error occurred",
        { server: "Something went wrong" },
        500
      );
      expect(next).not.toHaveBeenCalled();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should handle unknown errors in production mode without error details", () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const unknownError = new Error("Something went wrong");

      errorHandler(unknownError, req as Request, res as Response, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "An unexpected error occurred",
        undefined,
        500
      );
      expect(next).not.toHaveBeenCalled();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should call next if headers are already sent", () => {
      res.headersSent = true;
      const error = new Error("Test error");

      errorHandler(error, req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(sendError).not.toHaveBeenCalled();
    });
  });
});
