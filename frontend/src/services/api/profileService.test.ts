// frontend/src/services/api/profileService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import profileService from "./profileService";
import apiClient from "./apiClient";
import { User } from "./authService";

// Create a mock for Axios
const mockAxios = new MockAdapter(apiClient);

describe("profileService", () => {
  // Sample user data for testing
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    isEmailVerified: true,
  };

  const mockProfileResponse = {
    success: true,
    message: "Profile retrieved successfully",
    data: mockUser,
  };

  const mockPasswordChangeResponse = {
    success: true,
    message: "Password changed successfully",
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should make a GET request to /profile", async () => {
      // Setup mock response
      mockAxios.onGet("/profile").reply(200, mockProfileResponse);

      // Call the method
      const result = await profileService.getProfile();

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should throw an error when getting profile fails", async () => {
      // Setup mock failure response
      mockAxios.onGet("/profile").reply(401, {
        success: false,
        message: "Unauthorized",
      });

      // Expect the method to throw
      await expect(profileService.getProfile()).rejects.toThrow();
    });
  });

  describe("updateProfile", () => {
    const profileData = {
      firstName: "Updated",
      lastName: "Name",
    };

    const updatedUser = {
      ...mockUser,
      firstName: "Updated",
      lastName: "Name",
    };

    const mockUpdateResponse = {
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    };

    it("should make a PUT request to /profile with updated data", async () => {
      // Setup mock response
      mockAxios.onPut("/profile", profileData).reply(200, mockUpdateResponse);

      // Call the method
      const result = await profileService.updateProfile(profileData);

      // Verify the result
      expect(result).toEqual(updatedUser);
    });

    it("should work with partial data (only firstName)", async () => {
      const partialData = { firstName: "UpdatedFirst" };
      const partiallyUpdatedUser = {
        ...mockUser,
        firstName: "UpdatedFirst",
      };

      // Setup mock response
      mockAxios.onPut("/profile", partialData).reply(200, {
        success: true,
        message: "Profile updated successfully",
        data: partiallyUpdatedUser,
      });

      // Call the method
      const result = await profileService.updateProfile(partialData);

      // Verify the result
      expect(result).toEqual(partiallyUpdatedUser);
      expect(result.firstName).toBe("UpdatedFirst");
      expect(result.lastName).toBe(mockUser.lastName); // Should remain unchanged
    });

    it("should throw an error when updating profile fails", async () => {
      // Setup mock failure response
      mockAxios.onPut("/profile", profileData).reply(400, {
        success: false,
        message: "Invalid data provided",
      });

      // Expect the method to throw
      await expect(profileService.updateProfile(profileData)).rejects.toThrow();
    });
  });

  describe("changePassword", () => {
    const passwordData = {
      currentPassword: "oldPassword123",
      newPassword: "newSecurePassword456",
    };

    it("should make a PUT request to /profile/change-password with password data", async () => {
      // Setup mock response
      mockAxios
        .onPut("/profile/change-password", passwordData)
        .reply(200, mockPasswordChangeResponse);

      // Call the method
      const result = await profileService.changePassword(passwordData);

      // Verify the result
      expect(result).toBe(mockPasswordChangeResponse.message);
    });

    it("should throw an error when password change fails due to incorrect current password", async () => {
      // Setup mock failure response
      mockAxios.onPut("/profile/change-password", passwordData).reply(400, {
        success: false,
        message: "Incorrect current password",
      });

      // Expect the method to throw
      await expect(
        profileService.changePassword(passwordData)
      ).rejects.toThrow();
    });

    it("should throw an error when password change fails due to validation errors", async () => {
      // Setup mock failure response with validation errors
      mockAxios.onPut("/profile/change-password", passwordData).reply(422, {
        success: false,
        message: "Validation failed",
        errors: {
          newPassword: "Password must be at least 8 characters",
        },
      });

      // Expect the method to throw
      await expect(
        profileService.changePassword(passwordData)
      ).rejects.toThrow();
    });
  });
});
