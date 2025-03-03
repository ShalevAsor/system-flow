import { body } from "express-validator";

export const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .trim(),
];

// Validation rules for user login
export const loginValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),

  body("password").notEmpty().withMessage("Password is required"),
];
