// backend/src/index.ts
import { startServer } from "./server";
import logger from "./utils/logger";

/**
 * Main entry point for the application
 */
const start = async (): Promise<void> => {
  try {
    await startServer();
  } catch (error) {
    logger.error("Application failed to start:", error);
    process.exit(1);
  }
};

// Start the application
start();
