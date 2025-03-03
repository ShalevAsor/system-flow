// backend/src/server.ts
import http from "http";
import app from "./app";
import config from "./config/config";
import { connectDB, closeDBConnection } from "./lib/db";
import logger from "./utils/logger";

let server: http.Server;

/**
 * Start the server and database connection
 */
const startServer = async (): Promise<http.Server> => {
  try {
    await connectDB();
    logger.info("Connected to database");

    server = app.listen(config.PORT, () => {
      logger.info(`Server is running on port: ${config.PORT}`);
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server:", error);
    throw error;
  }
};

/**
 * Close the server and database connections
 */
const closeServer = async (): Promise<void> => {
  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info("Server closed");
          resolve();
        });
      });
    }

    await closeDBConnection();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error during server shutdown:", error);
    throw error;
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer().catch((err) => logger.error("Startup error:", err));
}

export { app, startServer, closeServer };
