import type { Request, RequestHandler } from "express";
import { staffAuthConfig } from "../config/env";
import { HttpError } from "../utils/errors";
import { STAFF_COOKIE, readCookie, verifyStaffToken } from "../utils/session";

/** True only with a valid, unexpired, server-signed staff session cookie. */
export function isStaff(req: Request): boolean {
  return verifyStaffToken(readCookie(req, STAFF_COOKIE), staffAuthConfig().secret);
}

/** Guards every staff-only route: private details, contacts, photos and decisions. */
export const requireStaff: RequestHandler = (req, _res, next) => {
  if (!isStaff(req)) return next(new HttpError(401, "Staff sign-in required."));
  next();
};
