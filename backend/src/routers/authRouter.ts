import express from "express";
import { register, login, getCurrentUser } from "../controllers/authController";

import {
  registerValidationRules,
  loginValidationRules,
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
// Get current user route
router.get("/me", middleware.protect, getCurrentUser);

export default router;
