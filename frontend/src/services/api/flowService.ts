// export default flowService;
import apiClient from "./apiClient";
import { SystemDesignNode } from "../../types/flow/nodeTypes";
import { SystemDesignEdge } from "../../types/flow/edgeTypes";
import { ApiResponse } from "../../types/apiTypes";

// Types for request and response
export interface Flow {
  id: string;
  name: string;
  description: string;
  nodes: SystemDesignNode[];
  edges: SystemDesignEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowItem {
  id: string;
  name: string;
  description: string;
  nodes: number;
  edges: number;
  updatedAt: string;
}

interface SaveFlowRequest {
  name: string;
  description: string;
  nodes: SystemDesignNode[];
  edges: SystemDesignEdge[];
}

const flowService = {
  // Get all flows for the current user
  getFlows: async (): Promise<FlowItem[]> => {
    const response = await apiClient.get<ApiResponse<FlowItem[]>>("/flows");
    return response.data.data;
  },

  // Save a new flow
  saveFlow: async (flowData: SaveFlowRequest): Promise<Flow> => {
    const response = await apiClient.post<ApiResponse<Flow>>(
      "/flows",
      flowData
    );
    return response.data.data;
  },

  // Get a flow by ID
  getFlowById: async (id: string): Promise<Flow> => {
    const response = await apiClient.get<ApiResponse<Flow>>(`/flows/${id}`);
    return response.data.data;
  },

  // Remove a flow by ID
  removeFlow: async (id: string): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/flows/${id}`);
    return response.data.message;
  },
};

export default flowService;
