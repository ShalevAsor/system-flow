// backend/src/utils/logger.ts
// Define more specific types for parameters
type LogParams =
  | string
  | number
  | boolean
  | object
  | null
  | undefined
  | Error
  | unknown;

const info = (...params: LogParams[]): void => {
  if (process.env.NODE_ENV !== "test") {
    console.log(...params);
  }
};

const error = (...params: LogParams[]): void => {
  if (process.env.NODE_ENV !== "test") {
    console.error(...params);
  }
};

const logger = {
  info,
  error,
};

export default logger;
