import { HttpStatus } from "../enums/http.status";

/**
 * Custom error class for handling application-specific errors.
 */
class CustomError extends Error {
  public statusCode: number;

  /**
   * Creates a new CustomError instance.
   *
   * @param message - The error message
   * @param statusCode - The HTTP status code (default: 500)
   */
  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
