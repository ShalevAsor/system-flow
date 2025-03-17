import request from "supertest";
import mongoose from "mongoose";
import { app, startServer, closeServer } from "../server";
import { IUser, User } from "../models/User";
import { emailService } from "../services/emailService";
import { createToken } from "../utils/tokenUtils";

// Mock email service
jest.mock("../services/emailService", () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  },
}));

// Updated test user with a password that meets the requirements
const testUser = {
  email: "test@example.com",
  password: "Password123", // Includes uppercase, lowercase, and numbers
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
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  describe("User Registration", () => {
    it("should register a new user with unverified email status", async () => {
      const res = await request(app).post(`${baseUrl}/register`).send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.firstName).toBe(testUser.firstName);
      expect(res.body.data.lastName).toBe(testUser.lastName);
      expect(res.body.data.isEmailVerified).toBe(false);
      expect(res.body.data).not.toHaveProperty("password");
      // Token should not be returned in the response anymore
      expect(res.body.data).not.toHaveProperty("token");

      // Verify the user was created with verification token
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user?.isEmailVerified).toBe(false);
      expect(user?.verificationToken).toBeTruthy();
      expect(user?.verificationTokenExpiry).toBeTruthy();

      // Verify verification email was sent
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        testUser.email,
        `${testUser.firstName} ${testUser.lastName}`,
        expect.any(String)
      );
    });

    it("should not register a user with existing email", async () => {
      // First register a user
      await request(app).post(`${baseUrl}/register`).send(testUser);
      // Try to register the same user again
      const res = await request(app).post(`${baseUrl}/register`).send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User already exists");
      expect(res.body.errors).toHaveProperty("email");
    });

    it("should validate required fields", async () => {
      const res = await request(app).post(`${baseUrl}/register`).send({
        email: "test@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("firstName");
      expect(res.body.errors).toHaveProperty("lastName");
    });

    it("should validate email format", async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          ...testUser,
          email: "invalid-email",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("email");
    });

    it("should validate password length", async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          ...testUser,
          password: "Abc12", // Too short for the 8-character minimum
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("password");
    });

    it("should validate password complexity", async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          ...testUser,
          password: "password12345", // Missing uppercase
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("password");
    });

    it("should validate minimum name lengths", async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          ...testUser,
          firstName: "A", // Too short
          lastName: "B", // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("firstName");
      expect(res.body.errors).toHaveProperty("lastName");
    });
    it("should continue registration process even if verification email fails", async () => {
      // Mock email service to reject
      (emailService.sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
        new Error("Email sending failed")
      );

      const res = await request(app).post(`${baseUrl}/register`).send(testUser);

      // Should still register the user despite email failure
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify user was created in database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
    });
  });

  describe("Email Verification", () => {
    let verificationToken: string;
    let user: IUser;

    beforeEach(async () => {
      // Create unverified user with verification token
      const { token, hash, expiresAt } = createToken(3600); // Token valid for 1 hour
      verificationToken = token;

      user = new User({
        ...testUser,
        verificationToken: hash,
        verificationTokenExpiry: expiresAt,
        isEmailVerified: false,
      });

      await user.save();
    });

    it("should verify email with valid token", async () => {
      const res = await request(app).get(
        `${baseUrl}/verify-email?token=${verificationToken}`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Email verification successful");

      // Check that user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.isEmailVerified).toBe(true);
      expect(updatedUser?.verificationToken).toBeNull();
      expect(updatedUser?.verificationTokenExpiry).toBeNull();

      // Check welcome email was sent
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        testUser.email,
        `${testUser.firstName} ${testUser.lastName}`
      );
    });

    it("should reject request without token", async () => {
      const res = await request(app).get(`${baseUrl}/verify-email`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });

    it("should reject invalid verification token", async () => {
      const res = await request(app).get(
        `${baseUrl}/verify-email?token=invalid-token`
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain(
        "Invalid or expired verification link"
      );

      // User should still be unverified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.isEmailVerified).toBe(false);
    });

    it("should reject expired verification token", async () => {
      // Update the user's token to be expired
      await User.findByIdAndUpdate(user._id, {
        verificationTokenExpiry: new Date(Date.now() - 10000), // 10 seconds in the past
      });

      const res = await request(app).get(
        `${baseUrl}/verify-email?token=${verificationToken}`
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain(
        "Invalid or expired verification link"
      );
    });
    it("should complete email verification even if welcome email fails", async () => {
      // Create user with verification token
      const { token, hash, expiresAt } = createToken(3600);

      const user = new User({
        ...testUser,
        email: "newUser@example.com",
        verificationToken: hash,
        verificationTokenExpiry: expiresAt,
        isEmailVerified: false,
      });
      await user.save();

      // Mock welcome email to fail
      (emailService.sendWelcomeEmail as jest.Mock).mockRejectedValueOnce(
        new Error("Email sending failed")
      );

      const res = await request(app).get(
        `${baseUrl}/verify-email?token=${token}`
      );

      // Should still verify the user
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Check user was verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.isEmailVerified).toBe(true);
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      const user = new User({
        ...testUser,
        isEmailVerified: true,
      });
      await user.save();

      // Also create an unverified user
      const unverifiedUser = {
        email: "unverified@example.com",
        password: "Password123",
        firstName: "Unverified",
        lastName: "User",
      };

      const { hash, expiresAt } = createToken(3600);
      const newUser = new User({
        ...unverifiedUser,
        verificationToken: hash,
        verificationTokenExpiry: expiresAt,
        isEmailVerified: false,
      });
      await newUser.save();
    });

    it("should login a verified user", async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.firstName).toBe(testUser.firstName);
      expect(res.body.data.lastName).toBe(testUser.lastName);
      expect(res.body.data.isEmailVerified).toBe(true);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should not login a user with unverified email", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        email: "unverified@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email not verified");
      expect(res.body.errors).toHaveProperty("email");
    });

    it("should not login a user with wrong password", async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: "WrongPass123" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Wrong credentials");
      expect(res.body.errors).toHaveProperty("password");
    });

    it("should not login with non-existing email", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        email: "nonexisting@example.com",
        password: testUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Wrong credentials");
      expect(res.body.errors).toHaveProperty("email");
    });

    it("should validate email format during login", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        email: "not-an-email",
        password: testUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("email");
    });

    it("should validate password is required during login", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        email: testUser.email,
        password: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("password");
    });
  });

  describe("Password Reset Flow", () => {
    let user: IUser;

    beforeEach(async () => {
      // Create verified user
      user = new User({
        ...testUser,
        isEmailVerified: true,
      });
      await user.save();
    });

    it("should generate reset token and send email for existing user", async () => {
      const res = await request(app)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Password reset link sent");

      // Check user has reset token
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.resetPasswordToken).toBeTruthy();
      expect(updatedUser?.resetPasswordTokenExpiry).toBeTruthy();

      // Check email was sent
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        testUser.email,
        `${testUser.firstName} ${testUser.lastName}`,
        expect.any(String)
      );
    });

    it("should not reveal if email exists during password reset request", async () => {
      const res = await request(app)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: "nonexistent@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If your email is registered");

      // Email service should not be called
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should reset password with valid token", async () => {
      // Create reset token
      const { token, hash, expiresAt } = createToken(3600);

      // Set reset token on user
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: hash,
        resetPasswordTokenExpiry: expiresAt,
      });

      const newPassword = "NewPassword123";

      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token, newPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain(
        "Password has been reset successfully"
      );

      // Check user no longer has reset token
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.resetPasswordToken).toBeNull();
      expect(updatedUser?.resetPasswordTokenExpiry).toBeNull();

      // Verify can login with new password
      const loginRes = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: newPassword });

      expect(loginRes.status).toBe(200);
    });

    it("should reject invalid reset token", async () => {
      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token: "invalid-token", newPassword: "NewPassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid or expired reset link");
    });

    it("should reject expired reset token", async () => {
      // Create reset token
      const { token, hash } = createToken(3600);

      // Set expired reset token on user
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: hash,
        resetPasswordTokenExpiry: new Date(Date.now() - 10000), // 10 seconds in the past
      });

      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token, newPassword: "NewPassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid or expired reset link");
    });

    it("should validate new password requirements", async () => {
      // Create reset token
      const { token, hash, expiresAt } = createToken(3600);

      // Set reset token on user
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: hash,
        resetPasswordTokenExpiry: expiresAt,
      });

      // Try with weak password
      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token, newPassword: "weak" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("newPassword");
    });
    it("should handle password reset email sending failure", async () => {
      // Create user
      const user = new User({
        ...testUser,
        email: "user@example.com",
        isEmailVerified: true,
      });
      await user.save();

      // Mock email service to fail
      (emailService.sendPasswordResetEmail as jest.Mock).mockRejectedValueOnce(
        new Error("Email sending failed")
      );

      const res = await request(app)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: testUser.email });

      // Should return error status
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Failed to send password reset email");
    });
    it("should reject password reset without token", async () => {
      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ newPassword: "NewPassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });

    it("should reject password reset with non-string token", async () => {
      const res = await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token: 12345, newPassword: "NewPassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });
  });

  describe("Resend Verification Email", () => {
    beforeEach(async () => {
      // Create unverified user
      const { hash, expiresAt } = createToken(3600);
      const user = new User({
        ...testUser,
        verificationToken: hash,
        verificationTokenExpiry: expiresAt,
        isEmailVerified: false,
      });
      await user.save();
    });

    it("should resend verification email for unverified user", async () => {
      const res = await request(app)
        .post(`${baseUrl}/resend-verification`)
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Verification link sent");

      // Check email service was called
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        testUser.email,
        `${testUser.firstName} ${testUser.lastName}`,
        expect.any(String)
      );

      // Check new token was generated (verificationToken should be updated)
      const user = await User.findOne({ email: testUser.email });
      expect(user?.verificationToken).toBeTruthy();
      expect(user?.verificationTokenExpiry).toBeTruthy();
    });

    it("should not resend verification for already verified email", async () => {
      // Update user to be verified
      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        }
      );

      const res = await request(app)
        .post(`${baseUrl}/resend-verification`)
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Your email is already verified");

      // Email service should not be called
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should not reveal if email exists during verification resend", async () => {
      const res = await request(app)
        .post(`${baseUrl}/resend-verification`)
        .send({ email: "nonexistent@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If your email is registered");

      // Email service should not be called
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should validate email format for resend verification", async () => {
      const res = await request(app)
        .post(`${baseUrl}/resend-verification`)
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("email");
    });
    it("should handle verification email resend failure", async () => {
      // Create unverified user
      const { hash, expiresAt } = createToken(3600);
      const user = new User({
        ...testUser,
        email: "user@example.com",
        verificationToken: hash,
        verificationTokenExpiry: expiresAt,
        isEmailVerified: false,
      });
      await user.save();

      // Mock email service to fail
      (emailService.sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
        new Error("Email sending failed")
      );

      const res = await request(app)
        .post(`${baseUrl}/resend-verification`)
        .send({ email: testUser.email });

      // Should return error status
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Failed to send verification email");
    });
  });

  describe("Current User Profile", () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      // Create a verified user
      const user = new User({
        ...testUser,
        isEmailVerified: true,
      });
      await user.save();
      userId = user._id.toString();

      // Login to get token
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: testUser.email, password: testUser.password });

      token = res.body.data.token;
    });

    it("should get current user profile with valid token", async () => {
      const res = await request(app)
        .get(`${baseUrl}/me`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.firstName).toBe(testUser.firstName);
      expect(res.body.data.lastName).toBe(testUser.lastName);
      expect(res.body.data.isEmailVerified).toBe(true);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should reject requests without token", async () => {
      const res = await request(app).get(`${baseUrl}/me`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Not authorized");
    });

    it("should reject requests with invalid token", async () => {
      const res = await request(app)
        .get(`${baseUrl}/me`)
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Not authorized");
    });

    it("should handle malformed Authorization header", async () => {
      const res = await request(app)
        .get(`${baseUrl}/me`)
        .set("Authorization", "InvalidFormat");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Not authorized");
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown endpoints", async () => {
      const res = await request(app).get("/api/nonexistent-route");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Unknown endpoint");
    });
  });
});
