import { create } from "zustand";
/* Helper functions for create,update remove node */
import {
  createNode,
  createNodeForArchitectureTemplate,
  PropertyValue,
  updateNodeProperty,
} from "../utils/flow/nodeUtils";
import {
  isClientNode,
  NodeType,
  SystemDesignNode,
} from "../types/flow/nodeTypes";
import {
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { EdgeType, SystemDesignEdge } from "../types/flow/edgeTypes";
import {
  createEdge,
  determineEdgeType,
  EdgePropertyValue,
  getEdgeTypeName,
  updateEdgeProperty,
} from "../utils/flow/edgeUtils";
import { ArchitectureTemplate } from "../types/flow/architectureTypes";
import { architectureTemplates } from "../constants/architectureTemplateDefaults";
import { calculateTreeLayout } from "../utils/flow/templateUtils";

// import { initialNodes, initialEdges } from "../data/canvasData/basic";
export interface FlowState {
  // The nodes in the flow
  nodes: SystemDesignNode[];
  // The edges connecting the nodes in the flow
  edges: SystemDesignEdge[];
  // The currently selected node
  selectedNode: SystemDesignNode | null;
  // The currently selected edge
  selectedEdge: SystemDesignEdge | null;
  // Actions to update the state
  setNodes: (nodes: SystemDesignNode[]) => void;
  setEdges: (edges: SystemDesignEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  clearBoard: () => void;
  // Node operations
  addNode: (
    type: NodeType,
    label: string,
    position: { x: number; y: number }
  ) => void;
  updateNodeData: (nodeId: string, path: string, value: PropertyValue) => void;
  selectNode: (node: SystemDesignNode | null) => void;
  removeNode: (nodeId: string) => void;
  // Edge operations
  addEdge: (
    type: EdgeType,
    sourceId: string,
    targetId: string,
    label?: string
  ) => void;
  updateEdgeData: (
    edgeId: string,
    path: string,
    value: EdgePropertyValue
  ) => void;
  selectEdge: (edge: SystemDesignEdge | null) => void;
  removeEdge: (edgeId: string) => void;
  changeEdgeType: (edgeId: string, newType: EdgeType) => void;
  setAllEdgesAnimated: (animated: boolean) => void;
  // Operations for saving and loading
  getFlowExportObject: () => {
    nodes: SystemDesignNode[];
    edges: SystemDesignEdge[];
  };
  loadFlow: (flow: {
    nodes: SystemDesignNode[];
    edges: SystemDesignEdge[];
  }) => void;

  // Load a template onto the canvas
  loadTemplate: (
    templateId: string,
    position: { x: number; y: number }
  ) => void;

  // Get a template by its ID
  getTemplateById: (templateId: string) => ArchitectureTemplate | undefined;
}

// Default state
const initialNodes: SystemDesignNode[] = [];
const initialEdges: SystemDesignEdge[] = [];

export const useFlowStore = create<FlowState>((set, get) => ({
  /* Initial state */
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  selectedEdge: null,

  /* Setters */
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  /* Node actions */
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as SystemDesignNode[],
    });
  },
  // Add a new node to the canvas
  addNode: (type, label, position) => {
    const newNode = createNode(type, label, position);
    set({
      nodes: [...get().nodes, newNode],
    });
    console.log("is client node", isClientNode(newNode));
    return newNode;
  },

  // Update a node's data property
  updateNodeData: (nodeId, path, value) => {
    const updatedNodes = updateNodeProperty(get().nodes, nodeId, path, value);
    set({ nodes: updatedNodes });
    // Update the selected node if it's the one being updated
    if (get().selectedNode?.id === nodeId) {
      set({ selectedNode: updatedNodes.find((node) => node.id === nodeId) });
    }
  },

  // Set the selected node
  selectNode: (node) => {
    set({ selectedNode: node, selectedEdge: null });
  },

  removeNode: (nodeId) => {
    // First find the edges this node is connected to
    const edgesToRemove = get().edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    // Remove the edges
    set({ edges: get().edges.filter((edge) => !edgesToRemove.includes(edge)) });
    // Remove the node
    set({ nodes: get().nodes.filter((node) => node.id !== nodeId) });
    // Set selected node to null when a node is removed
    set({ selectedNode: null });
  },

  /* Edge Actions */
  addEdge: (type, sourceId, targetId, label) => {
    const newEdge = createEdge(type, sourceId, targetId, label);
    set({
      edges: [...get().edges, newEdge],
    });
  },
  selectEdge: (edge) => {
    set({
      selectedEdge: edge,
      // Deselect node when an edge is selected
      selectedNode: null,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as SystemDesignEdge[],
    });
  },
  updateEdgeData: (edgeId, path, value) => {
    const updatedEdges = updateEdgeProperty(get().edges, edgeId, path, value);
    set({ edges: updatedEdges });
    // Update the selected edge if it's the one being updated
    if (get().selectedEdge?.id === edgeId) {
      set({ selectedEdge: updatedEdges.find((edge) => edge.id === edgeId) });
    }
  },
  removeEdge: (edgeId) => {
    // Remove the edge from the edges array
    set({
      edges: get().edges.filter((edge) => edge.id !== edgeId),
      selectedEdge: null,
    });
  },
  changeEdgeType: (edgeId, newType) => {
    // Find the edge to replace
    const oldEdge = get().edges.find((edge) => edge.id === edgeId);
    if (!oldEdge) return; // Edge not found

    // Create a new edge with the same source/target but new type
    const newEdge = createEdge(
      newType,
      oldEdge.source,
      oldEdge.target,
      getEdgeTypeName(newType)
    );

    // Replace the old edge with the new one
    const updatedEdges = get().edges.filter((edge) => edge.id !== edgeId);
    updatedEdges.push(newEdge);

    // Update the state
    set({
      edges: updatedEdges,
      // Select the new edge if the old one was selected
      selectedEdge:
        get().selectedEdge?.id === edgeId ? newEdge : get().selectedEdge,
    });
  },
  setAllEdgesAnimated: (animated) => {
    set({
      edges: get().edges.map((edge) => ({
        ...edge,
        animated: animated,
      })),
    });
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;

    // Find the source and target nodes
    const sourceNode = get().nodes.find(
      (node) => node.id === connection.source
    );
    const targetNode = get().nodes.find(
      (node) => node.id === connection.target
    );

    // Determine the appropriate edge type based on the node types
    const edgeType = determineEdgeType(sourceNode?.type, targetNode?.type);

    // Create the edge with the determined type
    const newEdge = createEdge(
      edgeType,
      connection.source,
      connection.target,
      getEdgeTypeName(edgeType) // Use the edge type name as the label
    );

    set({
      edges: [...get().edges, newEdge],
    });
  },
  clearBoard: () => {
    set({ edges: [], nodes: [], selectedEdge: null, selectedNode: null });
  },

  // Export the current flow state as an object
  getFlowExportObject: () => {
    return {
      nodes: get().nodes,
      edges: get().edges,
    };
  },

  // Load a flow from an export object
  loadFlow: (flow) => {
    set({
      nodes: flow.nodes,
      edges: flow.edges,
      selectedNode: null,
      selectedEdge: null,
    });
  },

  getTemplateById: (templateId: string) => {
    return architectureTemplates.find((template) => template.id === templateId);
  },

  loadTemplate: (templateId: string, position: { x: number; y: number }) => {
    const template = get().getTemplateById(templateId);
    if (!template) return;

    const centerX = position.x;
    const centerY = position.y;

    // Calculate node positions using tree layout
    const nodePositions = calculateTreeLayout(template, centerX, centerY);

    // Create nodes with calculated positions
    const newNodes: SystemDesignNode[] = [];
    const nodeMap: Record<number, string> = {}; // Maps template node index to real node ID

    // Create nodes
    template.nodes.forEach((templateNode, index) => {
      // Get the position from our calculated positions
      const nodePosition = nodePositions[index];

      // Create the node
      const node = createNodeForArchitectureTemplate(
        templateNode.type,
        templateNode.data.label,
        templateNode.data.description,
        nodePosition, // Use the calculated position
        templateNode.data
      );

      // Apply the template data to the node (if available)
      if (templateNode.data) {
        Object.entries(templateNode.data).forEach(([key, value]) => {
          if (key !== "label") {
            // Label is already set
            get().updateNodeData(node.id, key, value);
          }
        });
      }

      // Store the node and its mapping
      newNodes.push(node);
      nodeMap[index] = node.id;
    });

    // Create edges based on the template connections
    const newEdges: SystemDesignEdge[] = template.edges.map((templateEdge) => {
      const sourceId = nodeMap[templateEdge.source];
      const targetId = nodeMap[templateEdge.target];
      let edgeType = templateEdge.type;
      if (!edgeType) {
        console.error("Invalid edge type:", templateEdge.type);
        edgeType = EdgeType.HTTP;
      }
      // Get edge label from type name
      const edgeLabel = getEdgeTypeName(edgeType);

      // Create the edge with correct parameters
      const edge = createEdge(edgeType, sourceId, targetId, edgeLabel);

      return edge;
    });

    // Add all the new nodes and edges to the canvas
    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges],
    });
  },
}));
