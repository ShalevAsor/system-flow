// frontend/src/services/api/apiClient.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "./apiClient";
import { StorageKeys } from "../../types";

// Create a mock for Axios
const mockAxios = new MockAdapter(apiClient);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock window.location
const mockLocation = {
  href: "",
};

// Replace real implementations with mocks
Object.defineProperty(window, "localStorage", { value: localStorageMock });
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("apiClient", () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorageMock.clear();
    mockLocation.href = "";
    vi.clearAllMocks();
  });

  describe("request interceptor", () => {
    it("should add auth token to headers if token exists", async () => {
      // Setup localStorage with token
      const testToken = "test-token-1234";
      localStorageMock.getItem.mockReturnValueOnce(testToken);

      // Setup mock response
      mockAxios.onGet("/test").reply((config) => {
        // Check if Authorization header was set correctly
        expect(config.headers?.Authorization).toBe(`Bearer ${testToken}`);
        return [200, { data: "success" }];
      });

      // Make request
      await apiClient.get("/test");

      // Verify localStorage was accessed
      expect(localStorageMock.getItem).toHaveBeenCalledWith(StorageKeys.TOKEN);
    });

    it("should not add auth token to headers if token does not exist", async () => {
      // Setup localStorage to return null for token
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Setup mock response
      mockAxios.onGet("/test").reply((config) => {
        // Check that Authorization header wasn't set
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: "success" }];
      });

      // Make request
      await apiClient.get("/test");

      // Verify localStorage was accessed
      expect(localStorageMock.getItem).toHaveBeenCalledWith(StorageKeys.TOKEN);
    });
  });

  describe("response interceptor", () => {
    it("should handle 401 errors by clearing token and redirecting to login", async () => {
      // Setup mock response for unauthorized
      mockAxios.onGet("/secured").reply(401, {
        success: false,
        message: "Unauthorized",
      });

      // Store a token that should be removed
      localStorage.setItem(StorageKeys.TOKEN, "some-token");

      // Make request that will fail
      try {
        await apiClient.get("/secured");
      } catch (_error) {
        // Verify token was removed and redirect happened
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          StorageKeys.TOKEN
        );
        expect(mockLocation.href).toBe("/login");
      }
    });

    it("should pass through successful responses", async () => {
      // Setup mock response
      const responseData = { data: "test data" };
      mockAxios.onGet("/success").reply(200, responseData);

      // Make request
      const response = await apiClient.get("/success");

      // Verify response data
      expect(response.data).toEqual(responseData);
    });

    it("should reject with original error for non-401 error responses", async () => {
      // Setup mock response for bad request
      mockAxios.onGet("/bad-request").reply(400, {
        success: false,
        message: "Bad request",
      });

      // Make request and expect it to fail
      await expect(apiClient.get("/bad-request")).rejects.toThrow();

      // Verify token was NOT removed
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      // Verify no redirect happened
      expect(mockLocation.href).toBe("");
    });
  });
});
