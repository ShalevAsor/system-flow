import express from "express";
import { register, login, getCurrentUser } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Register route
router.post("/register", register);
// Login route
router.post("/login", login);
// Get current user route
router.get("/me", protect, getCurrentUser);

export default router;
