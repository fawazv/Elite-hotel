import { Request, Response, NextFunction } from "express";

/**
 * Wrapper function to catch async errors in controllers.
 * Ensures errors are passed to the global error handler.
 *
 * @param fn - The async function to be wrapped
 * @returns Express middleware function
 */
const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncWrapper;
