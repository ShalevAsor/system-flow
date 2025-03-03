// backend/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config/config";
import logger from "../utils/logger";
import { sendError } from "../utils/responseFormatter";

// Extend the Express Request interface to include user and token
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      token?: string;
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
}

// Extract token from authorization header
export const tokenExtractor: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    req.token = authorization.substring(7);
  }
  next();
};

// Extract user from token
export const userExtractor: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.token;

    if (!token) {
      sendError(
        res,
        "Not authorized, no token",
        { auth: "Authentication token is required" },
        401
      );
      return;
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    if (!decodedToken.id) {
      sendError(
        res,
        "Not authorized, invalid token",
        { auth: "Token payload is invalid" },
        401
      );
      return;
    }

    // Get user from the token
    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      sendError(
        res,
        "User not found",
        { auth: "User account no longer exists" },
        401
      );
      return;
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    // No need for next(error) here as we're handling the error directly
    sendError(
      res,
      "Not authorized, invalid token",
      { auth: "Token validation failed" },
      401
    );
  }
};

// Protect route - combines tokenExtractor and userExtractor
export const protect = [tokenExtractor, userExtractor];
