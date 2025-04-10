import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestRouter } from "./requestRouter";
import { createNode } from "../../../utils/flow/nodeUtils";
import {
  NodeType,
  ServerNode,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import { Protocol } from "../../../types/flow/common";
import {
  ComponentUtilization,
  SimulationRequest,
  SimulationRequestType,
} from "../../../types/flow/simulationTypes";
import { createRequest } from "../../../utils/testUtils";
import { buildSystemGraph, findAllPaths } from "../../../utils/graphUtils";
import { SystemDesignEdge } from "../../../types/flow/edgeTypes";

// Mock the graphUtils functions
vi.mock("../../../utils/graphUtils", () => ({
  buildSystemGraph: vi.fn(),
  findAllPaths: vi.fn(),
}));

describe("Request Router", () => {
  describe("isPathProtocolCompatible", () => {
    const position = { x: 0, y: 0 };
    const label = "Test Node";
    it("should return true if all server nodes support the protocol", () => {
      // Arrange - by default each server node support HTTP,HTTPS
      const nodePath: SystemDesignNode[] = [
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
      ];
      const protocol: Protocol = "HTTP";

      // Act
      const result = requestRouter.isPathProtocolCompatible(nodePath, protocol);
      // Assert
      expect(result).toBe(true);
    });

    it("should return false if any server node does not support the protocol", () => {
      // Arrange
      const notSupportingNode: ServerNode = createNode(
        NodeType.Server,
        label,
        position
      ) as ServerNode;
      notSupportingNode.data.supportedProtocols = [];
      const nodePath: SystemDesignNode[] = [
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
        notSupportingNode,
        createNode(NodeType.Server, label, position),
      ];
      const protocol: Protocol = "HTTP";

      // Act
      const result = requestRouter.isPathProtocolCompatible(nodePath, protocol);
      // Assert
      expect(result).toBe(false);
    });
  });

  describe("evaluatePathUtilization", () => {
    const label = "test node";
    const position = { x: 0, y: 0 };
    it("Should prefer path with lower utilization", () => {
      // Arrange two paths - lower utilization and higher utilization
      const a1 = createNode(NodeType.Client, label, position);
      const a2 = createNode(NodeType.Server, label, position);
      const a3 = createNode(NodeType.Database, label, position);
      const util1: ComponentUtilization = {
        nodeUtilization: {
          [a1.id]: 0.5, // Using computed property name syntax
          [a2.id]: 0.4,
          [a3.id]: 0.3,
        },
        edgeUtilization: {}, // Empty object if you don't need edge utilization
      };
      const lowerUtilPath = [a1, a2, a3];
      const b1 = createNode(NodeType.Client, label, position);
      const b2 = createNode(NodeType.Server, label, position);
      const b3 = createNode(NodeType.Database, label, position);
      const util2: ComponentUtilization = {
        nodeUtilization: {
          [b1.id]: 0.9, // Using computed property name syntax
          [b2.id]: 0.8,
          [b3.id]: 0.7,
        },
        edgeUtilization: {}, // Empty object if you don't need edge utilization
      };
      const highUtilPath = [b1, b2, b3];
      // Act
      const r1 = requestRouter.evaluatePathUtilization(lowerUtilPath, util1);
      const r2 = requestRouter.evaluatePathUtilization(highUtilPath, util2);
      // Assert
      expect(r2).toBeLessThan(r1);
    });
  });
  describe("evaluateLoadBalancing", () => {
    const label = "test node";
    const position = { x: 0, y: 0 };
    it("should prefer path with load balancer", () => {
      // Arrange two paths - with loadbalancer and without
      const a1 = createNode(NodeType.Client, label, position);
      const a2 = createNode(NodeType.LoadBalancer, label, position);
      const a3 = createNode(NodeType.Server, label, position);
      const p1 = [a1, a2, a3];
      const b1 = createNode(NodeType.Client, label, position);
      const b2 = createNode(NodeType.Server, label, position);
      const b3 = createNode(NodeType.Database, label, position);
      const p2 = [b1, b2, b3];
      // Act - should prefer p1 over p2
      const r1 = requestRouter.evaluateLoadBalancing(p1);
      const r2 = requestRouter.evaluateLoadBalancing(p2);
      // Assert
      expect(r2).toBeLessThan(r1);
    });
  });
  describe("evaluateSpecializedNodes", () => {
    const label = "test node";
    const position = { x: 0, y: 0 };
    it("should prefer path with Cache for read request", () => {
      // Arrange two paths - with Cache and without
      const a1 = createNode(NodeType.Client, label, position);
      const a2 = createNode(NodeType.Server, label, position);
      const a3 = createNode(NodeType.Cache, label, position);
      const p1 = [a1, a2, a3];
      const b1 = createNode(NodeType.Client, label, position);
      const b2 = createNode(NodeType.Server, label, position);
      const b3 = createNode(NodeType.Database, label, position);
      const p2 = [b1, b2, b3];
      const requestType: SimulationRequestType = "Read";
      // Act
      const r1 = requestRouter.evaluateSpecializedNodes(p1, requestType);
      const r2 = requestRouter.evaluateSpecializedNodes(p2, requestType);
      // Assert
      expect(r2).toBeLessThan(r1);
    });
    it("should prefer path with Database for write request", () => {
      // Arrange two paths - with DB and without
      const a1 = createNode(NodeType.Client, label, position);
      const a2 = createNode(NodeType.Server, label, position);
      const a3 = createNode(NodeType.Database, label, position);
      const p1 = [a1, a2, a3];
      const b1 = createNode(NodeType.Client, label, position);
      const b2 = createNode(NodeType.Server, label, position);
      const b3 = createNode(NodeType.Cache, label, position);
      const p2 = [b1, b2, b3];
      const requestType: SimulationRequestType = "Write";
      // Act
      const r1 = requestRouter.evaluateSpecializedNodes(p1, requestType);
      const r2 = requestRouter.evaluateSpecializedNodes(p2, requestType);
      // Assert
      expect(r2).toBeLessThan(r1);
    });
    it("should prefer path with Faster Server for compute request", () => {
      // Arrange two paths - with DB and without
      const a1 = createNode(NodeType.Client, label, position);
      const a2 = createNode(NodeType.Server, label, position) as ServerNode;
      a2.data.cpuCores = 8;
      const a3 = createNode(NodeType.Database, label, position);
      const p1 = [a1, a2, a3];
      const b1 = createNode(NodeType.Client, label, position);
      const b2 = createNode(NodeType.Server, label, position) as ServerNode;
      b2.data.cpuCores = 2;
      const b3 = createNode(NodeType.Database, label, position);
      const p2 = [b1, b2, b3];
      const requestType: SimulationRequestType = "Compute";
      // Act
      const r1 = requestRouter.evaluateSpecializedNodes(p1, requestType);
      const r2 = requestRouter.evaluateSpecializedNodes(p2, requestType);
      // Assert
      expect(r2).toBeLessThan(r1);
    });
  });
  describe("evaluateArchitecturalLayering", () => {
    const label = "test node";
    const position = { x: 0, y: 0 };

    it("should add points if path has load balancer early in the path", () => {
      // Arrange
      const withLoadBalancer = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.LoadBalancer, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const withoutLoadBalancer = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const requestType: SimulationRequestType = "Read";

      // Act
      const withLBScore = requestRouter.evaluateArchitecturalLayering(
        withLoadBalancer,
        requestType
      );
      const withoutLBScore = requestRouter.evaluateArchitecturalLayering(
        withoutLoadBalancer,
        requestType
      );

      // Assert
      expect(withLBScore).toBeGreaterThan(withoutLBScore);
    });

    it("should reward proper server -> database progression for read/write operations", () => {
      // Arrange
      const properOrder = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const improperOrder = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Database, label, position),
        createNode(NodeType.Server, label, position),
      ];

      const requestType: SimulationRequestType = "Write";

      // Act
      const properScore = requestRouter.evaluateArchitecturalLayering(
        properOrder,
        requestType
      );
      const improperScore = requestRouter.evaluateArchitecturalLayering(
        improperOrder,
        requestType
      );

      // Assert
      expect(properScore).toBeGreaterThan(improperScore);
    });

    it("should prefer cache before database for read requests", () => {
      // Arrange
      const withCacheFirst = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Cache, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const withDatabaseFirst = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Database, label, position),
        createNode(NodeType.Cache, label, position),
      ];

      const requestType: SimulationRequestType = "Read";

      // Act
      const cacheFirstScore = requestRouter.evaluateArchitecturalLayering(
        withCacheFirst,
        requestType
      );
      const databaseFirstScore = requestRouter.evaluateArchitecturalLayering(
        withDatabaseFirst,
        requestType
      );

      // Assert
      expect(cacheFirstScore).toBeGreaterThan(databaseFirstScore);
    });

    it("should value cache for read requests but not for write requests", () => {
      // Arrange
      const pathWithCache = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Cache, label, position),
        createNode(NodeType.Database, label, position),
      ];

      // Act
      const readScore = requestRouter.evaluateArchitecturalLayering(
        pathWithCache,
        "Read"
      );
      const writeScore = requestRouter.evaluateArchitecturalLayering(
        pathWithCache,
        "Write"
      );

      // Assert
      expect(readScore).toBeGreaterThan(writeScore);
    });

    it("should value servers for compute requests", () => {
      // Arrange
      const manyServers = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Server, label, position),
      ];

      const noServers = [
        createNode(NodeType.Client, label, position),
        createNode(NodeType.LoadBalancer, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const requestType: SimulationRequestType = "Compute";

      // Act
      const manyServersScore = requestRouter.evaluateArchitecturalLayering(
        manyServers,
        requestType
      );
      const noServersScore = requestRouter.evaluateArchitecturalLayering(
        noServers,
        requestType
      );

      // Assert
      expect(manyServersScore).toBeGreaterThan(noServersScore);
    });

    it("should skip the first node when evaluating the path", () => {
      // Arrange
      const pathWithServerFirst = [
        createNode(NodeType.Server, label, position),
        createNode(NodeType.Database, label, position),
      ];

      const pathWithDatabaseFirst = [
        createNode(NodeType.Database, label, position),
        createNode(NodeType.Server, label, position),
      ];

      const requestType: SimulationRequestType = "Write";

      // Act
      const serverFirstScore = requestRouter.evaluateArchitecturalLayering(
        pathWithServerFirst,
        requestType
      );
      const databaseFirstScore = requestRouter.evaluateArchitecturalLayering(
        pathWithDatabaseFirst,
        requestType
      );

      // Assert
      // Since first node is skipped, these should be equivalent (both have only one node after skipping)
      expect(serverFirstScore).toEqual(databaseFirstScore);
    });
  });
  describe("evaluatePathQuality", () => {
    const label = "test node";
    const position = { x: 0, y: 0 };

    // Mock the individual evaluation functions to isolate testing
    beforeEach(() => {
      vi.spyOn(requestRouter, "evaluateArchitecturalLayering").mockReturnValue(
        10
      );
      vi.spyOn(requestRouter, "evaluateSpecializedNodes").mockReturnValue(20);
      vi.spyOn(requestRouter, "evaluateLoadBalancing").mockReturnValue(15);
      vi.spyOn(requestRouter, "evaluatePathUtilization").mockReturnValue(5);
      vi.spyOn(requestRouter, "isPathProtocolCompatible").mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should combine scores from all evaluation functions with base score", () => {
      // Arrange
      const node1 = createNode(NodeType.Client, label, position);
      const node2 = createNode(NodeType.Server, label, position);
      const node3 = createNode(NodeType.Database, label, position);

      const nodes = [node1, node2, node3];
      const path = [node1.id, node2.id, node3.id];
      const request = createRequest("req1", "Read", node1.id, node3.id);

      const componentUtilization: ComponentUtilization = {
        nodeUtilization: {
          [node1.id]: 0.2,
          [node2.id]: 0.5,
          [node3.id]: 0.3,
        },
        edgeUtilization: {},
      };

      // Act
      const result = requestRouter.evaluatePathQuality(
        path,
        nodes,
        request,
        componentUtilization
      );

      // Assert
      // Base score (100) + architectural (10) + specialized (20) + load balancing (15) + utilization (5) = 150
      expect(result).toBe(150);
      expect(requestRouter.evaluateArchitecturalLayering).toHaveBeenCalled();
      expect(requestRouter.evaluateSpecializedNodes).toHaveBeenCalled();
      expect(requestRouter.evaluateLoadBalancing).toHaveBeenCalled();
      expect(requestRouter.evaluatePathUtilization).toHaveBeenCalled();
    });

    it("should apply penalty for protocol incompatibility", () => {
      // Arrange
      const node1 = createNode(NodeType.Client, label, position);
      const node2 = createNode(NodeType.Server, label, position);
      const node3 = createNode(NodeType.Database, label, position);

      const nodes = [node1, node2, node3];
      const path = [node1.id, node2.id, node3.id];

      const request = createRequest("req1", "Read", node1.id, node3.id);
      request.preferredProtocol = "HTTP";

      const componentUtilization: ComponentUtilization = {
        nodeUtilization: {
          [node1.id]: 0.2,
          [node2.id]: 0.5,
          [node3.id]: 0.3,
        },
        edgeUtilization: {},
      };

      // Mock isPathProtocolCompatible to return false
      vi.spyOn(requestRouter, "isPathProtocolCompatible").mockReturnValue(
        false
      );

      // Act
      const result = requestRouter.evaluatePathQuality(
        path,
        nodes,
        request,
        componentUtilization
      );

      // Assert
      // Base score (100) + architectural (10) + specialized (20) + load balancing (15) + utilization (5) - penalty (50) = 100
      expect(result).toBe(100);
      expect(requestRouter.isPathProtocolCompatible).toHaveBeenCalledWith(
        expect.any(Array),
        "HTTP"
      );
    });

    it("should handle empty path of IDs", () => {
      // Arrange
      const nodes: SystemDesignNode[] = [];
      const path: string[] = [];

      const request = createRequest("req1", "Read", "", "");

      const componentUtilization: ComponentUtilization = {
        nodeUtilization: {},
        edgeUtilization: {},
      };

      // Act
      const result = requestRouter.evaluatePathQuality(
        path,
        nodes,
        request,
        componentUtilization
      );

      // Assert
      // Should still return base score since path conversion will result in empty nodePath
      expect(result).toBe(150);
    });

    it("should ensure score is non-negative", () => {
      // Arrange
      const node1 = createNode(NodeType.Client, label, position);
      const node2 = createNode(NodeType.Server, label, position);

      const nodes = [node1, node2];
      const path = [node1.id, node2.id];

      const request = createRequest("req1", "Read", node1.id, node2.id);
      const componentUtilization: ComponentUtilization = {
        nodeUtilization: {
          [node1.id]: 0.2,
          [node2.id]: 0.5,
        },
        edgeUtilization: {},
      };

      // Mock to return large negative values that would result in negative total
      vi.spyOn(requestRouter, "evaluateArchitecturalLayering").mockReturnValue(
        -50
      );
      vi.spyOn(requestRouter, "evaluateSpecializedNodes").mockReturnValue(-30);
      vi.spyOn(requestRouter, "evaluateLoadBalancing").mockReturnValue(-40);
      vi.spyOn(requestRouter, "evaluatePathUtilization").mockReturnValue(-60);
      vi.spyOn(requestRouter, "isPathProtocolCompatible").mockReturnValue(
        false
      );

      // Act
      const result = requestRouter.evaluatePathQuality(
        path,
        nodes,
        request,
        componentUtilization
      );

      // Assert
      // Would be negative but should be clamped to 0
      expect(result).toBe(0);
    });
  });
  describe("determineNextNode", () => {
    const position = { x: 0, y: 0 };

    let node1: SystemDesignNode;
    let node2: SystemDesignNode;
    let node3: SystemDesignNode;
    let nodes: SystemDesignNode[];
    let edges: SystemDesignEdge[];
    let request: SimulationRequest;
    let componentUtilization: ComponentUtilization;

    beforeEach(() => {
      // Setup common test data
      node1 = createNode(NodeType.Client, "Client", position);
      node1.id = "node1"; // Override ID for predictability

      node2 = createNode(NodeType.Server, "Server", position);
      node2.id = "node2";

      node3 = createNode(NodeType.Database, "Database", position);
      node3.id = "node3";

      nodes = [node1, node2, node3];

      edges = [
        { id: "edge1", source: "node1", target: "node2" },
        { id: "edge2", source: "node2", target: "node3" },
      ];
      request = createRequest("req1", "Read", node1.id, node3.id);

      componentUtilization = {
        nodeUtilization: {
          node1: 0.2,
          node2: 0.3,
          node3: 0.4,
        },
        edgeUtilization: {
          edge1: 0.3,
          edge2: 0.4,
        },
      };

      // Mock graphUtils functions - using Map to match the Graph type
      const mockGraph = new Map<string, Set<string>>();
      mockGraph.set("node1", new Set(["node2"]));
      mockGraph.set("node2", new Set(["node3"]));
      mockGraph.set("node3", new Set());
      vi.mocked(buildSystemGraph).mockReturnValue(mockGraph);

      vi.mocked(findAllPaths).mockReturnValue([["node1", "node2", "node3"]]);

      // Mock evaluatePathQuality to return a predictable score
      vi.spyOn(requestRouter, "evaluatePathQuality").mockReturnValue(100);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return null if already at destination", () => {
      // Arrange
      const sameNodeRequest: SimulationRequest = {
        ...request,
        sourceNodeId: "node3",
        currentNodeId: "node3",
        destinationNodeId: "node3",
      };

      // Act
      const result = requestRouter.determineNextNode(
        sameNodeRequest,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBeNull();
      // Should not call these functions if already at destination
      expect(buildSystemGraph).not.toHaveBeenCalled();
      expect(findAllPaths).not.toHaveBeenCalled();
    });

    it("should return null if no paths are found", () => {
      // Arrange
      vi.mocked(findAllPaths).mockReturnValueOnce([]);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      const result = requestRouter.determineNextNode(
        request,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(buildSystemGraph).toHaveBeenCalledWith(nodes, edges);
      expect(findAllPaths).toHaveBeenCalledWith(
        expect.any(Object),
        "node1",
        "node3"
      );
    });

    it("should select the best path based on score and return the next node", () => {
      // Arrange
      const path1 = ["node1", "node2", "node3"];
      const path2 = ["node1", "node3"]; // Direct path

      vi.mocked(findAllPaths).mockReturnValueOnce([path1, path2]);

      // Make path2 score higher
      vi.spyOn(requestRouter, "evaluatePathQuality").mockImplementation(
        (path) => {
          return path.length === 2 ? 200 : 100; // Path2 (direct) gets higher score
        }
      );

      // Act
      const result = requestRouter.determineNextNode(
        request,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBe(node3); // Should pick the direct path, so next node is node3
      expect(requestRouter.evaluatePathQuality).toHaveBeenCalledTimes(2);
    });

    it("should select first node from the highest scoring path", () => {
      // Arrange - Default setup with single path

      // Act
      const result = requestRouter.determineNextNode(
        request,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBe(node2); // Next node should be node2
      expect(buildSystemGraph).toHaveBeenCalledWith(nodes, edges);
      expect(findAllPaths).toHaveBeenCalledWith(
        expect.any(Object),
        "node1",
        "node3"
      );
      expect(requestRouter.evaluatePathQuality).toHaveBeenCalledTimes(1);
    });

    it("should return null if next node in best path is not found", () => {
      // Arrange
      vi.mocked(findAllPaths).mockReturnValueOnce([
        ["node1", "missing-node", "node3"],
      ]);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      const result = requestRouter.determineNextNode(
        request,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should sort paths by score in descending order", () => {
      // Arrange
      const path1 = ["node1", "node2", "node3"]; // Longer path
      const path2 = ["node1", "node3"]; // Direct path

      vi.mocked(findAllPaths).mockReturnValueOnce([path1, path2]);

      // Make the longer path score higher
      vi.spyOn(requestRouter, "evaluatePathQuality").mockImplementation(
        (path) => {
          return path.length === 3 ? 200 : 100; // Path1 (longer) gets higher score
        }
      );

      // Act
      const result = requestRouter.determineNextNode(
        request,
        nodes,
        edges,
        componentUtilization
      );

      // Assert
      expect(result).toBe(node2); // Should pick the longer path, so next node is node2
    });
  });
});
