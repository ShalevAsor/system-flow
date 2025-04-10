import { Protocol } from "../../../types/flow/common";
import { SystemDesignEdge } from "../../../types/flow/edgeTypes";
import {
  isCacheNode,
  isDatabaseNode,
  isLoadBalancerNode,
  isServerNode,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import {
  ComponentUtilization,
  SimulationRequest,
  SimulationRequestType,
} from "../../../types/flow/simulationTypes";
import { buildSystemGraph, findAllPaths } from "../../../utils/graphUtils";

export const requestRouter = {
  /**
   *
   * @param request The request to route
   * @param nodes The nodes in the system
   * @param edges The edges in the system
   * @returns The next node the request should go to
   */
  determineNextNode(
    request: SimulationRequest,
    nodes: SystemDesignNode[],
    edges: SystemDesignEdge[],
    componentUtilization: ComponentUtilization
  ): SystemDesignNode | null {
    // 1. Extract the source and target nodes from the request
    const currentNodeId = request.currentNodeId;
    const destinationNodeId = request.destinationNodeId;

    if (currentNodeId === destinationNodeId) {
      return null; // Already at destination
    }
    // 2. Find all viable paths from current node to destination
    const graph = buildSystemGraph(nodes, edges);
    const allPaths = findAllPaths(graph, currentNodeId, destinationNodeId);
    if (allPaths.length === 0) {
      console.warn(
        "No paths found from",
        currentNodeId,
        "to",
        destinationNodeId
      );
      return null;
    }
    // 3. Score each path based on architecture and request type
    const scoredPaths = allPaths.map((path) => {
      return {
        path,
        score: this.evaluatePathQuality(
          path,
          nodes,
          request,
          componentUtilization
        ),
      };
    });
    // Sort paths by score in descending order
    scoredPaths.sort((a, b) => b.score - a.score);
    // 4. Extract the next node from the best path
    const bestPath = scoredPaths[0].path;
    const nextNodeId = bestPath[1]; // Index 0 is current node, index 1 is next node
    const nextNode = nodes.find((node) => node.id === nextNodeId);
    if (!nextNode) {
      console.warn("Next node not found for path:", bestPath);
      return null;
    }
    return nextNode;
  },
  /**
   * Evaluate the quality of a path for the given request
   *
   * @param path - Array of node IDs representing the path
   * @param nodes - All nodes in the system
   * @param request - The request being routed
   * @param componentUtilization - The current utilization of components
   * @returns Score representing path quality (higher is better)
   */
  evaluatePathQuality(
    path: string[],
    nodes: SystemDesignNode[],
    request: SimulationRequest,
    componentUtilization: ComponentUtilization
  ): number {
    // Convert path of IDs to path of node objects
    const nodePath = path
      .map((id) => nodes.find((node) => node.id === id))
      .filter(Boolean) as SystemDesignNode[];

    let score = 100; // Start with base score

    // 1. Check for proper architectural layering
    score += this.evaluateArchitecturalLayering(nodePath, request.type);

    // 2. Check for specialized nodes based on request type
    score += this.evaluateSpecializedNodes(nodePath, request.type);

    // 3. Check for proper load balancing
    score += this.evaluateLoadBalancing(nodePath);

    // 4. Check for node utilization along the path
    score += this.evaluatePathUtilization(nodePath, componentUtilization);

    // 5. Protocol compatibility throughout the path
    if (request.preferredProtocol) {
      if (!this.isPathProtocolCompatible(nodePath, request.preferredProtocol)) {
        score -= 50; // Major penalty for protocol incompatibility
      }
    }

    return Math.max(0, score); // Ensure score is non-negative
  },

  /**
   * Evaluate how well the path follows proper architectural layering principles
   * @param nodePath - Array of node objects representing the path
   * @param requestType - Type of request
   * @returns Score representing architectural layering quality (higher is better)
   */
  evaluateArchitecturalLayering(
    nodePath: SystemDesignNode[],
    requestType: SimulationRequestType
  ): number {
    let score = 0;

    // Skip first node (current location)
    const pathToEvaluate = nodePath.slice(1);

    // Check for proper progression:
    // For reads: Client -> (LB) -> Server -> (Cache) -> Database
    // For writes: Client -> (LB) -> Server -> Database

    // Detect if we have a load balancer early in the path
    const hasLoadBalancer = pathToEvaluate.some(
      (node, index) => index < 2 && isLoadBalancerNode(node)
    );

    if (hasLoadBalancer) {
      score += 15; // Good to go through load balancers
    }

    // Check for proper progression to database
    if (requestType === "Read" || requestType === "Write") {
      // Find server and database positions
      const serverIndex = pathToEvaluate.findIndex((node) =>
        isServerNode(node)
      );
      const databaseIndex = pathToEvaluate.findIndex((node) =>
        isDatabaseNode(node)
      );

      // For database operations, server should come before database
      if (
        serverIndex !== -1 &&
        databaseIndex !== -1 &&
        serverIndex < databaseIndex
      ) {
        score += 20; // Good layering
      }

      // For reads, check if we have a cache before database
      if (requestType === "Read") {
        const cacheIndex = pathToEvaluate.findIndex((node) =>
          isCacheNode(node)
        );
        if (
          cacheIndex !== -1 &&
          (databaseIndex === -1 || cacheIndex < databaseIndex)
        ) {
          score += 15; // Good to check cache before database for reads
        }
      }
    }
    // For compute requests, we should primarily go through servers
    if (requestType === "Compute") {
      const serverCount = pathToEvaluate.filter((node) =>
        isServerNode(node)
      ).length;
      if (serverCount > 0) {
        score += 17.5 * serverCount; // Good to route compute through servers
      }
    }
    return score;
  },
  /**
   * Evaluate if the path contains specialized nodes for the request type
   */
  evaluateSpecializedNodes(
    nodePath: SystemDesignNode[],
    requestType: SimulationRequestType
  ): number {
    let score = 0;

    switch (requestType) {
      case "Read": {
        // For reads, value paths with caches
        if (nodePath.some((node) => isCacheNode(node))) {
          score += 20;
        }
        break;
      }

      case "Write":
      case "Transaction": {
        // For writes and transactions, value paths with databases
        if (nodePath.some((node) => isDatabaseNode(node))) {
          score += 20;
        }
        break;
      }

      case "Compute": {
        // For compute, value paths with high-power servers
        const powerfulServers = nodePath.filter((node) => {
          if (!isServerNode(node)) return false;
          const serverData = node.data;
          return serverData.cpuCores >= 4; // Consider servers with 4+ cores as powerful
        });

        if (powerfulServers.length > 0) {
          score += 15 + powerfulServers.length * 5;
        }
        break;
      }
    }

    return score;
  },
  /**
   * Evaluate the load balancing characteristics of the path
   */
  evaluateLoadBalancing(nodePath: SystemDesignNode[]): number {
    let score = 0;

    // Check if path goes through a load balancer
    const loadBalancers = nodePath.filter((node) => isLoadBalancerNode(node));

    if (loadBalancers.length > 0) {
      score += 10;

      // Check if load balancers are positioned properly - should be early in path
      const firstLBIndex = nodePath.findIndex((node) =>
        isLoadBalancerNode(node)
      );
      if (firstLBIndex > 0 && firstLBIndex <= 2) {
        // Within the first 3 nodes
        score += 5;
      }

      // Penalize too many load balancers
      if (loadBalancers.length > 2) {
        score -= (loadBalancers.length - 2) * 5;
      }
    }

    return score;
  },
  /**
   * Evaluate the overall utilization of nodes in the path
   *
   * @param nodePath - Array of nodes in the path
   * @param componentUtilization - Current utilization data from the simulation
   * @returns Score representing path quality based on utilization
   */
  evaluatePathUtilization(
    nodePath: SystemDesignNode[],
    componentUtilization: ComponentUtilization
  ): number {
    let score = 0;
    let totalUtilization = 0;
    let countedNodes = 0;

    // Calculate average utilization of all nodes in path
    for (const node of nodePath) {
      // Skip the first node (current location)
      if (node.id === nodePath[0].id) {
        continue;
      }

      // Get utilization from the provided component utilization record
      const utilization = componentUtilization.nodeUtilization[node.id] || 0;
      totalUtilization += utilization;
      countedNodes++;
    }

    // Calculate average (skip if no nodes after current)
    if (countedNodes === 0) {
      return 0;
    }

    const avgUtilization = totalUtilization / countedNodes;

    // Prefer paths with lower utilization
    score += 20 * (1 - avgUtilization);

    return score;
  },
  /**
   * Check if all nodes in the path support the required protocol
   */
  isPathProtocolCompatible(
    nodePath: SystemDesignNode[],
    protocol: Protocol
  ): boolean {
    // Check each node for protocol compatibility
    for (const node of nodePath) {
      if (isServerNode(node)) {
        const serverData = node.data;
        if (!serverData.supportedProtocols.includes(protocol)) {
          return false;
        }
      }
    }
    return true;
  },
};
