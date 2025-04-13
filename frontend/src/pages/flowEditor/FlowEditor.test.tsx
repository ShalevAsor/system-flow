import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlowEditorPage from "./FlowEditorPage";
import { useFlowStore } from "../../store/flowStore";
import { useSimulationStore } from "../../store/simulationStore";
import { NodeType } from "../../types/flow/nodeTypes";
import { EdgeType } from "../../types/flow/edgeTypes";

// Mock @xyflow/react - must be at the top level before any imports
vi.mock("@xyflow/react", () => ({
  ReactFlow: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="react-flow-mock">{children}</div>
    )),
  Background: vi
    .fn()
    .mockImplementation(() => <div data-testid="background-mock" />),
  Controls: vi
    .fn()
    .mockImplementation(() => <div data-testid="controls-mock" />),
  MiniMap: vi.fn().mockImplementation(() => <div data-testid="minimap-mock" />),
  Panel: vi
    .fn()
    .mockImplementation(({ children, position }) => (
      <div data-testid={`panel-${position}`}>{children}</div>
    )),
  ReactFlowProvider: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="react-flow-provider-mock">{children}</div>
    )),
  useReactFlow: vi.fn().mockReturnValue({
    screenToFlowPosition: vi.fn().mockImplementation(({ x, y }) => ({ x, y })),
  }),
  MarkerType: {
    Arrow: "arrow",
    ArrowClosed: "arrowclosed",
  },
}));

// Mock component dependencies
vi.mock("../../components/flow/FlowControl", () => ({
  FlowControl: () => <div data-testid="flow-control-mock">Flow Control</div>,
}));

vi.mock("../../components/flow/panels/ComponentsPanel", () => ({
  ComponentsPanel: () => (
    <div data-testid="components-panel-mock">Components Panel</div>
  ),
}));

vi.mock("../../components/flow/FlowLegend", () => ({
  FlowLegend: () => <div data-testid="flow-legend-mock">Flow Legend</div>,
}));

