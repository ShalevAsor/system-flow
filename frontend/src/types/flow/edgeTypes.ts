// src/types/edgeTypes.ts

import { Edge } from "@xyflow/react";
import { Protocol } from "./common";

// ==============================
// Edge Type Definitions
// ==============================

/**
 * Enum for all available edge connection types in the system.
 * Used for both visual representation and behavior.
 */
export enum EdgeType {
  Default = "default",
  HTTP = "http",
  WebSocket = "websocket",
  gRPC = "grpc",
  TCP = "tcp",
  UDP = "udp",
  MQTT = "mqtt",
  AMQP = "amqp",
  Kafka = "kafka",
  EventStream = "eventStream",
  Database = "database",
}

/**
 * Edge communication pattern types
 */
export type CommunicationPattern =
  | "Sync"
  | "Async"
  | "Pub-Sub"
  | "Request-Reply"
  | "Stream";

/**
 * Performance characteristics
 */
export type LatencyLevel = "Low" | "Medium" | "High" | "Variable";

export type BandwidthRequirement = "Low" | "Medium" | "High" | "Very High";

export type ReliabilityLevel =
  | "Best-Effort"
  | "At-Least-Once"
  | "Exactly-Once"
  | "ACID";
/**
 * Security attributes
 */
export type EncryptionType = "None" | "TLS" | "End-to-End" | "mTLS";
export type AuthenticationType =
  | "None"
  | "Basic"
  | "Bearer Token"
  | "mTLS"
  | "OAuth"
  | "API Key";

/**
 * HTTP specific attributes
 */
export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type HTTPVersion = "HTTP/1.1" | "HTTP/2" | "HTTP/3";

export type CacheControl =
  | "No-Cache"
  | "Private"
  | "Public"
  | "Must-Revalidate";

/**
 * Message queue specifics
 */
export type DeliveryGuarantee =
  | "At-Most-Once"
  | "At-Least-Once"
  | "Exactly-Once";
export type MessagePriority = "Low" | "Normal" | "High" | "Critical";

/**
 * Database connection specifics
 */
export type DatabaseConnectionType = "Read" | "Write" | "Read-Write" | "Admin";
export type IsolationLevel =
  | "Read Uncommitted"
  | "Read Committed"
  | "Repeatable Read"
  | "Serializable";

/**
 * Failure handling
 */
export type RetryStrategy =
  | "None"
  | "Linear"
  | "Exponential"
  | "Constant"
  | "Custom";
export type CircuitBreakerStatus = "Closed" | "Open" | "Half-Open";
export type FailoverStrategy = "None" | "Active-Passive" | "Active-Active";

/**
 * Base data type shared by all edge types
 */
export type BaseEdgeData = {
  // Basic properties
  label?: string;
  description?: string;
  protocol?: Protocol;

  // Visual properties
  animated?: boolean;
  dashed?: boolean;
  lineWidth?: number;

  // Communication characteristics
  communicationPattern: CommunicationPattern;
  bidirectional: boolean;

  // Performance characteristics
  latencyMs?: number;
  latencyLevel?: LatencyLevel;
  bandwidthRequirement?: BandwidthRequirement;
  bandwidthMbps?: number;
  maxThroughputRPS?: number; // Requests Per Second

  // Reliability and quality of service
  reliability?: ReliabilityLevel;
  retryEnabled?: boolean;
  retryStrategy?: RetryStrategy;
  maxRetries?: number;
  retryIntervalMs?: number;
  timeout?: number; // in milliseconds
  circuitBreakerEnabled?: boolean;
  circuitBreakerStatus?: CircuitBreakerStatus;
  failoverStrategy?: FailoverStrategy;

  // Security attributes
  encryption?: EncryptionType;
  authentication?: AuthenticationType;

  // Data properties
  averageRequestSizeKB?: number;
  averageResponseSizeKB?: number;
  compressionEnabled?: boolean;

  // Simulation properties
  packetLossRate?: number; // 0-1 probability
  failureProbability?: number; // 0-1 probability
};

// ==============================
// HTTP Edge Data
// ==============================
export type HTTPEdgeData = BaseEdgeData & {
  method: HTTPMethod;
  httpVersion: HTTPVersion;
  useTLS: boolean;
  cacheEnabled?: boolean;
  cacheControl?: CacheControl;
  cacheTTLSeconds?: number;
  corsEnabled?: boolean;
  rateLimit?: number; // requests per minute
  rateLimitBurst?: number; // max burst size
  proxyEnabled?: boolean;
  proxyAddress?: string;
  loadBalanced?: boolean;
  useApiGateway?: boolean;
};

// ==============================
// Websocket Edge Data
// ==============================
export type WebSocketEdgeData = BaseEdgeData & {
  persistent: boolean;
  messageRatePerSecond: number;
  averageMessageSizeKB?: number;
  heartbeatEnabled?: boolean;
  heartbeatIntervalMs?: number;
  autoReconnect?: boolean;
  subprotocol?: string;
};

// ==============================
// gRPC Edge Data
// ==============================
export type GRPCEdgeData = BaseEdgeData & {
  serviceMethod?: string;
  streaming: "None" | "Client" | "Server" | "Bidirectional";
  loadBalancingPolicy?: "Round-Robin" | "Pick-First" | "Custom";
  channelPooling?: boolean;
  keepAliveEnabled?: boolean;
  keepAliveTimeMs?: number;
};

// ==============================
// TCP Edge Data
// ==============================
export type TCPEdgeData = BaseEdgeData & {
  port?: number;
  keepAliveEnabled?: boolean;
  connectionPoolEnabled?: boolean;
  maxConcurrentConnections?: number;
  nagleAlgorithmEnabled?: boolean;
  socketBufferSizeKB?: number;
};

