import { Node } from "@xyflow/react";
import { AuthenticationMethod, Protocol } from "./common";
// ==============================
// Node Type Definitions
// ==============================

/**
 * Enum for all available node types in the system.
 * This ensures consistency between palette items and actual nodes.
 */
export enum NodeType {
  Server = "server",
  Database = "database",
  LoadBalancer = "loadBalancer",
  Client = "client",
  Cache = "cache",
}

/**
 * Base data type shared by all node types
 */
export type BaseNodeData = {
  label: string;
  description: string;
};

// ==============================
// Server Node Data
// ==============================

/* Use for select server node and utilization */
export type ConcurrencyModel =
  | "Single-Threaded"
  | "Multi-Threaded"
  | "Event-Loop"
  | "Worker Pool";

export type RestartPolicy = "Always" | "OnFailure" | "Never";

export type DeploymentType = "Container" | "VM" | "Bare Metal" | "Serverless";

export type ScalingMetric = "CPU" | "Memory" | "Requests" | "Custom";

export type ServerNodeData = BaseNodeData & {
  // Compute Resources
  cpuCores: number;
  cpuSpeed: number; // GHz
  memory: number; // GB
  storage: number; // GB
  hasGPU: boolean;

  // Deployment Configuration
  instances: number;
  deploymentType: DeploymentType;
  autoScaling: boolean;
  minInstances?: number;
  maxInstances?: number;
  scalingMetric?: ScalingMetric;
  scalingThreshold?: number; // percentage
  region: string;

  // Performance Characteristics
  maxRequestsPerSecond: number;
  averageProcessingTime: number; // milliseconds
  concurrencyModel: ConcurrencyModel;
  maxConcurrentRequests: number;

  // Reliability Features
  healthCheckEnabled: boolean;
  healthCheckPath?: string;
  healthCheckInterval?: number; // seconds
  restartPolicy: RestartPolicy;

  // API Properties
  supportedProtocols: Protocol[];
  authenticationRequired: boolean;
  rateLimitPerSecond?: number;

  // Simulation Properties
  failureProbability: number; // 0-1 chance of failure during simulation
};
// ==============================
// Database Node Data
// ==============================

export type DBType = "SQL" | "NoSQL" | "Cache" | "Other";

export type DBSubType =
  | "Relational"
  | "Document"
  | "Key-Value"
  | "Column-Family"
  | "Graph"
  | "NewSQL"
  | "In-Memory";

export type ReplicationType =
  | "None"
  | "Master-Slave"
  | "Multi-Master"
  | "Sharded";

export type BackupStrategy = "None" | "Daily" | "Continuous";

export type QueryComplexity = "Simple" | "Moderate" | "Complex";

export type DatabaseNodeData = BaseNodeData & {
  // Basic classification
  dbType: DBType;
  dbSubType?: DBSubType;

  // Capacity and performance
  storageCapacity: number; // in GB
  maxConnections: number;
  readIOPS: number; // operations per second
  writeIOPS: number; // operations per second
  averageLatency: number; // in milliseconds

  // Reliability and scaling
  replication: boolean;
  replicationType?: ReplicationType;
  replicationFactor?: number; // how many copies
  backupStrategy?: BackupStrategy;
  autoScaling: boolean;

  // Workload characteristics
  readWriteRatio: number; // 0-100% reads vs writes
  queryComplexity: QueryComplexity;
  // Simulation properties
  failureProbability: number; // 0-1 chance of failure during simulation
};
// ==============================
// LoadBalancer Node Data
// ==============================

export type LoadBalancerType =
  | "Application"
  | "Network"
  | "Classic"
  | "Gateway";

export type BalancingAlgorithm =
  | "Round Robin"
  | "Least Connections"
  | "IP Hash"
  | "Weighted"
  | "URL Path";

export type FailoverStrategy = "Active-Passive" | "Active-Active" | "N+1";

export type LoadBalancerNodeData = BaseNodeData & {
  // Basic Configuration
  loadBalancerType: LoadBalancerType;
  algorithm: BalancingAlgorithm;
  sessionPersistence: boolean;
  sessionTimeout?: number; // in minutes, relevant when sessionPersistence is true

  // Capacity & Performance
  maxThroughput: number; // requests per second
  maxConnections: number; // concurrent connections
  processingLatency: number; // in milliseconds
  sslTermination: boolean; // whether SSL termination is performed at the load balancer

  // Health Checking
  healthCheckEnabled: boolean;
  healthCheckPath?: string; // e.g., "/health"
  healthCheckInterval?: number; // seconds between health checks
  healthCheckTimeout?: number; // seconds before considering a health check failed
  healthyThreshold?: number; // number of consecutive successful checks to consider a server healthy
  unhealthyThreshold?: number; // number of consecutive failed checks to consider a server unhealthy

  // Advanced Features
  connectToAutoScaling: boolean; // integration with auto-scaling groups
  contentBasedRouting: boolean; // route based on content, headers, paths
  rateLimitingEnabled: boolean;

  // Failover Configuration
  highAvailability: boolean; // deployed across multiple availability zones
  failoverStrategy: FailoverStrategy; // approach to handling failover
  // Simulation Properties
  failureProbability: number; // 0-1 chance of failure during simulation
};

// ==============================
// Client Node Data
// ==============================

