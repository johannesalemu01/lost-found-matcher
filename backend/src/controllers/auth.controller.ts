import type { CookieOptions, Request, Response } from "express";
import { staffAuthConfig } from "../config/env";
import { isStaff } from "../middlewares/require-staff";
import { loginStaff } from "../services/auth.service";
import { STAFF_COOKIE, STAFF_SESSION_MS } from "../utils/session";
import { validate } from "../utils/validate";
import { staffLoginSchema } from "../validators/auth.validator";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true, // page scripts can't read it
    sameSite: "lax", // not sent on cross-site POSTs (CSRF)
    secure: staffAuthConfig().secureCookies,
    path: "/api",
  };
}

export function login(req: Request, res: Response) {
  const { passcode } = validate(staffLoginSchema, req.body);
  const token = loginStaff(passcode, req.ip ?? "unknown");
  res.cookie(STAFF_COOKIE, token, { ...cookieOptions(), maxAge: STAFF_SESSION_MS });
  res.json({ role: "staff" });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(STAFF_COOKIE, cookieOptions());
  res.json({ role: "student" });
}

export function me(req: Request, res: Response) {
  res.json({ role: isStaff(req) ? "staff" : "student", staffLoginEnabled: staffAuthConfig().passcode !== null });
}
