import {
  ServerNodeData,
  DatabaseNodeData,
  LoadBalancerNodeData,
  ClientNodeData,
  CacheNodeData,
  BaseNodeData,
} from "../types/flow/nodeTypes";

/**
 * Default values for server nodes
 */
export const defaultServerNodeData: Omit<ServerNodeData, keyof BaseNodeData> = {
  // Compute Resources
  cpuCores: 4,
  cpuSpeed: 2.5,
  memory: 8,
  storage: 100,
  hasGPU: false,

  // Deployment Configuration
  instances: 2,
  deploymentType: "Container",
  autoScaling: false,
  minInstances: 1,
  maxInstances: 10,
  scalingMetric: "CPU",
  scalingThreshold: 70,
  region: "us-east-1",

  // Performance Characteristics
  maxRequestsPerSecond: 1000,
  averageProcessingTime: 50,
  concurrencyModel: "Multi-Threaded",
  maxConcurrentRequests: 100,

  // Reliability Features
  healthCheckEnabled: true,
  healthCheckPath: "/health",
  healthCheckInterval: 30,
  restartPolicy: "Always",

  // API Properties
  supportedProtocols: ["HTTP", "HTTPS"],
  authenticationRequired: false,
  rateLimitPerSecond: 0,

  // Simulation Properties
  failureProbability: 0.005,
};

/**
 * Default values for database nodes
 */
export const defaultDatabaseNodeData: Omit<
  DatabaseNodeData,
  keyof BaseNodeData
> = {
  // Basic classification
  dbType: "SQL",
  dbSubType: "Relational",

  // Capacity and performance
  storageCapacity: 100,
  maxConnections: 500,
  readIOPS: 1000,
  writeIOPS: 500,
  averageLatency: 5,

  // Reliability and scaling
  replication: false,
  replicationType: "Master-Slave",
  replicationFactor: 3,
  backupStrategy: "Daily",
  autoScaling: false,

  // Workload characteristics
  readWriteRatio: 70,
  queryComplexity: "Moderate",

  // Simulation properties
  failureProbability: 0.001,
};

/**
 * Default values for load balancer nodes
 */
export const defaultLoadBalancerNodeData: Omit<
  LoadBalancerNodeData,
  keyof BaseNodeData
> = {
  // Basic Configuration
  loadBalancerType: "Application",
  algorithm: "Round Robin",
  sessionPersistence: false,
  sessionTimeout: 30,

  // Capacity & Performance
  maxThroughput: 10000,
  maxConnections: 100000,
  processingLatency: 5,
  sslTermination: true,

  // Health Checking
  healthCheckEnabled: true,
  healthCheckPath: "/health",
  healthCheckInterval: 30,
  healthCheckTimeout: 5,
  healthyThreshold: 2,
  unhealthyThreshold: 2,

  // Advanced Features
  connectToAutoScaling: false,
  contentBasedRouting: false,
  rateLimitingEnabled: false,

  // Failover Configuration
  highAvailability: true,
  failoverStrategy: "Active-Passive",

  // Simulation Properties
  failureProbability: 0.005,
};

/**
 * Default values for client nodes
 */
export const defaultClientNodeData: Omit<ClientNodeData, keyof BaseNodeData> = {
  // Client Type and Characteristics
  clientType: "Browser",
  devicePerformance: "Medium",
  connectionType: "WiFi",
  geographicDistribution: ["North America", "Europe"],

  // Usage Patterns
  concurrentUsers: 100,

  // Security and Authentication
  authenticationMethod: "OAuth",
  requireSecureConnection: true,

  // Communication Properties
  preferredProtocol: "HTTPS",
  supportedProtocols: ["HTTP", "HTTPS"],
  connectionPersistence: true,
  reconnectAttempts: 3,

  // Network Characteristics
  bandwidthLimit: 10,
  packetLossRate: 0.01,
  networkStability: 0.95,

  // Simulation Properties
  requestPattern: "Steady",
  retryOnError: true,
  maxRetries: 3,
  cacheEnabled: true,
  cacheTTL: 300,
  thinkTimeBetweenRequests: 1000,
};

/**
 * Default values for cache nodes
 */
export const defaultCacheNodeData: Omit<CacheNodeData, keyof BaseNodeData> = {
  // Basic Configuration
  cacheType: "In-Memory",
  cacheSizeValue: 1,
  cacheSizeUnit: "GB",
  ttl: 3600,

  // Cache Policy
  evictionPolicy: "LRU",
  writePolicy: "Write-Through",
  consistencyLevel: "Eventual",

  // Performance
  maxThroughput: 50000,
  averageLatency: 5, // 0.5 ms
  expectedHitRate: 0.8,

  // Distribution & Scaling
  replicationEnabled: false,
  replicaCount: 2,
  shardingEnabled: false,
  shardCount: 3,
  autoScalingEnabled: false,

  // Simulation Parameters
  averageItemSize: 10,
  failureProbability: 0.002,
};
