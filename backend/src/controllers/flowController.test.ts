import request from "supertest";
import mongoose from "mongoose";
import { app, startServer, closeServer } from "../server";
import { Flow } from "../models/Flow";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import config from "../config/config";
import {
  EdgeType,
  NodeType,
  SystemDesignEdge,
  SystemDesignNode,
} from "../types/flowTypes";

// Test user for authentication
const testUser = {
  email: "flowtest@example.com",
  password: "Password123",
  firstName: "Flow",
  lastName: "Tester",
};

// Sample flow data
// Sample flow data with proper types
const testFlows = [
  {
    name: "Test Flow 1",
    description: "First test flow",
    nodes: [
      {
        id: "node1",
        type: NodeType.Server,
        position: { x: 100, y: 100 },
        data: { name: "API Server", cpuCores: 4 },
      },
      {
        id: "node2",
        type: NodeType.Database,
        position: { x: 300, y: 100 },
        data: { name: "User Database", dbType: "SQL" },
      },
    ] as SystemDesignNode[],
    edges: [
      {
        id: "edge1",
        source: "node1",
        target: "node2",
        type: EdgeType.Database,
        data: { queryType: "Read" },
      },
    ] as SystemDesignEdge[],
  },
  {
    name: "Test Flow 2",
    description: "Second test flow",
    nodes: [
      {
        id: "node3",
        type: NodeType.Client,
        position: { x: 100, y: 200 },
        data: { name: "Web Client" },
      },
    ] as SystemDesignNode[],
    edges: [] as SystemDesignEdge[],
  },
];

const baseUrl = "/api/flows";

// Helper to generate JWT token for authentication
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

