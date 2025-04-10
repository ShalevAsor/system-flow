import { NextFunction, Request, Response } from "express";
import { Flow } from "../models/Flow";
import logger from "../utils/logger";
import { sendSuccess, sendError } from "../utils/responseFormatter";
import { ApiResponse } from "../types/responsesTypes";
import { IFlow } from "../models/Flow";
import { FlowItem } from "../types/flowTypes";

/**
 * Get all flows for the current user
 * @route GET /api/flows
 * @access Private
 */
export const getFlows = async (
  req: Request,
  res: Response<ApiResponse<FlowItem[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from the request
    const userId = req.user?.id;
    // Find all flows for this user
    const flows = await Flow.find({ userId }).sort({ updatedAt: -1 });
    const flowItems = flows.map((flow) => {
      const flowItem: FlowItem = {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes.length,
        edges: flow.edges.length,
        updatedAt: flow.updatedAt,
      };
      return flowItem;
    });
    sendSuccess(res, flowItems, "Flows retrieved successfully", 200);
  } catch (error) {
    logger.error("Error fetching flows:", error);
    next(error);
  }
};

/**
 * Save a new flow
 * @route POST /api/flows
 * @access Private
 */
export const saveFlow = async (
  req: Request,
  res: Response<ApiResponse<IFlow>>,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("save flow is called");
    // Get user ID from the request
    const userId = req.user?.id;

    // Extract flow data from request body
    const { name, description, nodes, edges } = req.body;

    // Create new flow
    const flow = new Flow({
      userId,
      name,
      description,
      nodes,
      edges,
    });
    await flow.save();

    sendSuccess(
      res,
      flow,
      "Flow saved successfully",
      201 // 201 Created status code
    );
  } catch (error) {
    logger.error("Error saving flow:", error);
    next(error);
  }
};
/**
 * Get a flow by ID
 * @route GET /api/flows/:id
 * @access Private
 */
export const getFlowById = async (
  req: Request,
  res: Response<ApiResponse<IFlow>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Find the flow by ID and user ID
    const flow = await Flow.findOne({ _id: id, userId });

    if (!flow) {
      sendError(res, "Flow not found", undefined, 404);
      return;
    }

    sendSuccess(res, flow, "Flow retrieved successfully", 200);
  } catch (error) {
    logger.error("Error fetching flow:", error);
    next(error);
  }
};

/**
 * Remove a flow by ID
 * @route DELETE /api/flows/:id
 * @access Private
 */
export const removeFlowById = async (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Find the flow by ID and user ID
    const flow = await Flow.findOne({ _id: id, userId });

    if (!flow) {
      sendError(res, "Flow not found", undefined, 404);
      return;
    }

    // Delete the flow
    await Flow.findByIdAndDelete(id);

    sendSuccess(res, null, "Flow removed successfully", 200);
  } catch (error) {
    logger.error("Error removing flow:", error);
    next(error);
  }
};
