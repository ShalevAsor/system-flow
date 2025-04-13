// src/store/simulationStore.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { useSimulationStore } from "./simulationStore";
import { useFlowStore } from "./flowStore";
import { requestGenerator } from "../services/flow/generators/requestGenerator";
import { requestProcessor } from "../services/flow/processors/requestProcessor";
import { NodeType } from "../types/flow/nodeTypes";
import { EdgeType } from "../types/flow/edgeTypes";
import {
  SimulationRequest,
  MetricDataPoint,
} from "../types/flow/simulationTypes";
import { createNode } from "../utils/flow/nodeUtils";
import { createEdge } from "../utils/flow/edgeUtils";
import type { FlowState } from "./flowStore";

// Mock the setAllEdgesAnimated function
const mockSetAllEdgesAnimated = vi.fn();

// Create partial FlowState for mocking
const createPartialFlowState = (overrides = {}) => {
  const defaultState: Partial<FlowState> = {
    nodes: [],
    edges: [],
    setAllEdgesAnimated: mockSetAllEdgesAnimated,
  };
  return { ...defaultState, ...overrides };
};

// Mock dependencies
vi.mock("./flowStore", () => ({
  useFlowStore: {
    getState: vi.fn(() => createPartialFlowState()),
  },
}));

vi.mock("../services/flow/generators/requestGenerator", () => ({
  requestGenerator: {
    generateRequests: vi.fn(() => []),
  },
}));

vi.mock("../services/flow/processors/requestProcessor", () => ({
  requestProcessor: {
    processRequests: vi.fn(() => ({
      activeRequests: [],
      completedRequests: [],
      failedRequests: [],
      componentUtilization: {
        nodeUtilization: {},
        edgeUtilization: {},
      },
    })),
  },
}));

