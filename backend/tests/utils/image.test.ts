import { describe, expect, it } from "vitest";
import { detectImageType, mimeForFile } from "../../src/utils/image";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.from([0, 0, 0, 0]), Buffer.from("WEBP")]);

describe("photo type detection (by file signature, not by name)", () => {
  it("recognises JPEG, PNG and WebP", () => {
    expect(detectImageType(jpeg)).toBe("image/jpeg");
    expect(detectImageType(png)).toBe("image/png");
    expect(detectImageType(webp)).toBe("image/webp");
  });

  it("rejects anything else, even if it claims to be an image", () => {
    expect(detectImageType(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageType(Buffer.from("%PDF-1.7"))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });

  it("maps our stored file names back to a content type", () => {
    expect(mimeForFile("0f8b7c1e-0000-4000-8000-000000000000.webp")).toBe("image/webp");
    expect(mimeForFile("notes.txt")).toBeNull();
  });
});
