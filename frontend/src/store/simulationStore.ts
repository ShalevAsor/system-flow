import { create } from "zustand";
import { useFlowStore } from "./flowStore";
import { requestGenerator } from "../services/flow/generators/requestGenerator";
import {
  ComponentUtilization,
  MetricDataPoint,
  SimulationRequest,
} from "../types/flow/simulationTypes";
import { requestProcessor } from "../services/flow/processors/requestProcessor";

// Constants
const TICK_INTERVAL = 100; // How often the simulation updates (ms)
const MAX_HISTORY_LENGTH = 1000; // Maximum history length to prevent memory issues
const MAX_METRIC_HISTORY_LENGTH = 100;

// Simulation state interface
interface SimulationState {
  // Status
  isRunning: boolean;
  isPaused: boolean;

  // Time
  elapsedTime: number; // in milliseconds
  timerRef: number | null;

  // Request tracking
  activeRequests: number;
  completedRequests: number;
  failedRequests: number;
  averageResponseTime: number; // in milliseconds
  averageRequestSize: number; // in KB

  // Metrics
  requestsInFlight: SimulationRequest[]; // Active requests in the simulation
  completedRequestsHistory: SimulationRequest[]; // For analysis
  failedRequestsHistory: SimulationRequest[]; // For analysis
  componentUtilization: ComponentUtilization; // For visualization
  metricHistory: MetricDataPoint[]; // For time-series charts

  // Actions
  startSimulation: () => void;
  resetSimulation: () => void;
  resumeSimulation: () => void;
  pauseSimulation: () => void;

  // Internal simulation tick method
  tick: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Status
  isRunning: false,
  isPaused: false,

  // Time
  elapsedTime: 0,
  timerRef: null,

  // Request tracking
  activeRequests: 0,
  completedRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  averageRequestSize: 0,

  // Metrics
  requestsInFlight: [],
  completedRequestsHistory: [],
  completedResponseHistory: [],
  failedRequestsHistory: [],
  componentUtilization: {
    nodeUtilization: {},
    edgeUtilization: {},
  },
  metricHistory: [],

  // Actions
  startSimulation: () => {
    const state = get();
    if (state.isRunning) return;

    // Set all edges to animated state
    const flowStore = useFlowStore.getState();
    flowStore.setAllEdgesAnimated(true);

    // Start the timer
    const timerRef = window.setInterval(() => {
      get().tick();
    }, TICK_INTERVAL);

    set({
      isRunning: true,
      isPaused: false,
      timerRef,
    });
  },

  resetSimulation: () => {
    const state = get();

    // Clear the timer
    if (state.timerRef !== null) {
      window.clearInterval(state.timerRef);
    }

    // Reset all edges animated state
    const flowStore = useFlowStore.getState();
    flowStore.setAllEdgesAnimated(false);

    set({
      isRunning: false,
      isPaused: false,
      elapsedTime: 0,
      activeRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      averageRequestSize: 0,
      requestsInFlight: [],
      completedRequestsHistory: [],
      failedRequestsHistory: [],
      componentUtilization: {
        nodeUtilization: {},
        edgeUtilization: {},
      },
      metricHistory: [],
      timerRef: null,
    });
  },

  resumeSimulation: () => {
    const state = get();
    if (state.isRunning && !state.isPaused) return;

    // Set all edges to animated state
    const flowStore = useFlowStore.getState();
    flowStore.setAllEdgesAnimated(true);

    // Start the timer again
    const timerRef = window.setInterval(() => {
      get().tick();
    }, TICK_INTERVAL);

    set({
      isPaused: false,
      isRunning: true,
      timerRef,
    });
  },

  pauseSimulation: () => {
    const state = get();

    // Clear the timer
    if (state.timerRef !== null) {
      window.clearInterval(state.timerRef);
    }

    // Reset all edges animated state
    const flowStore = useFlowStore.getState();
    flowStore.setAllEdgesAnimated(false);

    set({
      isPaused: true,
      isRunning: false,
      timerRef: null,
    });
  },

