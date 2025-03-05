// backend/src/config/index.ts
import dotenv from "dotenv";
dotenv.config();
const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_MONGODB_URI ||
        "mongodb://localhost:27017/fullstack-trainer-test"
      : process.env.MONGODB_URI ||
        "mongodb://localhost:27017/fullstack-trainer",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error("JWT_SECRET is not defined");
    })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};

export default config;
