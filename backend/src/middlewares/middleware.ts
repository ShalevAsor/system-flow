// backend/src/utils/middleware.ts
import loggerMiddleware from "../middlewares/loggerMiddleware";
import errorMiddleware from "../middlewares/errorMiddleware";
import {
  tokenExtractor,
  userExtractor,
  protect,
} from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";

// Export all middleware from a single file for easier imports
const middleware = {
  // Logger middleware
  requestLogger: loggerMiddleware.requestLogger,

  // Auth middleware
  tokenExtractor,
  userExtractor,
  protect,

  // Validation middleware
  validate,

  // Error handling middleware
  unknownEndpoint: errorMiddleware.unknownEndpoint,
  errorHandler: errorMiddleware.errorHandler,
};

export default middleware;
