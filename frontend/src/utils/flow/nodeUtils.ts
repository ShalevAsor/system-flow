import { v4 as uuidv4 } from "uuid";
import {
  NodeType,
  SystemDesignNode,
  NodeData,
  ServerNodeData,
  DatabaseNodeData,
  LoadBalancerNodeData,
  ClientNodeData,
  CacheNodeData,
  DBType,
} from "../../types/flow/nodeTypes";
import {
  defaultServerNodeData,
  defaultDatabaseNodeData,
  defaultLoadBalancerNodeData,
  defaultClientNodeData,
  defaultCacheNodeData,
} from "../../constants/nodeDefaults";

/**
 * Generates a unique node ID for new nodes.
 * Using UUID v4 ensures uniqueness even in collaborative environments.
 */
export const generateNodeId = (): string => {
  return `node-${uuidv4()}`;
};

/**
 * Creates default node data based on the node type.
 * This ensures all node types have appropriate default properties.
 *
 * @param type The type of node being created
 * @param label The display label for the node
 * @returns NodeData with type-specific default values
 */
export const createDefaultNodeData = (
  type: NodeType,
  label: string
): NodeData => {
  // Base data common to all node types
  const baseData: NodeData = {
    label,
    description: `New ${label} component`,
  };

  // Add type-specific properties based on node type
  switch (type) {
    case NodeType.Server:
      return {
        ...baseData,
        ...defaultServerNodeData,
      } as ServerNodeData;

    case NodeType.Database:
      return {
        ...baseData,
        ...defaultDatabaseNodeData,
      } as DatabaseNodeData;

    case NodeType.LoadBalancer:
      return {
        ...baseData,
        ...defaultLoadBalancerNodeData,
      } as LoadBalancerNodeData;

    case NodeType.Client:
      return {
        ...baseData,
        ...defaultClientNodeData,
      } as ClientNodeData;

    case NodeType.Cache:
      return {
        ...baseData,
        ...defaultCacheNodeData,
      } as CacheNodeData;

    default:
      return baseData;
  }
};
export const createNodeData = (
  type: NodeType,
  label: string,
  description: string,
  data:
    | ServerNodeData
    | DatabaseNodeData
    | LoadBalancerNodeData
    | ClientNodeData
    | CacheNodeData
): NodeData => {
  // Base data common to all node types
  const baseData: NodeData = {
    label,
    description,
  };

  // Add type-specific properties based on node type
  switch (type) {
    case NodeType.Server:
      return {
        ...baseData,
        ...data,
      } as ServerNodeData;

    case NodeType.Database:
      return {
        ...baseData,
        ...data,
      } as DatabaseNodeData;

    case NodeType.LoadBalancer:
      return {
        ...baseData,
        ...data,
      } as LoadBalancerNodeData;

    case NodeType.Client:
      return {
        ...baseData,
        ...data,
      } as ClientNodeData;

    case NodeType.Cache:
      return {
        ...baseData,
        ...data,
      } as CacheNodeData;

    default:
      return baseData;
  }
};

/**
 * Creates a new node with the specified type and position.
 *
 * @param type The type of node to create
 * @param label The display label for the node
 * @param position The position coordinates on the canvas
 * @returns A fully configured node ready to be added to the canvas
 */
export const createNode = (
  type: NodeType,
  label: string,
  position: { x: number; y: number }
): SystemDesignNode => {
  return {
    id: generateNodeId(),
    type,
    position,
    data: createDefaultNodeData(type, label),
  } as SystemDesignNode;
};
/**
 * Creates a new node with the specified type and position for a specific architecture template.
 *
 * @param type The type of node to create
 * @param label The display label for the node
 * @param position The position coordinates on the canvas
 * @returns A fully configured node ready to be added to the canvas
 */
export const createNodeForArchitectureTemplate = (
  type: NodeType,
  label: string,
  description: string,
  position: { x: number; y: number },
  nodeData:
    | ServerNodeData
    | DatabaseNodeData
    | LoadBalancerNodeData
    | ClientNodeData
    | CacheNodeData
): SystemDesignNode => {
  return {
    id: generateNodeId(),
    type,
    position,
    data: createNodeData(type, label, description, nodeData),
  } as SystemDesignNode;
};

/**
 * Type definition for a property value that can be assigned to node properties
 */
export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;
/**
 * Updates a specific property of a node.
 *
 * @param nodes The current array of nodes
 * @param nodeId The ID of the node to update
 * @param path The dot-notation path to the property (e.g., 'data.label')
 * @param value The new value for the property
 * @returns A new array of nodes with the specified node updated
 */
export const updateNodeProperty = (
  nodes: SystemDesignNode[],
  nodeId: string,
  path: string,
  value: PropertyValue
): SystemDesignNode[] => {
  return nodes.map((node) => {
    if (node.id !== nodeId) return node;

    // Handle nested properties using path
    const pathParts = path.split(".");
    const newNode = { ...node };

    // Create a reference to the current level
    let current: Record<string, unknown> = newNode;

    // Navigate to the nested property location
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      current[part] = { ...(current[part] as Record<string, unknown>) };
      current = current[part] as Record<string, unknown>;
    }

    // Set the value on the last part
    current[pathParts[pathParts.length - 1]] = value;

    return newNode;
  });
};

/**
 * Returns the display name for a node type.
 *
 * @param type The node type enum value
 * @returns A human-readable display name
 */
export const getNodeTypeName = (type: NodeType): string => {
  switch (type) {
    case NodeType.Server:
      return "Server";
    case NodeType.Database:
      return "Database";
    case NodeType.LoadBalancer:
      return "Load Balancer";
    case NodeType.Client:
      return "Client";
    case NodeType.Cache:
      return "Cache";
    default:
      return "Unknown Type";
  }
};

export const getSubTypeOptions = (dbType: DBType) => {
  // Default empty option
  const baseOptions = [{ value: "", label: "Select a subtype" }];

  // Add type-specific options
  switch (dbType) {
    case "SQL":
      return [
        ...baseOptions,
        { value: "Relational", label: "Relational" },
        { value: "NewSQL", label: "NewSQL" },
        { value: "Graph", label: "Graph SQL" },
      ];
    case "NoSQL":
      return [
        ...baseOptions,
        { value: "Document", label: "Document" },
        { value: "Key-Value", label: "Key-Value" },
        { value: "Column-Family", label: "Column-Family" },
        { value: "Graph", label: "Graph" },
      ];
    case "Cache":
      return [
        ...baseOptions,
        { value: "In-Memory", label: "In-Memory" },
        { value: "Key-Value", label: "Key-Value" },
      ];
    case "Other":
      return [...baseOptions, { value: "Other", label: "Other" }];
    default:
      return baseOptions;
  }
};

export const resizeControlStyle = {
  background: "transparent",
  border: "none",
};
