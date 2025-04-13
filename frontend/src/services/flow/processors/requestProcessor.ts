import {
  FAILURE_CHANCE_NODE_OVERLOAD,
  MAX_REQUEST_LIFETIME,
  RETRY_CHANCE,
} from "../../../constants/flowDefaults";
import {
  DatabaseEdgeData,
  EventStreamEdgeData,
  GRPCEdgeData,
  HTTPEdgeData,
  isDatabaseEdge,
  isEventStreamEdge,
  isGRPCEdge,
  isHTTPEdge,
  isMessageQueueEdge,
  isTCPEdge,
  isUDPEdge,
  isWebSocketEdge,
  MessageQueueEdgeData,
  SystemDesignEdge,
  TCPEdgeData,
  UDPEdgeData,
  WebSocketEdgeData,
} from "../../../types/flow/edgeTypes";
import {
  isCacheNode,
  isClientNode,
  isDatabaseNode,
  isLoadBalancerNode,
  isServerNode,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import {
  ComponentUtilization,
  RequestProcessorResult,
  SimulationRequest,
} from "../../../types/flow/simulationTypes";
import { requestRouter } from "../routers/requestRouter";
export const requestProcessor = {
  /**
   * Process all active requests in the simulation for a single time step
   *
   * @param requests - Current requests in the simulation
   * @param nodes - All nodes in the system
   * @param edges - All edges in the system
   * @param timeStep - Time increment for this tick in ms
   * @param elapsedSimulationTime - Total simulation time in ms
   * @param currentUtilization - Current utilization metrics
   * @returns Object containing updated requests and utilization data
   */
  processRequests(
    requests: SimulationRequest[],
    nodes: SystemDesignNode[],
    edges: SystemDesignEdge[],
    timeStep: number,
    elapsedSimulationTime: number,
    currentUtilization: ComponentUtilization
  ): RequestProcessorResult {
    // Initialize return values
    const activeRequests: SimulationRequest[] = [];
    const completedRequests: SimulationRequest[] = [];
    const failedRequests: SimulationRequest[] = [];
    // Deep copy the utilization to avoid modifying the original
    const updatedUtilization: ComponentUtilization = {
      nodeUtilization: { ...currentUtilization.nodeUtilization },
      edgeUtilization: { ...currentUtilization.edgeUtilization },
    };

    // Process each request
    for (const request of requests) {
      // Skip already completed or failed requests
      if (request.status === "completed" || request.status === "failed") {
        if (request.status === "completed") {
          completedRequests.push(request);
        } else {
          failedRequests.push(request);
        }
        continue;
      }
      // Process the request
      const updatedRequest = this.processRequest(
        request,
        nodes,
        edges,
        timeStep,
        elapsedSimulationTime,
        updatedUtilization
      );
      // Route the request based on its status
      if (updatedRequest.status === "completed") {
        completedRequests.push(updatedRequest);
      } else if (updatedRequest.status === "failed") {
        failedRequests.push(updatedRequest);
      } else {
        activeRequests.push(updatedRequest);
      }
    }
    const requestProcessorResult: RequestProcessorResult = {
      activeRequests,
      completedRequests,
      failedRequests,
      componentUtilization: {
        nodeUtilization: updatedUtilization.nodeUtilization,
        edgeUtilization: updatedUtilization.edgeUtilization,
      },
    };

    return requestProcessorResult;
  },
  /**
   * Process a single request through the simulation
   *
   * @param request - The request to process
   * @param nodes - All nodes in the system
   * @param edges - All edges in the system
   * @param timeStep - Time increment for this tick in ms
   * @param elapsedSimulationTime - Current simulation time in ms
   * @param utilization - Current utilization metrics (will be updated)
   * @returns Updated request after processing
   */

  processRequest(
    request: SimulationRequest,
    nodes: SystemDesignNode[],
    edges: SystemDesignEdge[],
    timeStep: number,
    elapsedSimulationTime: number,
    utilization: ComponentUtilization
  ): SimulationRequest {
    // Clone the request to avoid mutations
    const updatedRequest = {
      ...request,
      processingData: { ...request.processingData },
    };
    // Get the current node
    const currentNodeId = updatedRequest.currentNodeId;
    // 1. Check for timeout first
    const totalLifetime = elapsedSimulationTime - updatedRequest.createdAt;
    // If there's an edge to decrease utilization for, do it now
    if (updatedRequest.processingData.edgeToDecreaseId) {
      const edgeToDecrease = edges.find(
        (e) => e.id === updatedRequest.processingData.edgeToDecreaseId
      );
      if (edgeToDecrease) {
        this.decreaseEdgeUtilization(
          edgeToDecrease,
          utilization,
          updatedRequest
        );
      }
      updatedRequest.processingData.edgeToDecreaseId = undefined; // Clear the edge ID
    }
    if (totalLifetime > MAX_REQUEST_LIFETIME) {
      updatedRequest.status = "failed";
      updatedRequest.failedAt = elapsedSimulationTime;
      updatedRequest.failureReason = "Timeout - exceeded maximum lifetime";
      // Decrease utilization since request is no longer being processed
      this.decreaseNodeUtilization(currentNodeId, utilization, updatedRequest);
      return updatedRequest;
    }
    // 2. Check if max retries exceeded
    if (updatedRequest.processingData.retryCount > updatedRequest.maxRetries) {
      updatedRequest.status = "failed";
      updatedRequest.failedAt = elapsedSimulationTime;
      updatedRequest.failureReason = "Exceeded maximum retry attempts";
      this.decreaseNodeUtilization(currentNodeId, utilization, updatedRequest);

      return updatedRequest;
    }
    // Get the current node
    const currentNode = nodes.find((node) => node.id === currentNodeId);

    if (!currentNode) {
      // Node not found - fail the request
      updatedRequest.status = "failed";
      updatedRequest.failedAt = elapsedSimulationTime;
      updatedRequest.failureReason = "Current node not found";
      this.decreaseNodeUtilization(currentNodeId, utilization, updatedRequest);
      return updatedRequest;
    }

    // 3. If still processing at current node
    const processingTime = updatedRequest.processingData.processingTime;
    const requiredProcessingTime =
      updatedRequest.processingData.requiredProcessingTime;
    if (processingTime < requiredProcessingTime) {
      // 3.1 update node utilization
      this.increaseNodeUtilization(currentNode, utilization, request);
      // 3.2 check for node overload
      if (this.isNodeOverloaded(currentNode, utilization)) {
        // Higher chance to fail the request - 30% chance to fail

        if (Math.random() < FAILURE_CHANCE_NODE_OVERLOAD) {
          updatedRequest.status = "failed";
          updatedRequest.failedAt = elapsedSimulationTime;
          updatedRequest.failureReason = "Node overload";
          this.decreaseNodeUtilization(
            currentNodeId,
            utilization,
            updatedRequest
          );

          return updatedRequest;
        }
        // If not failed, processing time is slower on overloaded node
        updatedRequest.processingData.processingTime += timeStep * 0.5;
      } else {
        // 3.3 check for random failure based on probability and request configuration and system (random fail chance should be very small if everything is ok)
        const failureProbability = this.calculateFailureProbability(
          currentNode,
          timeStep
        );
        if (Math.random() < failureProbability) {
          updatedRequest.status = "failed";
          updatedRequest.failedAt = elapsedSimulationTime;
          updatedRequest.failureReason = "Random node failure";
          this.decreaseNodeUtilization(
            currentNodeId,
            utilization,
            updatedRequest
          );
          return updatedRequest;
        }

        // Normal processing
        updatedRequest.processingData.processingTime += timeStep;
      }
      // 3.4 update request
      updatedRequest.status = "processing";
      return updatedRequest;
    }
    // 4. Done processing at current node, check if destination is reached
    if (updatedRequest.currentNodeId === updatedRequest.destinationNodeId) {
      updatedRequest.status = "completed";
      updatedRequest.completedAt = elapsedSimulationTime;

      // Decrease utilization of the current node since request is now complete
      this.decreaseNodeUtilization(currentNodeId, utilization, updatedRequest);

      return updatedRequest;
    }
    // Random retry
    if (updatedRequest.retryOnError && Math.random() < RETRY_CHANCE) {
      updatedRequest.processingData.retryCount++;
      updatedRequest.status = "processing";

      return updatedRequest;
    }
    // 5. Get next node
    const nextNode = requestRouter.determineNextNode(
      request,
      nodes,
      edges,
      utilization
    );
    if (!nextNode) {
      if (updatedRequest.retryOnError) {
        // Couldn't find next node - increment retry count
        updatedRequest.processingData.retryCount++;
        // Return as still processing but with incremented retry count
        updatedRequest.status = "processing";
        return updatedRequest;
      } else {
        updatedRequest.status = "failed";
        updatedRequest.failedAt = elapsedSimulationTime;
        updatedRequest.failureReason = "Next node not found";
        this.decreaseNodeUtilization(
          currentNodeId,
          utilization,
          updatedRequest
        );

        return updatedRequest;
      }
    }
    updatedRequest.prevNodeId = currentNodeId;
    // 6. Update edge utilization and check for edge failures
    const edge = edges.find(
      (e) =>
        e.source === updatedRequest.currentNodeId && e.target === nextNode.id
    );
    if (!edge) {
      if (updatedRequest.retryOnError) {
        // No edge to next node - increment retry count
        updatedRequest.processingData.retryCount++;
        // Return as still processing but with incremented retry count
        updatedRequest.status = "processing";

        return updatedRequest;
      } else {
        updatedRequest.status = "failed";
        updatedRequest.failedAt = elapsedSimulationTime;
        updatedRequest.failureReason = "Next edge not found";
        this.decreaseNodeUtilization(
          currentNodeId,
          utilization,
          updatedRequest
        );

        return updatedRequest;
      }
    }
    updatedRequest.currentEdgeId = edge.id;
    // Update edge utilization
    let wasEdgeOverloaded = false;
    this.increaseEdgeUtilization(edge, utilization, updatedRequest);
    if (this.isEdgeOverloaded(edge, utilization)) {
      wasEdgeOverloaded = true;
      // Higher chance to fail the request when edge is overloaded - 20% chance to fail
      if (Math.random() < 0.2) {
        updatedRequest.status = "failed";
        updatedRequest.failedAt = elapsedSimulationTime;
        updatedRequest.failureReason = "Network congestion";
        this.decreaseNodeUtilization(
          currentNodeId,
          utilization,
          updatedRequest
        );
        return updatedRequest;
      }
    }
    // Check for edge failure
    const edgeFailureProbability = edge.data?.failureProbability;

    if (edgeFailureProbability) {
      if (Math.random() < edgeFailureProbability) {
        updatedRequest.status = "failed";
        updatedRequest.failedAt = elapsedSimulationTime;
        updatedRequest.failureReason = "Edge Failure Probability";
        this.decreaseNodeUtilization(
          currentNodeId,
          utilization,
          updatedRequest
        );

        return updatedRequest;
      }
    }
    // 7. Request is moving to the next node

    // Decrease utilization at current node since request is leaving
    this.decreaseNodeUtilization(currentNodeId, utilization, updatedRequest);

    // Update request with new node
    updatedRequest.currentNodeId = nextNode.id;
    updatedRequest.path.push(nextNode.id);

    // 8. Reset processing data for the new node
    updatedRequest.processingData.totalProcessingTime =
      (updatedRequest.processingData.totalProcessingTime || 0) +
      updatedRequest.processingData.processingTime;
    updatedRequest.processingData.processingTime = 0;

    // Calculate required processing time for the new node
    updatedRequest.processingData.requiredProcessingTime =
      this.calculateRequiredProcessingTime(nextNode, updatedRequest);

    // Now apply edge overload penalty if applicable (AFTER setting the base required time)
    if (wasEdgeOverloaded) {
      updatedRequest.processingData.requiredProcessingTime += 20; // Add 20ms extra processing time
    }

    updatedRequest.status = "processing";
    updatedRequest.processingData.edgeToDecreaseId = edge.id;
    this.applyRequiredProcessingTimePenalty(updatedRequest, nodes);

    return updatedRequest;
  },
  /**
   * Increase node utilization for the given node and utilization data
   * @param nodeId - Node to increase utilization for
   * @param utilization - Utilization data
   * @param request - Request being processed
   * @returns void
   */
  increaseNodeUtilization(
    node: SystemDesignNode,
    utilization: ComponentUtilization,
    request: SimulationRequest
  ): void {
    const nodeId = node.id;
    const currentUtil = utilization.nodeUtilization[nodeId] || 0;
    // Get the utilization impact of this request
    const impact = this.calculateNodeUtilizationImpact(request, node);

    // store the impact in the request processing data
    request.processingData.nodeUtilization[nodeId] = impact;
    utilization.nodeUtilization[nodeId] = Math.min(1.0, currentUtil + impact);
  },
  /**
   * Decrease node utilization for the given node and utilization data
   * @param nodeId - Node to decrease utilization for
   * @param utilization - Utilization data
   * @param request - Request being processed
   * @returns void
   */
  decreaseNodeUtilization(
    nodeId: string,
    utilization: ComponentUtilization,
    request: SimulationRequest
  ): void {
    const currentUtil = utilization.nodeUtilization[nodeId] || 0;
    const impact = request.processingData.nodeUtilization[nodeId] || 0;
    utilization.nodeUtilization[nodeId] = Math.max(0, currentUtil - impact);
  },
  /**
   * Increase edge utilization for the given edge and utilization data
   * @param edge - Edge to increase utilization for
   * @param requestSizeKB - Size of the request in KB
   * @param utilization - Utilization data
   */
  increaseEdgeUtilization(
    edge: SystemDesignEdge,
    utilization: ComponentUtilization,
    request: SimulationRequest
  ): void {
    const edgeId = edge.id;
    const currentUtil = utilization.edgeUtilization[edgeId] || 0;
    const impact = this.calculateEdgeUtilizationImpact(request, edge);
    // store the impact in the request processing data
    request.processingData.edgeUtilization[edgeId] = impact;

    utilization.edgeUtilization[edgeId] = Math.min(1.0, currentUtil + impact);
  },
  /**
   * Decrease edge utilization for the given edge and utilization data
   * @param edge - Edge to decrease utilization for
   * @param utilization - Utilization data
   * @param requestSizeKB - Size of the request in KB
   * @returns void
   */
  decreaseEdgeUtilization(
    edge: SystemDesignEdge,
    utilization: ComponentUtilization,
    request: SimulationRequest
  ): void {
    const edgeId = edge.id;
    const currentUtil = utilization.edgeUtilization[edgeId] || 0;
    const impact = request.processingData.edgeUtilization[edgeId] || 0;
    utilization.edgeUtilization[edgeId] = Math.max(0, currentUtil - impact);
  },
  /**
   * Determine if the given node is overloaded
   * @param node - The node to check for overload
   * @param utilization - The utilization data
   * @returns True if the node is overloaded, false otherwise
   */
  isNodeOverloaded(
    node: SystemDesignNode,
    utilization: ComponentUtilization
  ): boolean {
    const nodeId = node.id;
    const currentUtil = utilization.nodeUtilization[nodeId] || 0;

    // Define overload thresholds based on node types
    let threshold = 0.8; // Default threshold

    if (isServerNode(node)) {
      const serverData = node.data;
      // Consider auto-scaling servers
      if (serverData.autoScaling) {
        threshold += 0.05; // Auto-scaling servers can handle more load
      }
      // Consider scaling metrics
      if (serverData.scalingMetric === "CPU") {
        threshold += 0.05; // CPU-scaled servers often scale earlier
      } else if (serverData.scalingMetric === "Memory") {
        threshold += 0.1; // Memory usage is often capped lower
      } else if (serverData.scalingMetric === "Requests") {
        threshold -= 0.02; // Request count can go higher before overload
      }
      // Consider server resources
      if (serverData.memory > 0) {
        threshold += Math.max(0.01, serverData.memory / 1000); // More memory means higher threshold
      }
      if (serverData.cpuCores >= 4) {
        threshold += serverData.cpuCores / 100; // More cores means higher threshold
      }
      if (serverData.cpuSpeed >= 2) {
        threshold += serverData.cpuSpeed / 100; // Higher CPU speed means higher threshold
      }
      if (serverData.hasGPU) {
        threshold += 0.02; // GPUs can handle more load
      }
      if (serverData.memory > 0) {
        threshold += Math.min(0.01, serverData.memory / 1000); // More memory means higher threshold
      }
    } else if (isDatabaseNode(node)) {
      const dbData = node.data;
      threshold = 0.85; // Databases might be more sensitive to overload
      if (dbData.autoScaling) {
        threshold += 0.05;
      }
    } else if (isLoadBalancerNode(node)) {
      const lbData = node.data;
      // Different algorithms handle high load differently
      if (lbData.algorithm === "Least Connections") {
        threshold += 0.05; // Better handling of uneven loads
      } else if (lbData.algorithm === "Weighted") {
        threshold += 0.03; // Can direct traffic to stronger nodes
      } else if (
        lbData.algorithm === "IP Hash" ||
        lbData.algorithm === "URL Path"
      ) {
        threshold -= 0.02; // Less adaptable under high load
      }
    } else if (isCacheNode(node)) {
      const cacheData = node.data;
      if (cacheData.maxThroughput / 100000 < Math.random()) {
        threshold -= 0.02;
      }
    }

    return currentUtil > threshold;
  },
  /**
   *
   * @param edge - The edge to check for overload
   * @param utilization - The utilization data
   * @returns
   */
  isEdgeOverloaded(
    edge: SystemDesignEdge,
    utilization: ComponentUtilization
  ): boolean {
    const edgeId = edge.id;
    const currentUtil = utilization.edgeUtilization[edgeId] || 0;
    return currentUtil > 0.9; // Over 90% utilization is considered overloaded
  },
  /**
   *  Calculate the failure probability for a node based on its configuration and time step
   * @param node - The node to calculate failure probability for
   * @param timeStep - The current time step
   * @returns The calculated failure probability
   */
  calculateFailureProbability(
    node: SystemDesignNode,
    timeStep: number
  ): number {
    // Base failure rate from node configuration
    let baseFailureRate = 0.001; // Default very low failure rate
    // Override with node-specific failure rate if available
    if (!isClientNode(node)) {
      if (node.data.failureProbability) {
        baseFailureRate = node.data.failureProbability;
      }
      // If node is a server, consider additional factors
      if (isServerNode(node)) {
        const serverData = node.data;
        // Restart policy
        if (serverData.restartPolicy === "Always") {
          // Reduce the failure rate for Always restart policy
          baseFailureRate *= 0.5; // Reduce failure rate by 50%
        }
        // Deployment type
        if (
          serverData.deploymentType === "VM" ||
          serverData.deploymentType === "Bare Metal"
        ) {
          // Reduce the failure rate for VM deployment
          baseFailureRate *= 0.8; // Reduce failure rate by 20%
        }
        // ScalingMetric can affect failure rates differently
        if (serverData.scalingMetric === "CPU") {
          // CPU-scaled servers might recover better from compute spikes
          baseFailureRate *= 0.9;
        } else if (serverData.scalingMetric === "Memory") {
          // Memory issues might lead to more critical failures
          baseFailureRate *= 1.1;
        }
      } else if (isDatabaseNode(node)) {
        const dbData = node.data;
        if (dbData.backupStrategy === "Continuous") {
          // Continuous backup provides better recovery options
          baseFailureRate *= 0.8;
        } else if (dbData.backupStrategy === "None") {
          // No backups means higher chance of data loss
          baseFailureRate *= 1.2; // 20% more chance of failure
        }
      } else if (isLoadBalancerNode(node)) {
        const lbData = node.data;
        // Different load balancer types have different reliability characteristics
        if (lbData.loadBalancerType === "Network") {
          // Network LBs are typically more reliable for basic forwarding
          baseFailureRate *= 0.8;
        } else if (lbData.loadBalancerType === "Application") {
          // Application LBs do more complex processing and might fail more
          baseFailureRate *= 1.1;
        } else if (lbData.loadBalancerType === "Gateway") {
          // API Gateways do even more processing
          baseFailureRate *= 1.2;
        }
        // LBs with auto-scaling integration are more resilient to overload
        if (lbData.connectToAutoScaling) {
          baseFailureRate *= 0.7; // Reduced failure probability due to auto-scaling capability
        }
        // Healthy check
        if (lbData.healthCheckEnabled) {
          baseFailureRate *= 0.8;
          // More frequent health checks further reduce failures
          if (lbData.healthCheckInterval && lbData.healthCheckInterval < 10) {
            baseFailureRate *= 0.9; // Additional reduction for frequent checks
          }

          // Lower healthy threshold means faster recovery
          if (lbData.healthyThreshold && lbData.healthyThreshold <= 2) {
            baseFailureRate *= 0.9; // Faster recovery reduces impact of failures
          }

          // Higher unhealthy threshold might allow some failures to slip through
          if (lbData.unhealthyThreshold && lbData.unhealthyThreshold > 3) {
            baseFailureRate *= 1.1; // Slight increase in failure rate
          }
        }
        // High availability reduces failure probability
        if (lbData.highAvailability) {
          baseFailureRate *= 0.6; // 40% reduction in failures due to multi-AZ deployment
        }

        // Different failover strategies affect reliability differently
        if (lbData.failoverStrategy === "Active-Active") {
          baseFailureRate *= 0.5; // Most reliable, 50% reduction in failures
        } else if (lbData.failoverStrategy === "N+1") {
          baseFailureRate *= 0.7; // Good reliability, 30% reduction in failures
        } else if (lbData.failoverStrategy === "Active-Passive") {
          baseFailureRate *= 0.8; // Less reliable, 20% reduction in failures
        }
      } else if (isCacheNode(node)) {
        const cacheData = node.data;
        if (cacheData.replicationEnabled) {
          const replicaCount = cacheData.replicaCount || 1;
          baseFailureRate *= 1 / replicaCount;
        }
        // Sharding affects failure patterns
        if (cacheData.shardingEnabled) {
          // Sharding improves overall reliability
          baseFailureRate *= 0.8;
        }
      }
    } else {
      if (node.data.connectionPersistence) {
        baseFailureRate *= 0.8;
        if (node.data.reconnectAttempts) {
          baseFailureRate *= 1 / node.data.reconnectAttempts;
        }
      }
    }
    // Convert to a time-step appropriate value
    // If failureProbability is per second, adjust for time step
    const timeStepInSeconds = timeStep / 1000;
    return baseFailureRate * timeStepInSeconds;
  },
  /**
   *
   * @param node - The node to calculate processing time for
   * @param request - The request to process
   * @returns - The calculated processing time
   */
  calculateRequiredProcessingTime(
    node: SystemDesignNode,
    request: SimulationRequest
  ): number {
    let baseTime = 20; // Default base processing time

    // Each node type has different processing characteristics
    if (isServerNode(node)) {
      const serverData = node.data;
      baseTime = serverData.averageProcessingTime || baseTime;

      // Adjust for request type
      if (request.type === "Compute") {
        baseTime *= 1.5; // Compute requests take longer
      }
    } else if (isDatabaseNode(node)) {
      const dbData = node.data;
      baseTime = dbData.averageLatency || baseTime;

      // Writes typically take longer than reads
      if (request.type === "Write") {
        baseTime *= 1.5;
      } else if (request.type === "Transaction") {
        baseTime *= 2; // Transactions take even longer
      }
    } else if (isCacheNode(node)) {
      const cacheData = node.data;
      baseTime = cacheData.averageLatency || baseTime;

      // Cache misses take longer (simulated by occasional longer times)
      const cacheMiss = Math.random() > cacheData.expectedHitRate;
      if (cacheMiss) {
        baseTime *= 3; // Cache miss
      }
      // For write operations, different policies have different timing implications
      if (request.type === "Write" || request.type === "Transaction") {
        if (cacheData.writePolicy === "Write-Through") {
          // Write-Through: Write to cache and to storage synchronously
          baseTime *= 1.8; // Slowest for writes as we wait for storage
        } else if (cacheData.writePolicy === "Write-Behind") {
          // Write-Behind: Write to cache only, asynchronously update storage
          baseTime *= 0.9; // Fastest for writes, just updates cache
        } else if (cacheData.writePolicy === "Write-Around") {
          // Write-Around: Write directly to storage, bypassing cache
          baseTime *= 1.5; // Medium speed, writing to storage but not cache
        }
      }

      // For read operations after writes, policies affect consistency
      if (request.type === "Read") {
        if (cacheData.writePolicy === "Write-Behind") {
          // With Write-Behind, reads might get stale data
          const staleProbability = 0.05; // 5% chance of getting stale data
          if (Math.random() < staleProbability) {
            // Simulate reading stale data (faster but potentially incorrect)
            baseTime *= 0.8;
          }
        }
      }
      if (!cacheMiss) {
        baseTime = 3;
      }
    } else if (isLoadBalancerNode(node)) {
      // Load balancers typically have minimal processing
      const lbData = node.data;
      baseTime = lbData.processingLatency;
      if (lbData.processingLatency) {
        baseTime = lbData.processingLatency;
      } else {
        if (lbData.loadBalancerType === "Network") {
          // Base processing time varies by load balancer type
          baseTime = 2; // Very fast forwarding
        } else if (lbData.loadBalancerType === "Application") {
          baseTime = 5; // More processing for HTTP routing
        } else if (lbData.loadBalancerType === "Gateway") {
          baseTime = 8; // API Gateways do the most processing
        } else {
          baseTime = 4; // Classic LB default
        }
      }
      // Session persistence adds lookup overhead
      if (lbData.sessionPersistence) {
        baseTime += 2; // Additional time for session table lookup
      }
      if (lbData.contentBasedRouting) {
        baseTime += 8; // Additional processing time for content analysis
      }
    }

    // Add some variability (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    return baseTime * randomFactor;
  },
  /**
   * Calculates how much a single request contributes to a node's utilization level
   *
   * @param request - The request being processed
   * @param node - The current node processing this request
   * @returns A number between 0-1 representing the utilization impact (as a fraction of capacity)
   */

  calculateNodeUtilizationImpact(
    request: SimulationRequest,
    node: SystemDesignNode
  ): number {
    // Base impact depends on the request size relative to typical sizes for the node type
    let impact = 0;

    // Different node types handle load differently
    if (isClientNode(node)) {
      const clientData = node.data;

      // Base impact
      impact = request.sizeKB / 50000;

      // Consider device performance
      if (clientData.devicePerformance === "Low") {
        impact *= 1.5;
      } else if (clientData.devicePerformance === "High") {
        impact *= 0.5;
      }

      // Consider available bandwidth - logarithmic scale for more realistic scaling
      if (clientData.bandwidthLimit > 0) {
        // Log scale prevents excessive impact at low bandwidth
        impact *= (1 / Math.log10(clientData.bandwidthLimit + 1)) * 3;
      }

      // Consider connection type
      if (clientData.connectionType === "Cellular") {
        impact *= 1.4;
      } else if (clientData.connectionType === "WiFi") {
        impact *= 1.1;
      } else if (clientData.connectionType === "Wired") {
        impact *= 0.8;
      }

      // Client type affects capacity
      if (clientData.clientType === "IoT Device") {
        impact *= 1.6;
      } else if (clientData.clientType === "Mobile App") {
        impact *= 1.2;
      } else if (clientData.clientType === "API Client") {
        impact *= 0.7; // API clients often optimized for throughput
      }

      // Network stability factor (more unstable = higher resource usage due to retries/overhead)
      if (clientData.networkStability < 0.7) {
        impact *= 2 - clientData.networkStability;
      }

      // Packet loss increases impact due to retransmissions
      if (clientData.packetLossRate > 0) {
        impact *= 1 + clientData.packetLossRate * 10; // Max *3 impact
      }

      // Authentication method affects overhead
      if (
        clientData.authenticationMethod === "OAuth" ||
        clientData.authenticationMethod === "JWT"
      ) {
        impact *= 1.1;
      } else if (clientData.authenticationMethod === "Client Certificate") {
        impact *= 1.2;
      }

      // Geographic distribution often means optimized regional deployment
      if (clientData.geographicDistribution.length > 3) {
        impact *= 0.9;
      }
      // Consider connection persistence
      if (clientData.connectionPersistence) {
        impact *= 1.1;
        if (clientData.reconnectAttempts) {
          impact *= clientData.reconnectAttempts;
        }
      }
    } else if (isServerNode(node)) {
      impact = request.sizeKB / 50000; // Servers have very low impact
      const serverData = node.data;
      // Calculate server capacity factor based on resources
      let capacityFactor = 1;
      // Consider CPU cores
      capacityFactor = 1 / serverData.cpuCores;
      // Consider max concurrent requests
      const maxConcurrent = serverData.maxConcurrentRequests;
      // Calculate impact based on request size relative to max capacity
      impact = (request.sizeKB / 1000) * capacityFactor * (100 / maxConcurrent);
      // Consider CPU speed
      if (serverData.cpuSpeed > 0) {
        impact /= serverData.cpuSpeed / 2.5;
      }
      // Consider memory size
      if (serverData.memory > 0) {
        impact *= Math.max(0.5, 4 / serverData.memory);
      }
      // Consider max requests per second
      const maxRPS = serverData.maxRequestsPerSecond;
      impact *= 1000 / maxRPS;
      // Consider concurrency model
      if (serverData.concurrencyModel === "Single-Threaded") {
        impact *= 2;
      } else if (serverData.concurrencyModel === "Event-Loop") {
        impact *= 0.8;
      }
      // Consider Server Restart policy
      if (serverData.restartPolicy === "Always") {
        impact *= 1.3;
      } else if (serverData.restartPolicy === "Never") {
        impact *= 0.8;
      }
      // Consider deployment type
      if (serverData.deploymentType === "Container") {
        impact *= 1.1;
      } else if (serverData.deploymentType === "VM") {
        impact *= 1.2;
      } else if (serverData.deploymentType === "Serverless") {
        impact *= 0.9;
      } else if (serverData.deploymentType === "Bare Metal") {
        impact *= 0.8;
      }
      // Consider scaling metric
      if (serverData.scalingMetric === "CPU") {
        // CPU-scaled servers are more sensitive to compute-intensive requests
        if (request.type === "Compute") {
          impact *= 1.3;
        }
      } else if (serverData.scalingMetric === "Memory") {
        // Memory-scaled servers are more sensitive to data-intensive operations
        if (request.sizeKB > 200) {
          impact *= 2;
        }
      } else if (serverData.scalingMetric === "Requests") {
        // Request-scaled servers distribute load more evenly
        impact *= 0.9; // Slightly lower per-request impact
      }
      // Consider server instances
      if (serverData.instances > 1) {
        // Reduce impact proportionally to instance count
        impact *= 1 / serverData.instances;
      }
      // Consider authentication Required
      if (serverData.authenticationRequired) {
        impact *= 1.2;
      }
    } else if (isDatabaseNode(node)) {
      const dbData = node.data;
      // Base impact depends on request size
      impact = request.sizeKB / 10000;
      // Consider database type
      if (dbData.dbType === "NoSQL") {
        impact *= 0.7;
      } else if (dbData.dbType === "Cache") {
        impact *= 0.4;
      }
      // Consider query complexity
      if (dbData.queryComplexity === "Simple") {
        impact *= 1;
      } else if (dbData.queryComplexity === "Moderate") {
        impact *= 3;
      } else if (dbData.queryComplexity === "Complex") {
        if (dbData.dbType === "SQL") {
          impact *= 7;
        } else {
          impact *= 6;
        }
      }
      // Consider database capacity
      const maxConnections = dbData.maxConnections;
      impact *= 100 / maxConnections;
      // Consider read/write operations
      const readWriteRatio = dbData.readWriteRatio || 0.7;
      const isRead = Math.random() < readWriteRatio;
      if (!isRead) {
        impact *= 1.5; // Writes typically have more impact than reads
      }
      // Consider database replication
      if (dbData.replication) {
        impact *= 0.7;
      }
      // Consider storage capacity
      if (dbData.storageCapacity) {
        impact *= Math.max(0.5, 100 / dbData.storageCapacity);
      }
      // Consider average latency
      if (dbData.averageLatency) {
        impact *= dbData.averageLatency / 5;
      }
      // Consider backup strategy
      if (dbData.backupStrategy === "Continuous") {
        impact *= 1.15; // 15% more resource usage
      } else if (dbData.backupStrategy === "Daily") {
        const isRunning = Math.random() < 0.05; // 5% backup is running right now
        if (isRunning) impact *= 1.5;
      }
    } else if (isLoadBalancerNode(node)) {
      const lbData = node.data;
      // Load balancers have relatively low processing impact
      impact = request.sizeKB / 4000;
      // Consider max throughput
      impact *= 1000 / lbData.maxThroughput;
      // Consider load balancing algorithm
      if (lbData.algorithm === "Round Robin") {
        impact *= 1.2;
      } else if (lbData.algorithm === "Least Connections") {
        impact *= 1.1;
      }
      // SSL termination is CPU intensive
      if (lbData.sslTermination) {
        impact *= 2;
      }
      // Content based routing requires more processing
      if (lbData.contentBasedRouting) {
        impact *= 1.5;
      }
      // Consider loadbalancer type
      if (lbData.loadBalancerType === "Network") {
        impact *= 0.7; // Network LBs are very efficient
      } else if (lbData.loadBalancerType === "Application") {
        impact *= 1.2; // Application LBs use more resources
      } else if (lbData.loadBalancerType === "Gateway") {
        impact *= 1.5; // Gateways have highest overhead
      }
      // Session persistence adds overhead for tracking sessions
      if (lbData.sessionPersistence) {
        impact *= 1.15; // 15% more resource usage for maintaining session tables
      }

      // If session timeout is very short, it adds even more overhead
      if (
        lbData.sessionPersistence &&
        lbData.sessionTimeout &&
        lbData.sessionTimeout < 10
      ) {
        impact *= 1.1; // Additional 10% impact for frequent session expiration checks
      }
      const maxConnections = lbData.maxConnections;
      impact *= Math.max(0.5, 100000 / maxConnections);
      // Lower latency likely means more efficient processing
      if (lbData.processingLatency < 5) {
        impact *= 0.9; // High-performance LB has less resource impact per request
      } else if (lbData.processingLatency > 10) {
        impact *= 1.2; // Higher latency often indicates more processing/resource usage
      }
      // Health checking adds overhead
      if (lbData.healthCheckEnabled) {
        impact *= 1.1; // Base increase for health checking

        // More frequent health checks add more overhead
        if (lbData.healthCheckInterval && lbData.healthCheckInterval < 10) {
          impact *= 1.1; // Additional 10% for frequent checks
        }
      }
      // Content-based routing increases resource usage
      if (lbData.contentBasedRouting) {
        impact *= 1.3; // 30% higher resource utilization for content inspection
      }
    } else if (isCacheNode(node)) {
      const cacheData = node.data;
      // Base impact
      impact = request.sizeKB / 2000;
      // Cache hit/miss dramatically impacts impact
      const isCacheHit = Math.random() < cacheData.expectedHitRate;
      if (isCacheHit) {
        impact *= 0.2;
      } else {
        impact *= 2;
      }
      // Consider cache type
      if (cacheData.cacheType === "In-Memory") {
        impact *= 0.5; // In-memory caches are more efficient
      } else if (cacheData.cacheType === "Distributed") {
        impact *= 1.2; // Distributed caches have network overhead
      }
      // Consider cache eviction policy
      if (
        cacheData.evictionPolicy === "LRU" ||
        cacheData.evictionPolicy === "LFU"
      ) {
        impact *= 1.2;
      }
      // Calculate total cache size in MB for consistent comparison
      let cacheSizeInMB = cacheData.cacheSizeValue;
      if (cacheData.cacheSizeUnit === "GB") {
        cacheSizeInMB *= 1024;
      } else if (cacheData.cacheSizeUnit === "TB") {
        cacheSizeInMB *= 1024 * 1024;
      }
      // Adjust impact based on cache size relative to average item size
      const averageItemSizeKB = cacheData.averageItemSize || 10; // Default if not specified
      const estimatedItemsCapacity = (cacheSizeInMB * 1024) / averageItemSizeKB;

      // Larger caches have more overhead per request but better hit rates
      if (estimatedItemsCapacity > 1000000) {
        // Very large cache - more lookup overhead but better hit rates
        impact *= 0.8;
      } else if (estimatedItemsCapacity < 1000) {
        // Very small cache - faster lookups but worse hit rates
        impact *= 1.2;
      }
      // Strong consistency requires more resources for coordination
      if (cacheData.consistencyLevel === "Strong") {
        impact *= 1.3; // 30% more resource usage

        // Particularly for write operations
        if (request.type === "Write" || request.type === "Transaction") {
          impact *= 1.5; // Writes are much more expensive with strong consistency
        }
      }

      // Eventual consistency is more efficient
      if (cacheData.consistencyLevel === "Eventual") {
        impact *= 0.9; // 10% less resource usage
      }
      if (cacheData.averageLatency) {
        impact *= cacheData.averageItemSize / 5;
      }
      // Replication increases resource usage
      if (cacheData.replicationEnabled) {
        const replicaCount = cacheData.replicaCount || 1;
        impact *= 1 + replicaCount * 0.2;
        // Writes cost more with replication
        if (request.type === "Write" || request.type === "Transaction") {
          impact *= 1 + replicaCount * 0.3; // More overhead for writes
        }
      }
      // Sharding distributes load
      if (cacheData.shardingEnabled) {
        const shardCount = cacheData.shardCount || 1;
        impact /= Math.sqrt(shardCount); // Distributes impact, but with diminishing returns

        // But adds coordination overhead
        impact *= 1.1; // 10% overhead for shard coordination
      }

      // Auto-scaling allows for handling spikes
      if (cacheData.autoScalingEnabled) {
        // Less impact per request when auto-scaling is enabled
        impact *= 0.9;
      }
    }
    // console.log("Impact:", impact, "Type:", node.type);
    // Cap impact at a reasonable level
    return Math.min(impact, 0.1); // Single request shouldn't use more than 10% of capacity
  },
  /**
   * Calculate the impact of a request on a specific edge.
   * @param request - The request processed by the system.
   * @param edge - The edge through which the request is processed.
   */
  calculateEdgeUtilizationImpact(
    request: SimulationRequest,
    edge: SystemDesignEdge
  ): number {
    // Base impact using logarithmic scale for better handling of request sizes
    let impact = Math.log10(1 + request.sizeKB); // Normalize to a reasonable 0-1 scale

    // Extract edge data for easier access
    const edgeData = edge.data;
    if (!edgeData) return impact;
    // Scale based on edge capacity
    const maxThroughput = edgeData.maxThroughputRPS || 100;
    impact = impact * (100 / maxThroughput);

    // Factor in bandwidth limitations
    if (edgeData.bandwidthMbps) {
      // Assume average request requires 0.1 Mbps as baseline
      impact *= 0.1 / edgeData.bandwidthMbps;
    }
    if (isHTTPEdge(edge)) {
      const httpData = edgeData as HTTPEdgeData;
      impact = this.calculateHTTPEdgeImpact(impact, httpData);
    } else if (isWebSocketEdge(edge)) {
      const wsData = edgeData as WebSocketEdgeData;
      impact = this.calculateWebsocketEdgeImpact(impact, wsData);
    } else if (isTCPEdge(edge)) {
      const tcpData = edgeData as TCPEdgeData;
      impact = this.calculateTCPEdgeImpact(impact, tcpData, request.sizeKB);
    } else if (isGRPCEdge(edge)) {
      const grpcData = edgeData as GRPCEdgeData;
      impact = this.calculateGRPCEEdgeImpact(impact, grpcData);
    } else if (isUDPEdge(edge)) {
      const udpData = edgeData as UDPEdgeData;
      impact = this.calculateUDPEdgeImpact(impact, udpData);
    } else if (isMessageQueueEdge(edge)) {
      const mqData = edgeData as MessageQueueEdgeData;
      impact = this.calculateMSGEdgeImpact(impact, mqData, request.sizeKB);
    } else if (isDatabaseEdge(edge)) {
      const dbData = edgeData as DatabaseEdgeData;
      impact = this.calculateDatabaseEdgeImpact(impact, dbData);
    } else if (isEventStreamEdge(edge)) {
      const eventData = edgeData as EventStreamEdgeData;
      impact = this.calculateEventStreamEdgeImpact(impact, eventData);
    }
    // Factor in communication pattern
    if (edgeData.communicationPattern === "Sync") {
      impact *= 1.1; // Synchronous communication blocks resources
    } else if (edgeData.communicationPattern === "Stream") {
      impact *= 1.3; // Streaming keeps connections open longer
    }

    // Factor in security overhead
    if (
      edgeData.encryption === "End-to-End" ||
      edgeData.encryption === "mTLS"
    ) {
      impact *= 1.2; // Strong encryption adds overhead
    }

    if (edgeData.authentication && edgeData.authentication !== "None") {
      impact *= 1.1; // Authentication adds overhead
    }

    // Factor in reliability measures
    if (
      edgeData.reliability === "Exactly-Once" ||
      edgeData.reliability === "ACID"
    ) {
      impact *= 1.3; // Strong reliability guarantees add overhead
    }

    // Factor in latency
    if (edgeData.latencyMs && edgeData.latencyMs > 10) {
      // Higher latency means resources are tied up longer
      impact *= 1 + Math.min((edgeData.latencyMs - 10) / 100, 0.5);
    }

    // Compression reduces bandwidth needs
    if (edgeData.compressionEnabled) {
      impact *= 0.6; // Compression significantly reduces bandwidth usage
    }

    // Packet loss rate increases resource usage due to retransmissions
    if (edgeData.packetLossRate) {
      // Higher packet loss means more retransmissions
      impact *= 1 + edgeData.packetLossRate * 5;

      // For streaming or large transfers, impact is even higher
      if (edgeData.communicationPattern === "Stream" || request.sizeKB > 500) {
        impact *= 1 + edgeData.packetLossRate * 3;
      }
    }
    if (edgeData.retryEnabled) {
      impact *= 1.2;
    }

    // Cap impact at a reasonable level
    return Math.min(impact, 0.2); // Single request shouldn't use more than 10% of bandwidth
  },
  /**
   * Calculate the impact of a request on HTTP edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the HTTP edge
   * @returns The adjusted impact value between 0-1
   */
  calculateHTTPEdgeImpact(baseImpact: number, edgeData: HTTPEdgeData): number {
    // HTTP has moderate overhead
    let impact = baseImpact * 1.2;
    // HTTP method affects payload size and processing
    if (edgeData.method === "GET" || edgeData.method === "HEAD") {
      impact *= 0.8; // GET/HEAD requests are typically smaller
    } else if (
      edgeData.method === "POST" ||
      edgeData.method === "PUT" ||
      edgeData.method === "PATCH"
    ) {
      impact *= 1.2; // POST/PUT/PATCH requests are typically larger
    }
    // HTTP version affects processing efficiency
    if (edgeData.httpVersion === "HTTP/2") {
      impact *= 0.8; // HTTP/2 is more efficient
    } else if (edgeData.httpVersion === "HTTP/3") {
      impact *= 0.7; // HTTP/3 is even more efficient
    }
    // TLS adds overhead
    if (edgeData.useTLS) {
      impact *= 1.2;
    }
    return impact;
  },
  /**
   * Calculate the impact of a request on WebSocket edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the WebSocket edge
   * @returns The adjusted impact value between 0-1
   */

  calculateWebsocketEdgeImpact(
    baseImpact: number,
    edgeData: WebSocketEdgeData
  ): number {
    let impact = baseImpact;

    // Message rate affects channel utilization
    if (edgeData.messageRatePerSecond > 10) {
      impact *= 1 + Math.min(edgeData.messageRatePerSecond / 100, 1);
    }

    // Heartbeat adds minimal but consistent overhead
    if (edgeData.heartbeatEnabled) {
      // Shorter intervals mean more overhead
      if (
        edgeData.heartbeatIntervalMs &&
        edgeData.heartbeatIntervalMs < 15000
      ) {
        impact *= 1.1; // More frequent heartbeats
      } else {
        impact *= 1.05; // Standard heartbeat overhead
      }
    }

    // Average message size affects payload efficiency
    if (edgeData.averageMessageSizeKB) {
      if (edgeData.averageMessageSizeKB < 1) {
        impact *= 1.15; // Very small messages have higher header-to-payload ratio
      } else if (edgeData.averageMessageSizeKB > 100) {
        impact *= 1.2; // Very large messages may strain the connection
      }
    }

    // Auto-reconnect logic adds resilience but also some overhead
    if (edgeData.autoReconnect) {
      impact *= 1.05;
    }

    // Subprotocols may add some processing overhead
    if (edgeData.subprotocol && edgeData.subprotocol.length > 0) {
      impact *= 1.1;
    }

    return impact;
  },
  /**
   * Calculate the impact of a request on gRPC edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the gRPC edge
   * @returns The adjusted impact value between 0-1
   */

  calculateGRPCEEdgeImpact(baseImpact: number, edgeData: GRPCEdgeData): number {
    // gRPC is efficient but has protocol overhead
    let impact = baseImpact * 1.1;

    // Streaming increases connection utilization
    if (edgeData.streaming === "Server" || edgeData.streaming === "Client") {
      impact *= 1.2;
    } else if (edgeData.streaming === "Bidirectional") {
      impact *= 1.5;
    }

    // Channel pooling improves efficiency
    if (edgeData.channelPooling) {
      impact *= 0.9;
    }

    // Keep-alive adds some overhead but improves reliability
    if (edgeData.keepAliveEnabled) {
      impact *= 1.05;
    }

    // Load balancing policy affects distribution
    if (edgeData.loadBalancingPolicy === "Round-Robin") {
      impact *= 0.95; // Better load distribution
    } else if (edgeData.loadBalancingPolicy === "Custom") {
      impact *= 1.1; // Custom policies might have overhead
    }

    return impact;
  },
  /**
   * Calculate the impact of a request on TCP edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the TCP edge
   * @param sizeKB - The size of the request in kilobytes
   * @returns The adjusted impact value between 0-1
   */

  calculateTCPEdgeImpact(
    baseImpact: number,
    edgeData: TCPEdgeData,
    sizeKB: number
  ): number {
    let impact = baseImpact;

    // TCP has reliability overhead but is more efficient than raw packets

    // Nagle's algorithm improves efficiency for small packets
    if (edgeData.nagleAlgorithmEnabled && sizeKB < 5) {
      impact *= 0.8;
    }

    // Connection pooling reduces connection establishment overhead
    if (edgeData.connectionPoolEnabled) {
      impact *= 0.9;

      // Large connection pools provide better throughput
      if (
        edgeData.maxConcurrentConnections &&
        edgeData.maxConcurrentConnections > 10
      ) {
        impact *= 0.9; // Additional reduction for large pools
      }
    }

    // Keep-alive connections reduce reconnection overhead
    if (edgeData.keepAliveEnabled) {
      impact *= 0.85;
    }

    // Socket buffer size affects performance
    if (edgeData.socketBufferSizeKB) {
      if (edgeData.socketBufferSizeKB < 32) {
        impact *= 1.2; // Small buffers cause more context switching
      } else if (edgeData.socketBufferSizeKB > 128) {
        impact *= 0.9; // Large buffers improve throughput for big transfers
      }
    }

    return impact;
  },

  /**
   * Calculate the impact of a request on UDP edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the UDP edge
   * @returns The adjusted impact value between 0-1
   */

  calculateUDPEdgeImpact(baseImpact: number, edgeData: UDPEdgeData): number {
    // UDP is lightweight but unreliable
    let impact = baseImpact * 0.8;

    // Checksums add minimal overhead
    if (edgeData.checksumValidation) {
      impact *= 1.05;
    }

    // Multicast/broadcast has different network impact
    if (edgeData.multicast) {
      impact *= 1.3; // Higher impact due to network distribution
    } else if (edgeData.broadcast) {
      impact *= 1.5; // Highest impact as packets go to all devices
    }

    // Packet size affects efficiency
    if (edgeData.packetSizeBytes) {
      if (edgeData.packetSizeBytes < 512) {
        impact *= 1.1; // Small packets have more header overhead relative to payload
      } else if (edgeData.packetSizeBytes > 8192) {
        impact *= 1.2; // Very large packets have fragmentation risk
      }
    }

    return impact;
  },
  /**
   * Calculate the impact of a request on Message queue edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the MSG edges
   * @param sizeKB - The size of the request in kilobytes
   * @returns The adjusted impact value between 0-1
   */

  calculateMSGEdgeImpact(
    baseImpact: number,
    edgeData: MessageQueueEdgeData,
    sizeKB: number
  ): number {
    let impact = baseImpact;

    // Message size efficiency varies by protocol
    if (sizeKB < 10) {
      impact *= 0.6; // Very efficient for small messages
    } else if (sizeKB > 100) {
      impact *= 1.5; // Less efficient for large messages
    }

    // Delivery guarantees affect overhead
    if (edgeData.deliveryGuarantee === "Exactly-Once") {
      impact *= 1.5; // Highest overhead
    } else if (edgeData.deliveryGuarantee === "At-Least-Once") {
      impact *= 1.2; // Moderate overhead
    }

    // Persistent queues have higher storage overhead
    if (edgeData.persistent) {
      impact *= 1.2;
    }

    // Partitioning improves throughput
    if (edgeData.partitioning && edgeData.partitionKey) {
      impact *= 0.8; // Better throughput with partitioning
    }

    // Message ordering guarantees add overhead
    if (edgeData.orderingGuaranteed) {
      impact *= 1.25; // Significant coordination required
    }

    // Dead letter queue adds reliability but some overhead
    if (edgeData.deadLetterQueueEnabled) {
      impact *= 1.1;
    }

    // Message priority requires additional processing
    if (
      edgeData.messagePriority === "Critical" ||
      edgeData.messagePriority === "High"
    ) {
      impact *= 1.15; // Higher priorities need more processing
    }

    return impact;
  },
  /**
   * Calculate the impact of a request on Database edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the Database edge
   * @returns The adjusted impact value between 0-1
   */

  calculateDatabaseEdgeImpact(
    baseImpact: number,
    edgeData: DatabaseEdgeData
  ): number {
    let impact = baseImpact;

    // Read operations are typically lighter than writes
    if (edgeData.connectionType === "Read") {
      impact *= 0.8;
    } else if (edgeData.connectionType === "Write") {
      impact *= 1.3;
    } else if (edgeData.connectionType === "Admin") {
      impact *= 1.1;
    }

    // Transaction isolation affects overhead
    if (edgeData.isolationLevel === "Serializable") {
      impact *= 1.4; // Highest isolation has highest overhead
    } else if (edgeData.isolationLevel === "Repeatable Read") {
      impact *= 1.2;
    }

    // Connection pooling reduces overhead for frequent connections
    if (edgeData.connectionPooling) {
      // More connections in the pool can handle more load
      if (edgeData.maxConnections && edgeData.maxConnections > 10) {
        impact *= 0.85; // Significant reduction for large pools
      } else {
        impact *= 0.95; // Small reduction for basic pooling
      }
    }

    // Prepared statements improve performance
    if (edgeData.preparedStatements) {
      impact *= 0.9;
    }

    // Transactional operations have more overhead
    if (edgeData.transactional) {
      impact *= 1.15;
    }

    // Long query timeouts may indicate complex operations
    if (edgeData.queryTimeout && edgeData.queryTimeout > 60000) {
      // More than 1 minute
      impact *= 1.2; // Likely complex queries
    }

    return impact;
  },
  /**
   * Calculate the impact of a request on Event stream edge
   *
   * @param baseImpact - The initial impact value based on request size
   * @param edgeData - The data for the EventStream edge
   * @returns The adjusted impact value between 0-1
   */

  calculateEventStreamEdgeImpact(
    baseImpact: number,
    edgeData: EventStreamEdgeData
  ): number {
    // Ordered streams require more coordination
    if (edgeData.ordered) {
      baseImpact *= 1.3;
    }

    // Sharding improves throughput
    if (edgeData.sharding && edgeData.shardCount && edgeData.shardCount > 1) {
      // More shards means better throughput, up to a point
      const shardFactor = Math.min(edgeData.shardCount / 3, 2);
      baseImpact *= 1 - 0.2 * shardFactor; // Up to 40% reduction for many shards
    }

    // Retention period affects storage requirements
    if (edgeData.retentionPeriodHours) {
      if (edgeData.retentionPeriodHours > 72) {
        // More than 3 days
        baseImpact *= 1.2; // Significant storage overhead
      } else if (edgeData.retentionPeriodHours < 24) {
        // Less than 1 day
        baseImpact *= 0.9; // Lower storage requirements
      }
    }

    // Batching can improve efficiency
    if (edgeData.maxBatchSize && edgeData.maxBatchSize > 50) {
      baseImpact *= 0.9; // Better efficiency with larger batches
    }

    return baseImpact;
  },
  applyRequiredProcessingTimePenalty(
    request: SimulationRequest,
    nodes: SystemDesignNode[]
  ) {
    const prevNodeId = request.prevNodeId;
    const currNodeId = request.currentNodeId;
    if (prevNodeId && currNodeId) {
      const prevNode = nodes.find((node) => node.id === prevNodeId);
      const currNode = nodes.find((node) => node.id === currNodeId);
      if (prevNode && currNode) {
        if (isClientNode(prevNode) && isDatabaseNode(currNode)) {
          request.processingData.requiredProcessingTime *= 5;
        }
      }
    }
  },
};
