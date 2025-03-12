import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer";
import { EmailService, emailService } from "../services/emailService";
import config from "../config/config";
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getWelcomeEmailTemplate,
} from "../utils/emailTemplates";

// Mock types
type MockSendMail = jest.Mock<Promise<SentMessageInfo>, [SendMailOptions]>;
interface MockTransporter {
  sendMail: MockSendMail;
}

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: "test-message-id",
      envelope: { from: "test@example.com", to: ["recipient@example.com"] },
    }),
  }),
  createTestAccount: jest.fn().mockResolvedValue({
    user: "test-user",
    pass: "test-pass",
  }),
  getTestMessageUrl: jest
    .fn()
    .mockReturnValue("https://ethereal.email/test-url"),
}));

// Mock email templates
jest.mock("../utils/emailTemplates", () => ({
  getVerificationEmailTemplate: jest
    .fn()
    .mockReturnValue("<p>Verification Email Template</p>"),
  getPasswordResetEmailTemplate: jest
    .fn()
    .mockReturnValue("<p>Password Reset Template</p>"),
  getWelcomeEmailTemplate: jest
    .fn()
    .mockReturnValue("<p>Welcome Email Template</p>"),
}));

// Mock config
jest.mock("../config/config", () => ({
  NODE_ENV: "test",
  EMAIL_FROM: "test@example.com",
  CLIENT_URL: "http://localhost:3000",
  EMAIL_HOST: "smtp.example.com",
  EMAIL_PORT: "587",
  EMAIL_SECURE: "false",
  EMAIL_USER: "test-user",
  EMAIL_PASSWORD: "test-pass",
}));

describe("EmailService", () => {
  let mockTransporter: MockTransporter;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Get reference to the mock transporter
    mockTransporter =
      nodemailer.createTransport() as unknown as MockTransporter;
  });

  describe("Constructor and Setup", () => {
    it("should initialize with development configuration when NODE_ENV is development", async () => {
      // Override the NODE_ENV for this test
      const originalNodeEnv = config.NODE_ENV;
      (config as Record<string, string>).NODE_ENV = "development";

      // Create a new instance to trigger setup
      new EmailService();

      // Verify that createTestAccount was called
      expect(nodemailer.createTestAccount).toHaveBeenCalled();

      // Reset NODE_ENV
      (config as Record<string, string>).NODE_ENV = originalNodeEnv;
    });

    it("should initialize with production configuration when NODE_ENV is not development", () => {
      // Override the NODE_ENV for this test
      const originalNodeEnv = config.NODE_ENV;
      (config as Record<string, string>).NODE_ENV = "production";

      // Create a new instance to trigger setup
      new EmailService();

      // Verify that createTransport was called with production config
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: config.EMAIL_HOST,
        port: parseInt(config.EMAIL_PORT || "587"),
        secure: false,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASSWORD,
        },
      });

      // Reset NODE_ENV
      (config as Record<string, string>).NODE_ENV = originalNodeEnv;
    });
  });

  describe("Sending Emails", () => {
    it("should send verification email with correct parameters", async () => {
      const to = "test@example.com";
      const name = "Test User";
      const token = "verification-token-123";

      await emailService.sendVerificationEmail(to, name, token);

      // Verify template function was called
      expect(getVerificationEmailTemplate).toHaveBeenCalledWith(
        name,
        `${config.CLIENT_URL}/verify-email?token=${token}`
      );

      // Verify sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: config.EMAIL_FROM,
        to,
        subject: "Verify Your Email Address",
        html: "<p>Verification Email Template</p>",
        text: "",
      });
    });

    it("should send password reset email with correct parameters", async () => {
      const to = "test@example.com";
      const name = "Test User";
      const token = "reset-token-123";

      await emailService.sendPasswordResetEmail(to, name, token);

      // Verify template function was called
      expect(getPasswordResetEmailTemplate).toHaveBeenCalledWith(
        name,
        `${config.CLIENT_URL}/reset-password?token=${token}`
      );

      // Verify sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: config.EMAIL_FROM,
        to,
        subject: "Reset Your Password",
        html: "<p>Password Reset Template</p>",
        text: "",
      });
    });

    it("should send welcome email with correct parameters", async () => {
      const to = "test@example.com";
      const name = "Test User";

      await emailService.sendWelcomeEmail(to, name);

      // Verify template function was called
      expect(getWelcomeEmailTemplate).toHaveBeenCalledWith(name);

      // Verify sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: config.EMAIL_FROM,
        to,
        subject: "Welcome to Our Application!",
        html: "<p>Welcome Email Template</p>",
        text: "",
      });
    });

    it("should handle sendMail failure", async () => {
      // Make sendMail throw an error
      mockTransporter.sendMail.mockRejectedValueOnce(
        new Error("Failed to send email")
      );

      // Sending any email should throw
      await expect(
        emailService.sendWelcomeEmail("test@example.com", "Test User")
      ).rejects.toThrow("Failed to send email");
    });

    it("should log preview URL in development environment", async () => {
      // Override NODE_ENV
      const originalNodeEnv = config.NODE_ENV;
      (config as Record<string, string>).NODE_ENV = "development";

      // Send an email
      await emailService.sendWelcomeEmail("test@example.com", "Test User");

      // Verify getTestMessageUrl was called
      expect(nodemailer.getTestMessageUrl).toHaveBeenCalled();

      // Reset NODE_ENV
      (config as Record<string, string>).NODE_ENV = originalNodeEnv;
    });
  });
});
