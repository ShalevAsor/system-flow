import { v4 as uuidv4 } from "uuid";
import {
  SimulationRequest,
  SimulationRequestType,
} from "../../../types/flow/simulationTypes";
import {
  BASE_SIZE,
  COMPUTE_PROB,
  READ_PROB,
  WRITE_PROB,
} from "../../../constants/flowDefaults";
import {
  CacheNode,
  ClientNode,
  ClientNodeData,
  DatabaseNode,
  isCacheNode,
  isClientNode,
  isDatabaseNode,
  isLoadBalancerNode,
  isServerNode,
  ServerNode,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import { SystemDesignEdge } from "../../../types/flow/edgeTypes";
import {
  buildSystemGraph,
  findReachableNodes,
} from "../../../utils/graphUtils";
import { randomIndex, weightedRandomSelection } from "../../../utils/random";

export const requestGenerator = {
  /**
   * Generate simulation requests from all client nodes
   *
   * @param nodes - All nodes in the system
   * @param edges - All edges in the system
   * @param currentTime - Current simulation time in ms
   * @param timeStep - Time increment for this tick in ms
   * @returns Array of new simulation requests
   */
  generateRequests(
    nodes: SystemDesignNode[],
    edges: SystemDesignEdge[],
    currentTime: number,
    timeStep: number
  ): SimulationRequest[] {
    // Find all client nodes
    const clientNodes = nodes.filter((node) => isClientNode(node));
    // Initialize result array
    const newRequests: SimulationRequest[] = [];
    // Generate requests from each client based on its configuration
    clientNodes.forEach((clientNode) => {
      // Calculate requests per second
      const avgRequestsPerSecond = this.calculateRequestsPerSecond(
        clientNode.data.concurrentUsers,
        clientNode.data.thinkTimeBetweenRequests
      );

      // Calculate how many requests to generate this tick
      // Expected number of requests in this time step
      const expectedRequestsThisStep = (avgRequestsPerSecond * timeStep) / 1000;
      // Apply pattern-specific adjustments
      const adjustedRequestsThisStep = this.applyRequestPattern(
        clientNode.data,
        expectedRequestsThisStep,
        currentTime
      );
      // Round to get a whole number of requests to generate
      const requestsToGenerate = Math.ceil(adjustedRequestsThisStep);

      // Generate the calculated number of requests
      for (let i = 0; i < requestsToGenerate; i++) {
        const request = this.generateRequestFromClient(
          clientNode,
          nodes,
          edges,
          currentTime
        );
        if (request) {
          newRequests.push(request);
        }
      }
    });

    return newRequests;
  },

  /**
   * Generate a request from a specific client node
   *
   * @param clientNode - The client node generating the request
   * @param allNodes - All nodes in the system
   * @param allEdges - All edges in the system
   * @param currentTime - Current simulation time
   * @returns A new simulation request or null if no valid destination
   */
  generateRequestFromClient(
    clientNode: ClientNode,
    allNodes: SystemDesignNode[],
    allEdges: SystemDesignEdge[],
    currentTime: number
  ): SimulationRequest | null {
    console.log("Visited generateRequestFromClient");
    // Determine the type of the request
    const requestType: SimulationRequestType = this.determineRequestType();

    // Determine the destination for this request
    const destination = this.determineRequestDestination(
      clientNode,
      requestType,
      allNodes,
      allEdges
    );
    // If no valid destination, return null
    if (!destination) {
      return null;
    }

    // Extract client data
    const clientData: ClientNodeData = clientNode.data;

    // Determine request size based on client, destination type, and request type
    const requestSizeKB = this.determineRequestSize(
      clientNode,
      destination,
      requestType
    );

    // Calculate initial processing time based on client performance
    const initialProcessingTime =
      this.determineInitialClientProcessingTime(clientData);

    // Randomly choose source region for request
    const sourceRegion =
      clientData.geographicDistribution[
        randomIndex(clientData.geographicDistribution.length)
      ];

    // Create the request
    const request: SimulationRequest = {
      id: this.generateRequestId(),
      type: requestType,
      status: "pending",
      sourceNodeId: clientNode.id,
      currentNodeId: clientNode.id,
      destinationNodeId: destination.id,
      path: [],
      // Size and timing
      sizeKB: requestSizeKB,
      createdAt: currentTime,

      // Client preferences
      secureConnection: clientData.requireSecureConnection,
      preferredProtocol: clientData.preferredProtocol,
      authMethod: clientData.authenticationMethod,
      maxRetries: clientData.maxRetries,
      sourceRegion,
      cacheEnabled: clientData.cacheEnabled,
      retryOnError: clientData.retryOnError,
      // Processing data
      processingData: {
        retryCount: 0,
        processingTime: 0,
        requiredProcessingTime: initialProcessingTime,
        nodeUtilization: {},
        edgeUtilization: {},
        totalProcessingTime: 0,
      },
    };
    return request;
  },
  /**
   * Generate a unique ID for a simulation request
   * @returns request id
   */
  generateRequestId(): string {
    return `req-${uuidv4().substring(0, 8)}`;
  },

  /**
   * Determine the type of request based on random factors
   * read - 40 %
   * write - 30%
   * compute - 15%
   * transaction - 15%
   * @returns request type
   */
  determineRequestType(): SimulationRequestType {
    const randomValue = Math.random();
    if (randomValue < READ_PROB) {
      return "Read";
    } else if (randomValue < READ_PROB + WRITE_PROB) {
      return "Write";
    } else if (randomValue < READ_PROB + WRITE_PROB + COMPUTE_PROB) {
      return "Compute";
    } else {
      return "Transaction";
    }
  },
  /**
   * Determine the size of a request based on client and target
   *
   * @param clientNode - The client node
   * @param targetNode - The target node
   * @returns Size in KB
   */
  determineRequestSize(
    clientNode: ClientNode,
    targetNode: SystemDesignNode,
    requestType: SimulationRequestType
  ): number {
    // Base size
    let baseSize = BASE_SIZE;

    // Apply request type specific size adjustments
    switch (requestType) {
      case "Read":
        // Read requests typically have smaller payloads
        baseSize *= 0.7;
        break;
      case "Write":
        // Write requests can be larger due to payload data
        baseSize *= 1.5;
        break;
      case "Compute":
        // Compute requests may contain parameters but not large data
        baseSize *= 1.0;
        break;
      case "Transaction":
        // Transactions often contain multiple operations
        baseSize *= 2.0;
        break;
    }

    // Apply client-specific size adjustments
    baseSize = this.applyClientSizeAdjustments(clientNode.data, baseSize);

    // Apply target-specific size adjustments
    baseSize = this.applyTargetSizeAdjustments(targetNode, baseSize);

    // Add some randomness (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    const size = Math.round(baseSize * randomFactor);

    return size;
  },
  determineInitialClientProcessingTime(clientData: ClientNodeData): number {
    let processingTime = 0;
    // Base processing time depends on device performance
    if (clientData.devicePerformance === "Low") {
      processingTime += 30;
    } else if (clientData.devicePerformance === "Medium") {
      processingTime += 20;
    } else {
      processingTime += 10; // High performance
    }
    if (clientData.bandwidthLimit && clientData.bandwidthLimit > 0) {
      // Slower bandwidth means longer processing time
      const bandwidthFactor = 10 / clientData.bandwidthLimit;
      processingTime *= Math.min(bandwidthFactor, 3); // Cap at 3x slowdown
    }
    return processingTime;
  },
  /**
   * Determine the destination node for a request based on client, system, and request type
   *
   * @param sourceNode - The source client node
   * @param requestType - The type of request (Read, Write, Compute, Transaction)
   * @param allNodes - All nodes in the system
   * @param allEdges - All edges in the system
   * @returns Target node or null if no valid target
   */
  determineRequestDestination(
    sourceNode: ClientNode,
    requestType: SimulationRequestType,
    allNodes: SystemDesignNode[],
    allEdges: SystemDesignEdge[]
  ): SystemDesignNode | null {
    //Extract client data
    const clientData: ClientNodeData = sourceNode.data;
    // Step 1: Build a graph representing the system
    const graph = buildSystemGraph(allNodes, allEdges);
    // Step 2: Find all nodes reachable from the source node
    const reachableNodesIds = findReachableNodes(graph, sourceNode.id);
    if (reachableNodesIds.size === 0) {
      console.error("No reachable nodes found for client node:", sourceNode.id);
      return null;
    }
    // Step 3: filter nodes based on reachability
    const reachableNodes = allNodes.filter((node) =>
      reachableNodesIds.has(node.id)
    );
    // Step 4: Apply priority rules based on request type
    switch (requestType) {
      case "Read": {
        // prioritize caches , then databases , then servers
        // Priority 1: Caches
        if (clientData.cacheEnabled) {
          const cacheNodes = reachableNodes.filter((node) => isCacheNode(node));
          if (cacheNodes.length > 0) {
            return this.selectCacheNode(cacheNodes, requestType);
          }
        }
        // Priority 2: Databases
        const databaseNodes = reachableNodes.filter((node) =>
          isDatabaseNode(node)
        );
        if (databaseNodes.length > 0) {
          return this.selectDatabaseNode(databaseNodes, requestType);
        }
        // Priority 3: Servers
        const serverNodes = reachableNodes.filter((node) => isServerNode(node));
        if (serverNodes.length > 0) {
          return this.selectServerNode(serverNodes, requestType, clientData);
        }
        break;
      }
      case "Write": {
        // Prioritize databases , then servers
        // Priority 1: Databases
        const databaseNodes = reachableNodes.filter((node) =>
          isDatabaseNode(node)
        );
        if (databaseNodes.length > 0) {
          return this.selectDatabaseNode(databaseNodes, requestType);
        }
        // Priority 2: Servers
        const serverNodes = reachableNodes.filter((node) => isServerNode(node));
        if (serverNodes.length > 0) {
          return this.selectServerNode(serverNodes, requestType, clientData);
        }
        break;
      }
      case "Compute": {
        // For compute operations, prioritize servers with good CPU/memory specs
        const serverNodes = reachableNodes.filter((node) => isServerNode(node));
        if (serverNodes.length > 0) {
          return this.selectServerNode(serverNodes, requestType, clientData);
        }
        break;
      }
      case "Transaction": {
        // For transactions, prioritize databases, then servers
        // Priority 1: Databases
        const databaseNodes = reachableNodes.filter((node) =>
          isDatabaseNode(node)
        );
        if (databaseNodes.length > 0) {
          return this.selectDatabaseNode(databaseNodes, requestType);
        }
        // Priority 2: Servers
        const serverNodes = reachableNodes.filter((node) => isServerNode(node));

        if (serverNodes.length > 0) {
          return this.selectServerNode(serverNodes, requestType, clientData);
        }
        break;
      }
    }

    // Fallback options if no specific destination found
    // 1. Loadbalancer nodes
    const loadBalancerNodes = reachableNodes.filter((node) =>
      isLoadBalancerNode(node)
    );
    if (loadBalancerNodes.length > 0) {
      const idx = randomIndex(loadBalancerNodes.length);
      return loadBalancerNodes[idx];
    }
    // 2. Any other reachable node (except other clients)
    const otherNodes = reachableNodes.filter((node) => !isClientNode(node));
    if (otherNodes.length > 0) {
      const idx = randomIndex(otherNodes.length);
      return otherNodes[idx];
    }
    // 3. Last resort: other client nodes
    const otherClientNodes = reachableNodes.filter(
      (node) => isClientNode(node) && node.id !== sourceNode.id
    );
    if (otherClientNodes.length > 0) {
      const idx = randomIndex(otherClientNodes.length);
      return otherClientNodes[idx];
    }
    // No suitable destination found
    console.warn(
      "No suitable destination found among reachable nodes for client:",
      sourceNode.id
    );
    return null;
  },
  /**
   * Select a cache node based on the request type and client data
   * @param cacheNodes - Array of cache nodes to choose from
   * @param requestType - Type of request (e.g., "Read", "Write", "Compute")
   * @returns A cache node to route the request to
   */
  selectCacheNode(
    cacheNodes: CacheNode[],
    requestType: SimulationRequestType
  ): CacheNode {
    // Start with scoring each cache based on key attributes
    const scoredNodes = cacheNodes.map((node) => {
      const data = node.data;
      let score = 0;

      // Base score - add some randomness to prevent always choosing the same node
      score += Math.random() * 10;

      // Performance score factors
      score += (100 - data.averageLatency) * 0.1; // Lower latency is better
      score += data.expectedHitRate * 20; // Higher hit rate is better
      score += (data.maxThroughput / 10000) * 0.5; // Higher throughput is better
      // For read requests, in-memory caches might be preferable
      if (requestType === "Read" && data.cacheType === "In-Memory") {
        score += 5;
      }

      // For CDN content, prioritize CDN caches
      if (data.cacheType === "CDN") {
        score += 3;
      }

      return { node, score };
    });

    // Sort by score (highest first)
    scoredNodes.sort((a, b) => b.score - a.score);
    // Select from top candidates with weighted randomization
    const topCount = Math.min(3, scoredNodes.length);
    const topNodes = scoredNodes.slice(0, topCount);

    return weightedRandomSelection(topNodes);
  },
  /**
   * Select a database node based on the request type and client data
   * @param databaseNodes - Array of database nodes to choose from
   * @param requestType - Type of request (e.g., "Read", "Write", "Compute")
   * @returns A database node to route the request to
   */
  selectDatabaseNode(
    databaseNodes: DatabaseNode[],
    requestType: SimulationRequestType
  ): DatabaseNode {
    // Start with scoring each database node based on key attributes
    const scoredNodes = databaseNodes.map((node) => {
      const data = node.data;
      let score = 0;

      // Base score with randomness
      score += Math.random() * 10;
      // Consider storage capacity
      score += data.storageCapacity / 100;
      // Consider auto scaling
      if (data.autoScaling) {
        score += 5;
      }
      if (requestType === "Read") {
        // For reads, prioritize read performance
        score += (data.readIOPS / 500) * 2;
        score += (50 - data.averageLatency) * 0.3;

        // In-memory databases are typically faster for reads
        if (data.dbSubType === "In-Memory") {
          score += 5;
        }

        // Databases optimized for reads (high read/write ratio)
        score += data.readWriteRatio / 10;

        // Query complexity consideration
        if (data.queryComplexity === "Simple") {
          score += 3;
        } else if (data.queryComplexity === "Complex") {
          score -= 2;
        }

        // Replicated databases often have better read performance
        if (data.replication) {
          score += 4;

          if (
            data.replicationType === "Multi-Master" ||
            data.replicationType === "Sharded"
          ) {
            score += 3;
          }
        }
      } else if (requestType === "Write") {
        // For writes, prioritize write performance
        score += (data.writeIOPS / 250) * 2;
        score += (50 - data.averageLatency) * 0.2;

        // NoSQL databases often have better write performance
        if (data.dbType === "NoSQL") {
          score += 4;
        }

        // Databases optimized for writes (low read/write ratio)
        score += (100 - data.readWriteRatio) / 10;

        // Replication factors for write reliability
        if (data.replication) {
          if (data.replicationType === "Multi-Master") {
            score += 5; // Best for writes
          } else if (data.replicationType === "Sharded") {
            score += 4; // Good for distributing write load
          } else {
            score += 1; // Some replication is better than none
          }
        }
      } else if (requestType === "Transaction") {
        // For transactions, prioritize ACID compliance and consistency
        if (data.dbType === "SQL" || data.dbSubType === "NewSQL") {
          score += 25; // SQL databases excel at transactions
        } else {
          score -= 10; // Penalize non-SQL databases for transactions
        }

        // More connections can handle more simultaneous transactions
        score += data.maxConnections / 500;

        // Lower latency helps with transaction throughput
        score += (50 - data.averageLatency) * 0.3;

        // Backup strategy indicates reliability for transactions
        if (data.backupStrategy === "Continuous") {
          score += 5;
        } else if (data.backupStrategy === "Daily") {
          score += 2;
        }
      } else if (requestType === "Compute") {
        // For compute-heavy operations, prioritize databases with analytics capabilities
        if (data.dbSubType === "Column-Family" || data.dbSubType === "Graph") {
          score += 6; // These types excel at certain compute workloads
        }

        // In-memory can be good for compute operations
        if (data.dbSubType === "In-Memory") {
          score += 4;
        }

        // Complex query support indicates compute capabilities
        if (data.queryComplexity === "Complex") {
          score += 5;
        }
      }

      return { node, score };
    });

    // Sort by score (highest first)
    scoredNodes.sort((a, b) => b.score - a.score);
    // Select from top candidates with weighted randomization
    const topCount = Math.min(3, scoredNodes.length);
    const topNodes = scoredNodes.slice(0, topCount);

    return weightedRandomSelection(topNodes);
  },
  /**
   * Select a server node based on the request type and client data
   * @param databaseNodes - Array of server nodes to choose from
   * @param requestType - Type of request (e.g., "Read", "Write", "Compute")
   * @returns A server node to route the request to
   */
  selectServerNode(
    serverNodes: ServerNode[],
    requestType: SimulationRequestType,
    clientData: ClientNodeData
  ): ServerNode {
    // Score each server node based on key attributes
    const scoredNodes = serverNodes.map((node) => {
      const data = node.data;
      let score = 0;

      // Base score with randomness
      score += Math.random() * 10;
      /* Common factors across all request types */
      // Processing capacity
      score += data.maxRequestsPerSecond / 1000;
      score += (200 - data.averageProcessingTime) * 0.1;
      // Prefer servers with more instances for better availability
      score += data.instances * 0.5;
      // Prefer servers with autoscaling for handling variable loads
      if (data.autoScaling) {
        score += 3;
      }
      // Prefer healthy servers
      if (data.healthCheckEnabled) {
        score += 2;
      }
      // Resource capacity
      score += data.cpuCores * 0.5;
      score += (data.memory / 4) * 0.5;
      // Protocol compatibility with client if specified
      if (
        clientData?.preferredProtocol &&
        data.supportedProtocols.includes(clientData.preferredProtocol)
      ) {
        score += 5;
      }
      // Request type specific scoring
      switch (requestType) {
        case "Read":
          // For reads, network bandwidth and concurrency are important
          score += data.maxConcurrentRequests / 25;
          // Event-loop model is often good for many concurrent read operations
          if (
            data.concurrencyModel === "Event-Loop" ||
            data.concurrencyModel === "Worker Pool"
          ) {
            score += 3;
          }
          break;
        case "Write":
          // For writes, storage and reliability are more important
          score += (data.storage / 50) * 0.5;
          // Prefer reliable restart policies for write operations
          if (data.restartPolicy === "Always") {
            score += 3;
          }
          // Multi-threaded can be better for write operations
          if (data.concurrencyModel === "Multi-Threaded") {
            score += 3;
          }
          break;
        case "Compute":
          // For compute operations, CPU, memory, and special hardware matter most
          score += data.cpuCores * 1.5;
          score += data.cpuSpeed * 2;
          score += data.memory / 2;
          // GPU availability is a big plus for compute tasks
          if (data.hasGPU) {
            score += 30;
          }
          // Worker pools are great for compute tasks
          if (data.concurrencyModel === "Worker Pool") {
            score += 5;
          }
          break;
        case "Transaction":
          // For transactions, reliability and processing time are critical
          score += (100 - data.averageProcessingTime) * 0.2;
          // Prefer servers with authentication for transactions
          if (data.authenticationRequired) {
            score += 4;
          }
          // Multi-threaded often handles transactions well
          if (data.concurrencyModel === "Multi-Threaded") {
            score += 4;
          }
          // Bare metal or VMs might be more reliable for transactions than containers
          if (
            data.deploymentType === "Bare Metal" ||
            data.deploymentType === "VM"
          ) {
            score += 3;
          }
          break;
      }
      return { node, score };
    });

    // Sort by score (highest first)
    scoredNodes.sort((a, b) => b.score - a.score);

    // Select from top candidates with some randomization
    const topCount = Math.min(3, scoredNodes.length);
    const topNodes = scoredNodes.slice(0, topCount);
    return weightedRandomSelection(topNodes);
  },
  /**
   * Calculate the average requests per second the client should generate based on concurrent users and think time between request
   *
   * @param concurrentUsers - Number of concurrent users
   * @param  thinkTimeBetweenRequests - Time between requests in ms (default 1000ms)
   * @returns The number of requests per second
   */
  calculateRequestsPerSecond(
    concurrentUsers: number,
    thinkTimeBetweenRequests: number
  ): number {
    // Calculate requests per second per user
    const requestsPerUserPerSecond = 1000 / thinkTimeBetweenRequests;
    const requestsPerSecond = concurrentUsers * requestsPerUserPerSecond;
    return Math.round(requestsPerSecond);
  },
  /**
   * Calculate initial processing time for a client based on its performance characteristics
   * @param clientData - The client node data
   * @returns Initial processing time in milliseconds
   */

  /**
   * Apply request pattern adjustments to the expected number of requests
   *
   * @param clientData - The client node data
   * @param expectedRequests - The base expected number of requests
   * @param currentTime - Current simulation time
   * @returns Adjusted expected number of requests
   */
  applyRequestPattern(
    clientData: ClientNodeData,
    expectedRequests: number,
    currentTime: number
  ): number {
    const requestPattern = clientData.requestPattern;
    let adjustedRequests = expectedRequests;

    switch (requestPattern) {
      case "Steady":
        // No modification for steady pattern
        break;

      case "Bursty": {
        const burstFactor = clientData.burstFactor || 5;
        const burstInterval = 10 * 1000; // 10 seconds between bursts
        const burstDuration = 2 * 1000; // 2 second burst
        const isBurstActive = currentTime % burstInterval < burstDuration;
        if (isBurstActive) {
          adjustedRequests *= burstFactor;
        }
        break;
      }
      // For bursty pattern, periodically increase rate

      case "Periodic": {
        // For periodic pattern, follow a sine wave
        const periodSeconds = clientData.periodSeconds || 60;
        const periodMs = periodSeconds * 1000;
        const normalizedPosition = (currentTime % periodMs) / periodMs;
        // Sine wave from 0.5 to 1.5 times the base rate
        const multiplier = 1 + 0.5 * Math.sin(normalizedPosition * 2 * Math.PI);
        adjustedRequests *= multiplier;
        break;
      }

      case "Random": {
        // For random pattern, apply a random factor between 0.5 and 1.5
        const randomFactor = 0.5 + Math.random();
        adjustedRequests *= randomFactor;
        break;
      }
    }

    return adjustedRequests;
  },
  /**
   * Apply client-specific adjustments to the request size
   *
   * @param clientData - The client node data
   * @param baseSize - The Current base size in KB
   * @returns Size in KB
   */
  applyClientSizeAdjustments(
    clientData: ClientNodeData,
    baseSize: number
  ): number {
    let adjustedSize = baseSize;
    // Adjust based on preferred protocol
    switch (clientData.preferredProtocol) {
      case "gRPC":
        adjustedSize *= 0.5; // gRPC is efficient
        break;
      case "HTTP":
        adjustedSize *= 1.5; // HTTP has more overhead
        break;
      case "HTTPS":
        adjustedSize *= 1.7; // HTTPS has more overhead
        break;
      case "WebSocket":
        adjustedSize *= 0.7; // WebSockets are relatively efficient
        break;
      case "TCP":
        adjustedSize *= 0.6; // TCP is efficient
        break;
      case "UDP":
        adjustedSize *= 0.4; // UDP is very lightweight
        break;
    }
    switch (clientData.clientType) {
      case "Mobile App":
        adjustedSize *= 0.7; // Mobile clients send smaller requests
        break;
      case "IoT Device":
        adjustedSize *= 0.3; // IoT devices send very small requests
        break;
      case "Browser":
        adjustedSize *= 1.2; // Browsers often send larger requests
        break;
      case "Desktop App":
        adjustedSize *= 0.7; // Desktop apps send moderately sized requests
        break;
      case "API Client":
        adjustedSize *= 1;
        break;
    }
    switch (clientData.authenticationMethod) {
      case "JWT":
      case "OAuth":
        adjustedSize += 0.5; // Token-based auth adds overhead
        break;
      case "Client Certificate":
        adjustedSize += 1; // Certificate auth adds more overhead
        break;
      case "API Key":
        adjustedSize += 0.2;
        break;
      default:
        break;
    }
    return adjustedSize;
  },
  /**
   * Apply target-specific adjustments to the request size
   *
   * @param node - The target node
   * @param baseSize - The Current base size in KB
   * @returns Size in KB
   */
  applyTargetSizeAdjustments(node: SystemDesignNode, baseSize: number): number {
    let adjustedSize = baseSize;

    // Apply database specific adjustments
    if (isDatabaseNode(node)) {
      const dbData = node.data;
      // Direct connection between client and database is bad idea -  Apply a performance penalty
      adjustedSize *= 5;
      // Adjust size based on query complexity
      const queryComplexity = dbData.queryComplexity;
      if (queryComplexity === "Simple") {
        // No change for simple queries
      } else if (queryComplexity === "Moderate") {
        adjustedSize *= 2;
      } else if (queryComplexity === "Complex") {
        adjustedSize *= 4;
      }
      // Consider database type
      if (dbData.dbType === "SQL") {
        adjustedSize *= 1.2; // SQL queries tend to be more verbose
      } else if (dbData.dbType === "NoSQL") {
        adjustedSize *= 0.8; // NoSQL often has less structure overhead
      }
    } else if (isServerNode(node)) {
      const serverData = node.data;
      if (serverData.supportedProtocols?.includes("HTTP")) {
        adjustedSize *= 1.2; // REST APIs typically have more verbose requests
      } else if (serverData.supportedProtocols?.includes("gRPC")) {
        adjustedSize *= 0.7; // gRPC servers have more compact requests
      }
      // Authentication impacts request size
      if (serverData.authenticationRequired) {
        adjustedSize *= 1.3; // Auth headers add overhead
      }
    }
    // Add load balancer adjustments
    else if (isLoadBalancerNode(node)) {
      const lbData = node.data;
      if (lbData.contentBasedRouting) {
        adjustedSize *= 1.3; // Content-based routing requires more request data
      }
    }
    return adjustedSize;
  },
};
