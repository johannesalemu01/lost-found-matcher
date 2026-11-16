import { describe, expect, it } from "vitest";
import { STAFF_SESSION_MS, createStaffToken, verifyStaffToken } from "../../src/utils/session";

const SECRET = "test-secret";
const NOW = Date.UTC(2026, 10, 16, 9, 0);

describe("staff session token", () => {
  it("accepts a token the server signed", () => {
    expect(verifyStaffToken(createStaffToken(SECRET, NOW), SECRET, NOW + 1000)).toBe(true);
  });

  it("rejects a missing, malformed or forged token", () => {
    expect(verifyStaffToken(undefined, SECRET, NOW)).toBe(false);
    expect(verifyStaffToken("staff", SECRET, NOW)).toBe(false);
    expect(verifyStaffToken(createStaffToken("someone-elses-secret", NOW), SECRET, NOW)).toBe(false);

    // Tamper with the payload (e.g. push the expiry out a year) – the signature no longer matches.
    const [, signature] = createStaffToken(SECRET, NOW).split(".");
    const forged = Buffer.from(JSON.stringify({ role: "staff", exp: NOW + 365 * 86400_000 })).toString("base64url");
    expect(verifyStaffToken(`${forged}.${signature}`, SECRET, NOW)).toBe(false);
  });

  it("expires after one working day", () => {
    const token = createStaffToken(SECRET, NOW);
    expect(verifyStaffToken(token, SECRET, NOW + STAFF_SESSION_MS - 1)).toBe(true);
    expect(verifyStaffToken(token, SECRET, NOW + STAFF_SESSION_MS + 1)).toBe(false);
  });
});
