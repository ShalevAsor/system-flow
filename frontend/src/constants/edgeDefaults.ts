import {
  BaseEdgeData,
  DatabaseConnectionType,
  DatabaseEdgeData,
  DeliveryGuarantee,
  EventStreamEdgeData,
  GRPCEdgeData,
  HTTPEdgeData,
  IsolationLevel,
  MessagePriority,
  MessageQueueEdgeData,
  TCPEdgeData,
  UDPEdgeData,
  WebSocketEdgeData,
} from "../types/flow/edgeTypes";

/**
 * Default base properties for all edge types
 */
export const defaultBaseEdgeData: BaseEdgeData = {
  // Communication characteristics
  communicationPattern: "Sync",
  bidirectional: false,

  // Performance characteristics
  latencyMs: 100,
  latencyLevel: "Low",
  bandwidthRequirement: "Medium",
  bandwidthMbps: 10,
  maxThroughputRPS: 1000,

  // Reliability and quality of service
  reliability: "Best-Effort",
  retryEnabled: true,
  retryStrategy: "Exponential",
  maxRetries: 3,
  retryIntervalMs: 1000,
  timeout: 5000,
  circuitBreakerEnabled: false,
  circuitBreakerStatus: "Closed",
  failoverStrategy: "None",

  // Security attributes
  encryption: "None",
  authentication: "None",

  // Data properties
  averageRequestSizeKB: 1,
  averageResponseSizeKB: 10,
  compressionEnabled: false,

  // Simulation properties
  packetLossRate: 0.001,
  failureProbability: 0.0001,

  // Visual properties
  animated: false,
  dashed: false,
  lineWidth: 2,
};
/**
 * Default properties for HTTP edges
 */
export const defaultHTTPEdgeData: HTTPEdgeData = {
  ...defaultBaseEdgeData,
  method: "GET",
  httpVersion: "HTTP/1.1",
  useTLS: false,
  cacheEnabled: false,
  cacheControl: "No-Cache",
  cacheTTLSeconds: 300,
  corsEnabled: true,
  rateLimit: 100,
  rateLimitBurst: 20,
  proxyEnabled: false,
  loadBalanced: false,
  useApiGateway: false,
};

/**
 * Default properties for WebSocket edges
 */
export const defaultWebSocketEdgeData: WebSocketEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect WebSocket characteristics
  communicationPattern: "Stream",
  bidirectional: true,
  animated: true,

  // WebSocket specific properties
  persistent: true,
  messageRatePerSecond: 10,
  averageMessageSizeKB: 2,
  heartbeatEnabled: true,
  heartbeatIntervalMs: 30000, // 30 seconds
  autoReconnect: true,
  subprotocol: "",
};

/**
 * Default properties for gRPC edges
 */
export const defaultGRPCEdgeData: GRPCEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect gRPC characteristics
  communicationPattern: "Request-Reply",
  reliability: "At-Least-Once",
  encryption: "TLS", // gRPC typically uses TLS by default
  authentication: "Bearer Token", // Common for gRPC services
  compressionEnabled: true, // gRPC supports compression by default

  // gRPC specific properties
  serviceMethod: "",
  streaming: "None", // Default to unary RPC
  loadBalancingPolicy: "Round-Robin",
  channelPooling: true,
  keepAliveEnabled: true,
  keepAliveTimeMs: 60000, // 60 seconds
};

/**
 * Default properties for TCP edges
 */
export const defaultTCPEdgeData: TCPEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect TCP characteristics
  communicationPattern: "Stream",
  bidirectional: true,
  latencyLevel: "Low",
  reliability: "At-Least-Once",
  // TCP is typically faster but less consistent than HTTP
  latencyMs: 50,

  // TCP specific properties
  port: 8080,
  keepAliveEnabled: true,
  connectionPoolEnabled: true,
  maxConcurrentConnections: 100,
  nagleAlgorithmEnabled: true,
  socketBufferSizeKB: 64,
};

/**
 * Default properties for UDP edges
 */
export const defaultUDPEdgeData: UDPEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect UDP characteristics
  communicationPattern: "Async",
  bidirectional: false,
  latencyLevel: "Low",
  reliability: "Best-Effort", // UDP is unreliable by nature
  retryEnabled: false, // UDP typically doesn't retry at the protocol level
  latencyMs: 30, // Even lower latency than TCP
  packetLossRate: 0.01, // Higher packet loss than TCP

  // UDP specific properties
  port: 8080,
  packetSizeBytes: 1472, // Common MTU-friendly UDP packet size
  multicast: false,
  broadcast: false,
  checksumValidation: true,
};

/**
 * Default properties for Message Queue edges
 */
export const defaultMessageQueueEdgeData: MessageQueueEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect Message Queue characteristics
  communicationPattern: "Pub-Sub",
  bidirectional: false,
  animated: true,
  reliability: "At-Least-Once",
  retryEnabled: true,
  maxRetries: 5,

  // Message Queue specific properties
  queueName: "default-queue",
  topicPattern: "topic.*",
  deliveryGuarantee: "At-Least-Once" as DeliveryGuarantee,
  persistent: true,
  durableSubscription: true,
  messagePriority: "Normal" as MessagePriority,
  messageExpirationMs: 86400000, // 24 hours
  deadLetterQueueEnabled: true,
  maxQueueSizeMB: 100,
  orderingGuaranteed: false,
  partitioning: true,
  partitionKey: "messageId",
  consumerGroups: ["default-consumer-group"],
};

/**
 * Default properties for Database edges
 */
export const defaultDatabaseEdgeData: DatabaseEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect Database connection characteristics
  communicationPattern: "Request-Reply",
  bidirectional: true,
  reliability: "ACID", // Databases typically provide ACID guarantees
  encryption: "TLS", // Database connections are typically encrypted
  authentication: "Basic", // Basic auth is common for databases

  // Database specific properties
  connectionType: "Read-Write" as DatabaseConnectionType,
  connectionPooling: true,
  minConnections: 5,
  maxConnections: 20,
  isolationLevel: "Read Committed" as IsolationLevel,
  readOnly: false,
  preparedStatements: true,
  transactional: true,
  queryTimeout: 30000, // 30 seconds
};

/**
 * Default properties for Event Stream edges
 */
export const defaultEventStreamEdgeData: EventStreamEdgeData = {
  ...defaultBaseEdgeData,
  // Override some base properties to better reflect Event Stream characteristics
  communicationPattern: "Pub-Sub",
  bidirectional: false,
  animated: true,
  reliability: "At-Least-Once",

  // Event Stream specific properties
  eventTypes: ["default-event"],
  streamName: "default-stream",
  sharding: true,
  shardCount: 3,
  retentionPeriodHours: 24,
  ordered: false, // Non-ordered for better performance
  maxBatchSize: 100,
};
