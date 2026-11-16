import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

/**
 * Minimal signed session token: base64url(JSON payload) + "." + HMAC-SHA256 signature.
 * It lives in an httpOnly cookie, so page scripts can't read it, and it can't be forged
 * or extended without the server's secret.
 */

export const STAFF_COOKIE = "lf_staff";
export const STAFF_SESSION_MS = 8 * 60 * 60 * 1000; // one working day

interface Payload {
  role: "staff";
  exp: number;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createStaffToken(secret: string, now = Date.now()): string {
  const payload: Payload = { role: "staff", exp: now + STAFF_SESSION_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifyStaffToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
    return payload.role === "staff" && typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

/** Read one cookie without pulling in cookie-parser. */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}
