import type { NextFunction, Request, Response } from "express";
import { HttpError, notFound } from "../utils/errors";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(notFound());
}

/** Turns every error into the API's JSON error shape. Unknown errors are logged, never leaked. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, fields: err.fields } });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: { message: "Request body is not valid JSON." } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { message: "Something went wrong on our side. Please try again." } });
}