export type ClientDeviceType =
  | "Browser"
  | "Mobile App"
  | "Desktop App"
  | "IoT Device"
  | "API Client";

export type ConnectionType = "Wired" | "WiFi" | "Cellular";

export type DevicePerformance = "Low" | "Medium" | "High";

export type RequestPattern = "Steady" | "Bursty" | "Periodic" | "Random";

export type ClientNodeData = BaseNodeData & {
  // Client Type and Characteristics
  clientType: ClientDeviceType;
  devicePerformance: DevicePerformance; // Represents processing power/capabilities
  connectionType: ConnectionType;
  geographicDistribution: string[]; // Regions where clients are located

  // Usage Patterns
  concurrentUsers: number; // Number of simultaneous users

  // Security and Authentication
  authenticationMethod: AuthenticationMethod;
  requireSecureConnection: boolean; // Requires HTTPS/TLS

  // Communication Properties
  preferredProtocol: Protocol; // Reusing the Protocol type from ServerNode
  supportedProtocols: Protocol[]; // All supported protocols
  connectionPersistence: boolean; // Whether connections are kept alive
  reconnectAttempts: number; // Number of reconnection attempts

  // Network Characteristics
  bandwidthLimit: number; // Maximum bandwidth in Mbps
  packetLossRate: number; // As a fraction (0-1)
  networkStability: number; // 0-1 rating of connection stability

  // Simulation Properties
  requestPattern: RequestPattern;
  burstFactor?: number; // For bursty patterns, multiplier during bursts
  periodSeconds?: number; // For periodic patterns, seconds between peaks
  retryOnError: boolean; // Whether client retries failed requests
  maxRetries: number; // Maximum number of retries
  cacheEnabled: boolean; // Whether client caches responses
  cacheTTL: number; // Cache time-to-live in seconds
  thinkTimeBetweenRequests: number; // Pause between requests in milliseconds
};
// ==============================
// Cache Node Data
// ==============================
export type CacheType = "In-Memory" | "Distributed" | "CDN" | "Browser";

export type EvictionPolicy = "LRU" | "LFU" | "FIFO" | "Random";

export type WritePolicy = "Write-Through" | "Write-Behind" | "Write-Around";

export type CacheSizeUnit = "MB" | "GB" | "TB";

export type ConsistencyLevel = "Strong" | "Eventual";

export type CacheNodeData = BaseNodeData & {
  // Basic Configuration
  cacheType: CacheType;
  cacheSizeValue: number;
  cacheSizeUnit: CacheSizeUnit;
  ttl: number; // Time to live in seconds (0 = no expiration)

  // Cache Policy
  evictionPolicy: EvictionPolicy;
  writePolicy: WritePolicy;
  consistencyLevel: ConsistencyLevel;

  // Performance
  maxThroughput: number; // Operations per second
  averageLatency: number; // In milliseconds
  expectedHitRate: number; // 0-1 representing cache hit rate

  // Distribution & Scaling
  replicationEnabled: boolean;
  replicaCount?: number; // Number of replicas when replication is enabled
  shardingEnabled: boolean;
  shardCount?: number; // Number of shards when sharding is enabled
  autoScalingEnabled: boolean;

  // Simulation Parameters
  averageItemSize: number; // In KB
  failureProbability: number; // 0-1 chance of failure during simulation
};

// ==============================
// Union Type for All Node Types
// ==============================

export type NodeData =
  | (BaseNodeData & Partial<ServerNodeData>)
  | (BaseNodeData & Partial<DatabaseNodeData>)
  | (BaseNodeData & Partial<LoadBalancerNodeData>)
  | (BaseNodeData & Partial<ClientNodeData>)
  | (BaseNodeData & Partial<CacheNodeData>);

/**
 * Type for nodes with their specific data
 */
export type ServerNode = Node<ServerNodeData, NodeType.Server>;
export type DatabaseNode = Node<DatabaseNodeData, NodeType.Database>;
export type LoadBalancerNode = Node<
  LoadBalancerNodeData,
  NodeType.LoadBalancer
>;
export type ClientNode = Node<ClientNodeData, NodeType.Client>;
export type CacheNode = Node<CacheNodeData, NodeType.Cache>;

/**
 * Union type of all possible node types
 */
export type SystemDesignNode =
  | ServerNode
  | DatabaseNode
  | LoadBalancerNode
  | ClientNode
  | CacheNode;

// ==============================
// Type Guard Functions
// ==============================

/**
 * Type guard to check if node is of type Client
 */
export function isClientNode(node: SystemDesignNode): node is ClientNode {
  return node.type === NodeType.Client;
}
/**
 * Type guard to check if node is of type Server
 */
export function isServerNode(node: SystemDesignNode): node is ServerNode {
  return node.type === NodeType.Server;
}
/**
 * Type guard to check if node is of type LoadBalancer
 */
export function isLoadBalancerNode(
  node: SystemDesignNode
): node is LoadBalancerNode {
  return node.type === NodeType.LoadBalancer;
}
/**
 * Type guard to check if node is of type Database
 */
export function isDatabaseNode(node: SystemDesignNode): node is DatabaseNode {
  return node.type === NodeType.Database;
}
/**
 * Type guard to check if node is of type Cache
 */
export function isCacheNode(node: SystemDesignNode): node is CacheNode {
  return node.type === NodeType.Cache;
}
