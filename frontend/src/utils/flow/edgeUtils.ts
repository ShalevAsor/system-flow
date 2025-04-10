import { v4 as uuidv4 } from "uuid";
import {
  EdgeType,
  HTTPEdgeData,
  EdgeData,
  SystemDesignEdge,
  WebSocketEdgeData,
  GRPCEdgeData,
  TCPEdgeData,
  UDPEdgeData,
  MessageQueueEdgeData,
  DatabaseEdgeData,
  EventStreamEdgeData,
} from "../../types/flow/edgeTypes";
import {
  defaultDatabaseEdgeData,
  defaultEventStreamEdgeData,
  defaultGRPCEdgeData,
  defaultHTTPEdgeData,
  defaultMessageQueueEdgeData,
  defaultTCPEdgeData,
  defaultUDPEdgeData,
  defaultWebSocketEdgeData,
} from "../../constants/edgeDefaults";
import { MarkerType } from "@xyflow/react";
import { NodeType } from "../../types/flow/nodeTypes";
/**
 * Generates a unique edge ID for new edges.
 * Using UUID v4 ensures uniqueness even in collaborative environments.
 */
export const generateEdgeId = (source: string, target: string): string => {
  return `edge-${source}-${target}-${uuidv4().substring(0, 8)}`;
};

/**
 * Creates default edge data based on the edge type.
 * This ensures all edge types have appropriate default properties.
 *
 * @param type The type of edge being created
 * @param label Optional display label for the edge
 * @returns EdgeData with type-specific default values
 */
export const createDefaultEdgeData = (
  type: EdgeType,
  label?: string
): EdgeData => {
  // Add type-specific properties based on edge type
  switch (type) {
    case EdgeType.HTTP:
      return {
        ...defaultHTTPEdgeData,
        label: label || "HTTP Connection",
      } as HTTPEdgeData;

    case EdgeType.WebSocket:
      return {
        ...defaultWebSocketEdgeData,
        label: label || "WebSocket Connection",
      } as WebSocketEdgeData;

    case EdgeType.gRPC:
      return {
        ...defaultGRPCEdgeData,
        label: label || "gRPC Connection",
      } as GRPCEdgeData;

    case EdgeType.TCP:
      return {
        ...defaultTCPEdgeData,
        label: label || "TCP Connection",
      } as TCPEdgeData;

    case EdgeType.UDP:
      return {
        ...defaultUDPEdgeData,
        label: label || "UDP Connection",
      } as UDPEdgeData;
    case EdgeType.MQTT:
    case EdgeType.AMQP:
    case EdgeType.Kafka:
      return {
        ...defaultMessageQueueEdgeData,
        label: label || `${type} Connection`,
      } as MessageQueueEdgeData;

    case EdgeType.Database:
      return {
        ...defaultDatabaseEdgeData,
        label: label || "Database Connection",
      } as DatabaseEdgeData;
    case EdgeType.EventStream:
      return {
        ...defaultEventStreamEdgeData,
        label: label || "Event Stream",
      } as EventStreamEdgeData;
    default:
      // For default edge type, use basic edge data
      return {
        ...defaultHTTPEdgeData, // Fallback to HTTP for now
        label: label || "Connection",
      };
  }
};
/**
 * Creates a new edge with the specified type between source and target nodes.
 *
 * @param type The type of edge to create
 * @param source The ID of the source node
 * @param target The ID of the target node
 * @param label Optional display label for the edge
 * @returns A fully configured edge ready to be added to the canvas
 */

export const createEdge = (
  type: EdgeType,
  source: string,
  target: string,
  label?: string
): SystemDesignEdge => {
  const edge = {
    id: generateEdgeId(source, target),
    source,
    target,
    type,
    data: createDefaultEdgeData(type, label),
    markerEnd: {
      type: MarkerType.Arrow,
    },
  };

  return edge as SystemDesignEdge;
};

/**
 * Determines the most appropriate edge type based on the source and target node types.
 * This follows common system design patterns for connections between different components.
 *
 * @param sourceType The type of the source node
 * @param targetType The type of the target node
 * @returns The most appropriate edge type for this connection
 */
