import mongoose from "mongoose";
import { Flow } from "../models/Flow";
import { NodeType, EdgeType } from "../types/flowTypes";

describe("Flow Model", () => {
  // Setup connection to test database
  beforeAll(async () => {
    const mongoURI =
      process.env.MONGO_URI_TEST || "mongodb://localhost:27017/flow-test";
    await mongoose.connect(mongoURI);
  });

  // Cleanup after all tests
  afterAll(async () => {
    await Flow.deleteMany({});
    await mongoose.connection.close();
  });

  // Cleanup after each test
  afterEach(async () => {
    await Flow.deleteMany({});
  });

  describe("Schema Validation", () => {
    it("should create a valid flow with minimum required fields", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Test Flow",
        description: "A test flow for validation purposes",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow._id).toBeDefined();
      expect(savedFlow.userId.toString()).toBe(userId.toString());
      expect(savedFlow.name).toBe(flowData.name);
      expect(savedFlow.description).toBe(flowData.description);
      expect(savedFlow.nodes).toEqual([]);
      expect(savedFlow.edges).toEqual([]);
      expect(savedFlow.createdAt).toBeDefined();
      expect(savedFlow.updatedAt).toBeDefined();
    });

    it("should create a valid flow with nodes and edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Complex Flow",
        description: "A test flow with nodes and edges",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "API Server" },
          },
          {
            id: "node2",
            type: NodeType.Database,
            position: { x: 300, y: 200 },
            data: { name: "User Database" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.Database,
            data: { queryType: "Read/Write" },
          },
        ],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow.nodes.length).toBe(2);
      expect(savedFlow.edges.length).toBe(1);
      expect(savedFlow.nodes[0].id).toBe("node1");
      expect(savedFlow.nodes[0].type).toBe(NodeType.Server);
      expect(savedFlow.edges[0].id).toBe("edge1");
      expect(savedFlow.edges[0].type).toBe(EdgeType.Database);
    });

    it("should require userId", async () => {
      const flowData = {
        name: "Missing User ID",
        description: "A test flow missing userId",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require name", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        description: "A test flow missing name",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require description", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Missing Description",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should enforce name minimum length", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "AB", // Too short (minimum 3 characters)
        description: "A test flow with name too short",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should enforce description minimum length", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Valid Name",
        description: "Short", // Too short (minimum 6 characters)
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should trim the name field", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "  Trimmed Name  ",
        description: "A test flow with whitespace in name",
        nodes: [],
        edges: [],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow.name).toBe("Trimmed Name");
    });
  });

  describe("Nodes Validation", () => {
    it("should require id for nodes", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Validation",
        description: "Testing node validation",
        nodes: [
          {
            // Missing id
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require type for nodes", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Validation",
        description: "Testing node validation",
        nodes: [
          {
            id: "node1",
            // Missing type
            position: { x: 100, y: 200 },
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should validate node type is from enum", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Type Validation",
        description: "Testing node type validation",
        nodes: [
          {
            id: "node1",
            type: "invalidType", // Not in NodeType enum
            position: { x: 100, y: 200 },
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require position for nodes", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Position Validation",
        description: "Testing node position validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            // Missing position
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require x and y coordinates in position", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Position Coordinates",
        description: "Testing node position coordinates",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100 }, // Missing y coordinate
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require data for nodes", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Data Validation",
        description: "Testing node data validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            // Missing data
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe("Edges Validation", () => {
    it("should require id for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Validation",
        description: "Testing edge validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            // Missing id
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require source for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Source Validation",
        description: "Testing edge source validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            // Missing source
            target: "node2",
            type: EdgeType.HTTP,
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require target for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Target Validation",
        description: "Testing edge target validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            // Missing target
            type: EdgeType.HTTP,
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require type for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Type Validation",
        description: "Testing edge type validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            // Missing type
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should validate edge type is from enum", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Type Enum Validation",
        description: "Testing edge type enum validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: "invalidEdgeType", // Not in EdgeType enum
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require data for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Data Validation",
        description: "Testing edge data validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            // Missing data
          },
        ],
      };

      const flow = new Flow(flowData);
      await expect(flow.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe("Default Values", () => {
    it("should set empty array as default for nodes", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Default Nodes",
        description: "Testing default value for nodes",
        // Not providing nodes
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(Array.isArray(savedFlow.nodes)).toBe(true);
      expect(savedFlow.nodes.length).toBe(0);
    });

    it("should set empty array as default for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Default Edges",
        description: "Testing default value for edges",
        // Not providing edges
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(Array.isArray(savedFlow.edges)).toBe(true);
      expect(savedFlow.edges.length).toBe(0);
    });
  });

  describe("Data Structure Flexibility", () => {
    it("should allow different data structures for node data", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Node Data Flexibility",
        description: "Testing node data structure flexibility",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server", cpuCores: 4, memory: "16GB" },
          },
          {
            id: "node2",
            type: NodeType.Database,
            position: { x: 300, y: 200 },
            data: {
              name: "Database",
              type: "SQL",
              tables: ["users", "products"],
              isPrimary: true,
            },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      // Check first node
      expect(savedFlow.nodes[0].data.name).toBe("Server");
      expect(savedFlow.nodes[0].data.cpuCores).toBe(4);
      expect(savedFlow.nodes[0].data.memory).toBe("16GB");

      // Check second node with more complex data
      expect(savedFlow.nodes[1].data.name).toBe("Database");
      expect(savedFlow.nodes[1].data.type).toBe("SQL");
      expect(Array.isArray(savedFlow.nodes[1].data.tables)).toBe(true);
      expect(savedFlow.nodes[1].data.tables).toContain("users");
      expect(savedFlow.nodes[1].data.isPrimary).toBe(true);
    });

    it("should allow different data structures for edge data", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Edge Data Flexibility",
        description: "Testing edge data structure flexibility",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            data: {
              protocol: "HTTPS",
              methods: ["GET", "POST"],
              secure: true,
              latency: 50,
            },
          },
        ],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      // Check edge data
      expect(savedFlow.edges[0].data.protocol).toBe("HTTPS");
      expect(Array.isArray(savedFlow.edges[0].data.methods)).toBe(true);
      expect(savedFlow.edges[0].data.methods).toContain("POST");
      expect(savedFlow.edges[0].data.secure).toBe(true);
      expect(savedFlow.edges[0].data.latency).toBe(50);
    });
  });

  describe("Optional Fields", () => {
    it("should allow sourceHandle to be optional for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Optional SourceHandle",
        description: "Testing optional sourceHandle for edges",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            // Not providing sourceHandle
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow.edges[0].sourceHandle).toBeUndefined();
    });

    it("should allow targetHandle to be optional for edges", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Optional TargetHandle",
        description: "Testing optional targetHandle for edges",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            // Not providing targetHandle
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow.edges[0].targetHandle).toBeUndefined();
    });

    it("should store sourceHandle and targetHandle when provided", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "Handles Present",
        description: "Testing when handles are provided",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 300, y: 200 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: EdgeType.HTTP,
            sourceHandle: "output1",
            targetHandle: "input1",
            data: {},
          },
        ],
      };

      const flow = new Flow(flowData);
      const savedFlow = await flow.save();

      expect(savedFlow.edges[0].sourceHandle).toBe("output1");
      expect(savedFlow.edges[0].targetHandle).toBe("input1");
    });
  });

  describe("toJSON Transform", () => {
    it("should transform document for JSON serialization", async () => {
      const userId = new mongoose.Types.ObjectId();
      const flowData = {
        userId,
        name: "JSON Transform Test",
        description: "Testing the toJSON transform",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 200 },
            data: { name: "Server" },
          },
        ],
        edges: [],
      };

      const flow = new Flow(flowData);
      await flow.save();

      // Convert to plain object (like toJSON would do)
      const flowObject = flow.toObject();
      const transformedFlow = JSON.parse(JSON.stringify(flow));

      // Check transformations
      expect(transformedFlow.id).toBeDefined();
      expect(transformedFlow._id).toBeUndefined();
      expect(transformedFlow.__v).toBeUndefined();
      expect(transformedFlow.userId).toBeUndefined();

      // Original object should still have these properties
      expect(flowObject._id).toBeDefined();
      expect(flowObject.userId).toBeDefined();
    });
  });
});