vi.mock("../../components/flow/panels/CollapsiblePanel", () => ({
  default: ({ children, title }) => (
    <div
      data-testid={`collapsible-panel-${title
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
    >
      <div>{children}</div>
    </div>
  ),
}));

vi.mock("../../components/flow/panels/NodePropertiesPanel", () => ({
  default: ({ selectedNode, onPropertyChange }) => (
    <div data-testid="node-properties-panel">
      <button
        data-testid="update-node-btn"
        onClick={() =>
          onPropertyChange(selectedNode.id, "label", "Updated Label")
        }
      >
        Update Node
      </button>
    </div>
  ),
}));

vi.mock("../../components/flow/panels/EdgePropertiesPanel", () => ({
  default: ({ selectedEdge, onPropertyChange }) => (
    <div data-testid="edge-properties-panel">
      <button
        data-testid="update-edge-btn"
        onClick={() =>
          onPropertyChange(selectedEdge.id, "label", "Updated Label")
        }
      >
        Update Edge
      </button>
    </div>
  ),
}));

vi.mock("../../components/flow/simulation/SimulationPanel", () => ({
  default: () => (
    <div data-testid="simulation-panel-mock">Simulation Panel</div>
  ),
}));

vi.mock("../../store/flowStore");
vi.mock("../../store/simulationStore");

// Create test helper functions
const createTestNode = (type, label, position) => ({
  id: `node-${type}-${Math.random().toString(36).substring(7)}`,
  type,
  position,
  data: { label, properties: {} },
});

const createTestEdge = (type, source, target) => ({
  id: `edge-${type}-${Math.random().toString(36).substring(7)}`,
  source,
  target,
  type,
  data: { label: `${type} Connection`, properties: {} },
  markerEnd: { type: "arrow" },
});

function createMockFlowStore(stateOverrides = {}) {
  const defaultState = {
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    onConnect: vi.fn(),
    addNode: vi.fn(),
    selectNode: vi.fn(),
    selectEdge: vi.fn(),
    loadTemplate: vi.fn(),
    updateNodeData: vi.fn(),
    updateEdgeData: vi.fn(),
  };

  return (selector) => {
    if (typeof selector === "function") {
      return selector({ ...defaultState, ...stateOverrides });
    }
    return null;
  };
}

function createMockSimulationStore() {
  return () => ({
    isRunning: false,
    isPaused: false,
  });
}

describe("FlowEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Create sample nodes and edges for testing
    const node1 = createTestNode(NodeType.Client, "Client Node", {
      x: 100,
      y: 100,
    });
    const node2 = createTestNode(NodeType.Server, "Server Node", {
      x: 300,
      y: 300,
    });
    const edge = createTestEdge(EdgeType.HTTP, node1.id, node2.id);

    // Setup mock for flow store
    vi.mocked(useFlowStore).mockImplementation(
      createMockFlowStore({
        nodes: [node1, node2],
        edges: [edge],
      })
    );

    // Setup mock for simulation store
    vi.mocked(useSimulationStore).mockImplementation(
      createMockSimulationStore()
    );
  });

  it("renders the flow editor with main components", () => {
    render(<FlowEditorPage />);

    // Check for main container elements
    expect(screen.getByTestId("react-flow-provider-mock")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow-mock")).toBeInTheDocument();

    // Check for panels
    expect(
      screen.getByTestId("collapsible-panel-flow-panel")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("collapsible-panel-simulation-panel")
    ).toBeInTheDocument();

    // Check for ReactFlow internal components
    expect(screen.getByTestId("background-mock")).toBeInTheDocument();
    expect(screen.getByTestId("controls-mock")).toBeInTheDocument();
    expect(screen.getByTestId("minimap-mock")).toBeInTheDocument();
  });

  it("shows node properties panel when a node is selected", () => {
    const selectedNode = createTestNode(NodeType.Server, "Selected Server", {
      x: 200,
      y: 200,
    });

    vi.mocked(useFlowStore).mockImplementation(
      createMockFlowStore({
        selectedNode,
      })
    );

    render(<FlowEditorPage />);
    expect(screen.getByTestId("node-properties-panel")).toBeInTheDocument();
  });

  it("shows edge properties panel when an edge is selected", () => {
    const node1 = createTestNode(NodeType.Client, "Client", { x: 100, y: 100 });
    const node2 = createTestNode(NodeType.Server, "Server", { x: 300, y: 300 });
    const selectedEdge = createTestEdge(EdgeType.HTTP, node1.id, node2.id);

    vi.mocked(useFlowStore).mockImplementation(
      createMockFlowStore({
        selectedEdge,
      })
    );

    render(<FlowEditorPage />);
    expect(screen.getByTestId("edge-properties-panel")).toBeInTheDocument();
  });

  it("calls updateNodeData when editing node properties", async () => {
    const mockUpdateNodeData = vi.fn();
    const selectedNode = createTestNode(NodeType.Server, "Test Server", {
      x: 200,
      y: 200,
    });

    vi.mocked(useFlowStore).mockImplementation(
      createMockFlowStore({
        selectedNode,
        updateNodeData: mockUpdateNodeData,
      })
    );

    render(<FlowEditorPage />);

    const updateButton = screen.getByTestId("update-node-btn");
    await userEvent.click(updateButton);

    expect(mockUpdateNodeData).toHaveBeenCalledWith(
      selectedNode.id,
      "label",
      "Updated Label"
    );
  });

  it("calls updateEdgeData when editing edge properties", async () => {
    const mockUpdateEdgeData = vi.fn();
    const node1 = createTestNode(NodeType.Client, "Client", { x: 100, y: 100 });
    const node2 = createTestNode(NodeType.Server, "Server", { x: 300, y: 300 });
    const selectedEdge = createTestEdge(EdgeType.HTTP, node1.id, node2.id);

    vi.mocked(useFlowStore).mockImplementation(
      createMockFlowStore({
        selectedEdge,
        updateEdgeData: mockUpdateEdgeData,
      })
    );

    render(<FlowEditorPage />);

    const updateButton = screen.getByTestId("update-edge-btn");
    await userEvent.click(updateButton);

    expect(mockUpdateEdgeData).toHaveBeenCalledWith(
      selectedEdge.id,
      "label",
      "Updated Label"
    );
  });
});
