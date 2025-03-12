import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("test-salt"),
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

describe("User Model", () => {
  // Setup connection to test database
  beforeAll(async () => {
    const mongoURI =
      process.env.MONGO_URI_TEST || "mongodb://localhost:27017/auth-test";
    await mongoose.connect(mongoURI);
  });

  // Cleanup after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Cleanup after each test
  afterEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("should create a valid user", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.isEmailVerified).toBe(false);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it("should require email", async () => {
      const userData = {
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require password", async () => {
      const userData = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require firstName", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require lastName", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require firstName with minimum length", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "T", // Too short
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require lastName with minimum length", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "U", // Too short
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should enforce password minimum length", async () => {
      const userData = {
        email: "test@example.com",
        password: "short", // Too short
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should enforce unique email constraint", async () => {
      const userData = {
        email: "unique@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      // Create first user
      await new User(userData).save();

      // Try to create second user with same email
      const duplicateUser = new User(userData);

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash the password before saving", async () => {
      const userData = {
        email: "test@example.com",
        password: "plainTextPassword",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);
      await user.save();

      // Verify bcrypt.hash was called
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, "test-salt");

      // Password should be hashed in the saved document
      expect(user.password).toBe("hashed-password");
    });

    it("should not hash the password if it hasn't been modified", async () => {
      // Create a user first
      const userData = {
        email: "testhash@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);
      await user.save();

      // Clear the mock calls
      (bcrypt.hash as jest.Mock).mockClear();

      // Update a field other than password
      user.firstName = "Updated";
      await user.save();

      // Verify bcrypt.hash was not called again
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should handle errors during password hashing", async () => {
      // Make bcrypt.genSalt throw an error
      (bcrypt.genSalt as jest.Mock).mockRejectedValueOnce(
        new Error("Bcrypt error")
      );

      const userData = {
        email: "testerror@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow("Bcrypt error");
    });

    it("should handle non-Error objects during password hashing", async () => {
      // Make bcrypt.genSalt throw a non-Error object
      (bcrypt.genSalt as jest.Mock).mockRejectedValueOnce("String error");

      const userData = {
        email: "testerror2@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow(
        "An error occurred while hashing the password."
      );
    });
  });

  describe("comparePassword Method", () => {
    it("should return true for correct password", async () => {
      // Setup bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const user = new User({
        email: "test@example.com",
        password: "hashedPassword", // Already "hashed" by our mock
        firstName: "Test",
        lastName: "User",
      });

      const result = await user.comparePassword("correctPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "correctPassword",
        "hashedPassword"
      );
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      // Setup bcrypt.compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const user = new User({
        email: "test@example.com",
        password: "hashedPassword", // Already "hashed" by our mock
        firstName: "Test",
        lastName: "User",
      });

      const result = await user.comparePassword("wrongPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        "hashedPassword"
      );
      expect(result).toBe(false);
    });

    it("should handle errors during password comparison", async () => {
      // Setup bcrypt.compare to throw an error
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(
        new Error("Bcrypt error")
      );

      const user = new User({
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "Test",
        lastName: "User",
      });

      await expect(user.comparePassword("anyPassword")).rejects.toThrow(
        "Bcrypt error"
      );
    });
  });

  describe("toJSON Transform", () => {
    it("should transform document for JSON serialization", async () => {
      const userData = {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
        verificationToken: "vt-123",
        resetPasswordToken: "rpt-123",
      };

      const user = new User(userData);
      await user.save();

      // Convert to plain object (like toJSON would do)
      const userObject = user.toObject();
      const transformedUser = JSON.parse(JSON.stringify(user));

      // Check transformations
      expect(transformedUser.id).toBeDefined();
      expect(transformedUser._id).toBeUndefined();
      expect(transformedUser.__v).toBeUndefined();
      expect(transformedUser.password).toBeUndefined();
      expect(transformedUser.verificationToken).toBeUndefined();
      expect(transformedUser.resetPasswordToken).toBeUndefined();

      // Original object should still have these properties
      expect(userObject._id).toBeDefined();
      expect(userObject.password).toBeDefined();
      expect(userObject.verificationToken).toBeDefined();
      expect(userObject.resetPasswordToken).toBeDefined();
    });
  });
});
