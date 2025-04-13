import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestGenerator } from "./requestGenerator";
import {
  CacheNode,
  ClientNode,
  ClientNodeData,
  DatabaseNode,
  LoadBalancerNode,
  NodeType,
  ServerNode,
} from "../../../types/flow/nodeTypes";
import { defaultClientNodeData } from "../../../constants/nodeDefaults";
import { createNode } from "../../../utils/flow/nodeUtils";
import {
  SimulationRequest,
  SimulationRequestType,
} from "../../../types/flow/simulationTypes";
import * as graphUtils from "../../../utils/graphUtils";
import * as random from "../../../utils/random";
/**
 * Unit Test for each function in Request Generator
 */

describe("Request Generator", () => {
  describe("calculateRequestsPerSecond", () => {
    it("Should return the correct amount of RPS", () => {
      const users = 100;
      let thinkTime = 1000; // 1 sec between request
      let result = requestGenerator.calculateRequestsPerSecond(
        users,
        thinkTime
      );
      // 100 users , think time is 1 sec , each second 100 request
      expect(result).toBe(100);
      // 100 users, think time 0.5 sec - 200 request per second
      thinkTime = 500;
      result = requestGenerator.calculateRequestsPerSecond(users, thinkTime);
      expect(result).toBe(200);
      // Small Values
      thinkTime = 1; // 1ms think time
      result = requestGenerator.calculateRequestsPerSecond(users, thinkTime);
      expect(result).toBe(100000); // 100 users × (1000/1) requests per second
    });
  });
  describe("applyClientSizeAdjustments", () => {
    const clientData: ClientNodeData = {
      ...defaultClientNodeData,
      label: "Test Client",
      description: "Test client",
    };
    const baseSize = 5; // 5KB
    it("Should apply the correct size for Browser ", () => {
      // Browser with JWT and HTTP
      clientData.clientType = "Browser";
      clientData.preferredProtocol = "HTTP";
      clientData.authenticationMethod = "JWT";
      const result = requestGenerator.applyClientSizeAdjustments(
        clientData,
        baseSize
      );
      expect(result).toBe(baseSize * 1.5 * 1.2 + 0.5);
    });
    it("Should apply the correct size for Mobile App ", () => {
      // Mobile App with OAuth and HTTPS
      clientData.clientType = "Mobile App";
      clientData.preferredProtocol = "HTTPS";
      clientData.authenticationMethod = "OAuth";
      const result = requestGenerator.applyClientSizeAdjustments(
        clientData,
        baseSize
      );
      expect(result).toBeCloseTo(baseSize * 0.7 * 1.7 + 0.5);
    });
    it("Should apply the correct size for Desktop App ", () => {
      // Desktop App with OAuth and HTTPS
      clientData.clientType = "Desktop App";
      clientData.preferredProtocol = "HTTPS";
      clientData.authenticationMethod = "OAuth";
      const result = requestGenerator.applyClientSizeAdjustments(
        clientData,
        baseSize
      );
      expect(result).toBeCloseTo(baseSize * 0.7 * 1.7 + 0.5);
    });
    it("Should apply the correct size for IoT Device ", () => {
      // IoT Device with OAuth and HTTPS
      clientData.clientType = "IoT Device";
      clientData.preferredProtocol = "HTTPS";
      clientData.authenticationMethod = "OAuth";
      const result = requestGenerator.applyClientSizeAdjustments(
        clientData,
        baseSize
      );
      expect(result).toBeCloseTo(baseSize * 0.3 * 1.7 + 0.5);
    });
    it("Should apply the correct size for API Client ", () => {
      // API Client with OAuth and HTTPS
      clientData.clientType = "API Client";
      clientData.preferredProtocol = "HTTPS";
      clientData.authenticationMethod = "OAuth";
      const result = requestGenerator.applyClientSizeAdjustments(
        clientData,
        baseSize
      );
      expect(result).toBeCloseTo(baseSize * 1.7 + 0.5);
    });
  });
  describe("applyTargetSizeAdjustments", () => {
    const baseSize = 5; // 5KB
    const label = "Test node";
    const position = { x: 0, y: 0 };
    it("Should apply the correct size for Server node ", () => {
      // Create basic server node
      const serverNode: ServerNode = createNode(
        NodeType.Server,
        label,
        position
      ) as ServerNode;
      let result = requestGenerator.applyTargetSizeAdjustments(
        serverNode,
        baseSize
      );
      expect(result).toBe(baseSize * 1.2);
      // add authenticationRequired
      serverNode.data.authenticationRequired = true;
      result = result = requestGenerator.applyTargetSizeAdjustments(
        serverNode,
        baseSize
      );
      expect(result).toBe(baseSize * 1.2 * 1.3);
    });
    it("Should apply the correct size for Client node ", () => {
      // Create basic server node
      const clientNode = createNode(NodeType.Client, label, position);
      const result = requestGenerator.applyTargetSizeAdjustments(
        clientNode,
        baseSize
      );
      expect(result).toBe(baseSize);
    });
    it("Should apply the correct size for Cache node ", () => {
      // Create basic server node
      const cacheNode = createNode(NodeType.Cache, label, position);
      const result = requestGenerator.applyTargetSizeAdjustments(
        cacheNode,
        baseSize
      );
      expect(result).toBe(baseSize);
    });
    it("Should apply the correct size for LoadBalancer node ", () => {
      // Create basic server node
      const loadbalancerNode: LoadBalancerNode = createNode(
        NodeType.LoadBalancer,
        label,
        position
      ) as LoadBalancerNode;
      let result = requestGenerator.applyTargetSizeAdjustments(
        loadbalancerNode,
        baseSize
      );
      expect(result).toBe(baseSize);
      //   add content based routing
      loadbalancerNode.data.contentBasedRouting = true;
      result = requestGenerator.applyTargetSizeAdjustments(
        loadbalancerNode,
        baseSize
      );
      expect(result).toBe(baseSize * 1.3);
    });
    it("Should apply the correct size for Database node ", () => {
      // Create basic server node
      const dbNode: DatabaseNode = createNode(
        NodeType.Database,
        label,
        position
      ) as DatabaseNode;
      let result = requestGenerator.applyTargetSizeAdjustments(
        dbNode,
        baseSize
      );
      expect(result).toBe(baseSize * 5 * 2 * 1.2);
      // With Complex query and NoSQL
      dbNode.data.queryComplexity = "Complex";
      dbNode.data.dbType = "NoSQL";
      result = requestGenerator.applyTargetSizeAdjustments(dbNode, baseSize);
      expect(result).toBe(baseSize * 5 * 4 * 0.8);
    });
  });
  describe("determineRequestSize", () => {
    const label = "Test node";
    const position = { x: 0, y: 0 };
    it("Should return a size within the expected range", () => {
      const clientNode: ClientNode = createNode(
        NodeType.Client,
        label,
        position
      ) as ClientNode;
      const serverNode: ServerNode = createNode(
        NodeType.Server,
        label,
        position
      ) as ServerNode;

      const requestType: SimulationRequestType = "Read";
      const baseSize = 1 * 0.7;
      const clientSizeAdjustment = baseSize * 1.7 * 1.2 + 0.5;
      const targetSizeAdjustment = clientSizeAdjustment * 1.2;
      const expectedSize = targetSizeAdjustment; // This is the final baseSize
      // Calculate min and max possible values (with 0.8 and 1.2 random factors)
      const minExpectedSize = Math.round(expectedSize * 0.8);
      const maxExpectedSize = Math.round(expectedSize * 1.2);

      const result = requestGenerator.determineRequestSize(
        clientNode,
        serverNode,
        requestType
      );
      expect(result).toBeGreaterThanOrEqual(minExpectedSize);
      expect(result).toBeLessThanOrEqual(maxExpectedSize);
    });
  });
  describe("determineInitialClientProcessingTime", () => {
    // Setup default client data that we'll modify for each test
    let clientData: ClientNodeData;
    const label = "Test Node";
    const description = "Test Node";
    beforeEach(() => {
      // Reset client data before each test
      clientData = {
        ...defaultClientNodeData,
        label,
        description,
      };
    });
    it("should return correct processing time for high performance devices", () => {
      clientData.devicePerformance = "High";
      clientData.bandwidthLimit = 0; // No bandwidth limit

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // High performance = 10ms base time, no bandwidth factor
      expect(result).toBe(10);
    });
    it("should return correct processing time for medium performance devices", () => {
      clientData.devicePerformance = "Medium";
      clientData.bandwidthLimit = 0; // No bandwidth limit

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // Medium performance = 20ms base time, no bandwidth factor
      expect(result).toBe(20);
    });
    it("should return correct processing time for low performance devices", () => {
      clientData.devicePerformance = "Low";
      clientData.bandwidthLimit = 0; // No bandwidth limit

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // Low performance = 30ms base time, no bandwidth factor
      expect(result).toBe(30);
    });
    it("should apply bandwidth factor correctly", () => {
      clientData.devicePerformance = "High";
      clientData.bandwidthLimit = 5; // 5 Mbps

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // High performance = 10ms
      // Bandwidth factor = 10/5 = 2
      // Final time = 10 * 2 = 20ms
      expect(result).toBe(20);
    });
    it("should cap bandwidth slowdown at 3x", () => {
      clientData.devicePerformance = "Medium";
      clientData.bandwidthLimit = 1; // Very slow bandwidth (1 Mbps)

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // Medium performance = 20ms
      // Bandwidth factor = 10/1 = 10 (but capped at 3)
      // Final time = 20 * 3 = 60ms
      expect(result).toBe(60);
    });
    it("should handle  zero bandwidth limit", () => {
      clientData.devicePerformance = "Low";

      // Test with undefined
      clientData.bandwidthLimit = 0;
      let result =
        requestGenerator.determineInitialClientProcessingTime(clientData);
      expect(result).toBe(30); // Just base time for low performance

      // Test with zero
      clientData.bandwidthLimit = 0;
      result =
        requestGenerator.determineInitialClientProcessingTime(clientData);
      expect(result).toBe(30); // Just base time for low performance
    });
    it("should handle fractional bandwidth values", () => {
      clientData.devicePerformance = "High";
      clientData.bandwidthLimit = 2.5; // 2.5 Mbps

      const result =
        requestGenerator.determineInitialClientProcessingTime(clientData);

      // High performance = 10ms
      // Bandwidth factor = 10/2.5 = 4 (capped at 3)
      // Final time = 10 * 3 = 30ms
      expect(result).toBe(30);
    });
  });
  describe("Node Selectors", () => {
    const position = { x: 0, y: 0 };
    const label = "Test node";
    const description = "test node";
    // Track original random function
    let originalRandom: () => number;

    beforeEach(() => {
      // Save original function
      originalRandom = Math.random;

      // Mock Math.random to return 0, which will always select the first item
      // in the weighted selection (highest score)
      Math.random = vi.fn().mockReturnValue(0);
    });

    afterEach(() => {
      // Restore original function
      Math.random = originalRandom;
    });
    it("Should select appropriate server node based on request type and client data", () => {
      // Create test server nodes with different characteristics

      // Create a high-performance server
      const highPerformanceServer = createNode(
        NodeType.Server,
        "High Performance Server",
        position
      ) as ServerNode;

      highPerformanceServer.data = {
        ...highPerformanceServer.data,
        maxRequestsPerSecond: 2000,
        averageProcessingTime: 50,
        instances: 5,
        autoScaling: true,
        healthCheckEnabled: true,
        cpuCores: 16,
        memory: 64,
        supportedProtocols: ["HTTP", "HTTPS", "WebSocket"],
        maxConcurrentRequests: 500,
        concurrencyModel: "Worker Pool",
        storage: 1000,
        restartPolicy: "Always",
        cpuSpeed: 3.6,
        hasGPU: true,
        authenticationRequired: true,
        deploymentType: "VM",
      };

      // Create a medium-performance server
      const mediumServer = createNode(
        NodeType.Server,
        "Medium Server",
        position
      ) as ServerNode;

      mediumServer.data = {
        ...mediumServer.data,
        maxRequestsPerSecond: 1000,
        averageProcessingTime: 100,
        instances: 3,
        autoScaling: false,
        healthCheckEnabled: true,
        cpuCores: 8,
        memory: 32,
        supportedProtocols: ["HTTP"],
        maxConcurrentRequests: 200,
        concurrencyModel: "Event-Loop",
        storage: 500,
        restartPolicy: "OnFailure",
        cpuSpeed: 2.8,
        hasGPU: false,
        authenticationRequired: false,
        deploymentType: "Container",
      };

      // Create a low-performance server
      const lowServer = createNode(
        NodeType.Server,
        "Low Server",
        position
      ) as ServerNode;

      lowServer.data = {
        ...lowServer.data,
        maxRequestsPerSecond: 500,
        averageProcessingTime: 200,
        instances: 1,
        autoScaling: false,
        healthCheckEnabled: false,
        cpuCores: 2,
        memory: 8,
        supportedProtocols: ["HTTP"],
        maxConcurrentRequests: 50,
        concurrencyModel: "Single-Threaded",
        storage: 100,
        restartPolicy: "Never",
        cpuSpeed: 2.0,
        hasGPU: false,
        authenticationRequired: false,
        deploymentType: "Container",
      };

      // Create an array of servers
      const serverNodes = [lowServer, mediumServer, highPerformanceServer];

      // Test for "Compute" request type with WebSocket preference
      const clientData: ClientNodeData = {
        ...defaultClientNodeData,
        preferredProtocol: "WebSocket",
        label,
        description,
      };

      // With randomness mocked to 0, the highest scored node will always be selected
      const computeSelection = requestGenerator.selectServerNode(
        serverNodes,
        "Compute",
        clientData
      );

      // The high performance server should always be selected
      expect(computeSelection.id).toBe(highPerformanceServer.id);

      // Test for "Read" request type with HTTP preference
      const httpClientData: ClientNodeData = {
        ...defaultClientNodeData,
        preferredProtocol: "HTTP",
        label,
        description,
      };

      const readSelection = requestGenerator.selectServerNode(
        serverNodes,
        "Read",
        httpClientData
      );

      // For HTTP reads, the high performance server should still be selected
      expect(readSelection.id).toBe(highPerformanceServer.id);
    });
    it("Should select appropriate database node based on request type", () => {
      // Create a SQL database optimized for transactions
      const sqlTransactionDB = createNode(
        NodeType.Database,
        "SQL Transaction DB",
        position
      ) as DatabaseNode;

      sqlTransactionDB.data = {
        ...sqlTransactionDB.data,
        dbType: "SQL",
        dbSubType: "Relational",
        storageCapacity: 1000,
        autoScaling: true,
        readIOPS: 5000,
        writeIOPS: 2000,
        averageLatency: 10,
        readWriteRatio: 70, // 70% reads, 30% writes
        queryComplexity: "Complex",
        replication: true,
        replicationType: "Master-Slave",
        maxConnections: 1000,
        backupStrategy: "Continuous",
      };

      // Create a NoSQL database optimized for writes
      const nosqlWriteDB = createNode(
        NodeType.Database,
        "NoSQL Write DB",
        position
      ) as DatabaseNode;

      nosqlWriteDB.data = {
        ...nosqlWriteDB.data,
        dbType: "NoSQL",
        dbSubType: "Document",
        storageCapacity: 2000,
        autoScaling: true,
        readIOPS: 3000,
        writeIOPS: 8000,
        averageLatency: 5,
        readWriteRatio: 20, // 20% reads, 80% writes
        queryComplexity: "Simple",
        replication: true,
        replicationType: "Multi-Master",
        maxConnections: 2000,
        backupStrategy: "Daily",
      };

      // Create an in-memory database optimized for reads
      const inMemoryReadDB = createNode(
        NodeType.Database,
        "In-Memory Read DB",
        position
      ) as DatabaseNode;

      inMemoryReadDB.data = {
        ...inMemoryReadDB.data,
        dbType: "NoSQL",
        dbSubType: "In-Memory",
        storageCapacity: 500,
        autoScaling: true,
        readIOPS: 20000,
        writeIOPS: 1000,
        averageLatency: 1,
        readWriteRatio: 90, // 90% reads, 10% writes
        queryComplexity: "Simple",
        replication: true,
        replicationType: "Sharded",
        maxConnections: 5000,
        backupStrategy: "Daily",
      };

      // Create an array of databases
      const dbNodes = [sqlTransactionDB, nosqlWriteDB, inMemoryReadDB];

      // Test for each request type with multiple selections

      // 1. Test for "Transaction" requests - SQL should be favored
      const transactionSelection = requestGenerator.selectDatabaseNode(
        dbNodes,
        "Transaction"
      );

      // SQL DB should be selected for transactions
      expect(transactionSelection.id).toBe(sqlTransactionDB.id);

      // 2. Test for "Write" requests - NoSQL should be favored
      const writeSelection = requestGenerator.selectDatabaseNode(
        dbNodes,
        "Write"
      );

      // NoSQL DB should be selected for writes
      expect(writeSelection.id).toBe(nosqlWriteDB.id);

      // 3. Test for "Read" requests - In-Memory should be favored
      const readSelection = requestGenerator.selectDatabaseNode(
        dbNodes,
        "Read"
      );

      // In-Memory DB should be selected for reads
      expect(readSelection.id).toBe(inMemoryReadDB.id);
    });
    it("Should select appropriate cache node based on request type", () => {
      // Create test cache nodes with different characteristics
      const inMemoryCache = createNode(
        NodeType.Cache,
        "In-Memory Cache",
        position
      ) as CacheNode;

      inMemoryCache.data = {
        ...inMemoryCache.data,
        cacheType: "In-Memory",
        averageLatency: 1,
        expectedHitRate: 0.9,
        maxThroughput: 50000,
      };

      const diskCache = createNode(
        NodeType.Cache,
        "Disk Cache",
        position
      ) as CacheNode;

      diskCache.data = {
        ...diskCache.data,
        cacheType: "In-Memory",
        averageLatency: 20,
        expectedHitRate: 0.7,
        maxThroughput: 10000,
      };

      const cdnCache = createNode(
        NodeType.Cache,
        "CDN Cache",
        position
      ) as CacheNode;

      cdnCache.data = {
        ...cdnCache.data,
        cacheType: "CDN",
        averageLatency: 5,
        expectedHitRate: 0.8,
        maxThroughput: 100000,
      };

      // Create an array of caches
      const cacheNodes = [inMemoryCache, diskCache, cdnCache];

      // Test for "Read" requests - In-Memory should be favored
      const readSelection = requestGenerator.selectCacheNode(
        cacheNodes,
        "Read"
      );

      // In-Memory cache should be selected for reads due to higher score
      expect(readSelection.id).toBe(inMemoryCache.id);

      // Write requests would typically hit the backing store directly, but if a cache
      // is needed, CDN might be preferred for distribution
      const writeSelection = requestGenerator.selectCacheNode(
        cacheNodes,
        "Write"
      );

      // For non-read operations, CDN would be preferred over disk cache
      expect(writeSelection.id).toBe(cdnCache.id);

      // Ensure the disk cache (lowest performance) is never selected when better options exist
      // This is guaranteed by our Math.random() mock returning 0
      const anySelection = requestGenerator.selectCacheNode(
        cacheNodes,
        "Transaction"
      );

      expect(anySelection.id).not.toBe(diskCache.id);
    });
  });
  describe("determineRequestDestination", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should select a cache node for Read requests when cache is enabled", () => {
      // Set up nodes
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const cacheNode = createNode(NodeType.Cache, "Cache", {
        x: 0,
        y: 0,
      }) as CacheNode;
      const dbNode = createNode(NodeType.Database, "Database", {
        x: 0,
        y: 0,
      }) as DatabaseNode;

      // Enable cache on client
      clientNode.data.cacheEnabled = true;

      const allNodes = [clientNode, cacheNode, dbNode];
      const allEdges = [
        { id: "e1", source: clientNode.id, target: cacheNode.id },
        { id: "e2", source: clientNode.id, target: dbNode.id },
      ];

      // Mock graph utilities
      vi.spyOn(graphUtils, "buildSystemGraph").mockReturnValue(new Map());
      vi.spyOn(graphUtils, "findReachableNodes").mockReturnValue(
        new Set([cacheNode.id, dbNode.id])
      );

      // Mock node selection
      vi.spyOn(requestGenerator, "selectCacheNode").mockImplementation(
        (): CacheNode => cacheNode
      );

      // Call the function
      const result = requestGenerator.determineRequestDestination(
        clientNode,
        "Read",
        allNodes,
        allEdges
      );

      // Verify cache node was selected
      expect(result).toBe(cacheNode);
      expect(requestGenerator.selectCacheNode).toHaveBeenCalled();
    });

    it("should select a database node for Write requests", () => {
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const dbNode = createNode(NodeType.Database, "Database", {
        x: 0,
        y: 0,
      }) as DatabaseNode;
      const serverNode = createNode(NodeType.Server, "Server", {
        x: 0,
        y: 0,
      }) as ServerNode;

      const allNodes = [clientNode, dbNode, serverNode];
      const allEdges = [
        { id: "e1", source: clientNode.id, target: dbNode.id },
        { id: "e2", source: clientNode.id, target: serverNode.id },
      ];

      vi.spyOn(graphUtils, "buildSystemGraph").mockReturnValue(new Map());
      vi.spyOn(graphUtils, "findReachableNodes").mockReturnValue(
        new Set([dbNode.id, serverNode.id])
      );

      // Mock with proper type implementation
      vi.spyOn(requestGenerator, "selectDatabaseNode").mockImplementation(
        (): DatabaseNode => dbNode
      );

      const result = requestGenerator.determineRequestDestination(
        clientNode,
        "Write",
        allNodes,
        allEdges
      );

      expect(result).toBe(dbNode);
      expect(requestGenerator.selectDatabaseNode).toHaveBeenCalled();
    });

    it("should return null when no nodes are reachable", () => {
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const allNodes = [clientNode];
      const allEdges = [];

      vi.spyOn(graphUtils, "buildSystemGraph").mockReturnValue(new Map());
      vi.spyOn(graphUtils, "findReachableNodes").mockReturnValue(new Set());

      // Mock console.error to avoid polluting test output
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = requestGenerator.determineRequestDestination(
        clientNode,
        "Read",
        allNodes,
        allEdges
      );

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("generateRequestFromClient", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should generate a valid request when destination is available", () => {
      // Set up test data
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const serverNode = createNode(NodeType.Server, "Server", {
        x: 0,
        y: 0,
      }) as ServerNode;

      const allNodes = [clientNode, serverNode];
      const allEdges = [
        { id: "e1", source: clientNode.id, target: serverNode.id },
      ];
      const currentTime = 1000;

      // Add geographic distribution to client data
      clientNode.data.geographicDistribution = ["US-East", "Europe"];

      // Mock all the dependent functions
      vi.spyOn(requestGenerator, "determineRequestType").mockReturnValue(
        "Read"
      );
      vi.spyOn(requestGenerator, "determineRequestDestination").mockReturnValue(
        serverNode
      );
      vi.spyOn(requestGenerator, "determineRequestSize").mockReturnValue(10);
      vi.spyOn(
        requestGenerator,
        "determineInitialClientProcessingTime"
      ).mockReturnValue(20);
      vi.spyOn(requestGenerator, "generateRequestId").mockReturnValue(
        "req-12345678"
      );
      vi.spyOn(random, "randomIndex").mockReturnValue(0);

      // Execute the function
      const result = requestGenerator.generateRequestFromClient(
        clientNode,
        allNodes,
        allEdges,
        currentTime
      );

      // Verify the result
      expect(result).not.toBeNull();

      if (result) {
        expect(result.id).toBe("req-12345678");
        expect(result.type).toBe("Read");
        expect(result.sourceNodeId).toBe(clientNode.id);
        expect(result.destinationNodeId).toBe(serverNode.id);
        expect(result.sizeKB).toBe(10);
        expect(result.createdAt).toBe(currentTime);
        expect(result.sourceRegion).toBe("US-East");
        expect(result.processingData.requiredProcessingTime).toBe(20);
      }

      // Verify that the dependent functions were called
      expect(requestGenerator.determineRequestType).toHaveBeenCalled();
      expect(requestGenerator.determineRequestDestination).toHaveBeenCalledWith(
        clientNode,
        "Read",
        allNodes,
        allEdges
      );
      expect(requestGenerator.determineRequestSize).toHaveBeenCalledWith(
        clientNode,
        serverNode,
        "Read"
      );
    });

    it("should return null when no valid destination is found", () => {
      // Set up test data
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const allNodes = [clientNode];
      const allEdges = [];
      const currentTime = 1000;

      // Mock determineRequestType and determineRequestDestination
      vi.spyOn(requestGenerator, "determineRequestType").mockReturnValue(
        "Read"
      );
      vi.spyOn(requestGenerator, "determineRequestDestination").mockReturnValue(
        null
      );

      // Mock console.log to avoid test output pollution
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      // Execute the function
      const result = requestGenerator.generateRequestFromClient(
        clientNode,
        allNodes,
        allEdges,
        currentTime
      );

      // Verify the result is null
      expect(result).toBeNull();

      // Verify that only determineRequestType and determineRequestDestination were called
      expect(requestGenerator.determineRequestType).toHaveBeenCalled();
      expect(requestGenerator.determineRequestDestination).toHaveBeenCalled();
      expect(requestGenerator.determineRequestSize).not.toHaveBeenCalled();

      // Clean up
      consoleLogSpy.mockRestore();
    });
  });
  describe("generateRequests", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should generate requests from multiple clients", () => {
      // Set up test data
      const client1 = createNode(NodeType.Client, "Client 1", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const client2 = createNode(NodeType.Client, "Client 2", {
        x: 100,
        y: 0,
      }) as ClientNode;
      const serverNode = createNode(NodeType.Server, "Server", {
        x: 50,
        y: 50,
      }) as ServerNode;

      // Configure client data
      client1.data.concurrentUsers = 10;
      client1.data.thinkTimeBetweenRequests = 1000; // 1 request per second per user
      client1.data.requestPattern = "Steady";

      client2.data.concurrentUsers = 5;
      client2.data.thinkTimeBetweenRequests = 2000; // 0.5 requests per second per user
      client2.data.requestPattern = "Steady";

      const allNodes = [client1, client2, serverNode];
      const allEdges = [
        { id: "e1", source: client1.id, target: serverNode.id },
        { id: "e2", source: client2.id, target: serverNode.id },
      ];

      const currentTime = 1000;
      const timeStep = 100; // 0.1 seconds

      // Create mock requests
      const mockRequest1: SimulationRequest = {
        id: "req-client1",
        type: "Read",
        status: "pending",
        sourceNodeId: client1.id,
        currentNodeId: client1.id,
        destinationNodeId: serverNode.id,
        path: [],
        sizeKB: 10,
        createdAt: currentTime,
        secureConnection: false,
        preferredProtocol: "HTTP",
        authMethod: "None",
        maxRetries: 3,
        sourceRegion: "US-East",
        cacheEnabled: false,
        retryOnError: false,
        processingData: {
          retryCount: 0,
          processingTime: 0,
          requiredProcessingTime: 20,
          nodeUtilization: {},
          edgeUtilization: {},
          totalProcessingTime: 0,
        },
      };

      const mockRequest2: SimulationRequest = {
        ...mockRequest1,
        id: "req-client2",
        sourceNodeId: client2.id,
        currentNodeId: client2.id,
      };

      // Mock dependent functions
      vi.spyOn(
        requestGenerator,
        "calculateRequestsPerSecond"
      ).mockImplementation((users, thinkTime) => {
        if (users === 10 && thinkTime === 1000) return 10; // For client1
        if (users === 5 && thinkTime === 2000) return 2.5; // For client2
        return 0;
      });

      vi.spyOn(requestGenerator, "applyRequestPattern").mockImplementation(
        (clientData, expectedRequests) => {
          if (clientData === client1.data) return expectedRequests * 0.1; // 10% of expected requests for client1
          if (clientData === client2.data) return expectedRequests * 0.1; // 10% of expected requests for client2
          return 0;
        }
      );

      vi.spyOn(
        requestGenerator,
        "generateRequestFromClient"
      ).mockImplementation((clientNode) => {
        if (clientNode.id === client1.id) return mockRequest1;
        if (clientNode.id === client2.id) return mockRequest2;
        return null;
      });

      // Execute the function
      const result = requestGenerator.generateRequests(
        allNodes,
        allEdges,
        currentTime,
        timeStep
      );

      // Verify the result
      expect(result.length).toBe(2); // 1 from client1 + 1 from client2
      expect(result).toContainEqual(mockRequest1);
      expect(result).toContainEqual(mockRequest2);

      // Verify function calls
      expect(requestGenerator.calculateRequestsPerSecond).toHaveBeenCalledTimes(
        2
      );
      expect(requestGenerator.applyRequestPattern).toHaveBeenCalledTimes(2);

      // Client 1 generates 1 request (1 generated after rounding)
      expect(requestGenerator.generateRequestFromClient).toHaveBeenCalledWith(
        client1,
        allNodes,
        allEdges,
        currentTime
      );

      // Client 2 generates 1 request (0.25 rounded up to 1)
      expect(requestGenerator.generateRequestFromClient).toHaveBeenCalledWith(
        client2,
        allNodes,
        allEdges,
        currentTime
      );
    });

    it("should handle empty node list", () => {
      // Test with empty nodes array
      const result = requestGenerator.generateRequests([], [], 1000, 100);

      expect(result).toEqual([]);
    });

    it("should handle null requests from clients", () => {
      // Set up test data with one client
      const clientNode = createNode(NodeType.Client, "Client", {
        x: 0,
        y: 0,
      }) as ClientNode;
      const nodes = [clientNode];
      const edges = [];

      // Mock dependencies to generate 1 request but return null
      vi.spyOn(requestGenerator, "calculateRequestsPerSecond").mockReturnValue(
        10
      );
      vi.spyOn(requestGenerator, "applyRequestPattern").mockReturnValue(1);
      vi.spyOn(requestGenerator, "generateRequestFromClient").mockReturnValue(
        null
      );

      // Execute the function
      const result = requestGenerator.generateRequests(nodes, edges, 1000, 100);

      // Verify the result - should be empty array since all requests are null
      expect(result).toEqual([]);
      expect(requestGenerator.generateRequestFromClient).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
