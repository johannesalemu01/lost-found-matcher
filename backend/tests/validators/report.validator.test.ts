import { describe, expect, it } from "vitest";
import { createReportSchema, normalizeContact } from "../../src/validators/report.validator";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const valid = {
  type: "LOST",
  subcategory: "BACKPACK",
  title: "  Black backpack  ",
  description: "With a laptop charger",
  colorFamily: "BLACK_DARK",
  locations: ["MAIN_LIBRARY", "MAIN_LIBRARY"],
  eventStart: hoursAgo(5),
  eventEnd: hoursAgo(2),
  contactName: "Amina",
  contactEmailOrPhone: " Amina@Example.EDU ",
};

function fieldErrors(input: unknown) {
  const r = createReportSchema.safeParse(input);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
}

describe("report validation", () => {
  it("accepts a valid report, trims text and normalises contact + locations", () => {
    const r = createReportSchema.parse(valid);
    expect(r.title).toBe("Black backpack");
    expect(r.contactEmailOrPhone).toBe("amina@example.edu");
    expect(r.locations).toEqual(["MAIN_LIBRARY"]);
  });

  it('"Not sure" replaces specific places', () => {
    expect(createReportSchema.parse({ ...valid, locations: ["GYM", "NOT_SURE"] }).locations).toEqual(["NOT_SURE"]);
  });

  it("FOUND reports are a single moment (end = start)", () => {
    const r = createReportSchema.parse({ ...valid, type: "FOUND" });
    expect(r.eventEnd.getTime()).toBe(r.eventStart.getTime());
  });

  it("rejects short titles, no location, bad contact, unknown subcategory", () => {
    expect(
      fieldErrors({ ...valid, title: "ab", locations: [], contactEmailOrPhone: "abc", subcategory: "SPACESHIP" }),
    ).toMatchObject({
      title: expect.any(String),
      locations: expect.any(String),
      contactEmailOrPhone: expect.any(String),
      subcategory: expect.any(String),
    });
  });

  it("rejects future dates and a window that ends before it starts", () => {
    expect(fieldErrors({ ...valid, eventEnd: new Date(Date.now() + 86400_000).toISOString() })).toHaveProperty("eventEnd");
    expect(fieldErrors({ ...valid, eventStart: hoursAgo(1), eventEnd: hoursAgo(3) })).toEqual({
      eventEnd: "The end must be after the start",
    });
  });

  it("accepts phone numbers in common formats", () => {
    expect(normalizeContact("+251 911-000 111")).toBe("+251911000111");
    expect(createReportSchema.safeParse({ ...valid, contactEmailOrPhone: "0911 000 111" }).success).toBe(true);
  });
});
