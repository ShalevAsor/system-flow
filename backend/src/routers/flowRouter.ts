import express from "express";
import {
  getFlowById,
  getFlows,
  removeFlowById,
  saveFlow,
} from "../controllers/flowController";
import middleware from "../middlewares/middleware";

const router = express.Router();

// Get all flows for the current user
router.get("/", middleware.protect, getFlows);

// Save a new flow
router.post("/", middleware.protect, saveFlow);
// Get a specific flow by ID
router.get("/:id", middleware.protect, getFlowById);
// Remove a specific flow by ID
router.delete("/:id", middleware.protect, removeFlowById);
export default router;
