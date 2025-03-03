module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  // Run tests serially in the current process
  maxWorkers: 1,
  // Set a longer timeout for tests since they may need to connect to MongoDB
  testTimeout: 30000,
  // Increase test runner verbosity to help with debugging
  verbose: true,
};
