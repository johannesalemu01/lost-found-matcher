import { createHash, timingSafeEqual } from "node:crypto";
import { staffAuthConfig } from "../config/env";
import { HttpError } from "../utils/errors";
import { createStaffToken } from "../utils/session";

/** Brute-force protection: at most this many wrong passcodes per client per window. */
export const MAX_FAILED_ATTEMPTS = 5;
export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

/** Compare via fixed-length hashes so timing reveals nothing about the passcode. */
function passcodeMatches(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Check the staff passcode and return a signed session token. */
export function loginStaff(passcode: string, clientKey: string, now = Date.now()): string {
  const { passcode: expected, secret } = staffAuthConfig();
  if (!expected) throw new HttpError(503, "Staff sign-in is not configured. Set STAFF_PASSCODE in backend/.env.");

  const record = failures.get(clientKey);
  if (record && record.resetAt > now && record.count >= MAX_FAILED_ATTEMPTS) {
    const minutes = Math.ceil((record.resetAt - now) / 60000);
    throw new HttpError(429, `Too many wrong attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  if (!passcodeMatches(passcode, expected)) {
    const fresh = !record || record.resetAt <= now;
    failures.set(clientKey, { count: fresh ? 1 : record.count + 1, resetAt: fresh ? now + ATTEMPT_WINDOW_MS : record.resetAt });
    throw new HttpError(401, "Wrong passcode.", { passcode: "Wrong passcode." });
  }

  failures.delete(clientKey);
  return createStaffToken(secret, now);
}

/** For tests. */
export function resetLoginAttempts() {
  failures.clear();
}
