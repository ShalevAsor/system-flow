// backend/src/app.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import middleware from "./middlewares/middleware";

// Routers
import authRouter from "./routers/authRouter";
import profileRouter from "./routers/profileRouter";
// Add other routers here as your application grows

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Fullstack Trainer API is running");
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
// Add other API routes here as your application grows

// Testing routes
if (process.env.NODE_ENV === "test") {
  // Import and use testing routes here
  // Example: app.use("/api/testing", testingRouter);
}

// Error handling middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
