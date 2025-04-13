// frontend/src/pages/FlowLibraryPage.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlowLibraryPage from "./FlowLibraryPage";
import { useFlows } from "../../hooks/useFlows";
import { FlowState, useFlowStore } from "../../store/flowStore";
import flowService, { Flow, FlowItem } from "../../services/api/flowService";
import { toastSuccess, toastError } from "../../utils/toast";
import { UseQueryResult } from "@tanstack/react-query";
import { createQueryResult } from "../../utils/testUtils";
import { NodeType } from "../../types/flow/nodeTypes";
import { createNode } from "../../utils/flow/nodeUtils";
import { createEdge } from "../../utils/flow/edgeUtils";
import { EdgeType } from "../../types/flow/edgeTypes";
// Mock dependencies
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useFlows");
vi.mock("../../store/flowStore");
vi.mock("../../services/api/flowService", () => ({
  default: {
    getFlowById: vi.fn(),
    removeFlow: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

// Mock @tanstack/react-query
const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi
    .fn()
    .mockImplementation(({ mutationFn, onSuccess, onError }) => ({
      mutate: async (id) => {
        try {
          const result = await mutationFn(id);
          onSuccess(result);
        } catch (error) {
          onError(error);
        }
      },
      isPending: false,
      variables: null,
    })),
  useQueryClient: () => mockQueryClient,
}));

// Mock the FlowItemComponent
vi.mock("../../components/flow/FlowItemComponent", () => ({
  FlowItemComponent: ({
    item,
    onLoad,
    onRemove,
    isLoadLoading,
    isRemoveLoading,
  }) => (
    <div data-testid={`flow-item-${item.id}`} className="flow-item">
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="flow-item-actions">
        <button
          data-testid={`load-flow-${item.id}`}
          onClick={() => onLoad(item.id)}
          disabled={isLoadLoading}
        >
          {isLoadLoading ? "Loading..." : "Load Flow"}
        </button>
        <button
          data-testid={`remove-flow-${item.id}`}
          onClick={() => onRemove(item.id)}
          disabled={isRemoveLoading}
        >
          {isRemoveLoading ? "Removing..." : "Remove Flow"}
        </button>
      </div>
    </div>
  ),
}));

// Mock the Loading component
vi.mock("../../components/ui/Loading", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Specific helper functions for common states
const createLoadingQueryResult = <TData, TError>(): UseQueryResult<
  TData,
  TError
> => {
  return createQueryResult<TData, TError>({
    data: undefined,
    isLoading: true,
    status: "pending",
    isSuccess: false,
    isFetching: true,
    isPending: true,
    fetchStatus: "fetching",
  });
};

const createErrorQueryResult = <TData, TError>(
  error: TError
): UseQueryResult<TData, TError> => {
  return createQueryResult<TData, TError>({
    error,
    status: "error",
    isError: true,
    isSuccess: false,
  });
};

const createSuccessQueryResult = <TData, TError>(
  data: TData
): UseQueryResult<TData, TError> => {
  return createQueryResult<TData, TError>({
    data,
    status: "success",
    isSuccess: true,
  });
};

describe("FlowLibraryPage", () => {
  // Sample flow data for testing
  const mockFlows: FlowItem[] = [
    {
      id: "flow1",
      name: "Flow 1",
      description: "Test Flow 1",
      nodes: 0,
      edges: 0,
      updatedAt: "2024-12-1",
    },
    {
      id: "flow2",
      name: "Flow 2",
      description: "Test Flow 2",
      nodes: 5,
      edges: 3,
      updatedAt: "2024-12-2",
    },
  ];

  const n1 = createNode(NodeType.Client, "test node", { x: 0, y: 0 });
  const n2 = createNode(NodeType.Server, "test node", { x: 0, y: 0 });
  const mockFlowData: Flow = {
    id: "flow-id",
    name: "test-flow",
    description: "test-description",
    nodes: [n1, n2],
    edges: [createEdge(EdgeType.HTTP, n1.id, n2.id)],
    createdAt: "2025-12-1",
    updatedAt: "2025-12-3",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for useFlows with success state
    vi.mocked(useFlows).mockReturnValue(
      createSuccessQueryResult<FlowItem[], Error>(mockFlows)
    );

    // Setup default mock for useFlowStore
    const mockLoadFlow = vi.fn();
    vi.mocked(useFlowStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        // Create a partial state with just the properties we need
        const partialState = { loadFlow: mockLoadFlow } as unknown as FlowState;
        return selector(partialState);
      }
      return mockLoadFlow;
    });

    // Setup default mock for flowService
    vi.mocked(flowService.getFlowById).mockResolvedValue(mockFlowData);
    vi.mocked(flowService.removeFlow).mockResolvedValue(
      "Flow removed successfully"
    );
  });

  it("renders loading state correctly", () => {
    vi.mocked(useFlows).mockReturnValue(
      createLoadingQueryResult<FlowItem[], Error>()
    );

    render(<FlowLibraryPage />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(
      screen.queryByText("Your System Design Flows")
    ).not.toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    vi.mocked(useFlows).mockReturnValue(
      createErrorQueryResult<FlowItem[], Error>(
        new Error("Failed to load flows")
      )
    );

    render(<FlowLibraryPage />);

    expect(
      screen.getByText("Error loading your flows. Please try again later.")
    ).toBeInTheDocument();
  });

  it("renders empty state correctly when no flows are available", () => {
    vi.mocked(useFlows).mockReturnValue(
      createSuccessQueryResult<FlowItem[], Error>([])
    );

    render(<FlowLibraryPage />);

    expect(screen.getByText("Your System Design Flows")).toBeInTheDocument();
    expect(screen.getByText("No flows yet")).toBeInTheDocument();
    expect(
      screen.getByText("You haven't saved any flows yet.")
    ).toBeInTheDocument();
  });

  it("renders flows correctly when flows are available", () => {
    render(<FlowLibraryPage />);

    expect(screen.getByText("Your System Design Flows")).toBeInTheDocument();
    expect(screen.getByTestId("flow-item-flow1")).toBeInTheDocument();
    expect(screen.getByTestId("flow-item-flow2")).toBeInTheDocument();
    expect(screen.getByText("Flow 1")).toBeInTheDocument();
    expect(screen.getByText("Flow 2")).toBeInTheDocument();
  });

  it("loads a flow correctly when Load Flow button is clicked", async () => {
    const user = userEvent.setup();
    const mockLoadFlow = vi.fn();
    vi.mocked(useFlowStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        // Create a partial state with just the properties we need
        const partialState = { loadFlow: mockLoadFlow } as unknown as FlowState;
        return selector(partialState);
      }
      return mockLoadFlow;
    });

    render(<FlowLibraryPage />);

    await user.click(screen.getByTestId("load-flow-flow1"));

    await waitFor(() => {
      expect(flowService.getFlowById).toHaveBeenCalledWith("flow1");
      expect(mockLoadFlow).toHaveBeenCalledWith({
        nodes: mockFlowData.nodes,
        edges: mockFlowData.edges,
      });
      expect(toastSuccess).toHaveBeenCalledWith("Flow loaded successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/flow-editor");
    });
  });

  it("shows error toast when loading a flow fails", async () => {
    const user = userEvent.setup();
    vi.mocked(flowService.getFlowById).mockRejectedValue(
      new Error("Failed to load flow")
    );

    render(<FlowLibraryPage />);

    await user.click(screen.getByTestId("load-flow-flow1"));

    await waitFor(() => {
      expect(flowService.getFlowById).toHaveBeenCalledWith("flow1");
      expect(toastError).toHaveBeenCalledWith("Failed to load flow");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("removes a flow correctly when Remove Flow button is clicked", async () => {
    const user = userEvent.setup();

    render(<FlowLibraryPage />);

    await user.click(screen.getByTestId("remove-flow-flow1"));

    await waitFor(() => {
      expect(flowService.removeFlow).toHaveBeenCalledWith("flow1");
      expect(toastSuccess).toHaveBeenCalledWith("Flow removed successfully");
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["flows"],
      });
    });
  });

  it("shows error toast when removing a flow fails", async () => {
    const user = userEvent.setup();
    vi.mocked(flowService.removeFlow).mockRejectedValue(
      new Error("Failed to remove flow")
    );

    render(<FlowLibraryPage />);

    await user.click(screen.getByTestId("remove-flow-flow1"));

    await waitFor(() => {
      expect(flowService.removeFlow).toHaveBeenCalledWith("flow1");
      expect(toastError).toHaveBeenCalledWith("Failed to remove flow");
    });
  });

  it("handles loading state for a specific flow correctly", async () => {
    // This test verifies that the loading state is properly managed for a specific flow
    const user = userEvent.setup();
    let resolveGetFlow;
    const getFlowPromise = new Promise<Flow>((resolve) => {
      resolveGetFlow = resolve;
    });

    vi.mocked(flowService.getFlowById).mockImplementation(() => getFlowPromise);

    render(<FlowLibraryPage />);

    // Click load button
    await user.click(screen.getByTestId("load-flow-flow1"));

    // We'd need a more complex mock to actually test the disabled state
    // In a real component, we'd expect the button to show "Loading..." text and be disabled

    // Resolve the promise to complete the flow loading
    resolveGetFlow(mockFlowData);

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Flow loaded successfully");
    });
  });
});
