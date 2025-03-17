import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import logger from "../utils/logger";
import { sendSuccess, sendError } from "../utils/responseFormatter";
import { UserResponse, ApiResponse } from "../types/responsesTypes";

/**
 * Get user profile
 */
export const getUserProfile = async (
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
/**
 * Update user profile
 */
export const updateUserProfile = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from the request
    const userId = req.user?.id;
    const { firstName, lastName } = req.body;
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      sendError(
        res,
        "User not found",
        { id: "User with provided ID does not exist" },
        404
      );
      return;
    }
    // Create an empty update object
    const updateFields: { firstName?: string; lastName?: string } = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (Object.keys(updateFields).length === 0) {
      sendError(res, "No fields to update", undefined, 400);
      return;
    }
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
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
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      isEmailVerified: updatedUser.isEmailVerified,
    };
    sendSuccess(res, userData, "User profile updated successfully", 200);
  } catch (error) {
    logger.error("Error updating user profile:", error);
    next(error);
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from the request
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      sendError(
        res,
        "User not found",
        { id: "User with provided ID does not exist" },
        404
      );
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(
        res,
        "Incorrect current password",
        { currentPassword: "Current password is incorrect" },
        400
      );
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, "Password has been changed successfully", 200);
  } catch (error) {
    logger.error("Error changing password:", error);
    next(error);
  }
};
