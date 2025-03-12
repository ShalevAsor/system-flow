import express from "express";
import {
  register,
  login,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";

import {
  registerValidationRules,
  loginValidationRules,
  verifyEmailValidationRules,
  resendVerificationEmailValidationRules,
  requestPasswordResetValidationRules,
  resetPasswordValidationRules,
} from "../validations/authValidation";
import middleware from "../middlewares/middleware";

const router = express.Router();

// Register route
router.post(
  "/register",
  registerValidationRules,
  middleware.validate,
  register
);
// Login route
router.post("/login", loginValidationRules, middleware.validate, login);

// Email verification route
router.get(
  "/verify-email",
  verifyEmailValidationRules,
  middleware.validate,
  verifyEmail
);

// Resend verification email route
router.post(
  "/resend-verification",
  resendVerificationEmailValidationRules,
  middleware.validate,
  resendVerificationEmail
);

// Request password reset route
router.post(
  "/forgot-password",
  requestPasswordResetValidationRules,
  middleware.validate,
  requestPasswordReset
);

// Reset password route
router.post(
  "/reset-password",
  resetPasswordValidationRules,
  middleware.validate,
  resetPassword
);

// Get current user route
router.get("/me", middleware.protect, getCurrentUser);

export default router;
