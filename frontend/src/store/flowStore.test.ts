// src/store/flowStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useFlowStore } from "./flowStore";
import { NodeType } from "../types/flow/nodeTypes";
import { EdgeType } from "../types/flow/edgeTypes";
import { threeTierArchitecture } from "../constants/architectureTemplateDefaults";

// Helper function to create a test node
const createTestNode = (
  type: NodeType,
  label: string,
  position: { x: number; y: number }
) => {
  let nodeId: string;

  act(() => {
    useFlowStore.getState().addNode(type, label, position);
    // After adding the node, find it in the store
    nodeId =
      useFlowStore
        .getState()
        .nodes.find((node) => node.type === type && node.data.label === label)
        ?.id || "";
  });

  // Return the node from the store
  return useFlowStore.getState().nodes.find((node) => node.id === nodeId)!;
};

// Create a position to use in tests
const position = { x: 100, y: 100 };

describe("useFlowStore", () => {
  // Clear the store before each test
  beforeEach(() => {
    act(() => {
      useFlowStore.getState().clearBoard();
    });
  });

  describe("Node operations", () => {
    it("should add a node to the store", () => {
      // Add a test node
      act(() => {
        useFlowStore
          .getState()
          .addNode(NodeType.Server, "Test Server", position);
      });

      // Verify node was added correctly
      const { nodes } = useFlowStore.getState();
      expect(nodes.length).toBe(1);
      expect(nodes[0].type).toBe(NodeType.Server);
      expect(nodes[0].data.label).toBe("Test Server");
      expect(nodes[0].position).toEqual(position);
    });

    it("should select a node", () => {
      // Add a test node
      const node = createTestNode(NodeType.Server, "Test Server", position);

      // Select the node
      act(() => {
        useFlowStore.getState().selectNode(node);
      });

      // Verify node was selected
      const { selectedNode } = useFlowStore.getState();
      expect(selectedNode).toBe(node);
    });

    it("should deselect a node when passing null", () => {
      // Add and select a test node
      const node = createTestNode(NodeType.Server, "Test Server", position);
      act(() => {
        useFlowStore.getState().selectNode(node);
      });

      // Deselect the node
      act(() => {
        useFlowStore.getState().selectNode(null);
      });

      // Verify node was deselected
      const { selectedNode } = useFlowStore.getState();
      expect(selectedNode).toBeNull();
    });

    it("should update node data", () => {
      // Add a test node
      const node = createTestNode(NodeType.Server, "Test Server", position);

      // Get the node ID
      const nodeId = node.id;

      // Update node label - most likely the correct path for label is 'data.label'
      act(() => {
        useFlowStore
          .getState()
          .updateNodeData(nodeId, "data.label", "Updated Server");
      });

      // Verify node was updated
      const { nodes } = useFlowStore.getState();
      const updatedNode = nodes.find((n) => n.id === nodeId);
      expect(updatedNode?.data.label).toBe("Updated Server");
    });

    it("should remove a node", () => {
      // Add a test node
      const node = createTestNode(NodeType.Server, "Test Server", position);

      // Remove the node
      act(() => {
        useFlowStore.getState().removeNode(node.id);
      });

      // Verify node was removed
      const { nodes } = useFlowStore.getState();
      expect(nodes.length).toBe(0);
    });
  });

  describe("Edge operations", () => {
    it("should add an edge between two nodes", () => {
      // Add two test nodes
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      // Add an edge between them
      act(() => {
        useFlowStore
          .getState()
          .addEdge(
            EdgeType.HTTP,
            sourceNode.id,
            targetNode.id,
            "HTTP Connection"
          );
      });

      // Verify edge was added
      const { edges } = useFlowStore.getState();
      expect(edges.length).toBe(1);
      expect(edges[0].source).toBe(sourceNode.id);
      expect(edges[0].target).toBe(targetNode.id);
      expect(edges[0].type).toBe(EdgeType.HTTP);
      expect(edges[0].data?.label).toBe("HTTP Connection");
    });

    it("should select an edge", () => {
      // Add two test nodes and an edge
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Get the created edge
      const edge = useFlowStore.getState().edges[0];

      act(() => {
        useFlowStore.getState().selectEdge(edge);
      });

      // Verify edge was selected
      const { selectedEdge, selectedNode } = useFlowStore.getState();
      expect(selectedEdge).toBe(edge);
      // Selecting an edge should deselect any selected node
      expect(selectedNode).toBeNull();
    });

    it("should update edge data", () => {
      // Add two test nodes and an edge
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Get the created edge
      const edge = useFlowStore.getState().edges[0];

      // Update edge label
      act(() => {
        useFlowStore
          .getState()
          .updateEdgeData(edge.id, "data.label", "Updated Connection");
      });

      // Verify edge was updated
      const { edges } = useFlowStore.getState();
      expect(edges[0].data?.label).toBe("Updated Connection");
    });

    it("should remove an edge", () => {
      // Add two test nodes and an edge
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Get the created edge
      const edge = useFlowStore.getState().edges[0];

      // Remove the edge
      act(() => {
        useFlowStore.getState().removeEdge(edge.id);
      });

      // Verify edge was removed
      const { edges } = useFlowStore.getState();
      expect(edges.length).toBe(0);
    });

    it("should change edge type", () => {
      // Add two test nodes and an edge
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Get the created edge
      const edge = useFlowStore.getState().edges[0];

      // Change the edge type
      act(() => {
        useFlowStore.getState().changeEdgeType(edge.id, EdgeType.WebSocket);
      });

      // Verify edge type was changed
      const { edges } = useFlowStore.getState();
      expect(edges[0].type).toBe(EdgeType.WebSocket);
    });

    it("should set all edges animated state", () => {
      // Add two test nodes and an edge
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Set all edges animated
      act(() => {
        useFlowStore.getState().setAllEdgesAnimated(true);
      });

      // Verify edges are animated
      const { edges } = useFlowStore.getState();
      expect(edges[0].animated).toBe(true);

      // Set all edges not animated
      act(() => {
        useFlowStore.getState().setAllEdgesAnimated(false);
      });

      // Verify edges are not animated
      const updatedEdges = useFlowStore.getState().edges;
      expect(updatedEdges[0].animated).toBe(false);
    });
  });

  describe("Flow operations", () => {
    it("should clear the board", () => {
      // Add test nodes and edges
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
        useFlowStore.getState().selectNode(sourceNode);
      });

      // Clear the board
      act(() => {
        useFlowStore.getState().clearBoard();
      });

      // Verify board was cleared
      const { nodes, edges, selectedNode, selectedEdge } =
        useFlowStore.getState();
      expect(nodes.length).toBe(0);
      expect(edges.length).toBe(0);
      expect(selectedNode).toBeNull();
      expect(selectedEdge).toBeNull();
    });

    it("should export and load flow", () => {
      // Create a flow with nodes and edges
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      act(() => {
        useFlowStore
          .getState()
          .addEdge(EdgeType.HTTP, sourceNode.id, targetNode.id);
      });

      // Export the flow
      const exportedFlow = useFlowStore.getState().getFlowExportObject();

      // Clear the board
      act(() => {
        useFlowStore.getState().clearBoard();
      });

      // Load the exported flow
      act(() => {
        useFlowStore.getState().loadFlow(exportedFlow);
      });

      // Verify flow was loaded correctly
      const { nodes, edges } = useFlowStore.getState();
      expect(nodes.length).toBe(2);
      expect(edges.length).toBe(1);
      expect(nodes[0].data.label).toBe("Client");
      expect(nodes[1].data.label).toBe("Server");
      expect(edges[0].source).toBe(sourceNode.id);
      expect(edges[0].target).toBe(targetNode.id);
    });

    it("should load a template", () => {
      // Mock the getTemplateById function to return a test template
      const originalGetTemplateById = useFlowStore.getState().getTemplateById;
      const mockTemplate = {
        ...threeTierArchitecture,
      };

      act(() => {
        useFlowStore.setState({
          getTemplateById: () => mockTemplate,
        });
      });

      // Load the template
      act(() => {
        useFlowStore
          .getState()
          .loadTemplate("test-template", { x: 200, y: 200 });
      });

      // Verify template was loaded
      const { nodes, edges } = useFlowStore.getState();
      expect(nodes.length).toBe(3);
      expect(edges.length).toBe(2);
      expect(nodes[0].data.label).toBe("Web Client");
      expect(nodes[1].data.label).toBe("Application Server");
      expect(nodes[2].data.label).toBe("Database");

      // Restore the original getTemplateById function
      act(() => {
        useFlowStore.setState({
          getTemplateById: originalGetTemplateById,
        });
      });
    });
  });

  describe("Connect operations", () => {
    it("should connect two nodes with the appropriate edge type", () => {
      // Add two test nodes
      const sourceNode = createTestNode(NodeType.Client, "Client", {
        x: 100,
        y: 100,
      });
      const targetNode = createTestNode(NodeType.Server, "Server", {
        x: 300,
        y: 300,
      });

      // Simulate a connection
      // Simulate a connection
      act(() => {
        useFlowStore.getState().onConnect({
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle: null,
          targetHandle: null,
        });
      });

      // Verify connection was made with the right edge type
      const { edges } = useFlowStore.getState();
      expect(edges.length).toBe(1);
      expect(edges[0].source).toBe(sourceNode.id);
      expect(edges[0].target).toBe(targetNode.id);
      expect(edges[0].type).toBe(EdgeType.HTTP); // Should be HTTP for client->server
    });
  });
});