// ==============================
// UDP Edge Data
// ==============================
export type UDPEdgeData = BaseEdgeData & {
  port?: number;
  packetSizeBytes?: number;
  multicast?: boolean;
  broadcast?: boolean;
  checksumValidation?: boolean;
};

// ==============================
// MessageQueue Edge Data
// ==============================
export type MessageQueueEdgeData = BaseEdgeData & {
  queueName?: string;
  topicPattern?: string;
  deliveryGuarantee: DeliveryGuarantee;
  persistent: boolean;
  durableSubscription?: boolean;
  messagePriority?: MessagePriority;
  messageExpirationMs?: number;
  deadLetterQueueEnabled?: boolean;
  maxQueueSizeMB?: number;
  orderingGuaranteed?: boolean;
  partitioning?: boolean;
  partitionKey?: string;
  consumerGroups?: string[];
};

// ==============================
// Database Edge Data
// ==============================
export type DatabaseEdgeData = BaseEdgeData & {
  connectionType: DatabaseConnectionType;
  connectionPooling?: boolean;
  minConnections?: number;
  maxConnections?: number;
  isolationLevel?: IsolationLevel;
  readOnly?: boolean;
  preparedStatements?: boolean;
  transactional?: boolean;
  queryTimeout?: number; // milliseconds
};

// ==============================
// Event Stream Edge Data
// ==============================
export type EventStreamEdgeData = BaseEdgeData & {
  eventTypes?: string[];
  streamName?: string;
  sharding?: boolean;
  shardCount?: number;
  retentionPeriodHours?: number;
  ordered?: boolean;
  maxBatchSize?: number;
};

// ==============================
// Union Types for Edge Types
// ==============================
export type HTTPEdge = Edge<HTTPEdgeData, EdgeType.HTTP>;
export type WebSocketEdge = Edge<WebSocketEdgeData, EdgeType.WebSocket>;
export type GRPCEdge = Edge<GRPCEdgeData, EdgeType.gRPC>;
export type TCPEdge = Edge<TCPEdgeData, EdgeType.TCP>;
export type UDPEdge = Edge<UDPEdgeData, EdgeType.UDP>;
export type MessageQueueEdge = Edge<MessageQueueEdgeData, EdgeType.MQTT>;
export type DatabaseEdge = Edge<DatabaseEdgeData, EdgeType.Database>;
export type KafkaEdge = Edge<MessageQueueEdgeData, EdgeType.Kafka>;
export type MQTTEdge = Edge<MessageQueueEdgeData, EdgeType.MQTT>;
export type AMQPEdge = Edge<MessageQueueEdgeData, EdgeType.AMQP>;
export type EventStreamEdge = Edge<EventStreamEdgeData, EdgeType.EventStream>;
export type EdgeData =
  | (BaseEdgeData & Partial<HTTPEdgeData>)
  | (BaseEdgeData & Partial<WebSocketEdgeData>)
  | (BaseEdgeData & Partial<GRPCEdgeData>)
  | (BaseEdgeData & Partial<TCPEdgeData>)
  | (BaseEdgeData & Partial<UDPEdgeData>)
  | (BaseEdgeData & Partial<MessageQueueEdgeData>)
  | (BaseEdgeData & Partial<DatabaseEdgeData>)
  | (BaseEdgeData & Partial<EventStreamEdgeData>);

/**
 * Type for edges with their specific data
 */
export type SystemDesignEdge =
  | HTTPEdge
  | WebSocketEdge
  | GRPCEdge
  | TCPEdge
  | UDPEdge
  | MessageQueueEdge
  | KafkaEdge
  | MQTTEdge
  | AMQPEdge
  | DatabaseEdge
  | EventStreamEdge;

// ==============================
// Type Guard Functions
// ==============================

/**
 * Type guard to check if an edge is an HTTP edge
 */
export function isHTTPEdge(edge: SystemDesignEdge): edge is HTTPEdge {
  return edge.type === EdgeType.HTTP;
}

/**
 * Type guard to check if an edge is a WebSocket edge
 */
export function isWebSocketEdge(edge: SystemDesignEdge): edge is WebSocketEdge {
  return edge.type === EdgeType.WebSocket;
}

/**
 * Type guard to check if an edge is a gRPC edge
 */
export function isGRPCEdge(edge: SystemDesignEdge): edge is GRPCEdge {
  return edge.type === EdgeType.gRPC;
}
/**
 * Type guard to check if an edge is a TCP edge
 */
export function isTCPEdge(edge: SystemDesignEdge): edge is TCPEdge {
  return edge.type === EdgeType.TCP;
}
/**
 * Type guard to check if an edge is a UDP edge
 */
export function isUDPEdge(edge: SystemDesignEdge): edge is UDPEdge {
  return edge.type === EdgeType.UDP;
}
/**
 * Type guard to check if an edge is a Message Queue edge
 */
export function isMessageQueueEdge(
  edge: SystemDesignEdge
): edge is MessageQueueEdge {
  return (
    edge.type === EdgeType.MQTT ||
    edge.type === EdgeType.Kafka ||
    edge.type === EdgeType.AMQP
  );
}
/**
 * Type guard to check if an edge is a Database edge
 */
export function isDatabaseEdge(edge: SystemDesignEdge): edge is DatabaseEdge {
  return edge.type === EdgeType.Database;
}
/**
 * Type guard to check if an edge is an Event Stream edge
 */
export function isEventStreamEdge(
  edge: SystemDesignEdge
): edge is EventStreamEdge {
  return edge.type === EdgeType.EventStream;
}
