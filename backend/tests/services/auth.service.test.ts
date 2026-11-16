import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MAX_FAILED_ATTEMPTS, loginStaff, resetLoginAttempts } from "../../src/services/auth.service";
import { verifyStaffToken } from "../../src/utils/session";

describe("staff login", () => {
  beforeEach(() => {
    process.env.STAFF_PASSCODE = "correct-horse";
    process.env.SESSION_SECRET = "test-secret";
    resetLoginAttempts();
  });
  afterEach(() => {
    delete process.env.STAFF_PASSCODE;
    delete process.env.SESSION_SECRET;
  });

  it("returns a valid session token for the right passcode", () => {
    const token = loginStaff("correct-horse", "1.2.3.4");
    expect(verifyStaffToken(token, "test-secret")).toBe(true);
  });

  it("rejects a wrong passcode with 401", () => {
    expect(() => loginStaff("guess", "1.2.3.4")).toThrow(expect.objectContaining({ status: 401 }));
  });

  it(`locks a client out after ${MAX_FAILED_ATTEMPTS} wrong attempts, even with the right passcode`, () => {
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      expect(() => loginStaff("guess", "1.2.3.4")).toThrow(expect.objectContaining({ status: 401 }));
    }
    expect(() => loginStaff("correct-horse", "1.2.3.4")).toThrow(expect.objectContaining({ status: 429 }));
    // Other clients are not affected.
    expect(() => loginStaff("correct-horse", "5.6.7.8")).not.toThrow();
  });

  it("is disabled (503) when no passcode is configured", () => {
    delete process.env.STAFF_PASSCODE;
    expect(() => loginStaff("anything", "1.2.3.4")).toThrow(expect.objectContaining({ status: 503 }));
  });
});
