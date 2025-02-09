import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/CustomError";
import { HttpStatus } from "../enums/http.status";

/**
 * Express error handler middleware.
 * Catches and formats all errors thrown in the application.
 *
 * @param err - The error object
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 * @param next - The Express next function
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
