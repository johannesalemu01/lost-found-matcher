import type { Request, RequestHandler } from "express";
import { forbidden } from "../utils/errors";

export function isStaff(req: Request): boolean {
  return req.header("x-role") === "staff";
}

/**
 * Stand-in for real auth: the UI's Student/Staff toggle sends `x-role: staff`.
 * Good enough to separate the two views in a demo; NOT a security boundary (see README).
 */
export const requireStaff: RequestHandler = (req, _res, next) => {
  if (!isStaff(req)) return next(forbidden("Staff only. Switch to Staff mode in the header."));
  next();
};
