import express from "express";
import {
  updateUserProfile,
  changeUserPassword,
  getUserProfile,
} from "../controllers/profileController";

import {
  updateProfileValidationRules,
  changePasswordValidationRules,
} from "../validations/profileValidation";
import middleware from "../middlewares/middleware";

const router = express.Router();

router.get("/", middleware.protect, getUserProfile);

router.put(
  "/",
  middleware.protect,
  updateProfileValidationRules,
  middleware.validate,
  updateUserProfile
);
// Change password route
router.put(
  "/change-password",
  middleware.protect,
  changePasswordValidationRules,
  middleware.validate,
  changeUserPassword
);
export default router;
