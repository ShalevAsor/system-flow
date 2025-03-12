import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import config from "../config/config";
import logger from "../utils/logger";
import { sendSuccess, sendError } from "../utils/responseFormatter";
import { UserResponse, ApiResponse } from "../types/responsesTypes";
import { emailService } from "../services/emailService";
import {
  createToken,
  isTokenExpired,
  TOKEN_EXPIRATION,
  hashToken,
} from "../utils/tokenUtils";

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Register a new user with email verification
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
    // Generate verification token
    const { token, hash, expiresAt } = createToken(
      TOKEN_EXPIRATION.EMAIL_CONFIRMATION
    );

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      verificationToken: hash,
      verificationTokenExpiry: expiresAt,
      isEmailVerified: false,
    });
    // Save user to database
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        token
      );
    } catch (emailError) {
      logger.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
      // TODO: Handle email sending failure
    }

    // Format the user data for response
    const userData: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: false,
    };

    sendSuccess(
      res,
      userData,
      "User registered successfully. Please check your email to verify your account.",
      201
    );
  } catch (error: unknown) {
    logger.error("Registration error:", error);
    next(error);
  }
};

/**
 * Verify a user's email with the provided token
 */

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      sendError(
        res,
        "Invalid verification link",
        {
          token: "Verification token is missing or invalid",
        },
        400
      );
      return;
    }
    // Hash the token to compare with the stored token
    const hashedToken = hashToken(token);
    // Find user by verification token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      sendError(
        res,
        "Invalid or expired verification link",
        { token: "The verification link is invalid or has expired" },
        400
      );
      return;
    }
    // Verify the token
    if (
      !user.verificationToken ||
      !user.verificationTokenExpiry ||
      isTokenExpired(user.verificationTokenExpiry)
    ) {
      sendError(
        res,
        "Invalid or expired verification link",
        { token: "The verification link is invalid or has expired" },
        400
      );
      return;
    }
    // Mark user as verified and clear verification token
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (emailError) {
      logger.error("Failed to send welcome email:", emailError);
      // TODO: Handle email sending failure
    }
    sendSuccess(
      res,
      null,
      "Email verification successful. You can now log in to your account.",
      200
    );
  } catch (error) {
    logger.error("Email verification error:", error);
    next(error);
  }
};

/**
 * Login a user with email verification check
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
      sendError(res, "Wrong credentials", { email: "Invalid email" }, 401);
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(
        res,
        "Wrong credentials",
        { password: "Invalid password" },
        401
      );
      return;
    }
    // Check if email is verified
    if (!user.isEmailVerified) {
      sendError(
        res,
        "Email not verified",
        { email: "Email not verified" },
        403
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
      isEmailVerified: user.isEmailVerified,
      token,
    };

    sendSuccess(res, userData, "Login successful", 200);
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
};

/**
 * Request a password reset link
 */

export const requestPasswordReset = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      sendSuccess(
        res,
        null,
        "If your email is registered, you will receive a password reset link shortly",
        200
      );
      return;
    }
    // Generate password reset token
    const { token, hash, expiresAt } = createToken(
      TOKEN_EXPIRATION.PASSWORD_RESET
    );
    // Update user with reset token
    user.resetPasswordToken = hash;
    user.resetPasswordTokenExpiry = expiresAt;
    await user.save();
    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        token
      );
    } catch (error) {
      logger.error("Password reset email error:", error);
      sendError(res, "Failed to send password reset email", undefined, 500);
      return;
      // TODO: Handle email sending failure
    }
    sendSuccess(
      res,
      null,
      "Password reset link sent to your email address",
      200
    );
  } catch (error) {
    logger.error("Password reset request error:", error);
    next(error);
  }
};

/**
 * Reset password with token
 */

export const resetPassword = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    // Validate token
    if (!token || typeof token !== "string") {
      sendError(res, "Invalid reset token", undefined, 400);
      return;
    }
    // Hash the token to compare with the stored token
    const hashedToken = hashToken(token);
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      sendError(res, "Invalid or expired reset link", undefined, 400);
      return;
    }
    // Additional verification
    if (
      !user.resetPasswordToken ||
      !user.resetPasswordTokenExpiry ||
      isTokenExpired(user.resetPasswordTokenExpiry)
    ) {
      sendError(res, "Invalid or expired reset link", undefined, 400);
      return;
    }
    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();
    sendSuccess(
      res,
      null,
      "Password has been reset successfully. You can now log in with your new password.",
      200
    );
  } catch (error) {
    logger.error("Password reset error:", error);
    next(error);
  }
};

/**
 * Resend verification email
 */

export const resendVerificationEmail = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      sendSuccess(
        res,
        null,
        "If your email is registered and not verified, you will receive a verification link shortly",
        200
      );
      return;
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      sendSuccess(
        res,
        null,
        "Your email is already verified. You can log in to your account.",
        200
      );
      return;
    }
    // Generate new verification token
    const { token, hash, expiresAt } = createToken(
      TOKEN_EXPIRATION.EMAIL_CONFIRMATION
    );

    // Update user with new verification token
    user.verificationToken = hash;
    user.verificationTokenExpiry = expiresAt;
    await user.save();
    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        token
      );
    } catch (emailError) {
      logger.error("Failed to send verification email:", emailError);
      sendError(
        res,
        "Failed to send verification email",
        { email: "Error sending verification email, please try again later" },
        500
      );
      return;
    }

    sendSuccess(res, null, "Verification link sent to your email address", 200);
  } catch (error) {
    logger.error("Resend verification email error:", error);
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
      isEmailVerified: user.isEmailVerified,
    };

    sendSuccess(res, userData, "User profile retrieved successfully", 200);
  } catch (error) {
    logger.error("Error fetching user:", error);
    next(error);
  }
};
