// src/app.test.ts
import request from "supertest";
import { app, closeServer } from "./app";

describe("App", () => {
  // Close connections after all tests
  afterAll(async () => {
    await closeServer();
  });

  it("should respond with 200 on root path", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});
