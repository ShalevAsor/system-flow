// backend/src/app.ts
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { connectDB, closeDBConnection } from "./config/db";
import config from "./config";
import authRouter from "./api/authRouter";

const app: Express = express();
let server: http.Server;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Script-to-UI API is running");
});

// API Routes
app.use("/api/auth", authRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const startServer = async (): Promise<http.Server> => {
  await connectDB();
  server = app.listen(config.PORT, () => {
    console.log(`Server is running on port: ${config.PORT}`);
  });
  return server;
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer().catch((err) => console.error(err));
}

// Function to close the server and database connections
export const closeServer = async (): Promise<void> => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
  await closeDBConnection();
};

export { app, startServer };
