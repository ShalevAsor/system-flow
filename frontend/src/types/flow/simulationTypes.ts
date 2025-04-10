import { AuthenticationMethod, Protocol } from "./common";

// ==============================
// Common Simulation types
// ==============================
export type SimulationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type SimulationRequestType =
  | "Read"
  | "Write"
  | "Compute"
  | "Transaction";

export interface ProcessingData {
  retryCount: number;
  processingTime: number; // Time spent processing this request
  requiredProcessingTime: number; // Time required to process this request
  nodeUtilization: Record<string, number>; // Utilization of each node
  edgeUtilization: Record<string, number>; // Utilization of each edge
  edgeToDecreaseId?: string; // The id of the edge the request processor should decrease utilization on
  totalProcessingTime: number;
}
/**
 * Represents a request/data packet moving through the system during simulation
 */
export interface SimulationRequest {
  /* Common metadata */
  id: string;
  type: SimulationRequestType;
  status: SimulationStatus;
  sourceNodeId: string; // Where the request originated (usually a client)
  currentNodeId: string; // Current node processing this request
  prevNodeId?: string;
  destinationNodeId: string; // Final destination
  path: string[]; // The nodes visited in order
  preferredProtocol?: Protocol;
  currentEdgeId?: string; // The edge the request is currently on

  /* Size and timing information */
  sizeKB: number; // Size in KB
  createdAt: number; // Simulation time when created
  completedAt?: number; // Simulation time when completed
  failedAt?: number; // Simulation time when/if failed
  failureReason?: string;
  /* Client specific properties */
  secureConnection: boolean;
  authMethod?: AuthenticationMethod;
  maxRetries: number;
  sourceRegion: string;
  cacheEnabled: boolean;
  retryOnError: boolean;
  /* Processing-specific data */
  processingData: ProcessingData;
}

/**
 * A single data point for time-series metrics
 */
export interface MetricDataPoint {
  timestamp: number;
  activeRequestCount: number;
  completedRequestCount: number;
  failedRequestCount: number;
  averageResponseTime: number;
  averageRequestSize: number;
}

export interface RequestProcessorResult {
  activeRequests: SimulationRequest[];
  completedRequests: SimulationRequest[];
  failedRequests: SimulationRequest[];
  componentUtilization: ComponentUtilization;
}

/**
 * Component utilization data for visualization and metrics
 */
export interface ComponentUtilization {
  nodeUtilization: Record<string, number>; // 0-1 values representing load
  edgeUtilization: Record<string, number>; // 0-1 values representing traffic
}
