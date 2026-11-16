import { describe, expect, it } from "vitest";
import { pairSchema, returnedSchema } from "../../src/validators/match.validator";

describe("match decision validation", () => {
  const ids = { lostId: crypto.randomUUID(), foundId: crypto.randomUUID() };

  it("needs two valid report ids", () => {
    expect(pairSchema.safeParse(ids).success).toBe(true);
    expect(pairSchema.safeParse({ lostId: "abc", foundId: ids.foundId }).success).toBe(false);
  });

  it('"Mark returned" requires the verification tick', () => {
    expect(returnedSchema.safeParse(ids).success).toBe(false);
    expect(returnedSchema.safeParse({ ...ids, verified: false }).success).toBe(false);
    expect(returnedSchema.safeParse({ ...ids, verified: true }).success).toBe(true);
  });
});
