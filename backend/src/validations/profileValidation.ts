import { body } from "express-validator";

export const updateProfileValidationRules = [
  body("firstName")
    .optional() // This makes the field optional
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("First name must contain only letters and spaces")
    .trim(),

  body("lastName")
    .optional() // This makes the field optional
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Last name must contain only letters and spaces")
    .trim(),
];

// Validation  rules for password change
export const changePasswordValidationRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];
