// backend/src/controllers/authController.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config/config";
import logger from "../utils/logger";
import { sendSuccess, sendError } from "../utils/responseFormatter";
import { UserResponse, ApiResponse } from "../types/responsesTypes";

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(
        res,
        "User already exists",
        { email: "Email address already in use" },
        400
      );
      return;
    }

    // Create new user
    const user = new User({ email, password, firstName, lastName });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Format the user data for response
    const userData: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };

    sendSuccess(res, userData, "User registered successfully", 201);
  } catch (error: unknown) {
    logger.error("Registration error:", error);
    next(error);
  }
};

/**
 * Login a user
 */
export const login = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      sendError(
        res,
        "Authentication failed",
        { email: "Invalid email or password" },
        401
      );
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(
        res,
        "Authentication failed",
        { password: "Invalid email or password" },
        401
      );
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Format the user data for response
    const userData: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };

    sendSuccess(res, userData, "Login successful", 200);
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
};

/**
 * Get user profile
 */
export const getCurrentUser = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from the request
    const userId = req.user?.id;

    // Find user by ID
    const user = await User.findById(userId).select("-password");
    if (!user) {
      sendError(
        res,
        "User not found",
        { id: "User with provided ID does not exist" },
        404
      );
      return;
    }

    // Format the user data for response
    const userData: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: req.token,
    };

    sendSuccess(res, userData, "User profile retrieved successfully", 200);
  } catch (error) {
    logger.error("Error fetching user:", error);
    next(error);
  }
};
