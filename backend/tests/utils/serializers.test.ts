import { describe, expect, it } from "vitest";
import type { ReportRow } from "../../src/interfaces";
import { toPublicReport, toReport } from "../../src/utils/serializers";

const row: ReportRow = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "LOST",
  category: "ELECTRONICS",
  subcategory: "EARBUDS_HEADPHONES",
  title: "AirPods case",
  description: "Black AirPods case",
  colorFamily: "BLACK_DARK",
  brand: "Apple",
  locations: ["CAFETERIA"],
  eventStart: new Date("2026-11-09T09:00:00Z"),
  eventEnd: new Date("2026-11-09T13:00:00Z"),
  privateDetail: "Cat sticker on the back",
  photoFile: "0f8b7c1e-0000-4000-8000-000000000000.png",
  contactName: "Liya",
  contactEmailOrPhone: "liya@example.edu",
  status: "OPEN",
  createdAt: new Date("2026-11-09T14:00:00Z"),
  updatedAt: new Date("2026-11-09T14:00:00Z"),
};

describe("serializers – what leaves the API", () => {
  it("staff output says a photo exists but never exposes the stored file name", () => {
    const staff = toReport(row);
    expect(staff.hasPhoto).toBe(true);
    expect(JSON.stringify(staff)).not.toContain(row.photoFile!);
  });

  it("public output has no private detail, photo, or contact details", () => {
    const pub = toPublicReport(row, new Date("2026-11-10T00:00:00Z"));
    const json = JSON.stringify(pub);
    for (const secret of ["Cat sticker", "liya@example.edu", "Liya", row.photoFile!, "hasPhoto"]) {
      expect(json).not.toContain(secret);
    }
    expect(pub.displayStatus).toBe("OPEN");
  });
});
