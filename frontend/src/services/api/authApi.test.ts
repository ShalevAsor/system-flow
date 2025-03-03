import { api } from "./authApi";
import MockAdapter from "axios-mock-adapter";
import { authApi } from "./authApi";

// Create a new instance of MockAdapter
const mock = new MockAdapter(api);

describe("Auth API", () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    mock.reset();
  });

  describe("Register", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    };

    const userData = {
      id: "123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      token: "test-token",
    };
    it("should store token and return user data on successful registration", async () => {
      // Setup mock response
      mock.onPost("/register").reply(201, userData);
      // Call the register function
      const result = await authApi.register(registerData);
      // Assert the returned data is correct
      expect(result).toEqual(userData);
      // Assert token was stored in localStorage
      expect(localStorage.getItem("userToken")).toBe("test-token");
    });
    it("should throw an error when registration fails", async () => {
      // Setup mock response for failure
      mock.onPost("/register").reply(400, { message: "User already exists" });

      // Assert that calling register throws an error
      await expect(authApi.register(registerData)).rejects.toThrow(
        "User already exists"
      );

      // Assert no token was stored
      expect(localStorage.getItem("userToken")).toBeNull();
    });
  });

  describe("Login", () => {
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    const userData = {
      id: "123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      token: "test-token",
    };

    it("should store token and return user data on successful login", async () => {
      // Setup mock response
      mock.onPost("/login").reply(200, userData);

      // Call the login function
      const result = await authApi.login(loginData);

      // Assert the returned data is correct
      expect(result).toEqual(userData);

      // Assert token was stored in localStorage
      expect(localStorage.getItem("userToken")).toBe("test-token");
    });
    it("should throw an error when login fails", async () => {
      // Setup mock response for failure
      mock
        .onPost("/login")
        .reply(401, { message: "Invalid email or password" });

      // Assert that calling login throws an error
      await expect(authApi.login(loginData)).rejects.toThrow(
        "Invalid email or password"
      );

      // Assert no token was stored
      expect(localStorage.getItem("userToken")).toBeNull();
    });
  });
  describe("getCurrentUser", () => {
    const userData = {
      id: "123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    it("should return user data when token is valid", async () => {
      // Setup localStorage with a token
      localStorage.setItem("userToken", "test-token");

      // Setup mock response
      mock.onGet("/me").reply(200, userData);

      // Call the getCurrentUser function
      const result = await authApi.getCurrentUser();

      // Assert the returned data is correct
      expect(result).toEqual(userData);
    });

    it("should throw an error when no token is available", async () => {
      // Assert that calling getCurrentUser throws an error
      await expect(authApi.getCurrentUser()).rejects.toThrow("No token found");
    });

    it("should remove token and throw an error when token is invalid", async () => {
      // Setup localStorage with a token
      localStorage.setItem("userToken", "invalid-token");

      // Setup mock response for failure
      mock
        .onGet("/me")
        .reply(401, { message: "Not authorized, invalid token" });

      // Assert that calling getCurrentUser throws an error
      await expect(authApi.getCurrentUser()).rejects.toThrow(
        "Not authorized, invalid token"
      );

      // Assert token was removed from localStorage
      expect(localStorage.getItem("userToken")).toBeNull();
    });
  });

  describe("logout", () => {
    it("should remove the token from localStorage", () => {
      // Setup localStorage with a token
      localStorage.setItem("userToken", "test-token");

      // Call the logout function
      authApi.logout();

      // Assert token was removed from localStorage
      expect(localStorage.getItem("userToken")).toBeNull();
    });
  });
});
