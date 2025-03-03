// backend\src\controllers\authController.ts
import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config";

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;
// Define a type for Mongoose ValidationError
interface ValidationError extends MongooseError.ValidationError {
  errors: {
    [path: string]: MongooseError.ValidatorError;
  };
}

// Function to check if an error is a Mongoose validation error
function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ValidationError" &&
    "errors" in error
  );
}
// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Register a new user
 *
 */

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    // Check if user already exists
    const exitingUser = await User.findOne({ email });
    if (exitingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    // Create new user
    const user = new User({ email, password, firstName, lastName });
    await user.save();
    // Generate JWT token
    const token = generateToken(user._id.toString());
    res.status(201).json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    // Check if the error is a validation error
    if (isValidationError(error)) {
      const validationErrors: Record<string, string> = {};

      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * Login a user
 *
 */

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email" });
      return;
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    // Generate JWT token
    const token = generateToken(user._id.toString());
    res.status(200).json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * Get  user profile
 */

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get user ID from the request
    const userId = req.user?.id;
    // Find user by ID
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
};