export const determineEdgeType = (
  sourceType?: NodeType,
  targetType?: NodeType
): EdgeType => {
  // Default to HTTP if node types are undefined
  if (!sourceType || !targetType) {
    return EdgeType.HTTP;
  }

  // Create a connection key for easier lookup
  const connectionKey = `${sourceType}-${targetType}`;

  // Connection lookup table based on common architecture patterns
  const connectionPatterns: Record<string, EdgeType> = {
    // Client initiated connections
    [`${NodeType.Client}-${NodeType.Server}`]: EdgeType.HTTP,
    [`${NodeType.Client}-${NodeType.LoadBalancer}`]: EdgeType.HTTP,
    [`${NodeType.Client}-${NodeType.Cache}`]: EdgeType.HTTP, // CDN or browser cache

    // Load balancer connections
    [`${NodeType.LoadBalancer}-${NodeType.Server}`]: EdgeType.HTTP,
    [`${NodeType.LoadBalancer}-${NodeType.Cache}`]: EdgeType.HTTP,

    // Server connections
    [`${NodeType.Server}-${NodeType.Server}`]: EdgeType.HTTP, // Default REST
    [`${NodeType.Server}-${NodeType.Database}`]: EdgeType.Database,
    [`${NodeType.Server}-${NodeType.Cache}`]: EdgeType.TCP,
    [`${NodeType.Server}-${NodeType.LoadBalancer}`]: EdgeType.HTTP,
    [`${NodeType.Server}-${NodeType.Client}`]: EdgeType.WebSocket, // Typically WebSocket for server push

    // Database connections
    [`${NodeType.Database}-${NodeType.Database}`]: EdgeType.Database, // Replication
    [`${NodeType.Database}-${NodeType.Server}`]: EdgeType.Database,

    // Cache connections
    [`${NodeType.Cache}-${NodeType.Cache}`]: EdgeType.TCP,
    [`${NodeType.Cache}-${NodeType.Server}`]: EdgeType.TCP,
  };

  // Look up the connection pattern or default to HTTP
  return connectionPatterns[connectionKey] || EdgeType.HTTP;
};
/**
 * Returns the display name for an edge type.
 *
 * @param type The edge type enum value
 * @returns A human-readable display name
 */
export const getEdgeTypeName = (type: EdgeType): string => {
  switch (type) {
    case EdgeType.HTTP:
      return "HTTP";
    case EdgeType.WebSocket:
      return "WebSocket";
    case EdgeType.gRPC:
      return "gRPC";
    case EdgeType.TCP:
      return "TCP";
    case EdgeType.UDP:
      return "UDP";
    case EdgeType.MQTT:
      return "MQTT";
    case EdgeType.AMQP:
      return "AMQP";
    case EdgeType.Kafka:
      return "Kafka";
    case EdgeType.EventStream:
      return "Event Stream";
    case EdgeType.Database:
      return "Database";
    default:
      return "HTTP";
  }
};
/**
 * Type definition for a property value that can be assigned to edge properties
 */
export type EdgePropertyValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

/**
 * Updates a specific property of an edge.
 *
 * @param edges The current array of edges
 * @param edgeId The ID of the edge to update
 * @param path The dot-notation path to the property (e.g., 'data.method')
 * @param value The new value for the property
 * @returns A new array of edges with the specified edge updated
 */
export const updateEdgeProperty = (
  edges: SystemDesignEdge[],
  edgeId: string,
  path: string,
  value: EdgePropertyValue
): SystemDesignEdge[] => {
  return edges.map((edge) => {
    if (edge.id !== edgeId) return edge;

    // Handle nested properties using path
    const pathParts = path.split(".");
    const newEdge = { ...edge };

    // Create a reference to the current level
    let current: Record<string, unknown> = newEdge;

    // Navigate to the nested property location
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      current[part] = { ...(current[part] as Record<string, unknown>) };
      current = current[part] as Record<string, unknown>;
    }

    // Set the value on the last part
    current[pathParts[pathParts.length - 1]] = value;

    return newEdge;
  });
};

/**
 * Find an edge between two nodes
 */
export const findEdge = (
  edges: SystemDesignEdge[],
  sourceId: string,
  targetId: string
): SystemDesignEdge | undefined => {
  return edges.find(
    (edge) => edge.source === sourceId && edge.target === targetId
  );
};