// Mock for window.setInterval and window.clearInterval
beforeEach(() => {
  vi.useFakeTimers();
  mockSetAllEdgesAnimated.mockClear(); // Clear the mock before each test
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useSimulationStore", () => {
  // Reset the store before each test
  beforeEach(() => {
    act(() => {
      useSimulationStore.getState().resetSimulation();
    });
  });

  describe("Initial state", () => {
    it("should have the correct initial state", () => {
      const state = useSimulationStore.getState();

      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.elapsedTime).toBe(0);
      expect(state.timerRef).toBeNull();
      expect(state.activeRequests).toBe(0);
      expect(state.completedRequests).toBe(0);
      expect(state.failedRequests).toBe(0);
      expect(state.averageResponseTime).toBe(0);
      expect(state.averageRequestSize).toBe(0);
      expect(state.requestsInFlight).toEqual([]);
      expect(state.completedRequestsHistory).toEqual([]);
      expect(state.failedRequestsHistory).toEqual([]);
      expect(state.componentUtilization).toEqual({
        nodeUtilization: {},
        edgeUtilization: {},
      });
      expect(state.metricHistory).toEqual([]);
    });
  });

  describe("Start simulation", () => {
    it("should set isRunning to true and set a timer", () => {
      act(() => {
        useSimulationStore.getState().startSimulation();
      });

      const state = useSimulationStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.timerRef).not.toBeNull();

      // Verify that setAllEdgesAnimated was called
      expect(mockSetAllEdgesAnimated).toHaveBeenCalledWith(true);
    });

    it("should not start a new timer if already running", () => {
      act(() => {
        const store = useSimulationStore.getState();
        store.startSimulation();
        const firstTimerRef = store.timerRef;

        // Try to start again
        store.startSimulation();

        // Timer reference should not have changed
        expect(store.timerRef).toBe(firstTimerRef);
      });
    });
  });

  describe("Pause simulation", () => {
    it("should pause a running simulation", () => {
      act(() => {
        const store = useSimulationStore.getState();
        store.startSimulation();

        // Reset the mock to check just the pauseSimulation effect
        mockSetAllEdgesAnimated.mockClear();

        store.pauseSimulation();
      });

      const state = useSimulationStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(true);
      expect(state.timerRef).toBeNull();

      // Verify that setAllEdgesAnimated was called with false
      expect(mockSetAllEdgesAnimated).toHaveBeenCalledWith(false);
    });
  });

  describe("Resume simulation", () => {
    it("should resume a paused simulation", () => {
      act(() => {
        const store = useSimulationStore.getState();
        store.startSimulation();
        store.pauseSimulation();

        // Reset the mock to check just the resumeSimulation effect
        mockSetAllEdgesAnimated.mockClear();

        store.resumeSimulation();
      });

      const state = useSimulationStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.timerRef).not.toBeNull();

      // Verify that setAllEdgesAnimated was called with true
      expect(mockSetAllEdgesAnimated).toHaveBeenCalledWith(true);
    });
  });

  describe("Reset simulation", () => {
    it("should reset all simulation state", () => {
      // Setup some non-default state
      act(() => {
        const store = useSimulationStore.getState();
        store.startSimulation();

        // Create mock request object with proper typing
        const mockRequest: SimulationRequest = {
          id: "test",
          type: "Read",
          status: "pending",
          sourceNodeId: "source",
          currentNodeId: "current",
          destinationNodeId: "dest",
          path: ["path1"],
          sizeKB: 10,
          createdAt: 100,
          secureConnection: false,
          maxRetries: 3,
          sourceRegion: "us-east",
          cacheEnabled: true,
          retryOnError: true,
          processingData: {
            retryCount: 0,
            processingTime: 0,
            requiredProcessingTime: 100,
            nodeUtilization: {},
            edgeUtilization: {},
            totalProcessingTime: 0,
          },
        };

        // Create mock metric point with proper typing
        const mockMetricPoint: MetricDataPoint = {
          timestamp: 500,
          activeRequestCount: 1,
          completedRequestCount: 2,
          failedRequestCount: 0,
          averageResponseTime: 150,
          averageRequestSize: 12,
        };

        // Manually set some state values
        useSimulationStore.setState({
          elapsedTime: 1000,
          activeRequests: 5,
          completedRequests: 10,
          failedRequests: 2,
          averageResponseTime: 250,
          averageRequestSize: 15,
          requestsInFlight: [mockRequest],
          completedRequestsHistory: [mockRequest],
          failedRequestsHistory: [mockRequest],
          componentUtilization: {
            nodeUtilization: { node1: 0.5 },
            edgeUtilization: { edge1: 0.7 },
          },
          metricHistory: [mockMetricPoint],
        });

        // Reset the mock to check just the resetSimulation effect
        mockSetAllEdgesAnimated.mockClear();

        // Now reset
        store.resetSimulation();
      });

      // Verify all state is reset to initial values
      const state = useSimulationStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.elapsedTime).toBe(0);
      expect(state.timerRef).toBeNull();
      expect(state.activeRequests).toBe(0);
      expect(state.completedRequests).toBe(0);
      expect(state.failedRequests).toBe(0);
      expect(state.averageResponseTime).toBe(0);
      expect(state.averageRequestSize).toBe(0);
      expect(state.requestsInFlight).toEqual([]);
      expect(state.completedRequestsHistory).toEqual([]);
      expect(state.failedRequestsHistory).toEqual([]);
      expect(state.componentUtilization).toEqual({
        nodeUtilization: {},
        edgeUtilization: {},
      });
      expect(state.metricHistory).toEqual([]);

      // Verify that setAllEdgesAnimated was called with false
      expect(mockSetAllEdgesAnimated).toHaveBeenCalledWith(false);
    });
  });

  describe("Simulation tick", () => {
    it("should not update state if simulation is not running", () => {
      // Setup mock state
      act(() => {
        useSimulationStore.setState({
          isRunning: false,
          elapsedTime: 1000,
        });
      });

      // Call tick directly
      act(() => {
        useSimulationStore.getState().tick();
      });

      // Elapsed time should not have changed
      expect(useSimulationStore.getState().elapsedTime).toBe(1000);

      // The generator and processor should not have been called
      expect(requestGenerator.generateRequests).not.toHaveBeenCalled();
      expect(requestProcessor.processRequests).not.toHaveBeenCalled();
    });

    it("should update state on tick when simulation is running", () => {
      // Setup a running simulation with mock nodes and edges
      const n1 = createNode(NodeType.Client, "test-node", { x: 0, y: 0 });
      const n2 = createNode(NodeType.Client, "test-node", { x: 0, y: 0 });
      const edge = createEdge(EdgeType.HTTP, n1.id, n2.id);
      const mockNodes = [n1, n2];
      const mockEdges = [edge];

      // Create proper typed mock request
      const mockRequest: SimulationRequest = {
        id: "req1",
        type: "Read",
        status: "pending",
        sourceNodeId: "client1",
        currentNodeId: "client1",
        destinationNodeId: "server1",
        path: ["client1"],
        sizeKB: 5,
        createdAt: 100,
        secureConnection: false,
        maxRetries: 3,
        sourceRegion: "us-east",
        cacheEnabled: false,
        retryOnError: true,
        processingData: {
          retryCount: 0,
          processingTime: 0,
          requiredProcessingTime: 100,
          nodeUtilization: {},
          edgeUtilization: {},
          totalProcessingTime: 0,
        },
      };

      // Create completed request with proper typing
      const completedRequest: SimulationRequest = {
        ...mockRequest,
        status: "completed",
        completedAt: 200,
      };

      vi.mocked(requestGenerator.generateRequests).mockReturnValue([
        mockRequest,
      ]);

      // Mock the processor to return completed request
      vi.mocked(requestProcessor.processRequests).mockReturnValue({
        activeRequests: [],
        completedRequests: [completedRequest],
        failedRequests: [],
        componentUtilization: {
          nodeUtilization: { client1: 0.2, server1: 0.5 },
          edgeUtilization: { edge1: 0.3 },
        },
      });

      // Mock flow store with the test data
      vi.mocked(useFlowStore.getState).mockReturnValue(
        createPartialFlowState({
          nodes: mockNodes,
          edges: mockEdges,
        }) as FlowState
      );

      // Setup the simulation state
      act(() => {
        useSimulationStore.setState({
          isRunning: true,
          isPaused: false,
          elapsedTime: 0,
          requestsInFlight: [],
          completedRequests: 0,
          failedRequests: 0,
          completedRequestsHistory: [],
          failedRequestsHistory: [],
          componentUtilization: {
            nodeUtilization: {},
            edgeUtilization: {},
          },
        });
      });

      // Trigger a tick
      act(() => {
        useSimulationStore.getState().tick();
      });

      // Verify state was updated correctly
      const state = useSimulationStore.getState();
      expect(state.elapsedTime).toBe(100); // TICK_INTERVAL is 100
      expect(state.completedRequests).toBe(1);
      expect(state.completedRequestsHistory.length).toBe(1);
      expect(state.componentUtilization.nodeUtilization).toEqual({
        client1: 0.2,
        server1: 0.5,
      });
      expect(state.metricHistory.length).toBe(1);

      // Verify the generator and processor were called with correct parameters
      expect(requestGenerator.generateRequests).toHaveBeenCalledWith(
        mockNodes,
        mockEdges,
        100, // new elapsed time
        100 // time step
      );

      expect(requestProcessor.processRequests).toHaveBeenCalledWith(
        [mockRequest],
        mockNodes,
        mockEdges,
        100, // time step
        100, // new elapsed time
        { nodeUtilization: {}, edgeUtilization: {} }
      );
    });

    it("should handle timer interactions correctly", () => {
      // Setup spy on setInterval and clearInterval
      const setIntervalSpy = vi.spyOn(window, "setInterval");
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");

      // Start simulation
      act(() => {
        useSimulationStore.getState().startSimulation();
      });

      // Verify setInterval was called
      expect(setIntervalSpy).toHaveBeenCalled();

      // Pause simulation
      act(() => {
        useSimulationStore.getState().pauseSimulation();
      });

      // Verify clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled();

      // Reset counters
      setIntervalSpy.mockClear();
      clearIntervalSpy.mockClear();

      // Resume simulation
      act(() => {
        useSimulationStore.getState().resumeSimulation();
      });

      // Verify setInterval was called again
      expect(setIntervalSpy).toHaveBeenCalled();

      // Reset simulation
      act(() => {
        useSimulationStore.getState().resetSimulation();
      });

      // Verify clearInterval was called again
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
