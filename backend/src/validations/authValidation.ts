// backend/src/validations/authValidation.js
import { body, query } from "express-validator";

export const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("First name must contain only letters and spaces")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Last name must contain only letters and spaces")
    .trim(),
];

// Validation rules for user login
export const loginValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

// ------------------------------------------
// Validation rules for email verification
export const verifyEmailValidationRules = [
  query("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .isString()
    .withMessage("Verification token must be a string"),
];

// Validation rules for password reset request
export const requestPasswordResetValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
];

// Validation rules for password reset
export const resetPasswordValidationRules = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isString()
    .withMessage("Reset token must be a string"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Validation rules for resending verification email
export const resendVerificationEmailValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
];