describe("Flow Controller", () => {
  let userId: string;
  let token: string;
  let flowIds: string[] = [];

  beforeAll(async () => {
    await startServer();
  });

  afterAll(async () => {
    await Flow.deleteMany({});
    await User.deleteMany({});
    await closeServer();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean existing data
    await Flow.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const user = new User({
      ...testUser,
      isEmailVerified: true,
    });
    await user.save();
    userId = user._id.toString();

    // Generate token
    token = generateToken(userId);

    // Create test flows for this user
    flowIds = [];
    for (const flowData of testFlows) {
      const flow = new Flow({
        userId,
        ...flowData,
      });
      await flow.save();
      flowIds.push(flow._id.toString());
    }
  });

  describe("getFlows", () => {
    it("should retrieve all flows for the authenticated user", async () => {
      const res = await request(app)
        .get(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Flows retrieved successfully");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(testFlows.length);

      // Verify data structure
      const flow = res.body.data[0];
      expect(flow).toHaveProperty("id");
      expect(flow).toHaveProperty("name");
      expect(flow).toHaveProperty("description");
      expect(flow).toHaveProperty("nodes");
      expect(flow).toHaveProperty("edges");
      expect(flow).toHaveProperty("updatedAt");

      // Ensure we're getting the FlowItem interface (with counts) not the full nodes/edges
      expect(typeof flow.nodes).toBe("number");
      expect(typeof flow.edges).toBe("number");
    });
    it("should return an empty array when user has no flows", async () => {
      // Delete all flows for this user
      await Flow.deleteMany({ userId });

      const res = await request(app)
        .get(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
    it("should not return flows belonging to other users", async () => {
      // Create another user
      const anotherUser = new User({
        email: "another@example.com",
        password: "Password123",
        firstName: "Another",
        lastName: "User",
        isEmailVerified: true,
      });
      await anotherUser.save();

      // Create flow for the other user
      const otherUserFlow = new Flow({
        userId: anotherUser._id,
        name: "Other User's Flow",
        description: "This flow belongs to another user",
        nodes: [
          {
            id: "othernode1",
            type: NodeType.Server,
            position: { x: 100, y: 100 },
            data: { name: "Other Server" },
          },
        ],
        edges: [],
      });
      await otherUserFlow.save();

      // Get flows with original user's token
      const res = await request(app)
        .get(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(testFlows.length);

      // Verify the other user's flow is not included

      const flowNames = res.body.data.map(
        (flow: { name: string }) => flow.name
      );
      expect(flowNames).not.toContain("Other User's Flow");
    });
  });
  describe("saveFlow", () => {
    it("should create a new flow for the authenticated user", async () => {
      const newFlow = {
        name: "New Test Flow",
        description: "A new flow created during testing",
        nodes: [
          {
            id: "newnode1",
            type: NodeType.Server,
            position: { x: 150, y: 150 },
            data: { name: "New API Server", cpuCores: 8 },
          },
        ],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(newFlow);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Flow saved successfully");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe(newFlow.name);
      expect(res.body.data.description).toBe(newFlow.description);

      // Verify the flow was actually saved to the database
      const savedFlow = await Flow.findById(res.body.data.id);
      expect(savedFlow).not.toBeNull();
      expect(savedFlow?.name).toBe(newFlow.name);
      expect(savedFlow?.description).toBe(newFlow.description);
      expect(savedFlow?.userId.toString()).toBe(userId);
      expect(savedFlow?.nodes.length).toBe(1);
      expect(savedFlow?.edges.length).toBe(0);
    });
    it("should create a flow with multiple nodes and edges", async () => {
      const complexFlow = {
        name: "Complex Flow",
        description: "A flow with multiple nodes and edges",
        nodes: [
          {
            id: "node-a",
            type: NodeType.Client,
            position: { x: 100, y: 100 },
            data: { name: "Web Client" },
          },
          {
            id: "node-b",
            type: NodeType.LoadBalancer,
            position: { x: 250, y: 100 },
            data: { name: "Load Balancer", algorithm: "Round Robin" },
          },
          {
            id: "node-c",
            type: NodeType.Server,
            position: { x: 400, y: 100 },
            data: { name: "API Server" },
          },
        ],
        edges: [
          {
            id: "edge-a",
            source: "node-a",
            target: "node-b",
            type: EdgeType.HTTP,
            data: { protocol: "HTTPS" },
          },
          {
            id: "edge-b",
            source: "node-b",
            target: "node-c",
            type: EdgeType.HTTP,
            data: { protocol: "HTTP" },
          },
        ],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(complexFlow);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify the complex flow was saved correctly
      const savedFlow = await Flow.findById(res.body.data.id);
      expect(savedFlow?.nodes.length).toBe(3);
      expect(savedFlow?.edges.length).toBe(2);
    });
    it("should return 401 if user is not authenticated", async () => {
      const newFlow = {
        name: "Unauthorized Flow",
        description: "This flow should not be saved",
        nodes: [],
        edges: [],
      };

      const res = await request(app).post(`${baseUrl}`).send(newFlow);
      // No authorization token provided

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      // Missing name field
      const invalidFlow = {
        description: "Flow with missing required fields",
        nodes: [],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidFlow);

      // Since the model validation requires name, the request should fail
      expect(res.status).not.toBe(201);
      expect(res.body.success).toBe(false);
    });

    it("should handle validation errors for minimum length constraints", async () => {
      // Name is too short (less than 3 characters)
      const invalidFlow = {
        name: "AB", // Too short (minimum 3 characters)
        description: "Flow with invalid name length",
        nodes: [],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidFlow);

      expect(res.status).not.toBe(201);
      expect(res.body.success).toBe(false);
    });
    it("should validate description minimum length", async () => {
      // Description is too short (less than 6 characters)
      const invalidFlow = {
        name: "Valid Name",
        description: "Short", // Too short (minimum 6 characters)
        nodes: [],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidFlow);

      expect(res.status).not.toBe(201);
      expect(res.body.success).toBe(false);
    });

    it("should validate node type values", async () => {
      // Invalid node type
      const invalidFlow = {
        name: "Flow with Invalid Node",
        description: "Testing node type validation",
        nodes: [
          {
            id: "invalid-node",
            type: "invalidType", // Not in NodeType enum
            position: { x: 100, y: 100 },
            data: { name: "Invalid Node" },
          },
        ],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidFlow);

      expect(res.status).not.toBe(201);
      expect(res.body.success).toBe(false);
    });

    it("should validate edge type values", async () => {
      // Invalid edge type
      const invalidFlow = {
        name: "Flow with Invalid Edge",
        description: "Testing edge type validation",
        nodes: [
          {
            id: "node1",
            type: NodeType.Server,
            position: { x: 100, y: 100 },
            data: { name: "Server 1" },
          },
          {
            id: "node2",
            type: NodeType.Server,
            position: { x: 200, y: 100 },
            data: { name: "Server 2" },
          },
        ],
        edges: [
          {
            id: "invalid-edge",
            source: "node1",
            target: "node2",
            type: "invalidEdgeType", // Not in EdgeType enum
            data: {},
          },
        ],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidFlow);

      expect(res.status).not.toBe(201);
      expect(res.body.success).toBe(false);
    });

    it("should handle server errors gracefully", async () => {
      // Mock a database error
      const originalSave = mongoose.Model.prototype.save;
      mongoose.Model.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Simulated database error"));

      const newFlow = {
        name: "Error Flow",
        description: "This flow should trigger an error",
        nodes: [],
        edges: [],
      };

      const res = await request(app)
        .post(`${baseUrl}`)
        .set("Authorization", `Bearer ${token}`)
        .send(newFlow);

      // Restore the original save method
      mongoose.Model.prototype.save = originalSave;

      // The next middleware should handle the error
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
  describe("getFlowById", () => {
    it("should retrieve a specific flow by ID for the authenticated user", async () => {
      // Get the first test flow ID created in beforeEach
      const flowId = flowIds[0];

      const res = await request(app)
        .get(`${baseUrl}/${flowId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Flow retrieved successfully");
      expect(res.body.data).toHaveProperty("id", flowId);
      expect(res.body.data).toHaveProperty("name", testFlows[0].name);
      expect(res.body.data).toHaveProperty(
        "description",
        testFlows[0].description
      );

      // Verify nodes and edges are returned
      expect(Array.isArray(res.body.data.nodes)).toBe(true);
      expect(res.body.data.nodes.length).toBe(testFlows[0].nodes.length);
      expect(Array.isArray(res.body.data.edges)).toBe(true);
      expect(res.body.data.edges.length).toBe(testFlows[0].edges.length);

      // Verify specific node properties are returned
      expect(res.body.data.nodes[0].id).toBe(testFlows[0].nodes[0].id);
      expect(res.body.data.nodes[0].type).toBe(testFlows[0].nodes[0].type);

      // Verify specific edge properties when edges exist
      if (testFlows[0].edges.length > 0) {
        expect(res.body.data.edges[0].id).toBe(testFlows[0].edges[0].id);
        expect(res.body.data.edges[0].source).toBe(
          testFlows[0].edges[0].source
        );
        expect(res.body.data.edges[0].target).toBe(
          testFlows[0].edges[0].target
        );
      }
    });

    it("should return 404 if the flow doesn't exist", async () => {
      // Create a valid but non-existent MongoDB ObjectId
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`${baseUrl}/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Flow not found");
    });

    it("should return 404 if the flow belongs to another user", async () => {
      // Create another user
      const anotherUser = new User({
        email: "another.user@example.com",
        password: "Password123",
        firstName: "Another",
        lastName: "User",
        isEmailVerified: true,
      });
      await anotherUser.save();

      // Create a flow for the other user
      const otherUserFlow = new Flow({
        userId: anotherUser._id,
        name: "Another User's Flow",
        description: "This flow belongs to another user",
        nodes: [
          {
            id: "node-other",
            type: NodeType.Server,
            position: { x: 100, y: 100 },
            data: { name: "Other User's Server" },
          },
        ],
        edges: [],
      });
      await otherUserFlow.save();

      // Try to access the other user's flow with original user's token
      const res = await request(app)
        .get(`${baseUrl}/${otherUserFlow._id.toString()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Flow not found");
    });

    it("should return 401 if user is not authenticated", async () => {
      const flowId = flowIds[0];

      const res = await request(app).get(`${baseUrl}/${flowId}`);
      // No authorization token provided

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should handle invalid MongoDB ObjectId format", async () => {
      const invalidId = "not-a-valid-id";

      const res = await request(app)
        .get(`${baseUrl}/${invalidId}`)
        .set("Authorization", `Bearer ${token}`);

      // This should trigger the catch block because of Mongoose casting error
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
  describe("removeFlowById", () => {
    it("should successfully delete a flow that belongs to the user", async () => {
      // Get the first test flow ID created in beforeEach
      const flowId = flowIds[0];

      // Verify the flow exists before deletion
      const flowBeforeDeletion = await Flow.findById(flowId);
      expect(flowBeforeDeletion).not.toBeNull();

      // Perform the delete request
      const res = await request(app)
        .delete(`${baseUrl}/${flowId}`)
        .set("Authorization", `Bearer ${token}`);

      // Check response
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Flow removed successfully");
      expect(res.body.data).toBeNull(); // Data should be null for deletion

      // Verify the flow no longer exists in the database
      const flowAfterDeletion = await Flow.findById(flowId);
      expect(flowAfterDeletion).toBeNull();
    });

    it("should return 404 if the flow to delete doesn't exist", async () => {
      // Create a valid but non-existent MongoDB ObjectId
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`${baseUrl}/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Flow not found");

      // Extra verification: ensure we didn't accidentally delete anything
      const countAfter = await Flow.countDocuments({ userId });
      expect(countAfter).toBe(testFlows.length);
    });

    it("should return 404 if trying to delete a flow belonging to another user", async () => {
      // Create another user
      const anotherUser = new User({
        email: "delete.test@example.com",
        password: "Password123",
        firstName: "Delete",
        lastName: "Tester",
        isEmailVerified: true,
      });
      await anotherUser.save();

      // Create a flow for the other user
      const otherUserFlow = new Flow({
        userId: anotherUser._id,
        name: "Flow to not delete",
        description: "This flow should not be deletable by our test user",
        nodes: [
          {
            id: "secure-node",
            type: NodeType.Server,
            position: { x: 100, y: 100 },
            data: { name: "Protected Server" },
          },
        ],
        edges: [],
      });
      await otherUserFlow.save();

      // Try to delete the other user's flow with our test user's token
      const res = await request(app)
        .delete(`${baseUrl}/${otherUserFlow._id.toString()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Flow not found");

      // Verify the other user's flow still exists
      const flowAfterAttempt = await Flow.findById(otherUserFlow._id);
      expect(flowAfterAttempt).not.toBeNull();
    });

    it("should return 401 if user is not authenticated", async () => {
      const flowId = flowIds[0];

      const res = await request(app).delete(`${baseUrl}/${flowId}`);
      // No authorization token provided

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);

      // Verify the flow still exists
      const flowAfterAttempt = await Flow.findById(flowId);
      expect(flowAfterAttempt).not.toBeNull();
    });

    it("should handle invalid MongoDB ObjectId format", async () => {
      const invalidId = "this-is-not-an-objectid";

      const res = await request(app)
        .delete(`${baseUrl}/${invalidId}`)
        .set("Authorization", `Bearer ${token}`);

      // This should trigger a Mongoose casting error
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Check that we didn't delete any flows
      const countAfter = await Flow.countDocuments({ userId });
      expect(countAfter).toBe(testFlows.length);
    });
    it("should handle server errors during flow lookup", async () => {
      const flowId = flowIds[0];

      // Mock a database error during the findOne operation
      const originalFindOne = Flow.findOne;
      Flow.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Simulated database error during lookup"));

      const res = await request(app)
        .delete(`${baseUrl}/${flowId}`)
        .set("Authorization", `Bearer ${token}`);

      // Restore the original function
      Flow.findOne = originalFindOne;

      // Error should be caught and handled
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);

      // Verify the flow still exists (since the error occurred before deletion)
      const flowAfterError = await Flow.findById(flowId);
      expect(flowAfterError).not.toBeNull();
    });
    it("should handle server errors during flow deletion", async () => {
      const flowId = flowIds[0];

      // Let findOne work normally but make findByIdAndDelete fail
      const originalFindByIdAndDelete = Flow.findByIdAndDelete;
      Flow.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(
          new Error("Simulated database error during deletion")
        );

      const res = await request(app)
        .delete(`${baseUrl}/${flowId}`)
        .set("Authorization", `Bearer ${token}`);

      // Restore the original function
      Flow.findByIdAndDelete = originalFindByIdAndDelete;

      // Error should be caught and handled
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);

      // Verify the flow still exists (since deletion failed)
      const flowAfterError = await Flow.findById(flowId);
      expect(flowAfterError).not.toBeNull();
    });
  });
});
