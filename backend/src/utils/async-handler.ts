import type { Request, RequestHandler, Response } from "express";

/** Lets controllers be async functions; rejected promises go to the error handler. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };
