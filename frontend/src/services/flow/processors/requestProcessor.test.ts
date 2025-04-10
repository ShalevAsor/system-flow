import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNode } from "../../../utils/flow/nodeUtils";
import {
  CacheNode,
  LoadBalancerNode,
  NodeType,
  ServerNode,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import { createEdge } from "../../../utils/flow/edgeUtils";
import {
  DatabaseEdgeData,
  EdgeType,
  EventStreamEdgeData,
  GRPCEdgeData,
  HTTPEdge,
  HTTPEdgeData,
  MessageQueueEdgeData,
  SystemDesignEdge,
  TCPEdgeData,
  UDPEdgeData,
  WebSocketEdgeData,
} from "../../../types/flow/edgeTypes";
import { requestProcessor } from "./requestProcessor";
import { requestRouter } from "../routers/requestRouter";
import {
  defaultDatabaseEdgeData,
  defaultEventStreamEdgeData,
  defaultGRPCEdgeData,
  defaultMessageQueueEdgeData,
  defaultTCPEdgeData,
  defaultUDPEdgeData,
  defaultWebSocketEdgeData,
} from "../../../constants/edgeDefaults";
import { SimulationRequest } from "../../../types/flow/simulationTypes";
import { createRequest } from "../../../utils/testUtils";

describe("Request Processor", () => {
  describe("Edge impact methods", () => {
    it("should calculate Event Stream Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;

      // Use the default event stream data as a base to ensure type safety
      const baseEventStreamData = { ...defaultEventStreamEdgeData };

      // Case 1: No modifiers
      const basicEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: false,
        shardCount: 0,
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 10, // Small batch size
      };

      // Case 2: Ordered only
      const orderedEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: true,
        sharding: false,
        shardCount: 0,
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 10, // Small batch size
      };

      // Case 3: Sharded only with moderate shards
      const shardedEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: true,
        shardCount: 4,
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 10, // Small batch size
      };

      // Case 4: Sharding flag true but insufficient shards
      const insufficientShardsEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: true,
        shardCount: 1,
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 10, // Small batch size
      };

      // Case 5: Many shards
      const manyShardedEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: true,
        shardCount: 12, // Many shards
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 10, // Small batch size
      };

      // Case 6: Long retention period
      const longRetentionEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: false,
        shardCount: 0,
        retentionPeriodHours: 120, // 5 days
        maxBatchSize: 10, // Small batch size
      };

      // Case 7: Short retention period
      const shortRetentionEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: false,
        shardCount: 0,
        retentionPeriodHours: 12, // 12 hours
        maxBatchSize: 10, // Small batch size
      };

      // Case 8: Large batch size
      const largeBatchEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: false,
        sharding: false,
        shardCount: 0,
        retentionPeriodHours: 48, // Neutral value
        maxBatchSize: 100, // Large batch size
      };

      // Case 9: Complex combination
      const complexEdgeData: EventStreamEdgeData = {
        ...baseEventStreamData,
        ordered: true,
        sharding: true,
        shardCount: 6,
        retentionPeriodHours: 96, // 4 days
        maxBatchSize: 200, // Very large batch size
      };

      // Act & Assert
      // Case 1: No modifiers - should be unchanged
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          basicEdgeData
        )
      ).toBe(0.5);

      // Case 2: Ordered only - should increase by factor of 1.3
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          orderedEdgeData
        )
      ).toBe(0.5 * 1.3);

      // Case 3: Sharded only with moderate shards - should decrease by factor of 0.8
      const shardFactor3 = Math.min(4 / 3, 2);
      const shardMultiplier3 = 1 - 0.2 * shardFactor3;
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          shardedEdgeData
        )
      ).toBeCloseTo(0.5 * shardMultiplier3);

      // Case 4: Insufficient shards - should ignore sharding modifier
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          insufficientShardsEdgeData
        )
      ).toBe(0.5);

      // Case 5: Many shards - should decrease impact by up to 40%
      const shardFactor5 = Math.min(12 / 3, 2);
      const shardMultiplier5 = 1 - 0.2 * shardFactor5;
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          manyShardedEdgeData
        )
      ).toBeCloseTo(0.5 * shardMultiplier5);

      // Case 6: Long retention period - should increase by factor of 1.2
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          longRetentionEdgeData
        )
      ).toBe(0.5 * 1.2);

      // Case 7: Short retention period - should decrease by factor of 0.9
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          shortRetentionEdgeData
        )
      ).toBe(0.5 * 0.9);

      // Case 8: Large batch size - should decrease by factor of 0.9
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          largeBatchEdgeData
        )
      ).toBe(0.5 * 0.9);

      // Case 9: Complex combination - combination of all factors
      // Ordered (1.3) + Sharded with 6 shards (1 - 0.2*(6/3)) + Long retention (1.2) + Large batch (0.9)
      const shardFactor9 = Math.min(6 / 3, 2);
      const shardMultiplier9 = 1 - 0.2 * shardFactor9;
      expect(
        requestProcessor.calculateEventStreamEdgeImpact(
          baseImpact,
          complexEdgeData
        )
      ).toBeCloseTo(0.5 * 1.3 * shardMultiplier9 * 1.2 * 0.9);
    });
    it("should calculate Database Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default database data as a base to ensure type safety
      const baseDatabaseData: DatabaseEdgeData = { ...defaultDatabaseEdgeData };

      // Case 1: Read + Read Committed (basic case)
      const basicEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Read",
        isolationLevel: "Read Committed",
        connectionPooling: false,
        preparedStatements: false,
        transactional: false,
        queryTimeout: 30000,
      };

      // Case 2: Write + Serializable (high isolation)
      const writeEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Write",
        isolationLevel: "Serializable",
        connectionPooling: false,
        preparedStatements: false,
        transactional: false,
        queryTimeout: 30000,
      };

      // Case 3: Read + Repeatable Read (medium isolation)
      const readEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Read",
        isolationLevel: "Repeatable Read",
        connectionPooling: false,
        preparedStatements: false,
        transactional: false,
        queryTimeout: 30000,
      };

      // Case 4: Write with Connection Pooling (large pool)
      const pooledWriteEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Write",
        isolationLevel: "Read Committed",
        connectionPooling: true,
        maxConnections: 20,
        preparedStatements: false,
        transactional: false,
        queryTimeout: 30000,
      };

      // Case 5: Read with Prepared Statements
      const preparedReadEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Read",
        isolationLevel: "Read Committed",
        connectionPooling: false,
        preparedStatements: true,
        transactional: false,
        queryTimeout: 30000,
      };

      // Case 6: Transactional Write
      const transactionalWriteEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Write",
        isolationLevel: "Read Committed",
        connectionPooling: false,
        preparedStatements: false,
        transactional: true,
        queryTimeout: 30000,
      };

      // Case 7: Long-running Admin Query
      const longAdminEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Admin",
        isolationLevel: "Read Committed",
        connectionPooling: false,
        preparedStatements: false,
        transactional: false,
        queryTimeout: 120000, // 2 minutes
      };

      // Case 8: Complex combined case
      const complexEdgeData: DatabaseEdgeData = {
        ...baseDatabaseData,
        connectionType: "Write",
        isolationLevel: "Serializable",
        connectionPooling: true,
        maxConnections: 5, // Small pool
        preparedStatements: true,
        transactional: true,
        queryTimeout: 90000, // 1.5 minutes
      };

      // Act & Assert
      // Case 1: Basic Read + Read Committed
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(baseImpact, basicEdgeData)
      ).toBe(baseImpact * 0.8);

      // Case 2: Write + Serializable
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(baseImpact, writeEdgeData)
      ).toBe(baseImpact * 1.3 * 1.4);

      // Case 3: Read + Repeatable Read
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(baseImpact, readEdgeData)
      ).toBe(baseImpact * 0.8 * 1.2);

      // Case 4: Write with Connection Pooling (large pool)
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(
          baseImpact,
          pooledWriteEdgeData
        )
      ).toBe(baseImpact * 1.3 * 0.85);

      // Case 5: Read with Prepared Statements
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(
          baseImpact,
          preparedReadEdgeData
        )
      ).toBe(baseImpact * 0.8 * 0.9);

      // Case 6: Transactional Write
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(
          baseImpact,
          transactionalWriteEdgeData
        )
      ).toBe(baseImpact * 1.3 * 1.15);

      // Case 7: Long-running Admin Query
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(
          baseImpact,
          longAdminEdgeData
        )
      ).toBe(baseImpact * 1.1 * 1.2);

      // Case 8: Complex combined case
      // Write (1.3) + Serializable (1.4) + Small Connection Pool (0.95) +
      // Prepared Statements (0.9) + Transactional (1.15) + Long Query (1.2)
      expect(
        requestProcessor.calculateDatabaseEdgeImpact(
          baseImpact,
          complexEdgeData
        )
      ).toBeCloseTo(baseImpact * 1.3 * 1.4 * 0.95 * 0.9 * 1.15 * 1.2);
    });
    it("should calculate Message Queue Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default message queue data as a base to ensure type safety
      const baseMessageQueueData: MessageQueueEdgeData = {
        ...defaultMessageQueueEdgeData,
      };

      // Case 1: Small message with At-Most-Once delivery (non-persistent)
      const smallMsgAtMostOnceData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "At-Most-Once",
        persistent: false,
        orderingGuaranteed: false,
        partitioning: false,
        deadLetterQueueEnabled: false,
        messagePriority: "Normal",
      };
      const smallMsgSizeKB = 5; // < 10KB

      // Case 2: Medium message with At-Least-Once delivery
      const mediumMsgAtLeastOnceData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "At-Least-Once",
        persistent: false,
        orderingGuaranteed: false,
        partitioning: false,
        deadLetterQueueEnabled: false,
        messagePriority: "Normal",
      };
      const mediumMsgSizeKB = 50; // Between 10KB and 100KB

      // Case 3: Large message with Exactly-Once delivery
      const largeMsgExactlyOnceData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "Exactly-Once",
        persistent: false,
        orderingGuaranteed: false,
        partitioning: false,
        deadLetterQueueEnabled: false,
        messagePriority: "Normal",
      };
      const largeMsgSizeKB = 150; // > 100KB

      // Case 4: Small message with Exactly-Once delivery
      const smallMsgExactlyOnceData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "Exactly-Once",
        persistent: false,
        orderingGuaranteed: false,
        partitioning: false,
        deadLetterQueueEnabled: false,
        messagePriority: "Normal",
      };
      const smallMsgExactlyOnceSizeKB = 5; // < 10KB

      // Case 5: Persistent queue with partitioning
      const persistentPartitionedData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "At-Least-Once",
        persistent: true,
        orderingGuaranteed: false,
        partitioning: true,
        partitionKey: "userId",
        deadLetterQueueEnabled: false,
        messagePriority: "Normal",
      };
      const mediumMsgSizeKB2 = 50;

      // Case 6: Ordered high-priority messages
      const orderedHighPriorityData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "At-Least-Once",
        persistent: false,
        orderingGuaranteed: true,
        partitioning: false,
        deadLetterQueueEnabled: false,
        messagePriority: "High",
      };
      const mediumMsgSizeKB3 = 50;

      // Case 7: Full featured message queue (everything enabled)
      const fullFeaturedQueueData: MessageQueueEdgeData = {
        ...baseMessageQueueData,
        deliveryGuarantee: "Exactly-Once",
        persistent: true,
        orderingGuaranteed: true,
        partitioning: true,
        partitionKey: "region",
        deadLetterQueueEnabled: true,
        messagePriority: "Critical",
      };
      const mediumMsgSizeKB4 = 50;

      // Act & Assert
      // Case 1: Small message + At-Most-Once (only size factor applies)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          smallMsgAtMostOnceData,
          smallMsgSizeKB
        )
      ).toBe(baseImpact * 0.6); // 0.5 * 0.6 = 0.3

      // Case 2: Medium message + At-Least-Once (only delivery guarantee factor applies)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          mediumMsgAtLeastOnceData,
          mediumMsgSizeKB
        )
      ).toBe(baseImpact * 1.2); // 0.5 * 1.2 = 0.6

      // Case 3: Large message + Exactly-Once (both factors apply)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          largeMsgExactlyOnceData,
          largeMsgSizeKB
        )
      ).toBe(baseImpact * 1.5 * 1.5); // 0.5 * 1.5 * 1.5 = 1.125

      // Case 4: Small message + Exactly-Once (both factors apply in opposite directions)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          smallMsgExactlyOnceData,
          smallMsgExactlyOnceSizeKB
        )
      ).toBe(baseImpact * 0.6 * 1.5); // 0.5 * 0.6 * 1.5 = 0.45

      // Case 5: Persistent queue with partitioning
      // Medium size (no modifier) + At-Least-Once (1.2) + Persistent (1.2) + Partitioning (0.8)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          persistentPartitionedData,
          mediumMsgSizeKB2
        )
      ).toBeCloseTo(baseImpact * 1.2 * 1.2 * 0.8); // 0.5 * 1.2 * 1.2 * 0.8 = 0.576

      // Case 6: Ordered high-priority messages
      // Medium size (no modifier) + At-Least-Once (1.2) + Ordering (1.25) + High priority (1.15)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          orderedHighPriorityData,
          mediumMsgSizeKB3
        )
      ).toBeCloseTo(baseImpact * 1.2 * 1.25 * 1.15); // 0.5 * 1.2 * 1.25 * 1.15 = 0.8625

      // Case 7: Full featured message queue (everything enabled)
      // Medium size (no modifier) + Exactly-Once (1.5) + Persistent (1.2) +
      // Ordering (1.25) + Partitioning (0.8) + DLQ (1.1) + Critical Priority (1.15)
      expect(
        requestProcessor.calculateMSGEdgeImpact(
          baseImpact,
          fullFeaturedQueueData,
          mediumMsgSizeKB4
        )
      ).toBeCloseTo(baseImpact * 1.5 * 1.2 * 1.25 * 0.8 * 1.1 * 1.15); // Complex calculation with all factors
    });
    it("should calculate UDP Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default UDP data as a base to ensure type safety
      const baseUDPData: UDPEdgeData = { ...defaultUDPEdgeData };

      // Case 1: With checksum validation
      const withChecksumData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: false,
        broadcast: false,
        packetSizeBytes: 1472,
      };

      // Case 2: Without checksum validation
      const withoutChecksumData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: false,
        multicast: false,
        broadcast: false,
        packetSizeBytes: 1472,
      };

      // Case 3: Multicast UDP
      const multicastData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: true,
        broadcast: false,
        packetSizeBytes: 1472,
      };

      // Case 4: Broadcast UDP
      const broadcastData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: false,
        broadcast: true,
        packetSizeBytes: 1472,
      };

      // Case 5: Small packet size
      const smallPacketData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: false,
        broadcast: false,
        packetSizeBytes: 256,
      };

      // Case 6: Very large packet size
      const largePacketData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: false,
        broadcast: false,
        packetSizeBytes: 9000,
      };

      // Case 7: Complex combined case (broadcast + small packet + checksum)
      const complexData: UDPEdgeData = {
        ...baseUDPData,
        checksumValidation: true,
        multicast: false,
        broadcast: true,
        packetSizeBytes: 256,
      };

      // Act & Assert
      // Case 1: With checksum validation
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, withChecksumData)
      ).toBe(baseImpact * 0.8 * 1.05); // 0.5 * 0.8 * 1.05 = 0.42

      // Case 2: Without checksum validation
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, withoutChecksumData)
      ).toBe(baseImpact * 0.8); // 0.5 * 0.8 = 0.4

      // Case 3: Multicast UDP
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, multicastData)
      ).toBe(baseImpact * 0.8 * 1.05 * 1.3); // 0.5 * 0.8 * 1.05 * 1.3 = 0.546

      // Case 4: Broadcast UDP
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, broadcastData)
      ).toBe(baseImpact * 0.8 * 1.05 * 1.5); // 0.5 * 0.8 * 1.05 * 1.5 = 0.63

      // Case 5: Small packet size
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, smallPacketData)
      ).toBe(baseImpact * 0.8 * 1.05 * 1.1); // 0.5 * 0.8 * 1.05 * 1.1 = 0.462

      // Case 6: Very large packet size
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, largePacketData)
      ).toBe(baseImpact * 0.8 * 1.05 * 1.2); // 0.5 * 0.8 * 1.05 * 1.2 = 0.504

      // Case 7: Complex combined case (broadcast + small packet + checksum)
      expect(
        requestProcessor.calculateUDPEdgeImpact(baseImpact, complexData)
      ).toBeCloseTo(baseImpact * 0.8 * 1.05 * 1.5 * 1.1); // 0.5 * 0.8 * 1.05 * 1.5 * 1.1 = 0.693
    });
    it("should calculate TCP Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default TCP data as a base to ensure type safety
      const baseTCPData: TCPEdgeData = { ...defaultTCPEdgeData };

      // Case 1: Nagle's algorithm with small packets
      const nagleSmallData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: true,
        connectionPoolEnabled: false,
        keepAliveEnabled: false,
        socketBufferSizeKB: 64,
      };
      const smallSizeKB = 3; // < 5KB

      // Case 2: Nagle's algorithm with large packets
      const nagleLargeData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: true,
        connectionPoolEnabled: false,
        keepAliveEnabled: false,
        socketBufferSizeKB: 64,
      };
      const largeSizeKB = 20; // > 5KB

      // Case 3: Connection pooling with small pool
      const smallPoolData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: false,
        connectionPoolEnabled: true,
        maxConcurrentConnections: 5,
        keepAliveEnabled: false,
        socketBufferSizeKB: 64,
      };
      const mediumSizeKB = 10;

      // Case 4: Connection pooling with large pool
      const largePoolData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: false,
        connectionPoolEnabled: true,
        maxConcurrentConnections: 50,
        keepAliveEnabled: false,
        socketBufferSizeKB: 64,
      };

      // Case 5: Keep-alive enabled
      const keepAliveData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: false,
        connectionPoolEnabled: false,
        keepAliveEnabled: true,
        socketBufferSizeKB: 64,
      };

      // Case 6: Small buffer size
      const smallBufferData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: false,
        connectionPoolEnabled: false,
        keepAliveEnabled: false,
        socketBufferSizeKB: 16,
      };

      // Case 7: Large buffer size
      const largeBufferData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: false,
        connectionPoolEnabled: false,
        keepAliveEnabled: false,
        socketBufferSizeKB: 256,
      };

      // Case 8: Complex combined case (all optimizations)
      const optimizedData: TCPEdgeData = {
        ...baseTCPData,
        nagleAlgorithmEnabled: true,
        connectionPoolEnabled: true,
        maxConcurrentConnections: 50,
        keepAliveEnabled: true,
        socketBufferSizeKB: 256,
      };

      // Act & Assert
      // Case 1: Nagle's algorithm with small packets
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          nagleSmallData,
          smallSizeKB
        )
      ).toBe(baseImpact * 0.8); // 0.5 * 0.8 = 0.4

      // Case 2: Nagle's algorithm with large packets (no effect)
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          nagleLargeData,
          largeSizeKB
        )
      ).toBe(baseImpact); // 0.5 (unchanged)

      // Case 3: Connection pooling with small pool
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          smallPoolData,
          mediumSizeKB
        )
      ).toBe(baseImpact * 0.9); // 0.5 * 0.9 = 0.45

      // Case 4: Connection pooling with large pool
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          largePoolData,
          mediumSizeKB
        )
      ).toBe(baseImpact * 0.9 * 0.9); // 0.5 * 0.9 * 0.9 = 0.405

      // Case 5: Keep-alive enabled
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          keepAliveData,
          mediumSizeKB
        )
      ).toBe(baseImpact * 0.85); // 0.5 * 0.85 = 0.425

      // Case 6: Small buffer size
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          smallBufferData,
          mediumSizeKB
        )
      ).toBe(baseImpact * 1.2); // 0.5 * 1.2 = 0.6

      // Case 7: Large buffer size
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          largeBufferData,
          mediumSizeKB
        )
      ).toBe(baseImpact * 0.9); // 0.5 * 0.9 = 0.45

      // Case 8: Complex combined case with small packets (all optimizations)
      // Nagle (0.8) + Connection Pool (0.9) + Large Pool (0.9) + Keep-Alive (0.85) + Large Buffer (0.9)
      expect(
        requestProcessor.calculateTCPEdgeImpact(
          baseImpact,
          optimizedData,
          smallSizeKB
        )
      ).toBeCloseTo(baseImpact * 0.8 * 0.9 * 0.9 * 0.85 * 0.9); // Complex calculation
    });
    it("should calculate gRPC Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default gRPC data as a base to ensure type safety
      const baseGRPCData: GRPCEdgeData = { ...defaultGRPCEdgeData };

      // Case 1: Unary RPC (no streaming)
      const unaryRPCData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "None",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 2: Server streaming
      const serverStreamData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "Server",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 3: Client streaming
      const clientStreamData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "Client",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 4: Bidirectional streaming
      const bidirectionalStreamData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "Bidirectional",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 5: With channel pooling
      const channelPoolingData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "None",
        channelPooling: true,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 6: With keep-alive
      const keepAliveData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "None",
        channelPooling: false,
        keepAliveEnabled: true,
        loadBalancingPolicy: "Pick-First",
      };

      // Case 7: With Round-Robin load balancing
      const roundRobinData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "None",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Round-Robin",
      };

      // Case 8: With Custom load balancing
      const customLBData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "None",
        channelPooling: false,
        keepAliveEnabled: false,
        loadBalancingPolicy: "Custom",
      };

      // Case 9: Complex combined case (optimized bidirectional)
      const optimizedBidiData: GRPCEdgeData = {
        ...baseGRPCData,
        streaming: "Bidirectional",
        channelPooling: true,
        keepAliveEnabled: true,
        loadBalancingPolicy: "Round-Robin",
      };

      // Act & Assert
      // Case 1: Unary RPC - just basic gRPC overhead
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, unaryRPCData)
      ).toBe(baseImpact * 1.1); // 0.5 * 1.1 = 0.55

      // Case 2: Server streaming
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, serverStreamData)
      ).toBe(baseImpact * 1.1 * 1.2); // 0.5 * 1.1 * 1.2 = 0.66

      // Case 3: Client streaming
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, clientStreamData)
      ).toBe(baseImpact * 1.1 * 1.2); // 0.5 * 1.1 * 1.2 = 0.66

      // Case 4: Bidirectional streaming
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(
          baseImpact,
          bidirectionalStreamData
        )
      ).toBe(baseImpact * 1.1 * 1.5); // 0.5 * 1.1 * 1.5 = 0.825

      // Case 5: With channel pooling
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(
          baseImpact,
          channelPoolingData
        )
      ).toBe(baseImpact * 1.1 * 0.9); // 0.5 * 1.1 * 0.9 = 0.495

      // Case 6: With keep-alive
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, keepAliveData)
      ).toBe(baseImpact * 1.1 * 1.05); // 0.5 * 1.1 * 1.05 = 0.5775

      // Case 7: With Round-Robin load balancing
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, roundRobinData)
      ).toBe(baseImpact * 1.1 * 0.95); // 0.5 * 1.1 * 0.95 = 0.5225

      // Case 8: With Custom load balancing
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, customLBData)
      ).toBe(baseImpact * 1.1 * 1.1); // 0.5 * 1.1 * 1.1 = 0.605

      // Case 9: Complex combined case
      // Bidirectional (1.5) + Channel Pooling (0.9) + Keep-Alive (1.05) + Round-Robin (0.95)
      expect(
        requestProcessor.calculateGRPCEEdgeImpact(baseImpact, optimizedBidiData)
      ).toBeCloseTo(baseImpact * 1.1 * 1.5 * 0.9 * 1.05 * 0.95); // Complex calculation
    });
    it("should calculate WebSocket Edge Impact correctly for various configurations", () => {
      // Arrange
      const baseImpact = 0.5;
      // Use the default WebSocket data as a base to ensure type safety
      const baseWSData: WebSocketEdgeData = { ...defaultWebSocketEdgeData };

      // Case 1: Low message rate
      const lowRateData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5, // Below threshold
        heartbeatEnabled: false,
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 2: Medium message rate
      const mediumRateData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 30,
        heartbeatEnabled: false,
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 3: High message rate
      const highRateData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 150,
        heartbeatEnabled: false,
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 4: With heartbeat (standard interval)
      const heartbeatData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: true,
        heartbeatIntervalMs: 30000, // 30 seconds
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 5: With frequent heartbeat
      const frequentHeartbeatData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: true,
        heartbeatIntervalMs: 5000, // 5 seconds
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 6: Very small messages
      const smallMsgData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: false,
        averageMessageSizeKB: 0.5, // 0.5 KB
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 7: Very large messages
      const largeMsgData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: false,
        averageMessageSizeKB: 200, // 200 KB
        autoReconnect: false,
        subprotocol: "",
      };

      // Case 8: With auto-reconnect
      const reconnectData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: false,
        averageMessageSizeKB: 10,
        autoReconnect: true,
        subprotocol: "",
      };

      // Case 9: With subprotocol
      const subprotocolData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 5,
        heartbeatEnabled: false,
        averageMessageSizeKB: 10,
        autoReconnect: false,
        subprotocol: "chat.example.com",
      };

      // Case 10: Complex high-impact case
      const highImpactData: WebSocketEdgeData = {
        ...baseWSData,
        messageRatePerSecond: 150,
        heartbeatEnabled: true,
        heartbeatIntervalMs: 5000,
        averageMessageSizeKB: 200,
        autoReconnect: true,
        subprotocol: "video.example.com",
      };

      // Act & Assert
      // Case 1: Low message rate - no change
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, lowRateData)
      ).toBe(baseImpact); // 0.5 (unchanged)

      // Case 2: Medium message rate
      const mediumRateMultiplier = 1 + 30 / 100;
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(
          baseImpact,
          mediumRateData
        )
      ).toBe(baseImpact * mediumRateMultiplier); // 0.5 * 1.3 = 0.65

      // Case 3: High message rate (capped at 2x)
      const highRateMultiplier = 1 + Math.min(150 / 100, 1);
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, highRateData)
      ).toBe(baseImpact * highRateMultiplier); // 0.5 * 2 = 1.0

      // Case 4: With heartbeat (standard interval)
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, heartbeatData)
      ).toBe(baseImpact * 1.05); // 0.5 * 1.05 = 0.525

      // Case 5: With frequent heartbeat
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(
          baseImpact,
          frequentHeartbeatData
        )
      ).toBe(baseImpact * 1.1); // 0.5 * 1.1 = 0.55

      // Case 6: Very small messages
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, smallMsgData)
      ).toBe(baseImpact * 1.15); // 0.5 * 1.15 = 0.575

      // Case 7: Very large messages
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, largeMsgData)
      ).toBe(baseImpact * 1.2); // 0.5 * 1.2 = 0.6

      // Case 8: With auto-reconnect
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(baseImpact, reconnectData)
      ).toBe(baseImpact * 1.05); // 0.5 * 1.05 = 0.525

      // Case 9: With subprotocol
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(
          baseImpact,
          subprotocolData
        )
      ).toBe(baseImpact * 1.1); // 0.5 * 1.1 = 0.55

      // Case 10: Complex high-impact case
      // High rate (2x) + Frequent Heartbeat (1.1) + Large Messages (1.2) +
      // Auto-reconnect (1.05) + Subprotocol (1.1)
      expect(
        requestProcessor.calculateWebsocketEdgeImpact(
          baseImpact,
          highImpactData
        )
      ).toBeCloseTo(baseImpact * highRateMultiplier * 1.1 * 1.2 * 1.05 * 1.1); // Complex calculation
    });
    it("should calculate edge utilization impact correctly for different edge types", () => {
      // Arrange
      const baseRequest = createRequest("req1", "Read", "node1", "node2", 10);

      // Create different types of edges to test
      const httpEdge = createEdge(EdgeType.HTTP, "node1", "node2");
      const tcpEdge = createEdge(EdgeType.TCP, "node1", "node2");
      const wsEdge = createEdge(EdgeType.WebSocket, "node1", "node2");

      // Mock the specific edge impact calculation functions
      vi.spyOn(requestProcessor, "calculateHTTPEdgeImpact").mockReturnValue(
        0.05
      );
      vi.spyOn(requestProcessor, "calculateTCPEdgeImpact").mockReturnValue(
        0.04
      );
      vi.spyOn(
        requestProcessor,
        "calculateWebsocketEdgeImpact"
      ).mockReturnValue(0.06);

      // Add edge-specific data variations
      const secureEdge = createEdge(
        EdgeType.HTTP,
        "node1",
        "node2"
      ) as HTTPEdge;
      const httpData: HTTPEdgeData = secureEdge.data!;
      secureEdge.data = {
        ...httpData,
        encryption: "End-to-End",
        authentication: "OAuth",
      };

      const highLatencyEdge = createEdge(
        EdgeType.HTTP,
        "node1",
        "node2"
      ) as HTTPEdge;
      const highLatencyEdgeData: HTTPEdgeData = highLatencyEdge.data!;
      highLatencyEdge.data = {
        ...highLatencyEdgeData,
        latencyMs: 110, // High latency
      };

      const compressedEdge = createEdge(
        EdgeType.HTTP,
        "node1",
        "node2"
      ) as HTTPEdge;
      const compressEdgeData: HTTPEdgeData = compressedEdge.data!;
      compressedEdge.data = {
        ...compressEdgeData,
        compressionEnabled: true,
      };

      // Act & Assert
      // Test different edge types
      expect(
        requestProcessor.calculateEdgeUtilizationImpact(baseRequest, httpEdge)
      ).toBeLessThanOrEqual(0.2); // Should be capped

      expect(
        requestProcessor.calculateEdgeUtilizationImpact(baseRequest, tcpEdge)
      ).toBeLessThanOrEqual(0.2);

      expect(
        requestProcessor.calculateEdgeUtilizationImpact(baseRequest, wsEdge)
      ).toBeLessThanOrEqual(0.2);

      // Test edge data variations
      const secureImpact = requestProcessor.calculateEdgeUtilizationImpact(
        baseRequest,
        secureEdge
      );
      const standardImpact = requestProcessor.calculateEdgeUtilizationImpact(
        baseRequest,
        httpEdge
      );
      expect(secureImpact).toBeGreaterThan(standardImpact); // Security should increase impact

      const highLatencyImpact = requestProcessor.calculateEdgeUtilizationImpact(
        baseRequest,
        highLatencyEdge
      );
      expect(highLatencyImpact).toBeGreaterThanOrEqual(standardImpact); // High latency should increase impact

      const compressedImpact = requestProcessor.calculateEdgeUtilizationImpact(
        baseRequest,
        compressedEdge
      );
      expect(compressedImpact).toBeLessThan(standardImpact); // Compression should decrease impact

      // Test request size scaling
      const largeRequest = { ...baseRequest, sizeKB: 1000 };
      const largeRequestImpact =
        requestProcessor.calculateEdgeUtilizationImpact(largeRequest, httpEdge);
      const smallRequestImpact =
        requestProcessor.calculateEdgeUtilizationImpact(baseRequest, httpEdge);
      expect(largeRequestImpact).toBeGreaterThan(smallRequestImpact); // Larger requests should have more impact
    });
  });

  describe("calculateNodeUtilizationImpact", () => {
    // Create sample requests of different sizes
    const smallRequest = createRequest(
      "req1",
      "Read",
      "client1",
      "server1",
      10
    );
    const mediumRequest = createRequest(
      "req2",
      "Write",
      "client1",
      "server1",
      100
    );
    const largeRequest = createRequest(
      "req3",
      "Transaction",
      "client1",
      "server1",
      1000
    );
    const computeRequest = createRequest(
      "req4",
      "Compute",
      "client1",
      "server1",
      50
    );

    describe("for client nodes", () => {
      it("should calculate impact based on client device and network properties", () => {
        // Create different client nodes
        const basicClient = createNode(NodeType.Client, "Basic Client", {
          x: 0,
          y: 0,
        });
        basicClient.data = {
          ...basicClient.data,
          devicePerformance: "Medium",
          bandwidthLimit: 100,
          connectionType: "WiFi",
          clientType: "Browser",
          networkStability: 0.9,
          packetLossRate: 0.01,
          authenticationMethod: "Basic",
          geographicDistribution: ["Europe"],
          connectionPersistence: false,
        };

        const mobileClient = createNode(NodeType.Client, "Mobile Client", {
          x: 0,
          y: 0,
        });
        mobileClient.data = {
          ...mobileClient.data,
          devicePerformance: "Low",
          bandwidthLimit: 20,
          connectionType: "Cellular",
          clientType: "Mobile App",
          networkStability: 0.6,
          packetLossRate: 0.05,
          authenticationMethod: "OAuth",
          geographicDistribution: ["Europe", "Asia"],
          connectionPersistence: true,
          reconnectAttempts: 3,
        };

        // Test different client configurations
        const basicClientImpact =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            basicClient
          );
        const mobileClientImpact =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            mobileClient
          );

        // Mobile client should have higher impact due to constraints
        expect(mobileClientImpact).toBeGreaterThan(basicClientImpact);

        // All impacts should be capped
        expect(basicClientImpact).toBeLessThanOrEqual(0.1);
        expect(mobileClientImpact).toBeLessThanOrEqual(0.1);
      });
    });

    describe("for server nodes", () => {
      it("should calculate impact based on server capacity and configuration", () => {
        // Create different server nodes
        const powerfulServer = createNode(NodeType.Server, "Powerful Server", {
          x: 0,
          y: 0,
        });
        powerfulServer.data = {
          ...powerfulServer.data,
          cpuCores: 32,
          maxConcurrentRequests: 10000,
          cpuSpeed: 3.5,
          memory: 64,
          maxRequestsPerSecond: 5000,
          concurrencyModel: "Multi-Threaded",
          restartPolicy: "Never",
          deploymentType: "Bare Metal",
          scalingMetric: "Requests",
          instances: 5,
          authenticationRequired: false,
        };

        const lightweightServer = createNode(
          NodeType.Server,
          "Lightweight Server",
          { x: 0, y: 0 }
        );
        lightweightServer.data = {
          ...lightweightServer.data,
          cpuCores: 2,
          maxConcurrentRequests: 200,
          cpuSpeed: 2.0,
          memory: 4,
          maxRequestsPerSecond: 500,
          concurrencyModel: "Single-Threaded",
          restartPolicy: "Always",
          deploymentType: "Container",
          scalingMetric: "CPU",
          instances: 1,
          authenticationRequired: true,
        };

        // Test with different request types
        const smallRequestImpactPowerful =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            powerfulServer
          );
        const smallRequestImpactLight =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            lightweightServer
          );
        const computeRequestImpactLight =
          requestProcessor.calculateNodeUtilizationImpact(
            computeRequest,
            lightweightServer
          );

        // Lightweight server should have higher impact
        expect(smallRequestImpactLight).toBeGreaterThan(
          smallRequestImpactPowerful
        );

        // Compute requests should have higher impact on CPU-scaled servers
        expect(computeRequestImpactLight).toBeGreaterThan(
          smallRequestImpactLight
        );

        // All impacts should be capped
        expect(smallRequestImpactPowerful).toBeLessThanOrEqual(0.1);
        expect(smallRequestImpactLight).toBeLessThanOrEqual(0.1);
        expect(computeRequestImpactLight).toBeLessThanOrEqual(0.1);
      });
    });

    describe("for database nodes", () => {
      it("should calculate impact based on database type and query complexity", () => {
        // Mock Math.random for deterministic tests
        const originalRandom = Math.random;
        Math.random = vi.fn().mockReturnValue(0.5);

        // Create different database nodes
        const sqlDatabase = createNode(NodeType.Database, "SQL Database", {
          x: 0,
          y: 0,
        });
        sqlDatabase.data = {
          ...sqlDatabase.data,
          dbType: "SQL",
          queryComplexity: "Complex",
          maxConnections: 200,
          readWriteRatio: 0.7,
          replication: false,
          storageCapacity: 1000,
          averageLatency: 10,
          backupStrategy: "Daily",
        };

        const noSqlDatabase = createNode(NodeType.Database, "NoSQL Database", {
          x: 0,
          y: 0,
        });
        noSqlDatabase.data = {
          ...noSqlDatabase.data,
          dbType: "NoSQL",
          queryComplexity: "Simple",
          maxConnections: 500,
          readWriteRatio: 0.9,
          replication: true,
          storageCapacity: 5000,
          averageLatency: 3,
          backupStrategy: "None",
        };

        // Test with different request types
        const readImpactSQL = requestProcessor.calculateNodeUtilizationImpact(
          smallRequest,
          sqlDatabase
        );
        const writeImpactSQL = requestProcessor.calculateNodeUtilizationImpact(
          mediumRequest,
          sqlDatabase
        );
        const readImpactNoSQL = requestProcessor.calculateNodeUtilizationImpact(
          smallRequest,
          noSqlDatabase
        );

        // SQL with complex queries should have higher impact
        expect(readImpactSQL).toBeGreaterThan(readImpactNoSQL);

        // Write requests should have different impact than reads
        expect(writeImpactSQL).not.toEqual(readImpactSQL);

        // All impacts should be capped
        expect(readImpactSQL).toBeLessThanOrEqual(0.1);
        expect(writeImpactSQL).toBeLessThanOrEqual(0.1);
        expect(readImpactNoSQL).toBeLessThanOrEqual(0.1);

        // Restore original Math.random
        Math.random = originalRandom;
      });
    });

    describe("for load balancer nodes", () => {
      it("should calculate impact based on load balancer configuration", () => {
        // Mock Math.random for deterministic tests
        const originalRandom = Math.random;
        Math.random = vi.fn().mockReturnValue(0.5);

        // Create different load balancer nodes
        const networkLB = createNode(NodeType.LoadBalancer, "Network LB", {
          x: 0,
          y: 0,
        });
        networkLB.data = {
          ...networkLB.data,
          maxThroughput: 10000,
          algorithm: "Round Robin",
          sslTermination: false,
          contentBasedRouting: false,
          loadBalancerType: "Network",
          sessionPersistence: false,
          maxConnections: 50000,
          processingLatency: 2,
          healthCheckEnabled: true,
          healthCheckInterval: 30,
        };

        const applicationLB = createNode(
          NodeType.LoadBalancer,
          "Application LB",
          { x: 0, y: 0 }
        );
        applicationLB.data = {
          ...applicationLB.data,
          maxThroughput: 5000,
          algorithm: "Least Connections",
          sslTermination: true,
          contentBasedRouting: true,
          loadBalancerType: "Application",
          sessionPersistence: true,
          sessionTimeout: 5,
          maxConnections: 10000,
          processingLatency: 15,
          healthCheckEnabled: true,
          healthCheckInterval: 5,
        };

        // Test with different request sizes
        const smallRequestNetworkLB =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            networkLB
          );
        const smallRequestAppLB =
          requestProcessor.calculateNodeUtilizationImpact(
            smallRequest,
            applicationLB
          );
        const largeRequestAppLB =
          requestProcessor.calculateNodeUtilizationImpact(
            largeRequest,
            applicationLB
          );

        // Application LB should have higher impact than Network LB
        expect(smallRequestAppLB).toBeGreaterThan(smallRequestNetworkLB);

        // Larger requests should have higher impact
        expect(largeRequestAppLB).toBeGreaterThan(smallRequestAppLB);

        // All impacts should be capped
        expect(smallRequestNetworkLB).toBeLessThanOrEqual(0.1);
        expect(smallRequestAppLB).toBeLessThanOrEqual(0.1);
        expect(largeRequestAppLB).toBeLessThanOrEqual(0.1);

        // Restore original Math.random
        Math.random = originalRandom;
      });
    });

    describe("for cache nodes", () => {
      it("should calculate impact based on cache configuration and hit rate", () => {
        // Mock Math.random for deterministic tests
        const originalRandom = Math.random;

        // For cache hit test - make sure we're below expectedHitRate
        Math.random = vi.fn().mockReturnValue(0.5); // Below 0.8 threshold = cache HIT

        // Create cache node
        const distributedCache = createNode(
          NodeType.Cache,
          "Distributed Cache",
          { x: 0, y: 0 }
        );
        distributedCache.data = {
          ...distributedCache.data,
          expectedHitRate: 0.8,
          cacheType: "Distributed",
          evictionPolicy: "LRU",
          cacheSizeValue: 10,
          cacheSizeUnit: "GB",
          averageItemSize: 5,
          consistencyLevel: "Strong",
          replicationEnabled: true,
          replicaCount: 3,
          shardingEnabled: true,
          shardCount: 4,
          autoScalingEnabled: true,
        };

        // Test with cache hit
        const cacheHitImpact = requestProcessor.calculateNodeUtilizationImpact(
          smallRequest,
          distributedCache
        );

        // Change mock for cache miss test - make sure we're above expectedHitRate
        Math.random = vi.fn().mockReturnValue(0.9); // Above 0.8 threshold = cache MISS

        // Test with cache miss
        const cacheMissImpact = requestProcessor.calculateNodeUtilizationImpact(
          smallRequest,
          distributedCache
        );

        // Log values to debug
        console.log("Cache HIT impact:", cacheHitImpact);
        console.log("Cache MISS impact:", cacheMissImpact);

        // Cache miss should have higher impact
        expect(cacheMissImpact).toBeGreaterThan(cacheHitImpact);

        // Test write operations with replication
        const writeImpact = requestProcessor.calculateNodeUtilizationImpact(
          mediumRequest,
          distributedCache
        );

        // All impacts should be capped
        expect(cacheHitImpact).toBeLessThanOrEqual(0.1);
        expect(cacheMissImpact).toBeLessThanOrEqual(0.1);
        expect(writeImpact).toBeLessThanOrEqual(0.1);

        // Restore original Math.random
        Math.random = originalRandom;
      });
    });
  });
  describe("calculateRequiredProcessingTime", () => {
    // Store original Math.random
    const originalRandom = Math.random;

    // Create sample requests of different types
    const readRequest = createRequest("req1", "Read", "client1", "server1", 10);
    const writeRequest = createRequest(
      "req2",
      "Write",
      "client1",
      "server1",
      10
    );
    const computeRequest = createRequest(
      "req3",
      "Compute",
      "client1",
      "server1",
      10
    );
    const transactionRequest = createRequest(
      "req4",
      "Transaction",
      "client1",
      "server1",
      10
    );

    beforeEach(() => {
      // Mock Math.random for deterministic tests
      Math.random = vi.fn().mockReturnValue(0.5);
    });

    afterEach(() => {
      // Restore original Math.random
      Math.random = originalRandom;
    });

    describe("for server nodes", () => {
      it("should calculate processing time based on server configuration and request type", () => {
        // Create server node
        const server = createNode(NodeType.Server, "Test Server", {
          x: 0,
          y: 0,
        });
        server.data = {
          ...server.data,
          averageProcessingTime: 30,
        };

        // Calculate processing times for different request types
        const readTime = requestProcessor.calculateRequiredProcessingTime(
          server,
          readRequest
        );
        const computeTime = requestProcessor.calculateRequiredProcessingTime(
          server,
          computeRequest
        );

        // Compute requests should take longer
        expect(computeTime).toBeGreaterThan(readTime);

        // With Math.random mocked to 0.5, we can calculate expected values
        // readTime = 30 * (0.8 + 0.5 * 0.4) = 30 * 1 = 30
        // computeTime = 30 * 1.5 * (0.8 + 0.5 * 0.4) = 45 * 1 = 45
        expect(readTime).toBeCloseTo(30);
        expect(computeTime).toBeCloseTo(45);
      });
    });

    describe("for database nodes", () => {
      it("should calculate processing time based on database configuration and request type", () => {
        // Create database node
        const database = createNode(NodeType.Database, "Test Database", {
          x: 0,
          y: 0,
        });
        database.data = {
          ...database.data,
          averageLatency: 25,
        };

        // Calculate processing times for different request types
        const readTime = requestProcessor.calculateRequiredProcessingTime(
          database,
          readRequest
        );
        const writeTime = requestProcessor.calculateRequiredProcessingTime(
          database,
          writeRequest
        );
        const transactionTime =
          requestProcessor.calculateRequiredProcessingTime(
            database,
            transactionRequest
          );

        // Write and transaction requests should take longer
        expect(writeTime).toBeGreaterThan(readTime);
        expect(transactionTime).toBeGreaterThan(writeTime);

        // With Math.random mocked to 0.5, we can calculate expected values
        // readTime = 25 * (0.8 + 0.5 * 0.4) = 25 * 1 = 25
        // writeTime = 25 * 1.5 * (0.8 + 0.5 * 0.4) = 37.5 * 1 = 37.5
        // transactionTime = 25 * 2 * (0.8 + 0.5 * 0.4) = 50 * 1 = 50
        expect(readTime).toBeCloseTo(25);
        expect(writeTime).toBeCloseTo(37.5);
        expect(transactionTime).toBeCloseTo(50);
      });
    });

    describe("for cache nodes", () => {
      it("should calculate processing time based on cache hit/miss and write policy", () => {
        // Create cache node
        const cache = createNode(NodeType.Cache, "Test Cache", {
          x: 0,
          y: 0,
        }) as CacheNode;
        cache.data = {
          ...cache.data,
          averageLatency: 10,
          expectedHitRate: 0.8,
          writePolicy: "Write-Through",
        };

        // Test cache hit scenario
        const mockHit = vi.fn().mockReturnValue(0.5); // Below expectedHitRate = HIT
        Math.random = mockHit;
        const readTimeHit = requestProcessor.calculateRequiredProcessingTime(
          cache,
          readRequest
        );

        // Test cache miss scenario - use a new mock instance
        const mockMiss = vi.fn().mockReturnValue(0.9); // Above expectedHitRate = MISS
        Math.random = mockMiss;
        const readTimeMiss = requestProcessor.calculateRequiredProcessingTime(
          cache,
          readRequest
        );

        // Test the write policy scenarios with misses to see the policy effects
        // Write-Through - force a miss
        const mockWriteThrough = vi.fn().mockReturnValue(0.9); // MISS
        Math.random = mockWriteThrough;
        cache.data.writePolicy = "Write-Through";
        const writeThroughTime =
          requestProcessor.calculateRequiredProcessingTime(cache, writeRequest);

        // Write-Behind - force a miss
        const mockWriteBehind = vi.fn().mockReturnValue(0.9); // MISS
        Math.random = mockWriteBehind;
        cache.data.writePolicy = "Write-Behind";
        const writeBehindTime =
          requestProcessor.calculateRequiredProcessingTime(cache, writeRequest);

        // Write-Around - force a miss
        const mockWriteAround = vi.fn().mockReturnValue(0.9); // MISS
        Math.random = mockWriteAround;
        cache.data.writePolicy = "Write-Around";
        const writeAroundTime =
          requestProcessor.calculateRequiredProcessingTime(cache, writeRequest);

        // Cache miss should take longer than cache hit
        expect(readTimeMiss).toBeGreaterThan(readTimeHit);

        // Write-Behind should be faster than Write-Around, which should be faster than Write-Through
        expect(writeBehindTime).toBeLessThan(writeAroundTime);
        expect(writeAroundTime).toBeLessThan(writeThroughTime);

        // Cache hit should have fixed time of 3ms
        expect(readTimeHit).toBeCloseTo(3);

        // Verify our mocks were called correctly
        expect(mockHit).toHaveBeenCalled();
        expect(mockMiss).toHaveBeenCalled();
        expect(mockWriteThrough).toHaveBeenCalled();
        expect(mockWriteBehind).toHaveBeenCalled();
        expect(mockWriteAround).toHaveBeenCalled();
      });
    });

    describe("for load balancer nodes", () => {
      it("should calculate processing time based on load balancer type and features", () => {
        // Create different load balancer nodes
        const networkLB = createNode(NodeType.LoadBalancer, "Network LB", {
          x: 0,
          y: 0,
        }) as LoadBalancerNode;
        networkLB.data = {
          ...networkLB.data,
          loadBalancerType: "Network",
          sessionPersistence: false,
          contentBasedRouting: false,
        };

        const applicationLB = createNode(
          NodeType.LoadBalancer,
          "Application LB",
          { x: 0, y: 0 }
        ) as LoadBalancerNode;
        applicationLB.data = {
          ...applicationLB.data,
          loadBalancerType: "Application",
          sessionPersistence: true,
          contentBasedRouting: false,
        };

        const gatewayLB = createNode(NodeType.LoadBalancer, "Gateway LB", {
          x: 0,
          y: 0,
        }) as LoadBalancerNode;
        gatewayLB.data = {
          ...gatewayLB.data,
          loadBalancerType: "Gateway",
          sessionPersistence: true,
          contentBasedRouting: true,
        };

        const customLB = createNode(NodeType.LoadBalancer, "Custom LB", {
          x: 0,
          y: 0,
        });
        customLB.data = {
          ...customLB.data,
          loadBalancerType: "Application",
          sessionPersistence: false,
          contentBasedRouting: false,
          processingLatency: 15, // Explicit value
        };

        // Calculate processing times
        const networkTime = requestProcessor.calculateRequiredProcessingTime(
          networkLB,
          readRequest
        );
        const applicationTime =
          requestProcessor.calculateRequiredProcessingTime(
            applicationLB,
            readRequest
          );
        const gatewayTime = requestProcessor.calculateRequiredProcessingTime(
          gatewayLB,
          readRequest
        );
        const customTime = requestProcessor.calculateRequiredProcessingTime(
          customLB,
          readRequest
        );

        // Network LB should be fastest, Gateway LB should be slowest
        expect(networkTime).toBeLessThan(applicationTime);
        expect(applicationTime).toBeLessThan(gatewayTime);

        // Custom processing latency should override default
        expect(customTime).toBeCloseTo(15);

        // Session persistence and content-based routing should add time
        const appLBWithContent = createNode(
          NodeType.LoadBalancer,
          "App LB with Content",
          { x: 0, y: 0 }
        );
        appLBWithContent.data = {
          ...applicationLB.data,
          contentBasedRouting: true,
        };

        const appLBWithContentTime =
          requestProcessor.calculateRequiredProcessingTime(
            appLBWithContent,
            readRequest
          );
        expect(appLBWithContentTime).toBeGreaterThan(applicationTime);
      });
    });
  });
  describe("calculateFailureProbability", () => {
    // Sample time step (in ms)
    const timeStep = 1000; // 1 second

    describe("for server nodes", () => {
      it("should calculate failure probability based on server configuration", () => {
        // Create different server nodes
        const basicServer = createNode(NodeType.Server, "Basic Server", {
          x: 0,
          y: 0,
        });
        basicServer.data = {
          ...basicServer.data,
          failureProbability: 0.002, // 0.2% base failure rate
          restartPolicy: "OnFailure",
          deploymentType: "Container",
          scalingMetric: "Requests",
        };

        const reliableServer = createNode(NodeType.Server, "Reliable Server", {
          x: 0,
          y: 0,
        });
        reliableServer.data = {
          ...reliableServer.data,
          failureProbability: 0.002, // Same base rate
          restartPolicy: "Always",
          deploymentType: "Bare Metal",
          scalingMetric: "CPU",
        };

        const memoryScaledServer = createNode(
          NodeType.Server,
          "Memory Scaled Server",
          { x: 0, y: 0 }
        );
        memoryScaledServer.data = {
          ...memoryScaledServer.data,
          failureProbability: 0.002, // Same base rate
          restartPolicy: "Always",
          deploymentType: "Bare Metal",
          scalingMetric: "Memory", // Higher failure probability
        };

        // Calculate failure probabilities
        const basicFailure = requestProcessor.calculateFailureProbability(
          basicServer,
          timeStep
        );
        const reliableFailure = requestProcessor.calculateFailureProbability(
          reliableServer,
          timeStep
        );
        const memoryScaledFailure =
          requestProcessor.calculateFailureProbability(
            memoryScaledServer,
            timeStep
          );

        // Reliable server should have lower failure probability
        expect(reliableFailure).toBeLessThan(basicFailure);

        // Memory scaled server should have higher failure probability than CPU scaled
        expect(memoryScaledFailure).toBeGreaterThan(reliableFailure);

        // Check against expected values (can calculate based on the modifiers in the function)
        // Basic server: 0.002 * timeStep / 1000 = 0.002 * 1 = 0.002
        expect(basicFailure).toBeCloseTo(0.002);

        // Reliable server: 0.002 * 0.5 (restart) * 0.8 (bare metal) * 0.9 (CPU scaling) * timeStep / 1000
        // = 0.002 * 0.5 * 0.8 * 0.9 * 1 = 0.002 * 0.36 = 0.00072
        expect(reliableFailure).toBeCloseTo(0.00072);

        // Memory scaled server: 0.002 * 0.5 (restart) * 0.8 (bare metal) * 1.1 (Memory scaling) * timeStep / 1000
        // = 0.002 * 0.5 * 0.8 * 1.1 * 1 = 0.002 * 0.44 = 0.00088
        expect(memoryScaledFailure).toBeCloseTo(0.00088);
      });
    });

    describe("for database nodes", () => {
      it("should calculate failure probability based on database configuration", () => {
        // Create different database nodes
        const noBackupDB = createNode(NodeType.Database, "No Backup DB", {
          x: 0,
          y: 0,
        });
        noBackupDB.data = {
          ...noBackupDB.data,
          failureProbability: 0.003,
          backupStrategy: "None",
        };

        const periodicBackupDB = createNode(
          NodeType.Database,
          "Periodic Backup DB",
          { x: 0, y: 0 }
        );
        periodicBackupDB.data = {
          ...periodicBackupDB.data,
          failureProbability: 0.003,
          backupStrategy: "Daily",
        };

        const continuousBackupDB = createNode(
          NodeType.Database,
          "Continuous Backup DB",
          { x: 0, y: 0 }
        );
        continuousBackupDB.data = {
          ...continuousBackupDB.data,
          failureProbability: 0.003,
          backupStrategy: "Continuous",
        };

        // Calculate failure probabilities
        const noBackupFailure = requestProcessor.calculateFailureProbability(
          noBackupDB,
          timeStep
        );
        const periodicBackupFailure =
          requestProcessor.calculateFailureProbability(
            periodicBackupDB,
            timeStep
          );
        const continuousBackupFailure =
          requestProcessor.calculateFailureProbability(
            continuousBackupDB,
            timeStep
          );

        // No backup should have highest failure probability
        expect(noBackupFailure).toBeGreaterThan(periodicBackupFailure);

        // Continuous backup should have lowest failure probability
        expect(continuousBackupFailure).toBeLessThan(periodicBackupFailure);

        // Check against expected values
        // No backup: 0.003 * 1.2 * timeStep / 1000 = 0.003 * 1.2 * 1 = 0.0036
        expect(noBackupFailure).toBeCloseTo(0.0036);

        // Periodic backup: 0.003 * timeStep / 1000 = 0.003 * 1 = 0.003
        expect(periodicBackupFailure).toBeCloseTo(0.003);

        // Continuous backup: 0.003 * 0.8 * timeStep / 1000 = 0.003 * 0.8 * 1 = 0.0024
        expect(continuousBackupFailure).toBeCloseTo(0.0024);
      });
    });

    describe("for load balancer nodes", () => {
      it("should calculate failure probability based on load balancer configuration", () => {
        // Create different load balancer nodes
        const basicLB = createNode(NodeType.LoadBalancer, "Basic LB", {
          x: 0,
          y: 0,
        });
        basicLB.data = {
          ...basicLB.data,
          failureProbability: 0.001,
          loadBalancerType: "Classic",
          connectToAutoScaling: false,
          healthCheckEnabled: false,
          highAvailability: false,
        };

        const networkLB = createNode(NodeType.LoadBalancer, "Network LB", {
          x: 0,
          y: 0,
        });
        networkLB.data = {
          ...networkLB.data,
          failureProbability: 0.001,
          loadBalancerType: "Network",
          connectToAutoScaling: true,
          healthCheckEnabled: true,
          healthCheckInterval: 5,
          healthyThreshold: 2,
          unhealthyThreshold: 2,
          highAvailability: true,
          failoverStrategy: "Active-Active",
        };

        const applicationLB = createNode(
          NodeType.LoadBalancer,
          "Application LB",
          { x: 0, y: 0 }
        );
        applicationLB.data = {
          ...applicationLB.data,
          failureProbability: 0.001,
          loadBalancerType: "Application",
          connectToAutoScaling: false,
          healthCheckEnabled: false,
          highAvailability: false,
        };

        // Calculate failure probabilities
        const basicFailure = requestProcessor.calculateFailureProbability(
          basicLB,
          timeStep
        );

        const applicationFailure = requestProcessor.calculateFailureProbability(
          applicationLB,
          timeStep
        );

        // Application LB should have higher failure rate than basic (1.1x multiplier)
        expect(applicationFailure).toBeGreaterThan(basicFailure);
      });
    });

    describe("for cache nodes", () => {
      it("should calculate failure probability based on cache configuration", () => {
        // Create different cache nodes
        const basicCache = createNode(NodeType.Cache, "Basic Cache", {
          x: 0,
          y: 0,
        });
        basicCache.data = {
          ...basicCache.data,
          failureProbability: 0.002,
          replicationEnabled: false,
          shardingEnabled: false,
        };

        const replicatedCache = createNode(NodeType.Cache, "Replicated Cache", {
          x: 0,
          y: 0,
        });
        replicatedCache.data = {
          ...replicatedCache.data,
          failureProbability: 0.002,
          replicationEnabled: true,
          replicaCount: 3,
          shardingEnabled: false,
        };

        const shardedCache = createNode(NodeType.Cache, "Sharded Cache", {
          x: 0,
          y: 0,
        });
        shardedCache.data = {
          ...shardedCache.data,
          failureProbability: 0.002,
          replicationEnabled: false,
          shardingEnabled: true,
        };

        const fullResillientCache = createNode(
          NodeType.Cache,
          "Fully Resilient Cache",
          { x: 0, y: 0 }
        );
        fullResillientCache.data = {
          ...fullResillientCache.data,
          failureProbability: 0.002,
          replicationEnabled: true,
          replicaCount: 3,
          shardingEnabled: true,
        };

        // Calculate failure probabilities
        const basicFailure = requestProcessor.calculateFailureProbability(
          basicCache,
          timeStep
        );
        const replicatedFailure = requestProcessor.calculateFailureProbability(
          replicatedCache,
          timeStep
        );
        const shardedFailure = requestProcessor.calculateFailureProbability(
          shardedCache,
          timeStep
        );
        const resilientFailure = requestProcessor.calculateFailureProbability(
          fullResillientCache,
          timeStep
        );

        // Replicated should have lower failure rate
        expect(replicatedFailure).toBeLessThan(basicFailure);

        // Sharded should have lower failure rate
        expect(shardedFailure).toBeLessThan(basicFailure);

        // Fully resilient should have lowest failure rate
        expect(resilientFailure).toBeLessThan(replicatedFailure);
        expect(resilientFailure).toBeLessThan(shardedFailure);

        // Expected values:
        // Basic: 0.002 * timeStep / 1000 = 0.002 * 1 = 0.002
        expect(basicFailure).toBeCloseTo(0.002);

        // Replicated: 0.002 * (1/3) * timeStep / 1000 = 0.002 * 0.333 * 1 = 0.000666
        expect(replicatedFailure).toBeCloseTo(0.000667, 5);

        // Sharded: 0.002 * 0.8 * timeStep / 1000 = 0.002 * 0.8 * 1 = 0.0016
        expect(shardedFailure).toBeCloseTo(0.0016);

        // Resilient: 0.002 * (1/3) * 0.8 * timeStep / 1000 = 0.002 * 0.333 * 0.8 * 1 = 0.000533
        expect(resilientFailure).toBeCloseTo(0.000533, 5);
      });
    });

    describe("for client nodes", () => {
      it("should calculate failure probability based on client configuration", () => {
        // Create different client nodes
        const basicClient = createNode(NodeType.Client, "Basic Client", {
          x: 0,
          y: 0,
        });
        basicClient.data = {
          ...basicClient.data,
          connectionPersistence: false,
          reconnectAttempts: 0,
        };

        const persistentClient = createNode(
          NodeType.Client,
          "Persistent Client",
          { x: 0, y: 0 }
        );
        persistentClient.data = {
          ...persistentClient.data,
          connectionPersistence: true,
          reconnectAttempts: 0,
        };

        const reconnectingClient = createNode(
          NodeType.Client,
          "Reconnecting Client",
          { x: 0, y: 0 }
        );
        reconnectingClient.data = {
          ...reconnectingClient.data,
          connectionPersistence: true,
          reconnectAttempts: 3,
        };

        // Calculate failure probabilities
        const basicFailure = requestProcessor.calculateFailureProbability(
          basicClient,
          timeStep
        );
        const persistentFailure = requestProcessor.calculateFailureProbability(
          persistentClient,
          timeStep
        );
        const reconnectingFailure =
          requestProcessor.calculateFailureProbability(
            reconnectingClient,
            timeStep
          );

        // Persistent client should have lower failure rate
        expect(persistentFailure).toBeLessThan(basicFailure);

        // Reconnecting client should have even lower failure rate
        expect(reconnectingFailure).toBeLessThan(persistentFailure);

        // Expected values (using default 0.001 failure rate for clients):
        // Basic: 0.001 * timeStep / 1000 = 0.001 * 1 = 0.001
        expect(basicFailure).toBeCloseTo(0.001);

        // Persistent: 0.001 * 0.8 * timeStep / 1000 = 0.001 * 0.8 * 1 = 0.0008
        expect(persistentFailure).toBeCloseTo(0.0008);

        // Reconnecting: 0.001 * 0.8 * (1/3) * timeStep / 1000 = 0.001 * 0.8 * 0.333 * 1 = 0.000267
        expect(reconnectingFailure).toBeCloseTo(0.000267, 5);
      });
    });

    describe("time step adjustment", () => {
      it("should scale failure probability based on time step", () => {
        // Create a simple node
        const server = createNode(NodeType.Server, "Test Server", {
          x: 0,
          y: 0,
        }) as ServerNode;
        server.data.failureProbability = 0.01; // 1% base failure rate

        // Test with different time steps
        const oneSecondStep = 1000; // 1 second
        const halfSecondStep = 500; // 0.5 seconds
        const twoSecondStep = 2000; // 2 seconds

        const oneSecondFailure = requestProcessor.calculateFailureProbability(
          server,
          oneSecondStep
        );
        const halfSecondFailure = requestProcessor.calculateFailureProbability(
          server,
          halfSecondStep
        );
        const twoSecondFailure = requestProcessor.calculateFailureProbability(
          server,
          twoSecondStep
        );

        // Failure probability should scale linearly with time step
        expect(halfSecondFailure).toBeCloseTo(0.005);

        // Verify the relationship
        expect(oneSecondFailure).toBeCloseTo(halfSecondFailure * 2);
        expect(twoSecondFailure).toBeCloseTo(oneSecondFailure * 2);
      });
    });
  });
  describe("processRequest", () => {
    // Constants from your implementation
    const MAX_REQUEST_LIFETIME = 10000; // 10 seconds
    const FAILURE_CHANCE_NODE_OVERLOAD = 0.3; // 30% chance to fail on overload

    // Mock dependencies
    beforeEach(() => {
      // Mock router
      vi.spyOn(requestRouter, "determineNextNode");

      // Mock utilization methods
      vi.spyOn(requestProcessor, "increaseNodeUtilization").mockImplementation(
        () => {}
      );
      vi.spyOn(requestProcessor, "decreaseNodeUtilization").mockImplementation(
        () => {}
      );
      vi.spyOn(requestProcessor, "increaseEdgeUtilization").mockImplementation(
        () => {}
      );
      vi.spyOn(requestProcessor, "decreaseEdgeUtilization").mockImplementation(
        () => {}
      );
      vi.spyOn(requestProcessor, "isNodeOverloaded");
      vi.spyOn(requestProcessor, "isEdgeOverloaded");
      vi.spyOn(requestProcessor, "calculateFailureProbability");
      vi.spyOn(requestProcessor, "calculateRequiredProcessingTime");
      vi.spyOn(
        requestProcessor,
        "applyRequiredProcessingTimePenalty"
      ).mockImplementation((req) => req);

      // Mock Math.random
      vi.spyOn(Math, "random").mockImplementation(() => 0.5); // Middle value to avoid triggering random failures
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe("Request timeout handling", () => {
      it("should fail a request that exceeds maximum lifetime", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is about to time out
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.createdAt = 0;
        const elapsedTime = MAX_REQUEST_LIFETIME + 1; // Just over the timeout

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          100, // timeStep
          elapsedTime,
          utilization
        );

        // Assert
        expect(result.status).toBe("failed");
        expect(result.failureReason).toBe(
          "Timeout - exceeded maximum lifetime"
        );
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Request retry handling", () => {
      it("should fail a request that exceeds maximum retries", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that has exceeded max retries
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.maxRetries = 3;
        request.processingData.retryCount = 4; // Exceed max retries

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          100, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("failed");
        expect(result.failureReason).toBe("Exceeded maximum retry attempts");
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Current node handling", () => {
      it("should fail if current node is not found", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request with non-existent node ID
        const request = createRequest(
          "req1",
          "Read",
          "non-existent-id",
          nodes[0].id
        );

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          100, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("failed");
        expect(result.failureReason).toBe("Current node not found");
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Processing at current node", () => {
      it("should continue processing when more time is needed", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is still processing
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.processingData.processingTime = 10;
        request.processingData.requiredProcessingTime = 50;

        // Configure mock behavior
        vi.spyOn(requestProcessor, "isNodeOverloaded").mockImplementation(
          () => false
        );
        vi.spyOn(
          requestProcessor,
          "calculateFailureProbability"
        ).mockImplementation(() => 0.001); // Low probability

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("processing");
        expect(result.processingData.processingTime).toBe(30); // 10 + 20
        expect(requestProcessor.increaseNodeUtilization).toHaveBeenCalled();
      });

      it("should handle node overload", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is processing on an overloaded node
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.processingData.processingTime = 10;
        request.processingData.requiredProcessingTime = 50;

        // Configure mock behavior
        vi.spyOn(requestProcessor, "isNodeOverloaded").mockImplementation(
          () => true
        );
        // Set Math.random to return a value above the failure threshold
        vi.spyOn(Math, "random").mockImplementation(
          () => FAILURE_CHANCE_NODE_OVERLOAD + 0.1
        );

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("processing");
        expect(result.processingData.processingTime).toBe(20); // 10 + (20 * 0.5)
        expect(requestProcessor.increaseNodeUtilization).toHaveBeenCalled();
      });

      it("should fail due to node overload when random chance is high", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is processing on an overloaded node
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.processingData.processingTime = 10;
        request.processingData.requiredProcessingTime = 50;

        // Configure mock behavior
        vi.spyOn(requestProcessor, "isNodeOverloaded").mockImplementation(
          () => true
        );

        // Set Math.random to return a value below the failure threshold

        vi.spyOn(Math, "random").mockImplementation(
          () => FAILURE_CHANCE_NODE_OVERLOAD - 0.1
        );
        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("failed");
        expect(result.failureReason).toBe("Node overload");
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Destination reached", () => {
      it("should complete request when destination is reached", () => {
        // Arrange
        const nodes = [createNode(NodeType.Server, "Server 1", { x: 0, y: 0 })];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is done processing and has reached its destination
        const request = createRequest("req1", "Read", nodes[0].id, nodes[0].id);
        request.processingData.processingTime = 50;
        request.processingData.requiredProcessingTime = 50;

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("completed");
        expect(result.completedAt).toBe(500);
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Next node determination", () => {
      it("should move to next node when processing is complete", () => {
        // Arrange
        const node1 = createNode(NodeType.Server, "Server 1", { x: 0, y: 0 });
        const node2 = createNode(NodeType.Server, "Server 2", { x: 100, y: 0 });
        const nodes = [node1, node2];

        const edge = createEdge(EdgeType.HTTP, node1.id, node2.id);
        const edges: SystemDesignEdge[] = [edge];

        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is done processing at current node
        const request = createRequest("req1", "Read", node1.id, node2.id);
        request.processingData.processingTime = 50;
        request.processingData.requiredProcessingTime = 50;

        // Configure mock behavior
        vi.spyOn(requestRouter, "determineNextNode").mockImplementation(
          () => node2
        );
        vi.spyOn(requestProcessor, "isEdgeOverloaded").mockImplementation(
          () => false
        );
        vi.spyOn(
          requestProcessor,
          "calculateRequiredProcessingTime"
        ).mockImplementation(() => 30);

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("processing");
        expect(result.currentNodeId).toBe(node2.id);
        expect(result.prevNodeId).toBe(node1.id);
        expect(result.path).toContain(node2.id);
        expect(result.processingData.processingTime).toBe(0); // Reset for new node
        expect(result.processingData.requiredProcessingTime).toBe(30); // New processing time
        expect(result.currentEdgeId).toBe(edge.id);
        expect(result.processingData.edgeToDecreaseId).toBe(edge.id);

        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
        expect(requestProcessor.increaseEdgeUtilization).toHaveBeenCalled();
      });

      it("should fail when next node cannot be determined", () => {
        // Arrange
        const node1 = createNode(NodeType.Server, "Server 1", { x: 0, y: 0 });
        const node2 = createNode(NodeType.Server, "Server 2", { x: 100, y: 0 });
        const nodes = [node1, node2];
        const edges = [];
        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is done processing at current node
        const request = createRequest("req1", "Read", node1.id, node2.id);
        request.processingData.processingTime = 50;
        request.processingData.requiredProcessingTime = 50;
        request.retryOnError = false; // Don't retry

        // Configure mock behavior
        vi.spyOn(requestRouter, "determineNextNode").mockImplementation(
          () => null
        ); // No next node

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("failed");
        expect(result.failureReason).toBe("Next node not found");
        expect(requestProcessor.decreaseNodeUtilization).toHaveBeenCalled();
      });
    });

    describe("Edge handling", () => {
      it("should handle edge overload", () => {
        // Arrange
        const node1 = createNode(NodeType.Server, "Server 1", { x: 0, y: 0 });
        const node2 = createNode(NodeType.Server, "Server 2", { x: 100, y: 0 });
        const nodes = [node1, node2];

        const edge = createEdge(EdgeType.HTTP, node1.id, node2.id);
        const edges: SystemDesignEdge[] = [edge];

        const utilization = { nodeUtilization: {}, edgeUtilization: {} };

        // Create a request that is done processing at current node
        const request = createRequest("req1", "Read", node1.id, node2.id);
        request.processingData.processingTime = 50;
        request.processingData.requiredProcessingTime = 50;

        // Configure mock behavior
        vi.spyOn(requestRouter, "determineNextNode").mockImplementation(
          () => node2
        );
        vi.spyOn(requestProcessor, "isEdgeOverloaded").mockImplementation(
          () => true
        );
        vi.spyOn(
          requestProcessor,
          "calculateRequiredProcessingTime"
        ).mockImplementation(() => 30);

        // Set Math.random to return a value above the failure threshold
        vi.spyOn(Math, "random").mockImplementation(() => 0.3); // Above edge overload failure threshold (0.2)

        // Act
        const result = requestProcessor.processRequest(
          request,
          nodes,
          edges,
          20, // timeStep
          500, // elapsedTime
          utilization
        );

        // Assert
        expect(result.status).toBe("processing");
        expect(result.processingData.requiredProcessingTime).toBe(50); // 30 + 20 (penalty)
      });
    });
  });
  describe("processRequests", () => {
    // Mock dependencies to isolate the function
    beforeEach(() => {
      // Mock processRequest method
      vi.spyOn(requestProcessor, "processRequest").mockImplementation(
        (request, _nodes, _edges, _timeStep, _elapsedTime, _utilization) => {
          // Create a copy to avoid mutation
          const result = { ...request };

          // For testing purposes, we'll use a simple rule:
          // If ID starts with "active", keep it as processing
          // If ID starts with "complete", mark as completed
          // If ID starts with "fail", mark as failed
          if (request.id.startsWith("active")) {
            result.status = "processing";
          } else if (request.id.startsWith("complete")) {
            result.status = "completed";
          } else if (request.id.startsWith("fail")) {
            result.status = "failed";
          }

          return result;
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should process a batch of requests and categorize them correctly", () => {
      // Arrange
      const nodes: SystemDesignNode[] = [
        createNode(NodeType.Server, "Server 1", { x: 0, y: 0 }),
      ];
      const edges: SystemDesignEdge[] = [];
      const utilization = { nodeUtilization: {}, edgeUtilization: {} };

      // Create requests with different states
      const activeRequest1 = createRequest("active1", "Read", "node1", "node2");
      const activeRequest2 = createRequest(
        "active2",
        "Write",
        "node1",
        "node2"
      );
      const completedRequest = createRequest(
        "complete1",
        "Read",
        "node1",
        "node2"
      );
      completedRequest.status = "processing"; // Not yet completed
      const failedRequest = createRequest("fail1", "Read", "node1", "node2");
      failedRequest.status = "processing"; // Not yet failed
      const alreadyCompletedRequest = createRequest(
        "already-complete",
        "Read",
        "node1",
        "node2"
      );
      alreadyCompletedRequest.status = "completed"; // Already completed
      const alreadyFailedRequest = createRequest(
        "already-failed",
        "Read",
        "node1",
        "node2"
      );
      alreadyFailedRequest.status = "failed"; // Already failed

      const requests = [
        activeRequest1,
        activeRequest2,
        completedRequest,
        failedRequest,
        alreadyCompletedRequest,
        alreadyFailedRequest,
      ];

      // Act
      const result = requestProcessor.processRequests(
        requests,
        nodes,
        edges,
        100, // timeStep
        500, // elapsedTime
        utilization
      );

      // Assert
      // Should have 2 active requests
      expect(result.activeRequests.length).toBe(2);
      expect(result.activeRequests.map((r) => r.id)).toContain("active1");
      expect(result.activeRequests.map((r) => r.id)).toContain("active2");

      // Should have 2 completed requests
      expect(result.completedRequests.length).toBe(2);
      expect(result.completedRequests.map((r) => r.id)).toContain("complete1");
      expect(result.completedRequests.map((r) => r.id)).toContain(
        "already-complete"
      );

      // Should have 2 failed requests
      expect(result.failedRequests.length).toBe(2);
      expect(result.failedRequests.map((r) => r.id)).toContain("fail1");
      expect(result.failedRequests.map((r) => r.id)).toContain(
        "already-failed"
      );

      // Component utilization should be returned
      expect(result.componentUtilization).toBeDefined();

      // processRequest should be called 4 times (not for already completed/failed)
      expect(requestProcessor.processRequest).toHaveBeenCalledTimes(4);
    });

    it("should handle empty request list", () => {
      // Arrange
      const nodes: SystemDesignNode[] = [];
      const edges: SystemDesignEdge[] = [];
      const utilization = { nodeUtilization: {}, edgeUtilization: {} };
      const requests: SimulationRequest[] = [];

      // Act
      const result = requestProcessor.processRequests(
        requests,
        nodes,
        edges,
        100,
        500,
        utilization
      );

      // Assert
      expect(result.activeRequests.length).toBe(0);
      expect(result.completedRequests.length).toBe(0);
      expect(result.failedRequests.length).toBe(0);
      expect(requestProcessor.processRequest).not.toHaveBeenCalled();
    });

    it("should not modify the original utilization object", () => {
      // Arrange
      const nodes: SystemDesignNode[] = [
        createNode(NodeType.Server, "Server 1", { x: 0, y: 0 }),
      ];
      const edges: SystemDesignEdge[] = [];

      // Create utilization with some initial values
      const utilization = {
        nodeUtilization: { node1: 0.5 },
        edgeUtilization: { edge1: 0.3 },
      };
      const originalUtilization = { ...utilization };

      const requests = [createRequest("active1", "Read", "node1", "node2")];

      // Override mock to modify utilization
      vi.spyOn(requestProcessor, "processRequest").mockImplementation(
        (request, nodes, edges, timeStep, elapsedTime, utilization) => {
          // Modify the utilization
          utilization.nodeUtilization["node1"] = 0.8;
          utilization.edgeUtilization["edge1"] = 0.9;
          utilization.nodeUtilization["newNode"] = 0.4;

          return { ...request, status: "processing" };
        }
      );

      // Act
      const result = requestProcessor.processRequests(
        requests,
        nodes,
        edges,
        100,
        500,
        utilization
      );

      // Assert
      // The original utilization should be unchanged
      expect(utilization).toEqual(originalUtilization);

      // The result utilization should have the changes
      expect(result.componentUtilization.nodeUtilization["node1"]).toBe(0.8);
      expect(result.componentUtilization.edgeUtilization["edge1"]).toBe(0.9);
      expect(result.componentUtilization.nodeUtilization["newNode"]).toBe(0.4);
    });

    it("should process requests in the order they are provided", () => {
      // Arrange
      const nodes: SystemDesignNode[] = [
        createNode(NodeType.Server, "Server 1", { x: 0, y: 0 }),
      ];
      const edges: SystemDesignEdge[] = [];
      const utilization = { nodeUtilization: {}, edgeUtilization: {} };

      const requests = [
        createRequest("request1", "Read", "node1", "node2"),
        createRequest("request2", "Read", "node1", "node2"),
        createRequest("request3", "Read", "node1", "node2"),
      ];

      // Track call order
      const processOrder: string[] = [];

      // Override mock to track order
      vi.spyOn(requestProcessor, "processRequest").mockImplementation(
        (request, _nodes, _edges, _timeStep, _elapsedTime, _utilization) => {
          processOrder.push(request.id);
          return { ...request, status: "processing" };
        }
      );

      // Act
      requestProcessor.processRequests(
        requests,
        nodes,
        edges,
        100,
        500,
        utilization
      );

      // Assert
      expect(processOrder).toEqual(["request1", "request2", "request3"]);
    });
  });
});
