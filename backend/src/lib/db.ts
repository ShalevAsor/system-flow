// backend/src/config/db.ts
import mongoose from "mongoose";
import config from "../config/config";

export const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
};

export const closeDBConnection = async (): Promise<void> => {
  await mongoose.connection.close();
};
