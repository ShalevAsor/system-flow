// backend/src/controllers/authController.test.ts
import request from "supertest";
import mongoose from "mongoose";
import { app, startServer, closeServer } from "../app";
import { User } from "../models/User";

const testUser = {
  email: "test@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User",
};
const baseUrl = "/api/auth";

describe("Authentication Controller", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await closeServer();
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe("User Registration", () => {
    it("should register a new user", async () => {
      const res = await request(app).post(`${baseUrl}/register`).send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.firstName).toBe(testUser.firstName);
      expect(res.body.lastName).toBe(testUser.lastName);
      expect(res.body).not.toHaveProperty("password");
    });

    it("should not register a user with existing email", async () => {
      // First register a user
      await request(app).post(`${baseUrl}/register`).send(testUser);
      // Try to register the same user again
      const res = await request(app).post(`${baseUrl}/register`).send(testUser);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
    it("should validate required fields", async () => {
      const res = await request(app).post(`${baseUrl}/register`).send({
        email: "test@example.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors.firstName).toBeDefined();
      expect(res.body.errors.lastName).toBeDefined();
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await request(app).post(`${baseUrl}/register`).send(testUser);
    });
    it("should login an existing user", async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.firstName).toBe(testUser.firstName);
      expect(res.body.lastName).toBe(testUser.lastName);
      expect(res.body).not.toHaveProperty("password");
    });
    it("should not login a user with wrong password", async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });
    it("should not login with non-existing email", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        email: "nonexisting@example.com",
        password: testUser.password,
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email");
    });
  });

  describe("Get current user", () => {
    let token: string;
    beforeEach(async () => {
      // Register and login a test user before each test
      const res = await request(app).post(`${baseUrl}/register`).send(testUser);
      token = res.body.token;
    });
    it("should get current user profile", async () => {
      const res = await request(app)
        .get(`${baseUrl}/me`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.firstName).toBe(testUser.firstName);
      expect(res.body.lastName).toBe(testUser.lastName);
      expect(res.body).not.toHaveProperty("password");
    });
    it("should not get current user profile without token", async () => {
      const res = await request(app).get(`${baseUrl}/me`);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Not authorized, no token");
    });
    it("should not get profile with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Not authorized, invalid token");
    });
  });
});