  // The main simulation tick function
  tick: () => {
    set((state) => {
      // Don't update if simulation is not running or is paused
      if (!state.isRunning || state.isPaused) {
        return state;
      }

      // Get the current simulation time increment based on speed
      const timeStep = TICK_INTERVAL;
      const newElapsedTime = state.elapsedTime + timeStep;

      // Get current flow configuration from flow store
      const flowStore = useFlowStore.getState();
      const { nodes, edges } = flowStore;

      // Step 1: Generate new requests from client nodes
      const newRequests = requestGenerator.generateRequests(
        nodes,
        edges,
        newElapsedTime,
        timeStep
      );

      // Step 2: Process active requests
      const {
        activeRequests: updatedActiveRequests,
        completedRequests: newlyCompletedRequests,
        failedRequests: newlyFailedRequests,
        componentUtilization,
      } = requestProcessor.processRequests(
        [...state.requestsInFlight, ...newRequests],
        nodes,
        edges,
        timeStep,
        newElapsedTime,
        state.componentUtilization
      );

      // Step 3: Update request counts
      const totalCompletedRequests =
        state.completedRequests + newlyCompletedRequests.length;
      const totalFailedRequests =
        state.failedRequests + newlyFailedRequests.length;

      // Step 4: Manage history arrays
      const completedRequestsHistory = [
        ...state.completedRequestsHistory,
        ...newlyCompletedRequests,
      ].slice(-MAX_HISTORY_LENGTH);

      const failedRequestsHistory = [
        ...state.failedRequestsHistory,
        ...newlyFailedRequests,
      ].slice(-MAX_HISTORY_LENGTH);

      // Step 5: Calculate new average response time

      let newAverageResponseTime = state.averageResponseTime;

      if (newlyCompletedRequests.length > 0) {
        // Calculate average response time for newly completed requests
        const validCompletedRequests = newlyCompletedRequests.filter(
          (req) => req.completedAt && req.completedAt > req.createdAt
        );

        if (validCompletedRequests.length > 0) {
          const totalResponseTime = validCompletedRequests.reduce(
            (sum, req) => {
              // Calculate processing efficiency (processing time per node)
              const pathLength = req.path.length || 1;
              const processingEfficiency =
                (req.processingData.totalProcessingTime / pathLength) *
                (req.processingData.requiredProcessingTime / 10);
              // Use processing efficiency instead of wall clock time
              return sum + Math.min(processingEfficiency, 1000);
            },
            0
          );

          const newRequestsAvgTime =
            totalResponseTime / validCompletedRequests.length;

          // Apply weighted average with existing response time
          if (newRequestsAvgTime > 0 && newRequestsAvgTime < 30000) {
            if (state.completedRequests > 0) {
              newAverageResponseTime =
                (state.averageResponseTime * state.completedRequests +
                  newRequestsAvgTime * validCompletedRequests.length) /
                totalCompletedRequests;
            } else {
              newAverageResponseTime = newRequestsAvgTime;
            }
          }
        }
      }
      // Step 6: Calculate Average request size
      let newAvgRequestSize = state.averageRequestSize;

      if (newlyCompletedRequests.length > 0) {
        // Calculate average request size for newly completed requests
        const totalRequestSize = newlyCompletedRequests.reduce(
          (sum, req) => sum + (req.sizeKB || 0),
          0
        );

        const newRequestsAvgSize =
          totalRequestSize / newlyCompletedRequests.length;

        // Apply weighted average with existing request size
        if (state.completedRequests > 0) {
          newAvgRequestSize =
            (state.averageRequestSize * state.completedRequests +
              newRequestsAvgSize * newlyCompletedRequests.length) /
            totalCompletedRequests;
        } else {
          newAvgRequestSize = newRequestsAvgSize;
        }
      }
      // Step 7: Update metric history if needed
      // This could track utilization, response times, etc. over time
      const currentMetric: MetricDataPoint = {
        timestamp: newElapsedTime,
        activeRequestCount: updatedActiveRequests.length,
        failedRequestCount: failedRequestsHistory.length,
        completedRequestCount: totalCompletedRequests,
        averageResponseTime: newAverageResponseTime,
        averageRequestSize: newAvgRequestSize,
      };

      const metricHistory = [...state.metricHistory, currentMetric].slice(
        -MAX_METRIC_HISTORY_LENGTH
      );

      // Step 8: Return updated state
      return {
        ...state,
        elapsedTime: newElapsedTime,
        activeRequests: updatedActiveRequests.length,
        requestsInFlight: updatedActiveRequests,
        completedRequests: totalCompletedRequests,
        failedRequests: totalFailedRequests,
        completedRequestsHistory,
        failedRequestsHistory,
        averageResponseTime: newAverageResponseTime,
        averageRequestSize: newAvgRequestSize,
        componentUtilization,
        metricHistory,
      };
    });
  },
}));
